import { v4 as uuid } from 'uuid'

const errorSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    error: { type: 'string' },
  },
}

const pageSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    pageIndex: { type: 'integer' },
    mediaUrl: { type: 'string' },
    mediaType: { type: 'string', enum: ['image', 'video'] },
    thumbnailUrl: { type: 'string' },
    audioUrl: { type: 'string' },
    rawStory: { type: 'string' },
    chapterTitle: { type: 'string' },
    polishedStory: { type: 'string' },
  },
}

const bookSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    archiveNo: { type: 'string' },
    ownerName: { type: 'string' },
    title: { type: 'string' },
    subtitle: { type: 'string' },
    theme: { type: 'string' },
    coverImageUrl: { type: 'string' },
    certificateText: { type: 'string' },
    shareSlug: { type: 'string' },
    shareToken: { type: 'string' },
    createdAt: { type: 'string' },
    pages: { type: 'array', items: pageSchema },
  },
}

const draftSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    ownerName: { type: 'string' },
    status: { type: 'string', enum: ['pending', 'completed', 'expired'] },
    expiresAt: { type: 'string' },
    photos: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          imageUrl: { type: 'string' },
          story: { type: 'string' },
        },
      },
    },
  },
}

export const openapi = {
  openapi: '3.1.0',
  info: {
    title: 'OldTime API',
    version: '4.0.0',
    description: '旧时光数字纪念册 API。书籍按 owner 隔离，分享使用随机 token，删除为软删除。',
  },
  servers: [{ url: '/api' }],
  paths: {
    '/health': {
      get: { summary: '健康检查', responses: { 200: { description: 'OK' } } },
    },
    '/books': {
      get: {
        summary: '获取当前 owner 的书籍列表',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50 } },
        ],
        responses: { 200: { description: '书籍列表' } },
      },
      post: {
        summary: '创建书籍',
        requestBody: { required: true, content: { 'application/json': { schema: bookSchema } } },
        responses: { 201: { description: '创建成功' }, 400: { description: '参数错误' } },
      },
    },
    '/books/{id}': {
      get: { summary: '获取单本书籍', responses: { 200: { description: 'OK' }, 404: { description: '不存在' } } },
      patch: { summary: '更新书籍', responses: { 200: { description: '更新成功' } } },
      delete: { summary: '软删除书籍（移入回收站）', responses: { 200: { description: '删除成功' }, 404: { description: '不存在' } } },
    },
    '/books/slug/{slug}': {
      get: { summary: '按分享 token 获取书籍', responses: { 200: { description: 'OK' }, 404: { description: '链接失效' } } },
    },
    '/books/claim-legacy': {
      post: { summary: '把 owner_id 为空的旧书归属到当前 owner', responses: { 200: { description: 'OK' } } },
    },
    '/upload': {
      post: {
        summary: '上传图片',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } },
            },
          },
        },
        responses: { 200: { description: '上传成功' } },
      },
    },
    '/upload/batch': {
      post: {
        summary: '批量上传图片',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: { images: { type: 'array', items: { type: 'string', format: 'binary' } } },
              },
            },
          },
        },
        responses: { 200: { description: '上传成功' } },
      },
    },
    '/upload/video': {
      post: { summary: '上传视频', responses: { 200: { description: '上传成功' } } },
    },
    '/upload/audio': {
      post: { summary: '上传录音', responses: { 200: { description: '上传成功' } } },
    },
    '/drafts': {
      post: {
        summary: '创建协作草稿',
        requestBody: { required: true, content: { 'application/json': { schema: draftSchema } } },
        responses: { 201: { description: '创建成功' }, 400: { description: '参数错误' } },
      },
    },
    '/drafts/{id}': {
      get: { summary: '按草稿 ID 获取草稿', responses: { 200: { description: 'OK' }, 410: { description: '草稿已过期' } } },
      delete: { summary: '删除草稿', responses: { 200: { description: '删除成功' } } },
    },
    '/drafts/{id}/photos/{photoId}': {
      put: {
        summary: '更新草稿照片故事',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['story'],
                properties: { story: { type: 'string', maxLength: 500 } },
              },
            },
          },
        },
        responses: {
          200: { description: '更新成功' },
          400: { description: '参数错误' },
          409: { description: '状态不允许' },
          410: { description: '草稿已过期' },
        },
      },
    },
    '/drafts/{id}/complete': {
      post: { summary: '完成草稿并生成书籍', responses: { 200: { description: '生成成功' }, 409: { description: '状态不允许' } } },
    },
  },
  components: {
    schemas: {
      Error: errorSchema,
      Book: bookSchema,
      Page: pageSchema,
      Draft: draftSchema,
      OwnerHeader: {
        type: 'string',
        format: 'uuid',
        description: '可选，用于测试或非浏览器客户端；浏览器使用 oldtime_owner cookie。',
        example: uuid(),
      },
    },
  },
}
