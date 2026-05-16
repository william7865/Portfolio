import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://williamlin.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const langs = ['fr', 'en'];
  const paths = langs.map((l) => `/${l}`);
  return paths.map((url) => ({
    url: `${BASE}${url}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 1
  }));
}
