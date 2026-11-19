/* ═══════════════════════════════════════════════════════════════
   常量配置 — 消除所有魔法数字和硬编码字符串
   ═══════════════════════════════════════════════════════════════ */

// 应用配置
export const APP_NAME = '旧时光'
export const APP_NAME_EN = 'OldTime'
export const APP_SLOGAN = '旧时光，新珍藏'
export const APP_DESCRIPTION = '让每一位老人都能拥有一本值得珍藏的数字纪念册'

// 限制
export const MAX_PHOTOS = 12
export const MAX_VIDEOS = 10
export const MAX_PHOTO_SIZE_MB = 50
export const MAX_VIDEO_SIZE_MB = 500
export const MAX_BOOK_TITLE_LENGTH = 50
export const MAX_STORY_LENGTH = 500

// 动画时长 (ms)
export const ANIMATION_FAST = 150
export const ANIMATION_NORMAL = 200
export const ANIMATION_SLOW = 300
export const SPLASH_DURATION = 2200
export const TOAST_DURATION = 2500
export const GENERATING_PHASE_DURATION = 800

// 路由
export const ROUTES = {
  HOME: 'home',
  CREATE: 'create',
  STORIES: 'stories',
  GENERATING: 'generating',
  READER: 'reader',
  SHARE: 'share',
} as const

export const ROUTE_PATHS: Record<string, string> = {
  [ROUTES.HOME]: '/home',
  [ROUTES.CREATE]: '/create',
  [ROUTES.STORIES]: '/stories',
  [ROUTES.GENERATING]: '/generating',
  [ROUTES.READER]: '/reader',
  [ROUTES.SHARE]: '/share',
}

// 存储键
export const STORAGE_KEY = 'oldtime-books-v1'

// 文案
export const TEXTS = {
  EMPTY_COLLECTION: '还没有藏品',
  EMPTY_COLLECTION_DESC: '点击下方按钮，挑选照片，讲述故事，生成你的第一本数字纪念册。',
  START_CREATE: '开始制作',
  COPY_SUCCESS: '分享链接已复制，可以发给家人和老朋友。',
  COPY_FAILED: '复制失败，请手动复制链接。',
  PHOTO_READ_FAILED: '照片读取失败，请重试。',
  GENERATE_FAILED: '生成失败，请重试。',
  DELETE_CONFIRM: '确定要删除这张照片吗？',
  DELETE_BOOK_CONFIRM: '确定要删除这本纪念册吗？此操作不可恢复。',
  HELP_SENT: '已发送求助信号，孩子会收到通知。',
  COLLECTING: '正在收集照片...',
  POLISHING: '正在润色故事...',
  GENERATING: '正在生成封面...',
  COMPLETE: '入藏完成！',
} as const

// 主题
export const THEMES = {
  YEARS_GOLD: 'years_gold',
  OCEAN_BLUE: 'ocean_blue',
  FAMILY_WARMTH: 'family_warmth',
} as const

// 颜色
export const COLORS = {
  PRIMARY: '#8B4513',
  PRIMARY_LIGHT: '#A0522D',
  PRIMARY_DARK: '#6C2F00',
  ACCENT: '#D4AF37',
  GOLD: '#D4AF37',
  TEXT_PRIMARY: '#1A1A1A',
  TEXT_SECONDARY: '#666666',
  TEXT_TERTIARY: '#999999',
  BG_PAGE: '#F5F5F5',
  BG_CARD: '#FFFFFF',
  BORDER: '#E8E8E8',
  SUCCESS: '#52C41A',
  WARNING: '#FAAD14',
  ERROR: '#FF4D4F',
} as const
