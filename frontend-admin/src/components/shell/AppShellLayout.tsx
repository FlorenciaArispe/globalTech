'use client';
import { ReactNode } from 'react';
import { useDisclosure } from '@chakra-ui/react';
import AppShell from './AppShell';

export default function AppShellLayout({ children }: { children: ReactNode }) {
  const disclosure = useDisclosure();
  return <AppShell disclosure={disclosure}>{children}</AppShell>;
}
