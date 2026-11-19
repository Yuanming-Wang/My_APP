# 旧时光 Web 技术现状与路线

> 本文回答：**现在的代码是什么样、有哪些问题、参考了谁、技术上准备怎么改。**  
> 本文以当前代码实现为准；[PRODUCT.md](PRODUCT.md) 是原始目标，不代表已经实现，差异见第 3.1 节。  
> 产品目标见 [WEB_STRATEGY.md](WEB_STRATEGY.md)。

---

## 1. 当前结构

```
D:\My_APP
├── oldtime-web/                 Web 主应用（唯一开发的端）
│   ├── src/                     React 前端，约 2000 行
│   │   ├── components/pages/    9 个页面文件（含 Icons 和未使用的 BookList）
│   │   ├── components/story/    StoryCard（录音 + 文字）
│   │   ├── components/ui/       Button、Card、Modal、Toast 等
│   │   ├── hooks/useStore.ts    Zustand 单一 store
│   │   ├── hooks/useAudioRecorder.ts  MediaRecorder 录音
│   │   ├── lib/                 API、生成器、映射、上传
│   │   └── types/
│   ├── server/                  Express API
│   │   ├── index.js             启动 HTTP/HTTPS
│   │   ├── app.js               Express app、CORS、静态、错误处理
│   │   ├── db.js                SQLite 连接 + 迁移入口
│   │   ├── db/migrations.js     版本化迁移（user_version）
│   │   ├── routes/              books、drafts、upload（薄路由）
│   │   ├── services/            books、drafts、assets
│   │   ├── middleware/          owner、validate（Zod）
│   │   ├── lib/                 paths、HttpError
│   │   ├── openapi.js           OpenAPI 3.1 契约
│   │   ├── scripts/             旧书归属、资产清理、维护脚本
│   │   └── tests/api.test.js    Node test API 测试
│   ├── public/                  PWA 壳（manifest、sw.js、图标）
│   └── package.json             前端 + 服务端依赖已合并
├── design/                      视觉设计稿与规范（只读）
├── docs/                        产品目标、原始方案、本文档
├── AGENTS.md                    Web-only 工程约定
└── README.md                    仓库首页
```

- 前端：React 19 + Vite 8 + TypeScript 6 + Tailwind 3 + Zustand 5 + TanStack Query 5 + React Router 7 + Framer Motion
- 后端：Express 5 + better-sqlite3 + Sharp + Multer + Zod
- 数据：SQLite（`server/data/oldtime.db`）+ 本地文件（`server/uploads`）+ `assets` 资产表
- 数据归属：匿名 `oldtime_owner` cookie，或 `X-Owner-Id` 请求头
- 迁移：`server/db/migrations.js` + `PRAGMA user_version`（当前 v4）
- 测试：`server/tests/api.test.js`，`npm test`（Node 内置 test runner，无新增依赖）
- CI：`.github/workflows/ci.yml`，push/PR 时跑 lint、test、build
- PWA：只有 manifest + 手写 SW，只缓存首页，还没有离线数据

## 2. 当前运行链路

```
浏览器
├── 路由：React Router HashRouter（#/home、#/share/:slug、#/help/:draftId）
├── 服务端状态：TanStack Query（书籍列表、分享书籍）
├── 客户端状态：Zustand（draftMedia、activeBookId、toast）
├── 兜底缓存：localStorage["oldtime-books"]
├── /api/upload        -> Sharp 压缩 + 缩略图 + assets 登记
├── /api/upload/audio  -> 录音文件 -> server/uploads/audios + assets 登记
├── /api/books         -> owner 隔离；books + pages -> SQLite
├── /api/drafts        -> 协作草稿 -> SQLite
└── /api/books/slug/:slug -> 随机 share_token 分享阅读
```

已验证可用：

- 选图 -> 上传 -> 生成 -> 阅读 -> 分享链接跨浏览器打开
- 录音 -> 上传 -> 阅读页原声播放（真实 WAV 已验证 `readyState=4`）
- 协作草稿创建 -> 孩子打开 `#/help/:draftId` -> 填故事 -> 完成生成书籍
- `npm run build`、`npm run lint`、`npm test` 通过
- `npm run server` 可启动，上传/建书/按 slug 查询/列表/删除已实测
- owner 隔离、随机分享 token、assets 级联清理已由 API 测试覆盖

