import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import sharp from 'sharp'

const tempDir = mkdtempSync(join(tmpdir(), 'oldtime-api-'))
process.env.OLD_TIME_DB_PATH = join(tempDir, 'test.db')
process.env.OLD_TIME_UPLOADS_DIR = join(tempDir, 'uploads')

const { createApp } = await import('../app.js')
const db = (await import('../db.js')).default
const { cleanupOrphanAssets, deleteAssetFiles } = await import('../services/assets.js')
const { purgeDeletedBooks } = await import('../services/books.js')

const PNG = await sharp({
  create: { width: 2, height: 2, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
}).png().toBuffer()

let server
let base

before(async () => {
  await new Promise((resolve) => {
    server = createApp().listen(0, '127.0.0.1', () => {
      base = `http://127.0.0.1:${server.address().port}`
      resolve()
    })
  })
})

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve))
  db.close()
  rmSync(tempDir, { recursive: true, force: true })
})

async function request(path, { owner, method = 'GET', body, form } = {}) {
  const headers = {}
  if (owner) headers['x-owner-id'] = owner

  let payload
  if (form) {
    payload = form
  } else if (body !== undefined) {
    headers['content-type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  const res = await fetch(`${base}${path}`, { method, headers, body: payload })
  const json = await res.json().catch(() => null)
  return { res, json }
}

async function uploadImage(owner) {
  const form = new FormData()
  form.append('image', new Blob([PNG], { type: 'image/png' }), 'pixel.png')
  const result = await request('/api/upload', { method: 'POST', owner, form })
  assert.equal(result.res.status, 200)
  return result.json.data
}

async function createBook(owner, overrides = {}) {
  const result = await request('/api/books', {
    method: 'POST',
    owner,
    body: {
      title: '测试纪念册',
      ownerName: '王奶奶',
      pages: [{ pageIndex: 1, imageUrl: '/uploads/missing.jpg', rawStory: '这是一段测试故事' }],
      ...overrides,
    },
  })
  assert.equal(result.res.status, 201)
  return result.json.data
}

test('health and migration version', async () => {
  const result = await request('/api/health')
  assert.equal(result.res.status, 200)
  assert.equal(result.json.status, 'ok')
  assert.equal(db.pragma('user_version', { simple: true }), 4)
})

test('invalid payloads are rejected with details', async () => {
  const owner = randomUUID()

  const book = await request('/api/books', { method: 'POST', owner, body: { ownerName: '王奶奶' } })
  assert.equal(book.res.status, 400)
  assert.equal(book.json.success, false)
  assert.ok(book.json.details.some((item) => item.includes('title')))

  const draft = await request('/api/drafts', {
    method: 'POST',
    owner,
    body: { ownerName: '王奶奶', photos: [] },
  })
  assert.equal(draft.res.status, 400)
  assert.ok(draft.json.details.some((item) => item.includes('photos')))

  const story = await request('/api/drafts/not-exist/photos/not-exist', {
    method: 'PUT',
    owner,
    body: { story: 123 },
  })
  assert.equal(story.res.status, 400)

  const list = await request('/api/books?page=abc&limit=999', { owner })
  assert.equal(list.res.status, 200)
  assert.equal(list.json.pagination.page, 1)
  assert.equal(list.json.pagination.limit, 50)
})

test('books are isolated by owner and share uses a random token', async () => {
  const ownerA = randomUUID()
  const ownerB = randomUUID()
  const book = await createBook(ownerA)

  assert.match(book.share_slug, /^[A-Za-z0-9_-]{16}$/)
  assert.equal(book.share_token, book.share_slug)
  assert.notEqual(book.share_slug, book.archive_no.toLowerCase())

  const listA = await request('/api/books', { owner: ownerA })
  const listB = await request('/api/books', { owner: ownerB })
  assert.ok(listA.json.data.some((item) => item.id === book.id))
  assert.ok(!listB.json.data.some((item) => item.id === book.id))

  const getB = await request(`/api/books/${book.id}`, { owner: ownerB })
  assert.equal(getB.res.status, 404)

  const deleteB = await request(`/api/books/${book.id}`, { method: 'DELETE', owner: ownerB })
  assert.equal(deleteB.res.status, 404)

  const shared = await request(`/api/books/slug/${book.share_slug}`)
  assert.equal(shared.res.status, 200)
  assert.equal(shared.json.data.id, book.id)

  const deleteA = await request(`/api/books/${book.id}`, { method: 'DELETE', owner: ownerA })
  assert.equal(deleteA.res.status, 200)
})

test('legacy books can be claimed by an owner', async () => {
  const owner = randomUUID()
  const legacyId = randomUUID()
  const shareSlug = randomUUID()

  db.prepare('INSERT INTO books (id, title, archive_no, owner_name, share_slug) VALUES (?, ?, ?, ?, ?)').run(
    legacyId,
    '旧书',
    `OT-LEGACY-${legacyId.slice(0, 8)}`,
    '旧用户',
    shareSlug
  )

  const claimed = await request('/api/books/claim-legacy', { method: 'POST', owner })
  assert.equal(claimed.res.status, 200)
  assert.ok(claimed.json.claimed >= 1)

  const list = await request('/api/books', { owner })
  assert.ok(list.json.data.some((item) => item.id === legacyId))

  const other = await request('/api/books', { owner: randomUUID() })
  assert.ok(!other.json.data.some((item) => item.id === legacyId))

  const deleted = await request(`/api/books/${legacyId}`, { method: 'DELETE', owner })
  assert.equal(deleted.res.status, 200)
})

test('audio upload registers an asset', async () => {
  const owner = randomUUID()
  const form = new FormData()
  form.append('audio', new Blob([Buffer.from('test-audio')], { type: 'audio/webm' }), 'test.webm')

  const result = await request('/api/upload/audio', { method: 'POST', owner, form })
  assert.equal(result.res.status, 200)
  assert.ok(result.json.data.id)

  const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(result.json.data.id)
  assert.equal(asset.kind, 'audio')
  assert.equal(asset.owner_id, owner)
})

test('deleting a book hides it until purge removes asset rows and files', async () => {
  const owner = randomUUID()
  const asset = await uploadImage(owner)
  const filePath = join(process.env.OLD_TIME_UPLOADS_DIR, basename(asset.url))
  const thumbPath = join(process.env.OLD_TIME_UPLOADS_DIR, 'thumbs', basename(asset.thumbnail))

  assert.ok(existsSync(filePath))
  assert.ok(existsSync(thumbPath))

  const book = await createBook(owner, {
    coverImageUrl: asset.url,
    pages: [{ pageIndex: 1, imageUrl: asset.url, thumbnailUrl: asset.thumbnail }],
  })

  const attached = db.prepare('SELECT * FROM assets WHERE id = ?').get(asset.id)
  assert.equal(attached.book_id, book.id)

  const deleted = await request(`/api/books/${book.id}`, { method: 'DELETE', owner })
  assert.equal(deleted.res.status, 200)

  const list = await request('/api/books', { owner })
  assert.ok(!list.json.data.some((item) => item.id === book.id))
  const detail = await request(`/api/books/${book.id}`, { owner })
  assert.equal(detail.res.status, 404)
  const shared = await request(`/api/books/slug/${book.share_slug}`)
  assert.equal(shared.res.status, 404)
  assert.equal(db.prepare('SELECT COUNT(*) as count FROM assets WHERE id = ?').get(asset.id).count, 1)
  assert.ok(existsSync(filePath))
  assert.ok(existsSync(thumbPath))

  db.prepare("UPDATE books SET deleted_at = datetime('now', '-1 day') WHERE id = ?").run(book.id)
  const purged = purgeDeletedBooks(db, { olderThanDays: 0 })
  assert.ok(purged.books.some((item) => item.id === book.id))
  assert.ok(purged.assets.some((item) => item.id === asset.id))
  deleteAssetFiles(purged.assets)

  assert.equal(db.prepare('SELECT COUNT(*) as count FROM assets WHERE id = ?').get(asset.id).count, 0)
  assert.equal(existsSync(filePath), false)
  assert.equal(existsSync(thumbPath), false)
})

test('orphan asset cleanup removes only old unbound assets', async () => {
  const owner = randomUUID()
  const orphanId = randomUUID()
  const orphanUrl = `/uploads/orphan-${orphanId}.jpg`

  db.prepare("INSERT INTO assets (id, kind, url, created_at) VALUES (?, 'image', ?, datetime('now', '-8 days'))").run(
    orphanId,
    orphanUrl
  )

  const asset = await uploadImage(owner)
  const book = await createBook(owner, {
    coverImageUrl: asset.url,
    pages: [{ pageIndex: 1, imageUrl: asset.url }],
  })
  db.prepare("UPDATE assets SET created_at = datetime('now', '-8 days') WHERE id = ?").run(asset.id)

  const removed = cleanupOrphanAssets(db, { olderThanDays: 7 })
  assert.ok(removed.some((item) => item.id === orphanId))
  assert.ok(!removed.some((item) => item.id === asset.id))
  assert.equal(db.prepare('SELECT COUNT(*) as count FROM assets WHERE id = ?').get(orphanId).count, 0)
  assert.equal(db.prepare('SELECT COUNT(*) as count FROM assets WHERE id = ?').get(asset.id).count, 1)

  const deleted = await request(`/api/books/${book.id}`, { method: 'DELETE', owner })
  assert.equal(deleted.res.status, 200)
})

test('expired drafts cannot be viewed or edited', async () => {
  const owner = randomUUID()
  const asset = await uploadImage(owner)
  const created = await request('/api/drafts', {
    method: 'POST',
    owner,
    body: { ownerName: '王奶奶', photos: [{ imageUrl: asset.url, story: '测试' }] },
  })
  assert.equal(created.res.status, 201)

  const draft = created.json.data
  db.prepare("UPDATE drafts SET expires_at = datetime('now', '-1 day') WHERE id = ?").run(draft.id)

  const viewed = await request(`/api/drafts/${draft.id}`, { owner })
  assert.equal(viewed.res.status, 410)

  const edited = await request(`/api/drafts/${draft.id}/photos/${draft.photos[0].id}`, {
    method: 'PUT',
    owner,
    body: { story: '不应该写入' },
  })
  assert.equal(edited.res.status, 410)

  const deleted = await request(`/api/drafts/${draft.id}`, { method: 'DELETE', owner })
  assert.equal(deleted.res.status, 200)
})

test('openapi contract is served', async () => {
  const result = await request('/api/openapi.json')
  assert.equal(result.res.status, 200)
  assert.equal(result.json.openapi, '3.1.0')
  assert.ok(result.json.paths['/books'])
  assert.ok(result.json.paths['/drafts/{id}/complete'])
})

test('draft completes into a book and keeps attached assets', async () => {
  const owner = randomUUID()
  const asset = await uploadImage(owner)
  const filePath = join(process.env.OLD_TIME_UPLOADS_DIR, basename(asset.url))

  const created = await request('/api/drafts', {
    method: 'POST',
    owner,
    body: {
      ownerName: '王奶奶',
      photos: [{ imageUrl: asset.url, story: '这张照片是孩子小时候。' }],
    },
  })
  assert.equal(created.res.status, 201)

  const draft = created.json.data
  const completed = await request(`/api/drafts/${draft.id}/complete`, { method: 'POST', owner })
  assert.equal(completed.res.status, 200)
  assert.match(completed.json.data.share_slug, /^[A-Za-z0-9_-]{16}$/)
  assert.equal(completed.json.data.pages.length, 1)

  const completedAgain = await request(`/api/drafts/${draft.id}/complete`, { method: 'POST', owner })
  assert.equal(completedAgain.res.status, 409)

  const deleted = await request(`/api/drafts/${draft.id}`, { method: 'DELETE', owner })
  assert.equal(deleted.res.status, 200)
  assert.ok(existsSync(filePath))

  const bookId = completed.json.data.id
  const deleteBook = await request(`/api/books/${bookId}`, { method: 'DELETE', owner })
  assert.equal(deleteBook.res.status, 200)
  assert.ok(existsSync(filePath))

  db.prepare("UPDATE books SET deleted_at = datetime('now', '-1 day') WHERE id = ?").run(bookId)
  const purged = purgeDeletedBooks(db, { olderThanDays: 0 })
  deleteAssetFiles(purged.assets)
  assert.equal(existsSync(filePath), false)
})
