import './globals.css';

export const metadata = {
  title: 'William Lin',
  description: 'Portfolio'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
