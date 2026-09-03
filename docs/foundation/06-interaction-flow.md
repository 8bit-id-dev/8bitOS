# Dokumen 06 — 8bitOS Interaction Flow & Teacher User Journey

**Versi:** 1.0
**Status:** Draft Konseptual
**Tanggal:** 2026-09-03
**Tipe:** Pemetaan interaksi guru, mental model, flow KBM, prinsip UX stylus-first

> Dokumen ini mendefinisikan bagaimana guru berinteraksi dengan 8bitOS dari saat aplikasi dibuka hingga kegiatan belajar mengajar selesai. Fokusnya bukan hanya fitur, tetapi apa yang guru lihat, apa yang guru lakukan, bagaimana berpindah aktivitas, bagaimana stylus digunakan, dan bagaimana aplikasi mempertahankan konteks.

---

## 1. Prinsip Utama

> Guru tidak seharusnya berpikir *"saya sedang membuka fitur apa?"* tetapi *"saya sedang mengajar."*

8bitOS harus bekerja seperti **Teacher Operating Environment**, bukan sekadar kumpulan aplikasi. Semua aktivitas KBM dilakukan dari satu ruang kerja.

---

## 2. Konsep Utama: Teacher Journey

Alur utama guru:

```
OPEN 8bitOS
     ↓
TEACHER HOME
     ↓
PILIH KELAS
     ↓
MULAI SESI KBM
     ↓
┌───────────────────────────────┐
│          TEACHING             │
│                               │
│  Absensi · Materi · Browser   │
│  Whiteboard · Notes · Quiz    │
│  Penilaian                    │
└───────────────────────────────┘
     ↓
RANGKUMAN SESI
     ↓
SIMPAN OTOMATIS
     ↓
END SESSION
```

Guru tidak perlu mengikuti urutan linear. Setiap aktivitas dapat dipanggil kapan saja.

---

## 3. Mental Model: Session-Based Teaching

Setiap kegiatan mengajar dianggap sebagai **Teaching Session** dengan identitas:

```
Matematika
XII IPA 1
2 September 2026
07:00 – 08:30
```

```
        SESSION
           │
 ┌─────────┼─────────┐
 │         │         │
Absensi  Materi    Quiz
 │         │         │
Notes    Browser   Nilai
 │         │         │
 └─────────┴─────────┘
           │
       Session Log
```

Semua aktivitas yang dilakukan selama sesi otomatis dikaitkan dengan: kelas, mata pelajaran, tanggal, jam, materi, siswa, hasil evaluasi. Guru tidak perlu berkali-kali melakukan Save As, memilih folder, atau memasukkan metadata.

---

## 4. Struktur Navigasi Utama

Navigasi minimal:

```
┌─────────────────────────────────────┐
│  8bitOS             07:42     ⚙    │
├─────────────────────────────────────┤
│            CURRENT SESSION           │
│          MATEMATIKA                 │
│          XII IPA 1                  │
│          07:00 — 08:30              │
│       [ CONTINUE SESSION ]          │
├─────────────────────────────────────┤
│  HOME   CLASS   TOOLS   NOTES       │
└─────────────────────────────────────┘
```

| Slot | Fungsi |
|---|---|
| HOME | Pusat aktivitas guru |
| CLASS | Manajemen kelas dan siswa |
| TOOLS | Seluruh alat KBM |
| NOTES | Catatan guru, rapat, ide, dokumentasi |

---

## 5. Teacher Home

Home bukan dashboard yang penuh informasi. Home menjawab tiga pertanyaan:

1. **Saya mengajar apa?** (next session)
2. **Sekarang harus melakukan apa?** (recent + quick action)
3. **Apa yang terakhir saya kerjakan?** (recent items)

Contoh:

```
GOOD MORNING
Wednesday · 02 September 2026
────────────────────────
NEXT SESSION
MATEMATIKA
XII IPA 1
07:00 — 08:30
[ START ]
────────────────────────
RECENT
• Quiz Fungsi
• Materi Integral
• Rapat OSIS
• XII IPA 2 — Absensi
────────────────────────
QUICK ACTION
+ Note · + Quiz · + Attendance · + Browser
```

