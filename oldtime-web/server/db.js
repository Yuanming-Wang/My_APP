import Database from 'better-sqlite3'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { mkdirSync } from 'fs'
import { migrate } from './db/migrations.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const defaultPath = join(__dirname, 'data', 'oldtime.db')
const dbPath = process.env.OLD_TIME_DB_PATH || defaultPath

if (dbPath !== ':memory:') {
  mkdirSync(dirname(dbPath), { recursive: true })
}

export function createDatabase(path = dbPath) {
  const instance = new Database(path)
  migrate(instance)
  return instance
}

const db = createDatabase()

export default db
