import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="fr">
      <body className="font-editorial bg-paper text-ink">
        <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <p className="font-mono text-xs tracking-widest text-court uppercase">Out</p>
          <h1 className="font-display italic text-7xl mt-4">404.</h1>
          <p className="mt-4 text-lg max-w-md">
            Le volant est tombé hors du court. Pas de point, on revient au service.
          </p>
          <Link
            href="/"
            className="mt-8 px-6 py-3 bg-ink text-paper font-mono text-xs"
          >
            ← Retour au court
          </Link>
        </main>
      </body>
    </html>
  );
}
