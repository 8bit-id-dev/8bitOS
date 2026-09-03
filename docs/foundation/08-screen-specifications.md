# Dokumen 08 — 8bitOS Detailed Screen Specification & Wireframe Blueprint

**Status:** Draft Final
**Versi:** 1.0
**Tanggal:** 2026-09-03
**Tipe:** Spesifikasi layar + wireframe ASCII siap-acuan untuk UI/UX, frontend, component development

> Dokumen ini menerjemahkan Information Architecture (Dokumen 07) dan Interaction Flow (Dokumen 06) menjadi spesifikasi layar yang dapat langsung digunakan sebagai acuan UI design, wireframing, frontend development, navigasi, implementasi stylus, dan MVP. Prinsip utama: **8bitOS adalah satu operating environment untuk aktivitas kerja guru, bukan kumpulan aplikasi.**

---

## 1. Tujuan Dokumen

Dokumen 08 menjadi acuan langsung untuk:

- UI/UX design
- Wireframing
- Frontend development
- Component development
- Responsive layout
- Navigasi aplikasi
- Implementasi stylus
- Pengembangan MVP

---

## 2. Prinsip Screen Architecture

Setiap layar 8bitOS mengikuti struktur:

```
┌─────────────────────────────────────┐
│ SYSTEM / CONTEXT BAR                │
├─────────────────────────────────────┤
│             CONTENT                 │
├─────────────────────────────────────┤
│ CONTEXT ACTION / TOOLBAR            │
└─────────────────────────────────────┘
```

Untuk layar utama:

```
┌─────────────────────────────────────┐
│ 8bitOS              TIME     STATUS │
├─────────────────────────────────────┤
│          TODAY / DASHBOARD          │
│  [Class] [Attendance] [Notes]       │
│  [Materials] [Quiz] [Assessment]    │
├─────────────────────────────────────┤
│ HOME   CLASS   WORK   NOTES   MORE  │
└─────────────────────────────────────┘
```

---

## 3. Global UI Layout

### 3.1 Desktop / Tablet Landscape

```
┌──────────────┬───────────────────────────────────────────┐
│              │ 8bitOS · 08:42 · ● Battery                │
│   HOME       ├───────────────────────────────────────────┤
│   CLASSES    │                                           │
│   WORK       │             MAIN CONTENT                  │
│   NOTES      │                                           │
│   TOOLS      │                                           │
│   SETTINGS   │                                           │
├──────────────┴───────────────────────────────────────────┤
│ Context / Quick Actions                                   │
└─────────────────────────────────────────────—───────────┘
```

**Sidebar:** lebar 72–88px, icon only default, icon+label saat expanded.

**Spec 1:** lebar 80px (token `--sidebar-w`), icon + label stacked, mode icon+label selalu aktif.

---

## 4. Global Navigation

6 root domain:

| Root | Fungsi |
|---|---|
| HOME | Dashboard aktivitas hari ini |
| CLASS | Kelas, siswa, absensi, aktivitas kelas |
| WORK | Materi, latihan, quiz, tugas, assessment |
| NOTES | Catatan pribadi, rapat, lesson notes, handwriting |
| TOOLS | Browser, timer, calculator, file viewer, printer/export |
| SETTINGS | Pengaturan sistem |

**Spec 1:** 5 slot sidebar (HOME/CLASS/WORK/TOOLS/SYSTEM), WORK dipakai sebagai placeholder sampai modul C–F siap.

---

## 5. Screen Map

```
8bitOS
├── HOME       → Dashboard, Today, Quick Actions
├── CLASS      → Class List, Class Detail, Student List, Student Detail, Attendance
├── WORK       → Work Dashboard, Materials, Browser, Practice, Quiz, Quiz Session, Assessment, Gradebook, Reports
├── NOTES      → Notes Home, Note Editor, Meeting Notes, Handwriting
├── TOOLS      → Browser, Timer, Calculator, Files, Print/Export
└── SETTINGS   → General, Appearance, Stylus, Data, About
```

---

## 6. Screen Specification — HOME

### 6.1 Dashboard

**Screen ID:** HOME-01

**Tujuan:** Gambaran kondisi kerja guru dalam satu pandangan.

