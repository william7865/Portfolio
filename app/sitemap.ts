import type { MetadataRoute } from 'next';
import projects from '@/content/data/projects.json';

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://williamlin.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const langs = ['fr', 'en'];
  const staticPaths = ['', '/projects', '/now', '/skills'];
  const main = langs.flatMap((l) => staticPaths.map((p) => `/${l}${p}`));
  const projectPaths = projects.flatMap((p) =>
    langs.map((l) => `/${l}/projects/${p.slug}`)
  );
  return [...main, ...projectPaths].map((url) => ({
    url: `${BASE}${url}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: url.endsWith('/fr') || url.endsWith('/en') ? 1 : 0.7
  }));
}
