import { Router } from 'express'
import multer from 'multer'
import sharp from 'sharp'
import { v4 as uuid } from 'uuid'
import { join, extname } from 'path'
import { mkdirSync, existsSync, writeFileSync } from 'fs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const uploadsDir = join(__dirname, '..', 'uploads')
const thumbsDir = join(uploadsDir, 'thumbs')

if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true })
if (!existsSync(thumbsDir)) mkdirSync(thumbsDir, { recursive: true })

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only images are allowed'))
    }
  },
})

const router = Router()

// POST /api/upload — 上传图片
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' })
    }

    const id = uuid()
    const ext = extname(req.file.originalname) || '.jpg'
    const filename = `${id}${ext}`
    const thumbFilename = `${id}_thumb.webp`

    const filepath = join(uploadsDir, filename)
    const thumbPath = join(thumbsDir, thumbFilename)

    // 原图保存（限制最大 2000px 宽/高）
    const processed = await sharp(req.file.buffer)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer()

    writeFileSync(filepath, processed)

    // 缩略图（400px 宽）
    const thumb = await sharp(req.file.buffer)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 75 })
      .toBuffer()

    writeFileSync(thumbPath, thumb)

    res.json({
      success: true,
      data: {
        id,
        url: `/uploads/${filename}`,
        thumbnail: `/uploads/thumbs/${thumbFilename}`,
        size: processed.length,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/upload/batch — 批量上传
router.post('/batch', upload.array('images', 6), async (req, res) => {
  try {
    const files = req.files
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' })
    }

    const results = await Promise.all(
      files.map(async (file) => {
        const id = uuid()
        const filename = `${id}.jpg`
        const thumbFilename = `${id}_thumb.webp`

        const processed = await sharp(file.buffer)
          .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85, progressive: true })
          .toBuffer()

        writeFileSync(join(uploadsDir, filename), processed)

        const thumb = await sharp(file.buffer)
          .resize(400, 400, { fit: 'cover' })
          .webp({ quality: 75 })
          .toBuffer()

        writeFileSync(join(thumbsDir, thumbFilename), thumb)

        return {
          id,
          url: `/uploads/${filename}`,
          thumbnail: `/uploads/thumbs/${thumbFilename}`,
          size: processed.length,
        }
      })
    )

    res.json({ success: true, data: results })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
