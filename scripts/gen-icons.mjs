// Generate 8OS app icons (all densities) from inline SVG wordmark.
// Usage: node scripts/gen-icons.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

// Wordmark "8OS" — pixel-ish monospace, phosphor green on dark terminal panel.
const svg = (size) => {
  const s = size;
  const fs1 = Math.round(s * 0.34); // glyph size
  const fw = fs1 * 0.62; // glyph advance (mono)
  const cx = s / 2;
  const startX = cx - (fw * 3) / 2 + fw * 0.5; // center 3 glyphs
  const y = s * 0.52;
  const sw = Math.max(2, Math.round(s * 0.055)); // stroke width
  // pixel segments per glyph on a 5x7 grid
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" fill="#0a0f0a"/>
  <rect x="${sw}" y="${sw}" width="${s - sw * 2}" height="${s - sw * 2}" fill="none" stroke="#2f4a2f" stroke-width="${sw}"/>
  <g fill="none" stroke="#4af626" stroke-width="${sw}" stroke-linecap="square" stroke-linejoin="miter">
    <text x="${cx}" y="${y}" font-family="monospace" font-weight="700" font-size="${fs1}" text-anchor="middle" fill="#4af626" stroke="none">8OS</text>
  </g>
  <rect x="${s * 0.22}" y="${s * 0.68}" width="${s * 0.24}" height="${s * 0.05}" fill="#4af626"/>
</svg>`;
};

const targets = [
  // PWA (public/)
  { dir: 'public', name: 'icon-192.png', size: 192 },
  { dir: 'public', name: 'icon-512.png', size: 512 },
  { dir: 'public', name: 'maskable-512.png', size: 512, pad: true },
  // Android launcher (mipmap-*)
  { dir: 'android/app/src/main/res/mipmap-mdpi', name: 'ic_launcher.png', size: 48 },
  { dir: 'android/app/src/main/res/mipmap-mdpi', name: 'ic_launcher_round.png', size: 48 },
  { dir: 'android/app/src/main/res/mipmap-hdpi', name: 'ic_launcher.png', size: 72 },
  { dir: 'android/app/src/main/res/mipmap-hdpi', name: 'ic_launcher_round.png', size: 72 },
  { dir: 'android/app/src/main/res/mipmap-xhdpi', name: 'ic_launcher.png', size: 96 },
  { dir: 'android/app/src/main/res/mipmap-xhdpi', name: 'ic_launcher_round.png', size: 96 },
  { dir: 'android/app/src/main/res/mipmap-xxhdpi', name: 'ic_launcher.png', size: 144 },
  { dir: 'android/app/src/main/res/mipmap-xxhdpi', name: 'ic_launcher_round.png', size: 144 },
  { dir: 'android/app/src/main/res/mipmap-xxxhdpi', name: 'ic_launcher.png', size: 192 },
  { dir: 'android/app/src/main/res/mipmap-xxxhdpi', name: 'ic_launcher_round.png', size: 192 },
  // Foreground (adaptive) — transparent bg, wordmark only
  { dir: 'android/app/src/main/res/mipmap-xxxhdpi', name: 'ic_launcher_foreground.png', size: 432, transparent: true },
];

for (const t of targets) {
  const outDir = path.join(root, t.dir);
  fs.mkdirSync(outDir, { recursive: true });
  let svgStr = svg(t.size);
  if (t.transparent) {
    // strip background + border for adaptive foreground
    svgStr = svgStr
      .replace(/<rect width="\d+" height="\d+" fill="#0a0f0a"\/>/, '')
      .replace(/<rect x="\d+"[^>]+stroke="#2f4a2f"[^>]+\/>/, '')
      .replace(/<rect x="[^"]+" y="[^"]+" width="[^"]+" height="[^"]+" fill="#4af626"\/>/, '');
  }
  await sharp(Buffer.from(svgStr)).png().toFile(path.join(outDir, t.name));
  console.log('ok', t.dir + '/' + t.name, t.size + 'px');
}
console.log('DONE');
