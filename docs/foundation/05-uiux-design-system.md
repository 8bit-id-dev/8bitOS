# Dokumen 05 — 8bitOS UI/UX Design System

**Versi:** 2.0 — Pixel Minimalist + Stylus First Edition
**Status:** Final
**Tanggal:** 2026-09-03
**Platform:** Huawei MatePad Mini (Launcher + Fullscreen App)
**Target:** Guru SMA/SMK

> Direction: **Clean • Pixel • Monochrome • Stylus-First • Distraction Free**
> "Minimal Pixel Productivity OS for Teachers" — retro-futuristic, tetap profesional.

---

## 1. Design Philosophy

8bitOS harus terasa seperti: notebook digital premium, ruang kerja pribadi guru, sistem operasi produktivitas. Bukan dashboard sekolah penuh warna atau aplikasi administrasi.

> "Remove everything unnecessary. Keep only what helps the teacher think and teach."

### Prinsip
1. **Teacher First** — desain mengikuti alur kerja guru (masuk kelas → absensi → materi → menjelaskan → latihan → evaluasi → nilai → laporan), bukan struktur menu.
2. **Zero Distraction** — tanpa berpindah aplikasi, tanpa mencari file, tanpa banyak tab/akun.
3. **One Screen Workflow** — satu layar utama memberi jadwal, kelas berikutnya, catatan terakhir, tugas pending, shortcut.
4. **Human Interface** — terasa seperti notebook digital, bukan sistem administrasi sekolah.

---

## 2. Visual Identity

**Keywords:** Pixel · Minimal · Monochrome · Digital Notebook · Teacher Workspace · Handwriting Friendly · Precision

**Inspirasi:** retro computer terminal · pixel art modern · e-ink notebook · digital handwriting tablet · Apple Notes + Notion + 8-bit aesthetic

**Dilarang:** gradient · warna cerah/dekoratif · bounce animation · banyak badge · border berlebihan · ikon pendidikan klasik

---

## 3. Color System

Monokrom murni — tidak ada warna lain.

| Token | Hex | Penggunaan |
|---|---|---|
| `bg` | `#050505` | Background utama (dark = default) |
| `surface` | `#111111` | Panel/elevated surface |
| `fg` | `#FFFFFF` | Text utama, primary action |
| `gray-300` | `#AAAAAA` | Text sekunder |
| `line` | `#222222` | Hairline border |
| `line-strong` | `#333333` | Border tegas |

**Dark mode = default** (cocok dengan pixel style). Light mode reverse: bg `#FFFFFF`, surface `#FAFAFA`, text `#000000`, border `#E5E5E5`.

Status dibedakan **label teks**, bukan warna (color-blind safe).

---

## 4. Typography System

### 4.1 Font Pairing

**Pixel identity font — Pixelify Sans:**
- Logo, menu, judul, heading, label, status, tombol, count
- Modern pixel, tetap readable untuk UI

**Reading font — Inter:**
- Body/materi/soal/catatan/dokumen/deskripsi
- Pixel font untuk identitas, bukan untuk membaca panjang

**Alternatif:** VT323 (terminal style, heading saja) · Silkscreen · Press Start 2P (judul display saja, jangan body)

### 4.2 Type Scale

| Level | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Pixel Display | Pixelify | 42px | 700 | "GOOD MORNING TEACHER" |
| Pixel Heading | Pixelify | 24px | 600 | section title |
| Pixel Label | Pixelify | 12px | 500 | label/status/menu |
| Micro | Pixelify | 10px | 500 | [SOON], hint |
| Body | Inter | 15px | 400 | lh 1.6–1.7 |
| Caption | Inter | 12px | 400 | `#777`-ish secondary |

---

## 5. Layout System

**Tablet-first landscape** (MatePad Mini), portrait secondary (OrientationGuard memaksa landscape di app; launcher boleh both).

```
┌────────────────────────────────┐
│ Status / Context Bar           │
├──────────┬─────────────────────┤
│ Sidebar  │ Workspace          │
│ 72px     │ (padding luas,      │
│          │  banyak whitespace) │
├──────────┴─────────────────────┤
│ Quick Actions (floating)       │
└────────────────────────────────┘
```

Whitespace: margin besar, padding luas, sedikit elemen. Divider pakai hairline `#222`, bukan shadow.

---

## 6. Sidebar (Dock)

Minimal, outline-only icon stroke 1.5px feel (pixel outline), monochrome.

```
HOME · CLASS · PLAN · ASSESS · GRADE · NOTES · TOOLS
────────
SETTINGS (soon)
```

Active: `#FFFFFF` fill left-bar + text putih. Inactive: `#777`. Label pixel font 10px uppercase.

---

## 7. Component System

### 7.1 Pixel Button

