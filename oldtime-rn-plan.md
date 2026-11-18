# 旧时光 React Native 重写计划

## 一、项目概述

**目标**：将现有 Web 应用重写为 React Native 原生 APP，支持 iOS + Android
**技术栈**：React Native CLI + TypeScript + React Navigation + Zustand + React Native Reanimated
**后端**：Node.js + Express + SQLite + Sharp（复用现有服务端代码）

---

## 二、React Native 项目结构

```
OldTime/
├── android/                          # Android 原生代码
├── ios/                              # iOS 原生代码
├── src/
│   ├── app.json                      # 应用配置
│   ├── App.tsx                       # 应用入口
│   │
│   ├── navigation/                   # 导航配置
│   │   ├── RootNavigator.tsx         # 根导航器
│   │   ├── MainTabNavigator.tsx      # 底部标签导航
│   │   └── types.ts                  # 导航类型定义
│   │
│   ├── screens/                      # 页面组件
│   │   ├── SplashScreen.tsx          # 启动页
│   │   ├── HomeScreen.tsx            # 首页/收藏馆
│   │   ├── CreateScreen.tsx          # 挑选藏品
│   │   ├── StoriesScreen.tsx         # 讲述故事
│   │   ├── GeneratingScreen.tsx      # 生成中
│   │   ├── ReaderScreen.tsx          # 翻阅藏品
│   │   ├── ShareScreen.tsx           # 分享
│   │   └── CollaborateScreen.tsx     # 协作编辑
│   │
│   ├── components/                   # 可复用组件
│   │   ├── layout/
│   │   │   ├── ScreenContainer.tsx   # 页面容器
│   │   │   ├── Header.tsx            # 顶部导航栏
│   │   │   └── BottomNav.tsx         # 底部导航栏
│   │   │
│   │   ├── ui/
│   │   │   ├── Button.tsx            # 按钮
│   │   │   ├── Card.tsx              # 卡片
│   │   │   ├── Modal.tsx             # 弹窗
│   │   │   ├── ConfirmDialog.tsx     # 确认对话框
│   │   │   ├── Toast.tsx             # 轻提示
│   │   │   ├── EmptyState.tsx        # 空状态
│   │   │   ├── ErrorState.tsx        # 错误状态
│   │   │   ├── LoadingSpinner.tsx    # 加载动画
│   │   │   └── Skeleton.tsx          # 骨架屏
│   │   │
│   │   ├── media/
│   │   │   ├── MediaPicker.tsx       # 媒体选择器
│   │   │   ├── MediaGrid.tsx         # 媒体网格
│   │   │   ├── MediaCard.tsx         # 媒体卡片
│   │   │   ├── VideoPlayer.tsx       # 视频播放器
│   │   │   └── ImageViewer.tsx       # 图片查看器
│   │   │
│   │   ├── book/
│   │   │   ├── BookCard.tsx          # 书籍卡片
│   │   │   ├── BookList.tsx          # 书籍列表
│   │   │   ├── BookReader.tsx        # 书籍阅读器
│   │   │   ├── PageIndicator.tsx     # 页码指示器
│   │   │   └── CertificatePage.tsx   # 收藏证书
│   │   │
│   │   └── collaboration/
│   │       ├── HelpModal.tsx         # 帮助弹窗
│   │       ├── ChildList.tsx         # 孩子列表
│   │       └── StoryEditor.tsx       # 故事编辑器
│   │
│   ├── store/                        # 状态管理
│   │   ├── useAppStore.ts            # 应用状态（Zustand）
│   │   ├── useBookStore.ts           # 书籍状态
│   │   └── useDraftStore.ts          # 草稿状态
│   │
│   ├── services/                     # 服务层
│   │   ├── api.ts                    # API 客户端
│   │   ├── storage.ts                # 本地存储（MMKV）
│   │   ├── media.ts                  # 媒体处理服务
│   │   └── notification.ts           # 通知服务
│   │
│   ├── lib/                          # 工具库
│   │   ├── constants.ts              # 常量配置
│   │   ├── generator.ts              # 书籍生成器
│   │   ├── utils.ts                  # 工具函数
│   │   └── theme.ts                  # 主题配置
│   │
│   ├── hooks/                        # 自定义 Hooks
│   │   ├── useGreeting.ts            # 时间问候
│   │   ├── useMediaPicker.ts         # 媒体选择
│   │   ├── useImageCompress.ts       # 图片压缩
│   │   └── useVideoThumbnail.ts      # 视频封面
│   │
│   ├── types/                        # TypeScript 类型
│   │   ├── index.ts                  # 核心类型
│   │   ├── navigation.ts             # 导航类型
│   │   └── api.ts                    # API 类型
│   │
│   └── assets/                       # 静态资源
│       ├── fonts/                    # 字体文件
│       ├── images/                   # 图片资源
│       └── animations/               # Lottie 动画
│
├── package.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js
└── .env                              # 环境变量
```

