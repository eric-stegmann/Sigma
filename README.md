# Routines

A daily routine planner in the spirit of the "Structured" app: build routines out of time-blocked tasks, see them laid out on a vertical timeline, and check things off as you go. Routines repeat on whichever weekdays you choose, and completion state is tracked per calendar day.

## Stack

- Expo (managed workflow) + TypeScript, `expo-router` for navigation
- `expo-sqlite` + `drizzle-orm`/`drizzle-kit` for local, on-device persistence
- `zustand` for app state, `date-fns`/hand-rolled helpers in `lib/` for date math
- No backend/auth/sync yet — everything is local-first on a single device

## Running it

```bash
npm install
npm start        # then press i / a / w, or scan the QR code in Expo Go
```

- `npm run ios` / `npm run android` — open directly in a simulator
- `npm run web` — browser preview (see caveat below)
- `npm test` — Jest unit/component tests for the pure logic and Timeline rendering
- `npx tsc --noEmit` — typecheck
- `npm run db:generate` — regenerate SQL migrations after changing `db/schema.ts`

**Web caveat:** `expo-sqlite`'s web backend needs `SharedArrayBuffer`, which browsers only expose on cross-origin-isolated pages; the Expo web dev server doesn't set those headers by default, so the web preview currently stops at the database-init step. This doesn't affect iOS/Android, where SQLite is a real native module. Use Expo Go on a phone (or a simulator) to exercise the full app.

## Project layout

- `app/` — screens (file-based routing): Today/timeline tab, Routines tab, routine/task/category editors
- `components/` — shared UI, with `components/timeline/` holding the timeline rendering pieces
- `lib/` — pure, unit-tested logic: time-to-pixel math (`time.ts`), recurrence rules (`recurrence.ts`), midnight rollover (`rollover.ts`)
- `db/` — Drizzle schema, SQLite client, generated migrations
- `repositories/` — the only layer that talks to the database; screens/stores go through these
- `store/` — Zustand stores for the Today view and the Routines list
- `types/models.ts` — shared domain types

## How recurrence and daily reset work

A routine stores a Mon–Sun bitmask of which days it repeats on. "Today's" timeline is computed on the fly by filtering routines whose recurrence rule matches the selected date and joining in that date's completions — no rows are pre-created for future/past days. Completion is an append-only `(task_id, date)` log rather than a boolean flag, so a new calendar day automatically shows every task as unchecked with no explicit "reset" step.
