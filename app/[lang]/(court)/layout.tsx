import { CourtBackground } from '@/components/court/CourtBackground';

export default function CourtLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CourtBackground />
      <main id="main" className="relative">
        {children}
      </main>
    </>
  );
}
