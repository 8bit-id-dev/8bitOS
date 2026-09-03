# Decision: Spec 1 tech stack

**Date:** 2026-09-03
**Status:** DEFAULT — user can override per-item

## Frontend

- React 18 + TypeScript (strict, noUncheckedIndexedAccess)
- Vite 5 (PWA-ready)
- Tailwind CSS v3.4 (NOT v4)
- React Router v6 with HashRouter (works as PWA + future Capacitor WebView without server config)
- Zustand for client state
- TanStack Query v5 for server state

## Backend

- **InsForge** (managed Postgres + auth) — uses `@insforge/sdk`
- Alternative: Supabase, but InsForge is the default per Doc 01 §11
- Auth: email + password (no biometric in Spec 1 — defer to Capacitor phase)

## Local persistence

- IndexedDB via `idb` library
- Outbox queue for offline writes (attendance, future notes)

## PWA

- `vite-plugin-pwa` with `registerType: 'autoUpdate'`
- Landscape orientation locked
- **Dev URL:** `http://localhost:5173` (Vite default)
- **Deep links** like `http://localhost:5173/#/classroom/<id>` resolve without Vite fallback config (HashRouter)

## Tests

- Vitest + React Testing Library
- MSW (Mock Service Worker) for InsForge REST mocking
- happy-dom for component tests

## Navigation

- **Bottom Dock** with `HOME / CLASS / TEACH / TOOLS / SYSTEM` (Doc 06 §4)
- Spec 1 only routes HOME and CLASS
- TEACH / TOOLS / SYSTEM are greyed out with `[ SOON ]` until their own specs

## Orientation

- Landscape-locked via PWA manifest
- Portrait users see `[ ROTATE TABLET · LANDSCAPE ONLY ]` message
- No dual layout in Spec 1

## Design tokens (Doc 04 §15 + Doc 07 §32)

- Background: `#050505` (or `#000000` per Doc 07 §32 strict monochrome)
- Foreground: `#ffffff`
- Borders: `2px solid #ffffff`, never rounded
- Shadow: `4px 4px 0 0 #ffffff` (hard offset, no blur)
- Pixel-cut corners via `clip-path: polygon(...)`
- Focus ring: `2px dashed #ffffff`
- Strict monochrome — no decorative accent colors
