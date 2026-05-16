import './globals.css';
import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from 'next/font/google';

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

export const metadata = {
  title: 'William Lin · Match Point',
  description: 'Portfolio · Développeur Full Stack · Disponible en alternance'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
