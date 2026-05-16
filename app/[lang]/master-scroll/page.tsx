import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { GoldRoller } from '@/components/motifs/GoldRoller';
import { Seal } from '@/components/motifs/Seal';
import { CalligraphyStroke } from '@/components/motifs/CalligraphyStroke';

export default async function MasterScrollPage({
  params
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const t = await getTranslations('masterScroll');

  return (
    <article className="relative min-h-screen pt-32 pb-24 px-6 lg:px-10">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="kicker mb-3">{t('kicker')}</div>
          <h1 className="display text-5xl md:text-6xl text-[var(--color-ivory)]">
            <em>{t('title')}</em>
          </h1>
          <p className="lede italic opacity-75 max-w-xl mx-auto mt-4">{t('lede')}</p>
        </div>

        <div className="relative flex gap-0 items-stretch">
          <div className="hidden md:block w-6">
            <GoldRoller />
          </div>
          <div
            className="parchment flex-1 p-8 md:p-14 relative"
            style={{ minHeight: '60vh' }}
          >
            <div className="text-center mb-10">
              <div
                className="font-display-hanzi inline-block"
                style={{
                  fontSize: 'clamp(5rem, 14vw, 10rem)',
                  lineHeight: 1,
                  color: 'var(--color-vermillion)'
                }}
              >
                林威廉
              </div>
              <div
                className="font-mono text-xs tracking-[0.3em] mt-3 uppercase opacity-70"
                style={{ color: 'var(--color-vermillion)' }}
              >
                Lin Weilian
              </div>
            </div>

            <div
              className="font-display italic text-lg md:text-xl leading-relaxed max-w-xl mx-auto space-y-5"
              style={{ color: 'var(--color-vermillion)' }}
            >
              <p>
                — Sur la rive, le pin oublié rappelle qu&apos;on n&apos;a pas besoin d&apos;être
                vu pour tenir bon.
              </p>
              <p>
                Ce rouleau n&apos;est ni un index, ni un manifeste. Juste un repli — pour celles
                et ceux qui regardent assez longtemps. Merci d&apos;être passé par là.
              </p>
              <p className="text-right" style={{ color: 'rgba(74,10,14,0.7)' }}>
                — 王林
              </p>
            </div>

            <div className="mt-12 flex items-center justify-center gap-4">
              <div
                className="flex-1 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(74,10,14,0.4), transparent)' }}
              />
              <CalligraphyStroke
                paths={['M 5 50 Q 30 12, 60 50 T 95 50']}
                viewBox="0 0 100 100"
                strokeWidth={3}
                eager
                width={120}
                height={40}
              />
              <div
                className="flex-1 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(74,10,14,0.4), transparent)' }}
              />
            </div>

            <div className="mt-10 flex justify-center">
              <Seal glyph="王" size={56} rotate={-7} />
            </div>
          </div>
          <div className="hidden md:block w-6">
            <GoldRoller />
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            href={`/${lang}`}
            className="font-display italic text-[var(--color-gold)] hover:text-[var(--color-gold-bright)] transition-colors"
          >
            {t('back')}
          </Link>
        </div>
      </div>
    </article>
  );
}
