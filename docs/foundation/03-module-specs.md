# Dokumen 03 — 8bitOS Module Specs

**Versi:** 1.0
**Status:** Final
**Tanggal:** 2026-09-03
**Tipe:** Spesifikasi per modul (tujuan, layar, data, acceptance criteria)

Dokumen ini menerjemahkan Dokumen 01 (Product Foundation) dan Dokumen 02 (Workflow Map) menjadi spesifikasi modul yang siap diimplementasikan. Setiap modul punya:

- **Tujuan** — masalah yang diselesaikan
- **Layar** — UI utama
- **Data** — tabel yang diakses / ditulis
- **Acceptance Criteria** — kondisi "selesai"
- **Spec target** — kapan dibangun

---

## Daftar Modul

| Kode | Nama | Fase | Spec |
|---|---|---|---|
| A | Dashboard | PLAN | 1 ✅ |
| B | Classroom Management | TEACH/ASSESS | 1 ✅ (parsial) |
| C | Teaching Planner | PLAN | 2 |
| D1 | Smart Notes | PREPARE/REPORT | 2 |
| D2 | Whiteboard | TEACH | 3 |
| D3 | Browser Internal | PREPARE | 3 |
| E | Assessment Center | ASSESS | 3 |
| F | Gradebook | ASSESS | 3 |
| G | Document Center | REPORT | 4 |
| H | AI Teacher Assistant | Lintas | 4 |
| I | Launcher Mode | Device | 5+ |

✅ = dibangun di Spec 1. Parsial = sebagian fitur saja.

---

## Modul A — Dashboard

### Tujuan
Pusat kendali harian guru. Saat membuka 8bitOS, guru langsung tahu: kelas berikutnya, jadwal hari ini, item yang perlu ditindaklanjuti, status sinkronisasi offline.

### Layar
**`DashboardScreen`** (`/`) — viewport utama.

Komponen:
1. **Header** — tanggal hari ini (format ID), jam update, status ONLINE/OFFLINE, identitas guru
2. **Outbox banner** — muncul jika ada item belum terkirim; tombol RETRY untuk flush
3. **Next Class** — kelas/mapel berikutnya, tombol "MULAI KBM" → ClassHub
4. **Jadwal Hari Ini** — daftar slot berurut waktu
5. **Quick Actions** — pintasan: CLASSROOM, MATERI [SOON], QUIZ [SOON], NILAI [SOON]

### Data
- **Baca:** `schedule_slots` (filter `day_of_week` = hari ini), `classes`, `subjects`, `class_subjects`, `outbox.count`
- **Tulis:** tidak ada (read-only)

### Acceptance Criteria
- [ ] Saat dibuka pertama kali, render Next Class dari slot berikutnya hari ini
- [ ] Jika tidak ada jadwal → EmptyState "NO SCHEDULE TODAY"
- [ ] Status ONLINE/OFFLINE bereaksi terhadap `navigator.onLine`
- [ ] Outbox banner muncul hanya jika `count() > 0`
- [ ] Tombol RETRY memanggil `flushOutbox()` lalu refresh count
- [ ] Tombol MULAI KBM navigate ke `/classroom/:classId`

### Spec 1 Status
- [x] Layar DashboardScreen
- [x] useTodaySchedule query
- [x] useOnlineStatus hook
- [x] outbox banner + retry

---

## Modul B — Classroom Management

### Tujuan
Mengelola kelas: daftar, jadwal, absensi, catatan, riwayat. Ini adalah modul terpanjang karena jadi tulang punggung KBM harian.

### Sub-modul

#### B1 — Class List
**Layar:** `ClassList` (`/classroom`)
**Data:** `classes` + count `students` + `class_subjects.subject.name`
**Acceptance:**
- [ ] List semua kelas user
- [ ] Tampilkan: nama, tahun ajaran, wali kelas, jumlah siswa, chip mapel
- [ ] Empty state jika belum ada kelas
- [ ] Tap → ClassHub

**Spec 1:** ✅ selesai

#### B2 — Class Hub Overview
**Layar:** `ClassHub` (`/classroom/:classId`) tab Overview
**Data:** `classes`, `schedule_slots`, `students`, `class_sessions`, `subjects`
**Acceptance:**
- [ ] Header nama kelas
- [ ] Ringkasan: siswa, mapel, sesi count
- [ ] Tombol "MULAI SESI" per mapel (dari schedule_slots unique subject) → create `class_session` (status=active) → navigate ke AttendanceSheet
- [ ] List jadwal mingguan
- [ ] Link kembali ke ClassList

