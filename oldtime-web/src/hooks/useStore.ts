import { create } from 'zustand'
import type { AudioRecording, Book, BookPage, DraftMedia } from '../types'
import { buildBookPayload, buildPageText } from '../lib/generator'
import { booksApi } from '../lib/api'
import { uploadDraftMedia } from '../lib/media'
import { mapBook } from '../lib/mappers'
import { MAX_PHOTOS, MAX_VIDEOS, TOAST_DURATION } from '../lib/constants'

interface AppState {
  books: Book[]
  draftMedia: DraftMedia[]
  ownerName: string
  activeBookId: string | null
  activePage: number
  toast: string
  loading: boolean

  setOwnerName: (name: string) => void
  addMedia: (files: File[]) => Promise<void>
  removeMedia: (id: string) => void
  updateStory: (id: string, story: string) => void
  toggleNeedStory: (id: string) => void
  setMediaAudio: (id: string, audio: AudioRecording | null) => void
  clearDraft: () => void
  generate: () => Promise<Book | undefined>
  openBook: (id: string) => void
  loadSharedBook: (slug: string) => Promise<boolean>
  setActivePage: (page: number) => void
  showToast: (msg: string) => void
  deleteBook: (id: string) => Promise<void>
  loadBooks: () => Promise<void>
  setBooks: (books: Book[]) => void
  setSharedBook: (book: Book) => void
  getActiveBook: () => Book | undefined
}

export const useStore = create<AppState>()((set, get) => ({
  books: [],
  draftMedia: [],
  ownerName: '',
  activeBookId: null,
  activePage: 0,
  toast: '',
  loading: false,

  setOwnerName: (name) => set({ ownerName: name }),

  addMedia: async (files) => {
    try {
      const current = get().draftMedia
      const imageCount = current.filter((m) => m.type === 'image').length
      const videoCount = current.filter((m) => m.type === 'video').length

      set({ loading: true })

      const newMedia: DraftMedia[] = []

      for (const file of files) {
        const isVideo = file.type.startsWith('video/')

        if (isVideo) {
          if (videoCount + newMedia.filter((m) => m.type === 'video').length >= MAX_VIDEOS) {
            get().showToast(`最多只能选择${MAX_VIDEOS}个视频`)
            continue
          }
        } else {
          if (imageCount + newMedia.filter((m) => m.type === 'image').length >= MAX_PHOTOS) {
            get().showToast(`最多只能选择${MAX_PHOTOS}张照片`)
            continue
          }
        }

        if (isVideo) {
          // 处理视频
          const video = await processVideo(file)
          newMedia.push(video)
        } else {
          // 处理图片
          const image = await processImage(file)
          newMedia.push(image)
        }
      }

      set({ draftMedia: [...current, ...newMedia], loading: false })
    } catch (err) {
      console.error('添加媒体失败:', err)
      get().showToast('文件读取失败，请重试。')
      set({ loading: false })
    }
  },

  removeMedia: (id) => {
    const target = get().draftMedia.find((m) => m.id === id)
    if (target?.audioUrl?.startsWith('blob:')) URL.revokeObjectURL(target.audioUrl)
    set((s) => ({
      draftMedia: s.draftMedia.filter((m) => m.id !== id),
    }))
  },

  updateStory: (id, story) =>
    set((s) => ({
      draftMedia: s.draftMedia.map((m) => (m.id === id ? { ...m, story } : m)),
    })),

  toggleNeedStory: (id) =>
    set((s) => ({
      draftMedia: s.draftMedia.map((m) =>
        m.id === id ? { ...m, needStory: !m.needStory, story: !m.needStory ? m.story : '' } : m
      ),
    })),

  setMediaAudio: (id, audio) =>
    set((s) => ({
      draftMedia: s.draftMedia.map((m) =>
        m.id === id
          ? {
              ...m,
              audioFile: audio?.file,
              audioUrl: audio?.url,
              audioDuration: audio?.duration,
            }
          : m
      ),
    })),

  clearDraft: () => {
    get().draftMedia.forEach((m) => {
      if (m.audioUrl?.startsWith('blob:')) URL.revokeObjectURL(m.audioUrl)
    })
    set({ draftMedia: [], ownerName: '' })
  },

  generate: async () => {
    const { draftMedia, ownerName } = get()
    if (draftMedia.length === 0) return undefined

    try {
      set({ loading: true })

      const pages: BookPage[] = []
      for (let i = 0; i < draftMedia.length; i++) {
        const media = draftMedia[i]
        const uploaded = await uploadDraftMedia(media)
        const text = buildPageText(media.story, i, media.needStory)

        pages.push({
          id: crypto.randomUUID(),
          pageIndex: i + 1,
          mediaUrl: uploaded.url,
          mediaType: media.type,
          thumbnailUrl: uploaded.thumbnail,
          audioUrl: uploaded.audioUrl,
          rawStory: media.story,
          chapterTitle: text.chapterTitle,
          polishedStory: text.polishedStory,
        })
      }

      const coverImageUrl = pages[0]?.thumbnailUrl || pages[0]?.mediaUrl || ''
      const payload = buildBookPayload(ownerName, pages, coverImageUrl)
      const res = await booksApi.create(payload)
      const book = mapBook(res.data)

      draftMedia.forEach((m) => {
        if (m.audioUrl?.startsWith('blob:')) URL.revokeObjectURL(m.audioUrl)
      })

      set((s) => ({
        books: [book, ...s.books.filter((item) => item.id !== book.id)],
        activeBookId: book.id,
        activePage: 0,
        draftMedia: [],
        ownerName: '',
        loading: false,
      }))
      return book
    } catch (err) {
      console.error('生成书籍失败:', err)
      get().showToast(err instanceof Error ? err.message : '生成失败，请重试。')
      set({ loading: false })
      return undefined
    }
  },

  openBook: (id) => set({ activeBookId: id, activePage: 0 }),
  loadSharedBook: async (slug) => {
    const local = get().books.find((item) => item.shareSlug === slug)
    if (local) {
      set({ activeBookId: local.id, activePage: 0 })
      return true
    }

    try {
      const res = await booksApi.getBySlug(slug)
      const book = mapBook(res.data)
      set((s) => ({
        books: [book, ...s.books.filter((item) => item.id !== book.id)],
        activeBookId: book.id,
        activePage: 0,
      }))
      return true
    } catch (err) {
      console.error('加载分享书籍失败:', err)
      return false
    }
  },
  setActivePage: (page) => set({ activePage: page }),

  showToast: (msg) => {
    set({ toast: msg })
    setTimeout(() => set({ toast: '' }), TOAST_DURATION)
  },

  deleteBook: async (id) => {
    let synced = true
    try {
      await booksApi.delete(id)
    } catch (err) {
      console.error('云端删除失败:', err)
      synced = false
    }

    set((s) => ({
      books: s.books.filter((b) => b.id !== id),
      activeBookId: s.activeBookId === id ? null : s.activeBookId,
    }))
    get().showToast(synced ? '藏品已删除' : '已从本机删除，云端同步失败')
  },

  loadBooks: async () => {
    try {
      set({ loading: true })
      const res = await booksApi.list(1, 50)
      set({ books: res.data.map(mapBook), loading: false })
    } catch (err) {
      console.error('加载云端书籍失败:', err)
      try {
        const stored = localStorage.getItem('oldtime-books')
        set({ books: stored ? JSON.parse(stored) : [], loading: false })
      } catch {
        set({ loading: false })
      }
    }
  },

  setBooks: (books) =>
    set((s) => {
      if (!s.activeBookId) return { books }
      const active = s.books.find((book) => book.id === s.activeBookId)
      if (!active || books.some((book) => book.id === active.id)) return { books }
      return { books: [active, ...books] }
    }),

  setSharedBook: (book) =>
    set((s) => ({
      books: [book, ...s.books.filter((item) => item.id !== book.id)],
      activeBookId: book.id,
      activePage: 0,
    })),

  getActiveBook: () => {
    const { books, activeBookId } = get()
    return books.find((b) => b.id === activeBookId)
  },
}))

