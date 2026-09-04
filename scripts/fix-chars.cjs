// Fix replacement chars from over-decoding with correct glyphs.
const fs = require('fs');
const files = [
  'src/features/ai/AiPanel.tsx',
  'src/features/browser/Browser.tsx',
  'src/features/classroom/ClassHub.tsx',
  'src/features/classroom/ClassList.tsx',
  'src/features/classroom/StudentDetail.tsx',
  'src/features/launcher/LauncherHome.tsx',
  'src/features/palette/CommandPalette.tsx',
];

for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  const before = c;
  c = c
    // ● tersimpan (status indicator)
    .replace(/\uFFFD+\s?tersimpan/g, '\u25cf tersimpan')
    // ○ menyimpan
    .replace(/\uFFFD+\s?menyimpan/g, '\u25cb menyimpan')
    // buka di tab baru ↗
    .replace(/buka di tab baru[\s\uFFFD\u2b60]*/g, 'buka di tab baru \u2197')
    // catat sumber: {url || '—'}
    .replace(/catat sumber: \{url \|\| '[^']*'\}/g, "catat sumber: {url || '\u2014'}")
    // {url || '—'} generic
    .replace(/\{url \|\| '[^']*'\}/g, "{url || '\u2014'}")
    // buka ... di tab baru ↗ (second variant)
    .replace(/di tab baru[\s\uFFFD\u2b60\uFFFD]*$/gm, 'di tab baru \u2197')
    // remaining triple/double → ●
    .replace(/\uFFFD{3}/g, '\u25cf')
    .replace(/\uFFFD{2}/g, '\u25cf')
    .replace(/\uFFFD\u2b60\uFFFD/g, '\u2197')
    .replace(/\uFFFD+/g, '');
  if (c !== before) {
    fs.writeFileSync(f, c);
    console.log('fixed', f);
  }
}
console.log('done');
