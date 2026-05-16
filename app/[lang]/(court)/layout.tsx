import { CourtBackground } from '@/components/court/CourtBackground';
import { Nav } from '@/components/nav/Nav';
import { Footer } from '@/components/nav/Footer';
import { SkipLink } from '@/components/ui/SkipLink';
import { ArcadeToggle } from '@/components/arcade/ArcadeToggle';

export default function CourtLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <CourtBackground />
      <Nav />
      <main id="main" className="relative">
        {children}
      </main>
      <Footer arcadeToggle={<ArcadeToggle />} />
    </>
  );
}
