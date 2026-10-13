import './globals.css';
import { SITE_URL } from '@/lib/site';
import { Cormorant_Garamond, Inter_Tight, JetBrains_Mono } from 'next/font/google';
import localFont from 'next/font/local';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap'
});

// The two Chinese faces are self-hosted subsets holding only the characters the
// site uses (see scripts/subset-hanzi-fonts.mjs): 30 KB instead of the ~500 KB of
// slices and ~60 KB of blocking CSS that next/font/google ships for a CJK family.
const maShan = localFont({
  src: './fonts/ma-shan-zheng.woff2',
  weight: '400',
  variable: '--font-ma-shan',
  display: 'swap',
  preload: false
});

const notoSerifSc = localFont({
  src: './fonts/noto-serif-sc-700.woff2',
  weight: '700',
  variable: '--font-noto-serif-sc',
  display: 'swap',
  preload: false
});

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-inter-tight',
  display: 'swap',
  // Only used for small labels below the first screen
  preload: false
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
  metadataBase: new URL(SITE_URL)
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // `lang` is corrected per locale by the [lang] layout before hydration
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${cormorant.variable} ${maShan.variable} ${notoSerifSc.variable} ${interTight.variable} ${jetbrains.variable}`}
    >
      <body className="relative min-h-screen" suppressHydrationWarning>{children}</body>
    </html>
  );
}
