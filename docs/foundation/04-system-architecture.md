# Dokumen 04 — 8bitOS System Architecture

**Versi:** 1.1
**Status:** Final
**Tanggal:** 2026-09-03
**Tipe:** Arsitektur sistem 5 layer + offline-first + hardware optimization

> Dokumen ini menerjemahkan visi 8bitOS (Dokumen 01), alur kerja guru (Dokumen 02), dan spesifikasi modul (Dokumen 03) menjadi arsitektur teknis yang implementatif.

---

## 1. Overview Sistem

### 1.1 Visi Sistem

8bitOS adalah **sistem operasi produktivitas khusus guru** yang mengubah tablet menjadi **Teacher Command Center** — sebuah launcher dan ekosistem aplikasi terpadu yang mendukung seluruh aktivitas guru dari persiapan, pelaksanaan, hingga evaluasi pembelajaran.

**Konsep utama:**

> "Semua kebutuhan guru selama KBM tersedia dalam satu layar tanpa berpindah aplikasi."

8bitOS mengintegrasikan:

- Classroom Management
- Lesson Planning
- Digital Assessment
- Teaching Notes
- Browser Riset Materi
- Document Management
- AI Teaching Assistant
- Teacher Dashboard

---

## 2. High-Level Architecture

```
                 ┌─────────────────────────┐
                 │       8bitOS UI         │
                 │   Teacher Launcher      │
                 └───────────┬─────────────┘
                             │
             ┌───────────────┼───────────────┐
             │               │               │
             ▼               ▼               ▼
     ┌───────────┐   ┌────────────┐   ┌─────────────┐
     │ Teaching  │   │ Assessment │   │ Productivity│
     │ Workspace │   │ Engine     │   │ Tools       │
     └───────────┘   └────────────┘   └─────────────┘
                             │
                             ▼
     ┌─────────────────────────┐
     │     8bitOS Core         │
     │ System Services         │
     └───────────┬─────────────┘
                 │
     ┌───────────┴────────────┐
     │ Data Layer             │
     │ Local + Cloud Sync     │
     └───────────┬─────────────┘
                 │
     ┌────────────────────────┐
     │ Android / HarmonyOS    │
     │ Hardware Layer         │
     └────────────────────────┘
```

---

## 3. System Layer Architecture (5 Layer)

### Layer 1 — Presentation Layer

**8bitOS Teacher Launcher** berfungsi sebagai:
- Home screen khusus guru
- Dashboard aktivitas harian
- Quick access seluruh modul
- Workspace KBM

**Komponen: Teacher Home**

```
--------------------------------
Good Morning, Mr/Ms Teacher

08:00
Matematika XI IPA

[Absensi] [Materi] [Quiz] [Catatan]

Today's Schedule
09:00 Kalkulus
10:30 Rapat Guru
--------------------------------
```

### Layer 2 — Teacher Workspace Layer

**3.1 Classroom Workspace** — pusat aktivitas saat mengajar.

**Attendance Module**

Input:
- Daftar siswa
- Hadir / Izin / Sakit / Alpha

Output:
- Rekap kehadiran
- Statistik siswa

**Teaching Material Browser** — browser internal khusus guru (tanpa keluar aplikasi):
- Cari materi
- Membuka PDF
- Membaca artikel
- Menyimpan referensi

**Smart Whiteboard** — digital papan tulis:
- Menulis tangan
- Formula matematika
- Grafik
- Screenshot
- Export PDF

### Layer 3 — Assessment Engine

**Smart Assessment System** — mesin evaluasi pembelajaran.

**Question Bank**

```
Subject
 ├── Mathematics
 │     ├── Algebra
 │     ├── Geometry
 │     └── Calculus
 ├── Physics
 └── Chemistry
```

**Quiz Builder** — guru dapat membuat:
- Pilihan ganda
- Pilihan ganda kompleks
- True/False
- Essay

Workflow pembuatan soal:

```
Blueprint → Kompetensi → Stimulus → Question → Answer Key → Validation → Publish
```

**Assessment Analytics** menghasilkan:
- Nilai siswa
- Rata-rata kelas
- Analisis soal
- Tingkat kesulitan
- Remedial recommendation

### Layer 4 — Productivity System

