const API_BASE = 'http://47.99.121.214:3001/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: '网络请求失败' }));
      throw new Error(error.error || `请求失败 (${res.status})`);
    }

    return res.json();
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查网络');
    }
    throw err;
  }
}

// 书籍 API
export const booksApi = {
  list: (page = 1, limit = 20) =>
    request<{ success: boolean; data: any[]; pagination: any }>(`/books?page=${page}&limit=${limit}`),

  get: (id: string) =>
    request<{ success: boolean; data: any }>(`/books/${id}`),

  create: (book: any) =>
    request<{ success: boolean; data: any }>('/books', {
      method: 'POST',
      body: JSON.stringify(book),
    }),

  delete: (id: string) =>
    request<{ success: boolean }>(`/books/${id}`, { method: 'DELETE' }),
};

// 上传 API
export const uploadApi = {
  single: async (file: any): Promise<{ success: boolean; data: { url: string; thumbnail: string } }> => {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: '上传失败' }));
      throw new Error(error.error || '上传失败');
    }

    return res.json();
  },

  batch: async (files: any[]): Promise<{ success: boolean; data: Array<{ url: string; thumbnail: string }> }> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    const res = await fetch(`${API_BASE}/upload/batch`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: '批量上传失败' }));
      throw new Error(error.error || '批量上传失败');
    }

    return res.json();
  },
};

// 协作草稿 API
export const draftsApi = {
  create: (ownerName: string, photos: Array<{ imageUrl: string; story: string }>) =>
    request<{ success: boolean; data: any }>('/drafts', {
      method: 'POST',
      body: JSON.stringify({ ownerName, photos }),
    }),

  get: (id: string) =>
    request<{ success: boolean; data: any }>(`/drafts/${id}`),

  updateStory: (draftId: string, photoId: string, story: string) =>
    request<{ success: boolean; data: any }>(`/drafts/${draftId}/photos/${photoId}`, {
      method: 'PUT',
      body: JSON.stringify({ story }),
    }),

  complete: (draftId: string) =>
    request<{ success: boolean; data: any }>(`/drafts/${draftId}/complete`, {
      method: 'POST',
    }),

  delete: (draftId: string) =>
    request<{ success: boolean }>(`/drafts/${draftId}`, { method: 'DELETE' }),
};