```
┌────────────────┐
│  START QUIZ ▶  │   primary: bg #FFF, text #000
└────────────────┘   secondary: border 1px #333, transparent
                     height 44px, pixel-cut corner
```

Corner: **pixel cut** (chamfer 3px), bukan rounded modern. Hover: invert halus. Active: offset 2px.

### 7.2 Flat Card

Tanpa bayangan. Background `#050505`/`#111`, border hairline, padding lega. Header label pixel font + hairline divider.

### 7.3 Pixel Icon

Fill-based 12×12 grid, sharp edges, monochrome. Ukuran 16/20/24px.

### 7.4 Input

Border 1px `#333`, font **Inter** 15px (input = membaca/menulis). Focus: border putih solid.

---

## 8. Stylus Interaction System

Stylus = first-class input. Saat pen aktif:

```
┌────────────────────┐
│ PEN MODE ACTIVE    │
│ ✎ Draw □ Select   │
│ T Text E Eraser    │
│ ↶ Undo             │
└────────────────────┘
```

- Palm rejection otomatis saat pen terdeteksi
- Pressure sensitivity: stroke 2–5px scaled by pressure
- Handwriting layer terpisah dari text layer per halaman

---

## 9. Digital Notebook & Canvas

Setiap halaman punya: Page ID, Date, Class, Subject, Tags, Handwritten Layer, Text Layer.

**Canvas background — Pixel Paper:** grid 4px, opacity 5% (halus, tidak mengganggu tulisan).

**Handwriting recognition flow:** guru menulis → AI baca → tawaran `[Keep handwriting] [Convert text] [Create material]`.

---

## 10. AI Assistant — "8bit AI"

Visual identitas pixel block (`█` mark), floating panel minimal. Prompt chips: Generate / Analyze / Summarize. Bukan chatbot besar — copilot kecil yang fokus.

---

## 11. Animation

Sangat halus. Durasi: micro 150ms · normal 250ms · page 350ms. Transisi: fade, slide, scale kecil. Loading: pixel progress bar `█░░░`.

---

## 12. Accessibility

Font scaling · high contrast (putih di `#050505` > 18:1) · keyboard shortcut (Ctrl+K) · stylus support · label-status bukan warna.

---

## 13. Screen Personality

- **Launcher Home** — "Teacher Command Center": jam besar, NEXT MISSION (kelas berikut), grid tool, TODAY LOG
- **Classroom Mode** — fokus: kelas, kehadiran, material, activity, notes
- **Assessment Studio** — seperti editor game level: QUESTION BUILDER dengan level `★★★☆☆`, stimulus/question/answer/analysis
- **Grade Center** — tabel minimal hairline
- **Whiteboard** — pixel paper + pen mode
- **Browser** — chrome minimal, aksi simpan-referensi

---

## 14. Logo Direction

Monochrome: **8 + pixel/brain + OS**. Wordmark **8OS** putih di `#050505` + pixel cursor `▮`. Tanpa gradient/warna cerah.

---

## 15. Personality Map

| Produk | Karakter |
|---|---|
| Apple | Premium |
| Notion | Flexible |
| Linear | Technical |
| Arc | Calm |
| **8bitOS** | **Teacher Intelligence Workspace** |

---

## 16. Final Visual Statement

> "A pixel-inspired digital workstation where teachers write, teach, assess, and manage their classroom using one device and one stylus."

8bitOS harus terlihat seperti sistem operasi profesional untuk guru — hitam-putih, whitespace, typography kuat, ikon pixel, interface tenang, fokus pada pekerjaan guru.

---

## 17. Implementasi (mapping ke kode)

| Rule | File |
|---|---|
| Tokens monokrom | `src/shared/styles/tokens.css` |
| Pixel-cut + pixel-paper utilities | `src/shared/styles/globals.css` |
| Font pairing (Pixelify/Inter) | `index.html` + `tailwind.config.ts` (`font-pixel` / `font-sans`) |
| Pixel icons fill-based | `src/shared/components/icons.tsx` |
| Dock 7 slot | `src/shared/components/Dock.tsx` |
| PixelButton/PixelCard/Input | `src/shared/components/` |
| Reading areas font-sans | planner/notes/assessment/AI screens |
| Whiteboard pixel paper + pen mode | `src/features/whiteboard/Whiteboard.tsx` |
| Icon 8OS monokrom | `scripts/gen-icons.mjs` → semua density |

> **Catatan versi:** v1.0 (pixel monochrome, Doc 05 awal) → v1.1 retro terminal phosphor-green → **v2.0 Pixel Minimalist + Stylus First (SAAT INI)** — kembali ke monokrom murni, tanpa glow/scanline, font pairing Pixelify+Inter, reading Inter.
