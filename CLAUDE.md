# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TaskWise 2.0** is a gamified task management mobile application built with React Native and Expo. It combines traditional task management with RPG-style progression mechanics (XP, levels, achievements, streaks) to motivate users. Users complete tasks to earn XP, level up through 6 categories (Novice → Legend), maintain daily streaks for bonuses, and unlock achievements.

## Development Commands

### Essential Commands
```bash
# Install dependencies
npm install

# Start development server
npm start
# or
expo start

# Run on specific platforms
npm run android    # Start on Android emulator/device
npm run ios        # Start on iOS simulator/device
npm run web        # Start on web

# Linting
npm run lint

# Reset project structure
npm run reset-project
```

### Development Notes
- The app uses Expo Go or development builds for testing
- Changes to `app/**` files will hot-reload automatically
- Database changes require app restart to run migrations
- TypeScript strict mode is enabled

## Architecture Overview

### Tech Stack
- **Framework**: React Native 0.81.5 with Expo ~54.0.23
- **Routing**: Expo Router v6 (file-based routing with typed routes)
- **State Management**: Zustand v5 (three main stores: tasks, user, UI)
- **Database**: expo-sqlite v16 (local SQLite with repository pattern)
- **Styling**: NativeWind v4 (Tailwind CSS for React Native)
- **Navigation**: React Navigation v7 with custom bottom tabs
- **TypeScript**: v5.9.2 with strict mode

### Project Structure

```
app/                          # Expo Router (file-based routing)
├── _layout.tsx              # Root layout - DB initialization, nav bar control
└── (tabs)/                  # Tab-based navigation group
    ├── _layout.tsx          # Tab layout with CustomTabBar
    ├── Home/index.tsx       # Daily tasks dashboard
    ├── Stats/index.tsx      # Analytics & productivity stats
    ├── Agenda/index.tsx     # Calendar and task scheduling
    └── Profile/index.tsx    # User profile and achievements

components/                   # Reusable UI components organized by screen
├── CustomTabBar.tsx         # Custom bottom navigation (5 items with center add button)
├── AddTaskModal.tsx         # Task creation modal
├── home/                    # Home screen components
├── stats/                   # Stats screen components
├── agenda/                  # Agenda/calendar components
├── profile/                 # Profile components
└── modals/                  # Modal dialogs

stores/                       # Zustand state management
├── taskStore.ts             # Task state, CRUD operations, caching strategy
├── userStore.ts             # User progression, XP, achievements, streaks
└── uiStore.ts               # Modal visibility state

database/                     # SQLite database layer
├── config.ts                # Database connection and health checks
├── migrations.ts            # Schema initialization (6 tables)
└── repositories/            # Repository pattern for data access
    ├── taskRepository.ts
    ├── userRepository.ts
    ├── achievementRepository.ts
    ├── streakRepository.ts
    ├── statsRepository.ts
    └── missionRepository.ts

utils/                        # Business logic utilities
├── xpUtils.ts               # Points calculation, bonus multipliers (streak, priority, early completion)
├── levelUtils.ts            # Level progression formula, category determination (6 tiers)
├── streakUtils.ts           # Streak calculations, bonus tracking
├── achievementUtils.ts      # Achievement requirement checking (50+ achievements)
├── dateUtils.ts             # Date comparisons, formatting
├── taskUtils.ts             # Task sorting, filtering
├── missionUtils.ts          # Daily mission generation
└── imageUtils.ts            # Avatar saving/loading to file system

types/                        # TypeScript type definitions
├── task.ts                  # Task interfaces and enums
├── user.ts                  # User, category, progression types
├── achievement.ts           # Achievement system types
├── streak.ts                # Streak tracking types
└── stats.ts                 # Statistics types

constants/
└── theme.ts                 # Design tokens: colors, fonts (platform-specific)

hooks/
└── useImagePicker.ts        # Image selection wrapper (gallery/camera)
```

### Routing Architecture

The app uses Expo Router v6 with file-based routing:

```
/ (root - app/_layout.tsx)
  └── (tabs) - Tab navigation group (app/(tabs)/_layout.tsx)
      ├── Home/index       - Dashboard with today's tasks
      ├── Stats/index      - Productivity statistics
      ├── Agenda/index     - Calendar view
      └── Profile/index    - User profile and achievements
```

