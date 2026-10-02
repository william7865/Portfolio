'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ScenePlate } from '@/components/motifs/ScenePlate';
import { useSfxContext } from '@/components/providers/SfxProvider';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(20)
});
type FormData = z.infer<typeof schema>;

type Status = 'idle' | 'sending' | 'success' | 'error';

/** When the seal lifts off the sheet in stamp.mp4, in ms. */
const STAMP_LANDS_MS = 2350;

/**
 * Final act. A sheet of paper on the lacquer desk, filmed from above: the form
 * is written on the sheet, and sending it plays the clip of the stone seal
 * coming over to stamp it.
 */
export function Correspondance() {
  const t = useTranslations('final');
  const reduce = useReducedMotion();
  const { play } = useSfxContext();
  const [status, setStatus] = useState<Status>('idle');
  const successRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (status !== 'success') return;
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      void video.play().catch(() => {});
    }
    // The gong lands with the seal; focus follows once the stamp is on the page
    const gong = setTimeout(() => play('gong', 0.35), reduce ? 0 : STAMP_LANDS_MS);
    const focus = setTimeout(() => successRef.current?.focus(), reduce ? 0 : 400);
    return () => {
      clearTimeout(gong);
      clearTimeout(focus);
    };
  }, [status, reduce, play]);

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
    } catch {
      setStatus('error');
    }
  });

  const sent = status === 'success';

  return (
    <section id="contact" aria-labelledby="final-title" className="relative">
      <div aria-hidden="true" className="contact-lead" />

      <div className="contact-desk">
        <div className="contact-stage">
          {reduce ? (
            <ScenePlate scene={sent ? 'stamp-end' : 'stamp'} />
          ) : (
            <video
              ref={videoRef}
              aria-hidden="true"
              tabIndex={-1}
              poster="/scenes/stamp.jpg"
              muted
              playsInline
              disablePictureInPicture
              preload="auto"
              className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none"
            >
              <source media="(max-width: 767px)" src="/scenes/stamp-sm.mp4" type="video/mp4" />
              <source src="/scenes/stamp.mp4" type="video/mp4" />
            </video>
          )}

          <div className="contact-paper">
            <div className="contact-head">
              <h2 id="final-title">
                {t('title')}
              </h2>
              <AnimatePresence mode="wait" initial={false}>
                {sent ? (
                  <motion.p
                    key="sent"
                    ref={successRef}
                    tabIndex={-1}
                    role="status"
                    aria-live="polite"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="outline-none"
                  >
                    {t('success')}
                  </motion.p>
                ) : (
                  <motion.p
                    key="intro"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="opacity-80"
                  >
                    {t('subtitle')}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence initial={false}>
              {!sent && (
                <motion.form
                  key="form"
                  onSubmit={onSubmit}
                  noValidate
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="contact-form"
                >
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
                    {errors.name && <p className="field-error">{t('validation.name')}</p>}
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
                    {errors.email && <p className="field-error">{t('validation.email')}</p>}
                  </div>

                  <div>
                    <label htmlFor="message">{t('fields.message')}</label>
                    <textarea
                      id="message"
                      rows={4}
                      placeholder={t('fields.messagePlaceholder')}
                      aria-invalid={errors.message ? 'true' : undefined}
                      {...register('message')}
                    />
                    {errors.message && <p className="field-error">{t('validation.message')}</p>}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="contact-send"
                    >
                      {status === 'sending' ? t('sending') : t('send')}
                    </button>
                    {status === 'error' && (
                      <p className="field-error" role="alert" style={{ marginTop: 0 }}>
                        {t('error')}
                      </p>
                    )}
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="contact-foot absolute inset-x-0 bottom-0 h-[7%] pointer-events-none"
        />
      </div>
    </section>
  );
}
