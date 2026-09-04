// Export helpers (Doc 08 §42): CSV untuk absensi/nilai/hasil —
// digenerate client-side, tanpa dependensi.

const download = (filename: string, mime: string, content: string) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const csvCell = (v: string | number | null | undefined): string => {
  const s = String(v ?? '');
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const exportCsv = (filename: string, rows: Array<Array<string | number>>) => {
  const content = rows.map((r) => r.map(csvCell).join(';')).join('\n');
  download(`${filename}.csv`, 'text/csv;charset=utf-8', `\uFEFF${content}`);
};

// -------- Absensi sesi (SessionReport) --------
export interface AttendanceExportRow {
  no: number;
  name: string;
  nisn: string;
  status: string | null;
}

export const exportAttendanceCsv = (
  className: string,
  sessionDate: string,
  rows: AttendanceExportRow[],
) => {
  const hadir = rows.filter((r) => r.status === 'hadir').length;
  const head = [
    [`ABSENSI ${className}`],
    [`Tanggal: ${sessionDate}`],
    [`Hadir ${hadir}/${rows.length}`],
    [],
  ];
  const table = [['No', 'Nama', 'NISN', 'Status'] as Array<string | number>].concat(
    rows.map((r) => [r.no, r.name, r.nisn, r.status ?? 'BELUM'] as Array<string | number>),
  );
  exportCsv(`absensi-${className}-${sessionDate}`, [...head, ...table] as Array<Array<string | number>>);
};

// -------- Gradebook --------
export const exportGradebookCsv = (
  className: string,
  components: Array<{ name: string; weight: number }>,
  rows: Array<{ name: string; scores: Array<number | null>; final: number | null }>,
) => {
  const head = [
    [`GRADEBOOK ${className}`],
    [],
    ['Siswa', ...components.map((c) => `${c.name} (${c.weight}%)`), 'Nilai Akhir'] as Array<string | number>,
  ];
  const body = rows.map((r) =>
    [r.name, ...r.scores.map((s) => s ?? ''), r.final ?? ''] as Array<string | number>,
  );
  exportCsv(`gradebook-${className}`, [...head, ...body]);
};

// -------- Hasil asesmen --------
export const exportAssessmentResultCsv = (
  title: string,
  rows: Array<{ rank: number; name: string; score: number | null }>,
) => {
  const head = [
    [`HASIL ${title}`],
    [],
    ['Peringkat', 'Nama', 'Skor'] as Array<string | number>,
  ];
  const body = rows.map((r) => [r.rank, r.name, r.score ?? ''] as Array<string | number>);
  exportCsv(`hasil-${title}`, [...head, ...body]);
};