---

## 6. Start Session Flow

```
START
  ↓
Pilih / konfirmasi kelas
  ↓
Pilih mata pelajaran
  ↓
Pilih materi
  ↓
CREATE SESSION
```

Sebanyak mungkin data diisi otomatis dari jadwal. Target: **maksimal 1 tap** untuk memulai sesi.

```
┌─────────────────────────────┐
│ START SESSION                │
│ MATEMATIKA                  │
│ XII IPA 1                   │
│ Materi: Integral             │
│ Wednesday · 07:00           │
│       [ START SESSION ]      │
└─────────────────────────────┘
```

---

## 7. Session Workspace (Teaching Desk)

Pusat interaksi utama 8bitOS saat KBM.

```
┌─────────────────────────────────────┐
│ ←  XII IPA 1       07:08      •••   │
├─────────────────────────────────────┤
│             WORKSPACE               │
│          [ CONTENT AREA ]           │
├─────────────────────────────────────┤
│  ATTEND   NOTES   WEB   QUIZ        │
│             + MORE                  │
└─────────────────────────────────────┘
```

**Content area dinamis** — bisa berisi: halaman web, halaman catatan, editor quiz, kanvas whiteboard, daftar nilai, dsb.

---

## 8. Quick Tool System

Session tetap hidup saat tool dibuka. Guru bisa berpindah tool tanpa kehilangan konteks.

```
TEACHING DESK
      │
      ├── Attendance
      ├── Notes
      ├── Browser
      ├── Whiteboard
      ├── Quiz
      ├── Assessment
      ├── Timer
      ├── Files
      └── More
```

Contoh: `Quiz → Browser → Notes → Quiz` — kembali ke kondisi sebelumnya, draft masih ada.

---

## 9. Attendance Flow

```
SESSION
  ↓
ATTENDANCE
  ↓
Daftar siswa
  ↓
Tandai status
  ↓
AUTO SAVE
```

```
ATTENDANCE
XII IPA 1 · 32 Students
✓ Hadir   28
○ Izin     2
× Sakit    1
— Alpa     1
[ SAVE ]   Auto saved 07:06
```

**Stylus interaction:** coret/tandai siswa, swipe status, catatan, anotasi khusus.

---

## 10. Notes Flow

Tiga jenis catatan:

| Jenis | Konteks |
|---|---|
| Session Note | Terkait kelas & sesi aktif |
| Personal Note | Catatan pribadi guru |
| Meeting Note | Rapat (Kesiswaan, MGMP, dll) |

Input: keyboard, stylus, handwriting, drawing, LaTeX/math input, voice, scan.

---

## 11. Stylus-First Interaction

Stylus bukan aksesori. Stylus adalah **primary interaction method** untuk:

- Handwriting
- Menggambar
- Mencoret (coret materi PDF, coret jawaban siswa)
- Anotasi
- Menulis rumus
- Grading
- Marking jawaban
- Catatan cepat

Contoh pada materi:

```
        ∫ x² dx
        ─────────
        [ stylus menulis penjelasan ]
```

---

## 12. Browser Flow (Learning Browser)

```
TEACHING DESK → WEB → Search → Google/SE → Website → SAVE TO SESSION
```

Guru dapat mencari materi, contoh soal, video, artikel, referensi, dan menyimpan halaman.

Setiap halaman punya quick action:

```
[ Save to Session ]
[ Add to Notes    ]
[ Create Question ]
[ Screenshot      ]
```

---

## 13. Content → Question Flow

```
BROWSER → menemukan materi → SELECT TEXT/IMAGE → CREATE QUESTION
       → Question Editor → SAVE
```

Editor:

```
QUESTION
Stimulus   [...................]
Question   [...................]
Options    A. ...
           B. ...
           C. ...
           D. ...
           E. ...
Answer     [ C ]
[ SAVE ]
```