## 3. 功能现状

| 能力 | 状态 |
|---|---|
| 选照片/视频、上传、缩略图 | 可用 |
| 文字讲故事 | 可用，只有文字输入 |
| 语音讲述 / 原声回放 | 可用；点击开始/结束，每页最多 30 秒，阅读页可播放 |
| 规则生成标题/章节/润色 | 可用（非 AI） |
| 阅读（封面/内页/证书） | 可用；页面支持图片和视频，2D 滑动 |
| 分享（按 token 从服务端加载） | 可用；随机 `share_token`，兼容旧 `share_slug` |
| 收藏馆 | 可用，TanStack Query 从服务端加载，按 owner 隔离 |
| 协作编辑 | 半成品，无实时状态、无通知；已有 7 天过期和状态机 |
| 账号/数据归属 | 匿名 owner cookie / `X-Owner-Id`；书籍按 owner 隔离；旧数据 `owner_id NULL` 兼容 |
| 媒体资产 | 上传登记 `assets`；删除书籍为软删除，维护脚本到期清理资产行和文件 |
| 软删除 | `books.deleted_at`；列表/详情/分享均过滤；`npm run maintenance` 彻底清理 |
| 草稿过期/状态机 | 7 天过期；`pending` / `completed` / `expired`；完成或过期后不能编辑 |
| 旧书归属迁移 | `POST /api/books/claim-legacy` + `npm run db:claim-legacy` |
| 孤儿资产清理 | `npm run assets:cleanup -- --days=7`；`npm run maintenance` 一并处理 |
| 请求校验 | Zod（`server/middleware/validate.js`），统一 400 + `details` |
| OpenAPI 契约 | `GET /api/openapi.json`，定义在 `server/openapi.js` |
| 数据库迁移 | 版本化迁移，`user_version = 4` |
| API 测试 | `server/tests/api.test.js`，10 组通过 |
| CI | GitHub Actions：lint + test + build |
| 离线草稿 | 缺失 |
| 真 PWA（安装/离线/分享目标/推送） | 缺失；只有壳，且 manifest 引用的 PNG 图标不存在 |
| PDF / 打印导出 | 缺失 |
| 主题 / BGM / 会员 | 缺失 |

### 3.1 与原始产品方案的差异

原始方案 [PRODUCT.md](PRODUCT.md) 是目标，不是现状。当前实现与它的关系如下：

| 原始方案 | 当前实现 | 处理 |
|---|---|---|
| 按住说话、原声回放 | 已实现录音/回放（点击开始/结束，30 秒上限） | 按住手势和转写未做 |
| AI 提取章节标题 / 润色 | `src/lib/generator.ts` 关键词规则 | 按“不接 AI”原则，保持规则生成 |
| 3D 翻页、BGM、15 秒视频 | 未实现 | 目标能力，不宣称已完成 |
| 3 套馆藏主题 | 只有 `years_gold` | 待做 |
| 每本最多 12 张照片 | `MAX_PHOTOS = 12` | 已一致 |
| 视频支持 | 支持照片/视频上传与播放，`MAX_VIDEOS = 10` | 超出原方案范围，保留 |
| 亲子协作 | 草稿 API + 协作页，无实时/通知 | 半成品 |
| 分享 | 服务端随机 token 加载，兼容旧 slug | 已实现 |
| 登录/账号 | 匿名 owner cookie；演示验证码接口已移除 | 按“无登录”处理 |
| 留言/点赞 | 未实现 | 目标能力，不宣称已完成 |
| 会员/支付/水印 | 未实现 | 后置 |
| PWA | manifest + SW 壳；PNG 图标缺失 | 先修图标，再做离线 |

结论：**产品方案和当前实现确实有差距，但不是文档错误，而是“目标 vs 现状”。** 文档已按这个边界标注：目标和现状分开，避免把未实现的能力写成已完成。

