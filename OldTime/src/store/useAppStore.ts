import { create } from 'zustand';
import { Book, Media, Theme } from '../types';
import { generateUUID, generateShareSlug, generateArchiveNo } from '../lib/utils';
import { MAX_PHOTOS, MAX_VIDEOS, TOAST_DURATION } from '../lib/constants';

interface AppState {
  books: Book[];
  draftMedia: Media[];
  ownerName: string;
  activeBookId: string | null;
  activePage: number;
  toast: string;
  loading: boolean;

  setOwnerName: (name: string) => void;
  addMedia: (media: Media[]) => void;
  removeMedia: (id: string) => void;
  updateStory: (id: string, story: string) => void;
  toggleNeedStory: (id: string) => void;
  clearDraft: () => void;
  generate: () => void;
  openBook: (id: string) => void;
  setActivePage: (page: number) => void;
  showToast: (msg: string) => void;
  deleteBook: (id: string) => void;
  loadBooks: () => void;
  getActiveBook: () => Book | undefined;
}

export const useAppStore = create<AppState>()((set, get) => ({
  books: [],
  draftMedia: [],
  ownerName: '',
  activeBookId: null,
  activePage: 0,
  toast: '',
  loading: false,

  setOwnerName: (name) => set({ ownerName: name }),

  addMedia: (media) => {
    const current = get().draftMedia;
    const imageCount = current.filter((m) => m.type === 'image').length;
    const videoCount = current.filter((m) => m.type === 'video').length;

    const newMedia: Media[] = [];

    for (const item of media) {
      if (item.type === 'video') {
        if (videoCount + newMedia.filter((m) => m.type === 'video').length >= MAX_VIDEOS) {
          get().showToast(`最多只能选择${MAX_VIDEOS}个视频`);
          continue;
        }
      } else {
        if (imageCount + newMedia.filter((m) => m.type === 'image').length >= MAX_PHOTOS) {
          get().showToast(`最多只能选择${MAX_PHOTOS}张照片`);
          continue;
        }
      }
      newMedia.push(item);
    }

    set({ draftMedia: [...current, ...newMedia] });
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

  generate: () => {
    const { draftMedia, ownerName, books } = get();
    if (draftMedia.length === 0) return;

    const book: Book = {
      id: generateUUID(),
      title: `${ownerName}的纪念册`,
      subtitle: `${draftMedia.length}张照片的故事`,
      ownerName,
      archiveNo: generateArchiveNo(books.length + 1),
      coverImageUrl: draftMedia[0]?.uri || '',
      shareSlug: generateShareSlug(),
      pages: draftMedia.map((media) => ({
        id: media.id,
        mediaUrl: media.uri,
        mediaType: media.type,
        thumbnailUrl: media.thumbnailUri,
        story: media.story,
      })),
      createdAt: new Date().toISOString(),
      theme: 'years_gold',
    };

    set((s) => ({
      books: [book, ...s.books],
      activeBookId: book.id,
      activePage: 0,
      draftMedia: [],
      ownerName: '',
    }));
  },

  openBook: (id) => set({ activeBookId: id, activePage: 0 }),
  setActivePage: (page) => set({ activePage: page }),

  showToast: (msg) => {
    set({ toast: msg });
    setTimeout(() => set({ toast: '' }), TOAST_DURATION);
  },

  deleteBook: (id) => {
    set((s) => {
      const remainingBooks = s.books.filter((b) => b.id !== id);
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');

      const reindexedBooks = remainingBooks.map((book, index) => ({
        ...book,
        archiveNo: `${year}年${month}月${day}日-${String(index + 1).padStart(3, '0')}`,
      }));

      return {
        books: reindexedBooks,
        activeBookId: s.activeBookId === id ? null : s.activeBookId,
      };
    });
    get().showToast('藏品已删除');
  },

  loadBooks: () => {
    // 在React Native中，我们使用MMKV来持久化
    // 这里暂时使用内存存储
    set({ loading: false });
  },

  getActiveBook: () => {
    const { books, activeBookId } = get();
    return books.find((b) => b.id === activeBookId);
  },
}));
