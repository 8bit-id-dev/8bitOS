# Dokumen 05 — 8bitOS UI/UX Design System

**Versi:** 1.0
**Status:** Final
**Tanggal:** 2026-09-03
**Tipe:** Design system untuk launcher, dashboard, ikon, warna, navigasi, pengalaman MatePad Mini

> Mendefinisikan tampilan 8bitOS: launcher, dashboard, ikon, warna, tipografi, navigasi, dan pola interaksi di Huawei MatePad Mini (landscape). Dokumen ini menjadi acuan implementasi visual seluruh modul A–I.

---

## 1. Filosofi Desain

8bitOS menggunakan identitas **pixel-monochrome** sebagai bahasa visual:

- **Monokrom tegas** — hitam & putih sebagai pondasi, abu-abu sebagai variasi. Tidak ada warna aksen mencolok; status dibedakan oleh label, bukan hue.
- **Pixel-cut** — sudut tajam, clip-path geometris, tanpa rounded corners.
- **Tipografi pixel** — Pixelify Sans untuk heading/UI, Inter untuk body agar tetap terbaca panjang.
- **Border 2px** — semua permukaan penting memiliki garis batas tegas.
- **Hard offset shadow** — bayangan bukan blur, melainkan offset solid (pixel-art style).
- **Reduced motion default** — hormati `prefers-reduced-motion`.

Tujuan UX: **guru bisa menavigasi dengan 1-2 tap** dari Dashboard ke fungsi KBM apapun. Tidak ada menu tersembunyi, tidak ada animasi berlebihan.

---

## 2. Target Device & Orientasi

| Atribut | Nilai |
|---|---|
| Device utama | Huawei MatePad Mini |
| Orientasi default | **Landscape** (paksa via OrientationGuard) |
| Resolusi desain | 1280×800, 1920×1200 |
| Input | Touch, M-Pencil, keyboard opsional |
| Touch target minimum | 44×44 CSS px (Apple HIG) |
| Density | 2x (consider 1.5x untuk tablet kecil) |

**OrientationGuard** menampilkan提示 "Putar tablet ke mode landscape" jika `window.orientation` bukan landscape.

---

## 3. Color Tokens

### 3.1 Skema utama

| Token | Hex | Penggunaan |
|---|---|---|
| `--bg` | `#050505` | Background utama |
| `--fg` | `#ffffff` | Teks, border, ikon aktif |
| `--gray-950` | `#0a0a0a` | Permukaan elevated |
| `--gray-700` | `#404040` | Border sekunder, disabled text |
| `--gray-500` | `#737373` | Teks tersier |
| `--gray-300` | `#d4d4d4` | Teks sekunder |
| `--gray-100` | `#f5f5f5` | Teks di dark mode (jarang) |

### 3.2 Status (pakai label, bukan hue)

| Status | Background | Text |
|---|---|---|
| Online | `--fg` | `--bg` |
| Offline | `--bg` + border 2px | `--fg` |
| Pending | `--bg` + border 2px dashed | `--fg` |
| Error | `--fg` solid | `--bg` (label "ERROR" eksplisit) |

**Prinsip:** tidak pernah hanya mengandalkan warna untuk state. Selalu ada label teks (`ONLINE` / `OFFLINE` / `ERROR`).

### 3.3 Tailwind config (existing)

```ts
colors: {
  bg: '#050505',
  fg: '#ffffff',
  grays: '#404040',
  gray300: '#d4d4d4',
  gray500: '#737373',
}
```

---

## 4. Typography

### 4.1 Font families

| Nama | Font | Penggunaan |
|---|---|---|
| `font-pixel` | Pixelify Sans | Heading, button, label, tab, nav |
| `font-sans` | Inter | Body, paragraf, daftar |

### 4.2 Skala tipografi