## 4. 工程问题

### P0：不先解决会阻碍后续功能

| 问题 | 现状 | 建议 |
|---|---|---|
| 没有数据归属 | 已实现：匿名 owner cookie / `X-Owner-Id`，books 按 owner 隔离；旧数据 `owner_id NULL` 兼容 | 后续迁移旧数据 |
| 分享可被猜 | 已实现：独立随机 `share_token`，旧 `share_slug` 仍可访问 | 旧链接可在迁移期后失效 |
| 服务端状态重复 | 已实现：TanStack Query 管书籍列表和分享书籍；Zustand 只保留草稿、activeBookId、toast；localStorage 只做断网兜底 | 离线草稿仍需 IndexedDB |
| 路由是手写状态 | 已实现：React Router HashRouter，保留 `#/share/:slug` 和 `#/help/:draftId` | — |
| 媒体没有资产层 | 已实现：`assets` 表 + 软删除 + `maintenance` 脚本；未接定时任务 | 接 cron / 计划任务 |
| 数据库没有迁移 | 已实现：`db/migrations.js` + `user_version`（v4） | 后续迁移必须有测试 |
| 协作缺边界 | 已实现：`drafts.owner_id`、7 天过期、`pending/completed/expired` 状态机 | 旧草稿已补 `expires_at` |

### P1：影响可维护性和体验

| 问题 | 说明 |
|---|---|
| API 契约不统一 | snake_case 直接透出；已有 OpenAPI + Zod 请求校验，响应仍是 snake_case |
| 无类型边界 | 请求边界已用 Zod；前端仍有 `any` |
| 无 E2E 测试 | API 10 组测试已补（`npm test`）；GitHub Actions 已跑 lint/test/build；没有浏览器端 E2E |
| PWA 不完整 | 只缓存 `/` 和 `/index.html` |
| PWA 图标缺失 | manifest 引用 `/icons/icon-192.png`、`/icons/icon-512.png`，实际只有 `icon-512.svg` |
| 未使用组件 | `components/pages/BookList.tsx` 没有被任何页面引用 |
| 适老化不足 | 正文字号、触控热区低于方案要求 |

## 5. 高星项目研究

检索日期：2026-11-18，star 数为约数。方法：读 `package.json` 和根目录结构，不只看描述。

