import type { Book, BookPage, MediaType } from '../types'

function formatDate(value: unknown): string {
  return String(value || '').slice(0, 10)
}

function mapPage(page: any): BookPage {
  return {
    id: String(page.id),
    pageIndex: Number(page.page_index ?? page.pageIndex ?? 0),
    mediaUrl: page.image_url ?? page.mediaUrl ?? '',
    mediaType: (page.media_type ?? page.mediaType ?? 'image') as MediaType,
    thumbnailUrl: page.thumbnail_url ?? page.thumbnailUrl ?? '',
    audioUrl: page.audio_url ?? page.audioUrl ?? '',
    rawStory: page.raw_story ?? page.rawStory ?? '',
    chapterTitle: page.chapter_title ?? page.chapterTitle ?? '',
    polishedStory: page.polished_story ?? page.polishedStory ?? '',
  }
}

export function mapBook(data: any): Book {
  return {
    id: String(data.id),
    title: data.title || '值得珍藏的一天',
    subtitle: data.subtitle || '',
    theme: data.theme || 'years_gold',
    coverImageUrl: data.cover_image_url ?? data.coverImageUrl ?? '',
    archiveNo: data.archive_no ?? data.archiveNo ?? '',
    ownerName: data.owner_name ?? data.ownerName ?? '',
    certificateText: data.certificate_text ?? data.certificateText ?? '',
    shareSlug: data.share_slug ?? data.shareSlug ?? '',
    createdAt: formatDate(data.created_at ?? data.createdAt),
    pages: Array.isArray(data.pages) ? data.pages.map(mapPage) : [],
  }
}
