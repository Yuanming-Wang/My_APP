# AGENTS.md

## Project Overview

"旧时光 OldTime" — 面向 60+ 老人的数字纪念册 Web 应用。仓库只保留 Web 端。

## Repo Structure

```
oldtime-web/    # Web 应用（React 前端 + Express 后端）
design/         # 视觉设计稿与设计规范（只读，不参与构建）
docs/           # 产品目标、原始方案、技术现状
AGENTS.md       # 工程约定
README.md       # 仓库首页（怎么跑 + 文档索引）
```

## Documentation Rules

`AGENTS.md` 是“怎么工作”的手册，不是产品文档。产品目标、当前架构、原始方案分别由 `docs/` 下的文件负责，不要往 AGENTS 里塞产品内容。

文档必须跟代码同一次改动一起更新，禁止“以后补”。同一份信息只写在一个地方，其他文档用链接引用。

| 文档 | 只负责 | 什么时候更新 |
|---|---|---|
| `README.md` | 怎么启动、目录、文档索引 | 命令、目录、依赖变化时 |
| `docs/WEB_STRATEGY.md` | 产品目标、范围、成功标准、里程碑 | 产品目标或范围变化时 |
| `docs/ENGINEERING.md` | 当前技术状态、问题、架构、技术路线 | 代码结构、技术决策、已知问题变化时 |
| `docs/PRODUCT.md` | 原始产品方案（不含视觉规范，视觉见 VISUAL.md） | 只读，不追改；新想法写进 WEB_STRATEGY |
| `design/VISUAL.md` | 视觉规范 | 视觉设计变化时 |
| `AGENTS.md` | 工程约定、命令、约束 | 约定或目录变化时 |

执行要求：

- 改代码的同一个任务里，更新受影响的文档，并在回复里说明改了哪些文档。
- 不允许同一件事在 README、web-strategy、engineering-review 里各写一遍。
- 新建文档前先说明它解决什么问题；没有明确归属就不建。
- 过期文档删除或合并，不在根目录堆历史版本。
- 代码与文档冲突时，以代码和 `AGENTS.md` 为准，并立刻修正文档。

## Definition of Done

每次任务结束前检查：

- [ ] 如果改了代码：`npm run build` / `npm run lint` 通过
- [ ] 受影响的文档已更新（见上方 Documentation Rules）
- [ ] 没有新增重复文档
- [ ] 回复里列出本次更新了哪些文档

## oldtime-web

Stack: React 19, Vite 8, TypeScript 6, Tailwind CSS 3, Zustand 5, TanStack Query 5, React Router 7, Framer Motion
Backend: Express 5, better-sqlite3, Sharp, Multer, Zod (ESM, `"type": "module"`)

### Commands

```bash
cd oldtime-web
npm install      # 安装前端 + 服务端依赖
npm run dev      # Vite dev server :5173（/api 代理到 :3001）
npm run build    # tsc -b && vite build
npm run lint     # eslint
npm run server   # node server/index.js（Express API :3001）
npm test         # Node test runner（server/tests/api.test.js）
npm run db:claim-legacy -- <owner-uuid>  # 把旧书归属到指定 owner
npm run assets:cleanup -- --days=7       # 清理过期未绑定资产
npm run maintenance -- --book-days=30 --asset-days=7  # 清理回收站书籍和过期未绑定资产
```

完整开发需要两个终端：`npm run dev` + `npm run server`。

### Architecture

