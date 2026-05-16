import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      style={{
        background:
          'radial-gradient(70% 50% at 50% 0%, #6a0c12 0%, transparent 60%), #4a0a0e',
        color: '#fef3c7',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 1.5rem',
        textAlign: 'center'
      }}
    >
      <div style={{ maxWidth: 520 }}>
        <p
          style={{
            fontFamily: 'monospace',
            fontSize: 11,
            letterSpacing: '0.32em',
            color: '#d4af37',
            textTransform: 'uppercase'
          }}
        >
          HORS DU ROULEAU
        </p>
        <h1
          style={{
            fontStyle: 'italic',
            fontSize: 'clamp(4rem, 12vw, 7rem)',
            margin: '1.5rem 0 1rem',
            fontWeight: 300
          }}
        >
          404.
        </h1>
        <p style={{ fontSize: '1.05rem', opacity: 0.85, lineHeight: 1.6 }}>
          La page est sortie du rouleau. Revenons au prologue.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            marginTop: '2.5rem',
            padding: '0.75rem 1.5rem',
            border: '1px solid rgba(212,175,55,0.55)',
            color: '#fef3c7',
            fontStyle: 'italic',
            fontSize: '1.1rem',
            textDecoration: 'none'
          }}
        >
          ← Retour au prologue
        </Link>
      </div>
    </main>
  );
}
