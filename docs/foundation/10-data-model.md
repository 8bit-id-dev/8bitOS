# Dokumen 10 — 8bitOS Data Model & Database Architecture

**Status:** Draft → Technical Foundation
**Versi:** 1.0
**Tanggal:** 2026-09-04
**Project:** 8bitOS — Teacher Operating System
**Architecture:** Web App → Capacitor → Android
**Database:** Local-first + Cloud Sync

> Prinsip: 8bitOS harus tetap dapat digunakan ketika internet tidak tersedia. Kehilangan koneksi tidak boleh menghentikan absensi, mencatat, membuat soal, kuis, nilai, materi, atau riwayat.

---

## 1-2. Tujuan & Prinsip Arsitektur Data

```
UI → Application Layer → Local Database (LOCAL-FIRST)
                         ↕ sync when online
                       Cloud Database
```

**Aturan:** local DB = sumber kerja utama saat KBM; cloud = backup/sync/pemulihan/lintas perangkat. Semua perubahan dicatat; data penting tidak hilang saat app ditutup; setiap entitas punya id unik; relasi eksplisit; data akademik punya **histori**.

## 3-4. Domain Data & ERD Overview

Domain: Identity (Teacher) · Academic Structure (School/Tahun/Semester/Class/Subject/Student) · Teaching (Lesson/Material/Session/Activity) · Assessment (Bank/Question/Quiz/Attempt/Score) · Attendance · Productivity (Note/Meeting/Task/Bookmark) · Files (Attachment/Local Resource) · System (Settings/Sync Queue/Activity Log/Backup).

## 5. Konvensi Database

Semua tabel: `id` (UUID — aman untuk pembuatan offline), `created_at`, `updated_at`, `deleted_at` (soft delete), `sync_status`.

## 6-14. Struktur Akademik

- **teachers** (id, name, email, phone, avatar_url, school_id, timestamps)
- **schools** (name, address, phone, logo_url)
- **academic_years** (name `2026/2027`, start_date, end_date, is_active)
- **semesters** (academic_year_id, number, dates, is_active)
- **classes** (academic_year_id, name, grade, major, homeroom_teacher)
- **students** (class_id, student_number, nisn, name, gender, birth_date, phone, parent_name, **active** — jangan hard delete saat pindah)
- **student_enrollments** (histori perpindahan kelas — nilai/absensi lama tidak berubah)
- **subjects** (name, code, description)
- **teaching_assignments** (teacher × subject × class × year × semester) — **tabel terpenting**

## 15-18. Teaching & Attendance

- **lessons** = rencana (assignment_id, title, objective, meeting_number, planned_date, duration, status)
- **teaching_sessions** = kejadian nyata (lesson_id, started_at, ended_at, status planned/active/completed/cancelled)
- **activities** — semua aktivitas sesi (type: attendance/presentation/discussion/quiz/exercise/note/browser) → **timeline KBM otomatis**
- **attendance_sessions** + **attendance_records** (status present/late/permission/sick/absent)

## 19-27. Assessment

- **question_banks** (per subject) → **questions** (type, difficulty, cognitive_level C1–C6, stimulus, answer, explanation, points) → **question_options**
- **quizzes** (status draft/scheduled/active/completed/archived) → **quiz_questions** (M2M — soal reusable) → **quiz_attempts** → **student_answers** (feedback guru)
- **assessments** — pisahkan raw score vs final; **grade_components** (bobot per subject/year/semester)

## 28-34. Productivity & Files

- **notes** (type general/lesson/meeting/student/idea/todo; is_pinned; handwriting = **stroke_data**, jangan dipaksa jadi teks)
- **meetings** (agenda, decisions, follow_up) · **tasks** (priority, due, related_entity) · **bookmarks** · **attachments** (owner_type/owner_id, local+cloud path, checksum) · **local_resources** (offline_available) · **settings** (key-value per teacher)

## 35-38. Sync, Konflik, Audit, Soft Delete

- **sync_queue** (entity, operation create/update/delete, payload, attempts, status pending/syncing/synced/failed)
- **Conflict:** Last-Write-Wins via `updated_at`; data akademik penting → **versioning + histori** (jangan hapus)
- **audit_logs** (entity_type, entity_id, action, old_value, new_value, timestamp) — *wajib untuk integritas penilaian* (mis. "Andi 78 → 85")
- **Soft delete:** `deleted_at = NULL` aktif; terisi = terhapus tapi dapat dipulihkan

## 39-44. Layer, Repository, Lifecycle, Backup

