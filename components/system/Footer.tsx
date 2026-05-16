import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-[var(--color-gold)]/20 mt-0 px-6 lg:px-10 py-10 bg-[var(--color-ink-dark)]/40">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 items-start md:items-center justify-between text-[var(--color-ivory)]/70 text-sm">
        <div className="kicker-mono opacity-60">{t('footer.signature')}</div>
        <nav className="flex items-center gap-5 font-ui text-xs tracking-[0.2em] uppercase">
          <a
            href="/CV.pdf"
            className="hover:text-[var(--color-gold-bright)] transition-colors"
          >
            {t('footer.cv')}
          </a>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--color-gold-bright)] transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/"
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
