import db from '../db.js'
import { cleanupOrphanAssets, deleteAssetFiles } from '../services/assets.js'

const daysArg = process.argv.find((arg) => arg.startsWith('--days='))
const days = Number(daysArg?.split('=')[1] || process.env.ASSET_ORPHAN_DAYS || 7)

if (!Number.isFinite(days) || days < 1) {
  console.error('--days 必须是大于 0 的数字')
  process.exit(1)
}

const assets = cleanupOrphanAssets(db, { olderThanDays: days })
deleteAssetFiles(assets)
console.log(`已清理 ${assets.length} 个超过 ${days} 天未绑定的资产`)
db.close()