// 保存到 localStorage
useStore.subscribe((state) => {
  try {
    localStorage.setItem('oldtime-books', JSON.stringify(state.books))
  } catch (err) {
    console.error('本地缓存失败:', err)
  }
})

// 处理图片
async function processImage(file: File): Promise<DraftMedia> {
  const compressed = await compressImage(file, 1200, 0.8)
  return {
    id: crypto.randomUUID(),
    type: 'image',
    dataUrl: await fileToDataUrl(compressed),
    file: compressed,
    story: '',
    needStory: true,
  }
}

// 处理视频
async function processVideo(file: File): Promise<DraftMedia> {
  const id = crypto.randomUUID()
  const thumbnail = await generateVideoThumbnail(file)

  return {
    id,
    type: 'video',
    dataUrl: URL.createObjectURL(file),
    thumbnailUrl: thumbnail,
    file,
    thumbnailFile: await dataUrlToFile(thumbnail, `${id}-thumb.jpg`),
    story: '',
    needStory: true,
    duration: await getVideoDuration(file),
  }
}

// 生成视频封面
function generateVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true

    video.onloadeddata = () => {
      video.currentTime = 1 // 取第1秒的帧
    }

    video.onseeked = () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(video, 0, 0)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
      URL.revokeObjectURL(video.src)
    }

    video.onerror = () => reject(new Error('视频加载失败'))
    video.src = URL.createObjectURL(file)
  })
}

// 获取视频时长
function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'

    video.onloadedmetadata = () => {
      resolve(video.duration)
      URL.revokeObjectURL(video.src)
    }

    video.onerror = () => reject(new Error('无法读取视频时长'))
    video.src = URL.createObjectURL(file)
  })
}

// 压缩图片
function compressImage(file: File, maxWidth: number, quality: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      canvas.width = width
      canvas.height = height
      ctx?.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg' }))
          else reject(new Error('压缩失败'))
        },
        'image/jpeg',
        quality
      )
    }
    img.onerror = () => reject(new Error('图片加载失败'))
    img.src = URL.createObjectURL(file)
  })
}

// 转 DataURL
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  return new File([blob], filename, { type: blob.type || 'image/jpeg' })
}
