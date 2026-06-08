import type { ReactNode } from 'react';

export const metadata = {
  title: 'Dashboard · 觀客',
  robots: { index: false, follow: false }
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