**Spec 1:** ✅ selesai

#### B3 — Class Hub Roster
**Layar:** `ClassHub` tab Roster
**Data:** `students` filter `class_id`
**Acceptance:**
- [ ] Daftar siswa berurut abjad
- [ ] Tampilkan: nomor urut, nama, NISN, jenis kelamin
- [ ] Empty state jika belum ada siswa

**Spec 1:** ✅ selesai (read-only, tanpa CRUD)

#### B4 — Class Hub Attendance
**Layar:** `AttendanceSheet` (`/classroom/:classId/attendance/:sessionId`)
**Data:** `students` (by class), `attendance_records` (by session), outbox
**Acceptance:**
- [ ] Toggle H/I/S/A per siswa, hanya 1 aktif per siswa
- [ ] Hitungan H/I/S/A realtime
- [ ] Klik toggle → enqueue ke outbox (offline) + invalidasi query
- [ ] Status toggle persisten (query auto-refresh setelah flush)
- [ ] Tombol KEMBALI ke ClassHub

**Spec 1:** ✅ selesai (Spec 1) · Lanjutan (rekap/export) → Spec 2

#### B5 — Class Hub Notes
**Layar:** `ClassHub` tab Notes
**Data:** `notes` (filter `class_id`)
**Spec:** 2

#### B6 — Session Report
**Layar:** `SessionReport` (`/classroom/:classId/session/:sessionId/report`)
**Data:** `class_sessions`, `attendance_records` (count per status), `session_activities`, `notes`
**Spec:** 2 — agregat: hadir, aktivitas, catatan, export PDF

#### B7 — Class CRUD (admin)
**Layar:** modal/form
**Spec:** 4 — saat ini placeholder

#### B8 — Student CRUD (admin)
**Layar:** modal/form
**Spec:** 4 — saat ini placeholder

---

## Modul C — Teaching Planner

### Tujuan
Merancang pembelajaran mingguan/bulanan: topik, metode, media, status kesiapan. Output: checklist yang muncul di ClassHub Overview sebelum KBM.

### Layar
- `PlannerWeek` (`/planner`) — grid minggu, tap hari → `PlannerDay`
- `PlannerDay` — list `plan_items` per hari
- `PlanItemEditor` — modal: topik, ATP, metode, media, link materi, status (draft/ready/done)

### Data
- `plans` (mingguan, by `week_start`)
- `plan_items` (topik, `plan_id`, `class_id?`, `subject_id?`, `status`)
- `subjects`, `classes`

### Acceptance
- [ ] Bisa buat plan mingguan
- [ ] Tambah/edit/hapus plan_item
- [ ] Tandai status (siap/belum)
- [ ] Tampil ringkasan di ClassHub Overview: "Materi siap: 3/5"

### Spec Target
**Spec 2**

---

## Modul D1 — Smart Notes

### Tujuan
Pengganti Huawei Notes / OneNote: teks + stylus + gambar + rumus + audio + scan. Terhubung ke kelas, sesi, dan materi.

### Layar
- `NotesList` (`/notes`) — semua catatan, filter by class/session
- `NoteEditor` (`/notes/:id`) — editor hybrid
- `NoteViewer` (read-only dengan search)

### Data
- `notes` (`id`, `user_id`, `class_id?`, `session_id?`, `title`, `body_json`, `tags`, `created_at`, `updated_at`)
- `note_attachments` (gambar/audio/scan/file)
- `note_links` (relasi many-to-many ke `documents`, `class_sessions`)

### Acceptance
- [ ] Buat/edit/hapus catatan
- [ ] Input teks
- [ ] Input stylus (canvas, tersimpan sebagai strokes JSON atau SVG)
- [ ] Insert gambar dari galeri / kamera (Capacitor)
- [ ] Rekam audio note
- [ ] Scan dokumen (Capacitor camera + OCR)
- [ ] Link catatan ke kelas/sesi
- [ ] Search full-text (Postgres FTS)
- [ ] Export PDF

### Spec Target
**Spec 2** (MVP: teks + gambar + link) → **Spec 3** (stylus, audio, scan)

---

## Modul D2 — Whiteboard

### Tujuan
Papan tulis digital memanfaatkan M-Pencil. Untuk menjelaskan konsep di kelas, anotasi materi, menggambar diagram.

