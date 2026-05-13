# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start           # Expo dev server
npm run android     # Run on Android emulator
npm run ios         # Run on iOS simulator
npm run web         # Run in browser
```

No lint, typecheck, or test scripts are configured. For type-checking, run `npx tsc --noEmit`. There is no test runner wired up — `react-test-renderer` is installed but unused.

## Architecture

**Stack:** Expo SDK 54 + React Native 0.81 + React 19 + TypeScript (strict). New Architecture (`newArchEnabled: true`) and the **React Compiler** are both on (`app.json` → `experiments.reactCompiler: true`).

### React Compiler is enabled — don't hand-memoize

The recent history (`5e6d189`, `0aa9422`) deliberately removed `useMemo`/`useCallback`/`React.memo` because the compiler handles memoization automatically. Don't add them back unless you've verified the compiler can't optimize a specific case. Prefer plain functions and values; let the compiler do its job.

### Routing (Expo Router, file-based)

Routes live in `src/app/`, not a top-level `app/`. `expo-router/entry` is the main entry (see `package.json`).

- `src/app/_layout.tsx` — root stack, `SafeAreaProvider` + `ThemeProvider` (React Navigation Dark/Default theme driven by system color scheme).
- `src/app/(tabs)/_layout.tsx` — three tabs: `home`, `createRide`, `message`. `home` and `message` hide the header and use nested stacks inside their folders.
- `src/app/(tabs)/message/[id].tsx` — dynamic chat room route.
- **Typed routes** are enabled (`experiments.typedRoutes`), so `expo-router`'s `Href` / `Link` / `router.push` are type-checked against real route paths.

### Path aliases (tsconfig.json + `tsconfigPaths` experiment)

- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@assets/*` → `assets/*`

Use these aliases; relative `../../` imports aren't the convention here.

### Theming

`src/components/Themed.tsx` exports `Text` / `View` wrappers and a `useThemeColor` hook that resolves colors from `src/constants/Colors.ts` based on `useColorScheme()`. Use these wrappers instead of raw `react-native` `Text`/`View` when the component needs to respond to light/dark mode.

### Data layer (Phase 1 — mock)

The app currently reads mock data from `assets/data/` (`rides.ts`, `chat.ts`, `chatdetailsMock.ts`). `src/database.types.ts` holds the Supabase-generated schema (`rides`, `bookings`, `chat_rooms`, `users`) — Phase 2 will connect a Supabase client and TanStack Query; mock data shapes already match these types so swap points are at the hook/loader boundary.

Note: `src/database.types.ts` is saved as UTF-16 (BOM + wide chars). The Read tool output looks garbled but the file is valid — don't "fix" the encoding.

### `useFilteredRides` is not actually a hook

`src/hooks/useFilteredRides.ts` is a plain pure function that filters/sorts the mock `ridesData` array. It's named with the `use` prefix but has no React state or effects. When the data source moves to Supabase/TanStack Query, this should become a real hook or a query selector.

### Date format quirk

Mock ride dates use `DD-MM-YYYY` strings (not ISO). `useFilteredRides.ts` has a local `parseDate` that splits on `-` in that order. Any new date handling on ride data needs to match this format or convert explicitly.

## Conventions observed

- TypeScript strict mode is on across the codebase.
- The `__DEV__` guard is used for dev-only logging (see `src/app/_layout.tsx`).
- Lists that may grow (rides, chat rooms, messages) should use `@shopify/flash-list`, not `FlatList`.
- Chat UI uses `react-native-gifted-chat`.
