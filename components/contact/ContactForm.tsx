'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useScore } from '@/components/scoreboard/ScoreProvider';

const buildSchema = (msg: { name: string; email: string; message: string }) =>
  z.object({
    name: z.string().min(2, msg.name),
    email: z.string().email(msg.email),
    message: z.string().min(20, msg.message)
  });

type FormData = z.infer<ReturnType<typeof buildSchema>>;

export function ContactForm() {
  const t = useTranslations('matchpoint');
  const { emit } = useScore();
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(
      buildSchema({
        name: t('validation.name'),
        email: t('validation.email'),
        message: t('validation.message')
      })
    )
  });

  const onSubmit = async (data: FormData) => {
    setStatus('sending');
    emit({ type: 'contact_fill' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('failed');
      setStatus('success');
      emit({ type: 'contact_send' });
      const raw = localStorage.getItem('mp.eggs');
      const eggs: string[] = raw ? JSON.parse(raw) : [];
      if (!eggs.includes('form_submitted')) {
        localStorage.setItem('mp.eggs', JSON.stringify([...eggs, 'form_submitted']));
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <p className="font-mono text-sm text-court" role="status">
        {t('success')}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md" noValidate>
      <label className="block">
        <span className="font-mono text-xs text-muted uppercase tracking-widest">{t('name')}</span>
        <input
          {...register('name')}
          type="text"
          autoComplete="name"
          className="w-full mt-1 px-3 py-2 bg-transparent border border-ink/30 focus:border-court outline-none"
        />
        {errors.name && <span className="text-xs text-court">{errors.name.message}</span>}
      </label>
      <label className="block">
        <span className="font-mono text-xs text-muted uppercase tracking-widest">{t('email')}</span>
        <input
          {...register('email')}
          type="email"
          autoComplete="email"
          className="w-full mt-1 px-3 py-2 bg-transparent border border-ink/30 focus:border-court outline-none"
        />
        {errors.email && <span className="text-xs text-court">{errors.email.message}</span>}
      </label>
      <label className="block">
        <span className="font-mono text-xs text-muted uppercase tracking-widest">{t('message')}</span>
        <textarea
          {...register('message')}
          rows={5}
          className="w-full mt-1 px-3 py-2 bg-transparent border border-ink/30 focus:border-court outline-none"
        />
        {errors.message && <span className="text-xs text-court">{errors.message.message}</span>}
      </label>
      <button
        type="submit"
        disabled={status === 'sending'}
        className="px-6 py-3 bg-ink text-paper font-mono text-sm hover:bg-court disabled:opacity-50"
      >
        {status === 'sending' ? t('sending') : t('send')}
      </button>
      {status === 'error' && (
        <p className="text-xs text-court" role="alert">
          {t('error')}
        </p>
      )}
    </form>
  );
}