---

## 三、核心技术方案

### 3.1 导航方案

使用 **React Navigation 6** 实现：

```typescript
// navigation/RootNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// 栈导航
const Stack = createNativeStackNavigator();
// 底部标签
const Tab = createBottomTabNavigator();

// 主标签导航
function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Collection" component={CollectionScreen} />
      <Tab.Screen name="Help" component={HelpScreen} />
    </Tab.Navigator>
  );
}

// 根导航
export function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Create" component={CreateScreen} />
      <Stack.Screen name="Stories" component={StoriesScreen} />
      <Stack.Screen name="Generating" component={GeneratingScreen} />
      <Stack.Screen name="Reader" component={ReaderScreen} />
      <Stack.Screen name="Share" component={ShareScreen} />
      <Stack.Screen name="Collaborate" component={CollaborateScreen} />
    </Stack.Navigator>
  );
}
```

### 3.2 状态管理

使用 **Zustand** + **MMKV** 持久化：

```typescript
// store/useBookStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../services/storage';

interface BookStore {
  books: Book[];
  addBook: (book: Book) => void;
  removeBook: (id: string) => void;
  getBook: (id: string) => Book | undefined;
}

export const useBookStore = create<BookStore>()(
  persist(
    (set, get) => ({
      books: [],
      addBook: (book) => set((s) => ({ books: [book, ...s.books] })),
      removeBook: (id) => set((s) => ({ books: s.books.filter(b => b.id !== id) })),
      getBook: (id) => get().books.find(b => b.id === id),
    }),
    {
      name: 'oldtime-books',
      storage: createJSONStorage(() => storage),
    }
  )
);
```

### 3.3 媒体处理

#### 图片选择 + 压缩
```typescript
// hooks/useMediaPicker.ts
import { launchImageLibrary } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';

export function useMediaPicker() {
  const pickImages = async () => {
    const result = await launchImageLibrary({
      mediaType: 'mixed',
      selectionLimit: 200,
      quality: 1,
    });

    if (result.assets) {
      const processed = await Promise.all(
        result.assets.map(async (asset) => {
          if (asset.type?.startsWith('video/')) {
            return processVideo(asset);
          } else {
            return compressImage(asset);
          }
        })
      );
      return processed;
    }
    return [];
  };

  const compressImage = async (asset: any) => {
    const resized = await ImageResizer.createResizedImage(
      asset.uri,
      1200, // maxWidth
      1200, // maxHeight
      'JPEG',
      85, // quality
      0, // rotation
      undefined, // outputPath
      false, // keepMeta
    );
    return {
      id: generateUUID(),
      type: 'image' as const,
      uri: resized.uri,
      width: resized.width,
      height: resized.height,
    };
  };

  return { pickImages };
}
```

#### 视频封面生成
```typescript
// hooks/useVideoThumbnail.ts
import { createThumbnail } from 'react-native-create-thumbnail';

export function useVideoThumbnail() {
  const generateThumbnail = async (videoUri: string) => {
    const thumbnail = await createThumbnail({
      url: videoUri,
      timeStamp: 1000, // 1秒
      format: 'jpeg',
      quality: 0.8,
    });
    return thumbnail.path;
  };

  return { generateThumbnail };
}
```

### 3.4 动画方案

使用 **React Native Reanimated 3**：

```typescript
// components/book/BookReader.tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

// 翻页动画
const pageTransition = useAnimatedStyle(() => {
  return {
    transform: [
      {
        translateX: withSpring(offset.value, {
          damping: 20,
          stiffness: 90,
        }),
      },
      {
        rotateY: `${interpolate(
          offset.value,
          [-width, 0, width],
          [30, 0, -30]
        )}deg`,
      },
    ],
  };
});
```

### 3.5 样式方案

使用 **StyleSheet** + **主题常量**：

```typescript
// lib/theme.ts
export const colors = {
  primary: '#8B4513',
  primaryLight: '#A0522D',
  primaryDark: '#6C2F00',
  accent: '#D4AF37',
  gold: '#D4AF37',
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  bgPage: '#F5F5F5',
  bgCard: '#FFFFFF',
  border: '#E8E8E8',
  success: '#52C41A',
  error: '#FF4D4F',
  info: '#1890FF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#2D2318',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#2D2318',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#2D2318',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;
```

---

## 四、后端 API 架构

### 4.1 技术栈

- **运行时**：Node.js 18+
- **框架**：Express 5
- **数据库**：SQLite (better-sqlite3)
- **图片处理**：Sharp
- **文件上传**：Multer
- **认证**：JWT（可选）

### 4.2 API 端点设计

