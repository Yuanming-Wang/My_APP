import express from 'express'
import cors from 'cors'
import https from 'https'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync, mkdirSync, readFileSync } from 'fs'
import booksRouter from './routes/books.js'
import uploadRouter from './routes/upload.js'
import draftsRouter from './routes/drafts.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001
const HTTPS_PORT = process.env.HTTPS_PORT || 443
const isProd = process.env.NODE_ENV === 'production'

// CORS
app.use(cors({
  origin: isProd ? ['https://oldtime.app'] : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  maxAge: 86400,
  credentials: true,
}))

// JSON 解析
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 请求 ID + 日志
app.use((req, res, next) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || crypto.randomUUID()
  const start = Date.now()
  const originalEnd = res.end
  res.end = function(...args) {
    const duration = Date.now() - start
    if (!isProd) console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`)
    return originalEnd.apply(res, args)
  }
  next()
})

// 静态文件
const uploadsDir = join(__dirname, '..', 'uploads')
if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true })
app.use('/uploads', express.static(uploadsDir, { maxAge: '30d', etag: true }))

// 前端静态文件
const distDir = join(__dirname, 'dist')
app.use(express.static(distDir))

// API 路由
app.use('/api/books', booksRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/drafts', draftsRouter)

// 验证码存储（内存，生产环境用Redis）
const codeStore = new Map()

// 发送验证码
app.post('/api/auth/send-code', (req, res) => {
  const { phone } = req.body
  if (!phone || phone.length !== 11) {
    return res.status(400).json({ success: false, error: '请输入正确的手机号' })
  }
  const code = '123456' // 演示环境固定验证码
  codeStore.set(phone, { code, expires: Date.now() + 300000 })
  console.log(`[SMS] 验证码已发送至 ${phone}: ${code}`)
  res.json({ success: true, message: '验证码已发送' })
})

// 验证验证码
app.post('/api/auth/verify-code', (req, res) => {
  const { phone, code } = req.body
  const record = codeStore.get(phone)
  if (!record) {
    return res.status(400).json({ success: false, error: '请先发送验证码' })
  }
  if (Date.now() > record.expires) {
    codeStore.delete(phone)
    return res.status(400).json({ success: false, error: '验证码已过期' })
  }
  if (record.code !== code) {
    return res.status(400).json({ success: false, error: '验证码错误' })
  }
  codeStore.delete(phone)
  res.json({ success: true, token: 'demo-token-' + Date.now() })
})

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
  })
})

// API 文档
app.get('/api', (_req, res) => {
  res.json({
    name: 'OldTime API',
    version: '1.0.0',
    endpoints: {
      'GET /api/books': '获取书籍列表 (?page=1&limit=20)',
      'GET /api/books/:id': '获取单本书籍',
      'POST /api/books': '创建新书',
      'DELETE /api/books/:id': '删除书籍',
      'POST /api/upload': '上传图片',
      'POST /api/drafts': '创建协作草稿',
      'GET /api/drafts/:id': '获取协作草稿',
      'PUT /api/drafts/:id/photos/:photoId': '更新草稿故事',
      'POST /api/drafts/:id/complete': '完成草稿生成书籍',
      'DELETE /api/drafts/:id': '删除草稿',
      'GET /api/health': '健康检查',
    },
  })
})

// 404
app.use('/api/{*path}', (_req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' })
})

// 前端路由回退
app.get('/{*path}', (_req, res) => {
  res.sendFile(join(distDir, 'index.html'))
})

// 全局错误处理
app.use((err, _req, res, _next) => {
  const status = err.status || 500
  console.error(`[Error ${status}]`, err.message)
  res.status(status).json({
    success: false,
    error: isProd && status === 500 ? 'Internal Server Error' : err.message,
  })
})

// 启动 HTTP
const server = app.listen(PORT, () => {
  console.log(`\n  旧时光 · OldTime API Server`)
  console.log(`  http://localhost:${PORT}`)
  console.log(`  http://localhost:${PORT}/api\n`)
})

// 启动 HTTPS
const certPath = join(__dirname, 'cert.pem')
const keyPath = join(__dirname, 'key.pem')
if (existsSync(certPath) && existsSync(keyPath)) {
  const httpsOptions = {
    cert: readFileSync(certPath),
    key: readFileSync(keyPath),
  }
  const httpsServer = https.createServer(httpsOptions, app)
  httpsServer.listen(HTTPS_PORT, () => {
    console.log(`  https://localhost:${HTTPS_PORT}`)
    console.log(`  https://localhost:${HTTPS_PORT}/api\n`)
  })
}

// 优雅关闭
const gracefulShutdown = (signal) => {
  console.log(`\n[Server] 收到 ${signal}，正在关闭...`)
  server.close(() => { console.log('[Server] 已关闭'); process.exit(0) })
  setTimeout(() => { process.exit(1) }, 10000)
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

export default app
