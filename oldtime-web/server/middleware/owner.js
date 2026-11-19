import { v4 as uuid } from 'uuid'

const COOKIE_NAME = 'oldtime_owner'
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function parseCookies(header = '') {
  return header.split(';').reduce((cookies, part) => {
    const index = part.indexOf('=')
    if (index === -1) return cookies
    const key = part.slice(0, index).trim()
    const value = part.slice(index + 1).trim()
    if (key) cookies[key] = decodeURIComponent(value)
    return cookies
  }, {})
}

export function ownerContext(req, res, next) {
  const header = req.get('x-owner-id')
  const cookies = parseCookies(req.headers.cookie)
  const candidate = UUID_PATTERN.test(header || '') ? header : cookies[COOKIE_NAME]
  const ownerId = UUID_PATTERN.test(candidate || '') ? candidate : uuid()

  req.ownerId = ownerId
  res.cookie(COOKIE_NAME, ownerId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: req.secure,
    maxAge: 365 * 24 * 60 * 60 * 1000,
    path: '/',
  })

  next()
}
