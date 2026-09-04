# Dokumen 09 — 8bitOS Design System Component Specification + Frontend Component Architecture

**Versi:** 1.0
**Status:** Draft Final
**Tanggal:** 2026-09-04
**Platform:** Web App → Capacitor Android
**Target Device:** Huawei MatePad Mini + Stylus
**Design Direction:** Clean Minimalist + Black & White + Pixel/8-bit Visual Language

> Spesifikasi teknis antara Design System dan Frontend Architecture. Prinsip: **Build once, reuse everywhere.**

---

## 1. Tujuan Dokumen

Memastikan seluruh layar menggunakan bahasa visual konsisten, menghindari UI ad-hoc, komponen reusable antar-modul, optimasi stylus, nyaman di tablet, mempermudah pengembangan React/TypeScript, siap Capacitor, dan fitur baru tanpa ubah fondasi UI.

## 2. Design Philosophy

8bitOS bukan aplikasi game — elemen 8-bit adalah visual identity, bukan gamifikasi.

```
FUNCTION → CLARITY → EFFICIENCY → PIXEL IDENTITY
```

Fungsi > dekorasi; informasi mudah dipindai; interaksi cepat; pixel memperkuat identitas.

## 3. Design System Layers

```
┌───────────────────────────────┐
│       APPLICATION UI          │  AttendanceGrid, QuizBuilder, Gradebook
├───────────────────────────────┤
│        COMPONENTS             │  Card, Toolbar, Modal, Table, Tabs
├───────────────────────────────┤
│        PRIMITIVES             │  Button, Input, Icon, Badge, Divider
├───────────────────────────────┤
│         DESIGN TOKENS         │  Warna, typography, spacing, motion
└───────────────────────────────┘
```

## 4. Design Tokens

### 4.1 Color (monochrome)

| Token | Value | Fungsi |
|---|---|---|
| color.black | `#000000` | Primary |
| color.white | `#FFFFFF` | Background (light) / Primary text (dark) |
| color.gray-950 | `#111111` | Dark surface |
| color.gray-900 | `#1A1A1A` | Primary text |
| color.gray-700 | `#444444` | Secondary text |
| color.gray-500 | `#777777` | Muted |
| color.gray-300 | `#CCCCCC` | Border |
| color.gray-200 | `#E5E5E5` | Divider |
| color.gray-100 | `#F5F5F5` | Surface |

Status dibedakan via **icon, label, pattern, border, typography** — bukan hanya warna (aksesibilitas monokrom).

## 5. Typography

| Token | Penggunaan |
|---|---|
| display-xl | Dashboard hero (pixel) |
| display-lg | Page title (pixel) |
| display-md | Section title (pixel) |
| heading-lg | Card title |
| heading-md | Component title |
| body-lg / body-md / body-sm | Clean Sans |
| caption | Metadata |

**Prinsip:** pixel font hanya untuk angka besar, page title, status, label, navigasi, branding — **bukan paragraf panjang**. Math → KaTeX.

## 6. Spacing (basis 4px)

`4 xs · 8 sm · 12 md · 16 lg · 24 xl · 32 2xl · 48 3xl · 64 4xl`

## 7. Border & Radius

Default: `1px solid`, radius `8px`. Pixel mode (komponen tertentu): `radius 0` untuk karakter pixel. Tanpa rounded berlebihan.

## 8. Elevation

Default `0 2px 0 rgba(0,0,0,.08)`; modal `0 8px 24px rgba(0,0,0,.12)`. **Tanpa glassmorphism, tanpa gradient default.**

## 9. Iconography

Monochrome, line-based, stroke konsisten. 16/20/24/32/48px. Icon tidak boleh jadi satu-satunya indikator status.

## 10. Touch & Stylus

- Target minimum **44×44px** (recommended 48)
- Stylus priority: tapping, handwriting, drawing, selection, dragging, annotation, math input
- Avoid: tiny buttons, dense dropdowns, hover-only, drag target kecil

## 11-24. Components (spesifikasi per komponen)

**Primitives:** Button (Primary/Secondary/Ghost/Danger/Icon/Pixel; states default/hover/pressed/focus/disabled/loading), IconButton (tooltip + a11y label), Input (Text/Number/Search/Textarea/Date/Time), Select (bottom sheet > dropdown kecil di tablet), Checkbox, Radio, Switch, Badge, Avatar.