| Token | Size | Weight | Font | Line-height | Penggunaan |
|---|---|---|---|---|---|
| `display` | 32px | 700 | pixel | 1.1 | Halaman utama |
| `h1` | 24px | 700 | pixel | 1.2 | Section header |
| `h2` | 18px | 700 | pixel | 1.3 | Card title |
| `body` | 14px | 400 | sans | 1.5 | Body text |
| `small` | 12px | 400 | sans | 1.4 | Metadata |
| `mono` | 12px | 700 | pixel | 1.0 | Label, status, count |
| `micro` | 10px | 700 | pixel | 1.0 | [SOON], [ERROR] |

### 4.3 Aturan

- Heading selalu uppercase + tracking normal (pixel font sudah自带 kerning).
- Body text tidak pernah uppercase.
- Maksimum 60 karakter per baris body (readability).

---

## 5. Iconography

### 5.1 Style

- **Pixel-style SVG** — `viewBox 0 0 24 24`, `strokeWidth 2`, `strokeLinecap="square"`, `strokeLinejoin="miter"`.
- 5 ikon utama (sudah ada di `src/shared/components/icons.tsx`):

| Ikon | Modul | Bentuk |
|---|---|---|
| IconHome | Dashboard | Rumah + pintu |
| IconClass | Classroom | Buku dengan halaman |
| IconWork | Planner (soon) | Briefcase |
| IconTools | Tools (soon) | Obeng + kunci pas |
| IconSystem | System (soon) | Grid 4-kotak |

### 5.2 Aturan tambahan (modul masa depan)

- Ikon modul AI: robot kepala kotak dengan antena
- Ikon Notes: buku catatan spiral
- Ikon Whiteboard: kanvas dengan kuas
- Ikon Browser: globe kotak dengan grid
- Ikon Assessment: checklist dengan centang
- Ikon Gradebook: tabel dengan baris nilai
- Ikon Document: folder dengan dokumen

---

## 6. Layout Grid

### 6.1 Breakpoints

| Name | Min-width | Layout |
|---|---|---|
| `xs` (phone) | 0px | Single column (jarang dipakai) |
| `sm` (tablet portrait) | 640px | Single column |
| `md` (tablet landscape) | 960px | 2-column grid |
| `lg` (desktop) | 1280px | 3-column grid |
| `xl` (wide) | 1536px | 4-column grid |

