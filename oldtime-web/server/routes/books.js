import { Router } from 'express'
import db from '../db.js'
import { validateBook, validatePagination } from '../middleware/validate.js'
import {
  claimLegacyBooks,
  createBook,
  deleteBook,
  getBook,
  getBookByShare,
  listBooks,
  updateBook,
} from '../services/books.js'

const router = Router()

router.get('/', validatePagination, (req, res) => {
  const result = listBooks(db, req.ownerId, req.pagination, req.query)
  res.set('X-Total-Count', result.pagination.total.toString())
  res.set('X-Page-Count', result.pagination.totalPages.toString())
  res.json({ success: true, data: result.books, pagination: result.pagination })
})

router.get('/slug/:slug', (req, res) => {
  const book = getBookByShare(db, req.params.slug)
  if (!book) return res.status(404).json({ success: false, error: '书籍不存在或链接已失效' })
  res.json({ success: true, data: book })
})

router.post('/claim-legacy', (req, res) => {
  const claimed = claimLegacyBooks(db, req.ownerId)
  res.json({ success: true, claimed })
})

router.get('/:id', (req, res) => {
  const book = getBook(db, req.params.id, req.ownerId)
  if (!book) return res.status(404).json({ success: false, error: '书籍不存在' })
  res.json({ success: true, data: book })
})

router.post('/', validateBook, (req, res) => {
  const book = createBook(db, req.ownerId, req.body)
  res.status(201).json({ success: true, data: book })
})

router.patch('/:id', (req, res) => {
  const book = updateBook(db, req.params.id, req.ownerId, req.body)
  res.json({ success: true, data: book })
})

router.delete('/:id', (req, res) => {
  deleteBook(db, req.params.id, req.ownerId)
  res.json({ success: true, message: '书籍已移入回收站' })
})

export default router
