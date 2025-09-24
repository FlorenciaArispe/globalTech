'use client';

import NextLink from 'next/link';
import {
  Box, Flex, IconButton, Input, InputGroup, InputLeftElement,
  Avatar, Menu, MenuButton, MenuList, MenuItem, HStack, Text, Image
} from '@chakra-ui/react';
import { Search, Menu as MenuIcon } from 'lucide-react';

export default function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <Flex
      as="header"
      position="fixed"
      top="0" left="0" right="0"
      zIndex="docked"
      h="64px" align="center" px={4} gap={4}
      bg="white" borderBottomWidth="1px"
      _dark={{ bg: 'gray.800', borderColor: 'gray.700' }}
    >
      {/* Hamburguesa (izquierda, solo mobile) */}
      <IconButton
        aria-label="Abrir menú"
        icon={<MenuIcon size={18} />}
        display={{ base: 'inline-flex', lg: 'none' }}
        onClick={onOpenMenu}
        variant="ghost"
      />

      {/* Logo + texto (solo desktop, alineado izq) */}
      <HStack
        as={NextLink}
        href="/home"
        spacing={2}
        align="center"
        minW={{ base: 'auto', lg: '240px' }}
        display={{ base: 'none', lg: 'inline-flex' }}
      >
        <Image src="/solo-logo.png" alt="YAMORE" h="50px" w="auto" objectFit="contain" draggable={false} />
        <Text fontSize="14px" fontWeight="semibold">GLOBAL TECHNOLOGY</Text>
      </HStack>

      {/* Logo centrado (solo mobile) */}
      <Box
        display={{ base: 'block', lg: 'none' }}
        position="absolute"
        left="50%"
        top="50%"
        transform="translate(-50%, -50%)"
        pointerEvents="none"        // no bloquea los clics de otros elementos
      >
        <Box as={NextLink} href="/home" pointerEvents="auto">
          <Image src="/solo-logo.png" alt="YAMORE" h="40px" w="auto" objectFit="contain" draggable={false} />
        </Box>
      </Box>

      {/* Buscador (oculto en mobile) */}
      <Box flex="1" maxW="720px" mx="auto" display={{ base: 'none', sm: 'block' }}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Search size={16} />
          </InputLeftElement>
          <Input placeholder="Buscar productos, clientes, ventas..." />
        </InputGroup>
      </Box>

      {/* Usuario (empujado a la derecha) */}
      <Box ml="auto">
        <Menu>
          <MenuButton>
            <Avatar size="sm" name="Usuario" />
          </MenuButton>
          <MenuList>
            <MenuItem as={NextLink} href="/home">Mi perfil</MenuItem>
            <MenuItem as={NextLink} href="/config">Configuración</MenuItem>
            <MenuItem as={NextLink} href="/login">Cerrar sesión</MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </Flex>
  );
}
