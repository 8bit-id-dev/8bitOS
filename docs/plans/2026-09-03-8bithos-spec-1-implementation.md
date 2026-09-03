# 8bitOS Spec 1 — Implementation Plan

**Date:** 2026-09-03
**Spec:** `docs/specs/2026-09-03-8bithos-spec-1.md`
**Scope:** App shell + Dashboard + Classroom (no Notes/Browser/Quiz/etc.)

---

## Tasks overview

**Phase A — Frontend foundation (no backend needed)**
1. Project scaffold (package.json, tsconfig, vite config, index.html)
2. Tailwind + design tokens + global CSS
3. Shared layout components (PixelButton, PixelCard, PixelModal, PixelInput, StatusPill, EmptyState, ConfirmDialog, Dock)
4. App shell (Providers, OrientationGuard, RequireAuth, AppLayout, routes)

**Phase B — Backend setup (user runs)**
5. InsForge project link + .env
6. Database migrations (helpers, tables, indexes, RLS)

**Phase C — Frontend feature work**
7. Auth feature (SignIn, SignUp, useSession, auth.api, auth.store)
8. Time helpers + tests
9. Outbox + tests
10. Typed query helpers
11. Dashboard feature
12. Classroom feature (ClassList, NewClassModal, ClassHub, Roster, AttendanceTab, AttendanceSheet, StudentSidePanel)
13. Manual verification

---

## Phase A — Frontend foundation

### Task 1: Project scaffold

Files:
- `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- `vite.config.ts`, `index.html`, `src/main.tsx`, `src/vite-env.d.ts`
- `.nvmrc` (20), `.gitignore`, `.prettierrc.json`
- `public/favicon.svg`, `public/icon-*.png` (placeholder 1x1 PNGs)

Steps:
1. Write `package.json` with React 18.3.1, TypeScript 5.6.2, Vite 5.4.8, Tailwind 3.4.13, React Router 6.26.2, Zustand 4.5.5, @tanstack/react-query 5.59.0, idb 8.0.0, @insforge/sdk, vite-plugin-pwa 0.20.5, Vitest 2.1.2, RTL 16.0.1, MSW 2.4.9, happy-dom 15.7.4, fake-indexeddb 6.0.0
2. Write all config files
3. `corepack enable && corepack prepare pnpm@9.12.0 --activate`
4. `pnpm install`
5. Add `/// <reference types="vitest" />` to top of vite.config.ts (fix test block type error)
6. `pnpm typecheck` → exit 0
7. Commit: `chore: scaffold`

### Task 2: Tailwind + design tokens

Files:
- `postcss.config.js`, `tailwind.config.ts`
- `src/shared/styles/tokens.css`, `src/shared/styles/globals.css`
- `src/main.tsx` updated to import CSS

Steps:
1. Write `postcss.config.js` (tailwind + autoprefixer)
2. Write `tailwind.config.ts` (extend colors `bg #000000` `fg #ffffff` grays, font families, box shadows, border-width 2px)
3. Write `tokens.css` (CSS vars matching tailwind colors, prefers-reduced-motion override)
4. Write `globals.css` (import tokens, @tailwind directives, pixel-cut clip-path, pixel-card, focus ring)
5. Update `main.tsx` to import `./shared/styles/globals.css`
6. Commit: `feat(design): tokens + monochrome dark theme`

### Task 3: Shared layout components

Files (all under `src/shared/components/`):
- `PixelButton.tsx` — variants primary/secondary/ghost, `pressed` prop, 2px border + pixel shadow
- `PixelCard.tsx` — `cut` prop (default true) for pixel-cut clip-path
- `PixelModal.tsx` — backdrop + centered dialog + Esc handler
- `PixelInput.tsx` — label + input + optional error
- `StatusPill.tsx` — `tone: 'on' | 'off'`, `aria-live="polite"`
- `EmptyState.tsx` — title + hint + action
- `ConfirmDialog.tsx` — wraps PixelModal with cancel/confirm
- `Dock.tsx` — bottom nav with HOME/CLASS/TEACH/TOOLS/SYSTEM; first 2 enabled, last 3 greyed `[ SOON ]`

Steps:
1. Write each component file
2. Smoke-test by replacing main.tsx with a Placeholder using all components + Dock
3. `pnpm typecheck` → exit 0
4. Commit: `feat(ui): shared pixel components + dock`

### Task 4: App shell

Files:
- `src/app/Providers.tsx` — QueryClientProvider with staleTime 30s, gcTime 10min, retry 3
- `src/app/OrientationGuard.tsx` — matchMedia portrait check, full-screen rotate message
- `src/app/RequireAuth.tsx` — redirects to /sign-in if no user
- `src/app/AppLayout.tsx` — Outlet + Dock
- `src/app/AppShell.tsx` — Providers > HashRouter > OrientationGuard > AppRoutes
- `src/routes.tsx` — route table
- `src/features/**` — placeholder components for each route (real impl in Phase C)
- Modify `src/main.tsx` to render `<AppShell />`

