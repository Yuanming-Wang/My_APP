import { existsSync, unlinkSync } from 'fs'
import { join, normalize, sep } from 'path'
import { uploadsDir } from '../lib/paths.js'

export function registerAsset(db, ownerId, asset) {
  db.prepare(`
    INSERT OR IGNORE INTO assets (id, owner_id, kind, url, thumbnail_url, mime_type, size, original_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    asset.id,
    ownerId || null,
    asset.kind,
    asset.url,
    asset.thumbnailUrl || null,
    asset.mimeType || null,
    asset.size || null,
    asset.originalName || null
  )
}

export function attachAssetsToBook(db, bookId, urls) {
  const unique = [...new Set(urls.filter(Boolean))]
  if (unique.length === 0) return
  const placeholders = unique.map(() => '?').join(', ')
  db.prepare(`UPDATE assets SET book_id = ? WHERE url IN (${placeholders})`).run(bookId, ...unique)
}

export function deleteAssetsForBook(db, bookId) {
  const rows = db.prepare('SELECT * FROM assets WHERE book_id = ?').all(bookId)
  db.prepare('DELETE FROM assets WHERE book_id = ?').run(bookId)
  return rows
}

export function deleteUnboundAssetsByUrls(db, urls) {
  const unique = [...new Set(urls.filter(Boolean))]
  if (unique.length === 0) return []
  const placeholders = unique.map(() => '?').join(', ')
  const rows = db.prepare(`SELECT * FROM assets WHERE book_id IS NULL AND url IN (${placeholders})`).all(...unique)
  if (rows.length > 0) {
    db.prepare(`DELETE FROM assets WHERE book_id IS NULL AND url IN (${placeholders})`).run(...unique)
  }
  return rows
}

export function cleanupOrphanAssets(db, { olderThanDays = 7 } = {}) {
  const rows = db.prepare(
    "SELECT * FROM assets WHERE book_id IS NULL AND created_at < datetime('now', ?)"
  ).all(`-${olderThanDays} days`)

  if (rows.length > 0) {
    const placeholders = rows.map(() => '?').join(', ')
    db.prepare(`DELETE FROM assets WHERE id IN (${placeholders})`).run(...rows.map((row) => row.id))
  }

  return rows
}

export function assetFilePath(url) {
  if (!url || !url.startsWith('/uploads/')) return null
  const root = normalize(uploadsDir)
  const full = normalize(join(root, url.slice('/uploads/'.length)))
  if (full !== root && !full.startsWith(root + sep)) return null
  return full
}

export function deleteAssetFiles(rows) {
  const files = new Set()
  for (const row of rows) {
    for (const url of [row.url, row.thumbnail_url]) {
      const filePath = assetFilePath(url)
      if (filePath) files.add(filePath)
    }
  }
  for (const filePath of files) {
    if (existsSync(filePath)) {
      try {
        unlinkSync(filePath)
      } catch {
        continue
      }
    }
  }
}
