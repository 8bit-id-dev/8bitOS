// Generate 8OS app icons (all densities) — monochrome pixel edition v2.
// Usage: node scripts/gen-icons.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

// Wordmark "8OS" — white on #050505 terminal panel, pixel cursor (Doc 05 v2 §14)
const svg = (size) => {
  const s = size;
  const fs1 = Math.round(s * 0.34);
  const cx = s / 2;
  const y = s * 0.52;
  const sw = Math.max(2, Math.round(s * 0.045));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" fill="#050505"/>
  <rect x="${sw}" y="${sw}" width="${s - sw * 2}" height="${s - sw * 2}" fill="none" stroke="#333333" stroke-width="${sw}"/>
  <text x="${cx}" y="${y}" font-family="monospace" font-weight="700" font-size="${fs1}" text-anchor="middle" fill="#ffffff">8OS</text>
  <rect x="${s * 0.22}" y="${s * 0.68}" width="${s * 0.22}" height="${s * 0.05}" fill="#ffffff"/>
</svg>`;
};

const targets = [
  { dir: 'public', name: 'icon-192.png', size: 192 },
  { dir: 'public', name: 'icon-512.png', size: 512 },
  { dir: 'public', name: 'maskable-512.png', size: 512 },
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
  { dir: 'android/app/src/main/res/mipmap-xxxhdpi', name: 'ic_launcher_foreground.png', size: 432, transparent: true },
];

for (const t of targets) {
  const outDir = path.join(root, t.dir);
  fs.mkdirSync(outDir, { recursive: true });
  let svgStr = svg(t.size);
  if (t.transparent) {
    svgStr = svgStr
      .replace(/<rect width="\d+" height="\d+" fill="#050505"\/>/, '')
      .replace(/<rect x="\d+"[^>]+stroke="#333333"[^>]+\/>/, '')
      .replace(/<rect x="[^"]+" y="[^"]+" width="[^"]+" height="[^"]+" fill="#ffffff"\/>/, '');
  }
  await sharp(Buffer.from(svgStr)).png().toFile(path.join(outDir, t.name));
}
console.log('DONE', targets.length, 'icons (monochrome)');
