# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Matripoints — a React Native (Expo) couples life-organization app with optional gamification. Local-first MVP using SQLite, no backend yet.

## Commands

```bash
npx expo start          # Start dev server
npx expo start --ios    # Start on iOS simulator
npx expo start --android # Start on Android emulator
npx expo start --web    # Start web version
```

No test runner or linter is configured yet.

## Tech Stack

- **React Native 0.81 + Expo SDK 54** with New Architecture enabled
- **TypeScript** (strict mode)
- **Expo Router** — file-based routing in `app/`
- **Zustand** — state management in `src/store/useStore.ts`
- **Expo SQLite** — local database with WAL mode in `src/db/database.ts`

## Architecture

### Data Flow

```
Screen → useStore (Zustand) → database.ts (SQLite) → local DB
```

The Zustand store (`src/store/useStore.ts`) is the single source of truth for all app state. It contains all business logic (badge awarding, weekly metrics, gratitude nudges) and calls the database layer for persistence. Screens use Zustand selectors to read state and dispatch actions.

### Routing

File-based routing via Expo Router:
- `app/index.tsx` — entry redirect (checks if setup is complete)
- `app/setup.tsx` — 3-step couple onboarding wizard (modal)
- `app/(tabs)/` — main tab navigation (Home, Tasks, Points, Settings)

### Database

Six tables: `couples`, `profiles`, `tasks`, `points_log`, `badges`, `wishes`. All IDs are UUIDs. Foreign keys link profiles/tasks/points to a couple. The database layer in `src/db/database.ts` exposes CRUD functions organized by entity.

### Key Modules

- `src/constants/theme.ts` — design tokens (colors, spacing, fonts, radii)
- `src/types/index.ts` — TypeScript interfaces + badge/category config constants
- `src/store/useStore.ts` — all state, derived data, and business logic
- `src/db/database.ts` — all SQLite queries

## Design System

Primary purple (#6C5CE7), secondary cyan (#00CEC9), accent pink (#FD79A8). Spacing scale: xs(4), sm(8), md(16), lg(24), xl(32), xxl(48). All tokens live in `src/constants/theme.ts`.

## Key Design Decisions

- **Local-first** — works offline, Supabase planned for future sync/auth
- **Team-first framing** — team score displayed larger than individual scores
- **Weekly resets** — points/leaderboards reset weekly to prevent permanent gaps
- **Toggleable gamification** — points layer can be disabled in settings
- **Trust-based** — task completion is self-reported, no approval gates
- **Profile switching** — partners share a device by switching active profile