**4.1 Smart Notes** — pengganti notebook guru:
- Catatan rapat
- Catatan mengajar
- Ide pembelajaran
- Voice note
- Foto dokumen

Struktur:

```
Notes
├── Rapat
├── KBM
├── Administrasi
├── Ide
└── Arsip
```

**4.2 Document Manager** — pengelolaan dokumen:
- Modul ajar
- RPP
- LKPD
- Soal
- Nilai
- Surat

Support: PDF · DOCX · XLSX · PPT

### Layer 5 — AI Teacher Assistant

**8bit AI Core** — asisten guru berbasis AI.

**Lesson Assistant** membantu:
- Membuat modul ajar
- Membuat tujuan pembelajaran
- Membuat aktivitas kelas

**Question Generator**

Input:
```
Materi:  Integral
Level:   HOTS
Jumlah:  20 soal
```

Output:
- Soal
- Pembahasan
- Kisi-kisi

**Teaching Reflection** — AI menganalisis:
- Catatan guru
- Hasil quiz
- Kesulitan siswa

Memberikan:
- Saran metode
- Perbaikan pembelajaran

---

## 4. Core System Services

**8bitOS Core** — service utama:

**User Management** mengatur:
- Guru
- Sekolah
- Kelas
- Mata pelajaran

**Storage Service:**

| Tipe | Untuk |
|---|---|
| Local Storage | Offline mode, cache, dokumen penting |
| Cloud Storage | Backup, sinkronisasi, kolaborasi |

**Sync Engine:**

```
Tablet
   ↕
   Sync
   ↕
Cloud Database
   ↕
  Backup
```

---

## 5. Database Architecture

```
Users
 └── Teacher

School
 └── Classes

Students
 └── Attendance

Subjects
 └── Materials

Assessment
 ├── Questions
 ├── Answers
 └── Results

Notes
 └── Documents
```

**Pilihan storage:**

| Lokasi | DB | Untuk |
|---|---|---|
| Local | SQLite / Room | Offline, cache |
| Cloud | PostgreSQL (InsForge) | Source of truth, sync |

---

## 6. Offline-First Architecture

Guru sering berada di kelas dengan koneksi terbatas. Strategi:

```
Internet
   │
   ▼
Cloud Database
   ▲
   │
Sync Engine
   │
   ▼
Local Database (Tablet)
```

**Offline capability** — tetap berjalan saat tidak ada internet:

- ✓ Absensi
- ✓ Catatan
- ✓ Quiz
- ✓ Materi
- ✓ Penilaian

**Sinkronisasi** terjadi otomatis ketika online (background, via outbox queue).

**Detail teknis (lihat juga Dokumen 04 versi 1.0 di bawah):**

- Service worker (Workbox) precache semua aset
- IndexedDB outbox untuk mutasi offline (absensi, notes)
- NetworkFirst untuk API responses dengan fallback cache
- Conflict resolution: last-write-wins teks, append-only untuk `attendance_records`

---

## 7. Security Architecture

**Authentication:**

- PIN
- Password
- Biometric (Phase 4 via Capacitor + Android Biometric API)

**Data Protection — enkripsi:**

- Database lokal
- Dokumen
- Backup

**Permission System** — role hierarchy:

```
Admin Sekolah
      │
    Guru
      │
    Siswa
```

**Backend security:**

- Row Level Security (Postgres) per user
- HTTPS only
- Audit log untuk aksi sensitif
- AI tidak menerima PII siswa tanpa konteks eksplisit

---

## 8. Hardware Optimization

**Target Device: Huawei MatePad Mini**

| Aspek | Minimum | Recommended |
|---|---|---|
| RAM | 6 GB | 8 GB+ |
| Storage | 128 GB | 256 GB |

**Input Support — dioptimasi untuk:**

- Stylus (M-Pencil)
- Keyboard
- Mouse
- Touch

**Pemaksimalan hardware:**

- M-Pencil → Smart Notes, Whiteboard, anotasi PDF, rumus matematika
- Split Workspace → Materi (kiri) + Catatan (kanan), atau Presentasi (atas) + Absensi+Timer (bawah)
- Orientasi landscape → default layout
- Offline-first → IndexedDB outbox + service worker
- Launcher mode (Phase 4) → Capacitor home-replacement

---

## 9. Technology Stack Recommendation

**Frontend — dua opsi:**

