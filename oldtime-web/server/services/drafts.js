import { v4 as uuid } from 'uuid'
import { HttpError } from '../lib/http-error.js'
import { createBook } from './books.js'
import { deleteUnboundAssetsByUrls } from './assets.js'

const CHAPTERS = ['第一章', '第二章', '第三章', '第四章', '第五章', '第六章']

function draftPhotos(db, draftId) {
  return db.prepare('SELECT * FROM draft_photos WHERE draft_id = ? ORDER BY photo_index').all(draftId)
}

function findDraft(db, id) {
  return db.prepare('SELECT * FROM drafts WHERE id = ?').get(id)
}

function isExpired(draft) {
  if (!draft.expires_at || draft.status !== 'pending') return false
  const timestamp = Date.parse(`${draft.expires_at.replace(' ', 'T')}Z`)
  return Number.isFinite(timestamp) && timestamp <= Date.now()
}

function expireDraft(db, draft) {
  db.prepare("UPDATE drafts SET status = 'expired', updated_at = datetime('now') WHERE id = ?").run(draft.id)
  return { ...draft, status: 'expired' }
}

function usableDraft(db, id) {
  const draft = findDraft(db, id)
  if (!draft) throw new HttpError(404, '草稿不存在或已过期')
  if (draft.status === 'expired') throw new HttpError(410, '草稿已过期')
  if (isExpired(draft)) {
    expireDraft(db, draft)
    throw new HttpError(410, '草稿已过期')
  }
  if (draft.status !== 'pending') throw new HttpError(409, '草稿已完成')
  return draft
}

export function createDraft(db, ownerId, input) {
  const ownerName = String(input.ownerName || '').trim()
  const photos = Array.isArray(input.photos) ? input.photos : []

  if (!ownerName || photos.length === 0) {
    throw new HttpError(400, '缺少必要参数')
  }

  const draftId = uuid()
  const insertPhoto = db.prepare('INSERT INTO draft_photos (id, draft_id, photo_index, image_url, story) VALUES (?, ?, ?, ?, ?)')

  db.transaction(() => {
    db.prepare("INSERT INTO drafts (id, owner_name, owner_id, expires_at) VALUES (?, ?, ?, datetime('now', '+7 days'))").run(
      draftId,
      ownerName,
      ownerId || null
    )
    photos.forEach((photo, index) => {
      insertPhoto.run(uuid(), draftId, index, photo.imageUrl, photo.story || '')
    })
  })()

  return getDraft(db, draftId)
}

export function getDraft(db, id) {
  const draft = findDraft(db, id)
  if (!draft) return null
  if (isExpired(draft)) {
    expireDraft(db, draft)
    throw new HttpError(410, '草稿已过期')
  }
  return { ...draft, photos: draftPhotos(db, draft.id) }
}

export function updateDraftPhoto(db, draftId, photoId, story) {
  const draft = usableDraft(db, draftId)
  if (draft.status !== 'pending') throw new HttpError(409, '草稿已完成，不能再修改')

  const photo = db.prepare('SELECT * FROM draft_photos WHERE id = ? AND draft_id = ?').get(photoId, draftId)
  if (!photo) throw new HttpError(404, '照片不存在')

  db.prepare('UPDATE draft_photos SET story = ? WHERE id = ?').run(story || '', photoId)
  db.prepare("UPDATE drafts SET updated_at = datetime('now') WHERE id = ?").run(draftId)

  return db.prepare('SELECT * FROM draft_photos WHERE id = ?').get(photoId)
}

export function completeDraft(db, draftId) {
  const draft = usableDraft(db, draftId)
  if (draft.status === 'completed') throw new HttpError(409, '草稿已完成')
  if (draft.status !== 'pending') throw new HttpError(409, '草稿状态不允许完成')

  const photos = draftPhotos(db, draft.id)
  if (photos.length === 0) throw new HttpError(400, '草稿中没有照片')

  const pages = photos.map((photo, index) => {
    const story = photo.story || `这张照片留下了第 ${index + 1} 段旧时光。`
    return {
      pageIndex: index + 1,
      imageUrl: photo.image_url,
      mediaType: 'image',
      rawStory: story,
      chapterTitle: `${CHAPTERS[index] || `第${index + 1}章`} · 这一刻`,
      polishedStory: `${story} 这一天的笑声和心情，都被好好珍藏了下来。`,
    }
  })

  const book = createBook(db, draft.owner_id, {
    title: '值得珍藏的一天',
    subtitle: '把那些值得想起的日子，珍藏成一本书',
    theme: 'years_gold',
    coverImageUrl: photos[0].image_url,
    ownerName: draft.owner_name,
    certificateText: `这本纪念册记录了${draft.owner_name}的一段珍贵旧时光。愿每一次翻阅，都能想起那天的温暖。`,
    pages,
  })

  db.prepare("UPDATE drafts SET status = 'completed', book_id = ?, updated_at = datetime('now') WHERE id = ?").run(book.id, draft.id)
  return book
}

export function deleteDraft(db, draftId) {
  const draft = findDraft(db, draftId)
  if (!draft) throw new HttpError(404, '草稿不存在')

  const photos = draftPhotos(db, draft.id)
  const urls = photos.map((photo) => photo.image_url)
  db.prepare('DELETE FROM drafts WHERE id = ?').run(draft.id)
  return deleteUnboundAssetsByUrls(db, urls)
}
