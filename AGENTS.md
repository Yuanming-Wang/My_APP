# AGENTS.md

## Project Overview

"旧时光 OldTime" — a digital memorial album app for elderly users (60+). Two separate apps in one repo.

## Repo Structure

```
oldtime-web/    # React web app (Vite + Express backend)
OldTime/        # Expo React Native mobile app
stitch_/        # UI design prototypes (HTML + screenshots, not code)
旧时光 · OldTime.md   # Product spec (Chinese)
oldtime-rn-plan.md    # RN migration plan
```

## oldtime-web (Web App)

Stack: React 19, Vite 8, TypeScript 6, Tailwind CSS 3, Zustand 5, Framer Motion
Backend: Express 5, better-sqlite3, Sharp, Multer (ESM, `"type": "module"`)

### Commands

```bash
cd oldtime-web
npm run dev      # Vite dev server on :5173 (proxies /api to :3001)
npm run build    # tsc -b && vite build
npm run lint     # eslint
npm run server   # tsx server/index.ts (Express API on :3001)
```

Run frontend AND backend together for full dev: two terminals, `npm run dev` + `npm run server`.

### Architecture

- **Routing**: Hash-based (`window.location.hash`), NOT React Router. Navigation is `useState<View>`.
- **Pages**: Lazy-loaded via `React.lazy()` in `src/App.tsx`. 7 pages: Home, Create, Stories, Generating, Reader, Share, Collaborate.
- **State**: Single Zustand store in `src/hooks/useStore.ts`. Persists books to `localStorage`.
- **API client**: `src/lib/api.ts`, base path `/api`, proxied to backend in dev.
- **Backend routes**: `server/routes/books.js`, `drafts.js`, `upload.js`. REST API documented at `GET /api`.
- **Database**: SQLite via better-sqlite3, file at `server/db.js`.
- **Image processing**: Sharp on server (resize to 2000px, JPEG 85%, thumbnails 400px WebP 75%).
- **Max-width**: 480px (mobile-first SPA). All pages wrapped in `<main className="max-w-[480px] mx-auto">`.
- **Collaboration**: Hash route `#/help/:draftId` loads `CollaboratePage` directly (no splash).
- **Skills**: `skills/oldtime-book-generator/SKILL.md` defines AI book generation spec.

### Style Conventions

- Tailwind only, no CSS modules. Custom color tokens in `tailwind.config.js` (surface, ochre, gold, parchment, etc.).
- Fonts: `"Source Serif 4"`, `"Noto Serif SC"`, `"Songti SC"` (serif stack).
- Constants in `src/lib/constants.ts` — use these, no magic numbers.
- Component naming: `pages/` for route pages, `ui/` for reusable components, `layout/` for structural.
- Animations: Framer Motion for page transitions, Tailwind keyframes for micro-interactions.

## OldTime (Mobile App)

Stack: Expo SDK 56, React Native 0.85, React 19.2.3, TypeScript 6, Zustand 5, React Navigation 7

### Commands

```bash
cd OldTime
npx expo start          # Dev server (scan QR with Expo Go)
npx expo start --web    # Web preview (needs react-dom, react-native-web)
npx expo start --android
npx expo start --ios    # macOS only
```

### Architecture

- **Navigation**: `@react-navigation/native-stack` + `@react-navigation/bottom-tabs` in `src/navigation/RootNavigator.tsx`.
- **Screens**: `src/screens/` — 9 screens (Home, Create, Stories, Generating, Reader, Share, Collaborate, Help, Collection).
- **State**: Zustand store in `src/store/useAppStore.ts`. Same shape as web but NOT shared code.
- **Media**: `expo-image-picker` for selection, `expo-image-manipulator` for compression, `expo-video-thumbnails` for video covers.
- **Storage**: `react-native-mmkv` for local persistence.
- **Entry**: `App.tsx` → `SafeAreaProvider` → `RootNavigator`.
- **Babel**: `react-native-reanimated/plugin` must be LAST plugin in `babel.config.js`.

### Expo Quirks

- Expo SDK 56 uses React Native 0.85 and React 19.2.3 — do NOT mix versions.
- `babel-preset-expo` is required (not `metro-react-native-babel-preset`).
- Web support requires `react-dom` and `react-native-web` as dependencies.
- `.claude/settings.json` enables the Expo Claude plugin (auto-generated, do not delete).

## Design Language

Museum archive aesthetic. Target users are 60+ elderly — all UI must be:
- Large touch targets (minimum 48px)
- High contrast text
- Minimal cognitive load
- Serif fonts for warmth
- Color palette: ochre `#8B4513`, gold `#D4AF37`, parchment `#fff4df`, antique `#f8f5ee`

Full spec in `旧时光 · OldTime.md`.

## Key Constraints

- Web and mobile are SEPARATE codebases, not shared. Do not assume code transfers between them.
- No test framework set up in either project. Verify changes by running the app.
- Server uploads go to `oldtime-web/uploads/` (created at runtime, gitignored).
- The `stitch_/` directory is design reference only — never edit or import from it.
- Both apps use Chinese UI strings. Keep all user-facing text in Chinese.

## Deployment (Production)

### Server

- **IP**: 47.99.121.214
- **OS**: Windows Server 2022
- **SSH**: Administrator@47.99.121.214 (key auth)
- **Backend**: `C:\oldtime\` (Express + better-sqlite3)
- **Frontend**: `C:\oldtime\dist\` (Vite build)
- **Service**: nssm service "oldtime" — auto-restarts on crash
- **Port**: 3001 (firewall open)

### Commands (on server via SSH)

```bash
# Check service status
C:\nssm\nssm-2.24\win64\nssm.exe status oldtime

# Restart service
C:\nssm\nssm-2.24\win64\nssm.exe restart oldtime

# View logs
pm2 logs oldtime --lines 50

# Check port
netstat -an | findstr 3001
```

### Mobile App (APK)

- **Expo account**: metavis-bit
- **EAS project**: @metavis-bit/OldTime
- **API endpoint**: `http://47.99.121.214:3001/api` (hardcoded in `OldTime/src/lib/api.ts`)
- **Build**: `eas build --platform android --profile preview`

### Express 5 Notes

- Route params use `{*path}` syntax, NOT `*` (breaking change from Express 4)
- Example: `app.use('/api/{*path}', handler)` and `app.get('/{*path}', handler)`
