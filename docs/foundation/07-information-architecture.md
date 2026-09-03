# Dokumen 07 — 8bitOS Information Architecture & Screen Map

**Project:** 8bitOS
**Document Type:** Information Architecture & Screen Map
**Versi:** 1.1
**Status:** Final
**Tanggal:** 2026-09-03
**Platform Utama:** Huawei MatePad Mini
**Target User:** Guru
**Input Utama:** Touch + Stylus
**Design Direction:** Clean Minimalist · Black & White · Pixel-inspired UI

> Dokumen ini mendefinisikan bagaimana seluruh informasi dan fitur di dalam 8bitOS disusun agar guru dapat mengakses semua kebutuhan selama kegiatan mengajar tanpa harus keluar dari aplikasi. Revisi 1.1 menyelaraskan dengan detail IA terbaru: 6 domain (HOME/CLASS/TEACH/ASSESS/LIBRARY/SYSTEM), pola Master+Detail untuk tablet, Command Center, global search, persistent session indicator.

---

## 1. Tujuan Dokumen

Information Architecture 8bitOS dirancang berdasarkan prinsip **Teacher-first**. Struktur aplikasi tidak mengikuti kategori software tradisional, tetapi mengikuti aktivitas nyata seorang guru.

Urutan berpikir utama:

**Hari ini → Kelas → Aktivitas Mengajar → Siswa → Penilaian → Arsip**

Guru tidak perlu memikirkan "Saya harus membuka aplikasi apa?" tetapi cukup memikirkan "Apa yang sedang saya lakukan sekarang?" 8bitOS menyediakan alat sesuai konteks.

---

## 2. Prinsip Information Architecture

### 2.1 Activity-Based Architecture

Struktur aplikasi berpusat pada aktivitas guru. Dari halaman kelas, guru dapat langsung: absensi, membuka materi, browser, catatan, timer, kuis, nilai, data siswa. Tanpa berpindah aplikasi independen.

### 2.2 Context Preservation

```
XI A → Materi → Browser → Notes → Kembali
```

Sistem tetap memahami konteks: **XI A · Matematika · Pertemuan 04**.

### 2.3 Maximum Three-Level Navigation

Sebagian besar fungsi utama harus dapat dicapai maksimal dalam tiga tingkat navigasi.

```
Home → XI A → Attendance
Home → Assessment → Gradebook
```

Fitur yang sering digunakan idealnya hanya 1–2 langkah.

---

## 3. Struktur Utama 8bitOS — 6 Domain

```
8bitOS

├── HOME        → pusat aktivitas harian
├── CLASS       → manajemen kelas & siswa
├── TEACH       → workspace saat KBM
├── ASSESS      → quiz, nilai, analitik
├── LIBRARY     → materi, bank soal, dokumen
└── SYSTEM      → calendar, files, settings
```

---

## 4. Global Navigation (8bit Dock)

```
┌──────────────────────────────┐
│         ACTIVE SCREEN        │
├──────────────────────────────┤
│ HOME CLASS TEACH TOOLS SYSTEM│
└──────────────────────────────┘
```

Dock dirancang agar mudah dijangkau ibu jari maupun stylus. Di Spec 1 sidebar kiri menampilkan 5 slot tetap (HOME/CLASS/WORK/TOOLS/SYSTEM), sesuai implementasi awal. Domain TEACH/ASSESS/LIBRARY diakses via Class Hub (TEACH), Quick Action (ASSESS), atau planned tab (LIBRARY).

---

## 5. Level 0 — System Architecture

```
8bitOS

HOME
├── Today
├── Schedule
├── Quick Actions
├── Recent Activity
└── Upcoming Tasks

CLASS
├── Classes
├── Students
├── Attendance
├── Class Notes
└── Class History

TEACH
├── Teaching Session
├── Materials
├── Browser
├── Notes
├── Whiteboard
└── Presentation

ASSESS
├── Quiz
├── Assignment
├── Assessment
├── Gradebook
└── Student Progress

LIBRARY
├── Materials
├── Question Bank
├── Documents
├── Downloads
└── Bookmarks

SYSTEM
├── Calendar
├── Files
├── Print
├── Settings
└── Backup
```

---

## 6. HOME — Teacher Command Center

Home menjawab satu pertanyaan: **"Apa yang perlu saya lakukan sekarang?"**

```
HOME
├── Today          (current time, current class, next class, daily progress)
├── Schedule       (today, week, calendar)
├── Quick Actions  (attendance, notes, browser, timer, whiteboard, new quiz)
├── Recent         (recent classes, notes, documents)
└── Tasks          (ungraded, missing attendance, upcoming assessment)
```

