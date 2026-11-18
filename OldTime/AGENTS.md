# OldTime Mobile App

Expo SDK 56, React Native 0.85, React 19.2.3, TypeScript 6.

## Commands

```bash
npx expo start          # Dev server
npx expo start --web    # Web preview (needs react-dom, react-native-web)
```

## Key Rules

- Read https://docs.expo.dev/versions/v56.0.0/ before writing code — Expo APIs change between SDK versions.
- `react-native-reanimated/plugin` must be LAST in `babel.config.js` plugins.
- Zustand store in `src/store/useAppStore.ts` — single store, same shape as web but NOT shared code.
- Navigation: `@react-navigation/native-stack` + `@react-navigation/bottom-tabs`.
- Media: `expo-image-picker`, `expo-image-manipulator`, `expo-video-thumbnails`.
- All UI text in Chinese. Large touch targets (48px min). Serif fonts.
