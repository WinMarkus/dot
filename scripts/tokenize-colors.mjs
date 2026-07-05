// One-off sweep: replace hardcoded brand colors in src/*.css with theme tokens.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const srcDir = path.resolve(process.cwd(), 'src');

const TRIPLETS = [
  ['142, 255, 135', 'var(--c-life)'],
  ['116, 255, 167', 'var(--c-life-soft)'],
  ['238, 255, 209', 'var(--c-glow)'],
  ['255, 188, 117', 'var(--c-warm)'],
  ['255, 243, 199', 'var(--c-spark)'],
  ['255, 250, 240', 'var(--c-ink)'],
  ['19, 19, 16', 'var(--c-deep)'],
  ['32, 22, 15', 'var(--c-deep-warm)'],
  ['30, 24, 15', 'var(--c-deep-warm)'],
  ['41, 33, 21', 'var(--c-deep-warm)'],
  ['21, 17, 11', 'var(--c-on-warm)'],
];

const HEXES = [
  ['#ffbc75', 'rgb(var(--c-warm))'],
  ['#fffaf0', 'rgb(var(--c-ink))'],
  ['#fff3c7', 'rgb(var(--c-spark))'],
  ['#ffdcae', 'rgb(var(--c-spark))'],
  ['#8eff87', 'rgb(var(--c-life))'],
  ['#20160f', 'rgb(var(--c-deep-warm))'],
  ['#2a1f10', 'rgb(var(--c-on-warm))'],
  ['#15110b', 'rgb(var(--c-on-warm))'],
  ['#151711', 'rgb(var(--bg-a))'],
  ['#0e100e', 'rgb(var(--bg-b))'],
  ['#090b0a', 'rgb(var(--bg-c))'],
];

let totalReplacements = 0;

for (const file of readdirSync(srcDir)) {
  if (!file.endsWith('.css') || file === 'themes.css') continue;
  const filePath = path.join(srcDir, file);
  let content = readFileSync(filePath, 'utf8');
  let fileReplacements = 0;

  for (const [needle, replacement] of TRIPLETS) {
    const next = content.split(needle).join(replacement);
    fileReplacements += (content.length - next.length) === 0 && next === content ? 0 : content.split(needle).length - 1;
    content = next;
  }
  for (const [needle, replacement] of HEXES) {
    fileReplacements += content.split(needle).length - 1;
    content = content.split(needle).join(replacement);
  }

  if (fileReplacements > 0) {
    writeFileSync(filePath, content);
    console.log(`${file}: ${fileReplacements} replacements`);
    totalReplacements += fileReplacements;
  }
}

console.log(`total: ${totalReplacements}`);
