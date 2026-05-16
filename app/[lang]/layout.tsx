import '../globals.css';
import { Bricolage_Grotesque, Fraunces, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/lib/i18n';
import { ShuttleCursor } from '@/components/cursor/ShuttleCursor';
import { ScoreProvider } from '@/components/scoreboard/ScoreProvider';
import { Scoreboard } from '@/components/scoreboard/Scoreboard';
import { ArcadeProvider } from '@/components/arcade/ArcadeProvider';
import { AchievementsProvider } from '@/components/achievements/AchievementsProvider';
import { ToastHost } from '@/components/achievements/ToastHost';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz', 'wdth']
});

const editorial = Fraunces({
  subsets: ['latin'],
  variable: '--font-editorial',
  display: 'swap',
  axes: ['opsz', 'SOFT']
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
      className={`${display.variable} ${editorial.variable} ${mono.variable}`}
    >
      <body className="font-editorial bg-paper text-ink relative">
        <div className="grain-overlay" aria-hidden="true" />
        <NextIntlClientProvider messages={messages}>
          <ScoreProvider>
            <ArcadeProvider>
              <AchievementsProvider>
                <ShuttleCursor />
                <Scoreboard />
                <ToastHost />
                {children}
              </AchievementsProvider>
            </ArcadeProvider>
          </ScoreProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