```
┌──────────────────────────────────────────────────────────┐
│ 8bitOS                              08:42  ◐              │
├──────────────────────────────────────────────────────────┤
│  GOOD MORNING · DIMAS                                    │
│                                                          │
│  TODAY                                                   │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐             │
│  │ 08:00     │ │ 10:00     │ │ 13:00     │             │
│  │ X IPA 1   │ │ X IPA 2   │ │ XI IPS 1  │             │
│  │ Math      │ │ Math      │ │ Meeting   │             │
│  └───────────┘ └───────────┘ └───────────┘             │
│                                                          │
│  QUICK ACTION                                            │
│  [ ATTENDANCE ] [ NOTE ] [ QUIZ ] [ BROWSER ]           │
│                                                          │
│  RECENT                                                  │
│  ──────────────────────────────────────────────────────  │
│  Quadratic Equations                         08:12       │
│  XI IPA Attendance                          Yesterday     │
└──────────────────────────────────────────────────────────┘
```

**Komponen:** Greeting · Current time · Today's schedule · Quick actions · Recent activities.

**Spec 1 file:** `src/features/dashboard/DashboardScreen.tsx`.

---

## 7. CLASS

### 7.1 Class List — CLASS-01

```
┌──────────────────────────────────────────────────────────┐
│ CLASS                                      + NEW CLASS   │
├──────────────────────────────────────────────────────────┤
│ SEARCH CLASS...                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ X IPA 1                                               │ │
│ │ Mathematics · 32 Students               →            │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ X IPA 2                                               │ │
│ │ Mathematics · 31 Students               →            │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

**Spec 1 file:** `src/features/classroom/ClassList.tsx`.

### 7.2 Class Detail (Class Hub) — CLASS-02

```
┌──────────────────────────────────────────────────────────┐
│ ← X IPA 1                                               │
├──────────────────────────────────────────────────────────┤
│ X IPA 1 · Mathematics · 32 Students                     │
│ [ ATTENDANCE ] [ STUDENTS ] [ MATERIALS ] [ QUIZ ]       │
│ [ GRADEBOOK ] [ NOTES ] [ HISTORY ]                      │
└──────────────────────────────────────────────────────────┘
```

**Spec 1 file:** `src/features/classroom/ClassHub.tsx` (4 tab: Overview/Roster/Attendance/Notes).

### 7.3 Attendance — CLASS-03

Target: ≤ 30 detik per kelas.

```
┌──────────────────────────────────────────────────────────┐
│ ← ATTENDANCE                    X IPA 1       02 SEP     │
├──────────────────────────────────────────────────────────┤
│ 32 STUDENTS · 30 PRESENT                                 │
│ SEARCH STUDENT...                                        │
│ ☑ Ahmad    ☑ Budi    ☑ Citra    ☐ Deni    ☑ Eka          │
├──────────────────────────────────────────────────────────┤
│ PRESENT 30   ABSENT 1   LATE 1          [ SAVE ]        │
└──────────────────────────────────────────────────────────┘
```

**Interaction:** tap status, long press student detail, stylus checkbox + quick mark + handwriting note.

**Spec 1 file:** `src/features/classroom/AttendanceSheet.tsx` (4-toggle H/I/S/A).

### 7.4 Student Detail — CLASS-04

```
┌──────────────────────────────────────────────────────────┐
│ ← STUDENT                                                │
├──────────────────────────────────────────────────────────┤
│ AHMAD · X IPA 1                                          │
│ ATTENDANCE 92%                                           │
│ ACADEMIC · Average 84                                    │
│ RECENT ACTIVITY                                          │
│   Quiz 01         88                                     │
│   Assignment 02   82                                     │
│ NOTES · [ Add private note ]                             │
└──────────────────────────────────────────────────────────┘
```

**Spec target:** Spec 2.

---

## 8. WORK

### 8.1 Work Dashboard — WORK-01

```
┌──────────────────────────────────────────────────────────┐
│ WORK                                                     │
├──────────────────────────────────────────────────────────┤
│ WHAT ARE YOU WORKING ON?                                 │
│ [ MATERIAL ]    [ PRACTICE ]                             │
│ [ QUIZ ]        [ ASSESSMENT ]                           │
│ [ GRADEBOOK ]   [ REPORT ]                               │
│ RECENT · Persamaan Kuadrat (Quiz) · Trigonometri (Material)│
└──────────────────────────────────────────────────────────┘
```

### 8.2 Materials — WORK-02

```
┌──────────────────────────────────────────────────────────┐
│ MATERIALS                                  + ADD         │
├──────────────────────────────────────────────────────────┤
│ SEARCH MATERIAL...                                       │
│ FILTER · [ALL] [PDF] [WEB] [NOTE] [FILE]                 │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ PERSAMAAN KUADRAT · Math · X IPA · PDF · 12 pages    │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 8.3 Quiz Builder — WORK-03

