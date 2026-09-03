# Dokumen 01 — 8bitOS Product Foundation

**Versi:** 1.0
**Status:** Final
**Tanggal:** 2026-09-03
**Tipe:** Dokumen dasar pengembangan aplikasi

---

## 1. Identitas Produk

| Atribut | Nilai |
|---|---|
| Nama | 8bitOS |
| Kategori | Teacher Operating System (Super App) |
| Target perangkat | Huawei MatePad Mini (landscape) — juga berfungsi di browser desktop & Android/iOS via Capacitor |
| Tagline | *One Device. One Workspace. Complete Teaching Workflow.* |

**Konsep utama.** 8bitOS adalah ruang kerja digital terpadu yang dirancang khusus untuk guru agar seluruh aktivitas KBM (Kegiatan Belajar Mengajar) dapat dilakukan dalam satu aplikasi. 8bitOS mengubah tablet menjadi perangkat kerja profesional guru yang mendukung perencanaan, pelaksanaan, pengelolaan kelas, pembuatan materi, evaluasi, dokumentasi, dan administrasi pembelajaran.

---

## 2. Filosofi Produk

Guru saat ini harus berpindah banyak aplikasi: browser untuk materi, aplikasi catatan, aplikasi dokumen, spreadsheet untuk nilai, aplikasi quiz, aplikasi penyimpanan. Hal tersebut membuat alur kerja tidak terintegrasi.

8bitOS hadir sebagai **satu lingkungan kerja digital** yang mengikuti seluruh perjalanan guru dalam mengajar — dari pagi hingga selesai KBM.

---

## 3. Makna Nama

- **8bit** — identitas visual & budaya: kreativitas, kesederhanaan, nostalgia teknologi, karakter visual unik (pixel/monochrome).
- **OS** — bukan menggantikan Android, melainkan *Operating System* untuk aktivitas kerja guru.

---

## 4. Visi & Misi

**Visi.** Menjadi platform kerja digital yang membantu guru mengajar lebih efektif, kreatif, dan terorganisir melalui satu perangkat.

**Misi.**
1. Mengurangi ketergantungan guru pada banyak aplikasi.
2. Menyatukan seluruh aktivitas KBM.
3. Memanfaatkan tablet + stylus secara maksimal.
4. Membantu guru menciptakan pembelajaran yang lebih menarik.
5. Menyediakan dokumentasi otomatis dari proses pembelajaran.

---

## 5. Siklus Kerja Guru (Inti Sistem)

```
PLAN  →  PREPARE  →  TEACH  →  ASSESS  →  REPORT
```

Seluruh modul 8bitOS dipetakan ke salah satu fase ini.

---

## 6. Modul Utama

| Kode | Modul | Fase | Status Spec 1 |
|---|---|---|---|
| A | Dashboard | PLAN | ✅ (hari ini) |
| B | Classroom Management | TEACH / ASSESS | ✅ (list + hub + absensi) |
| C | Teaching Planner | PLAN | ⏳ Spec 2 |
| D1 | Smart Notes | PREPARE / REPORT | ⏳ Spec 2 |
| D2 | Whiteboard | TEACH | ⏳ Spec 3 |
| D3 | Browser Internal | PREPARE | ⏳ Spec 3 |
| E | Assessment Center | ASSESS | ⏳ Spec 3 |
| F | Gradebook | ASSESS | ⏳ Spec 3 |
| G | Document Center | REPORT | ⏳ Spec 4 |
| H | AI Teacher Assistant | PLAN / PREPARE / REPORT | ⏳ Spec 4 |
| I | Launcher Mode | (device integration) | ⏳ Phase 4 |

Detail setiap modul ada di Dokumen 02 (Workflow Map) dan Dokumen 03 (Module Specs, menyusul).

---

## 7. Integrasi Huawei MatePad

| Aspek | Pemanfaatan |
|---|---|
| Stylus (M-Pencil) | Smart Notes, Whiteboard, anotasi PDF, rumus matematika |
| Split Workspace | Materi (kiri) + Catatan (kanan), atau Presentasi (atas) + Absensi+Timer (bawah) |
| Orientasi Landscape | Layout default; OrientationGuard menegakkan |
| Offline-first | IndexedDB outbox + service worker PWA |
| Launcher mode (masa depan) | Capacitor home-replacement agar boot langsung ke 8bitOS |

---

## 8. Teknologi

| Layer | Pilihan | Alasan |
|---|---|---|
| Frontend | React 18 + TypeScript 5 + Vite 5 | Cepat, type-safe, ekosistem matang |
| Styling | Tailwind CSS 3 | Custom design system monochrome pixel |
| Routing | React Router 6 (HashRouter) | PWA-friendly, tidak butuh server rewrite |
| State | Zustand + TanStack Query | Ringan; server state ter-cache |
| Local DB | IndexedDB via `idb` | Offline outbox |
| Backend | InsForge (Postgres + auth + RLS) | BaaS all-in-one |
| Mobile wrap | Capacitor | Akses stylus, fullscreen, launcher mode |
| Test | Vitest + happy-dom + MSW | Cepat, TDD-friendly |
| PWA | `vite-plugin-pwa` + Workbox | Service worker + manifest |

---

## 9. Roadmap

| Phase | Fokus | Output |
|---|---|---|
| 1 — Foundation | App shell, Dashboard, Classroom, absensi | Spec 1 (sedang dibangun) |
| 2 — Teaching Workflow | Planner, Materi, Quiz, Gradebook | Spec 2–3 |
| 3 — Intelligence | AI Assistant, analisis, generator | Spec 4 |
| 4 — Device Integration | MatePad optimasi, stylus, launcher | Spec 5+ |

---

## 10. Prinsip Desain

Setiap keputusan pengembangan harus memenuhi:

1. **Membantu guru bekerja lebih cepat** — single-tap ke fungsi penting, tidak ada menu bertingkat.
2. **Mengurangi perpindahan aplikasi** — fitur yang dipakai bersama (mis. absensi + materi) tampil dalam split workspace.
3. **Memanfaatkan kelebihan tablet** — stylus, split, offline.
4. **Pengalaman sederhana** — pixel-cut, monochrome, fokus pada konten.
5. **Menjaga fokus pada KBM** — bukan gimik, bukan dekorasi.

---

## 11. Pernyataan Akhir

> 8bitOS adalah sistem kerja digital pribadi seorang guru: satu perangkat, satu ruang kerja, dan seluruh proses mengajar dalam satu lingkungan yang terintegrasi.

Dokumen ini menjadi **Dokumen 01 — Product Foundation**. Tahap berikutnya adalah **Dokumen 02 — Teacher Workflow Map** yang memetakan aktivitas guru dari pagi sampai pulang, fitur yang dipakai, data yang disimpan, dan menjadi dasar database serta UI.