---

## 14. Quiz Flow

```
QUIZ → Create/Open → Question List → Start Quiz
     → Students Answer → Submit → Auto Grade → Result
```

```
QUIZ RESULT
32 Students
Average  78
Highest  100
Lowest    45
Correct   78%
Incorrect 22%
[ VIEW ANALYSIS ]
```

---

## 15. Assessment Flow

```
ANSWER → REVIEW → GRADE → FEEDBACK → SAVE
```

Manual grading (essay/proyek):

```
STUDENT: BUDI
[ ANSWER: 8x + 4 = 20 ]
Score     [ 85 ]
Feedback  [ Good. Check step 3. ]
[ SAVE ]
```

Stylus: tanda langsung pada jawaban siswa.

---

## 16. Timer Interaction

Timer adalah **floating system tool** — tidak membuka halaman baru, bisa dipanggil dari mana saja.

```
ANYWHERE → TIMER (overlay/floating)
```

---

## 17. Global Command System

```
⌕ What do you want to do?
> attendance
> create quiz
> open XII IPA 1
> timer 15 minutes
> new note
> search integral
```

Akses via keyboard atau stylus. Target: apapun dalam 1–2 interaksi.

---

## 18. Quick Capture

Untuk ide spontan — dipanggil dari mana saja:

```
QUICK CAPTURE
✎ Write
🎙 Voice
📷 Capture
🧮 Math
[ Save ]
```

Otomatis diberi konteks session:

```
Session: Matematika — XII IPA 1
Captured: "Berikan latihan substitusi untuk pertemuan berikutnya."
```

---

## 19. Context Preservation

Prinsip teknis terpenting: saat guru berpindah tool, konteks tidak hilang.

```
SESSION
  │
  ├─ Attendance
  │
  ├─ Browser
  │
  ├─ Notes
  │
  └─ Quiz
```

Contoh: guru mengedit Quiz Question 7 (draft) → buka Browser → kembali. Quiz Question 7 dengan draft masih ada.

---

## 20. Auto Save Philosophy

> **Don't Make Teacher Save.**

```
Typing    → Auto Save
Drawing   → Auto Save
Attendance→ Auto Save
Grade     → Auto Save
```

Indikator:

```
● Saved
● Saving...
```

---

## 21. Session Ending Flow

```
END SESSION → Session Summary
```

```
SESSION COMPLETE
MATEMATIKA · XII IPA 1
Duration     1h 27m
Attendance   32 / 32
Quiz         20 questions
Average      78
Notes        3
[ END SESSION ]
```

```
SESSION SAVED
✓ Attendance
✓ Materials
✓ Notes
✓ Quiz
✓ Assessment
[ BACK HOME ]
```

---

## 22. Teacher Daily Journey

### Sebelum mengajar
```
Open 8bitOS → See today's schedule → Prepare material
            → Open browser → Create notes / quiz
```

### Saat mengajar
```
Start Session → Attendance → Teaching
            → Browser / Notes / Whiteboard → Quiz → Assessment
```

### Setelah mengajar
```
Session Summary → Review → Save → Home
```

---

## 23. Full-Day Teacher Journey

```
              8bitOS
                │
          ┌─────┴─────┐
          │    HOME   │
          └─────┬─────┘
                │
         Today's Schedule
                │
      ┌─────────┴─────────┐
      │                   │
  CLASS A               CLASS B
      │                   │
   SESSION             SESSION
      │                   │
 ┌────┼────┐         ┌────┼────┐
 │    │    │         │    │    │
Attend Notes Web   Attend Quiz Notes
 │    │    │         │    │    │
 └────┼────┘         └────┼────┘
      │                   │
   SUMMARY             SUMMARY
      │                   │
      └─────────┬─────────┘
                │
            END DAY
                │
           DAILY REVIEW
```

---

## 24. End-of-Day Review

