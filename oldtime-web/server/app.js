import express from 'express'
import cors from 'cors'
import { randomUUID } from 'crypto'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import booksRouter from './routes/books.js'
import uploadRouter from './routes/upload.js'
import draftsRouter from './routes/drafts.js'
import { ownerContext } from './middleware/owner.js'
import { uploadsDir } from './lib/paths.js'
import { openapi } from './openapi.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isProd = process.env.NODE_ENV === 'production'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.set('trust proxy', 1)

  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((item) => item.trim())
    : ['https://oldtime.app']

  app.use(cors({
    origin: isProd ? corsOrigins : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Owner-Id'],
    maxAge: 86400,
    credentials: true,
  }))

  app.use(express.json({ limit: '25mb' }))
  app.use(express.urlencoded({ extended: true, limit: '25mb' }))

  app.use((req, res, next) => {
    req.headers['x-request-id'] = req.headers['x-request-id'] || randomUUID()
    const start = Date.now()
    const originalEnd = res.end
    res.end = function (...args) {
      if (!isProd) {
        const duration = Date.now() - start
        console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`)
      }
      return originalEnd.apply(res, args)
    }
    next()
  })

  app.use('/uploads', express.static(uploadsDir, { maxAge: '30d', etag: true }))

  const distDir = existsSync(join(__dirname, 'dist'))
    ? join(__dirname, 'dist')
    : join(__dirname, '..', 'dist')
  app.use(express.static(distDir))

  app.use('/api', ownerContext)

  app.use('/api/books', booksRouter)
  app.use('/api/upload', uploadRouter)
  app.use('/api/drafts', draftsRouter)

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    })
  })

  app.get('/api/openapi.json', (_req, res) => {
    res.json(openapi)
  })

  app.get('/api', (_req, res) => {
    res.json({
      name: 'OldTime API',
      version: '4.0.0',
      endpoints: {
        'GET /api/books': '获取当前 owner 的书籍列表 (?page=1&limit=20)',
        'GET /api/books/:id': '获取当前 owner 的单本书籍',
        'GET /api/books/slug/:slug': '按分享 token 获取书籍',
        'POST /api/books': '创建新书',
        'POST /api/books/claim-legacy': '把 owner_id 为空的旧书归属到当前 owner',
        'PATCH /api/books/:id': '更新书籍',
        'DELETE /api/books/:id': '软删除书籍（移入回收站，30 天后由维护脚本彻底清理）',
        'POST /api/upload': '上传图片',
        'POST /api/upload/batch': '批量上传图片',
        'POST /api/upload/video': '上传视频',
        'POST /api/upload/audio': '上传录音',
        'POST /api/drafts': '创建协作草稿',
        'GET /api/drafts/:id': '按草稿 ID 获取协作草稿',
        'PUT /api/drafts/:id/photos/:photoId': '更新草稿故事',
        'POST /api/drafts/:id/complete': '完成草稿生成书籍',
        'DELETE /api/drafts/:id': '删除草稿并清理未绑定资产',
        'GET /api/health': '健康检查',
        'GET /api/openapi.json': 'OpenAPI 契约',
      },
    })
  })

  app.use('/api/{*path}', (_req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' })
  })

  app.get('/{*path}', (_req, res) => {
    res.sendFile(join(distDir, 'index.html'))
  })

  app.use((err, _req, res, _next) => {
    const status = err.status || 500
    console.error(`[Error ${status}]`, err.message)
    res.status(status).json({
      success: false,
      error: isProd && status === 500 ? 'Internal Server Error' : err.message,
    })
  })

  return app
}
