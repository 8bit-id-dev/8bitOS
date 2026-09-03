# 8bitOS System Architecture (Doc 03)

**Status:** Architecture reference — re-captured at session restart
**Date:** 2026-09-03
**Source:** Original Doc 03 provided by user

## High-level layers

```
8bitOS UI (Teacher Launcher)
    ↓
[Teaching Workspace | Assessment Engine | Productivity Tools]
    ↓
8bitOS Core (System Services)
    ↓
Data Layer (Local + Cloud Sync)
    ↓
Android / HarmonyOS Hardware
```

## Layer breakdown

### Layer 1 — Presentation
- 8bitOS Teacher Launcher (home screen khusus guru)
- Teacher Home: greeting + next class + quick actions + today's schedule

### Layer 2 — Teacher Workspace
- Attendance Module (daftar siswa, status H/I/S/A, rekap, statistik)
- Material Browser (internal browser, simpan referensi)
- Smart Whiteboard (tulisan tangan, formula, grafik, export PDF)

### Layer 3 — Assessment Engine
- Question Bank (Subject > Grade > Topic > Difficulty > Type)
- Quiz Builder (PG/PG-kompleks/T-F/Essay)
- Workflow: Blueprint → Kompetensi → Stimulus → Question → Answer Key → Validation → Publish
- Assessment Analytics: nilai, rata-rata, analisis soal, tingkat kesulitan, remedial

### Layer 4 — Productivity
- Smart Notes (Rapat/KBM/Administrasi/Ide/Arsip)
- Document Manager (modul ajar/RPP/LKPD/soal/nilai/surat) — PDF/DOCX/XLSX/PPT

### Layer 5 — AI Teacher Assistant
- 8bit AI Core: lesson, question generation, teaching reflection

## Core System Services

- **User Management:** Guru, Sekolah, Kelas, Mata pelajaran
- **Storage Service:** Local (offline/cache/dokumen penting) + Cloud (backup/sync)
- **Sync Engine:** Tablet ↔ Cloud Database ↔ Backup

## Database Structure

- Users → Teacher
- School → Classes
- Students → Attendance
- Subjects → Materials
- Assessment → Questions / Answers / Results
- Notes → Documents

## Offline First

Koneksi sering terbatas. Local Database di tablet. Sync engine ke Cloud DB saat online. Tetap jalan: Absensi, Catatan, Quiz, Materi, Penilaian.

## Security

- Auth: PIN, Password, Biometric
- Data protection: encrypt local DB, dokumen, backup
- Role: Admin Sekolah → Guru → Siswa

## Hardware target

- Huawei MatePad Mini, RAM min 6GB (recommended 8GB+), storage 128GB (256GB+), input Stylus/Keyboard/Mouse

## Tech stack recommendation (Doc 03's original)

- Frontend: Native Android Kotlin/Jetpack Compose **OR** Flutter/React Native
- Backend: API Gateway → Service → DB → Storage
- DB: SQLite/Room (local) + PostgreSQL/Supabase/Firebase (cloud)

**Note:** This conflicts with Doc 01's React+Vite+PWA+Capacitor+Supabase/InsForge stack. We follow Doc 01 (newer, more specific) and use InsForge as the managed backend.

## Module Roadmap (Doc 03 version)

- **Phase 1:** Launcher, Dashboard, Notes, Document Manager
- **Phase 2:** Attendance, Material Browser, Smart Whiteboard
- **Phase 3:** Quiz Builder, Question Bank, Analytics
- **Phase 4:** AI Assistant, Auto Question Generator, Learning Analytics

**Note:** This differs from Doc 01's roadmap (Phase 1 includes Classroom, Browser, Library). We follow Doc 01 since it is the canonical source.