The tab bar is a custom implementation (`CustomTabBar.tsx`) with 5 positions where the center button opens the AddTaskModal.

## State Management (Zustand)

### Three Core Stores

#### 1. `useTaskStore` (stores/taskStore.ts)
Manages all task-related state with selective caching for performance.

**Key State:**
- `pendingTasks`: Active tasks (not overdue)
- `todayTasks`: Tasks due today
- `recentCompleted`: Last 30 completed tasks (capped for performance)
- `monthTasks`: Tasks in current calendar month view

**Critical Actions:**
- `loadEssentialTasks()`: Loads today + pending tasks on app start
- `createTask()`: Creates new task with calculated basePoints
- `completeTask(id, earnedPoints, multiplier)`: Marks complete, awards XP, moves to recentCompleted
- `toggleTask()`: Uncomplete a task (moves back to pending)
- `updateTask()`: Updates any task field
- `deleteTask()`: Removes from DB and all in-memory lists

**Caching Strategy:**
- Only essential tasks kept in memory (today + pending + 30 recent completed)
- Month tasks loaded on demand for calendar view
- Prevents unbounded memory growth

#### 2. `useUserStore` (stores/userStore.ts)
Manages user progression, achievements, and streaks.

**Key State:**
- `user`: Profile with XP, level, category, statistics
- `achievements`: All 50+ achievements with unlock status
- `streak`: Current streak data
- `levelUpNotification`, `achievementUnlockedNotification`: Event notifications

**Critical Actions:**
- `addXP(points)`: Adds XP, checks for level up, triggers achievement validation
- `updateStreak()`: Increments/resets streak based on last activity
- `checkAndUpdateAchievements()`: Validates all achievement requirements
- `unlockAchievement(id)`: Awards achievement XP bonus
- `resetDailyCounters()`, `resetWeeklyCounters()`, `resetMonthlyCounters()`: Scheduled resets

**Level System:**
- Formula: `XP_for_level = level × 100 + level^1.5 × 50`
- Max level: 100
- 6 categories: Novato (1-10), Aprendiz (11-25), Competente (26-40), Experto (41-60), Maestro (61-80), Leyenda (81-100)

#### 3. `useUIStore` (stores/uiStore.ts)
Simple UI state for modal visibility.

**State:**
- `isAddTaskModalOpen`: Boolean for task creation modal

## Database Architecture (SQLite)

### Schema (6 Tables)

**1. users** - User profile and progression
- Profile: name, avatar, email, age
- Progression: totalXP, currentLevel, currentLevelXP, nextLevelXP, category
- Statistics: totalTasksCompleted, tasksCompletedToday/Week/Month
- Streaks: currentStreak, bestStreak, lastTaskDate
- Achievements: totalAchievements, dailyMissionStreaks

**2. tasks** - Task data with gamification
- Metadata: title, description, status (pending/completed/overdue/cancelled)
- Gamification: difficulty (easy/medium/hard/extreme), category (8 types), priority (4 levels)
- Points: basePoints, bonusMultiplier, earnedPoints
- Temporal: dueDate, dueTime, estimatedTime, completedAt
- Bonus flags: completedEarly, isFirstTaskOfDay, completedDuringStreak
- Foreign key: userId with CASCADE delete

**3. achievements** - All unlockable achievements
- Properties: name, description, icon, category, rarity (Common/Rare/Epic/Legendary)
- Requirements: requirementType, requirementValue, currentValue
- State: unlocked, unlockedAt, progress
- Rewards: xpReward (50-200 XP)

**4. streaks** - Dedicated streak tracking
- Streak data: currentStreak, bestStreak, totalDaysActive
- Dates: lastActivityDate, streakStartDate, bestStreakDate
- State: isActive

**5. daily_missions** - Daily recurring missions
- Mission: type, difficulty, targetValue, currentValue
- Tracking: completions, bonuses
- Unique per user per day

**6. stats** - Aggregated statistics
- Global: totalTasks, totalTasksCompleted, totalXPEarned
- By difficulty: counts for easy/medium/hard/extreme
- By category: counts for 8 task categories
- Productivity: averageTasksPerDay, mostProductiveDay/Hour/DayOfWeek