```
┌──────────────────────────────────────────────────────────┐
│ ← QUIZ BUILDER                            SAVE / START   │
├──────────────────────────────────────────────────────────┤
│ TITLE · Quiz Persamaan Kuadrat                           │
│ CLASS · X IPA 1                                          │
│ QUESTIONS                                                │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 01  Multiple Choice · x² - 4x + 4 = 0                 │ │
│ └──────────────────────────────────────────────────────┘ │
│ [+ ADD QUESTION]                                         │
└──────────────────────────────────────────────────────────┘
```

### 8.4 Quiz Session — WORK-04

```
┌──────────────────────────────────────────────────────────┐
│ QUIZ — PERSAMAAN KUADRAT                     12:32       │
├──────────────────────────────────────────────────────────┤
│ 28 / 32 STUDENTS                                         │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                    │
│ │ 01 │ │ 02 │ │ 03 │ │ 04 │ │ 05 │                    │
│ │ ✓  │ │ ✓  │ │ …  │ │ ✓  │ │ —  │                    │
│ └────┘ └────┘ └────┘ └────┘ └────┘                    │
│                       [ END QUIZ ]                       │
└──────────────────────────────────────────────────────────┘
```

### 8.5 Gradebook — WORK-05

```
┌────────────┬─────────┬─────────┬─────────┬─────────┬────────┐
│ STUDENT    │ QUIZ 01 │ QUIZ 02 │ TASK 01 │ MIDTERM │ FINAL  │
├────────────┼─────────┼─────────┼─────────┼─────────┼────────┤
│ Ahmad      │ 88      │ 84      │ 90      │ 82      │ 86     │
│ Budi       │ 72      │ 80      │ 78      │ 75      │ 76     │
│ Citra      │ 94      │ 92      │ 90      │ 96      │ 93     │
│ Deni       │ 80      │ 75      │ 82      │ 79      │ 79     │
└────────────┴─────────┴─────────┴─────────┴─────────┴────────┘
```

Stylus: cell select, input nilai, catatan, drag-fill.

---

## 9. NOTES

### 9.1 Notes Home — NOTES-01