**Spec 1 implementasi:** Today + Schedule + Quick Actions + Outbox pending (substitute Recent). Recent & Tasks → Spec 2.

---

## 7. CLASS — Classroom Management

```
CLASS
├── XI A
├── XI B
├── XI C
├── XII A
└── XII B
```

Memilih kelas membuka **Class Hub**.

---

## 8. Class Hub

```
XI A
Mathematics · 32 Students
TODAY · 08:00 – 09:30
[ START CLASS ]
```

Shortcut: Attendance, Students, Materials, Assessment, Notes, Gradebook, History.

---

## 9. Struktur Class Hub

```
CLASS
└── XI A
    ├── Overview
    ├── Attendance
    │   ├── Today
    │   ├── History
    │   └── Student Detail
    ├── Students
    │   ├── Student List
    │   └── Student Profile
    ├── Materials
    │   ├── Current Topic
    │   ├── Material Library
    │   └── Browser Resources
    ├── Assessments
    │   ├── Quiz
    │   ├── Assignment
    │   └── Test
    ├── Gradebook
    ├── Notes
    └── Class History
```

**Spec 1 implementasi:** Overview tab (ringkasan + mulai sesi + jadwal) + Roster tab. Attendance tab → AttendanceSheet (sub-route). Lainnya → Spec 2+.

---

## 10. Student Profile (Master + Detail)

```
STUDENT PROFILE
Name · Class · Student Number

├── Overview
├── Attendance
├── Grades
├── Assignments
├── Notes
└── History
```

Tujuan: seluruh informasi siswa di satu lokasi.

**Spec target:** Spec 2 (Student List + Student Profile).

---

## 11. TEACH — Teaching Workspace

`START CLASS` → masuk **Teaching Session**.

```
┌───────────────────────────────┐
│ XI A · Mathematics · 08:12    │
├───────────────────────────────┤
│       ACTIVE WORKSPACE        │
├───────────────────────────────┤
│ Material Browser Notes Timer  │
└───────────────────────────────┘
```

Session header: Class, Subject, Meeting, Timer, Session Status.

---

## 12. Teaching Session Screen

Header menampilkan identitas kelas. Toolbar bawah: 6–8 tool pintas. Content area dinamis (bisa browser, notes, whiteboard, kuis, absensi).

**Spec 1 implementasi:** Tidak ada halaman Teaching Session dedicated — absensi dialihkan via `/classroom/:classId/attendance/:sessionId` setelah START CLASS. Whiteboard & Notes tool → Spec 2–3 (sesuai desain session).

---

## 13. Teaching Tools

```
Teaching Tools
├── Materials
├── Browser
├── Notes
├── Whiteboard
├── Timer
├── Calculator
├── Files
├── Quiz
└── Attendance
```

Semua tool dapat dibuka tanpa menutup Teaching Session (Context Preservation).

---

## 14. Browser Architecture (Learning Browser)

```
BROWSER
├── Tabs
├── Search
├── Bookmarks
├── Downloads
└── Save to Library
```

Workflow: **Search → Open Resource → Save → Add to Lesson.**

Contoh: cari "latihan invers matriks kelas 11" → buka PDF → Save to `XI A / Matrix / Practice`.

**Spec target:** Spec 3.

---

## 15. Notes Architecture

```
NOTES
├── Quick Notes
├── Teaching Notes
├── Meeting Notes
├── Student Notes
└── Archive
```

Input: keyboard, stylus, handwriting, drawing, image, PDF annotation.

---

## 16. Whiteboard

```
WHITEBOARD
├── Blank Board
├── Grid
├── Graph
├── Imported Image
└── Imported PDF
```

Tool: Pen, Highlighter, Eraser, Shape, Text, Math, Undo, Redo. Save as: Lesson Note, Image, PDF, Class Archive.

**Spec target:** Spec 3.

---

## 17. ASSESS — Assessment System

```
ASSESS
├── Quiz
├── Assignment
├── Test
├── Question Bank
├── Gradebook
└── Analytics
```

---

## 18. Assessment Creation Flow

```
New Assessment
  ↓
Select Class
  ↓
Assessment Type
  ↓
Add Questions
  ↓
Configure
  ↓
Preview
  ↓
Start / Publish
```

Jenis: Quiz, Daily Test, Assignment, Midterm, Final Test, Practice.

**Spec target:** Spec 3.

---

## 19. Question Bank

