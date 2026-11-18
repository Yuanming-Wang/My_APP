export type Theme = 'years_gold' | 'ocean_blue' | 'family_warmth'
export type MediaType = 'image' | 'video'

export interface DraftMedia {
  id: string
  type: MediaType
  dataUrl: string
  thumbnailUrl?: string // 视频封面
  story: string
  needStory: boolean
  duration?: number // 视频时长(秒)
}

export interface BookPage {
  id: string
  pageIndex: number
  mediaUrl: string
  mediaType: MediaType
  thumbnailUrl?: string
  rawStory: string
  chapterTitle: string
  polishedStory: string
}

export interface Book {
  id: string
  title: string
  subtitle: string
  theme: Theme
  coverImageUrl: string
  archiveNo: string
  ownerName: string
  certificateText: string
  shareSlug: string
  createdAt: string
  pages: BookPage[]
}
