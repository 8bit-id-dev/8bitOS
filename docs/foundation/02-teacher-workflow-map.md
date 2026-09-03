# Dokumen 02 — 8bitOS Teacher Workflow Map

**Versi:** 1.0
**Status:** Final
**Tanggal:** 2026-09-03
**Tipe:** Pemetaan alur kerja guru (pagi → pulang) + data per fase

> "Sistem Operasi Digital Guru untuk Aktivitas Pembelajaran Terintegrasi."
> 8bitOS bukan sekadar aplikasi pembelajaran, tetapi menjadi ruang kerja digital guru yang menggantikan kebutuhan membuka banyak aplikasi terpisah.

---

## 1. Filosofi Utama

8bitOS bukan sekadar aplikasi pembelajaran, tetapi menjadi ruang kerja digital guru yang menggantikan kebutuhan membuka banyak aplikasi terpisah. Semua aktivitas dilakukan tanpa keluar dari 8bitOS.

Siklus utama:

```
RENCANA → PERSIAPAN → PELAKSANAAN KBM → ASESMEN → ANALISIS → EVALUASI → ARSIP
```

---

## 2. Teacher Daily Workflow — Morning Dashboard

Saat guru membuka MatePad:

```
8bitOS HOME
│
├── Jadwal Hari Ini
├── Kelas Berikutnya
├── Agenda Rapat
├── Tugas Belum Selesai
├── Notifikasi Siswa
└── Quick Action
```

**Quick Action:**

- Mulai KBM
- Absensi
- Buka Materi
- Buat Quiz
- Catatan
- Input Nilai

---

## 3. Workflow Persiapan Mengajar

```
Pilih Mata Pelajaran
        ↓
Pilih Kelas
        ↓
Pilih Materi
        ↓
Siapkan Pembelajaran
```

**Teacher Preparation Center** — tiga modul kerja:

### 3.1 Lesson Planner
Guru membuat:
- Tujuan pembelajaran
- CP / TP / ATP
- Materi
- Metode
- Media
- Aktivitas siswa

**Output:** MODUL AJAR DIGITAL

### 3.2 Material Browser
Browser internal 8bitOS:
- Cari materi
- Simpan artikel
- Ambil gambar
- Simpan video
- Screenshot
- Catat sumber

Tanpa pindah aplikasi.

```
Cari Materi → Preview → Tambahkan ke Modul → Siap Mengajar
```

### 3.3 AI Teaching Assistant
Membantu:
- Membuat contoh soal
- Membuat LKPD
- Membuat rangkuman
- Membuat stimulus
- Membuat rubrik penilaian

---

## 4. Workflow Saat KBM Berlangsung

### 4.1 Start Class Mode

Guru tekan **MULAI KBM**. Sistem otomatis:

```
Kelas:    X IPA 1
Materi:   Persamaan Kuadrat
Waktu:    08.00 – 09.30
```

### 4.2 Attendance Workflow

```
Mulai Kelas → Absensi Aktif → Siswa Scan / Guru Input → Data Tersimpan
```

Status: **Hadir · Izin · Sakit · Alpha · Catatan perilaku**
Output: **Rekap Kehadiran**

### 4.3 Teaching Workspace (CLASSROOM MODE)

```
┌────────────────────────────────┐
│ Materi Aktif                   │
│  [Slide] [Catatan] [Whiteboard]│
├────────────────────────────────┤
│ Siswa Online: 32/34            │
│ Aktivitas: Quiz · Diskusi · Tugas │
└────────────────────────────────┘
```

**Fitur:**
- **Digital Whiteboard** — menulis rumus, menggambar grafik, anotasi konsep (M-Pencil).
- **Teacher Notes** — catatan pribadi per kelas:
  > X IPA 1: banyak siswa belum paham faktorisasi → perlu remedial minggu depan.

---

## 5. Workflow Latihan dan Quiz

### 5.1 Create Assessment

```
Pilih Materi → Buat Soal → Pilih Jenis → Publish
```

**Jenis soal:** Pilihan ganda, PG kompleks, Benar/Salah, Essay, HOTS.

### 5.2 Quiz Execution

```
Guru Start Quiz → Siswa Mengerjakan → Auto Collect → Analisis
```

---

## 6. Assessment Workflow

### 6.1 Automatic Grading

Sistem: koreksi pilihan ganda, analisis jawaban, hitung skor, ranking.

### 6.2 Manual Assessment (essay/proyek/presentasi)

```
Jawaban Siswa → Rubrik Penilaian → Nilai → Feedback
```

---

## 7. Student Analytics

Dashboard **CLASS ANALYTICS**:

- **Akademik** — nilai rata-rata, perkembangan, materi sulit
- **Individu** — contoh:

```
Nama: Andi
Kekuatan:    Aljabar
Kesulitan:   Fungsi
Rekomendasi: Latihan tambahan
```

---

## 8. Meeting Workflow (Digital Meeting Notes)

```
Rapat Dimulai → Catatan Aktif → AI Summary → Action Item
```

**Output contoh:**

```
Rapat MGMP
Tanggal:  ...
Peserta:  ...

Kesimpulan:
...

Tugas:
1. ...
2. ...
3. ...
```

---

## 9. Administration Workflow (Teacher Office)

Mengelola: Dokumen, Modul ajar, RPP, LKPD, Bank soal, Nilai, Arsip.

Struktur arsip per tahun ajaran:

