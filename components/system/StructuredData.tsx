type Props = { lang: string };

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://williamlin.dev';

export function StructuredData({ lang }: Props) {
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'William Lin',
    alternateName: '林威廉',
    url: `${BASE}/${lang}`,
    jobTitle: 'Full Stack Developer',
    sameAs: [
      'https://github.com/william7865',
      'https://www.linkedin.com/in/william-lin-623165295/'
    ],
    knowsAbout: [
      'Next.js',
      'TypeScript',
      'React',
      'Node.js',
      'PostgreSQL',
      'Vue.js',
      'PHP',
      'Supabase'
    ]
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'William Lin · Portfolio',
    url: `${BASE}/${lang}`,
    inLanguage: lang,
    author: { '@type': 'Person', name: 'William Lin' }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