```
QUESTION BANK
├── Subject
├── Grade
├── Topic
├── Difficulty
└── Question Type
```

Tipe: Multiple Choice, Complex MC, True/False, Short Answer, Essay. Reusable across kelas.

---

## 20. Gradebook

```
GRADEBOOK
Class
 ↓
Assessment
 ↓
Student
```

Tampilan grid (Excel-like):

```
         Quiz 1   Quiz 2   UH 1
Andi       80       90      85
Budi       75       82      80
Citra      90       94      92
```

Fitur: Edit Grade, Bulk Grade, Assessment Weight, Average, Export, Print.

---

## 21. LIBRARY

```
LIBRARY
├── Teaching Materials
├── Question Bank
├── Documents
├── Downloads
├── Bookmarks
└── Templates
```

---

## 22. Teaching Material Structure

```
Subject
 ↓
Grade
 ↓
Topic
 ↓
Resource
```

Contoh:

```
Mathematics
└── Grade XI
    └── Matrix
        ├── Theory.pdf
        ├── Presentation.pdf
        ├── Practice.pdf
        └── Web Resources
```

---

## 23. Files

```
FILES
├── Recent
├── Documents
├── Images
├── PDFs
├── Downloads
└── Class Files
```

File dapat dikaitkan dengan: Class, Lesson, Student, Assessment, Note.

---

## 24. Calendar

```
CALENDAR
├── Teaching Schedule
├── Assessment
├── School Events
├── Meetings
└── Tasks
```

View: Day, Week, Month, Agenda.

---

## 25. Print Center

```
PRINT CENTER
├── Documents
├── Student Lists
├── Attendance
├── Assessments
├── Grade Reports
└── Notes
```

Flow: Document → Preview → Printer → Print.

---

## 26. SYSTEM

```
SYSTEM
├── Settings
├── Storage
├── Backup
├── Sync
├── Printer
├── Appearance
└── About
```

---

## 27. Settings Architecture

```
SETTINGS
├── Profile
├── School
├── Classes
├── Subjects
├── Appearance
├── Stylus
├── Browser
├── Storage
├── Backup
├── Printer
└── System
```

---

## 28. Global Search

Shortcut: Search bar di header atau `Cmd/Ctrl+K`.

Mencari: Students, Classes, Materials, Notes, Assessments, Files, Web.

Contoh query "matrix":

```
MATERIAL
Matrix Theory

NOTE
XI A Matrix Meeting

ASSESSMENT
Quiz Matrix

FILE
matrix-practice.pdf

WEB
Search Web
```

**Spec target:** Spec 4.

---

## 29. Command Center

Trigger: ⌘ atau gesture. Power-user menjalankan fungsi tanpa berpindah layar.

Contoh command:

```
Open XI A
Start Attendance
Open Browser
New Note
Start Timer
Create Quiz
Print Attendance
```

---

## 30. Quick Action Button (FAB Global)

Tombol `+` global, context-aware.

Default (no context):

```
+ NEW
Note
Quiz
Assignment
Material
Student Note
Reminder
Whiteboard
```

Di dalam XI A (context: class):

```
+ NEW
Attendance
Class Note
Quiz
Assignment
Material
```

---

## 31. Screen Hierarchy (4 Levels)

| Level | Contoh |
|---|---|
| L1 — Root | HOME · CLASS · TEACH · SYSTEM |
| L2 — Workspace | Class Hub · Teaching Session · Library · Assessment · Calendar |
| L3 — Tool | Attendance · Browser · Notes · Whiteboard · Gradebook · Question Bank |
| L4 — Detail | Student Profile · Question Detail · Material Detail · Assessment Result · File Detail |

---

## 32. Complete Screen Map

```
8bitOS
├── HOME
│   ├── Today
│   ├── Schedule
│   ├── Tasks
│   ├── Recent
│   └── Quick Actions
│
├── CLASS
│   ├── Class List
│   └── Class Hub
│       ├── Overview
│       ├── Attendance
│       │   ├── Today
│       │   └── History
│       ├── Students
│       │   └── Student Profile
│       ├── Materials
│       ├── Assessments
│       ├── Gradebook
│       ├── Notes
│       └── History
│
├── TEACH
│   └── Teaching Session
│       ├── Materials
│       ├── Browser
│       ├── Notes
│       ├── Whiteboard
│       ├── Timer
│       ├── Calculator
│       ├── Files
│       ├── Quiz
│       └── Attendance
│
├── ASSESS
│   ├── Quiz
│   ├── Assignment
│   ├── Test
│   ├── Question Bank
│   ├── Gradebook
│   └── Analytics
│
├── LIBRARY
│   ├── Materials
│   ├── Question Bank
│   ├── Documents
│   ├── Downloads
│   ├── Bookmarks
│   └── Templates
│
└── SYSTEM
    ├── Calendar
    ├── Files
    ├── Print Center
    ├── Settings
    ├── Backup
    └── Sync
```