### Layar
- `Whiteboard` (`/whiteboard`) — canvas fullscreen
- `WhiteboardSession` (terhubung ke `class_session`) — menyimpan snapshot per sesi

### Data
- `whiteboard_sessions` (`id`, `class_session_id?`, `user_id`, `created_at`)
- `whiteboard_pages` (`id`, `whiteboard_session_id`, `page_index`, `strokes_json`)

### Acceptance
- [ ] Canvas M-Pencil dengan pressure sensitivity
- [ ] Tools: pen, highlighter, eraser, shapes, color picker
- [ ] Multiple pages per sesi
- [ ] Simpan snapshot otomatis
- [ ] Replay (jika direkam)
- [ ] Export PNG/PDF

### Spec Target
**Spec 3**

---

## Modul D3 — Browser Internal

### Tujuan
Mini browser khusus guru: cari materi/referensi/soal, simpan ke Library, anotasi halaman, screenshot ke Notes.

### Layar
- `Browser` (`/browser`) — address bar, back/forward, tab counter
- `BrowserTab` — webview dengan overlay anotasi
- `Bookmarks` (`/browser/bookmarks`)
- `BrowserAnnotation` — canvas overlay per halaman

### Data
- `bookmarks` (`id`, `user_id`, `url`, `title`, `tags`, `created_at`)
- `browser_annotations` (`id`, `user_id`, `url`, `page_title`, `screenshot_url`, `note_id?`)

### Acceptance
- [ ] Webview internal (iframe sandbox atau Capacitor Browser plugin)
- [ ] Address bar dengan autocomplete
- [ ] Tabs (max 5)
- [ ] Bookmark
- [ ] Anotasi halaman (gambar di atas)
- [ ] Screenshot → simpan ke `documents` atau `notes`
- [ ] Share ke Notes / Library

### Spec Target
**Spec 3**

---

## Modul E — Assessment Center

### Tujuan
Bank soal, quiz, ulangan, koreksi, analisis. Tipe soal: PG, PG kompleks, benar/salah, uraian, esai.

### Layar
- `AssessmentList` (`/assessment`)
- `AssessmentEditor` (buat soal, multi-tipe)
- `AssessmentRun` (kerjakan, mode siswa — di tablet guru saat demo)
- `AssessmentResult` (rekap + analisis)

### Data
- `assessments` (`id`, `user_id`, `class_id`, `subject_id`, `title`, `type`, `created_at`)
- `questions` (`id`, `assessment_id`, `type`, `prompt`, `options_json`, `answer_key_json`, `points`)
- `attempts` (`id`, `assessment_id`, `student_id`, `started_at`, `finished_at`, `score`)
- `attempt_answers` (`id`, `attempt_id`, `question_id`, `response_json`, `is_correct`, `score`)

### Acceptance
- [ ] CRUD soal
- [ ] Tipe: PG, PG kompleks, B/S, uraian
- [ ] Koreksi otomatis untuk objektif
- [ ] Koreksi manual untuk uraian
- [ ] AI analisis butir (Modul H)
- [ ] Export hasil

### Spec Target
**Spec 3**

---

## Modul F — Gradebook

### Tujuan
Pengganti Excel: nilai per komponen (tugas, quiz, ulangan, keaktifan, proyek), konfigurasi bobot, rapor sederhana.

### Layar
- `Gradebook` (`/gradebook`) — pilih kelas, grid nilai
- `GradebookConfig` — komponen + bobot
- `StudentReport` (`/gradebook/student/:studentId`) — rapor per siswa

### Data
- `grade_components` (`id`, `class_id`, `name`, `weight`)
- `grades` (`id`, `student_id`, `component_id`, `score`, `note`, `recorded_at`)

### Acceptance
- [ ] CRUD komponen nilai
- [ ] Set bobot (total 100%)
- [ ] Input nilai per siswa per komponen
- [ ] Hitung nilai akhir otomatis
- [ ] Tampilan grid (Excel-like)
- [ ] Export rapor PDF per siswa

### Spec Target
**Spec 3**

---

## Modul G — Document Center

### Tujuan
Semua dokumen guru: modul ajar, LKPD, soal, hasil evaluasi, laporan, administrasi.

### Layar
- `Documents` (`/documents`) — grid/list dengan filter & tag
- `DocumentViewer` — preview PDF/gambar/dokumen
- `DocumentEditor` — form upload + tag + link

