import { useTranslations } from 'next-intl';
import { ScoredSection } from '@/components/scoreboard/ScoredSection';
import { ContactForm } from '@/components/contact/ContactForm';

export function MatchPoint() {
  const t = useTranslations('matchpoint');
  return (
    <ScoredSection id="matchpoint" className="px-6 md:px-10 py-32">
      <div className="grid grid-cols-12 gap-6 mb-16">
        <div className="col-span-12 md:col-span-3 label-mono text-court self-end">
          05 — MATCH POINT
        </div>
        <div className="col-span-12 md:col-span-9">
          <h2 className="display-black-condensed text-mega text-ink">
            Let's<br />
            <span className="editorial-italic font-normal">talk<span className="text-court">.</span></span>
          </h2>
        </div>
      </div>

      <div className="rule-double mb-12"></div>

      <div className="grid grid-cols-12 gap-6 md:gap-10">
        <div className="col-span-12 md:col-span-5">
          <p className="editorial-body text-lg md:text-xl leading-[1.55] text-ink-soft">
            {t('lead')}
          </p>
          <div className="mt-10 label-mono text-ink-soft space-y-2">
            <div>linwilliam14@gmail.com</div>
            <div>github.com/william7865</div>
            <div>linkedin.com/in/william-lin-623165295</div>
          </div>
        </div>

        {/* Form rendered as a ticket stub */}
        <div className="col-span-12 md:col-span-7">
          <div className="relative bg-paper border-2 border-ink p-6 md:p-8">
            {/* Stub corner perforations */}
            <div className="absolute -top-2 left-12 right-12 border-t-2 border-dashed border-ink/40"></div>
            <div className="absolute top-2 right-4 label-mono text-ink-soft">N° 00021</div>

            <div className="label-mono text-court mb-6">
              MATCH · POINT · TICKET ↓
            </div>

            <ContactForm />
          </div>
        </div>
      </div>
    </ScoredSection>
  );
}