---

## 33. Teaching Session Flow

```
HOME
 ↓
TODAY
 ↓
XI A · 08:00 Mathematics
 ↓
START CLASS
 ↓
TEACHING SESSION
 ↓
END SESSION
 ↓
Attendance, Materials Opened, Notes, Whiteboard,
Assessment, Duration → Class History
```

---

## 34. Class History (Session Record)

```
XI A
02 SEP 2026 · 08:00–09:30

Topic:        Inverse Matrix
Attendance:   30 / 32
Materials:    3
Quiz:         1
Notes:        2
```

Session dapat dibuka kembali untuk replay aktivitas.

---

## 35. Screen State (4 Standar)

Setiap layar utama punya: **Default · Empty · Loading · Error**.

Contoh Attendance:

- Default: `32 Students · 30 Present`
- Empty: `No students added.`
- Loading: `Loading class...`
- Error: `Unable to load attendance. [RETRY]`

---

## 36. Tablet Layout — Master + Detail

Untuk tablet, banyak screen pakai pola Master + Detail (dua panel).

Notes:

```
┌─────────────┬─────────────────────────┐
│ Notes List  │       Note Editor       │
│ Note 1      │                         │
│ Note 2      │                         │
│ Note 3      │                         │
└─────────────┴─────────────────────────┘
```

Student:

```
┌─────────────┬─────────────────────────┐
│ Student     │ Student Profile         │
│ List        │ Attendance / Grades /   │
│ Andi        │ Notes                   │
│ Budi        │                         │
└─────────────┴─────────────────────────┘
```

Mengurangi perpindahan halaman.

---

## 37. Overlay Tools (Floating Panel)

Tool yang tidak perlu halaman penuh: Timer, Calculator, Quick Note, Command Center, File Picker. Tampil sebagai floating panel di atas workspace aktif.

```
┌───────────────────────────────┐
│       ACTIVE WORKSPACE        │
│                   ┌─────────┐ │
│                   │ TIMER   │ │
│                   │ 12:32   │ │
│                   └─────────┘ │
└───────────────────────────────┘
```

**Spec target:** Spec 2 (FAB + overlay panel).

---

## 38. Navigation Behavior Priority

```
1. Contextual navigation
2. Persistent dock
3. Back navigation
4. Command Center
5. Global Search
```

Hindari nested menu terlalu dalam.

---

## 39. Back Navigation (Context-Aware)

Tombol back kembali ke **konteks sebelumnya**, bukan sekadar route.

```
XI A → Student → Assessment
Back → Student (bukan Assessment Dashboard)
```

Context navigation adalah bagian penting dari UX.

---

## 40. Persistent Session Indicator

Jika guru keluar Teaching Session untuk tool lain, session tetap berjalan. Tampil sebagai mini indicator:

```
● XI A · 42:18
```

Tap → langsung kembali ke Teaching Session.

**Spec target:** Spec 2.

---

## 41. Screen Naming Convention

Pakai nama pendek & konsisten: Home, Class, Students, Attendance, Teach, Materials, Browser, Notes, Whiteboard, Quiz, Gradebook, Library, Files, Calendar, Settings.

Hindari istilah teknis seperti "Student Management Module", "Learning Resource Management", "Evaluation Management". UI 8bitOS harus terasa seperti operating system, bukan software administrasi sekolah.

---

## 42. Suggested Route Architecture

```
/                                    → Home / Dashboard (Spec 1)
/classroom                           → Class List (Spec 1)
/classroom/:classId                  → Class Hub (Spec 1)
/classroom/:classId/attendance/:sessionId → AttendanceSheet (Spec 1)

# Planned (Spec 2+)
/classroom/:classId/students
/classroom/:classId/students/:studentId
/classroom/:classId/materials
/classroom/:classId/assessments
/classroom/:classId/gradebook
/classroom/:classId/notes
/teach/:sessionId

/assessments
/question-bank
/library
/browser
/notes
/whiteboard
/files
/calendar
/print
/settings
```

---

## 43. Core Screen Inventory

Target MVP: 30–40 screen utama.

Prioritas:

