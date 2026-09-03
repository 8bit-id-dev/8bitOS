# 8bitOS — Foundation Documents

**Versi:** 1.0
**Tanggal:** 2026-09-03
**Status:** Final — fondasi dokumentasi produk 8bitOS

Dokumen-dokumen di folder ini adalah **fondasi produk** 8bitOS — spesifikasi tingkat produk, alur kerja, modul, arsitektur, desain, interaksi, IA, dan wireframe. Acuan resmi untuk semua spec implementasi (Spec 1 sudah selesai, Spec 2–5 menyusul).

---

## Daftar Dokumen

| # | Judul | Tipe | Status |
|---|---|---|---|
| 01 | [Product Foundation](./01-product-foundation.md) | Identitas, visi, misi, siklus, roadmap | Final |
| 02 | [Teacher Workflow Map](./02-teacher-workflow-map.md) | Alur harian guru + data per fase | Final |
| 03 | [Module Specs](./03-module-specs.md) | Spesifikasi 11 modul (A–I) | Final |
| 04 | [System Architecture](./04-system-architecture.md) | 5 layer, offline-first, hardware MatePad | Final |
| 05 | [UI/UX Design System](./05-uiux-design-system.md) | Tokens, komponen, tipografi, ikon | Final |
| 06 | [Interaction Flow & User Journey](./06-interaction-flow.md) | Mental model session-based, stylus-first | Final |
| 07 | [Information Architecture & Screen Map](./07-information-architecture.md) | Route tree, hierarki layar, navigasi | Final |
| 08 | [Screen Specification & Wireframe Blueprint](./08-screen-specifications.md) | 17 wireframe ASCII siap-acuan | Final |

Dokumen teknis pendukung di folder lain:

- `docs/decisions/` — design system (04), tech stack (06), data model (07), InsForge setup (08)
- `docs/specs/` — spec implementation (saat ini: `2026-09-03-8bithos-spec-1.md`)
- `docs/plans/` — implementation plan (saat ini: `2026-09-03-8bithos-spec-1-implementation.md`)

---

## Urutan Baca yang Disarankan

Untuk konteks produk → implementasi:

1. **01 Product Foundation** — pahami dulu apa 8bitOS dan untuk siapa
2. **02 Teacher Workflow Map** — alur harian guru, fase RENCANA→ARSIP
3. **03 Module Specs** — 11 modul, masing-masing dengan acceptance criteria
4. **04 System Architecture** — bagaimana sistem dibangun (5 layer, offline-first)
5. **05 UI/UX Design System** — bahasa visual pixel-monochrome
6. **06 Interaction Flow** — bagaimana guru berinteraksi, stylus-first
7. **07 IA & Screen Map** — struktur halaman dan route
8. **08 Screen Specifications** — wireframe siap-acuan per layar

Untuk developer mulai coding Spec 1, cukup baca:

- 03 (acceptance Spec 1)
- 05 (komponen yang sudah dibangun)
- 07 (route + IA)
- 08 (wireframe)
- `docs/specs/2026-09-03-8bithos-spec-1.md` (acceptance implementasi)

---

## Ringkasan Tiap Dokumen

### 01 — Product Foundation
- **Identitas:** 8bitOS = Teacher Operating System
- **Tagline:** *One Device. One Workspace. Complete Teaching Workflow.*
- **Siklus:** RENCANA → PERSIAPAN → PELAKSANAAN KBM → ASESMEN → ANALISIS → EVALUASI → ARSIP
- **11 modul** (A–I) dipetakan ke fase
- **Roadmap 4 phase:** Foundation → Teaching Workflow → Intelligence → Device Integration

### 02 — Teacher Workflow Map
- **Master Workflow Diagram** (PREPARE → TEACH → ASSESSMENT → ADMINISTRATION → ARCHIVE)
- **Peta hari guru** (morning dashboard → KBM → end of day)
- **3 user flow Spec 1** detail
- **Daily Report otomatis** di akhir KBM
- **Launcher mode** mockup

### 03 — Module Specs
Setiap modul punya: tujuan, layar, data, acceptance criteria, spec target.

- **A Dashboard** (Spec 1 ✅)
- **B Classroom** — B1 List (✅), B2 Hub (✅), B3 Roster (✅), B4 Attendance (✅), B5 Notes (⏳), B6 Session Report (⏳), B7/B8 CRUD (⏳)
- **C Planner** (Spec 2)
- **D1 Notes · D2 Whiteboard · D3 Browser** (Spec 2–3)
- **E Assessment · F Gradebook** (Spec 3)
- **G Document Center** (Spec 4)
- **H AI Assistant** (Spec 4)
- **I Launcher Mode** (Phase 4)

### 04 — System Architecture
- **5 layer** (Presentation → Workspace → Assessment → Productivity → AI)
- **Hardware target:** Huawei MatePad Mini, 6–8GB RAM, 128–256GB storage
- **Frontend stack:** React 18 + TS 5 + Vite 5 + Tailwind 3 + Zustand + TanStack Query + IndexedDB
- **Backend:** InsForge (Postgres + RLS + Storage + AI gateway)
- **Offline-first:** service worker + IndexedDB outbox
- **Launcher mode:** Capacitor + custom Android plugin

