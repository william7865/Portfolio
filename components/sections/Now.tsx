import { getTranslations } from 'next-intl/server';
import { Seal } from '@/components/motifs/Seal';
import { Reveal } from '@/components/system/Reveal';
import { ParisClock } from '@/components/system/ParisClock';
import { Precept } from '@/components/system/Precept';

type PreceptKey = 'i' | 'ii' | 'iii' | 'iv' | 'v';

const PRECEPTS: { key: PreceptKey; roman: string; han: string }[] = [
  { key: 'i',   roman: 'I',   han: '道' },
  { key: 'ii',  roman: 'II',  han: '心' },
  { key: 'iii', roman: 'III', han: '工' },
  { key: 'iv',  roman: 'IV',  han: '信' },
  { key: 'v',   roman: 'V',   han: '仁' }
];

export async function Now() {
  const t = await getTranslations('now');

  return (
    <section
      aria-labelledby="now-title"
      className="relative py-32 px-6 lg:px-10 overflow-hidden"
    >
      {/* subtle vertical hairlines for atmosphere */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            'repeating-linear-gradient(90deg, rgba(212,175,55,0.035) 0 1px, transparent 1px 90px)'
        }}
      />

      <ParisClock />

      <div className="relative max-w-2xl mx-auto">
        <Reveal>
          <h2
            id="now-title"
            className="display text-5xl md:text-6xl mb-3 text-[var(--color-ivory)]"
          >
            <em>{t('titleEm')}</em> {t('titleRest')}
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="lede italic opacity-70 max-w-md mb-14">{t('subtitle')}</p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="stele">
            <div className="stele-cartouche">
              <span className="han">{t('cartoucheHan')}</span>
              <span className="lat">{t('cartoucheLat')}</span>
            </div>

            <ul className="divide-y divide-[color:rgba(212,175,55,0.18)]">
              {PRECEPTS.map((p, idx) => (
                <Precept
                  key={p.key}
                  roman={p.roman}
                  han={p.han}
                  label={t(`precepts.${p.key}.label`)}
                  text={t(`precepts.${p.key}.text`)}
                  delay={idx * 0.08}
                />
              ))}
            </ul>

            <div className="mt-10 flex items-center justify-center gap-4 pt-6 border-t border-[var(--color-gold)]/20">
              <Seal glyph="記" size={38} rotate={-5} />
              <span className="font-mono text-[0.6rem] tracking-[0.32em] uppercase opacity-60 text-[var(--color-gold)]">
                {t('sealStamp')}
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
