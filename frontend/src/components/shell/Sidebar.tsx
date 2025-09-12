'use client';

import { Box, VStack, Divider, Spacer, HStack, Text } from '@chakra-ui/react';
import { appRoutes } from '@/lib/routes';
import NavLink from '@/components/ui/NavLink';
import NextLink from 'next/link';

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Box h="100%" p={3}>
      <VStack align="stretch" spacing={1}>
        {appRoutes.map(r => (
          <NavLink key={r.href} href={r.href} label={r.label} icon={r.icon} onClick={onNavigate} />
        ))}
        <Spacer />
        <Divider my={2} />
        <HStack as={NextLink} href="/login" onClick={onNavigate}
          px={3} py={2} rounded="lg" _hover={{ bg: 'red.50', _dark: { bg: 'red.900' }}}>
          <Text color="red.500" fontWeight="semibold">Cerrar sesión</Text>
        </HStack>
      </VStack>
    </Box>
  );
}
