import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function LocaleNotFound() {
  const t = await getTranslations('notFound');

  return (
    <main className="min-h-screen flex items-center justify-center px-6 text-center">
      <div className="max-w-lg">
        <p className="kicker">{t('kicker')}</p>
        <h1 className="display italic font-light text-[clamp(4rem,12vw,7rem)] my-6 leading-none text-[var(--color-ivory)]">
          {t('title')}
        </h1>
        <p className="lede italic opacity-85 mb-10">{t('lede')}</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 border border-[var(--color-gold)]/55 text-[var(--color-ivory)] font-display italic text-lg hover:bg-[var(--color-gold)]/10 transition-colors"
        >
          {t('back')}
        </Link>
      </div>
    </main>
  );
}
