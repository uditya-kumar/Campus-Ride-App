# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start                    # Expo dev server
npm run android              # Run on Android emulator
npm run ios                  # Run on iOS simulator
npm run web                  # Run in browser
npm run build:android:dev    # EAS dev-client build
npm run build:android:preview # EAS preview build
```

No lint, typecheck, or test scripts are configured. There is no test runner wired up — `react-test-renderer` is installed but unused.

## Architecture

**Stack:** Expo SDK 56 + React Native 0.85 + React 19.2 + TypeScript 6 (strict). The **React Compiler** is on (`app.json` → `experiments.reactCompiler: true`). New Architecture is the SDK 56 default — there is no explicit `newArchEnabled` flag in `app.json`.

### React Compiler is enabled — don't hand-memoize

The recent history (`5e6d189`, `0aa9422`) deliberately removed `useMemo`/`useCallback`/`React.memo` because the compiler handles memoization automatically. Don't add them back unless you've verified the compiler can't optimize a specific case. Prefer plain functions and values; let the compiler do its job.

### Routing (Expo Router, file-based)

Routes live in `src/app/`, not a top-level `app/`. `expo-router/entry` is the main entry (see `package.json`).

- `src/app/_layout.tsx` — root stack wraps children in `SafeAreaProvider` → `AuthProvider` → `QueryProvider` → (`UnreadRealtimeBridge` + `ThemeProvider` → `ToastProvider`). `AuthProvider` is *outside* `QueryProvider` so query code can subscribe to auth state changes (e.g. clearing the cache on sign-out). The `UnreadRealtimeBridge` is a tiny no-render component that mounts `useUnreadRealtime` — it has to live inside *both* AuthProvider and QueryProvider, hence the bridge. Root layout also owns push-notification deep-link handling: it watches `Notifications.useLastNotificationResponse` (cold start) and `addNotificationResponseReceivedListener` (warm), waiting for the user to land in `/home` or `/message` before navigating to `/(tabs)/message/[rideId]` with `withAnchor: true`.
- `src/app/index.tsx` — auth gate: while `loading` shows a spinner, then redirects to `(tabs)/home` or `(auth)/signin` based on session.
- `src/app/(auth)/signin.tsx` — Google-only sign-in screen. Calls `googleSignIn` from `src/libs/auth.ts` (Supabase OAuth + `expo-web-browser` auth session). Email/password is not wired up.
- `src/app/(onboarding)/gender.tsx` — first-run gender capture. The tab layout redirects here when `profile.gender` is null, before letting the user reach any tab.
- `src/app/(tabs)/_layout.tsx` — four tabs: `home`, `createRide`, `message`, `profile`. Enforces auth (redirect to signin if no session) AND onboarding (redirect to `/(onboarding)/gender` if `profile.gender` is null). Also subscribes to `useUnreadTotal()` to render a numeric badge on the message tab. `home`, `message`, and `profile` hide the header and use nested stacks inside their folders.
- `src/app/(tabs)/message/[id]/index.tsx` — chat detail (realtime). `message/[id]/info.tsx` — ride metadata + members list. The `[id]` is a folder, not a file — the chat needs `info` as a sibling, and Expo Router can't have both `[id].tsx` and `[id]/info.tsx`.
- `src/app/(tabs)/message/_layout.tsx` declares `unstable_settings.initialRouteName: "index"` so deep links into `/message/[id]` (e.g. from a ride card's Chat button or a notification tap) put `index` underneath as the implicit stack root. `Link`/`router.navigate` callers should pass `withAnchor: true` to honor it — see `RideCard.tsx` and `_layout.tsx`'s notification handlers. Without this pair, the chat-list screen disappears from the stack and the back button leaves the message tab.
- **Typed routes** are enabled (`experiments.typedRoutes`), so `expo-router`'s `Href` / `Link` / `router.push` are type-checked against real route paths.

### Path aliases (tsconfig.json + `tsconfigPaths` experiment)

- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@assets/*` → `assets/*`

Use these aliases; relative `../../` imports aren't the convention here.

### Auth & data layer (Supabase + TanStack Query)