### 6.2 Spacing scale (4px base)

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`

### 6.3 Layout utama (landscape)

```
┌────┬────────────────────────────────────────────┐
│    │  Header                                    │
│ S  ├────────────────────────────────────────────┤
│ I  │                                            │
│ D  │                                            │
│ E  │              Main Content                  │
│ B  │                                            │
│ A  │                                            │
│ R  │                                            │
│    │                                            │
│80px│                                            │
└────┴────────────────────────────────────────────┘
```

- **Sidebar (kiri):** 80px lebar, fixed, berisi nav utama + brand mark + versi.
- **Header (atas konten):** tidak tetap — inline di tiap screen (h1 + metadata kanan).
- **Main content:** scrollable vertikal, padding 24px.

---

## 7. Navigation

### 7.1 Primary: Sidebar kiri (5 slot)

| Slot | Label | Status Spec 1 |
|---|---|---|
| 1 | HOME | ✅ aktif |
| 2 | CLASS | ✅ aktif |
| 3 | WORK | 🔒 [SOON] |
| 4 | TOOLS | 🔒 [SOON] |
| 5 | SYSTEM | 🔒 [SOON] |

**State aktif:** background `--fg`, text `--bg`, underline 2×6px di bawah ikon.
**State nonaktif (soon):** text `--gray-500`, label `[SOON]`.

### 7.2 Secondary: Tab dalam layar

Contoh: ClassHub punya 4 tab: OVERVIEW / ROSTER / ATTENDANCE / NOTES.

Style tab:
- Inactive: `bg-bg text-fg border-2 border-fg`
- Active: `bg-fg text-bg border-2 border-fg`
- Soon: label `[SOON]` suffix

### 7.3 Tertiary: Breadcrumb / Back link

Pakai teks biasa dengan underline + prefix "←":

```
← KEMBALI KE DAFTAR KELAS
```

---

## 8. Komponen Inti (Pixel Components)

Semua komponen di `src/shared/components/`. Prinsip:

- **PixelButton** — 3 variant: `primary` (fg fill), `secondary` (border only), `danger`. Padding 12×16. Font pixel. Disabled state: text `--gray-500`.
- **PixelCard** — border 2px, padding 16, no rounded, no shadow default. Opsional `pixelShadow` prop untuk hard offset 4×4.
- **PixelInput** — border 2px, background `--bg`, text `--fg`, focus ring 2px offset.
- **PixelModal** — overlay hitam 80%, card 480px max-width, pixel-cut clip-path.
- **StatusPill** — 2 tone: `on` (fg fill), `off` (border only). Selalu ada label.
- **EmptyState** — title (pixel) + hint (sans, gray-300) + opsional CTA button.
- **ConfirmDialog** — wrapper di atas PixelModal untuk aksi destruktif.
- **Sidebar (Dock)** — lihat section 7.1.

### 8.1 Pixel-cut clip-path

```css
.pixel-cut {
  clip-path: polygon(
    0 4px, 4px 4px, 4px 0,
    calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px,
    100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px),
    calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px),
    0 calc(100% - 4px)
  );
}
```

Memberikan efek "pixel chamfer" di keempat sudut.

---

## 9. Interaction Patterns

### 9.1 Tap target

- Minimum 44×44 CSS px.
- Spacing antar tap target minimal 8px.
- Sidebar items: 80×80px (lebih besar dari minimum, mudah dijangkau stylus).

### 9.2 Feedback

- Tap tombol: tidak ada animasi (langsung state berubah) — sesuai prinsip reduced motion.
- Sukses: tampilkan toast 1.5s "✓ TERSIMPAN" atau update inline count.
- Error: tampilkan banner merah (label "ERROR") + retry button.
- Loading: skeleton block hitam dengan pulse subtle (atau text "LOADING…").

### 9.3 Form (Spec 2)

- Single column di tablet portrait, two-column di landscape.
- Submit button di kanan bawah, sticky pada scroll.
- Auto-save draft setiap 5 detik untuk notes panjang.

### 9.4 Drag & drop (Spec 3, Planner)

- 24px drop zone dengan border dashed.
- Visual feedback: drop zone jadi solid border saat item di atasnya.
- Tidak ada animasi transisi (instant snap).

### 9.5 Gestures (Capacitor, Phase 2)

- Swipe kanan dari edge: kembali (back gesture).
- Swipe kiri di dashboard: buka search/global.
- Two-finger swipe dari atas: split workspace toggle.
- Long press pada item: context menu.

---

## 10. State & Empty Patterns

### 10.1 Loading

`<p className="font-pixel text-xs text-gray-300">LOADING…</p>`

### 10.2 Empty

Gunakan `EmptyState` component:
- Title uppercase (pixel)
- Hint sentence (sans, gray-300)
- CTA opsional

Contoh:
- ClassList: "BELUM ADA KELAS" + "Tambahkan kelas di halaman ini setelah backend siap."
- AttendanceSheet: "TIDAK ADA SISWA" + "Tambahkan siswa di kelas ini."

### 10.3 Error

`<PixelCard>` dengan border merah-equivalent (pakai border fg + label "ERROR"):
```
ERROR
Tidak dapat memuat data.
PERIKSA JARINGAN → RETRY
```

### 10.4 Offline banner (Dashboard)

Border 2px fg, text "PULIHKAN SINDIKASI? · N ITEM BELUM TERKIRIM" + tombol RETRY.

---

## 11. Launcher Mode Mockup (Phase 4)

Saat 8bitOS menjadi Home App, tampilan pertama:

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

Style sama dengan launcher biasa: monokrom, pixel font, 2px border. Tap modul → langsung masuk workspace.

---

## 12. Accessibility (a11y)

- **Kontras:** semua teks `--fg` di `--bg` lulus WCAG AAA (>15:1).
- **Touch target:** minimum 44×44 (lihat 9.1).
- **Focus ring:** 2px offset solid `--fg` di semua interactive element.
- **Screen reader:** setiap komponen punya `aria-label` (e.g. "Andi, Izin, toggle button").
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` nonaktifkan pulse skeleton.
- **Bahasa:** label UI pakai Bahasa Indonesia (konsisten dengan guru lokal). Spesifikasi kode & file pakai English.

