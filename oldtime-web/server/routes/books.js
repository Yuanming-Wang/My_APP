import { Router } from 'express'
import db from '../db.js'
import { v4 as uuid } from 'uuid'
import { validateBook, validatePagination } from '../middleware/validate.js'

const router = Router()

// GET /api/books — 获取书籍列表
router.get('/', validatePagination, (req, res) => {
  try {
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    const offset = (page - 1) * limit
    const { owner, sort = 'created_at', order = 'desc' } = req.query

    let query = 'SELECT * FROM books'
    let countQuery = 'SELECT COUNT(*) as total FROM books'
    const params = []
    const conditions = []

    if (owner) {
      conditions.push('owner_name LIKE ?')
      params.push(`%${owner}%`)
    }

    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(' AND ')}`
      query += whereClause
      countQuery += whereClause
    }

    const allowedSorts = ['created_at', 'title', 'owner_name']
    const sortField = allowedSorts.includes(sort) ? sort : 'created_at'
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC'
    query += ` ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`

    const books = db.prepare(query).all(...params, limit, offset)
    const { total } = db.prepare(countQuery).get(...params)

    const pageStmt = db.prepare('SELECT * FROM pages WHERE book_id = ? ORDER BY page_index')
    const result = books.map((book) => ({ ...book, pages: pageStmt.all(book.id) }))

    res.set('X-Total-Count', total.toString())
    res.set('X-Page-Count', Math.ceil(total / limit).toString())

    res.json({
      success: true,
      data: result,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    })
  } catch (err) {
    res.status(500).json({ success: false, error: '获取书籍列表失败', message: err.message })
  }
})

// GET /api/books/slug/:slug
router.get('/slug/:slug', (req, res) => {
  try {
    const book = db.prepare('SELECT * FROM books WHERE share_slug = ?').get(req.params.slug)
    if (!book) return res.status(404).json({ success: false, error: '书籍不存在或链接已失效' })
    const pages = db.prepare('SELECT * FROM pages WHERE book_id = ? ORDER BY page_index').all(book.id)
    res.json({ success: true, data: { ...book, pages } })
  } catch (err) {
    res.status(500).json({ success: false, error: '获取书籍失败', message: err.message })
  }
})

// GET /api/books/:id
router.get('/:id', (req, res) => {
  try {
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id)
    if (!book) return res.status(404).json({ success: false, error: '书籍不存在' })
    const pages = db.prepare('SELECT * FROM pages WHERE book_id = ? ORDER BY page_index').all(book.id)
    res.json({ success: true, data: { ...book, pages } })
  } catch (err) {
    res.status(500).json({ success: false, error: '获取书籍失败', message: err.message })
  }
})

// POST /api/books
router.post('/', validateBook, (req, res) => {
  try {
    const { title, subtitle, theme, coverImageUrl, archiveNo, ownerName, certificateText, shareSlug, pages } = req.body

    const existing = db.prepare('SELECT id FROM books WHERE archive_no = ?').get(archiveNo)
    if (existing) return res.status(409).json({ success: false, error: '藏品编号已存在' })

    const bookId = uuid()
    const insertBook = db.prepare('INSERT INTO books (id, title, subtitle, theme, cover_image_url, archive_no, owner_name, certificate_text, share_slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    const insertPage = db.prepare('INSERT INTO pages (id, book_id, page_index, image_url, raw_story, chapter_title, polished_story) VALUES (?, ?, ?, ?, ?, ?, ?)')

    db.transaction(() => {
      insertBook.run(bookId, title.trim(), subtitle?.trim() || '', theme || 'years_gold', coverImageUrl || '', archiveNo, ownerName.trim(), certificateText?.trim() || '', shareSlug || archiveNo.toLowerCase())
      if (pages && Array.isArray(pages)) {
        for (const page of pages) {
          insertPage.run(uuid(), bookId, page.pageIndex, page.imageUrl, page.rawStory?.trim() || '', page.chapterTitle?.trim() || '', page.polishedStory?.trim() || '')
        }
      }
    })()

    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId)
    const bookPages = db.prepare('SELECT * FROM pages WHERE book_id = ? ORDER BY page_index').all(bookId)
    res.status(201).json({ success: true, data: { ...book, pages: bookPages } })
  } catch (err) {
    res.status(500).json({ success: false, error: '创建书籍失败', message: err.message })
  }
})

// PATCH /api/books/:id
router.patch('/:id', (req, res) => {
  try {
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id)
    if (!book) return res.status(404).json({ success: false, error: '书籍不存在' })

    const allowedFields = ['title', 'subtitle', 'theme', 'cover_image_url', 'certificate_text']
    const updates = []
    const values = []

    for (const field of allowedFields) {
      const camelField = field.replace(/_([a-z])/g, (_, l) => l.toUpperCase())
      if (req.body[camelField] !== undefined) {
        updates.push(`${field} = ?`)
        values.push(req.body[camelField])
      }
    }

    if (updates.length === 0) return res.status(400).json({ success: false, error: '没有可更新的字段' })

    values.push(req.params.id)
    db.prepare(`UPDATE books SET ${updates.join(', ')} WHERE id = ?`).run(...values)

    const updated = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id)
    const pages = db.prepare('SELECT * FROM pages WHERE book_id = ? ORDER BY page_index').all(updated.id)
    res.json({ success: true, data: { ...updated, pages } })
  } catch (err) {
    res.status(500).json({ success: false, error: '更新书籍失败', message: err.message })
  }
})

// DELETE /api/books/:id
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id)
    if (result.changes === 0) return res.status(404).json({ success: false, error: '书籍不存在' })
    res.json({ success: true, message: '书籍已删除' })
  } catch (err) {
    res.status(500).json({ success: false, error: '删除书籍失败', message: err.message })
  }
})

export default router
