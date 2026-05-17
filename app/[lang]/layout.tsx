import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/lib/i18n';
import { SkipLink } from '@/components/system/SkipLink';
import { Header } from '@/components/system/Header';
import { Footer } from '@/components/system/Footer';
import { InkCursor } from '@/components/system/InkCursor';
import { ScrollToTop } from '@/components/system/ScrollToTop';
import { ScrollProgress } from '@/components/system/ScrollProgress';
import { SmoothScroll } from '@/components/system/SmoothScroll';
import { StructuredData } from '@/components/system/StructuredData';
import { SfxProvider } from '@/components/providers/SfxProvider';
import { EasterEggProvider } from '@/components/providers/EasterEggProvider';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!locales.includes(lang as Locale)) notFound();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={lang}>
      <SfxProvider>
        <EasterEggProvider>
          <SkipLink />
          <StructuredData lang={lang} />
          <SmoothScroll />
          <InkCursor />
          <ScrollProgress />
          <Header />
          <main id="main" className="relative">
            {children}
          </main>
          <ScrollToTop />
          <Footer />
        </EasterEggProvider>
      </SfxProvider>
    </NextIntlClientProvider>
  );
}
