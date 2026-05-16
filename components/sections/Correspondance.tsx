'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { TangFrame } from '@/components/motifs/TangFrame';
import { GoldDust } from '@/components/motifs/GoldDust';
import { useSfxContext } from '@/components/providers/SfxProvider';
import { Reveal } from '@/components/system/Reveal';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(20)
});
type FormData = z.infer<typeof schema>;

type Status = 'idle' | 'sending' | 'success' | 'error';

export function Correspondance() {
  const t = useTranslations('final');
  const { play } = useSfxContext();
  const [status, setStatus] = useState<Status>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: 'onBlur' });

  const onSubmit = handleSubmit(async (values) => {
    setStatus('sending');
    play('tick', 0.35);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values)
      });
      if (!res.ok) throw new Error('send-failed');
      setStatus('success');
      play('gong', 0.35);
    } catch {
      setStatus('error');
    }
  });

  return (
    <section
      aria-labelledby="final-title"
      className="relative pt-24 pb-32 px-6 lg:px-10 overflow-hidden"
      style={{
        background:
          'radial-gradient(120% 70% at 50% 0%, var(--color-vermillion-bright) 0%, var(--color-vermillion) 50%, var(--color-ink-dark) 100%)'
      }}
    >
      <GoldDust count={20} />

      <div className="relative z-10 max-w-3xl mx-auto">
        <Reveal className="text-center mb-12">
          <div className="kicker mb-3">{t('kicker')}</div>
          <h2
            id="final-title"
            className="display text-5xl md:text-7xl text-[var(--color-ivory)] inline-block relative px-12"
          >
            <span
              aria-hidden="true"
              className="font-display-hanzi absolute left-0 top-1/2 -translate-y-1/2 text-3xl text-[var(--color-gold)] opacity-80"
              style={{ textShadow: '0 0 14px rgba(212,175,55,0.6)' }}
            >
              龍
            </span>
            <em>{t('title')}</em>
            <span
              aria-hidden="true"
              className="font-display-hanzi absolute right-0 top-1/2 -translate-y-1/2 text-3xl text-[var(--color-gold)] opacity-80 scale-x-[-1]"
              style={{ textShadow: '0 0 14px rgba(212,175,55,0.6)' }}
            >
              龍
            </span>
          </h2>
          <p className="lede italic opacity-80 max-w-md mx-auto mt-4">{t('subtitle')}</p>
        </Reveal>

        <Reveal delay={0.15}>
          <TangFrame>
          {/* Parchment */}
          <motion.div
            initial={false}
            animate={{
              y: status === 'success' ? 6 : 0,
              rotate: status === 'success' ? -0.4 : 0
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="parchment p-8 md:p-10 mx-auto max-w-xl relative"
          >
            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="seal mx-auto" style={{ width: 96, height: 96, fontSize: 40, transform: 'rotate(-6deg)' }}>
                  收
                </div>
                <p className="font-display italic text-2xl mt-6" style={{ color: 'var(--color-vermillion)' }}>
                  {t('success')}
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-6">
                <div>
                  <label htmlFor="name">{t('fields.name')}</label>
                  <input
                    id="name"
                    type="text"
                    placeholder={t('fields.namePlaceholder')}
                    autoComplete="name"
                    aria-invalid={errors.name ? 'true' : undefined}
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="font-mono text-xs text-[var(--color-cinnabar)] mt-2 tracking-wide">
                      {t('validation.name')}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email">{t('fields.email')}</label>
                  <input
                    id="email"
                    type="email"
                    placeholder={t('fields.emailPlaceholder')}
                    autoComplete="email"
                    aria-invalid={errors.email ? 'true' : undefined}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="font-mono text-xs text-[var(--color-cinnabar)] mt-2 tracking-wide">
                      {t('validation.email')}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="message">{t('fields.message')}</label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder={t('fields.messagePlaceholder')}
                    aria-invalid={errors.message ? 'true' : undefined}
                    {...register('message')}
                  />
                  {errors.message && (
                    <p className="font-mono text-xs text-[var(--color-cinnabar)] mt-2 tracking-wide">
                      {t('validation.message')}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3">
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="relative inline-flex items-center gap-3 font-display italic text-xl px-6 py-3 border border-[var(--color-vermillion)]/50 rounded-sm hover:bg-[var(--color-vermillion)]/5 transition-colors disabled:opacity-60"
                    style={{ color: 'var(--color-vermillion)' }}
                  >
                    <span>{status === 'sending' ? t('sending') : t('send')}</span>
                    <span
                      aria-hidden="true"
                      className="inline-grid place-items-center w-10 h-10 -mr-2 -my-1 rounded-sm"
                      style={{
                        background: 'var(--color-cinnabar)',
                        color: 'var(--color-ivory)',
                        fontFamily: 'var(--font-serif-hanzi)',
                        fontWeight: 700,
                        boxShadow: 'inset 0 0 0 2px var(--color-ivory), 0 0 0 1px var(--color-cinnabar)',
                        transform: 'rotate(-8deg)'
                      }}
                    >
                      封
                    </span>
                  </button>
                  {status === 'error' && (
                    <p className="font-mono text-xs text-[var(--color-cinnabar)] max-w-xs text-right">
                      {t('error')}
                    </p>
                  )}
                </div>
              </form>
            )}
          </motion.div>
        </TangFrame>
        </Reveal>
      </div>
    </section>
  );
}
