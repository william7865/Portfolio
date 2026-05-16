'use client';

import { useTranslations } from 'next-intl';
import { Seal } from '@/components/motifs/Seal';
import { useEasterEgg } from '@/components/providers/EasterEggProvider';

export function Footer() {
  const t = useTranslations();
  const { sealClick } = useEasterEgg();
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-[var(--color-gold)]/20 mt-0 px-6 lg:px-10 py-12 bg-[var(--color-ink-dark)]/40">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start md:items-center justify-between text-[var(--color-ivory)]/70 text-sm">
        <div className="flex items-center gap-4">
          <Seal
            glyph="林"
            size={28}
            rotate={-5}
            onClick={sealClick}
            ariaLabel="William Lin signature seal"
          />
          <div className="kicker-mono opacity-60">{t('footer.signature')}</div>
        </div>
        <nav className="flex items-center gap-5 font-ui text-xs tracking-[0.2em] uppercase">
          <a
            href="/CV.pdf"
            className="hover:text-[var(--color-gold-bright)] transition-colors"
          >
            {t('footer.cv')}
          </a>
          <a
            href="https://github.com/william7865"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--color-gold-bright)] transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/william-lin-623165295/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--color-gold-bright)] transition-colors"
          >
            LinkedIn
          </a>
        </nav>
        <div className="font-mono text-xs opacity-50">© {year} · William Lin</div>
      </div>
    </footer>
  );
}
