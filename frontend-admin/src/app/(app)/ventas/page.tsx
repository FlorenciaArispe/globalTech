'use client';

import { useEffect, useState } from 'react';
import {
  Box, Container, Text, Table, Thead, Tr, Th, Tbody, Td,
  HStack, Tag, Spinner, Flex, IconButton, Tooltip, Badge, Button
} from '@chakra-ui/react';
import { Plus } from 'lucide-react';
import NextLink from 'next/link';
import { api } from '@/lib/axios';

type Id = number | string;

type VentaItemDTO = {
  id: Id;
  unidadId: Id | null;
  varianteId: Id;
  precioUnitario: number;
  descuentoItem: number | null;
  observaciones?: string | null;
};

type VentaDTO = {
  id: Id;
  fecha: string; // ISO
  clienteId: Id | null;
  clienteNombre: string | null;
  subtotal: number;
  descuentoTotal: number | null;
  impuestos: number | null;
  total: number;
  observaciones?: string | null;
  items: VentaItemDTO[];
};

const money = (n?: number | null) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
    .format(n ?? 0);

export default function VentasPage() {
  const [rows, setRows] = useState<VentaDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get<VentaDTO[]>('/api/ventas'); // <-- necesita GET en backend
        if (!alive) return;
        setRows(Array.isArray(data) ? data : []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <Box bg="#f6f6f6" minH="100dvh">
      <Container maxW="container.lg" pt={10} px={{ base: 4, md: 6 }}>

        <HStack justify="space-between" mb={4}>
          <Text fontSize="30px" fontWeight={600}>Ventas</Text>
          <Tooltip label="Nueva venta">
            <IconButton
              as={NextLink}
              href="/ventas/nueva"
              aria-label="Nueva venta"
              icon={<Plus size={18} />}
              colorScheme="blue"
              size="sm"
            />
          </Tooltip>
        </HStack>

        {loading ? (
          <Flex bg="white" borderRadius="md" borderWidth="1px" py={20} align="center" justify="center">
            <Spinner />
          </Flex>
        ) : rows.length === 0 ? (
          <Flex direction="column" gap={3} bg="white" borderRadius="md" borderWidth="1px" p={6} align="center">
            <Text color="gray.600">Aún no hay ventas.</Text>
            <Button as={NextLink} href="/ventas/nueva" colorScheme="blue" leftIcon={<Plus size={16} />}>
              Crear venta
            </Button>
          </Flex>
        ) : (
          <Box bg="white" borderRadius="md" borderWidth="1px" overflowX="auto">
            <Table size="md" variant="unstyled">
              <Thead bg="gray.50">
                <Tr>
                  <Th width="150px">Fecha</Th>
                  <Th>Cliente</Th>
                  <Th isNumeric>Subtotal</Th>
                  <Th isNumeric>Desc.</Th>
                  <Th isNumeric>Impuestos</Th>
                  <Th isNumeric>Total</Th>
                  <Th>Ítems</Th>
                </Tr>
              </Thead>
              <Tbody>
                {rows.map(v => (
                  <Tr key={String(v.id)}>
                    <Td>{new Date(v.fecha).toLocaleString()}</Td>
                    <Td>{v.clienteNombre ?? <Tag size="sm">Mostrador</Tag>}</Td>
                    <Td isNumeric>{money(v.subtotal)}</Td>
                    <Td isNumeric>{money(v.descuentoTotal)}</Td>
                    <Td isNumeric>{money(v.impuestos)}</Td>
                    <Td isNumeric><Badge colorScheme="blue">{money(v.total)}</Badge></Td>
                    <Td>
                      {v.items.length} {v.items.length === 1 ? 'ítem' : 'ítems'}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Container>
    </Box>
  );
}
