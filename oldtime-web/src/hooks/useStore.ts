import { create } from 'zustand'
import type { Book, DraftMedia } from '../types'
import { generateBook } from '../lib/generator'
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
  clearDraft: () => void
  generate: () => Promise<Book | undefined>
  openBook: (id: string) => void
  openBookBySlug: (slug: string) => boolean
  setActivePage: (page: number) => void
  showToast: (msg: string) => void
  deleteBook: (id: string) => Promise<void>
  loadBooks: () => Promise<void>
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

  removeMedia: (id) =>
    set((s) => ({
      draftMedia: s.draftMedia.filter((m) => m.id !== id),
    })),

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

  clearDraft: () => set({ draftMedia: [], ownerName: '' }),

  generate: async () => {
    try {
      const { draftMedia, ownerName, books } = get()
      if (draftMedia.length === 0) return undefined

      set({ loading: true })
      const book = generateBook(ownerName, draftMedia, books.length + 1)

      set((s) => ({
        books: [book, ...s.books],
        activeBookId: book.id,
        activePage: 0,
        draftMedia: [],
        ownerName: '',
        loading: false,
      }))
      return book
    } catch (err) {
      console.error('生成书籍失败:', err)
      get().showToast('生成失败，请重试。')
      set({ loading: false })
    }
  },

  openBook: (id) => set({ activeBookId: id, activePage: 0 }),
  openBookBySlug: (slug) => {
    const book = get().books.find((item) => item.shareSlug === slug)
    if (!book) return false
    set({ activeBookId: book.id, activePage: 0 })
    return true
  },
  setActivePage: (page) => set({ activePage: page }),

  showToast: (msg) => {
    set({ toast: msg })
    setTimeout(() => set({ toast: '' }), TOAST_DURATION)
  },

  deleteBook: async (id) => {
    try {
      set((s) => ({
        books: s.books.filter((b) => b.id !== id),
        activeBookId: s.activeBookId === id ? null : s.activeBookId,
      }))
      get().showToast('藏品已删除')
    } catch (err) {
      console.error('删除失败:', err)
      get().showToast('删除失败，请重试。')
    }
  },

  loadBooks: async () => {
    try {
      set({ loading: true })
      const stored = localStorage.getItem('oldtime-books')
      if (stored) {
        set({ books: JSON.parse(stored), loading: false })
      } else {
        set({ loading: false })
      }
    } catch (err) {
      console.error('加载书籍失败:', err)
      set({ loading: false })
    }
  },

  getActiveBook: () => {
    const { books, activeBookId } = get()
    return books.find((b) => b.id === activeBookId)
  },
}))

// 保存到 localStorage
useStore.subscribe((state) => {
  localStorage.setItem('oldtime-books', JSON.stringify(state.books))
})

// 处理图片
async function processImage(file: File): Promise<DraftMedia> {
  const compressed = await compressImage(file, 1200, 0.8)
  return {
    id: crypto.randomUUID(),
    type: 'image',
    dataUrl: await fileToDataUrl(compressed),
    story: '',
    needStory: true,
  }
}

// 处理视频
async function processVideo(file: File): Promise<DraftMedia> {
  const dataUrl = await fileToDataUrl(file)
  const thumbnail = await generateVideoThumbnail(file)

  return {
    id: crypto.randomUUID(),
    type: 'video',
    dataUrl,
    thumbnailUrl: thumbnail,
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