```
┌──────────────────────────────────────────────────────────┐
│ NOTES                                      + NEW NOTE    │
├──────────────────────────────────────────────────────────┤
│ SEARCH NOTES...                                          │
│ TODAY                                                    │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Rapat Kurikulum · 08:15                              │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Ide Pembelajaran · Yesterday                         │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 9.2 Note Editor — NOTES-02

```
┌──────────────────────────────────────────────────────────┐
│ ← NOTE                              SAVE     ⋮           │
├──────────────────────────────────────────────────────────┤
│ RAPAT KURIKULUM                                          │
│ Agenda · 1. Evaluasi pembelajaran · 2. Persiapan asesmen │
│ ──────────────────────────────────────────────────────  │
│ [ HANDWRITE AREA ]                                       │
├──────────────────────────────────────────────────────────┤
│ ✎ PEN  🖊 HIGHLIGHT  ERASER  UNDO  REDO                  │
└──────────────────────────────────────────────────────────┘
```

---

## 10. TOOLS

### 10.1 Built-in Browser — TOOLS-01

```
┌──────────────────────────────────────────────────────────┐
│ ←  →  ⟳   SEARCH / URL                         ⋮         │
├──────────────────────────────────────────────────────────┤
│                  WEB CONTENT                             │
├──────────────────────────────────────────────────────────┤
│ + SAVE        + NOTE        SCREENSHOT       SHARE       │
└──────────────────────────────────────────────────────────┘
```

Workflow: Web page → `[SAVE MATERIAL]` → Material Library, atau `[ADD TO NOTE]` → Note Editor.

### 10.2 Timer (floating overlay)

```
┌──────────────────────────────────────┐
│ Content                              │
│                     ┌─────────────┐  │
│                     │   14:32     │  │
│                     │     ●       │  │
│                     └─────────────┘  │
└──────────────────────────────────────┘
```

### 10.3 Quick Action Toolbar (tablet)

```
┌────────────────────────────────────────────┐
│  +  ATTENDANCE   NOTE   QUIZ   TIMER       │
└────────────────────────────────────────────┘
```

---

## 11. Command Palette (Spec 4)

Shortcut `Ctrl+K` atau swipe down.

```
┌────────────────────────────────────────────┐
│  SEARCH 8bitOS...                          │
│  > attendance                              │
│  ────────────────────────────────────────  │
│  Mark Attendance                           │
│  Open X IPA 1                              │
│  New Attendance                            │
└────────────────────────────────────────────┘
```

---

## 12. Modal System

Minimal. Tanpa modal bertingkat.

```
┌──────────────────────────────────────┐
│       CONFIRM ATTENDANCE              │
│  Save attendance for X IPA 1?         │
│       [ CANCEL ]   [ SAVE ]           │
└──────────────────────────────────────┘
```

**Spec 1:** `ConfirmDialog` + `PixelModal` (480px max-width, ESC + backdrop close).

---

## 13. State Layar

### 13.1 Empty State
```
──────────────
    NO NOTES
Create your first note.
    [ + NEW NOTE ]
──────────────
```

### 13.2 Loading State
```
[████░░░░░░] 40%
```
atau `LOADING…` (pixel font).

### 13.3 Error State
```
┌──────────────────────────────────────┐
│ ERROR                                │
│ Something went wrong.                │
│ [ TRY AGAIN ]                        │
└──────────────────────────────────────┘
```

Error harus jelaskan: apa yang gagal · apakah data aman · apa yang harus dilakukan.

---

## 14. Stylus Interaction

Stylus adalah first-class input, bukan fitur tambahan.

| Input Mode | Fungsi |
|---|---|
| Touch | Navigation, tap, scroll |
| Stylus | Handwriting, annotation, drawing, selection, signature |

**Pressure:** jika hardware mendukung, light pressure → thin, heavy → thick.

### 14.1 Pen Toolbar

```
┌─────────────────────────────────────────────┐
│ PEN │ HIGHLIGHT │ ERASER │ LASSO │ UNDO     │
└─────────────────────────────────────────────┘
```

Pen presets: 0.5 / 1.0 / 2.0 / 4.0 (monochrome).

### 14.2 Gesture System

| Gesture | Fungsi |
|---|---|
| Tap | Select |
| Double tap | Open/Edit |
| Long press | Context menu |
| Swipe | Navigate |
| Two-finger swipe | Scroll canvas |
| Stylus tap | Select |
| Stylus drag | Write |
| Pinch | Zoom |
| Two-finger tap | Undo |

---

## 15. Responsive Design

```
BREAKPOINT
  Portrait  → Bottom Navigation
  Landscape → Sidebar Navigation
```

**Spec 1:** OrientationGuard paksa landscape di tablet.

---

## 16. Design Tokens (Ref. Dokumen 05)

### 16.1 Colors

| Token | Hex |
|---|---|
| BLACK / bg | `#050505` |
| WHITE / fg | `#ffffff` |
| GRAY-100 | `#f5f5f5` |
| GRAY-300 | `#d4d4d4` |
| GRAY-500 | `#737373` |
| GRAY-700 | `#404040` |
| GRAY-950 | `#0a0a0a` |

Tidak ada warna dekoratif default.

### 16.2 Typography

| Hierarki | Font | Weight |
|---|---|---|
| DISPLAY | Pixelify Sans | 700 |
| H1 | Pixelify Sans | 700 |
| H2 | Pixelify Sans | 600 |
| BODY | Inter | 400 |
| DATA | Pixelify Sans | 500 |

Prinsip: pixel untuk identity, readability untuk productivity. Jangan pakai pixel font untuk paragraf panjang.

### 16.3 Iconography

