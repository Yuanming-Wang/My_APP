import { Router } from 'express'
import multer from 'multer'
import sharp from 'sharp'
import { v4 as uuid } from 'uuid'
import { join, extname } from 'path'
import { mkdirSync, writeFileSync } from 'fs'
import db from '../db.js'
import { uploadsDir } from '../lib/paths.js'
import { registerAsset } from '../services/assets.js'

const thumbsDir = join(uploadsDir, 'thumbs')
const videosDir = join(uploadsDir, 'videos')
const audiosDir = join(uploadsDir, 'audios')

for (const dir of [uploadsDir, thumbsDir, videosDir, audiosDir]) {
  mkdirSync(dir, { recursive: true })
}

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (allowed.includes(file.mimetype)) return cb(null, true)
    cb(Object.assign(new Error('Only images are allowed'), { status: 400 }))
  },
})

const videoUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, videosDir),
    filename: (_req, file, cb) => {
      const id = uuid()
      file.assetId = id
      cb(null, `${id}${extname(file.originalname).toLowerCase() || '.mp4'}`)
    },
  }),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('video/')) return cb(null, true)
    cb(Object.assign(new Error('Only videos are allowed'), { status: 400 }))
  },
})

const audioUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, audiosDir),
    filename: (_req, file, cb) => {
      const id = uuid()
      file.assetId = id
      cb(null, `${id}${extname(file.originalname).toLowerCase() || '.webm'}`)
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) return cb(null, true)
    cb(Object.assign(new Error('Only audio is allowed'), { status: 400 }))
  },
})

const router = Router()

router.post('/video', videoUpload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No video uploaded' })

  const url = `/uploads/videos/${req.file.filename}`
  registerAsset(db, req.ownerId, {
    id: req.file.assetId,
    kind: 'video',
    url,
    mimeType: req.file.mimetype,
    size: req.file.size,
    originalName: req.file.originalname,
  })

  res.json({ success: true, data: { id: req.file.assetId, url, size: req.file.size } })
})

router.post('/audio', audioUpload.single('audio'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No audio uploaded' })

  const url = `/uploads/audios/${req.file.filename}`
  registerAsset(db, req.ownerId, {
    id: req.file.assetId,
    kind: 'audio',
    url,
    mimeType: req.file.mimetype,
    size: req.file.size,
    originalName: req.file.originalname,
  })

  res.json({ success: true, data: { id: req.file.assetId, url, size: req.file.size } })
})

router.post('/', imageUpload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' })

    const id = uuid()
    const filename = `${id}.jpg`
    const thumbFilename = `${id}_thumb.webp`
    const processed = await sharp(req.file.buffer)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer()
    const thumb = await sharp(req.file.buffer)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 75 })
      .toBuffer()

    const url = `/uploads/${filename}`
    const thumbnailUrl = `/uploads/thumbs/${thumbFilename}`
    writeFileSync(join(uploadsDir, filename), processed)
    writeFileSync(join(thumbsDir, thumbFilename), thumb)

    registerAsset(db, req.ownerId, {
      id,
      kind: 'image',
      url,
      thumbnailUrl,
      mimeType: 'image/jpeg',
      size: processed.length,
      originalName: req.file.originalname,
    })

    res.json({ success: true, data: { id, url, thumbnail: thumbnailUrl, size: processed.length } })
  } catch (err) {
    next(err)
  }
})

router.post('/batch', imageUpload.array('images', 6), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' })
    }

    const results = await Promise.all(req.files.map(async (file) => {
      const id = uuid()
      const filename = `${id}.jpg`
      const thumbFilename = `${id}_thumb.webp`
      const processed = await sharp(file.buffer)
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer()
      const thumb = await sharp(file.buffer)
        .resize(400, 400, { fit: 'cover' })
        .webp({ quality: 75 })
        .toBuffer()

      const url = `/uploads/${filename}`
      const thumbnailUrl = `/uploads/thumbs/${thumbFilename}`
      writeFileSync(join(uploadsDir, filename), processed)
      writeFileSync(join(thumbsDir, thumbFilename), thumb)

      registerAsset(db, req.ownerId, {
        id,
        kind: 'image',
        url,
        thumbnailUrl,
        mimeType: 'image/jpeg',
        size: processed.length,
        originalName: file.originalname,
      })

      return { id, url, thumbnail: thumbnailUrl, size: processed.length }
    }))

    res.json({ success: true, data: results })
  } catch (err) {
    next(err)
  }
})

export default router
