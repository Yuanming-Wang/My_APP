import https from 'https'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync, readFileSync } from 'fs'
import { createApp } from './app.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = createApp()
const PORT = process.env.PORT || 3001
const HTTPS_PORT = process.env.HTTPS_PORT || 443

const server = app.listen(PORT, () => {
  console.log(`\n  旧时光 · OldTime API Server`)
  console.log(`  http://localhost:${PORT}`)
  console.log(`  http://localhost:${PORT}/api\n`)
})

const servers = [server]

const certPath = join(__dirname, 'cert.pem')
const keyPath = join(__dirname, 'key.pem')
if (existsSync(certPath) && existsSync(keyPath)) {
  const httpsServer = https.createServer(
    { cert: readFileSync(certPath), key: readFileSync(keyPath) },
    app
  )
  httpsServer.on('error', (err) => {
    console.warn(`[HTTPS] ${err.message}`)
  })
  httpsServer.listen(HTTPS_PORT, () => {
    console.log(`  https://localhost:${HTTPS_PORT}`)
    console.log(`  https://localhost:${HTTPS_PORT}/api\n`)
  })
  servers.push(httpsServer)
}

const gracefulShutdown = (signal) => {
  console.log(`\n[Server] 收到 ${signal}，正在关闭...`)
  let pending = servers.length
  const finish = () => {
    pending -= 1
    if (pending === 0) {
      console.log('[Server] 已关闭')
      process.exit(0)
    }
  }
  for (const item of servers) item.close(finish)
  setTimeout(() => process.exit(1), 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

export default app
