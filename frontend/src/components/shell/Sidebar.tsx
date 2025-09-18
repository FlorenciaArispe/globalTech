'use client';

import { Box, VStack, Divider, Spacer, HStack, Text, Button, Collapse } from '@chakra-ui/react';
import { appRoutes } from '@/lib/routes';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import type { AppRoute } from '@/lib/routes';
import NavLink from '../ui/NavLink';

function RouteGroup({
  route,
  onNavigate,
}: {
  route: AppRoute;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isGroup = !!route.children?.length;

  // ¿Algún hijo activo?
  const hasActiveChild = useMemo(
    () => route.children?.some((c) => pathname.startsWith(c.href)) ?? false,
    [pathname, route.children]
  );

  const [open, setOpen] = useState(hasActiveChild);
  useEffect(() => { if (hasActiveChild) setOpen(true); }, [hasActiveChild]);

  if (!isGroup) {
    // Item simple
    return (
      <NavLink
        href={route.href!}
        label={route.label}
        icon={route.icon}
        onClick={onNavigate}
      />
    );
  }

  // Grupo con hijos
  const Icon = route.icon;
  return (
    <Box>
      <Button
        onClick={() => setOpen((v) => !v)}
        variant="ghost"
        w="100%"
        justifyContent="flex-start"
        px={3}
        py={2}
        rounded="lg"
        _hover={{ bg: 'gray.50', _dark: { bg: 'gray.800' } }}
        rightIcon={
          <ChevronDown
            size={16}
            style={{ transform: `rotate(${open ? 180 : 0}deg)`, transition: 'transform .15s' }}
          />
        }
        leftIcon={Icon ? <Icon size={18} /> : undefined}
        fontWeight="semibold"
      >
        {route.label}
      </Button>

      <Collapse in={open} animateOpacity>
        <VStack align="stretch" spacing={0} mt={1} pl={2}>
        {route.children!.map((child) => {
  const Icon = child.icon;
  return (
    <HStack
      key={child.href}
      as={NextLink}
      href={child.href}
      onClick={onNavigate}
      px={3}
      py={2}
      rounded="md"
      _hover={{ bg: 'gray.50', _dark: { bg: 'gray.800' } }}
    >
      {Icon && <Icon size={16} />}
      <Text fontSize="sm">{child.label}</Text>
    </HStack>
  );
})}
        </VStack>
      </Collapse>
    </Box>
  );
}

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Box h="100%" p={3}>
      <VStack align="stretch" spacing={1}>
        {appRoutes.map((r) => (
          <RouteGroup key={r.label} route={r} onNavigate={onNavigate} />
        ))}
        <Spacer />
        <Divider my={2} />
        <HStack
          as={NextLink}
          href="/login"
          onClick={onNavigate}
          px={3}
          py={2}
          rounded="lg"
          _hover={{ bg: 'red.50', _dark: { bg: 'red.900' } }}
        >
          <Text color="red.500" fontWeight="semibold">
            Cerrar sesión
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
}