**Surface:** Card (TITLE / MENU / CONTENT), Panel (workspace besar), Sheet (tablet quick action/filter/detail), Modal (confirm + focused editing saja — bukan seluruh workflow).

**Navigation:** AppShell (Sidebar + TopBar + Workspace + QuickActions), Sidebar 11 item, TopBar (title/context/search/sync/profile), BottomNav (mode portrait saja).

**Workspace:** WorkspaceHeader (← CLASS, subject, + ACTIONS), Toolbar stylus-ready, SplitView (Browser+Notes, QB+Preview, Gradebook+Student, Plan+AI).

**Data:** DataTable (sticky header, h-scroll, sort, filter, keyboard, stylus), AttendanceGrid (Present/Late/Excused/Absent), GradeTable (inline edit, auto-calc, export, print).

**Editor:** RichTextEditor, MathEditor (LaTeX/fraction/powers/roots), MathField (Toolbar+Input+Preview+Suggestions), MathText (KaTeX renderer plain+inline+block).

**Teaching Board:** BoardCanvas + Pen/Highlighter/Eraser/Shape/Text/Math tools + UndoRedo + LayerManager. Input priority: stylus→handwriting, finger→navigation, keyboard→text.

**Assessment:** QuizBuilder (Header/QuestionList/QuestionEditor/TypeSelector/AnswerEditor/PointEditor/Preview), QuestionCard (Q01, points, options).

**Student:** StudentCard (name/class/attendance/score/quick action), StudentProfilePanel (Identity/Attendance/Assessment/Notes/Activity).

**Notes:** NotesWorkspace (NoteList/NoteEditor/NoteToolbar/TagSelector/AttachmentManager).

**Browser:** InternalBrowser (AddressBar/TabBar/WebView/BookmarkBar/HistoryPanel/Actions).

**AI:** AssistantPanel (PromptInput/SuggestionChips/ResponseView/ResultActions/ContextSelector) — context dari Lesson/Question/Student/Notes/Assessment/Browser.

**Feedback:** Toast (`✓ Saved`), ConfirmDialog destructive, EmptyState (pixel icon + CTA), LoadingState (skeleton > spinner).

## 25-34. Frontend Architecture

**Feature-based:**

```
src/
├── app/            # App.tsx, router, providers
├── components/     # ui/ layout/ navigation/ feedback/ forms/ editor/ tablet/
├── features/       # attendance/ planner/ browser/ notes/ board/ assessment/
│                   # gradebook/ documents/ ai/ (masing-masing: components/
│                   # hooks/ services/ types/ index.ts)
├── pages/          # composition layer only — no business logic
├── hooks/ services/ stores/ repositories/
├── lib/ types/ utils/
└── styles/         # tokens.css globals.css typography.css
```

**State:** UI (modal/sidebar/filters) · Feature (attendance/quiz/gradebook) · Server (students/classes) · Local Device (offline/drafts/board drawings/prefs).

**Data flow:** UI → Component → Feature Hook → Service → Repository → Local/Cloud.

**Offline states:** `● Synced · ◐ Saving · ○ Offline—saved locally · ↻ Syncing · ! Conflict`.

**Dependency rules:** Page→Feature→Component→Primitive (bukan sebaliknya). UI tak tahu database; primitive tak tahu feature; service tak akses React.

**Naming:** PascalCase components (`AttendanceGrid`), `useX` hooks, `xService`, `XRecord` types.

**Composition:** hindari file 1500 baris — pecah per komponen.

## 35. Reusability Matrix

| Component | Home | Classroom | Assessment | Gradebook | Notes |
|---|---|---|---|---|---|
| Button/Modal/SplitView/AI Panel | ✓ | ✓ | ✓ | ✓ | ✓ |
| DataTable | | ✓ | ✓ | ✓ | |
| StudentCard | | ✓ | ✓ | ✓ | ✓ |
| MathField/Toolbar | | ✓ | ✓ | | ✓ |

## 36-40. Responsive & Interaction

