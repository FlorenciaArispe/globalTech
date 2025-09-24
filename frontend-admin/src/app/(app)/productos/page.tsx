'use client';

import NextLink from 'next/link';
import { Box, Container, Text, HStack, IconButton } from '@chakra-ui/react';
import { Plus } from 'lucide-react';

export default function Productos() {
  return (
    <Box bg="#f6f6f6" minH="100dvh">
      <Container maxW="container.lg" pt={10} px={{ base: 4, md: 6 }}>
        <HStack justify="space-between" align="center" mb={4}>
          <Text fontSize="30px" fontWeight={600}>Productos</Text>
          <IconButton
            as={NextLink}
            href="/productos/nuevo"
            aria-label="Nuevo producto"
            icon={<Plus size={18} />}
            variant="solid"
            colorScheme="blue"
            size="sm"
          />
        </HStack>

        {/* acá va tu contenido de la lista de productos */}
      </Container>
    </Box>
  );
}