### Repository Pattern

Each repository is a static class providing data access methods:

```typescript
// Example usage
TaskRepository.create(db, taskData)      // Returns created task
TaskRepository.getByStatus(db, userId, 'pending')  // Returns filtered tasks
TaskRepository.complete(db, taskId, earnedPoints)  // Updates and returns task

UserRepository.addXP(db, userId, points) // Updates XP, recalculates level
UserRepository.getFirstUser(db)          // Returns user or null

AchievementRepository.unlockAchievement(db, userId, achievementId)
```

**Initialization Flow:**
1. App root (`app/_layout.tsx`) calls `initDatabase()` on mount
2. Creates all tables (idempotent)
3. Runs migrations for schema updates
4. Seeds initial achievement data
5. Health check validates all tables exist

## Gamification System

### Points & Bonuses

**Base Points by Difficulty:**
- Easy: 10 XP
- Medium: 25 XP
- Hard: 50 XP
- Extreme: 100 XP

**Stackable Bonus Multipliers** (calculated in `utils/xpUtils.ts`):
- Streak: 3+ days (25%), 7+ days (50%), 30+ days (100%)
- Priority: High (15%), Urgent (20%)
- Early completion: 25%
- First task of day: 20%
- Multiple tasks same day: 5+ (30%), 10+ (50%)

**Final Formula:**
```typescript
earnedPoints = Math.floor(basePoints * (1 + totalBonuses))
```

### Task Completion Flow

```
User clicks complete
    ↓
Calculate earnedPoints with bonuses (xpUtils.ts)
    ↓
taskStore.completeTask(id, earnedPoints, multiplier)
    ↓
TaskRepository.complete() - updates DB
    ↓
Move to recentCompleted, remove from pending/today
    ↓
userStore.addXP(earnedPoints)
    ↓
UserRepository.addXP() - updates user totalXP, level
    ↓
Check for level up → show notification
    ↓
checkAndUpdateAchievements() - validate all requirements
    ↓
updateStreak() - increment or reset
    ↓
UI re-renders with new state
```

### Achievement System

50+ achievements across categories:
- **Leveling**: Reach specific levels (5, 10, 25, 50, 100)
- **Streaks**: Daily activity streaks (7, 30, 90, 365 days)
- **Tasks**: Complete X tasks (10, 50, 100, 500, 1000)
- **Categories**: Complete tasks in all 8 categories
- **Difficulty**: Master tasks (complete 100 hard/extreme)
- **Speed**: Complete tasks early
- **Consistency**: Weekly/monthly goals

**Checking Logic** (utils/achievementUtils.ts):
- Called after any user progression event (XP gain, task complete, level up)
- Compares current user state against all achievement requirements
- Awards XP bonus for newly unlocked achievements
- Shows unlock notification

### Streak Mechanics

**Rules** (utils/streakUtils.ts):
- Active if user completed a task today OR yesterday
- Increments on consecutive days
- Resets to 1 if gap > 1 day
- Best streak tracked separately

**Streak Bonuses:**
- 3 days: +25% XP
- 7 days: +50% XP
- 30 days: +100% XP (doubles XP!)

## Styling System

### NativeWind (Tailwind for React Native)

**Configuration:**
- `tailwind.config.js`: Scans `components/**` and `app/**` for classes
- `nativewind/preset` for React Native compatibility
- Mix of Tailwind utility classes and native StyleSheets

**Theme (constants/theme.ts):**
- **Primary**: #d9f434 (Lime/Yellow accent)
- **Background**: #000000 (Black, dark theme)
- **Category colors**: Blue (work), Green (personal), Pink (health), Orange (study), etc.
- **Difficulty colors**: Green (easy), Orange (medium), Red (hard), Purple (extreme)
- **Fonts**: Platform-specific (SF Pro on iOS, Roboto on Android)

**Styling Strategy:**
- Use Tailwind classes for most UI (`className="flex-1 bg-black"`)
- Use native StyleSheets for performance-critical components (lists, animations)
- Custom tab bar uses mix of both

## Key Patterns & Best Practices

### When Working with Tasks