```
Tahun
 ├── Kelas X
 ├── Kelas XI
 └── Kelas XII
```

---

## 10. End of Day Workflow

Saat selesai mengajar, 8bitOS otomatis memberikan:

```
DAILY REPORT
Kelas:           X IPA 1
Materi selesai:  ✓
Absensi:         34 siswa
Evaluasi:        80% memahami
Catatan:         Perlu remedial
```

---

## 11. Master Workflow Diagram

```
                8bitOS HOME
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
     PREPARE                     TEACH
        │                           │
   Lesson Planner          Classroom Mode
   Material Search         Attendance
   AI Assistant            Whiteboard
        │                           │
        └─────────────┬─────────────┘
                      ▼
                 ASSESSMENT
                      │
              Quiz ── Score ── Analysis
                      │
                      ▼
              ADMINISTRATION
                      │
                      ▼
                  ARCHIVE
```

---

## 12. Konsep Launcher Mode

Jika 8bitOS dijadikan launcher MatePad (Phase 4), home screen menjadi:

```
┌─────────────────────┐
│  8bitOS TEACHER     │
│                     │
│  Senin 30 Agustus   │
│                     │
│  08.00 Matematika   │
│                     │
├─────────────────────┤
│ 📚 Materi           │
│ 👥 Kelas            │
│ 📝 Quiz             │
│ 📊 Nilai            │
│ 📒 Notes            │
│ 🌐 Browser          │
│ 🤖 AI Guru          │
└─────────────────────┘
```

Saat di-tap: langsung masuk workspace 8bitOS, tanpa melalui Android home standar.

---

## 13. Target Akhir 8bitOS

Guru cukup membawa MatePad Mini. Tidak perlu:

- ❌ Laptop
- ❌ Buku administrasi
- ❌ Banyak aplikasi
- ❌ Browser terpisah
- ❌ Aplikasi quiz terpisah
- ❌ Spreadsheet nilai manual

Karena semua berada dalam **8bitOS Teacher Environment**.

---

## 14. Modul 8bitOS (Index)

| Kode | Modul | Fase | Spec |
|---|---|---|---|
| A | Dashboard | RENCANA | 1 ✅ |
| B | Classroom Management | PELAKSANAAN/ASESMEN | 1 ✅ + 2 ✅ (student CRUD, session report) |
| C | Teaching Planner | RENCANA | 2 ✅ |
| D1 | Smart Notes | PERSIAPAN/EVALUASI | 2 ✅ (teks; stylus/audio → Spec 3) |
| D2 | Whiteboard | PELAKSANAAN | 3 |
| D3 | Browser Internal | PERSIAPAN | 3 |
| E | Assessment Center | ASESMEN | 3 |
| F | Gradebook | ANALISIS | 3 |
| G | Document Center | ARSIP | 4 |
| H | AI Teacher Assistant | Lintas | 4 |
| I | Launcher Mode | Device | ✅ Dibangun (APK debug; hardening menyusul) |

Detail tiap modul: **Dokumen 03 — Module Specs** (`docs/foundation/03-module-specs.md`).

---

## 15. Acuan Database (Spec 1 + Planned)

| Tabel | Fase | Status |
|---|---|---|
| `subjects` | foundation | Spec 1 |
| `classes` | foundation | Spec 1 |
| `class_subjects` | foundation | Spec 1 |
| `students` | foundation | Spec 1 |
| `schedule_slots` | foundation | Spec 1 |
| `class_sessions` | foundation | Spec 1 |
| `attendance_records` | foundation | Spec 1 |
| `notes` | PELAKSANAAN/ARSIP | Spec 2 |
| `session_activities` | PELAKSANAAN | Spec 2 |
| `session_reports` | EVALUASI | Spec 2 |
| `plans` / `plan_items` | RENCANA | Spec 2 |
| `documents` | PERSIAPAN/ARSIP | Spec 4 |
| `assessments` / `questions` / `attempts` | ASESMEN | Spec 3 |
| `grade_components` / `grades` | ANALISIS | Spec 3 |
| `ai_jobs` | lintas fase | Spec 4 |
| `audit_logs` | lintas fase | Spec 4 |

---

## 16. Prinsip UX dari Workflow Ini

1. **Maksimal 2 tap** dari Dashboard ke fungsi harian (Mulai sesi, Buka absensi, Buka materi).
2. **Tidak ada modal berlapis** untuk operasi kritis (absensi, mulai sesi).
3. **State sesi KBM selalu terlihat** — banner aktif dengan kelas + mapel + timer muncul di semua layar saat KBM berlangsung.
4. **Offline-first** — data kritikal (absensi) selalu enqueue ke outbox, flush di background.
5. **Context switching minimum** — pindah dari materi ke notes dalam 1 gesture (split workspace di Spec 2).
6. **Daily Report otomatis** — saat guru menutup KBM, ringkasan harian tersedia tanpa input manual.

---

## 17. Dokumen Lanjutan

- **Dokumen 03 — Module Specs** (`docs/foundation/03-module-specs.md`) ✅
- **Dokumen 04 — System Architecture** (`docs/foundation/04-system-architecture.md`) — berikutnya
- **Dokumen 05 — Design System** (`docs/decisions/04-design-system.md`) ✅
- **Dokumen 06 — Data Model** (`docs/decisions/07-data-model.md`) ✅
- **Dokumen 07 — Spec 1** (`docs/specs/2026-09-03-8bithos-spec-1.md`) ✅