#### 用户相关
```
POST   /api/auth/register      # 注册
POST   /api/auth/login         # 登录
GET    /api/auth/profile       # 获取用户信息
```

#### 书籍相关
```
GET    /api/books              # 获取书籍列表
GET    /api/books/:id          # 获取单本书籍
GET    /api/books/slug/:slug   # 通过分享链接获取
POST   /api/books              # 创建新书
PATCH  /api/books/:id          # 更新书籍
DELETE /api/books/:id          # 删除书籍
```

#### 媒体上传
```
POST   /api/upload             # 上传单个文件
POST   /api/upload/batch       # 批量上传（最多6个）
```

#### 协作草稿
```
POST   /api/drafts             # 创建协作草稿
GET    /api/drafts/:id         # 获取草稿
PUT    /api/drafts/:id/photos/:photoId  # 更新故事
POST   /api/drafts/:id/complete         # 完成并生成书籍
DELETE /api/drafts/:id         # 删除草稿
```

#### 孩子联系人
```
GET    /api/children           # 获取孩子列表
POST   /api/children           # 添加孩子
DELETE /api/children/:id       # 删除孩子
```

### 4.3 数据库结构

```sql
-- 用户表
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE,
  avatar TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 书籍表
CREATE TABLE books (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  theme TEXT DEFAULT 'years_gold',
  cover_image_url TEXT,
  archive_no TEXT UNIQUE NOT NULL,
  owner_name TEXT NOT NULL,
  certificate_text TEXT,
  share_slug TEXT UNIQUE,
  page_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 页面表
CREATE TABLE pages (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  page_index INTEGER NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL,
  thumbnail_url TEXT,
  raw_story TEXT,
  chapter_title TEXT,
  polished_story TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- 协作草稿表
CREATE TABLE drafts (
  id TEXT PRIMARY KEY,
  owner_id TEXT,
  owner_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 草稿照片表
CREATE TABLE draft_photos (
  id TEXT PRIMARY KEY,
  draft_id TEXT NOT NULL,
  photo_index INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  story TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (draft_id) REFERENCES drafts(id) ON DELETE CASCADE
);

-- 孩子联系人表
CREATE TABLE children (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX idx_books_owner ON books(owner_id);
CREATE INDEX idx_books_share_slug ON books(share_slug);
CREATE INDEX idx_pages_book ON pages(book_id);
CREATE INDEX idx_drafts_owner ON drafts(owner_id);
CREATE INDEX idx_draft_photos_draft ON draft_photos(draft_id);
CREATE INDEX idx_children_parent ON children(parent_id);
```

### 4.4 图片处理流程

```javascript
// 上传处理
async function processUpload(file) {
  // 1. 生成唯一文件名
  const filename = `${uuid()}.jpg`;
  
  // 2. 原图处理（限制2000px，JPEG 85%）
  const original = await sharp(file.buffer)
    .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85, progressive: true })
    .toFile(`uploads/original/${filename}`);
  
  // 3. 缩略图（400x400 裁剪，WebP 75%）
  const thumbnail = await sharp(file.buffer)
    .resize(400, 400, { fit: 'cover' })
    .webp({ quality: 75 })
    .toFile(`uploads/thumbnail/${filename}`);
  
  // 4. 返回URL
  return {
    url: `/uploads/original/${filename}`,
    thumbnail: `/uploads/thumbnail/${filename}`,
  };
}
```

---

## 五、实施计划

### 阶段一：项目初始化（2天）

1. **创建 React Native 项目**
   ```bash
   npx react-native init OldTime --template react-native-template-typescript
   ```

2. **安装核心依赖**
   ```bash
   # 导航
   npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
   npm install react-native-screens react-native-safe-area-context
   
   # 状态管理
   npm install zustand
   
   # 本地存储
   npm install react-native-mmkv
   
   # 媒体处理
   npm install react-native-image-picker
   npm install react-native-image-resizer
   npm install react-native-create-thumbnail
   npm install react-native-video
   
   # 动画
   npm install react-native-reanimated
   npm install react-native-gesture-handler
   
   # UI 组件
   npm install react-native-linear-gradient
   npm install react-native-svg
   
   # 工具
   npm install uuid
   npm install @react-native-clipboard/clipboard
   ```

3. **配置开发环境**
   - 配置 TypeScript
   - 配置 Babel（Reanimated 插件）
   - 配置 Metro
   - 配置环境变量

### 阶段二：核心功能开发（5天）

1. **导航系统**
   - 实现 RootNavigator
   - 实现 MainTabNavigator
   - 配置 Deep Linking

2. **状态管理**
   - 实现 useAppStore
   - 实现 useBookStore
   - 实现 useDraftStore
   - 配置 MMKV 持久化

3. **UI 组件库**
   - Button, Card, Modal
   - Toast, ConfirmDialog
   - EmptyState, ErrorState
   - Skeleton, LoadingSpinner

