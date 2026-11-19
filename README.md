# 旧时光 · OldTime

> 开发中。目录、功能和文档还会调整，现在不是最终形态。

面向 60+ 老人的数字纪念册 Web 应用：把照片和老人亲口讲述的故事，变成一本可翻阅、可聆听、可分享、可打印的纪念册。

## 目录

```
oldtime-web/    Web 应用（React + Vite + Express + SQLite）
design/         视觉设计稿与设计规范
docs/           产品目标、原始方案、技术现状
AGENTS.md       工程约定
```

## 快速开始

```bash
cd oldtime-web
npm install

# 终端 1：前端
npm run dev

# 终端 2：后端
npm run server

# API 测试
npm test

# 旧书归属到指定 owner
npm run db:claim-legacy -- <owner-uuid>

# 清理 7 天前未绑定的上传资产
npm run assets:cleanup -- --days=7

# 彻底清理回收站书籍（默认 30 天）和过期未绑定资产（默认 7 天）
npm run maintenance -- --book-days=30 --asset-days=7
```

前端 http://localhost:5173 ，API http://localhost:3001 。

## 文档

- [产品目标：最终要做成什么](docs/WEB_STRATEGY.md)
- [原始产品方案](docs/PRODUCT.md)
- [技术现状与路线](docs/ENGINEERING.md)
- [视觉设计规范](design/VISUAL.md)
- [工程约定](AGENTS.md)

## 技术栈

- 前端：React 19、Vite 8、TypeScript 6、Tailwind CSS 3、Zustand 5、TanStack Query 5、React Router 7、Framer Motion
- 后端：Express 5、better-sqlite3、Sharp、Multer、Zod
- 存储：SQLite + 版本化迁移 + `assets` 资产表 + 本地文件（`server/data`、`server/uploads`）
- CI：GitHub Actions（`.github/workflows/ci.yml`）跑 lint、test、build

## 当前状态

开发中。当前实现状态、已知问题和差距统一见 [docs/ENGINEERING.md](docs/ENGINEERING.md)。
