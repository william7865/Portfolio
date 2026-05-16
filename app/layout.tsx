import './globals.css';
import { Cormorant_Garamond, Ma_Shan_Zheng, Noto_Serif_SC, Inter_Tight, JetBrains_Mono } from 'next/font/google';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap'
});

const maShan = Ma_Shan_Zheng({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-ma-shan',
  display: 'swap',
  preload: false
});

const notoSerifSc = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-serif-sc',
  display: 'swap',
  preload: false
});

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-inter-tight',
  display: 'swap'
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-jetbrains',
  display: 'swap'
});

export const metadata = {
  title: 'William Lin · 林',
  description: 'Portfolio · Développeur Full Stack',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://williamlin.dev')
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${maShan.variable} ${notoSerifSc.variable} ${interTight.variable} ${jetbrains.variable}`}
    >
      <body className="relative min-h-screen" suppressHydrationWarning>{children}</body>
    </html>
  );
}
