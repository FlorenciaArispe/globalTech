'use client';

import { useEffect, useState } from 'react';
import {
  Box, Container, Text, Table, Thead, Tr, Th, Tbody, Td,
  HStack, Tag, Spinner, Flex, IconButton, Tooltip, Badge, Button,
} from '@chakra-ui/react';
import { Eye, Plus } from 'lucide-react';
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
  modeloNombre: string;
};

type VentaDTO = {
  id: Id;
  fecha: string;
  clienteId: Id | null;
  clienteNombre: string | null;
  subtotal: number;
  descuentoTotal: number | null;
  impuestos: number | null;
  total: number;
  observaciones?: string | null;
  items: VentaItemDTO[];
};

export default function VentasPage() {
  const [rows, setRows] = useState<VentaDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get<VentaDTO[]>('/api/ventas');
        
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
      <Container maxW="container.xl" pt={10} pb={10} px={{ base: 4, md: 6 }}>

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
                  <Th>Ítems</Th>
                  <Th isNumeric>Total</Th>
                  <Th isNumeric>Descuento</Th>
                  <Th textAlign="center">Observación</Th>
                </Tr>
              </Thead>
              <Tbody>
                {rows.map(v => (
                  <Tr key={String(v.id)}>

                    <Td>
                      {new Date(v.fecha).toLocaleDateString('es-AR', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                      })}
                    </Td>
                    <Td>{v.clienteNombre ?? <Tag size="sm">Mostrador</Tag>}</Td>

                    <Td>
                      <Box maxH="96px" overflowY="auto" pr={2}>
                        {v.items.map((it, idx) => {
                          const cant = (it as any).cantidad ?? 1;
                          return (
                            <Text key={String(it.id ?? idx)} fontSize="sm">
                              {cant > 1 ? `${cant}× ` : ''}{it.modeloNombre} - ${it.precioUnitario}
                            </Text>
                          );
                        })}
                      </Box>
                    </Td>
                    <Td isNumeric><Badge colorScheme="blue" fontSize={"14px"} textAlign={"center"} minW={"70px"}>{v.total} USD</Badge></Td>
                    <Td>{v.descuentoTotal} </Td>
                    <Td textAlign="center">
                      <Tooltip
                        label={v.observaciones ? v.observaciones : "Sin observación"}
                        bg="gray.700"
                        color="white"
                        borderRadius="md"
                        p={2}
                        hasArrow
                        placement="left"
                      >
                        <IconButton
                          aria-label="Ver observación"
                          icon={<Eye size={16} />}
                          variant="ghost"
                          colorScheme="gray"
                          size="sm"
                        />
                      </Tooltip>
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