- Monochrome
- Geometric
- Pixel-inspired
- Sederhana
- 16/20/24 px grid
- SVG (bukan Unicode glyph)

**Spec 1:** 5 icon SVG pixel-style di `src/shared/components/icons.tsx`.

---

## 17. Component System

| Kategori | Komponen |
|---|---|
| Action | Button, IconButton, QuickAction |
| Container | Card, List, ListItem, Tab, DataTable |
| Form | Input, SearchInput, Select, Checkbox, Radio, Toggle |
| Overlay | Dialog, BottomSheet, Toast, Tooltip |
| Nav | Toolbar, Sidebar, BottomNav |
| Domain | DrawingCanvas, MathField, BrowserView, NoteCanvas, StudentRow, Calendar, Timeline |

**Spec 1 built:** Button, Card, Input, Modal, StatusPill, EmptyState, ConfirmDialog, Sidebar.

**High-priority reusable:**

```tsx
<QuickAction icon="attendance" label="Attendance" onClick={...} />
<StudentRow student={student} attendance="present" />
<NoteCanvas mode="pen" stylusEnabled />
<MathField mode="latex" />
```

---

## 18. Information Density

Prioritas:

```
Information Density
        ↓
Scanning Speed
        ↓
Action Speed
        ↓
Visual Decoration
```

Jangan terlalu besar seperti aplikasi mobile. Tablet = produktivitas.

---

## 19. Class Mode (Workspace KBM)

Saat `START CLASS`, masuk **Class Mode**:

```
┌───────────────────────────────┐
│ X IPA 1          08:05        │
│                               │
│ Attendance                    │
│ Material                      │
│ Notes                         │
│ Quiz                          │
│ Timer                         │
└───────────────────────────────┘
```

Class Mode jadi workspace khusus. Guru tidak perlu kembali ke dashboard.

**Hierarchy:**

```
8bitOS → CLASS MODE
  ├── Attendance
  ├── Lesson
  ├── Material
  ├── Browser
  ├── Notes
  ├── Timer
  ├── Quiz
  └── Assessment
```

---

## 20. Context Awareness

Saat guru berada di kelas (mis. X IPA 1), lalu membuka:

| Tool | Default context |
|---|---|
| Notes | "Create note for X IPA 1?" |
| Quiz | Class: X IPA 1 (pre-filled) |
| Attendance | X IPA 1 · Today |
| Material | X IPA 1 library filter |

Tujuan: kurangi input berulang.

---

## 21. Global Search (Spec 4)

Mencari seluruh workspace: Students, Classes, Notes, Materials, Quiz, Assessment, Files, Web bookmarks.

Contoh `persamaan`:

```
MATERIAL  · Persamaan Kuadrat
NOTE      · Ide pembelajaran persamaan
QUIZ      · Quiz Persamaan Kuadrat
CLASS     · X IPA 1
```

---

## 22. Print / Export

| Data | Format |
|---|---|
| Attendance | PDF, XLSX, CSV |
| Gradebook | PDF, XLSX |
| Quiz Result | PDF, XLSX |
| Notes | PDF |

---

## 23. Offline-First

```
LOCAL DATA → CHANGE → LOCAL DB → SYNC QUEUE → INTERNET → SERVER
```

Bukan `UI → Internet → DB` per interaksi.

**Spec 1:** outbox queue untuk absensi (IndexedDB), flush saat online.

---

## 24. MVP Screen Priority

### P0 — Wajib (Spec 1–2)

```
HOME
CLASS
CLASS DETAIL
ATTENDANCE
STUDENT LIST (Spec 2)
NOTES (Spec 2)
NOTE EDITOR (Spec 2)
WORK DASHBOARD (Spec 2)
MATERIAL (Spec 2)
QUIZ (Spec 3)
GRADEBOOK (Spec 3)
TIMER (Spec 2)
SETTINGS (Spec 4)
```

### P1

```
BUILT-IN BROWSER
QUIZ BUILDER
ASSESSMENT
REPORT
EXPORT
COMMAND PALETTE
```

### P2

```
Advanced handwriting
OCR
AI assistant
Advanced analytics
Automation
Cloud sync advanced
```