### Data
- `documents` (`id`, `user_id`, `title`, `kind`, `storage_key`, `tags`, `class_id?`, `subject_id?`, `size_bytes`, `created_at`)
- `document_links` (relasi ke `class_sessions`, `plans`, `assessments`)

### Acceptance
- [ ] Upload file (Supabase Storage)
- [ ] Tag & filter
- [ ] Preview (PDF, gambar)
- [ ] Link ke kelas/sesi/plan/assessment
- [ ] Search
- [ ] Share / export

### Spec Target
**Spec 4**

---

## Modul H — AI Teacher Assistant

### Tujuan
Asisten AI yang selalu tersedia untuk mempercepat pekerjaan guru: buat modul, soal, refleksi, analisis, ringkasan.

### Layar
- `AIAssistant` — panel mengambang (FAB) di kanan bawah, expandable
- `AIJob` — list prompt + hasil
- `AITemplates` — perpustakaan prompt siap pakai

### Data
- `ai_jobs` (`id`, `user_id`, `kind`, `prompt`, `response`, `tokens_in`, `tokens_out`, `created_at`, `linked_entity_type?`, `linked_entity_id?`)
- `ai_templates` (`id`, `user_id`, `name`, `prompt_template`, `category`)

### Kemampuan
- **PLAN:** "Buatkan ATP materi integral kelas XI semester 1"
- **PREPARE:** "Buatkan modul ajar integral tak tentu 90 menit"
- **PREPARE:** "Buatkan 10 soal HOTS integral"
- **TEACH:** "Jelaskan konsep turunan untuk siswa SMA"
- **ASSESS:** "Analisis butir soal ini, mana yang perlu diperbaiki"
- **REPORT:** "Buatkan refleksi pembelajaran hari ini untuk kelas XI IPA 1"
- **GENERAL:** Tanya jawab bebas

### Acceptance
- [ ] FAB AI selalu tersedia (kecuali saat fullscreen canvas)
- [ ] Template prompt siap pakai per fase
- [ ] Riwayat percakapan
- [ ] Hasil bisa disisipkan ke Notes / Document / Assessment
- [ ] Audit log semua prompt (compliance)
- [ ] Rate limit + token counter

### Spec Target
**Spec 4** (Provider: OpenAI-compatible LLM via Supabase Edge Functions (planned))

---

## Modul I — Launcher Mode

### Tujuan
Membuat 8bitOS menjadi Home App Android — saat membuka MatePad, langsung masuk 8bitOS Workspace, bukan home launcher default.

### Layar
N/A (Android system integration)

### Acceptance
- [ ] Capacitor app di-set sebagai default launcher
- [ ] App boot langsung ke Dashboard (skip Android home)
- [ ] Recent apps terbatas
- [ ] Mode "kunci aplikasi" (guru mode) — nonaktifkan akses ke Settings, Play Store, dll selama KBM
- [ ] Wallpaper khusus (opsional)

### Spec Target
**Phase 4 / Spec 5+** — butuh komponen native Android

---

## Acceptance Cross-Module (Spec 1)

Spec 1 dianggap selesai bila:

- [ ] App shell PWA + sidebar + dark mode bekerja
- [ ] Dashboard menampilkan jadwal hari ini (real data atau empty state)
- [ ] Class List menampilkan kelas (real atau empty)
- [ ] Class Hub Overview + Roster berfungsi
- [ ] Tombol MULAI SESI membuat `class_session` dan navigate ke absensi
- [ ] AttendanceSheet H/I/S/A berfungsi, offline → outbox → flush
- [ ] Outbox retry bekerja
- [ ] Typecheck clean, semua test pass, production build sukses
- [ ] PWA installable + service worker aktif

---

## Dokumen Lanjutan

- **Dokumen 04 — Design System** (`docs/decisions/04-design-system.md`) ✅
- **Dokumen 05 — Tech Stack** (`docs/decisions/06-tech-stack.md`) ✅
- **Dokumen 06 — Data Model** (`docs/decisions/07-data-model.md`) ✅
- **Dokumen 07 — InsForge Setup (historical, sekarang Supabase)** (`docs/decisions/08-insforge-setup.md`) ✅
- **Dokumen 08 — Spec 1** (`docs/specs/2026-09-03-8bithos-spec-1.md`) ✅
- **Dokumen 09 — Implementation Plan** (`docs/plans/2026-09-03-8bithos-spec-1-implementation.md`) ✅

Setelah Dokumen 03 ini, fondasi dokumentasi 8bitOS sudah lengkap untuk Spec 1.
