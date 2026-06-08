'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await fetch('/api/dashboard/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    setLoading(false);
    if (res.ok) router.replace('/dashboard');
    else setError(true);
  }

  return (
    <main className="min-h-screen grid place-items-center px-6">
      <form onSubmit={onSubmit} className="parchment w-full max-w-sm px-8 py-10">
        <p className="kicker mb-6" style={{ color: 'rgba(74,10,14,0.7)' }}>
          ACCÈS · 觀客
        </p>
        <label htmlFor="dash-pw">Mot de passe</label>
        <input
          id="dash-pw"
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p className="mt-3 font-mono text-xs" style={{ color: 'var(--color-cinnabar)' }}>
            Mot de passe incorrect.
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full font-mono text-xs tracking-[0.24em] uppercase py-3 disabled:opacity-50"
          style={{
            background: 'var(--color-vermillion)',
            color: 'var(--color-ivory)',
            border: '1px solid var(--color-gold)'
          }}
        >
          {loading ? '…' : 'Entrer'}
        </button>
      </form>
    </main>
  );
}
