<div align="center">

<img src="assets/images/icon.png" alt="Karpool" width="160"/>

# Karpool

### Student Ride-Sharing for Campus Communities

[![Expo](https://img.shields.io/badge/Expo-~54-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20+%20Auth%20+%20Realtime-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

</div>

A campus carpool app: students create rides, others join, members coordinate via realtime group chat.

## Screenshots

<div align="center">
<table>
  <tr>
    <td><img src="assets/screenshots/screenshot2.png" alt="Home" width="220"/></td>
    <td><img src="assets/screenshots/screenshot1.png" alt="Create Ride" width="220"/></td>
    <td><img src="assets/screenshots/screenshot3.png" alt="Chat" width="220"/></td>
  </tr>
</table>
</div>

## Stack

| Layer | Tools |
|---|---|
| **Framework** | Expo SDK 54, React Native 0.81, React 19, TypeScript (strict) |
| **Routing** | Expo Router 6 (file-based, typed routes) |
| **Backend** | Supabase — Postgres, Auth, Realtime |
| **Data** | TanStack Query, Postgres RPCs for atomic multi-row writes |
| **UI** | FlashList v2, react-native-gifted-chat, Reanimated, React Compiler |

## Database

Four tables: `users`, `rides`, `bookings`, `messages`.

| Table | Key Constraints |
|---|---|
| `rides` | `status ∈ {active, archived}` · `total_cost > 0` · `0 ≤ available_seats ≤ total_seats` · `departure_date > created_at` · `cost_per_person` is a generated column |
| `bookings` | `UNIQUE (ride_id, user_id)` — prevents double-booking |
| `messages` | FK to `rides.id` and `users.id` |
| `users` | unique `email`, unique `phone`, `id` is FK to `auth.users` |

Generated TS types: [src/database.types.ts](src/database.types.ts) (UTF-16; regenerate with `npx supabase gen types typescript ...`).

## Getting Started

```bash
npm install
```

Create `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

| Command | Platform |
|---|---|
| `npm start` | Expo dev server |
| `npm run android` | Android emulator |
| `npm run ios` | iOS simulator |
| `npm run web` | Browser |
| `npx tsc --noEmit` | Type-check (no test runner is wired up) |

## Roadmap

| Status | Items |
|---|---|
| ✅ Done | Auth, ride CRUD, atomic join/leave/create, realtime chat, upcoming/past chat list, ride info screen, light/dark mode |
| 🚧 Next | Row-Level Security policies, profile screen + avatar uploads, push notifications, chat pagination |
