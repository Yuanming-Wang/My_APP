// 请求验证中间件 — 借鉴 Immich 的验证模式

export function validateBook(req, res, next) {
  const { title, archiveNo, ownerName } = req.body
  const errors = []

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('title 是必填字段')
  }
  if (!archiveNo || typeof archiveNo !== 'string') {
    errors.push('archiveNo 是必填字段')
  }
  if (!ownerName || typeof ownerName !== 'string') {
    errors.push('ownerName 是必填字段')
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: '请求验证失败',
      details: errors,
    })
  }

  next()
}

export function validatePagination(req, _res, next) {
  req.query.page = Math.max(1, parseInt(req.query.page) || 1).toString()
  req.query.limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20)).toString()
  next()
}