| 项目 | Stars | 技术栈 / 结构 | 可借鉴 |
|---|---:|---|---|
| [TREK](https://github.com/liketrek/TREK) | 1.6 万 | React + Vite + React Router + Zustand + Tailwind + vite-plugin-pwa；Express/NestJS + SQLite/Postgres + MikroORM + Zod + WebSocket；`client/` `server/` `shared/` | 和本项目最接近：不换 Next.js 也能做现代 Web |
| [Cal.com](https://github.com/calcom/cal.com) | 5.0 万 | Next.js + TanStack Query + tRPC + Prisma + Tailwind + Radix；Turborepo `apps/*` + `packages/features/*` | 按业务功能拆模块；类型安全 API |
| [Immich](https://github.com/immich-app/immich) | 12.0 万 | SvelteKit + TanStack Query + Socket.IO；NestJS/Express + Postgres + Kysely + BullMQ + Sharp + Zod | 资产模型、缩略图、分享、队列 |
| [Actual Budget](https://github.com/actualbudget/actual) | 3.0 万 | React + Redux + TanStack Query + Vite + PWA；`packages/api` `crdt` `sync-server` `desktop-client` | 本地优先、离线、同步层 |
| [Excalidraw](https://github.com/excalidraw/excalidraw) | 13.6 万 | React + Vite + PWA + Firebase + Socket.IO；`packages/` 核心库 + `excalidraw-app/` 应用壳 | 核心与壳分离；离线与协作 |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | 12.8 万 | React + Radix + Tailwind，代码即组件 | 可定制、可访问的 UI |
| [TanStack Query](https://github.com/TanStack/query) | 5.1 万 | 服务端状态与缓存 | 替代“Zustand 存服务器数据” |

### 5.1 2025-2026 新项目补充

| 项目 | 时间 / Stars | 技术栈与结构 | 可借鉴 |
|---|---|---|---|
| [Yuvomi](https://github.com/ulsklyc/yuvomi) | 2026-03 / 2.4 千 | Express 5 + Vite 8 + TypeScript 7 + better-sqlite3 + express-session + PWA；单 SQLite 文件；`server/` 按 api/routes/authorize/db 分层；OpenAPI；大量测试脚本 | 同样用 Express + SQLite，也能做到产品级；重点在模块、迁移、测试、安全 |
| [TREK](https://github.com/liketrek/TREK) | 2026-03 / 1.6 万 | React + Vite + React Router + Zustand + vite-plugin-pwa；Express/NestJS + SQLite/Postgres + MikroORM + Zod + WebSocket；`client/` `server/` `shared/` | PWA、离线、实时协作、shared 类型 |
| [TrailSnap](https://github.com/LC044/TrailSnap) | 2025-05 / 914 | FastAPI + SQLAlchemy + Alembic + SQLite/Postgres；照片/旅行记忆相册；桌面/CLI 多端 | 媒体资产、数据库迁移、同品类产品结构 |
| [Journiv](https://github.com/journiv/journiv-app) | 2025-10 / 1.3 千 | FastAPI + SQLAlchemy + Alembic + aiosqlite；私人日记/自托管 | 单文件 SQLite + 迁移纪律 + 数据归属 |
| [Memex](https://github.com/memex-lab/memex) | 2026-03 / 843 | Flutter；本地优先；文字/照片/语音日记；数据留在本机 | 语音优先、本地优先的产品形态（AI 部分不借鉴） |

这些项目说明：**2025-2026 年仍然有高星项目使用 Express + Vite + SQLite**，当前技术选型没有过时。差距不在框架，而在工程化和产品能力。

共同规律：

1. 业务核心与应用壳分离。
2. 按功能分目录，不按文件类型分。
3. 服务端状态与客户端状态分离。
4. 媒体资产化（文件在磁盘，数据库存 asset）。
5. 本地优先 / 离线可用。
6. 类型安全的边界（tRPC/Zod/OpenAPI/shared）。
7. PWA 是产品能力，不只是 manifest。
8. 协作有明确的共享文档模型，不是只加 WebSocket。

不要照搬：Turborepo、Next.js、Postgres、Redis、微服务。TREK 证明当前技术栈足够。

### 5.2 对当前架构的判断

**技术选型够好，工程化还不够。**

够用的部分：

- React + Vite + Express 5 + SQLite + 本地文件 + Sharp，适合当前单人/小规模、低并发、单机部署。
- 2026 年的 Yuvomi、TREK 仍在用同类栈，说明不需要为了“新”去换 Next.js 或 Postgres。
- 语音、图片、音频都走服务端文件，方向正确。

已经补上的：

1. **模块边界**：后端 `routes/` 只做参数和响应，`services/` 放业务，`middleware/` 放 owner/validate，脚本在 `scripts/`。
2. **数据库迁移**：版本化迁移到 v4，测试断言 `user_version`。
3. **测试与 CI**：API 10 组测试；GitHub Actions 跑 lint/test/build。
4. **数据归属与分享安全**：owner 隔离 + 随机 `share_token`。
5. **媒体资产模型**：`assets` 表 + 软删除 + `maintenance` 脚本。
6. **服务端状态与路由**：TanStack Query + React Router。
7. **契约**：Zod 请求校验 + OpenAPI。

还不够的部分：

1. **前端目录**：仍按 pages/components 分，没有按 feature 拆分。
2. **测试深度**：没有浏览器端 E2E；PWA 只有壳，离线草稿缺失。
3. **运维**：`maintenance` 脚本还没有接 Windows 计划任务。
4. **适配老化**：页面仍有 `any`，字号和触控热区低于方案要求。

优先级：

- **P1**：离线草稿、PWA 完整化、维护任务定时化。
- **P2**：实时协作、PDF 导出、更多主题。

结论：**保留现有技术栈，把“原型架构”升级成“产品架构”**。地基（模块、迁移、测试、数据归属、资产模型、路由与查询）已经补完，接下来是离线、PWA 和协作。

## 6. 目标架构

### 前端

```
src/
├── app/                 router、providers、App
├── features/
│   ├── books/           api + hooks + components
│   ├── media/           上传、选择、音频
│   ├── reader/
│   ├── collaboration/
│   └── owner/
├── components/ui/
├── lib/                 apiClient、db(IndexedDB)、audio、share
├── styles/
└── types/
```

- React Router
- TanStack Query
- Zustand 只放 UI/草稿
- Dexie（IndexedDB）做离线草稿
- Framer Motion + View Transitions
- `vite-plugin-pwa` / Workbox
- MediaRecorder + Web Audio
- speechSynthesis（语音引导）
- 打印样式导出 PDF

### 后端

当前已落地：

```
server/
├── index.js             启动 HTTP/HTTPS
├── app.js               Express app、CORS、静态、错误处理
├── db.js                SQLite 连接 + 迁移入口
├── db/migrations.js     版本化迁移
├── routes/              books、drafts、upload（薄路由）
├── services/            books、drafts、assets
├── middleware/          owner、validate（Zod）
├── lib/                 paths、HttpError
├── openapi.js           OpenAPI 3.1 契约
├── scripts/             claim-legacy、cleanup-assets、maintenance
├── tests/api.test.js    API 测试
└── uploads/             图片、缩略图、视频、音频
```

后续再加：`realtime/`（SSE）。

### 数据模型

当前实际表：

```
users(id, name, created_at)
books(id, owner_id, title, subtitle, theme, cover_image_url, archive_no,
      owner_name, certificate_text, share_slug, share_token, created_at, deleted_at)
pages(id, book_id, page_index, image_url, media_type, thumbnail_url,
      audio_url, raw_story, chapter_title, polished_story)
drafts(id, owner_name, owner_id, status, expires_at, book_id, created_at, updated_at)
draft_photos(id, draft_id, photo_index, image_url, story)
assets(id, owner_id, book_id, kind, url, thumbnail_url,
       mime_type, size, original_name, created_at)
```

未落地：`asset_id` 外键、owner 独立表、回收站恢复接口。

### API

当前已实现：

```
POST   /api/upload
POST   /api/upload/batch
POST   /api/upload/video
POST   /api/upload/audio
POST   /api/books
GET    /api/books
GET    /api/books/:id
PATCH  /api/books/:id
DELETE /api/books/:id
GET    /api/books/slug/:slug
POST   /api/books/claim-legacy
POST   /api/drafts
GET    /api/drafts/:id
PUT    /api/drafts/:id/photos/:photoId
POST   /api/drafts/:id/complete
DELETE /api/drafts/:id
GET    /api/health
GET    /api/openapi.json
```

后续再加：`GET /api/books/:id/events`（SSE）、`POST /api/books/:id/audio`、`GET /api/share/:token`。

## 7. 技术路线

### Phase 0：地基

已完成：

- 匿名 owner + 书籍归属
- 数据库版本化迁移（v4）
- `assets` 表 + 随机分享 token
- 旧书归属迁移
- 孤儿资产清理脚本
- 草稿过期和状态机
- OpenAPI 契约
- API 测试（`npm test`，10 组）
- React Router + TanStack Query
- 软删除 + `maintenance` 脚本
- Zod 请求校验
- GitHub Actions CI

### Phase 1：创新 MVP

- 语音讲述 + 回放
- 离线草稿 + 上传队列
- PWA 安装 + 离线阅读

### Phase 2：体验

- View Transitions 翻书
- PDF 导出
- 语音引导
- 三套主题

### Phase 3：协作与上线

- SSE 协作状态
- Web Push 通知
- 部署 server + dist
- SQLite/uploads 备份
- HTTPS、日志、健康检查

## 8. 明确不做

- AI Agent / LLM / 语音转写
- React Native / 原生 App
- Next.js 重构 / Turborepo / 微服务
- Postgres / Redis / BullMQ
- 3D WebGL / 视频生成
