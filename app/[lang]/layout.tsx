import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/lib/i18n';
import { SkipLink } from '@/components/system/SkipLink';
import { AnalyticsBeacon } from '@/components/system/AnalyticsBeacon';
import { Header } from '@/components/system/Header';
import { HtmlLang } from '@/components/system/HtmlLang';
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

export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!locales.includes(lang as Locale)) return {};
  const t = await getTranslations({ locale: lang, namespace: 'meta' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `/${lang}`,
      siteName: 'William Lin',
      locale: lang === 'fr' ? 'fr_FR' : 'en_US',
      type: 'website'
    }
  };
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
  // Without this next-intl reads the locale from request headers, which makes
  // every page render on demand instead of being prerendered and cached.
  setRequestLocale(lang);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={lang}>
      {/* The root layout cannot know the locale; set <html lang> before anything reads it */}
      <script
        dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(lang)}` }}
      />
      <HtmlLang lang={lang} />
      <SfxProvider>
        <EasterEggProvider>
          <SkipLink />
          <AnalyticsBeacon lang={lang} />
          <StructuredData lang={lang} />
          <SmoothScroll />
          <InkCursor />
          <ScrollProgress />
          <Header />
          <main id="main" className="relative site-ground">
            {children}
          </main>
          <ScrollToTop />
          <Footer />
        </EasterEggProvider>
      </SfxProvider>
    </NextIntlClientProvider>
  );
}