Steps:
1. Write all app/* files
2. Write placeholder feature components
3. `pnpm typecheck` → exit 0
4. Verify `pnpm dev` renders SignIn placeholder at `http://localhost:5173/#/sign-in`
5. Commit: `feat(app): shell + routes + orientation guard`

---

## Phase B — Backend setup

### Task 5: InsForge project link (USER ACTION)

User runs in terminal:

```bash
cd C:\Users\user\8BIT\8bitOS
npx -y @insforge/cli link
npx -y @insforge/cli secrets get ANON_KEY
cp .env.example .env
# Edit .env with VITE_INSFORGE_URL + VITE_INSFORGE_ANON_KEY
```

User confirms when done. Engineer cannot proceed without this.

### Task 6: Database migrations

Engineer creates SQL files; user (or engineer with linked project) applies via CLI.

Files:
- `supabase/migrations/0001_init.sql` — pgcrypto + `is_owner` function
- `supabase/migrations/0002_tables.sql` — 7 tables + grants
- `supabase/migrations/0003_indexes.sql` — 4 indexes
- `supabase/migrations/0004_rls.sql` — RLS for every table

Steps:
1. Create migration files (use `npx -y @insforge/cli db migrations new <name>` to generate paths)
2. Write SQL
3. Apply: `npx -y @insforge/cli db migrations up --all`
4. Verify: `npx -y @insforge/cli diagnose advisor --severity critical` → zero findings
5. Commit: `feat(db): migrations`

---

## Phase C — Frontend feature work

### Task 7: Auth feature

Files:
- `src/features/auth/auth.api.ts` — signIn, signUp, signOut, fetchSession via @insforge/sdk
- `src/features/auth/auth.store.ts` — Zustand store
- `src/features/auth/useSession.ts` — hook wrapping store + initial fetch
- `src/features/auth/SignIn.tsx` — form with PixelCard + PixelInput + PixelButton
- `src/features/auth/SignUp.tsx` — extended form (full name, school)
- Update `src/routes.tsx` to import real SignIn/SignUp

Steps:
1. Write all auth files
2. `pnpm typecheck` → exit 0
3. Verify sign-in works against linked InsForge
4. Commit: `feat(auth): email/password sign-in + sign-up`

### Task 8: Time helpers + tests

Files:
- `src/test-setup.ts` — `import '@testing-library/jest-dom/vitest'`
- `src/shared/lib/time.test.ts` — tests for todayInJakarta, formatJakartaTime, formatJakartaDate
- `src/shared/lib/time.ts` — implementation

Steps:
1. Write test first
2. Run `pnpm test` → FAIL
3. Write impl
4. Run `pnpm test` → PASS
5. Commit: `feat(lib): time helpers`

### Task 9: Outbox + tests

Files:
- `src/shared/db/outbox.ts` — enqueue, peek, remove, count, incrementAttempts
- `src/shared/db/outbox.test.ts` — using fake-indexeddb
- `src/shared/db/flushOutbox.ts` — drains outbox to InsForge
- `src/shared/db/flushOutbox.test.ts` — using MSW for InsForge mock

Steps:
1. Write tests first
2. Write impl
3. All tests pass
4. Commit: `feat(db): outbox + flush`

### Task 10: Typed query helpers

Files:
- `src/shared/db/insforge.ts` — createClient
- `src/shared/db/types.ts` — TS interfaces for each table row
- `src/shared/lib/env.ts` — requireEnv
- `src/shared/lib/id.ts` — newId() UUID v4
- `src/shared/db/queries.ts` — typed wrappers for select/insert/upsert/update

Steps:
1. Write all files
2. `pnpm typecheck` → exit 0
3. Commit: `feat(db): typed query helpers`

### Task 11: Dashboard feature

Files (under `src/features/dashboard/`):
- `dashboard.helpers.ts` — sortSlotsByStart, findNextSlot, findActiveSession
- `dashboard.helpers.test.ts`
- `dashboard.api.ts` — fetchTodaySlots, fetchTodaySessions
- `dashboard.queries.ts` — useTodaySchedule
- `TodaySchedule.tsx` — list of today's slots
- `NextClassCard.tsx` — next class + [MULAI KBM] button
- `QuickActions.tsx` — stubbed tiles
- `RecoveryToast.tsx` — shows when outbox has pending rows
- `DashboardHeader.tsx`
- `DashboardScreen.tsx` — combines all
- `src/shared/hooks/useOnlineStatus.ts`

Steps:
1. Write helpers + tests first (TDD)
2. Write API + queries
3. Write components
4. Verify dashboard renders with signed-in user
5. Commit: `feat(dashboard): today schedule + next class + recovery toast`

### Task 12: Classroom feature

Files (under `src/features/classroom/`):
- `attendance.reducer.ts` + tests
- `classroom.api.ts` — fetchClasses, createClass, fetchClassById, createSession, fetchSessionAttendance, endSession
- `classroom.queries.ts` — useClasses, useCreateClass, useStudents, useCreateStudent, useSessionAttendance, useEndSession, useTodaysSessionsForClass
- `NewClassModal.tsx`
- `ClassList.tsx`
- `NewStudentModal.tsx`
- `RosterTab.tsx`
- `StudentSidePanel.tsx`
- `CreateSessionModal.tsx`
- `AttendanceTab.tsx`
- `AttendanceSheet.tsx` — reducer + per-student toggle buttons + outbox wiring
- `ClassHub.tsx` — tabbed (Overview / Roster / Attendance)

Steps:
1. Reducer + tests (TDD)
2. API + queries
3. Each component in order: ClassList, NewClassModal, NewStudentModal, RosterTab, StudentSidePanel, CreateSessionModal, AttendanceTab, AttendanceSheet, ClassHub
4. Verify full flow: create class → add students → create session → toggle attendance → reload → persists
5. Commit per major chunk

### Task 13: Manual verification

- [ ] `pnpm typecheck` → 0
- [ ] `pnpm lint` → 0
- [ ] `pnpm test` → 0
- [ ] `pnpm build` → success
- [ ] Sign up → sign in flow works
- [ ] Create class → add 5 students → create session → toggle attendance → reload → persists
- [ ] Offline toggle: outbox row appears, reconnect → flushes
- [ ] Lighthouse PWA audit ≥ 90
- [ ] `npx -y @insforge/cli diagnose advisor --severity critical` → 0

Final commit: `chore: spec 1 verification complete`
