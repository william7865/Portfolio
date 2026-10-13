// Rebuilds the two Chinese fonts as tiny subsets holding only the characters the
// site actually uses. Run `npm run fonts:hanzi` after adding a new hanzi anywhere.
//
// Why: next/font/google ships a CJK family as ~100 unicode-range slices. For the
// few dozen characters used here that meant ~60 KB of render-blocking @font-face
// CSS and ~500 KB of font files. Google Fonts can cut the subset itself (`text=`),
// so no font tooling is needed: we just download what it returns.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SCAN = ['app', 'components', 'content', 'messages', 'lib'];
const TEXT_FILES = new Set(['.ts', '.tsx', '.json', '.css', '.mjs']);
/** Same ranges as lib/hanzi.test.ts, which fails when a character is missing here. */
const CJK = /[\u2e80-\u9fff\uf900-\ufaff]/g;
/** The seal also sets two-letter Latin marks (skills), and a divider dot is set in the brush face. */
const LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789·.';

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (TEXT_FILES.has(extname(entry.name))) yield path;
  }
}

const used = new Set();
for (const dir of SCAN) {
  for await (const file of walk(join(ROOT, dir))) {
    for (const ch of (await readFile(file, 'utf8')).match(CJK) ?? []) used.add(ch);
  }
}
const hanzi = [...used].sort().join('');

async function fetchSubset(family, text, out) {
  const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`;
  // A browser user agent, or Google answers with TTF instead of WOFF2
  const css = await (
    await fetch(url, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
      }
    })
  ).text();
  const src = css.match(/url\((https:[^)]+)\)\s*format\('woff2'\)/)?.[1];
  if (!src) throw new Error(`no woff2 in the answer for ${family}:\n${css}`);
  const font = Buffer.from(await (await fetch(src)).arrayBuffer());
  await writeFile(join(ROOT, 'app/fonts', out), font);
  console.log(`${out}: ${font.length} bytes`);
}

// Ma Shan Zheng is a Simplified Chinese face: it has no glyph for traditional
// forms such as 圖 or 庫, which therefore still render in the fallback font.
await fetchSubset('Ma+Shan+Zheng', hanzi + '·', 'ma-shan-zheng.woff2');
await fetchSubset('Noto+Serif+SC:wght@700', hanzi + LATIN, 'noto-serif-sc-700.woff2');
await writeFile(join(ROOT, 'app/fonts/hanzi.txt'), hanzi + '\n');
console.log(`${hanzi.length} characters: ${hanzi}`);
