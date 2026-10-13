import { readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The Chinese fonts are subsets (app/fonts, built by `npm run fonts:hanzi`).
 * A character missing from them would silently render in a system font, so this
 * fails as soon as the source uses a hanzi the subsets were not built with.
 */
const ROOT = join(__dirname, '..');
const SCAN = ['app', 'components', 'content', 'messages', 'lib'];
const TEXT_FILES = new Set(['.ts', '.tsx', '.json', '.css', '.mjs']);
const CJK = /[\u2e80-\u9fff\uf900-\ufaff]/g;

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (TEXT_FILES.has(extname(entry.name))) yield path;
  }
}

describe('hanzi font subsets', () => {
  it('cover every Chinese character used in the source', () => {
    const built = new Set(readFileSync(join(ROOT, 'app/fonts/hanzi.txt'), 'utf8').trim());
    const missing = new Map<string, string>();
    for (const dir of SCAN) {
      for (const file of walk(join(ROOT, dir))) {
        for (const ch of readFileSync(file, 'utf8').match(CJK) ?? []) {
          if (!built.has(ch)) missing.set(ch, file.slice(ROOT.length + 1));
        }
      }
    }
    expect(
      Object.fromEntries(missing),
      'run `npm run fonts:hanzi` to rebuild the subsets with these characters'
    ).toEqual({});
  });
});