- `src/libs/supabase.ts` — Supabase client only. Uses `expo-sqlite/localStorage/install` to back `auth.storage` with persistent storage. The `AppState`-driven `startAutoRefresh`/`stopAutoRefresh` lifecycle lives in `AuthProvider` (with cleanup), *not* here — don't re-add a module-scope `AppState.addEventListener` to this file. Env vars: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- `src/libs/auth.ts` — thin wrappers: `signOut`, `getSession`, and `googleSignIn` (Supabase OAuth via `expo-web-browser` auth session, `karpool://` redirect, manual `setSession` from URL fragment tokens). No email/password helpers; the UI is Google-only. Supabase resolves with `{ error }` rather than throwing for non-OAuth helpers — handle by destructuring, not `try/catch`.
- `src/libs/pushNotifications.ts` — `registerForPushNotifications(userId)`. `AuthProvider` calls this whenever `session.user.id` changes.
- `src/providers/AuthProvider.tsx` — single subscription to `onAuthStateChange` (the source of truth for `session`); `getSession()` is awaited only to flip the initial `loading` flag, its return value is intentionally ignored to avoid racing with the subscription. Also owns the `AppState` auto-refresh wiring and triggers `registerForPushNotifications` on user-id changes. Exposes `{ session, loading }` via `useAuth()`. UI that branches on auth state must read this, not call `getSession()` directly.
- `src/providers/QueryProvider.tsx` — `QueryClient` with `staleTime: 60_000`, `retry: 2`, `refetchOnReconnect: true`. Wires TanStack Query's `onlineManager` to `@react-native-community/netinfo` and `focusManager` to `AppState`.
- `src/providers/ToastProvider.tsx` — global toast via `useToast().showToast(message, durationMs?)`. Mounts `Toast` from `rideComponents/Toast.tsx` once at the root. Used for sign-in errors, join/leave outcomes, etc.
- `src/api/rides.ts` — `fetchRides`, `fetchRide`, `fetchMyChats(view)`, `fetchRideMembers`, plus thin wrappers around five Postgres RPCs: `createRide` → `create_ride` (atomic: inserts ride + creator's booking, sets `available_seats = total_seats - 1`); `joinRide` → `join_ride` (atomic insert booking + decrement seats with `FOR UPDATE` row lock); `leaveRide` → `leave_ride` (atomic delete booking + increment seats); `markRideRead` → `mark_ride_read` (zeros the per-user unread counter); `fetchMyChats` → `fetch_my_chats(p_view)` (returns `ChatRide[]` = ride row + `last_message_at` + `unread_count`). **Multi-row writes always go through RPCs**, never client-side multi-statement sequences.
- `src/api/messages.ts` — `fetchMessages(rideId)` (with embedded sender profile via `users` join — typed as `MessageWithUser`), `sendMessage`. The `MessageWithUser` cast is needed because Supabase's TS codegen doesn't infer embedded-select shapes.
- `src/api/bugReports.ts` — `submitBugReport(userId, input)`. The `bug_reports` table exists but has been added to `database.types.ts`; the cast `as never` was a stopgap that's now safe to remove next time you touch this file.
- `cost_per_person` is a Postgres `GENERATED ALWAYS AS ROUND(total_cost / total_seats, 2) STORED` column on `rides`. Read for sorting and display, **never written by the client** — none of the RPCs accept it and the column is read-only at the DB level.
- `src/hooks/useFilteredRides.ts` — home-screen list. Returns `{ rides, isLoading, isError, error, refetch }`. **`keepPreviousData` is imported but not passed** — filter changes show a spinner instead of stale data. `fetchRides` filters out past departures, full rides, and non-active status server-side.
- `src/hooks/useJoinRide.ts` / `useLeaveRide.ts` — mutations. On success both invalidate `["rides"]`, `["bookings"]`, and `["chats"]` (the chat list lives under the `chats` key, not `rides`). `useJoinRide` also drops the affected ride from the `["rides"]` cache when the RPC returns a "stale" error (ride departed, full, or inactive). The home screen reads `mutate`, `isPending`, and `variables` (in-flight ride id) from `useJoinRide` to show a per-card spinner. **`useLeaveRide` callers also `router.replace("/(tabs)/message")`** since the user just lost access to the chat they're on (see `message/[id]/index.tsx`).
- `src/hooks/useMyBookings.ts` — `Set<string>` of the current user's `ride_id`s for O(1) lookup. **Membership is `bookings`-based for everyone** (hosts are inserted into `bookings` by `create_ride`; no creator special-case at the UI layer). When a user leaves, their messages render as "User left" — derived from absence in this Set, not stored on the message.
- `src/hooks/useMyRides.ts` — chat list, takes a `MyRidesView` ("upcoming" | "past") and delegates to `fetchMyChats`. The hook is a thin `useQuery` wrapper; sorting and `last_message_at`/`unread_count` derivation happen server-side in the `fetch_my_chats` RPC. Cache key is `["chats", userId, view]`.
- `src/hooks/useUnreadTotal.ts` — sums `unread_count` across the cached upcoming chat list. Reuses the same `["chats", userId, "upcoming"]` query key as `useMyRides("upcoming")` so TanStack Query dedupes — no second fetch. Powers the message-tab badge.
- `src/hooks/useUnreadRealtime.ts` — app-wide realtime listener mounted by `UnreadRealtimeBridge` in the root layout. Every INSERT into `messages` (RLS scopes to rides the user is a member of) bumps `unread_count` and `last_message_at` on the matching `ChatRide` in every cached chat list, then re-sorts by `last_message_at`. Skips messages the current user sent themselves.
- `src/hooks/useMarkRideRead.ts` — calls the `mark_ride_read` RPC and optimistically zeros that ride's `unread_count` in every cached chat list via `setQueriesData({ queryKey: ["chats"] })`.
- `src/hooks/useRide.ts` / `useRideMembers.ts` — single ride detail and its current members (via `bookings ⨝ users`). `useRideMembers` also subscribes to a per-ride `bookings` realtime channel and invalidates both the members query and the `["rides", "detail", rideId]` row when changes arrive.
- `src/hooks/useChatMessages.ts` — `useQuery` + Supabase Realtime subscription on `messages` filtered to a single `ride_id`. The channel name includes a unique suffix (`Date.now()-random`) because `supabase.channel(name)` reuses an existing channel by name, and a fast remount can grab a still-tearing-down instance and throw on `.on()` after `.subscribe()`. INSERT events append to the cached list directly (no refetch), skipping rows already present (the sender's optimistic path may have inserted the real row already). **Realtime payloads omit the joined `user` field** — appended rows have `user: null` and show plain `user_id` until the next refetch backfills.
- `src/hooks/useSendMessage.ts` — mutation wrapper with **optimistic inserts**: `onMutate` adds a row with a `temp-...` id; `onSuccess` swaps the temp id for the real one (or removes the temp if realtime already delivered the real row); `onError` removes the temp. **Doesn't invalidate `["messages"]`** — the realtime channel handles the canonical write.
- `src/hooks/useProfile.ts` / `useUpdateProfile.ts` — profile fetch (`id, full_name, email, avatar_url, gender`) and a thin update mutation. The tab layout reads `useProfile` to gate onboarding on `gender`.
- `src/hooks/useSubmitBugReport.ts` — bug-report submission used by `(tabs)/profile/reportBug.tsx`.
- `src/database.types.ts` holds the Supabase-generated schema (`rides`, `bookings`, `messages`, `users`, `bug_reports`) — `users` includes a nullable `gender` column — and the `Functions` block (`create_ride`, `join_ride`, `leave_ride`, `fetch_my_chats`, `mark_ride_read`). **Saved as UTF-16** (BOM + wide chars); the Read tool output looks garbled but the file is valid — don't "fix" the encoding. Regenerate with `npx supabase gen types typescript ...` after schema or function changes.

`src/components/rideComponents/ChatScreen.tsx` is **fully controlled** — `messages` is rendered straight from props with no internal `useState` (the import exists but is unused; safe to delete next time you touch the file). Required for realtime: incoming subscription updates flow through the cache to the prop, so any local state would shadow them.

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
- Icons: `@react-native-vector-icons/*` (the per-family packages — Feather, AntDesign, FontAwesome5, Ionicons, MaterialDesignIcons, Octicons, EvilIcons, Entypo). Import from the `/static` subpath (e.g. `@react-native-vector-icons/feather/static`) to skip the dynamic font-loading wrapper. `lucide-react-native` was removed — don't reintroduce it.
- Push notifications go through `expo-notifications`. Tap-to-deep-link routing (cold start + warm) lives in `src/app/_layout.tsx`; never navigate from `useEffect` before the auth gate at `index.tsx` has settled, or the message stack will mount without `index` underneath.

## Tooling

### Supabase MCP (read-only)

`.mcp.json` registers a Supabase MCP server scoped to this project (`project_ref=zwdjjlcpyfbybjdexdji`) in **read-only** mode. Use it to inspect live schema, run `SELECT` queries, or verify constraints without leaving the editor. Writes (INSERT/UPDATE/DELETE/DDL) are blocked at the MCP boundary — schema changes still go through Supabase Studio's SQL editor, then regenerate `src/database.types.ts`.

### Expo MCP

`.mcp.json` also registers `https://mcp.expo.dev/mcp` for EAS build/workflow management, TestFlight feedback, and documentation lookup. Use it for build runs/logs/cancels and workflow operations rather than shelling out to `eas`.

### Skills (in `.agents/skills/`)

Project-local skills available for reference. Read the relevant `SKILL.md` before starting work in the matching area:

- `building-native-ui/` — Expo Router conventions, native tabs, animations, controls, headers, search, gradients, media. Has subtopic refs in `references/`.
- `vercel-react-native-skills/` — performance and patterns: list virtualization, memoization rules under React Compiler, animations on GPU properties, native modals, navigation, state management. Rules in `rules/*.md`; see `SKILL.md` for the priority table.
- `native-data-fetching/` — patterns for data fetching in Expo apps.
- `expo-api-routes/` — server route conventions for Expo Router.
- `upgrading-expo/` — guidance for SDK upgrades.

The skills override generic React Native advice; when in doubt about list performance, animation choice, or navigation pattern, the skill rules win.
