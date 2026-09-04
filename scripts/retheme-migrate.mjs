// One-shot class migration: retro-terminal -> pixel minimal v2.0
// Maps removed tokens (accent/dim/dimmer/raised/glow) to the new palette.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd(), 'src');

const MAP = [
  // accent â†’ fg (primary emphasis jadi putih)
  [/text-glow/g, ''],
  [/shadow-glow-md/g, ''],
  [/shadow-glow/g, ''],
  [/accent-glow/g, ''],
  [/hover:shadow-glow/g, ''],
  [/hover:border-accent-dim/g, 'hover:border-fg'],
  [/hover:bg-accent\b/g, 'hover:bg-fg'],
  [/hover:text-accent/g, 'hover:text-fg'],
  [/bg-accent\b/g, 'bg-fg'],
  [/text-accent\b/g, 'text-fg'],
  [/border-accent-dim/g, 'border-line-strong'],
  [/border-accent\b/g, 'border-fg'],
  // dim family â†’ gray scale
  [/text-dimmer/g, 'text-gray-500'],
  [/bg-dimmer/g, 'bg-gray-500'],
  [/text-dim\b/g, 'text-gray-300'],
  [/bg-dim\b/g, 'bg-gray-500'],
  [/border-dim\b/g, 'border-line-strong'],
  [/hover:text-dim/g, 'hover:text-gray-300'],
  [/hover:border-dim/g, 'hover:border-line-strong'],
  // raised â†’ surface
  [/bg-bg-raised/g, 'bg-surface'],
  [/hover:bg-grays/g, 'hover:bg-surface'],
  // font-mono (IBM Plex) â†’ font-sans (Inter) for reading; pixel labels use font-pixel
  // Keep font-mono classes but map to sans (reading). Identity handled per-case later.
  [/font-mono/g, 'font-sans'],
  // font sizes: terminal scale â†’ v2 scale
  [/text-micro-label/g, 'micro-pixel'],
  [/label-term/g, 'label-pixel'],
  [/text-micro\b/g, 'micro-pixel'],
  [/text-tiny\b/g, 'text-pixel-xs'],
  [/text-xs\b/g, 'text-pixel-sm'],
  [/text-md\b/g, 'text-body'],
  [/text-lg\b/g, 'text-pixel-xl'],
  [/text-sm\b/g, 'text-small'],
];

const files = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.tsx') || e.name.endsWith('.ts')) files.push(p);
  }
};
walk(ROOT);

let total = 0;
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  const before = c;
  for (const [re, to] of MAP) c = c.replace(re, to);
  if (c !== before) {
    fs.writeFileSync(f, c);
    total++;
    console.log('updated', path.relative(process.cwd(), f));
  }
}
console.log('FILES UPDATED:', total);