**Spec 1 sudah ada:** HOME (Dashboard), CLASS (Class List + Class Hub), ATTENDANCE (AttendanceSheet). Lainnya on roadmap.

---

## 25. Primary User Flow

```
OPEN 8bitOS
  ↓
HOME
  ↓
START CLASS
  ↓
CLASS MODE
  ↓
ATTENDANCE → MATERIAL → TEACH → NOTES → QUIZ → GRADE → REPORT
  ↓
END CLASS
```

---

## 26. Core UX Principle

Setiap layar menjawab satu pertanyaan:

> "Apa yang ingin dilakukan guru sekarang?"

Bukan "Fitur apa yang ingin kita tampilkan?"

---

## 27. Final Wireframe — 8bitOS

```
╔══════════════════════════════════════════════════════╗
║ 8bitOS                          08:42      ◐         ║
╠════════╦═════════════════════════════════════════════╣
║  HOME  ║       X IPA 1 — CLASS MODE                ║
║ CLASS  ║   ┌──────────┐ ┌──────────┐ ┌──────────┐   ║
║ WORK   ║   │ ATTEND   │ │ MATERIAL │ │ NOTES    │   ║
║ NOTES  ║   └──────────┘ └──────────┘ └──────────┘   ║
║ TOOLS  ║   ┌──────────┐ ┌──────────┐ ┌──────────┐   ║
║ SETTING║   │ BROWSER  │ │ QUIZ     │ │ TIMER    │   ║
║        ║   └──────────┘ └──────────┘ └──────────┘   ║
║        ║   RECENT / CLASS ACTIVITY                  ║
╠════════╩═════════════════════════════════════════════╣
║  + QUICK ACTION   ATTENDANCE   NOTE   QUIZ   TIMER  ║
╚══════════════════════════════════════════════════════╝
```

---

## 28. Design Philosophy

8bitOS harus terasa seperti **Operating System**, bukan LMS, absensi, nilai, notes, browser, atau quiz app. Semua adalah **subsystem** dari satu environment.

```
            ┌───────────────┐
            │    8bitOS     │
            └───────┬───────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
      CLASS        WORK        NOTES
        │           │           │
    Attendance   Material   Handwriting
    Students     Browser    Meeting
    Class Mode   Quiz       Lesson
                 Gradebook
                 Assessment
                    │
              TEACHER WORK
                    │
                ONE DEVICE
                    │
                ONE SYSTEM
```

> **Slogan desain:** 8bitOS — Everything a teacher needs, in one workspace.

---

## 29. Implikasi Implementasi Spec 1

| Wireframe | Status | File |
|---|---|---|
| HOME-01 Dashboard | ✅ | `src/features/dashboard/DashboardScreen.tsx` |
| CLASS-01 Class List | ✅ | `src/features/classroom/ClassList.tsx` |
| CLASS-02 Class Hub | ✅ | `src/features/classroom/ClassHub.tsx` |
| CLASS-03 Attendance | ✅ | `src/features/classroom/AttendanceSheet.tsx` |
| CLASS-04 Student Detail | ⏳ Spec 2 | — |
| WORK-01..05 | ⏳ Spec 2–3 | — |
| NOTES-01..02 | ⏳ Spec 2 | — |
| TOOLS-01 Browser | ⏳ Spec 3 | — |
| Command Palette | ⏳ Spec 4 | — |
| Global Search | ⏳ Spec 4 | — |

**Spec 1 acceptance dari Dokumen 08:**

- [x] HOME-01 dengan 3 quick action slot aktif
- [x] CLASS-01 dengan list + count + subject chips
- [x] CLASS-02 dengan 4 tab + shortcut buttons
- [x] CLASS-03 dengan H/I/S/A toggle + hitungan
- [x] Modal & empty/loading/error state
- [x] Sidebar 5 slot
- [x] OrientationGuard landscape

---

## 30. Dokumen Lanjutan

Dokumen 08 ini menjadi blueprint langsung untuk UI. Dokumen berikutnya yang ideal:

- **Component Specification** — setiap komponen React/TypeScript dengan props, events, contoh
- **Frontend Component Architecture** — struktur folder + dependency graph + storybook

Sementara, Spesifikasi layar + wireframe ini sudah cukup untuk membangun Spec 1 dan merencanakan Spec 2–4.
