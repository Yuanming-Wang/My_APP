import db from '../db.js'
import { claimLegacyBooks } from '../services/books.js'

const ownerId = process.argv[2] || process.env.OWNER_ID
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

if (!ownerId || !uuidPattern.test(ownerId)) {
  console.error('用法: npm run db:claim-legacy -- <owner-uuid>')
  console.error('或设置 OWNER_ID 环境变量')
  process.exit(1)
}

const claimed = claimLegacyBooks(db, ownerId)
console.log(`已把 ${claimed} 本旧书归属到 ${ownerId}`)
db.close()
