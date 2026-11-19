import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const uploadsDir = process.env.OLD_TIME_UPLOADS_DIR || join(__dirname, '..', 'uploads')
