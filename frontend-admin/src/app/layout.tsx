import type { Metadata } from 'next';
import AppProviders from './providers'; 

export const metadata: Metadata = { title: 'Global Technology' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
