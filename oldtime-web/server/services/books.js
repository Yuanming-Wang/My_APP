import { randomBytes } from 'crypto'
import { v4 as uuid } from 'uuid'
import { HttpError } from '../lib/http-error.js'
import { attachAssetsToBook, deleteAssetsForBook } from './assets.js'

const ALLOWED_SORTS = ['created_at', 'title', 'owner_name']

export function createShareToken() {
  return randomBytes(12).toString('base64url')
}

export function createArchiveNo(db) {
  const year = new Date().getFullYear()
  const prefix = `OT-${year}-`
  const rows = db.prepare('SELECT archive_no FROM books WHERE archive_no LIKE ?').all(`${prefix}%`)
  const max = rows.reduce((value, row) => {
    const serial = Number.parseInt(row.archive_no.slice(prefix.length), 10)
    return Number.isFinite(serial) ? Math.max(value, serial) : value
  }, 0)
  return `${prefix}${String(max + 1).padStart(3, '0')}`
}

function pagesForBook(db, bookId) {
  return db.prepare('SELECT * FROM pages WHERE book_id = ? ORDER BY page_index').all(bookId)
}

export function claimLegacyBooks(db, ownerId) {
  return db.transaction(() => {
    db.prepare('INSERT OR IGNORE INTO users (id, name) VALUES (?, ?)').run(ownerId, '旧时光用户')
    return db.prepare('UPDATE books SET owner_id = ? WHERE owner_id IS NULL AND deleted_at IS NULL').run(ownerId).changes
  })()
}

export function listBooks(db, ownerId, pagination, query) {
  const { page, limit } = pagination
  const offset = (page - 1) * limit
  const conditions = ['(owner_id = ? OR owner_id IS NULL)', 'deleted_at IS NULL']
  const params = [ownerId]

  if (query.owner) {
    conditions.push('owner_name LIKE ?')
    params.push(`%${query.owner}%`)
  }

  const sortField = ALLOWED_SORTS.includes(query.sort) ? query.sort : 'created_at'
  const sortOrder = query.order === 'asc' ? 'ASC' : 'DESC'
  const where = ` WHERE ${conditions.join(' AND ')}`
  const total = db.prepare(`SELECT COUNT(*) as total FROM books${where}`).get(...params).total
  const books = db.prepare(`SELECT * FROM books${where} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`).all(...params, limit, offset)
  const pageStmt = db.prepare('SELECT * FROM pages WHERE book_id = ? ORDER BY page_index')

  return {
    books: books.map((book) => ({ ...book, pages: pageStmt.all(book.id) })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  }
}

export function getBook(db, id, ownerId) {
  const book = db.prepare('SELECT * FROM books WHERE id = ? AND (owner_id = ? OR owner_id IS NULL) AND deleted_at IS NULL').get(id, ownerId)
  if (!book) return null
  return { ...book, pages: pagesForBook(db, book.id) }
}

export function getBookByShare(db, slug) {
  const book = db.prepare('SELECT * FROM books WHERE (share_slug = ? OR share_token = ?) AND deleted_at IS NULL LIMIT 1').get(slug, slug)
  if (!book) return null
  return { ...book, pages: pagesForBook(db, book.id) }
}

export function createBook(db, ownerId, input) {
  const pages = Array.isArray(input.pages) ? input.pages : []
  const title = String(input.title || '').trim()
  const ownerName = String(input.ownerName || '').trim()

  if (!title || !ownerName) {
    throw new HttpError(400, 'title 和 ownerName 是必填字段')
  }

  const bookId = uuid()
  const archiveNo = createArchiveNo(db)
  const shareToken = createShareToken()
  const coverImage = input.coverImageUrl || pages[0]?.imageUrl || ''
  const insertBook = db.prepare(`
    INSERT INTO books (id, owner_id, title, subtitle, theme, cover_image_url, archive_no, owner_name, certificate_text, share_slug, share_token)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const insertPage = db.prepare(`
    INSERT INTO pages (id, book_id, page_index, image_url, media_type, thumbnail_url, audio_url, raw_story, chapter_title, polished_story)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  db.transaction(() => {
    if (ownerId) {
      db.prepare('INSERT OR IGNORE INTO users (id, name) VALUES (?, ?)').run(ownerId, ownerName)
    }
    insertBook.run(
      bookId,
      ownerId || null,
      title,
      String(input.subtitle || '').trim(),
      input.theme || 'years_gold',
      coverImage,
      archiveNo,
      ownerName,
      String(input.certificateText || '').trim(),
      shareToken,
      shareToken
    )
    pages.forEach((page, index) => {
      insertPage.run(
        uuid(),
        bookId,
        Number.isFinite(Number(page.pageIndex)) ? Number(page.pageIndex) : index + 1,
        page.imageUrl,
        page.mediaType || 'image',
        page.thumbnailUrl || '',
        page.audioUrl || '',
        String(page.rawStory || '').trim(),
        String(page.chapterTitle || '').trim(),
        String(page.polishedStory || '').trim()
      )
    })
  })()

  attachAssetsToBook(db, bookId, [
    coverImage,
    ...pages.flatMap((page) => [page.imageUrl, page.thumbnailUrl, page.audioUrl]),
  ])

  return getBook(db, bookId, ownerId)
}

export function updateBook(db, id, ownerId, input) {
  const book = db.prepare('SELECT * FROM books WHERE id = ? AND (owner_id = ? OR owner_id IS NULL) AND deleted_at IS NULL').get(id, ownerId)
  if (!book) throw new HttpError(404, '书籍不存在')

  const allowedFields = ['title', 'subtitle', 'theme', 'cover_image_url', 'certificate_text']
  const updates = []
  const values = []

  for (const field of allowedFields) {
    const camelField = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    if (input[camelField] !== undefined) {
      updates.push(`${field} = ?`)
      values.push(input[camelField])
    }
  }

  if (updates.length === 0) throw new HttpError(400, '没有可更新的字段')

  values.push(id)
  db.prepare(`UPDATE books SET ${updates.join(', ')} WHERE id = ?`).run(...values)
  return getBook(db, id, ownerId)
}

export function deleteBook(db, id, ownerId) {
  const book = db.prepare('SELECT * FROM books WHERE id = ? AND (owner_id = ? OR owner_id IS NULL) AND deleted_at IS NULL').get(id, ownerId)
  if (!book) throw new HttpError(404, '书籍不存在')

  db.prepare("UPDATE books SET deleted_at = datetime('now') WHERE id = ?").run(book.id)
  return { book }
}

export function purgeDeletedBooks(db, { olderThanDays = 30 } = {}) {
  const books = db.prepare(
    "SELECT * FROM books WHERE deleted_at IS NOT NULL AND deleted_at < datetime('now', ?)"
  ).all(`-${olderThanDays} days`)

  const assets = []
  const purge = db.transaction(() => {
    for (const book of books) {
      assets.push(...deleteAssetsForBook(db, book.id))
      db.prepare('DELETE FROM books WHERE id = ?').run(book.id)
    }
  })
  purge()

  return { books, assets }
}
