import { z } from 'zod'

const pageSchema = z.object({
  pageIndex: z.number().optional(),
  imageUrl: z.string().min(1, 'imageUrl 不能为空'),
  mediaType: z.enum(['image', 'video']).optional(),
  thumbnailUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  rawStory: z.string().optional(),
  chapterTitle: z.string().optional(),
  polishedStory: z.string().optional(),
})

const bookSchema = z.object({
  title: z.string().trim().min(1, 'title 是必填字段').max(50, 'title 最多 50 个字符'),
  ownerName: z.string().trim().min(1, 'ownerName 是必填字段'),
  subtitle: z.string().optional(),
  theme: z.string().optional(),
  coverImageUrl: z.string().optional(),
  certificateText: z.string().optional(),
  pages: z.array(pageSchema).optional(),
})

const draftSchema = z.object({
  ownerName: z.string().trim().min(1, 'ownerName 是必填字段'),
  photos: z
    .array(
      z.object({
        imageUrl: z.string().min(1, 'photos 中的每一项都必须包含 imageUrl'),
        story: z.string().max(500, 'story 最多 500 个字符').optional(),
      })
    )
    .min(1, 'photos 必须是非空数组'),
})

const storySchema = z.object({
  story: z.string().max(500, 'story 最多 500 个字符'),
})

const paginationSchema = z.object({
  page: z.coerce.number().int().catch(1).transform((value) => Math.max(1, value)),
  limit: z.coerce.number().int().catch(20).transform((value) => Math.min(50, Math.max(1, value))),
})

function respondInvalid(res, error) {
  const details = error.issues.map((issue) => {
    const path = issue.path.join('.')
    return path ? `${path}: ${issue.message}` : issue.message
  })
  return res.status(400).json({ success: false, error: '请求验证失败', details })
}

export function validateBook(req, res, next) {
  const result = bookSchema.safeParse(req.body)
  if (!result.success) return respondInvalid(res, result.error)
  req.body = result.data
  next()
}

export function validateDraft(req, res, next) {
  const result = draftSchema.safeParse(req.body)
  if (!result.success) return respondInvalid(res, result.error)
  req.body = result.data
  next()
}

export function validateStory(req, res, next) {
  const result = storySchema.safeParse(req.body)
  if (!result.success) return respondInvalid(res, result.error)
  req.body = result.data
  next()
}

export function validatePagination(req, _res, next) {
  const { page, limit } = paginationSchema.parse({
    page: req.query.page,
    limit: req.query.limit,
  })
  req.pagination = { page, limit }
  next()
}
