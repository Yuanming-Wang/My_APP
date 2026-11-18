// 媒体类型
export interface Media {
  id: string;
  type: 'image' | 'video';
  uri: string;
  thumbnailUri?: string;
  width?: number;
  height?: number;
  duration?: number;
  story: string;
  needStory: boolean;
}

// 书籍类型
export interface Book {
  id: string;
  title: string;
  subtitle: string;
  ownerName: string;
  archiveNo: string;
  coverImageUrl: string;
  shareSlug: string;
  pages: Page[];
  createdAt: string;
  theme: Theme;
}

// 页面类型
export interface Page {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  thumbnailUrl?: string;
  story: string;
  chapterTitle?: string;
}

// 主题类型
export type Theme = 'years_gold' | 'ocean_blue' | 'family_warmth';

// 协作草稿类型
export interface Draft {
  id: string;
  ownerName: string;
  status: 'pending' | 'completed';
  photos: DraftPhoto[];
  createdAt: string;
}

// 草稿照片类型
export interface DraftPhoto {
  id: string;
  imageUrl: string;
  story: string;
}

// 导航参数类型
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Create: undefined;
  Stories: undefined;
  Generating: undefined;
  Reader: { bookId: string };
  Share: { bookId: string };
  Collaborate: { draftId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Collection: undefined;
  Help: undefined;
};
