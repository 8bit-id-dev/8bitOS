// AI prompt templates per fase guru (RENCANA→PERSIAPAN→ASESMEN→EVALUASI).
// Responses generated client-side via edge function; jobs audit-trailed
// in ai_jobs table.

export type AiKind =
  | 'free'
  | 'modul_ajar'
  | 'tujuan_pembelajaran'
  | 'soal'
  | 'rangkuman'
  | 'refleksi'
  | 'rubrik';

export interface AiTemplate {
  kind: AiKind;
  label: string;
  placeholder: string;
  build: (input: string, context?: string) => string;
}

const withContext = (prompt: string, context?: string): string =>
  context ? `${prompt}\n\nKonteks kelas: ${context}` : prompt;

export const AI_TEMPLATES: AiTemplate[] = [
  {
    kind: 'modul_ajar',
    label: 'MODUL AJAR',
    placeholder: 'mis. integral kelas XI, 2 x 45 menit',
    build: (input, ctx) =>
      withContext(
        `Buatkan kerangka modul ajar untuk materi: ${input}. Format: Tujuan Pembelajaran, Kegiatan Pendahuluan, Inti (eksplorasi-elaborasi-konfirmasi), Penutup, Asesmen, dan Media.`,
        ctx,
      ),
  },
  {
    kind: 'tujuan_pembelajaran',
    label: 'TUJUAN',
    placeholder: 'mis. persamaan kuadrat kelas X',
    build: (input, ctx) =>
      withContext(
        `Tuliskan 3-5 tujuan pembelajaran (format ABCD: Audience, Behaviour, Condition, Degree) untuk: ${input}.`,
        ctx,
      ),
  },
  {
    kind: 'soal',
    label: 'SOAL',
    placeholder: 'mis. 5 soal PG + 2 esai, HOTS, tentang turunan',
    build: (input, ctx) =>
      withContext(
        `Buatkan kumpulan soal dengan spesifikasi: ${input}. Sertakan kunci jawaban dan pembahasan singkat.`,
        ctx,
      ),
  },
  {
    kind: 'rangkuman',
    label: 'RANGKUMAN',
    placeholder: 'mis. materi trigonometri kelas XI',
    build: (input, ctx) =>
      withContext(`Buat rangkuman materi yang mudah dipahami siswa tentang: ${input}.`, ctx),
  },
  {
    kind: 'refleksi',
    label: 'REFLEKSI',
    placeholder: 'mis. sesi integral tadi, banyak siswa bingung substitusi',
    build: (input, ctx) =>
      withContext(
        `Buatkan refleksi pembelajaran hari ini (apa yang berjalan baik, apa yang perlu diperbaiki, tindak lanjut) berdasarkan catatan: ${input}.`,
        ctx,
      ),
  },
  {
    kind: 'rubrik',
    label: 'RUBRIK',
    placeholder: 'mis. rubrik penilaian proyek fisika',
    build: (input, ctx) =>
      withContext(
        `Buatkan rubrik penilaian (kriteria, level 1-4, deskriptor) untuk: ${input}.`,
        ctx,
      ),
  },
];

export const findTemplate = (kind: AiKind): AiTemplate | undefined =>
  AI_TEMPLATES.find((t) => t.kind === kind);

// Client-side fallback generator (works offline / no edge fn).
// Structured, deterministic outline — not a real LLM, but useful scaffolding.
export const localFallbackResponse = (kind: AiKind, prompt: string): string => {
  const p = prompt.trim();
  switch (kind) {
    case 'modul_ajar':
      return [
        `KERANGKA MODUL AJAR — ${p}`,
        '',
        '1. TUJUAN PEMBELAJARAN',
        `   - Siswa mampu menjelaskan konsep ${p}`,
        '   - Siswa mampu menyelesaikan soal terkait',
        '   - Siswa mampu mengaplikasikan dalam konteks nyata',
        '',
        '2. KEGIATAN PENDAHULUAN (10 menit)',
        '   - Apersepsi: tanya jawab pengetahuan prasyarat',
        '   - Motivasi: contoh penerapan dalam kehidupan',
        '',
        '3. KEGIATAN INTI (60 menit)',
        '   - Eksplorasi: siswa mengamati contoh',
        `   - Elaborasi: diskusi kelompok tentang ${p}`,
        '   - Konfirmasi: latihan terbimbing + umpan balik',
        '',
        '4. PENUTUP (15 menit)',
        '   - Simpulan bersama, refleksi singkat',
        '',
        '5. ASESMEN',
        '   - Latihan 5 soal, portofolio singkat',
        '',
        '6. MEDIA',
        '   - Papan tulis, LKPD, proyektor',
      ].join('\n');
    case 'soal':
      return [
        `KISI-KISI & KERANGKA SOAL — ${p}`,
        '',
        'A. PILIHAN GANDA',
        `1. Definisi/konsep dasar dari ${p}`,
        `2. Penerapan langsung ${p} dalam soal hitungan`,
        '3. Soal HOTS: analisis kesalahan',
        '4. Soal HOTS: perbandingan dua kasus',
        '5. Soal konteks nyata',
        '',
        'B. ESAI',
        `6. Jelaskan langkah penyelesaian terkait ${p}`,
        '7. Analisis kesalahan umum siswa',
        '',
        '(Lengkapi kunci & pembahasan sesuai kurikulum)',
      ].join('\n');
    case 'refleksi':
      return [
        'REFLEKSI PEMBELAJARAN',
        '',
        `Catatan sesi: ${p}`,
        '',
        'A. YANG BERJALAN BAIK',
        '   - Materi tersampaikan sesuai alokasi waktu',
        '   - Siswa aktif pada sesi diskusi',
        '',
        'B. YANG PERLU DIPERBAIKI',
        '   - Sebagian siswa butuh penguatan konsep dasar',
        '   - Latihan tambahan diperlukan sebelum lanjut topik berikutnya',
        '',
        'C. TINDAK LANJUT',
        '   - Remedial untuk siswa yang belum tuntas',
        '   - Awali pertemuan berikutnya dengan latihan pendahuluan',
      ].join('\n');
    default:
      return [
        `HASIL — ${p}`,
        '',
        '(Jawaban AI penuh membutuhkan koneksi ke AI gateway. Ini kerangka lokal.)',
        '1. Poin utama terkait permintaan Anda',
        '2. Langkah/penjelasan terstruktur',
        '3. Rekomendasi tindak lanjut',
      ].join('\n');
  }
};

export const KIND_LABEL: Record<AiKind, string> = {
  free: 'BEBAS',
  modul_ajar: 'MODUL AJAR',
  tujuan_pembelajaran: 'TUJUAN',
  soal: 'SOAL',
  rangkuman: 'RANGKUMAN',
  refleksi: 'REFLEKSI',
  rubrik: 'RUBRIK',
};