---

## 13. Microcopy Guidelines

| Konteks | Style | Contoh |
|---|---|---|
| Tombol aksi | Verb + uppercase | MULAI KBM · SIMPAN · HAPUS |
| Label status | Uppercase + monospace | ONLINE · OFFLINE · PENDING |
| Error | "Tidak dapat…" + saran | "Tidak dapat memuat. PERIKSA JARINGAN." |
| Empty state | Title uppercase + hint | "BELUM ADA KELAS. Tambahkan kelas…" |
| Confirmation | Kalimat langsung | "Hapus catatan ini? TIDAK DAPAT DIBATALKAN." |
| Notifikasi sukses | "✓ …" singkat | "✓ TERSIMPAN" |

**Prinsip:**
- Jangan pakai jargon teknis ("Sync failed") — pakai bahasa guru.
- Sentence case untuk body, UPPERCASE untuk label/tombol.
- Maksimum 8 kata per baris tombol.

---

## 14. Component Inventory (Existing vs Planned)

| Komponen | Status | File |
|---|---|---|
| Sidebar (Dock) | ✅ Spec 1 | `src/shared/components/Dock.tsx` |
| PixelButton | ✅ | `src/shared/components/PixelButton.tsx` |
| PixelCard | ✅ | `src/shared/components/PixelCard.tsx` |
| PixelInput | ✅ | `src/shared/components/PixelInput.tsx` |
| PixelModal | ✅ | `src/shared/components/PixelModal.tsx` |
| StatusPill | ✅ | `src/shared/components/StatusPill.tsx` |
| EmptyState | ✅ | `src/shared/components/EmptyState.tsx` |
| ConfirmDialog | ✅ | `src/shared/components/ConfirmDialog.tsx` |
| Icon set (5) | ✅ | `src/shared/components/icons.tsx` |
| SplitWorkspace (Spec 2) | 🔜 | — |
| CalendarHeatmap (Spec 2) | 🔜 | — |
| QuestionEditor (Spec 3) | 🔜 | — |
| WhiteboardCanvas (Spec 3) | 🔜 | — |
| BrowserView (Spec 3) | 🔜 | — |
| AIPromptPanel (Spec 4) | 🔜 | — |

---

## 15. Design Tokens Reference (Code)

File: `src/shared/styles/tokens.css`

```css
:root {
  --bg: #050505;
  --fg: #ffffff;
  --gray-950: #0a0a0a;
  --gray-700: #404040;
  --gray-500: #737373;
  --gray-300: #d4d4d4;
  --gray-100: #f5f5f5;
  --border: 2px;
  --shadow-offset: 4px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
}
```

File: `tailwind.config.ts` — extend dengan `colors`, `fontFamily`, `boxShadow`.

---

## 16. Contoh End-to-End Flow Visual

### 16.1 Morning Dashboard

```
┌────┬───────────────────────────────────────────┐
│ 8B │  DASHBOARD                    SELASA...   │
│    │  [ONLINE] DEMO TEACHER                    │
│ ▣H │  ┌──────────────────────────────────────┐  │
│ ▢C │  │ NEXT CLASS                          │  │
│ ▢W │  │ MATEMATIKA    [MULAI KBM]           │  │
│ ▢T │  │ XI IPA 1 · 08.00 · R.12             │  │
│ ▢S │  └──────────────────────────────────────┘  │
│    │  JADWAL HARI INI                          │
│    │  08.00  Matematika  XI IPA 1  R.12        │
│    │  09.30  Fisika      XI IPA 2  R.07        │
│    │  ...                                      │
│ v1 │  QUICK ACTIONS                            │
│    │  [CLASSROOM] [MATERI·SOON] [QUIZ·SOON]    │
└────┴───────────────────────────────────────────┘
```