UI → Feature → **Repository** (StudentRepository.getByClass(), bukan SQL dari UI) → Local DB API → SQLite → Sync Engine → Cloud. Lifecycle: CREATE→ACTIVE→UPDATE→SYNC→ARCHIVE→SOFT DELETE→PURGE (sesuai kebijakan).

Backup: local (SQLite + attachments) + cloud + **Export `.8bit`** (database.json + attachments/ + metadata.json) — guru punya kendali penuh atas datanya.

## 45-46. Security & Ownership

AuthN/AuthZ; encryption transit (+at rest bila bisa); DB lokal tidak diekspos; cloud via request ter-autentikasi; credentials tidak di DB biasa; attachment access control; audit untuk data sensitif. **Teacher owns** notes/questions/quizzes/teaching data; student data diakses **melalui Class** — bukan data global.

## 47-54. Derived Data & Prinsip

- Dashboard **tidak butuh tabel statistik** — dihitung dari data utama
- **Teacher Timeline** dibangun dari sessions + activities + attendance + quiz — tanpa tabel khusus
- **Single Source of Truth** — nama siswa hanya di `students`
- Cache (browser history, thumbnails, AI responses) boleh dihapus; data akademik **tidak**
- AI membaca data internal (students + attendance) tanpa DB khusus
- Search global: query langsung untuk skala kecil; FTS untuk besar
- Local DB rekomendasi: **SQLite** (offline, cepat, relational, transaksional)
- **Transaksi atomic** untuk operasi majemuk (quiz + questions + activity — COMMIT/ROLLBACK)

## 55-56. MVP Phases & Prioritas

| Phase | Tabel |
|---|---|
| 1 Core | teachers, schools, academic_years, semesters, classes, students, subjects, teaching_assignments |
| 2 KBM | lessons, teaching_sessions, activities, attendance_sessions, attendance_records |
| 3 Assessment | question_banks, questions, question_options, quizzes, quiz_questions, quiz_attempts, student_answers, assessments |
| 4 Productivity | notes, meetings, tasks, bookmarks, attachments |
| 5 Infrastructure | sync_queue, audit_logs, settings, local_resources |

P0: Teacher/Class/Student/Subject/Assignment/Attendance/Session/Notes · P1: Bank/Quiz/Assessment/Task/Meeting/Attachments/Sync · P2: Browser/AI · P3: Analytics lanjutan.

## 57. Prinsip Akhir

```
PLAN (Lesson) → TEACH (Session) → RECORD (Attendance·Notes·Activity)
→ ASSESS (Quiz→Score) → ANALYZE (Dashboard) → ARCHIVE (Backup)
```

**Offline-first · Teacher-owned · Historically traceable · Relational · Recoverable · Syncable · Scalable.**

---

## 58. Implementasi Saat Ini (audit 2026-09-04, Supabase live)

| Entitas dokumen | Implementasi | Tabel/kode |
|---|---|---|
| teachers | ✅ via Supabase Auth (`auth.users`) | demo user live |
| classes, students, subjects | ✅ | 0002 |
| teaching_assignments | ✅ `class_subjects` | 0002 |
| teaching_sessions | ✅ `class_sessions` (planned/active/done) | 0002 |
| attendance_records | ✅ (H/I/S/A; session FK + unique) | 0002 |
| lessons | ✅ `plans` (per kelas+minggu) | 0005 |
| notes | ✅ + ink layer `[[ink:]]` | 0005 |
| quizzes/questions/attempts/answers | ✅ `assessments`+`questions`+`attempts`+`attempt_answers` | 0006 |
| assessments + components | ✅ `grades`+`grade_components` (bobot) | 0006 |
| attachments | ✅ `documents` + Storage bucket | 0007 |
| sync_queue | ✅ IndexedDB outbox (attendance) | outbox.ts |
| AI layer | ✅ `ai_jobs` audit prompt | 0007 |
| **activities timeline** | ✅ **baru** `session_activities` | 0008 |
| **audit_logs** | ✅ **baru** (grade old→new) | 0008 |
| schools/years/semesters | ❌ backlog (kelas pakai academic_year text) |
| student_enrollments | ❌ backlog (active flag di students) |
| question_banks lintas-kelas | ❌ backlog (soal per assessment) |
| meetings, tasks, bookmarks | ❌ backlog (meetings≈notes kind=meeting) |
| soft delete | ⚠️ sebagian (RLS + audit untuk grades) |
| versioning nilai | ⚠️ audit_logs berisi old→new |
