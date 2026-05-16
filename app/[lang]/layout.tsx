import '../globals.css';
import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/lib/i18n';
import { ShuttleCursor } from '@/components/cursor/ShuttleCursor';
import { ScoreProvider } from '@/components/scoreboard/ScoreProvider';
import { Scoreboard } from '@/components/scoreboard/Scoreboard';

const display = Instrument_Serif({
  weight: '400',
  style: 'italic',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap'
});

const sans = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap'
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const metadata = {
  title: 'William Lin · Match Point',
  description: 'Portfolio · Développeur Full Stack · Disponible en alternance'
};

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
    <html
      lang={lang}
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="font-sans bg-hall-floor text-ink">
        <NextIntlClientProvider messages={messages}>
          <ScoreProvider>
            <ShuttleCursor />
            <Scoreboard />
            {children}
          </ScoreProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