| Opsi | Pro | Kontra |
|---|---|---|
| Native Android (Kotlin + Jetpack Compose) | Performa tinggi, akses native penuh | iOS tidak ter-cover, duplikasi effort |
| Cross Platform (Flutter / React Native) | Satu codebase multi-platform | Trade-off performa canvas |

**Rekomendasi awal:** **React + TypeScript + Vite + Tailwind** (web super app) → **Capacitor wrap** untuk Android. Saat butuh native module (M-Pencil low-level, launcher), tambahkan plugin native Kotlin.

**Backend — API Gateway pattern:**

```
API Gateway
     │
Backend Service
     │
Database
     │
Storage
```

**Pilihan database:**

| Lokasi | DB | Untuk |
|---|---|---|
| Local | SQLite + Room | Offline, cache |
| Cloud | PostgreSQL (InsForge / Supabase) | Source of truth |

---

## 10. Module Roadmap (4 Phase)

| Phase | Fokus | Modul |
|---|---|---|
| 1 — Foundation | Launcher shell, Dashboard, Notes dasar, Document Manager | A, D1 basic, G basic |
| 2 — Teacher Workspace | Attendance, Material Browser, Whiteboard | B, D2, D3 |
| 3 — Assessment | Quiz Builder, Question Bank, Analytics | E, F |
| 4 — AI Integration | AI Assistant, Auto Question Generator, Learning Analytics | H, E advanced |

Status Spec 1 (sedang dibangun): Modul A (Dashboard) + B (Classroom) + outbox offline-first + Capacitor-ready architecture.

---

## 11. Frontend Architecture (Detail Teknis)

### Stack aktif

| Layer | Teknologi |
|---|---|
| Framework | React 18.3 + TypeScript 5.6 (strict) |
| Build | Vite 5.4 |
| Styling | Tailwind CSS 3.4 |
| Routing | React Router 6 (HashRouter) |
| State | Zustand 4.5 + TanStack Query 5.59 |
| Local DB | IndexedDB via `idb` 8 |
| PWA | `vite-plugin-pwa` + Workbox |
| Test | Vitest 2.1 + happy-dom + MSW |

### Pola data fetching

```
Component
   ↓ useQuery
TanStack Query
   ↓
queries.ts (typed wrapper)
   ↓
insforge.database.from(table)
   ↓
Postgres + RLS
```

### Mutasi offline-first (absensi)

```
User tap H/I/S/A
   ↓
upsertAttendance() → enqueueAttendance()
   ↓
IndexedDB outbox
   ↓ (background, online)
flushOutbox() → insforge.database.upsert()
   ↓
Postgres
```

---

## 12. Backend Architecture (InsForge)

### Kenapa InsForge

- All-in-one: Postgres + Auth + Storage + Edge Functions + AI gateway + Realtime
- RLS native
- Open-source (bisa self-host)
- AI gateway: OpenRouter multi-model

### Skema inti (Spec 1) — 7 tabel

- `subjects`
- `classes`
- `class_subjects`
- `students`
- `schedule_slots`
- `class_sessions`
- `attendance_records`

### Migrations

| File | Isi |
|---|---|
| `0001_init_helpers.sql` | Extensions + helper `is_owner` |
| `0002_create_tables.sql` | 7 tabel + grants |
| `0003_create_indexes.sql` | Index hot path |
| `0004_create_rls_policies.sql` | RLS per tabel |
| `0005_seed_demo.sql` | Data demo |

### Storage buckets

- `documents` (private) — Modul G
- `screenshots` (private) — Modul D3
- `whiteboard` (private) — Modul D2

### Edge functions (direncanakan)

- `flush-attendance-batch`
- `ai-generate` (OpenRouter proxy)
- `pdf-export-session-report`
- `search-notes` (Postgres FTS wrapper)

---

## 13. AI Engine (Modul H)

### Komponen

- **AI Gateway** — InsForge route ke OpenRouter
- **Templates** — `ai_templates` table
- **Jobs** — `ai_jobs` table, audit semua prompt + response
- **Embed** — hasil AI disisipkan ke Notes/Document/Assessment

### Alur

```
User tap FAB AI → pilih template → POST edge function ai-generate
   ↓
audit log → call OpenRouter → simpan response + token usage → return ke client
   ↓
Tampil + tombol: Salin | Sisipkan ke Notes | Simpan ke Document | Buat Assessment
```

