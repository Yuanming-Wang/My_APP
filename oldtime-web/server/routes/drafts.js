import { Router } from 'express'
import db from '../db.js'
import { v4 as uuid } from 'uuid'

const router = Router()

// POST /api/drafts — 创建协作草稿
router.post('/', (req, res) => {
  try {
    const { ownerName, photos } = req.body

    if (!ownerName || !photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ success: false, error: '缺少必要参数' })
    }

    const draftId = uuid()

    db.transaction(() => {
      db.prepare('INSERT INTO drafts (id, owner_name) VALUES (?, ?)').run(draftId, ownerName)

      const insertPhoto = db.prepare('INSERT INTO draft_photos (id, draft_id, photo_index, image_url, story) VALUES (?, ?, ?, ?, ?)')
      photos.forEach((photo, index) => {
        insertPhoto.run(uuid(), draftId, index, photo.imageUrl, photo.story || '')
      })
    })()

    const draft = db.prepare('SELECT * FROM drafts WHERE id = ?').get(draftId)
    const draftPhotos = db.prepare('SELECT * FROM draft_photos WHERE draft_id = ? ORDER BY photo_index').all(draftId)

    res.status(201).json({ success: true, data: { ...draft, photos: draftPhotos } })
  } catch (err) {
    res.status(500).json({ success: false, error: '创建草稿失败', message: err.message })
  }
})

// GET /api/drafts/:id — 获取协作草稿
router.get('/:id', (req, res) => {
  try {
    const draft = db.prepare('SELECT * FROM drafts WHERE id = ?').get(req.params.id)
    if (!draft) {
      return res.status(404).json({ success: false, error: '草稿不存在或已过期' })
    }

    const photos = db.prepare('SELECT * FROM draft_photos WHERE draft_id = ? ORDER BY photo_index').all(draft.id)
    res.json({ success: true, data: { ...draft, photos } })
  } catch (err) {
    res.status(500).json({ success: false, error: '获取草稿失败', message: err.message })
  }
})

// PUT /api/drafts/:id/photos/:photoId — 更新草稿中的故事
router.put('/:id/photos/:photoId', (req, res) => {
  try {
    const { story } = req.body
    const draft = db.prepare('SELECT * FROM drafts WHERE id = ?').get(req.params.id)
    if (!draft) {
      return res.status(404).json({ success: false, error: '草稿不存在' })
    }

    const photo = db.prepare('SELECT * FROM draft_photos WHERE id = ? AND draft_id = ?').get(req.params.photoId, req.params.id)
    if (!photo) {
      return res.status(404).json({ success: false, error: '照片不存在' })
    }

    db.prepare('UPDATE draft_photos SET story = ? WHERE id = ?').run(story || '', req.params.photoId)
    db.prepare('UPDATE drafts SET updated_at = datetime(\'now\') WHERE id = ?').run(req.params.id)

    const updated = db.prepare('SELECT * FROM draft_photos WHERE id = ?').get(req.params.photoId)
    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: '更新失败', message: err.message })
  }
})

// POST /api/drafts/:id/complete — 完成草稿，生成书籍
router.post('/:id/complete', (req, res) => {
  try {
    const draft = db.prepare('SELECT * FROM drafts WHERE id = ?').get(req.params.id)
    if (!draft) {
      return res.status(404).json({ success: false, error: '草稿不存在' })
    }

    const photos = db.prepare('SELECT * FROM draft_photos WHERE draft_id = ? ORDER BY photo_index').all(draft.id)
    if (photos.length === 0) {
      return res.status(400).json({ success: false, error: '草稿中没有照片' })
    }

    // 生成书籍
    const bookId = uuid()
    const bookCount = db.prepare('SELECT COUNT(*) as count FROM books').get().count
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const archiveNo = `${year}年${month}月${day}日-${String(bookCount + 1).padStart(3, '0')}`

    const chapters = ['第一章', '第二章', '第三章', '第四章', '第五章', '第六章']

    db.transaction(() => {
      db.prepare(`
        INSERT INTO books (id, title, subtitle, theme, cover_image_url, archive_no, owner_name, certificate_text, share_slug)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        bookId,
        '值得珍藏的一天',
        '把那些值得想起的日子，珍藏成一本书',
        'years_gold',
        photos[0].image_url,
        archiveNo,
        draft.owner_name,
        `这本纪念册记录了${draft.owner_name}的一段珍贵旧时光。愿每一次翻阅，都能想起那天的温暖。`,
        archiveNo
      )

      const insertPage = db.prepare('INSERT INTO pages (id, book_id, page_index, image_url, raw_story, chapter_title, polished_story) VALUES (?, ?, ?, ?, ?, ?, ?)')
      photos.forEach((photo, index) => {
        const story = photo.story || `这张照片留下了第 ${index + 1} 段旧时光。`
        insertPage.run(
          uuid(),
          bookId,
          index + 1,
          photo.image_url,
          story,
          `${chapters[index] || '第' + (index + 1) + '章'} · 这一刻`,
          story + ' 这一天的笑声和心情，都被好好珍藏了下来。'
        )
      })

      // 标记草稿为完成
      db.prepare('UPDATE drafts SET status = \'completed\', updated_at = datetime(\'now\') WHERE id = ?').run(draft.id)
    })()

    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId)
    const pages = db.prepare('SELECT * FROM pages WHERE book_id = ? ORDER BY page_index').all(bookId)

    res.json({ success: true, data: { ...book, pages } })
  } catch (err) {
    res.status(500).json({ success: false, error: '完成草稿失败', message: err.message })
  }
})

// DELETE /api/drafts/:id — 删除草稿
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM drafts WHERE id = ?').run(req.params.id)
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: '草稿不存在' })
    }
    res.json({ success: true, message: '草稿已删除' })
  } catch (err) {
    res.status(500).json({ success: false, error: '删除草稿失败', message: err.message })
  }
})

export default router
