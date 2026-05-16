'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useArcade } from '@/components/arcade/ArcadeProvider';
import { Nav } from '@/components/nav/Nav';
import { Footer } from '@/components/nav/Footer';
import { ArcadeToggle } from '@/components/arcade/ArcadeToggle';

export default function ArcadeLayout({ children }: { children: React.ReactNode }) {
  const { unlocked } = useArcade();
  const router = useRouter();

  useEffect(() => {
    if (!unlocked) router.replace('/');
  }, [unlocked, router]);

  if (!unlocked) return null;

  return (
    <>
      <Nav />
      <main id="main" className="relative">
        {children}
      </main>
      <Footer arcadeToggle={<ArcadeToggle />} />
    </>
  );
}