### Keamanan

- Semua prompt + response di-log
- User bisa hapus history
- Rate limit per user
- Tidak ada PII siswa yang dikirim tanpa konteks eksplisit

---

## 14. Launcher Mode (Phase 4)

### Kenapa launcher

Default Android home menampilkan semua app + Google feed → distraksi saat KBM. Launcher mode membuat 8bitOS = home.

### Komponen

```
8bitOS Web App (Capacitor)
        ↓
Custom Android Plugin (Kotlin)
        ↓
Android Intent: ACTION_MAIN + CATEGORY_HOME + CATEGORY_DEFAULT
        ↓
System set 8bitOS as default HOME
```

### Acceptance

- App muncul di Settings → Default Apps → Home app
- Tombol Home hardware → 8bitOS
- Recent apps hanya 8bitOS
- Tombol back → minimize 8bitOS (standar)

### Batasan

- Tidak bisa disable app sistem dari web layer
- Wallpaper system tetap
- Split screen & PiP tetap berfungsi (Android 12+)

---

## 15. Sync Strategy (Multi-device, Phase 4)

```
┌────────┐  ┌────────┐  ┌────────┐
│Tablet  │  │ Laptop │  │  HP    │
└───┬────┘  └───┬────┘  └───┬────┘
    │            │           │
    └────────────┴───────────┘
                 │
           InsForge Backend
                 │
            Postgres RLS
```

- InsForge Realtime (websocket): dashboard auto-update
- Optimistic UI: apply lokal dulu, rollback jika gagal

---

## 16. Performance Budget

| Aspek | Target |
|---|---|
| First Contentful Paint | < 1.5s (3G) |
| Time to Interactive | < 3s (3G) |
| JS bundle (gzip) | < 150 KB |
| CSS bundle (gzip) | < 5 KB |
| Lighthouse PWA | > 90 |
| Lighthouse Perf | > 85 |
| Offline boot | < 1s dari cache |

---

## 17. Deployment

- **Frontend:** Vercel / Netlify / Cloudflare Pages · HTTPS otomatis
- **Backend:** InsForge managed (region `ap-southeast`)
- **Mobile:** `npx cap build android` → APK langsung untuk guru, atau Play Store internal
- **CI/CD (planned):** GitHub Actions (typecheck + test + build, auto-deploy staging)

---

## 18. Risk & Mitigation

| Risiko | Mitigasi |
|---|---|
| InsForge outage | SW cache + outbox tahan offline |
| Backend API berubah | Wrapper `queries.ts` single point of change |
| M-Pencil API tidak stabil | Fallback touch + canvas abstraction |
| Bundle bengkak | Code splitting per modul (lazy load) |
| Privacy data siswa | RLS + audit + opt-in AI data sharing |
| Launcher Android fragmentasi | Test di 5 device representative |

---

## 19. Final System Concept

```
             8bitOS
        Teacher Command Center

 ┌───────────────┐
 │ Dashboard     │
 └──────┬────────┘
        │
 ┌──────┼─────────────┐
Teaching     Assessment
Workspace     Engine
        │
 Productivity
        │
 AI Teacher Assistant
        │
 Cloud + Local Storage
```

---

## 20. Kesimpulan

8bitOS bukan sekadar aplikasi guru, tetapi sebuah **Teacher Operating Environment**.

**Tujuan akhirnya:** menjadikan tablet guru sebagai pusat kendali seluruh aktivitas pendidikan — mengajar, administrasi, evaluasi, dokumentasi, dan pengembangan profesional — dalam satu ekosistem terpadu.

---

## 21. Dokumen Lanjutan

- **Dokumen 01** — Product Foundation (`docs/foundation/01-product-foundation.md`)
- **Dokumen 02** — Teacher Workflow Map (`docs/foundation/02-teacher-workflow-map.md`)
- **Dokumen 03** — Module Specs (`docs/foundation/03-module-specs.md`)
- **Dokumen 05** — UI/UX Design System — berikutnya
- **Dokumen 06** — Data Model (`docs/decisions/07-data-model.md`)
- **Dokumen 07** — Spec 1 (`docs/specs/2026-09-03-8bithos-spec-1.md`)
