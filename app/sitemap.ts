import type { MetadataRoute } from 'next';
import { SITE_URL as BASE } from '@/lib/site';

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
