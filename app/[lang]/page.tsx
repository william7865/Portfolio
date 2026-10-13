import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/sections/Hero';
import { Works } from '@/components/sections/Works';
import { Skills } from '@/components/sections/Skills';
import { Path } from '@/components/sections/Path';
import { Gate } from '@/components/sections/Gate';
import { Correspondance } from '@/components/sections/Correspondance';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    alternates: {
      canonical: `/${lang}`,
      languages: { fr: '/fr', en: '/en', 'x-default': '/fr' }
    }
  };
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params;
  setRequestLocale(lang);

  return (
    <>
      <Hero />
      <Works />
      <Skills />
      <Path />
      <Gate />
      <Correspondance />
    </>
  );
}