```
TODAY · 3 Sessions
────────────────────
MATEMATIKA · XII IPA 1   ✓ Completed
MATEMATIKA · XII IPA 2   ✓ Completed
RAPAT · Kesiswaan         ✓ Notes saved
────────────────────
PENDING
• Review 5 students
• Prepare tomorrow's quiz
• Follow-up material
```

---

## 25. Notification Philosophy

Quiet information. Hindari popup/badge/reminder berlebihan.

Contoh:

```
● Saved
3 students haven't been graded
```

Muncul saat relevan, tidak mengganggu KBM.

---

## 26. Error Recovery

Kesalahan tidak boleh membuat guru kehilangan pekerjaan.

```
8bitOS reopened
RECOVER SESSION?
Matematika · XII IPA 1 · 07:00
Last saved: 07:42
[ RECOVER ] [ DISCARD ]
```

Draft dapat dipulihkan.

---

## 27. Interaction Principles

| # | Prinsip | Penjelasan |
|---|---|---|
| 01 | One Space | Guru tetap dalam satu lingkungan kerja |
| 02 | Context First | Konteks kelas & sesi selalu dipertahankan |
| 03 | Minimum Taps | Aktivitas umum maksimal 1–3 interaksi |
| 04 | Auto Save | Tidak ada beban administratif |
| 05 | Stylus Native | Handwriting bukan fitur tambahan |
| 06 | Fast Capture | Ide dicatat dalam hitungan detik |
| 07 | No Dead Ends | Setiap tool kembali ke aktivitas sebelumnya |
| 08 | Calm UI | Bukan software administrasi yang berat |

---

## 28. State Model

```
IDLE → ACTIVE → DRAFT → SAVED → COMPLETED
```

Contoh Quiz: `Draft → Saved → Started → Submitted → Graded → Completed`

---

## 29. Core Interaction Loop

```
DISCOVER → PREPARE → TEACH → CAPTURE → ASSESS → REVIEW → SAVE → CONTINUE
```

Tidak ada kebutuhan untuk keluar app → buka browser → buka notes → buka spreadsheet → copy data → kembali. Semua harus terasa seperti satu OS kecil untuk guru.

---

## 30. UX North Star

> "Apakah guru bisa melakukan ini tanpa merasa sedang mengoperasikan aplikasi?"

Jika tidak, interaksi perlu disederhanakan.

Target pengalaman:

```
        8bitOS
    ┌─────────────┐
    │   TEACH     │
    │   THINK     │
    │   CREATE    │
    │   ASSESS    │
    └─────────────┘
      Technology
         ↓
      Invisible
```

---

## 31. Implikasi ke Spec Implementasi

Prinsip-prinsip di atas menerjemahkan ke fitur teknis:

| Prinsip | Implementasi |
|---|---|
| One Space | Sidebar (Doc 05) + single workspace shell |
| Context First | `class_session` state disimpan global (Zustand) — banner aktif di semua layar |
| Minimum Taps | Quick action toolbar (Spec 2) di Teaching Desk |
| Auto Save | Outbox offline-first (Spec 1 sudah) + debounce save 1.5s untuk teks (Spec 2) |
| Stylus Native | Capacitor Pointer Events + canvas library (Spec 3 Whiteboard) |
| Fast Capture | FAB Quick Capture global (Spec 2) |
| No Dead Ends | React Router 6 dengan preserved query state + history stack per tool |
| Calm UI | Monokrom, no color spam, no badge bomb (Doc 05 Design System) |

---

## 32. Dokumen Lanjutan

- **Dokumen 01** — Product Foundation
- **Dokumen 02** — Teacher Workflow Map
- **Dokumen 03** — Module Specs
- **Dokumen 04** — System Architecture
- **Dokumen 05** — UI/UX Design System
- **Dokumen 07** — Information Architecture & Screen Map — berikutnya
- **Dokumen 08** — Data Model (`docs/decisions/07-data-model.md`)
- **Dokumen 09** — Spec 1 (`docs/specs/2026-09-03-8bithos-spec-1.md`)
