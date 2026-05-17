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
- `src/app/(tabs)/message/[id]/index.tsx` — chat detail (realtime). `message/[id]/info.tsx` — ride metadata + members list. The `[id]` is a folder, not a file — the chat needs `info` as a sibling, and Expo Router can't have both `[id].tsx` and `[id]/info.tsx`.
- `src/app/(tabs)/message/_layout.tsx` declares `unstable_settings.anchor: "index"` so deep links into `/message/[id]` (e.g. from a ride card's Chat button) put `index` underneath as the implicit stack root. `Link` callers should pass `withAnchor` to honor it — see `RideCard.tsx`. Without this pair, the chat-list screen disappears from the stack and the back button leaves the message tab.
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
- `src/api/rides.ts` — `fetchRides`, `fetchRide`, `fetchMyRides(userId, view)`, `fetchRideMembers`, plus thin wrappers around three Postgres RPCs: `createRide` → `create_ride` (atomic: inserts ride + creator's booking, sets `available_seats = total_seats - 1`); `joinRide` → `join_ride` (atomic insert booking + decrement seats with `FOR UPDATE` row lock); `leaveRide` → `leave_ride` (atomic delete booking + increment seats). **Multi-row writes always go through RPCs**, never client-side multi-statement sequences.
- `src/api/messages.ts` — `fetchMessages(rideId)` (with embedded sender profile via `users` join — typed as `MessageWithUser`), `sendMessage`. The `MessageWithUser` cast is needed because Supabase's TS codegen doesn't infer embedded-select shapes.
- `cost_per_person` is a Postgres `GENERATED ALWAYS AS ROUND(total_cost / total_seats, 2) STORED` column on `rides`. Read for sorting and display, **never written by the client** — none of the RPCs accept it and the column is read-only at the DB level.
- `src/hooks/useFilteredRides.ts` — home-screen list. Returns `{ rides, isLoading, isError, error, refetch }`. **No `keepPreviousData`** — filter changes show a spinner instead of stale data. `fetchRides` filters out past departures, full rides, and non-active status server-side.
- `src/hooks/useJoinRide.ts` / `useLeaveRide.ts` — mutations. On success both invalidate `["rides"]` and `["bookings"]`. The home screen reads `mutate`, `isPending`, and `variables` (in-flight ride id) from `useJoinRide` to show a per-card spinner. **`useLeaveRide` callers also `router.replace("/(tabs)/message")`** since the user just lost access to the chat they're on.
- `src/hooks/useMyBookings.ts` — `Set<string>` of the current user's `ride_id`s for O(1) lookup. **Membership is `bookings`-based for everyone** (hosts are inserted into `bookings` by `create_ride`; no creator special-case at the UI layer). When a user leaves, their messages render as "User left" — derived from absence in this Set, not stored on the message.
- `src/hooks/useMyRides.ts` — chat list, takes a `MyRidesView` ("upcoming" | "past"), filters by `departure_date` against `now()`. Sorts ascending for upcoming (soonest first), descending for past (most recent first). Cache-keyed per view so switching is instant after first fetch.
- `src/hooks/useRide.ts` / `useRideMembers.ts` — single ride detail and its current members (via `bookings ⨝ users`). Used by the chat header title and the info screen.
- `src/hooks/useChatMessages.ts` — `useQuery` + Supabase Realtime subscription on `messages` filtered to a single `ride_id`. INSERT events append to the cached list directly (no refetch). Cleanup removes the channel on unmount. **Realtime payloads omit the joined `user` field** — appended rows have `user: null` and show plain `user_id` until the next refetch backfills.
- `src/hooks/useSendMessage.ts` — mutation wrapper. **Doesn't invalidate `["messages"]`** because the realtime subscription delivers the new row back via the channel, avoiding a double round-trip.
- `src/database.types.ts` holds the Supabase-generated schema (`rides`, `bookings`, `messages`, `users`) and the `Functions` block (`create_ride`, `join_ride`, `leave_ride`). **Saved as UTF-16** (BOM + wide chars); the Read tool output looks garbled but the file is valid — don't "fix" the encoding. Regenerate with `npx supabase gen types typescript ...` after schema or function changes.

`src/components/rideComponents/ChatScreen.tsx` is **fully controlled** — `messages` is rendered straight from props with no internal `useState`. Required for realtime: incoming subscription updates flow through the cache to the prop, so any local state would shadow them.

### Date formats

Two formats coexist and conversion is centralized:

- **`DD-MM-YYYY`** — wire format used by the filter UI (`DateFilter`) and `createRide` form.
- **ISO with `+05:30` offset** — storage format in the `rides.departure_date` column.

Convert via `src/libs/datetime.ts` (`toIsoIST`, `fromIsoToDDMMYYYY`). Date-range queries in `api/rides.ts` build IST-bounded ISO strings from a `DD-MM-YYYY` filter value. Don't reach for `new Date(str)` directly on `DD-MM-YYYY` — it parses ambiguously across engines.

### Theming

Most screens read `Colors[useColorScheme() ?? "light"]` directly from `src/constants/Colors.ts`. The `Text` / `View` wrappers in `src/components/Themed.tsx` exist but are barely used — match the surrounding file's style. Two semantic colors worth knowing: `buttonBackground` (primary actions like Join Ride, Sign In, active chip fill) and `buttonBackgroundSecondary` (lighter blue used for the Chat button outline and inactive chip borders). The hardcoded `#6B7280` in `RideCard`'s `secondaryText` is the muted-gray convention used across cards — match it when styling new card content.

### Modal-based menus: outside-tap-to-close pattern

`Dropdown.tsx`, `LocationSelectorModal.tsx`, and `ActionMenu.tsx` all use the same pattern: outer `Pressable` with `onPress={onClose}` covers the screen as the backdrop, inner `Pressable` with empty `onPress={() => {}}` swallows taps so they don't propagate up. **The empty-handler is required** — without it, `Pressable` doesn't intercept touches. Any future modal UI should follow this pattern.

### FlashList v2 gotcha

`@shopify/flash-list` 2.x enables `maintainVisibleContentPosition` **by default** (chat-app behavior). For non-chat lists where re-sorts/re-filters should land at the top, pass `maintainVisibleContentPosition={{ disabled: true }}`. The home screen's ride list does this.

### Form validation conventions

`createRide.tsx` validates at three layers: (1) input clamps via `Math.min/max` (e.g. seats can't exceed `MAX_RIDE_SEATS`), (2) submit-time guards with specific Alert messages, (3) Postgres `CHECK` constraints + RPC-level checks. The duplication is intentional — input clamps prevent absurd values during typing, submit guards give user-friendly errors before the network round-trip, and DB constraints are the last line of defense. When adding new form fields, mirror this three-layer approach.

## Conventions observed

- TypeScript strict mode is on across the codebase.
- The `__DEV__` guard is used for dev-only logging (see `src/app/_layout.tsx`).
- Lists that may grow (rides, chat rooms, messages) should use `@shopify/flash-list`, not `FlatList`.
- Chat UI uses `react-native-gifted-chat`.
- Icons: a mix of `@expo/vector-icons` (FontAwesome5, MaterialCommunityIcons, Octicons, AntDesign, Feather, EvilIcons) and `lucide-react-native`. Either is fine; match the file you're editing.

## Tooling

### Supabase MCP (read-only)

`.mcp.json` registers a Supabase MCP server scoped to this project (`project_ref=zwdjjlcpyfbybjdexdji`) in **read-only** mode. Use it to inspect live schema, run `SELECT` queries, or verify constraints without leaving the editor. Writes (INSERT/UPDATE/DELETE/DDL) are blocked at the MCP boundary — schema changes still go through Supabase Studio's SQL editor, then regenerate `src/database.types.ts`.

### Skills (in `.agents/skills/`)

Project-local skills available for reference. Read the relevant `SKILL.md` before starting work in the matching area:

- `building-native-ui/` — Expo Router conventions, native tabs, animations, controls, headers, search, gradients, media. Has subtopic refs in `references/`.
- `vercel-react-native-skills/` — performance and patterns: list virtualization, memoization rules under React Compiler, animations on GPU properties, native modals, navigation, state management. Rules in `rules/*.md`; see `SKILL.md` for the priority table.
- `native-data-fetching/` — patterns for data fetching in Expo apps.
- `expo-api-routes/` — server route conventions for Expo Router.
- `upgrading-expo/` — guidance for SDK upgrades.

The skills override generic React Native advice; when in doubt about list performance, animation choice, or navigation pattern, the skill rules win.
