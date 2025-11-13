'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { HStack, Icon, Text } from '@chakra-ui/react';
import { ElementType } from 'react';

export default function NavLink({
  href, label, icon: IconCmp, onClick,
}: { href: string; label: string; icon: ElementType; onClick?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + '/');

  return (
    <HStack as={NextLink} href={href} onClick={onClick}
      px={3} py={2} rounded="lg" transition="background 0.2s"
      bg={active ? 'gray.100' : 'transparent'}
      _dark={{ bg: active ? 'gray.700' : 'transparent' }}
      _hover={{ bg: active ? 'gray.200' : 'gray.100', _dark: { bg: active ? 'gray.600' : 'gray.700' } }}>
      <Icon as={IconCmp} boxSize={4} />
      <Text fontWeight={active ? 'bold' : 'normal'}>{label}</Text>
    </HStack>
  );
}