```
Home
Class List · Class Hub · Attendance · Student List · Student Profile
Teaching Session · Material Viewer · Browser · Notes · Whiteboard
Assessment List · Assessment Editor · Quiz Runner · Question Bank · Gradebook
Library · Files · Calendar
Settings
```

---

## 44. MVP Screen Scope (Spec 1)

Wajib untuk MVP (Spec 1):

```
✅ Home
✅ Class List
✅ Class Hub (Overview + Roster tabs)
✅ Attendance
⬜ Student List     (Spec 2)
⬜ Teaching Session shell (Spec 2)
⬜ Browser (Spec 3)
⬜ Notes (Spec 2)
⬜ Whiteboard (Spec 3)
⬜ Quiz (Spec 3)
⬜ Gradebook (Spec 3)
⬜ Files (Spec 4)
⬜ Settings (Spec 4)
```

Spec 1 saat ini sudah memenuhi Home, Class List, Class Hub, Attendance. Lainnya on roadmap.

---

## 45. Information Architecture Philosophy

8bitOS bukan kumpulan fitur, tapi **lingkungan kerja guru**. Hubungan fitur mengikuti aktivitas nyata:

```
Teacher
 ↓
Class
 ↓
Teaching Session
 ↓
Teaching Tools
 ↓
Student Activity
 ↓
Assessment
 ↓
Grade
 ↓
History
```

---

## 46. Target Experience

```
Guru membuka tablet
↓
8bitOS menunjukkan jadwal hari ini
↓
Guru memilih kelas
↓
START CLASS
↓
Attendance → Material → Whiteboard → Browser → Quiz → Grade
↓
END CLASS
↓
Semua aktivitas otomatis masuk Class History
```

Tidak ada kebutuhan berpindah aplikasi. Tidak ada kehilangan konteks kelas.

---

## 47. Tiga Objek Inti

```
TEACHER
CLASS
SESSION
```

Fitur lain adalah **tools** yang bekerja di dalam konteks ini.

---

## 48. Arsitektur Inti

```
HOME → CLASS → TEACHING SESSION → TOOLS → ASSESSMENT → CLASS HISTORY
```

Menjadikan 8bitOS bukan sekadar aplikasi administrasi pembelajaran, tetapi **Teacher Operating Environment** yang menyatukan mengajar, administrasi kelas, pencatatan, pencarian materi, assessment, dan pengelolaan dokumen dalam satu workspace.

---

## 49. Tujuan Akhir

> **Open 8bitOS → Start Class → Teach → Assess → Save → Done.**

Guru menjalankan hampir seluruh kegiatan KBM dari satu perangkat dan satu antarmuka tanpa keluar dari 8bitOS.

---

## 50. Implikasi Implementasi Spec 1

| Item IA | Status | File |
|---|---|---|
| Sidebar 5 slot (HOME/CLASS/WORK/TOOLS/SYSTEM) | ✅ | `src/shared/components/Dock.tsx` |
| Home (Today) | ✅ | `src/features/dashboard/DashboardScreen.tsx` |
| Class List | ✅ | `src/features/classroom/ClassList.tsx` |
| Class Hub (Overview + Roster) | ✅ | `src/features/classroom/ClassHub.tsx` |
| Attendance Sheet (sub-route) | ✅ | `src/features/classroom/AttendanceSheet.tsx` |
| Tab state via `?tab=` | ✅ | `routes.tsx` + `ClassHub.tsx` |
| Quick Action "CLASSROOM" | ✅ | DashboardScreen |
| OrientationGuard landscape | ✅ | `src/app/OrientationGuard.tsx` |
| Empty/Loading/Error state per screen | ✅ | setiap screen |
| Persistent back link | ✅ | setiap screen |
| Deep link per route | ✅ | HashRouter |
| Master+Detail (Spec 2) | ⏳ | — |
| Command Center / Global Search | ⏳ Spec 4 | — |
| Persistent Session Indicator | ⏳ Spec 2 | — |
| Floating overlay tools | ⏳ Spec 2 | — |

---

## 51. Dokumen Lanjutan

- **Dokumen 01–06** — fondasi
- **Dokumen 08** — Data Model (`docs/decisions/07-data-model.md`)
- **Dokumen 09** — Spec 1 (`docs/specs/2026-09-03-8bithos-spec-1.md`)
- **Dokumen 10** — Implementation Plan (`docs/plans/2026-09-03-8bithos-spec-1-implementation.md`)

Dokumen 07 revisi 1.1 ini menutup blueprint IA & screen map 8bitOS. Spec berikutnya tinggal menambah route + screen acceptance di bagian terkait.
