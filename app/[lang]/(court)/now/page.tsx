import fs from 'node:fs/promises';
import path from 'node:path';
import { compileMDX } from 'next-mdx-remote/rsc';
import { NowTracker } from '@/components/now/NowTracker';

async function readLatestNow() {
  const dir = path.join(process.cwd(), 'content/now');
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.mdx')).sort().reverse();
  if (files.length === 0) return null;
  const first = files[0];
  if (!first) return null;
  return fs.readFile(path.join(dir, first), 'utf8');
}

export default async function NowPage() {
  const raw = await readLatestNow();
  if (!raw) return <p>Aucune entrée now.</p>;
  const { content } = await compileMDX({ source: raw });
  return (
    <section className="px-6 md:px-16 py-24 max-w-2xl mx-auto prose-like">
      <NowTracker />
      <p className="font-mono text-xs tracking-widest text-court-line uppercase">Drop shot</p>
      <h1 className="font-display italic text-6xl mt-2">Now</h1>
      <div className="mt-10 space-y-6 leading-relaxed">{content}</div>
    </section>
  );
}