### 05 — UI/UX Design System
- **Pixel-monochrome:** `#050505` / `#ffffff` + 5 abu-abu
- **Tipografi:** Pixelify Sans (UI) + Inter (body)
- **2px border, hard offset shadow, no rounded**
- **8 komponen pixel** (Button, Card, Input, Modal, StatusPill, EmptyState, ConfirmDialog, Sidebar)
- **Sidebar kiri 80px** dengan 5 slot
- **Acceptance Spec 1** — checklist terpenuhi

### 06 — Interaction Flow
- **Session-Based Teaching** — setiap KBM = Teaching Session dengan identitas
- **Context Preservation** — kelas & sesi selalu melekat
- **Stylus-first** — handwriting, anotasi, rumus, grading
- **Auto Save philosophy** — *Don't Make Teacher Save*
- **Core loop:** DISCOVER → PREPARE → TEACH → CAPTURE → ASSESS → REVIEW → SAVE → CONTINUE
- **UX North Star:** *Technology invisible*

### 07 — IA & Screen Map
- **6 domain:** HOME/CLASS/TEACH/ASSESS/LIBRARY/SYSTEM
- **Route tree lengkap** (Spec 1 aktif + planned)
- **Hub-and-Spoke** — ClassHub adalah hub
- **Modal vs page decision** rules
- **Master+Detail** untuk tablet
- **4 screen state** per layar: Default/Empty/Loading/Error
- **Back navigation** context-aware

### 08 — Screen Specifications
- **17 wireframe ASCII** dengan Screen ID: HOME-01, CLASS-01..04, WORK-01..05, NOTES-01..02, TOOLS-01
- **Class Mode** workspace KBM
- **Stylus interaction:** pen toolbar, gesture system, pressure
- **Component priority** P0/P1/P2 untuk MVP

---

## Implementation Status (Spec 1)

| Wireframe | Status | File |
|---|---|---|
| HOME-01 Dashboard | ✅ | `src/features/dashboard/DashboardScreen.tsx` |
| CLASS-01 Class List | ✅ | `src/features/classroom/ClassList.tsx` |
| CLASS-02 Class Hub | ✅ | `src/features/classroom/ClassHub.tsx` |
| CLASS-03 Attendance | ✅ | `src/features/classroom/AttendanceSheet.tsx` |
| Sidebar 5 slot | ✅ | `src/shared/components/Dock.tsx` |
| Design tokens | ✅ | `src/shared/styles/{tokens,globals}.css` + `tailwind.config.ts` |
| 8 pixel components | ✅ | `src/shared/components/` |
| 5 icon SVG | ✅ | `src/shared/components/icons.tsx` |
| OrientationGuard | ✅ | `src/app/OrientationGuard.tsx` |
| Offline outbox (absensi) | ✅ | `src/shared/db/{outbox,flushOutbox}.ts` |

**Spec 1 verification:**

- TypeScript: clean
- Tests: 9/9 pass
- Production build: 453 KiB PWA precache
- PWA installable + service worker aktif

**Spec 1 belum:** apply migrations 0001–0005 ke InsForge (blocked: butuh admin API key — sudah pernah di-paste `uak_pmO1JMP7ySzvBtHOUddX-J8iw3ma3xluugy6opMaho4` tapi reported invalid, kemungkinan env var name salah atau key perlu reissue).

---

## Roadmap Implementasi

| Spec | Fokus | Status |
|---|---|---|
| 1 | Foundation (Shell + Dashboard + Classroom) | ✅ Selesai |
| 2 | Teaching Workflow (Planner + Notes + Session Report + Student CRUD) | ⏳ Berikutnya |
| 3 | Assessment + Gradebook + Whiteboard + Browser | ⏳ |
| 4 | Document Center + AI Assistant + Global Search + Command Palette | ⏳ |
| 5+ | Launcher Mode + multi-device sync | ⏳ Phase 4 |

---

## Prinsip Panduan

Setiap keputusan pengembangan harus konsisten dengan:

1. **Membantu guru bekerja lebih cepat** (Doc 01)
2. **Mengurangi perpindahan aplikasi** (Doc 02)
3. **Sesuai acceptance modul** (Doc 03)
4. **Arsitektur 5 layer & offline-first** (Doc 04)
5. **Pixel-monochrome + tap target ≥44px** (Doc 05)
6. **Context preservation + auto-save** (Doc 06)
7. **Maks 3-level navigation, master+detail** (Doc 07)
8. **Wireframe siap-acuan** (Doc 08)

---

## Visi & Slogan

> **One Device. One Workspace. Complete Teaching Workflow.**

> **8bitOS — Everything a teacher needs, in one workspace.**

---

*Dokumen ini akan diperbarui setiap ada spec baru yang selesai atau dokumen foundation baru.*