### 16.2 ClassHub Overview

```
┌────┬───────────────────────────────────────────┐
│ 8B │  XI IPA 1                       KELAS     │
│    │  [OVERVIEW] [ROSTER] [ATTENDANCE][SOON]   │
│ ▣H │  [NOTES·SOON]                             │
│ ▢C │  RINGKASAN                                │
│ ▢W │  [32 siswa][5 mapel][7 sesi]              │
│ ▢T │  MULAI SESI                               │
│ ▢S │  [MATEMATIKA] [FISIKA] [BIOLOGI]          │
│    │  JADWAL                                   │
│    │  SENIN 07.00-08.30  Matematika  R.12      │
│    │  SELASA ...                               │
└────┴───────────────────────────────────────────┘
```

### 16.3 AttendanceSheet

```
┌────┬───────────────────────────────────────────┐
│ 8B │  ABSENSI                       MATEMATIKA │
│ ▣H │  ┌────┬────┬────┬────┐                    │
│ ▢C │  │ H  │ I  │ S  │ A  │ ← count            │
│ ▢W │  │ 0  │ 0  │ 0  │ 0  │                    │
│ ▢T │  └────┴────┴────┴────┘                    │
│ ▢S │  1. Andi P.    [H][I][S][A]               │
│    │  2. Budi S.    [H][I][S][A]               │
│    │  3. Citra L.   [H][I][S][A]               │
│    │  ...                                      │
│    │  [KEMBALI]                                │
└────┴───────────────────────────────────────────┘
```

---

## 17. Design Decision Log

| # | Keputusan | Alasan |
|---|---|---|
| D-01 | Monokrom `#050505` / `#ffffff` saja | Konsisten dengan identitas "8bit", fokus pada konten |
| D-02 | Pixelify Sans untuk UI, Inter untuk body | Pixel font sulit dibaca panjang; body perlu readability |
| D-03 | Tidak ada rounded corners | Pixel-art aesthetic, tegas |
| D-04 | Border 2px untuk semua permukaan | Konsistensi, mudah di-scan visual |
| D-05 | Sidebar kiri, bukan bottom dock | Lebih cocok untuk tablet landscape (jempol tidak perlu reach ke bawah) |
| D-06 | Status dibedakan label, bukan warna | Aksesibilitas (color-blind safe) |
| D-07 | Reduced motion default | Hormati preferensi OS, lebih hemat baterai |
| D-08 | Bahasa Indonesia untuk UI | Target pengguna guru lokal |
| D-09 | English untuk kode & file | Standar industri, tooling lebih baik |

---

## 18. Acceptance Design Spec 1

- [x] Sidebar kiri dengan 5 slot, HOME + CLASS aktif
- [x] Dashboard: header, status, outbox banner, next class card, schedule list, quick actions
- [x] ClassList: grid 1/2 column, card per kelas
- [x] ClassHub: 4 tab, Overview + Roster aktif
- [x] AttendanceSheet: 4-toggle H/I/S/A per siswa, count cards
- [x] Pixel components: Button, Card, Input, Modal, StatusPill, EmptyState, ConfirmDialog
- [x] Icon set minimal 5 (home, class, work, tools, system)
- [x] Dark mode otomatis, tidak ada light mode (Doc 04)
- [x] OrientationGuard untuk landscape
- [x] Pixel-cut clip-path tersedia

---

## 19. Dokumen Lanjutan

- **Dokumen 01–04** — fondasi produk, workflow, modules, architecture
- **Dokumen 06** — Data Model (`docs/decisions/07-data-model.md`)
- **Dokumen 07** — Spec 1 (`docs/specs/2026-09-03-8bithos-spec-1.md`)

Dokumen 05 ini menutup blueprint UX 8bitOS untuk Spec 1–4. Modul baru (Spec 2+) sebaiknya menambah komponen dengan mengikuti pattern yang sama.
