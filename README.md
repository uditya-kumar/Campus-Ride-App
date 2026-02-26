<div align="center">

# Campus Ride

### Student Ride-Sharing for Campus Communities

[![Expo](https://img.shields.io/badge/Expo-~54.0.33-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-~5.9.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Coming%20Soon-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

[Tech Stack](#tech-stack) • [Screens](#screens--navigation) • [Components](#components) • [Database](#database-schema) • [Roadmap](#roadmap)

</div>

> **Current Status:** Phase 1 — UI & screen implementation complete. Phase 2 will integrate Supabase as the backend and TanStack Query for server-state management.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Screens & Navigation](#screens--navigation)
- [Components](#components)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Roadmap](#roadmap)

---

## Tech Stack

| Technology                                        | Purpose                                        |
| ------------------------------------------------- | ---------------------------------------------- |
| **Expo** (~54) + **React Native** (0.81)          | Cross-platform mobile framework                |
| **Expo Router** (~6)                              | File-based navigation with tab & stack layouts |
| **TypeScript** (~5.9)                             | Static typing across the entire codebase       |
| **React Native Reanimated** + **Gesture Handler** | Animations & gesture interactions              |
| **FlashList**                                     | High-performance virtualized list rendering    |
| **React Native Gifted Chat**                      | Chat UI for in-ride group messaging            |
| **Supabase** _(Phase 2)_                          | PostgreSQL database, Auth, and Realtime        |
| **TanStack Query** _(Phase 2)_                    | Server-state management & data fetching        |

---

## Project Structure

```
src/
├── app/
│   ├── _layout.tsx              # Root layout — theme provider, splash screen
│   ├── +not-found.tsx           # 404 screen
│   └── (tabs)/
│       ├── _layout.tsx          # Tab bar configuration
│       ├── createRide.tsx        # Create ride form screen
│       ├── home/
│       │   ├── _layout.tsx
│       │   └── index.tsx        # Ride listing & filtering screen
│       └── message/
│           ├── _layout.tsx
│           ├── index.tsx        # Chat rooms list screen
│           └── [id].tsx         # Individual chat room screen
├── components/
│   ├── Themed.tsx               # Theme-aware Text & View wrappers
│   ├── useColorScheme.ts        # Color scheme hook
│   ├── LocationSelectorModal.tsx
│   ├── filters/
│   │   ├── DateFilter.tsx
│   │   └── RouteSelector.tsx
│   └── rideComponents/
│       ├── Button.tsx
│       ├── ChatRoomCard.tsx
│       ├── ChatScreen.tsx
│       ├── CustomTextInput.tsx
│       ├── Dropdown.tsx
│       └── RideCard.tsx
├── constants/
│   └── Colors.ts                # Light/dark color tokens
├── hooks/
│   └── useFilteredRides.ts      # Filter & sort rides by origin/destination/date
└── database.types.ts            # Auto-generated Supabase TypeScript types

assets/
├── data/
│   ├── rides.ts                 # Mock ride data
│   ├── chat.ts                  # Mock chat room data
│   └── chatdetailsMock.ts       # Mock chat message data
└── images/
```

---

## Database Schema

Types are pre-generated from Supabase (`src/database.types.ts`). The schema defines four tables:

| Table        | Key Columns                                                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `rides`      | `id`, `origin`, `destination`, `departure_date`, `available_seats`, `total_seats`, `cost_per_person`, `total_cost`, `vehicle_type`, `status`, `created_by_user_id` |
| `bookings`   | `id`, `ride_id`, `user_id`, `status`, `created_at`                                                                                                                 |
| `chat_rooms` | `id`, `ride_id`, `created_at`                                                                                                                                      |
| `users`      | `id`, + user profile fields                                                                                                                                        |

All relational links (FK constraints) are captured in the generated types.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
- iOS Simulator / Android Emulator or the [Expo Go](https://expo.dev/client) app

### Installation

```bash
git clone <repo-url>
cd Campus-Ride-App
npm install
```

### Running the App

| Command           | Platform                     |
| ----------------- | ---------------------------- |
| `npm start`       | Opens Expo dev server        |
| `npm run android` | Launches on Android emulator |
| `npm run ios`     | Launches on iOS simulator    |
| `npm run web`     | Launches in browser          |

---

## Roadmap

### Phase 1 — UI (Current)

- [x] File-based navigation with Expo Router
- [x] Home screen with ride listing, filtering, and sorting
- [x] Create ride form with derived cost-per-person
- [x] Messages inbox and chat room screens
- [x] Light / dark mode support
- [x] Mock data wired to Supabase-typed models
- [x] Performance optimizations (`memo`, `useMemo`, `useCallback`, `FlashList`)

### Phase 2 — Backend Integration (Planned)

- [ ] Connect Supabase client (`@supabase/supabase-js`)
- [ ] Authentication (Supabase Auth)
- [ ] Live data fetching with **TanStack Query** (`@tanstack/react-query`)
- [ ] Real-time chat via Supabase Realtime subscriptions
- [ ] Booking a ride and seat management
- [ ] User profile management
