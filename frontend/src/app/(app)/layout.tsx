// src/app/(app)/layout.tsx  (Server Component)
import { ReactNode } from 'react';
import AppShellLayout from '@/components/shell/AppShellLayout';

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShellLayout>{children}</AppShellLayout>;
}
