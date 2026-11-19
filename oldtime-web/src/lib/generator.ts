import type { BookPage, MediaType } from '../types'

export interface BookPayload {
  title: string
  subtitle: string
  theme: 'years_gold'
  coverImageUrl: string
  ownerName: string
  certificateText: string
  pages: Array<{
    pageIndex: number
    imageUrl: string
    mediaType: MediaType
    thumbnailUrl: string
    audioUrl: string
    rawStory: string
    chapterTitle: string
    polishedStory: string
  }>
}

export function buildBookPayload(
  ownerName: string,
  pages: BookPage[],
  coverImageUrl: string
): BookPayload {
  const displayName = ownerName || '旧时光用户'
  const firstStory = pages[0]?.rawStory || '我的旧时光'

  return {
    title: createTitle(firstStory),
    subtitle: '把那些值得想起的日子，珍藏成一本书',
    theme: 'years_gold',
    coverImageUrl,
    ownerName: displayName,
    certificateText: `这本纪念册记录了${displayName}的一段珍贵旧时光。愿每一次翻阅，都能想起那天的温暖。`,
    pages: pages.map((page) => ({
      pageIndex: page.pageIndex,
      imageUrl: page.mediaUrl,
      mediaType: page.mediaType,
      thumbnailUrl: page.thumbnailUrl || '',
      audioUrl: page.audioUrl || '',
      rawStory: page.rawStory,
      chapterTitle: page.chapterTitle,
      polishedStory: page.polishedStory,
    })),
  }
}

export function buildPageText(story: string, index: number, needStory?: boolean) {
  return {
    chapterTitle: createChapterTitle(story, index, needStory),
    polishedStory: polishStory(story, index, needStory),
  }
}

function createTitle(story: string): string {
  if (story.includes('战友')) return '老战友的重逢'
  if (story.includes('家') || story.includes('孩子')) return '家的温度'
  if (story.includes('旅行') || story.includes('公园')) return '那天的好时光'
  return '值得珍藏的一天'
}

function createChapterTitle(story: string, index: number, needStory?: boolean): string {
  const chapters = ['第一章', '第二章', '第三章', '第四章', '第五章', '第六章']
  const prefix = chapters[index] || `第${index + 1}章`

  if (!needStory) return `${prefix} · 珍藏瞬间`

  if (story.includes('战友')) return `${prefix} · 老友重逢`
  if (story.includes('吃饭')) return `${prefix} · 一顿团圆饭`
  if (story.includes('公园')) return `${prefix} · 公园里的笑声`
  if (story.includes('孩子')) return `${prefix} · 家人在身边`
  return `${prefix} · 这一刻`
}

function polishStory(story: string, index: number, needStory?: boolean): string {
  const text = story.trim()

  if (!needStory) {
    const autoStories = [
      '这一刻，值得被永远记住。',
      '时光匆匆，但这张照片定格了美好。',
      '有些瞬间，不需要言语，只需要珍藏。',
      '岁月流转，回忆永存。',
      '这一刻的温暖，足以照亮未来的路。',
      '照片里的笑容，是最好的故事。',
    ]
    return autoStories[index % autoStories.length]
  }

  if (!text) return `这张照片留下了第 ${index + 1} 段旧时光。那一刻很安静，也很值得被好好珍藏。`
  if (text.length > 90) return `${text.slice(0, 88)}……这段记忆，被郑重收入旧时光。`
  return `${text} 这一天的笑声和心情，都被好好珍藏了下来。`
}
