import db from '../db.js'
import { purgeDeletedBooks } from '../services/books.js'
import { cleanupOrphanAssets, deleteAssetFiles } from '../services/assets.js'

function readNumberArg(name, fallback) {
  const arg = process.argv.find((item) => item.startsWith(`--${name}=`))
  const value = Number(arg ? arg.split('=')[1] : fallback)
  return value
}

const bookDays = readNumberArg('book-days', 30)
const assetDays = readNumberArg('asset-days', 7)

if (!Number.isFinite(bookDays) || bookDays < 0) {
  console.error('--book-days 必须是大于等于 0 的数字')
  process.exit(1)
}
if (!Number.isFinite(assetDays) || assetDays < 1) {
  console.error('--asset-days 必须是大于 0 的数字')
  process.exit(1)
}

const purged = purgeDeletedBooks(db, { olderThanDays: bookDays })
deleteAssetFiles(purged.assets)

const orphans = cleanupOrphanAssets(db, { olderThanDays: assetDays })
deleteAssetFiles(orphans)

console.log(`已彻底删除 ${purged.books.length} 本回收站书籍，清理 ${purged.assets.length} 个绑定资产`)
console.log(`已清理 ${orphans.length} 个超过 ${assetDays} 天未绑定的资产`)
db.close()