Prioritas: **MatePad Tablet → Desktop → Small Tablet**. Landscape primary (Sidebar+Workspace, SplitView, Gradebook), portrait supported (quick attendance, notes, student detail). Breakpoint: <768 small, 768–1023 tablet, 1024–1439 large, ≥1440 desktop — tapi layout juga menimbang available width, orientation, input type, workspace context.

Quick Actions global (Take Attendance / Start Quiz / New Note / Open Board / Timer / Browser / Add Assessment). **Class Mode**: Timer + Attendance + Board + Browser + Notes + Quiz + Quick Actions — navigasi disederhanakan, guru tidak keluar aplikasi selama KBM.

## 41. Accessibility (minimum)

Keyboard accessible · screen-reader labels · visible focus · touch target 44px · contrast tinggi · icon punya accessible name · error punya text · tidak bergantung warna.

## 42. Performance Rules

Component: tidak fetch langsung, tidak simpan business logic besar, memoization bila perlu, **lazy-load feature besar** (Browser, Board, Assessment, Documents, AI).

## 43. Tech Stack

React · TypeScript · Vite · Tailwind/CSS Variables · **KaTeX** · Capacitor.

## 44-46. Struktur, Lifecycle, Checklist

Folder final seperti §25. Setiap komponen besar wajib punya: Definition→Props→States→Events→A11y→Responsive→Loading→Error→Empty.

**Quality checklist:** visual (tokens, monokrom, pixel, typo, spacing) · interaction (44px, stylus/keyboard-friendly, focus/pressed) · state (loading/empty/error/disabled/success) · technical (TS, reusable, no business logic, no direct DB, responsive).

## 47-49. Priority

- **P0 Foundation:** Button, IconButton, Input, Select, Dialog, Toast, Card, Panel, AppShell, Sidebar, TopBar
- **P1 Core Teaching:** AttendanceGrid, StudentCard, Timer, MathField, MathText, RichTextEditor, DataTable, Toolbar
- **P2 Assessment:** QuestionCard, QuestionEditor, QuizBuilder, GradeTable, ResultSummary
- **P3 Advanced:** TeachingBoard, InternalBrowser, AI Assistant, DocumentViewer

## 50. Final Principle

> **"Minimal enough to disappear. Powerful enough to run the classroom."**

```
8bitOS
├── DESIGN SYSTEM (Tokens → Components)
└── FRONTEND ARCHITECTURE (Features → Services)
        ↓
    TEACHER OS (Prepare · Teach · Evaluate)
```

UI bersih, tenang, cepat, monokrom, profesional — pixel/8-bit sebagai identitas pembeda tanpa mengorbankan usability.

---

## 51. Implementasi Saat Ini (audit 2026-09-04)

| Spec | Implementasi | File |
|---|---|---|
| Tokens (Layer 1) | ✅ | `styles/tokens.css` + `tailwind.config.ts` |
| Primitives: Button/Input/Badge-pill | ✅ | `PixelButton`, `PixelInput`, `StatusPill` |
| Primitives: IconButton, Select, Checkbox, Radio, Switch, Toast | ⚠️ sebagian inline | backlog komponen terpisah |
| Surface: Card, Panel, Modal, Sheet | ✅ card/panel/modal; sheet = modal | — |
| Navigation: AppShell, Sidebar, TopBar | ✅ shell+sidebar; topbar = per-screen header | — |
| Data: AttendanceGrid, GradeTable | ✅ | `AttendanceSheet`, `Gradebook` |
| Editor: MathField/MathText (KaTeX) | ❌ | backlog P1 |
| Teaching Board (pen/marker/eraser/undo) | ✅ dasar | shape/text/math tool backlog |
| QuizBuilder + QuestionCard | ✅ | `AssessmentBuilder` |
| NotesWorkspace dual-mode | ✅ | `NotesScreen` + `HandwriteCanvas` |
| InternalBrowser | ✅ dasar | tabs/bookmark backlog |
| AI AssistantPanel | ✅ | `AiPanel` |
| Feedback: Confirm, Empty, Loading pixel | ✅ | `ConfirmDialog`, `EmptyState`, `PixelLoading` |
| Feature-based structure | ✅ | `src/features/*` |
| Offline states (synced/saving/pending) | ✅ | outbox + banner |
| Export CSV | ✅ | `exportCsv.ts` |