1. **Always recalculate points** when completing tasks - use `calculateTaskPoints()` from `xpUtils.ts`
2. **Check streak status** before awarding bonuses - streak must be active
3. **Validate date formats** - use utilities from `dateUtils.ts` (YYYY-MM-DD for dates)
4. **Update both stores** - task completion affects both taskStore and userStore
5. **Trigger achievement checks** after user progression events

### When Working with Database

1. **Use repository methods** - never write raw SQL in components/stores
2. **Handle null returns** - repositories return `null` when not found
3. **Pass database instance** - all repository methods take `db` as first param
4. **Respect foreign keys** - tasks CASCADE delete when user deleted
5. **Run migrations** - add new fields to migration files, not just schema

### When Working with State

1. **Load essential data first** - use `loadEssentialTasks()` on app start
2. **Respect cache limits** - `recentCompleted` capped at 30 items
3. **Clear stale data** - use store reset methods for daily/weekly/monthly counters
4. **Update UI state** - close modals after successful operations
5. **Handle loading states** - all stores have `loading` and `error` fields

### When Adding Features

1. **Check for existing utilities** - most common operations have helpers (date, XP, level, streak)
2. **Follow repository pattern** - create new repository if adding a new table
3. **Update TypeScript types** - add interfaces to `types/` directory
4. **Consider gamification** - how does this feature integrate with XP/achievements?
5. **Test with existing data** - ensure migrations work for existing users

## Common Development Tasks

### Adding a New Task Field

1. Update `types/task.ts` interface
2. Add column to `tasks` table in `database/migrations.ts`
3. Create migration function in separate migration file
4. Update `TaskRepository` CRUD methods
5. Update task-related components (AddTaskModal, task cards)
6. Update `taskStore` if needed for filtering/sorting

### Adding a New Achievement

1. Add achievement data to `database/repositories/achievementRepository.ts` seed data
2. Update requirement checking logic in `utils/achievementUtils.ts`
3. Ensure `checkAndUpdateAchievements()` validates new requirement type
4. Test unlock flow and XP reward

### Modifying XP Calculation

1. Update formulas in `utils/xpUtils.ts`
2. Test with various task configurations (difficulty, priority, streak)
3. Ensure multipliers are still additive, not multiplicative
4. Update level progression if needed (`utils/levelUtils.ts`)

### Adding a New Screen

1. Create new directory in `app/(tabs)/` or `app/`
2. Add `index.tsx` file (Expo Router will auto-route)
3. Update tab bar if adding to main navigation (`components/CustomTabBar.tsx`)
4. Create screen-specific components in `components/[screen-name]/`
5. Add to TypeScript typed routes (auto-generated by Expo Router)

## Path Aliases

TypeScript path alias configured:
```typescript
"@/*" maps to root directory
// Example: import { useTaskStore } from '@/stores/taskStore'
```

## Important Notes

- **Database initialization** happens in root `_layout.tsx` - app shows loading screen until DB ready
- **Tab navigation loads data** in `(tabs)/_layout.tsx` - loads user, tasks, achievements
- **Streak resets** are manual - no background jobs (check on app open)
- **Date handling** - all dates stored as YYYY-MM-DD strings, times as HH:mm
- **XP bonuses stack additively** - 50% + 25% = 75% total bonus, not 1.5 × 1.25
- **Achievement XP** goes through normal `addXP()` flow - can trigger level ups
- **Task status** changes automatically - pending → overdue if past due date (checked on load)
- **Image storage** - avatars saved to device file system, path stored in DB

## Testing the App

1. Use Expo Go for quick testing (scan QR code from `expo start`)
2. For full features (notifications, SQLite), use development build
3. Test gamification: complete tasks on consecutive days to see streak bonuses
4. Test level progression: create high-XP tasks (extreme difficulty with bonuses)
5. Test achievements: trigger various milestones (first task, 10 tasks, etc.)

## Git Workflow

Current branch: `main`

Recent commits show active development on:
- Tab bar bug fixes
- User profile features
- Profile image handling
- Pomodoro timer integration
- Add task functionality

When creating commits, follow existing pattern of descriptive messages (e.g., "tabBar-bug", "UpdateUserFeature").
