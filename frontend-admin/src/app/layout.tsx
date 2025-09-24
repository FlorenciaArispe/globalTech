// src/app/layout.tsx  (Server Component)
import type { Metadata } from 'next';
import AppProviders from './providers'; // tu ReduxProvider + ChakraProvider

export const metadata: Metadata = { title: 'App' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