- **Routing**: React Router 7 `HashRouter`（`main.tsx`）；`#/share/:slug` 分享阅读，`#/help/:draftId` 协作编辑；`ROUTE_PATHS` 在 `src/lib/constants.ts`。
- **Pages**: `src/components/pages/` — Home, Create, Stories, Generating, Reader, Share, Collaborate。
- **Story audio**: `src/hooks/useAudioRecorder.ts` + `src/components/story/StoryCard.tsx`；录音上传到 `/api/upload/audio`，存储在 `pages.audio_url`。
- **State**: 服务端状态用 TanStack Query（书籍列表、分享书籍）；Zustand（`src/hooks/useStore.ts`）只放草稿、activeBookId、toast；localStorage 仅作断网兜底。
- **API client**: `src/lib/api.ts`，base path `/api`。
- **Backend**: `server/index.js` 启动，`server/app.js` 创建 Express app；`routes/` 只做参数/响应，`services/` 放业务，`middleware/` 放 owner/validate。
- **Database**: `server/db.js` + `server/db/migrations.js`，SQLite 文件 `server/data/oldtime.db`（gitignore），用 `PRAGMA user_version` 做版本化迁移（当前 v4）。
- **Ownership**: `middleware/owner.js` 设置 `oldtime_owner` cookie，或读取 `X-Owner-Id`；书籍按 owner 隔离。
- **Share**: `books.share_token` 为随机 token，`share_slug` 兼容旧链接；分享读取不走 owner。
- **Drafts**: 草稿默认 7 天过期；状态为 `pending` / `completed` / `expired`，完成或过期后不能继续编辑。
- **Assets**: 上传登记到 `assets` 表；删除书籍为软删除（`books.deleted_at`），`npm run maintenance` 到期彻底删除书籍并清理资产行和文件；草稿删除只清理未绑定资产；`assets:cleanup` 只清理过期未绑定资产。
- **Validation**: `middleware/validate.js` 用 Zod 校验 books / drafts / story / 分页，统一返回 400 + `details`。
- **OpenAPI**: `GET /api/openapi.json`，契约定义在 `server/openapi.js`。
- **Uploads**: `server/uploads/`（gitignore），Sharp 压缩并生成缩略图；音频在 `server/uploads/audios/`。
- **Tests**: `server/tests/api.test.js`，`npm test` 覆盖 owner 隔离、随机分享 token、软删除与彻底清理、旧书归属、资产清理、Zod 校验、草稿成书/过期、音频上传和 OpenAPI。
- **CI**: `.github/workflows/ci.yml`，push/PR 跑 `npm ci` / `lint` / `test` / `build`。
- **PWA**: `public/manifest.json` + `public/sw.js`，目前只是安装/缓存壳。
- **Max photos**: 12（与产品方案一致）。
- **UI language**: 全部中文。

### Style Conventions

- Tailwind only；自定义色板在 `tailwind.config.js`（surface、ochre、gold、parchment 等）。
- 字体：`"Source Serif 4"`, `"Noto Serif SC"`, `"Songti SC"`。
- 常量放在 `src/lib/constants.ts`，不要写魔法数字。
- 动画：Framer Motion 做页面过渡，Tailwind keyframes 做微交互。

## Design Language

博物馆馆藏质感；目标用户 60+，UI 必须：

- 大触控区域（关键操作 ≥88px，普通控件 ≥48px）
- 高对比文字
- 低认知负担
- 宋体/衬线字体
- 色板：赭石 `#8B4513`、金 `#D4AF37`、羊皮纸 `#fff4df`、古董白 `#f8f5ee`

设计稿在 `design/`，规范见 `design/VISUAL.md`。

## Key Constraints

- 只做 Web，不新增 React Native / 移动端代码。
- 不接 AI Agent / LLM；书籍文案用 `src/lib/generator.ts` 的规则模板。
- 图片/音频必须上传到服务端，禁止以 base64 存 localStorage。
- 分享链路必须通过服务端 slug/token 加载，不能只依赖本地缓存；新书使用随机 `share_token`。
- 书籍读写必须带 owner 上下文（cookie 或 `X-Owner-Id`），不能返回其他 owner 的私有书籍。
- 上传媒体必须登记 `assets`；删除书籍为软删除，彻底删除和资产文件清理由 `npm run maintenance` 负责。
- `server/data/`、`server/uploads/`、`*.pem`、`.env` 不提交。
- Express 5 路由参数使用 `{*path}`，不是 `*`。

## Deployment (Production)

- **IP**: 47.99.121.214
- **OS**: Windows Server 2022
- **SSH**: Administrator@47.99.121.214（key auth）
- **Backend**: `C:\oldtime\`（Express + better-sqlite3）
- **Frontend**: `C:\oldtime\dist\`（Vite build）
- **Service**: nssm service "oldtime"
- **Port**: 3001

```bash
# 查看服务状态
C:\nssm\nssm-2.24\win64\nssm.exe status oldtime

# 重启服务
C:\nssm\nssm-2.24\win64\nssm.exe restart oldtime

# 查看日志
pm2 logs oldtime --lines 50

# 检查端口
netstat -an | findstr 3001
```