4. **媒体处理**
   - 实现 useMediaPicker
   - 实现 useImageCompress
   - 实现 useVideoThumbnail

### 阶段三：页面开发（7天）

1. **HomeScreen** - 首页/收藏馆
2. **CreateScreen** - 挑选藏品
3. **StoriesScreen** - 讲述故事
4. **GeneratingScreen** - 生成中动画
5. **ReaderScreen** - 翻阅藏品
6. **ShareScreen** - 分享
7. **CollaborateScreen** - 协作编辑

### 阶段四：后端开发（3天）

1. **初始化 Express 项目**
2. **数据库初始化**
3. **实现 API 路由**
4. **图片上传和处理**
5. **部署到云服务器**

### 阶段五：测试和优化（3天）

1. **功能测试**
2. **性能优化**
3. **适配不同屏幕尺寸**
4. **修复 Bug**

### 阶段六：发布（2天）

1. **生成签名**
2. **打包 APK/IPA**
3. **提交应用商店审核**

---

## 六、云服务器申请

### 学生免费云服务器

1. **阿里云学生机**
   - 网址：https://developer.aliyun.com/plan/student
   - 配置：2核2G，1M带宽
   - 时长：免费3个月

2. **腾讯云学生机**
   - 网址：https://cloud.tencent.com/act/campus
   - 配置：2核2G，1M带宽
   - 时长：免费3个月

3. **华为云学生机**
   - 网址：https://activity.huaweicampus.com/
   - 配置：2核2G，1M带宽
   - 时长：免费3个月

### 申请步骤（以阿里云为例）

1. 注册阿里云账号
2. 完成学生认证（需要学生证或学信网验证）
3. 进入学生专区
4. 选择"云服务器ECS"
5. 选择配置（2核2G足够）
6. 选择操作系统（推荐 Ubuntu 22.04）
7. 创建实例
8. 获取公网IP和登录密码

### 服务器配置

```bash
# SSH 登录
ssh root@your-server-ip

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
npm install -g pm2

# 上传代码
scp -r ./server root@your-server-ip:/opt/oldtime

# 启动服务
cd /opt/oldtime
npm install
pm2 start index.js --name oldtime-api

# 配置 Nginx 反向代理
sudo apt install nginx
sudo nano /etc/nginx/sites-available/oldtime
```

### Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /opt/oldtime/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 七、依赖清单

### React Native 依赖

```json
{
  "dependencies": {
    "@react-native-clipboard/clipboard": "^1.14.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/native-stack": "^6.9.0",
    "react": "18.2.0",
    "react-native": "0.72.0",
    "react-native-gesture-handler": "^2.12.0",
    "react-native-image-picker": "^5.6.0",
    "react-native-image-resizer": "^1.4.5",
    "react-native-linear-gradient": "^2.8.0",
    "react-native-mmkv": "^2.10.0",
    "react-native-reanimated": "^3.3.0",
    "react-native-safe-area-context": "^4.6.0",
    "react-native-screens": "^3.22.0",
    "react-native-svg": "^13.9.0",
    "react-native-video": "^5.2.1",
    "uuid": "^9.0.0",
    "zustand": "^4.4.0"
  }
}
```

### 服务端依赖

```json
{
  "dependencies": {
    "better-sqlite3": "^9.0.0",
    "cors": "^2.8.5",
    "express": "^4.18.0",
    "jsonwebtoken": "^9.0.0",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.32.0",
    "uuid": "^9.0.0"
  }
}
```

---

## 八、预计时间

| 阶段 | 时间 | 说明 |
|------|------|------|
| 项目初始化 | 2天 | 创建项目、安装依赖、配置环境 |
| 核心功能 | 5天 | 导航、状态管理、UI组件、媒体处理 |
| 页面开发 | 7天 | 7个主要页面 |
| 后端开发 | 3天 | API、数据库、图片处理 |
| 测试优化 | 3天 | 功能测试、性能优化 |
| 发布上线 | 2天 | 打包、提交审核 |
| **总计** | **22天** | |

---

## 九、风险和注意事项

1. **图片处理性能**
   - React Native 中图片压缩不如 Web Canvas 高效
   - 建议使用原生模块 `react-native-image-resizer`

2. **视频处理**
   - 视频封面生成需要原生支持
   - 建议使用 `react-native-create-thumbnail`

3. **大量图片选择**
   - 选择200张图片可能需要较长时间
   - 建议分批处理，显示进度

4. **存储空间**
   - 200张图片 + 10个视频可能占用大量本地存储
   - 建议及时上传到服务器，本地只保留缩略图

5. **iOS 审核**
   - 需要说明为什么需要访问相册
   - 需要隐私政策页面

---

## 十、下一步行动

1. 确认计划
2. 申请云服务器
3. 开始实施阶段一
