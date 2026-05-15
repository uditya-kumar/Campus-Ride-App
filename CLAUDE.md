# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start           # Expo dev server
npm run android     # Run on Android emulator
npm run ios         # Run on iOS simulator
npm run web         # Run in browser
```

No lint, typecheck, or test scripts are configured. There is no test runner wired up — `react-test-renderer` is installed but unused.

## Architecture

**Stack:** Expo SDK 54 + React Native 0.81 + React 19 + TypeScript (strict). New Architecture (`newArchEnabled: true`) and the **React Compiler** are both on (`app.json` → `experiments.reactCompiler: true`).

### React Compiler is enabled — don't hand-memoize

The recent history (`5e6d189`, `0aa9422`) deliberately removed `useMemo`/`useCallback`/`React.memo` because the compiler handles memoization automatically. Don't add them back unless you've verified the compiler can't optimize a specific case. Prefer plain functions and values; let the compiler do its job.

### Routing (Expo Router, file-based)

Routes live in `src/app/`, not a top-level `app/`. `expo-router/entry` is the main entry (see `package.json`).

- `src/app/_layout.tsx` — root stack wraps children in `SafeAreaProvider` → `AuthProvider` → `QueryProvider` → `ThemeProvider` (React Navigation Dark/Default driven by system color scheme). `AuthProvider` is *outside* `QueryProvider` so query code can subscribe to auth state changes (e.g. clearing the cache on sign-out).
- `src/app/index.tsx` — auth gate: while `loading` shows a spinner, then redirects to `(tabs)/home` or `(auth)/signin` based on session.
- `src/app/(auth)/signin.tsx` — combined sign-in/sign-up form, calls helpers in `src/libs/auth.ts`.
- `src/app/(tabs)/_layout.tsx` — three tabs: `home`, `createRide`, `message`. Also enforces auth: redirects to signin if no session. `home` and `message` hide the header and use nested stacks inside their folders.
- `src/app/(tabs)/message/[id].tsx` — dynamic chat room route.
- **Typed routes** are enabled (`experiments.typedRoutes`), so `expo-router`'s `Href` / `Link` / `router.push` are type-checked against real route paths.

### Path aliases (tsconfig.json + `tsconfigPaths` experiment)

- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@assets/*` → `assets/*`

Use these aliases; relative `../../` imports aren't the convention here.

### Auth & data layer (Supabase + TanStack Query)

- `src/libs/supabase.ts` — Supabase client only. The `AppState`-driven `startAutoRefresh`/`stopAutoRefresh` lifecycle lives in `AuthProvider` (with cleanup), *not* here — don't re-add a module-scope `AppState.addEventListener` to this file. Env vars: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- `src/libs/auth.ts` — thin wrappers: `signIn` / `signUp` / `signOut` / `getSession`. Supabase resolves with `{ error }` rather than throwing — handle by destructuring, not `try/catch`.
- `src/providers/AuthProvider.tsx` — single subscription to `onAuthStateChange` (the source of truth for `session`); `getSession()` is awaited only to flip the initial `loading` flag, its return value is intentionally ignored to avoid racing with the subscription. Also owns the `AppState` auto-refresh wiring. Exposes `{ session, loading }` via `useAuth()`. UI that branches on auth state must read this, not call `getSession()` directly.
- `src/providers/QueryProvider.tsx` — `QueryClient` with `staleTime: 60_000`, `retry: 2`. Wires TanStack Query's `onlineManager` to `@react-native-community/netinfo` and `focusManager` to `AppState`.
- `src/api/rides.ts` — `fetchRides(filters)` and `createRide(...)` against the `rides` table. **Insert payloads use `RideInsert` (not `TablesInsert<"rides">`)**, which `Omit`s `cost_per_person` because it's a Postgres `GENERATED ALWAYS AS (total_cost / total_seats)` STORED column. Do not pass `cost_per_person` from the client — Postgres rejects writes to it.
- `src/hooks/useFilteredRides.ts` — `useQuery` wrapper around `fetchRides`. Returns `{ rides, isLoading, isError, error, refetch }` — consumers (the home screen) destructure these and branch on them rather than receiving a bare array. **No `keepPreviousData`** — filter changes intentionally show a spinner instead of a stale list.
- `src/database.types.ts` holds the Supabase-generated schema (`rides`, `bookings`, `chat_rooms`, `users`). **Saved as UTF-16** (BOM + wide chars); the Read tool output looks garbled but the file is valid — don't "fix" the encoding. Regenerate with `npx supabase gen types typescript ...` after schema changes.

Chat is still on mocks: `src/app/(tabs)/message/index.tsx` reads `assets/data/chat.ts`, `[id].tsx` reads `assets/data/chatdetailsMock.ts`. Migrating to Supabase is on the backlog.

### Date formats

Two formats coexist and conversion is centralized:

- **`DD-MM-YYYY`** — wire format used by the filter UI (`DateFilter`) and `createRide` form.
- **ISO with `+05:30` offset** — storage format in the `rides.departure_date` column.

Convert via `src/libs/datetime.ts` (`toIsoIST`, `fromIsoToDDMMYYYY`). Date-range queries in `api/rides.ts` build IST-bounded ISO strings from a `DD-MM-YYYY` filter value. Don't reach for `new Date(str)` directly on `DD-MM-YYYY` — it parses ambiguously across engines.

### Theming

Most screens read `Colors[useColorScheme() ?? "light"]` directly from `src/constants/Colors.ts`. The `Text` / `View` wrappers in `src/components/Themed.tsx` exist but are barely used — match the surrounding file's style.

### FlashList v2 gotcha

`@shopify/flash-list` 2.x enables `maintainVisibleContentPosition` **by default** (chat-app behavior). For non-chat lists where re-sorts/re-filters should land at the top, pass `maintainVisibleContentPosition={{ disabled: true }}`. The home screen's ride list does this.

## Conventions observed

- TypeScript strict mode is on across the codebase.
- The `__DEV__` guard is used for dev-only logging (see `src/app/_layout.tsx`).
- Lists that may grow (rides, chat rooms, messages) should use `@shopify/flash-list`, not `FlatList`.
- Chat UI uses `react-native-gifted-chat`.
- Icons: a mix of `@expo/vector-icons` (FontAwesome5, MaterialCommunityIcons, Octicons, AntDesign, Feather, EvilIcons) and `lucide-react-native`. Either is fine; match the file you're editing.
