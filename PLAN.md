# Matripoints — Couples Life OS + Playful Gamification

## Vision

A life-organization app for couples that helps them manage shared tasks, lists, and
schedules — with an optional, lightweight gamification layer (Matripoints) that
celebrates collaboration without creating transactional dynamics.

Think: **Todoist meets Duolingo, but for couples.**

---

## MVP Scope

### Core Features (v1)

1. **Couple Setup**
   - Create a couple profile (two partners)
   - Simple invite flow (share code)

2. **Shared Task Lists**
   - Create/edit/delete tasks
   - Assign to a partner or leave unassigned
   - Categories: Chores, Groceries, Errands, Home, Kids, Custom
   - Recurring tasks (daily, weekly, monthly)
   - Mark tasks complete

3. **Couple Dashboard**
   - Today's tasks overview
   - Weekly team stats ("You two completed 23 tasks this week!")
   - Gratitude nudges ("Alex did 4 tasks today — say thanks!")

4. **Matripoints Layer (Optional/Toggleable)**
   - Points auto-accumulate on task completion (self-reported, trust-based)
   - Both partners earn independently — no zero-sum
   - Team score prominently displayed
   - Weekly leaderboard (resets each week, lighthearted)
   - Milestone badges ("Dish Destroyer", "Laundry Legend", "Errand Express")
   - Wish list: each partner lists things they'd enjoy — points serve as conversation starters, not hard currency

5. **Settings**
   - Toggle points layer on/off
   - Manage categories
   - Notification preferences

### Explicitly NOT in MVP

- Calendar sync
- Shared notes beyond task lists
- Chat/messaging
- Social features
- Real money / in-app purchases
- Approval gates on task completion

---

## Tech Stack

| Layer        | Choice                          |
|-------------|--------------------------------|
| Framework   | React Native + Expo (SDK 52)   |
| Language    | TypeScript                      |
| Navigation  | Expo Router (file-based)        |
| State       | Zustand                         |
| Local DB    | Expo SQLite                     |
| Backend     | Supabase (auth, database, realtime sync) |
| Styling     | NativeWind (Tailwind for RN)    |
| Icons       | @expo/vector-icons              |

---

## Data Model

### couples
| Field       | Type    | Notes                    |
|------------|---------|--------------------------|
| id         | uuid    | PK                       |
| name       | string  | Optional couple nickname |
| invite_code| string  | For partner joining      |
| created_at | timestamp |                        |
| points_enabled | boolean | Toggle gamification  |

### profiles
| Field       | Type    | Notes                    |
|------------|---------|--------------------------|
| id         | uuid    | PK, matches auth.users   |
| couple_id  | uuid    | FK → couples             |
| display_name | string |                         |
| avatar_url | string  | Optional                 |
| created_at | timestamp |                        |

### tasks
| Field       | Type    | Notes                    |
|------------|---------|--------------------------|
| id         | uuid    | PK                       |
| couple_id  | uuid    | FK → couples             |
| title      | string  |                          |
| category   | string  | chores, groceries, etc.  |
| assigned_to| uuid    | FK → profiles (nullable) |
| completed_by| uuid   | FK → profiles (nullable) |
| completed_at| timestamp | nullable              |
| is_recurring| boolean |                         |
| recurrence | string  | daily/weekly/monthly     |
| points_value| integer | default 10              |
| created_by | uuid    | FK → profiles            |
| created_at | timestamp |                        |

### points_log
| Field       | Type    | Notes                    |
|------------|---------|--------------------------|
| id         | uuid    | PK                       |
| couple_id  | uuid    | FK → couples             |
| profile_id | uuid    | FK → profiles            |
| task_id    | uuid    | FK → tasks               |
| points     | integer |                          |
| created_at | timestamp |                        |

### badges
| Field       | Type    | Notes                    |
|------------|---------|--------------------------|
| id         | uuid    | PK                       |
| profile_id | uuid    | FK → profiles            |
| badge_type | string  | e.g. "dish_destroyer"    |
| earned_at  | timestamp |                        |

### wishes
| Field       | Type    | Notes                    |
|------------|---------|--------------------------|
| id         | uuid    | PK                       |
| profile_id | uuid    | FK → profiles            |
| couple_id  | uuid    | FK → couples             |
| title      | string  | "Gaming night"           |
| description| string  | Optional                 |
| created_at | timestamp |                        |

---

## Screen Map

```
(tabs)
├── Home (Dashboard)
│   ├── Today's tasks summary
│   ├── Team weekly stats
│   ├── Gratitude nudge card
│   └── Points summary (if enabled)
├── Tasks
│   ├── Task list (filterable by category/person)
│   ├── Add/Edit task modal
│   └── Task detail
├── Points (if enabled)
│   ├── Team score
│   ├── Individual scores (weekly reset)
│   ├── Badges gallery
│   └── Wish lists
└── Settings
    ├── Profile
    ├── Couple settings
    ├── Toggle points
    └── Categories management
```

---

## Safeguards Built Into Design

1. **Team-first framing** — Team score shown larger than individual scores everywhere
2. **No zero-sum** — Both partners earn independently. No transfers or deductions
3. **Self-reported completion** — Trust is the default. No approval gates
4. **Gratitude over comparison** — Nudges say "say thanks!" not "you're behind"
5. **Weekly resets** — Leaderboards reset so no one "falls behind" permanently
6. **Toggleable** — The entire points layer can be turned off without losing task functionality
7. **Wish lists, not redemptions** — Points aren't spent. They're conversation starters
8. **No notifications about partner's score** — You see your own progress, team progress, and gratitude prompts. Never "your partner scored more"

---

## MVP Build Order

1. Project scaffolding (Expo + TypeScript + routing)
2. Local-first task management (works offline)
3. Dashboard with team stats
4. Points layer (toggleable)
5. Badges system
6. Wish lists
7. Supabase integration (auth + sync)
8. Polish and deploy
