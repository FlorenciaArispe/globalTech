"use client";

import StickyNotesBoard from '@/components/StickyNotesBoard';
import { InfoOutlineIcon } from '@chakra-ui/icons';
import {
  Box,
  Container,
  HStack,
  Icon,
  SimpleGrid,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Tab,
  TabList,
  Tabs,
  Text,
  Tooltip,
  Spinner,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from '@chakra-ui/react';
import React, { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/axios';

type RangeKey = 'hoy' | 'ayer' | 'semana' | 'mes';
type ProductosKey = 'sin_stock' | 'bajo_stock' | 'mas_vendido';

type VentasStats = {
  total: number;
  iphones: number;
  otros: number;
};

type ProductoStats = {
  modelosSinStockCount: number;
  modelosStockBajoCount: number;
  modelosSinStock: { id: number; nombre: string; stockTotal: number }[];
  modelosStockBajo: { id: number; nombre: string; stockTotal: number }[];
  topModelosMasVendidos: { modeloId: number; nombre: string; unidadesVendidas: number }[];
};

export default function Home() {
  const [range, setRange] = useState<RangeKey>('hoy');
  const [rangeProductos, setRangeProductos] = useState<ProductosKey>('sin_stock');
  const [stats, setStats] = useState<VentasStats>({ total: 0, iphones: 0, otros: 0 });
  const [loadingVentas, setLoadingVentas] = useState(false);
  const [productoStats, setProductoStats] = useState<ProductoStats | null>(null);
  const [loadingProductos, setLoadingProductos] = useState(false);

  const tabs: { label: string; key: RangeKey }[] = [
    { label: 'Hoy', key: 'hoy' },
    { label: 'Ayer', key: 'ayer' },
    { label: 'Esta semana', key: 'semana' },
    { label: 'Último mes', key: 'mes' },
  ];

  const tabsProductos: { label: string; key: ProductosKey }[] = [
    { label: 'Modelos sin stock', key: 'sin_stock' },
    { label: 'Modelos con stock bajo', key: 'bajo_stock' },
    { label: 'Top 5 más vendidos', key: 'mas_vendido' },
  ];

  const tabIndex = tabs.findIndex(t => t.key === range);
  const tabProductosIndex = tabsProductos.findIndex(t => t.key === rangeProductos);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingVentas(true);
        const res = await api.get<VentasStats>('/api/ventas/stats', {
          params: { range },
        });

        setStats(res.data);
      } catch (e) {
        console.error('Error cargando stats ventas', e);
        setStats({ total: 0, iphones: 0, otros: 0 });
      } finally {
        setLoadingVentas(false);
      }
    };

    fetchStats();
  }, [range]);

  useEffect(() => {
    const fetchProductoStats = async () => {
      try {
        setLoadingProductos(true);
        const res = await api.get<ProductoStats>('/api/productos/stats');
        setProductoStats(res.data);
      } catch (e) {
        console.error('Error cargando stats productos', e);
        setProductoStats(null);
      } finally {
        setLoadingProductos(false);
      }
    };

    fetchProductoStats();
  }, []);

  const rangeLabel = useMemo(() => {
    switch (range) {
      case 'hoy': return 'hoy';
      case 'ayer': return 'ayer';
      case 'semana': return 'esta semana';
      case 'mes': return 'el último mes';
    }
  }, [range]);

  return (
    <Box bg="#f6f6f6" minH="100dvh">
      <Container maxW="container.xl" pt={10} pb={10} px={{ base: 4, md: 6 }}>
        <Text fontSize="30px" fontWeight={600} mb={4}>Inicio</Text>

        <Text fontSize="20px" fontWeight={600} mt={4}>Productos</Text>

        <Tabs
          index={tabProductosIndex}
          onChange={(i) => setRangeProductos(tabsProductos[i].key)}
          variant="line"
          colorScheme="blue"
        >
          <TabList>
            {tabsProductos.map(t => (
              <Tab key={t.key} whiteSpace="nowrap">{t.label}</Tab>
            ))}
          </TabList>
        </Tabs>

        <Box mt={4}>
          {rangeProductos === 'sin_stock' && (
            <>

              <Box bg="white" borderWidth="1px" borderRadius="md" p={4} overflowX="auto">

                {loadingProductos ? (
                  <HStack spacing={2}>
                    <Spinner size="sm" />
                    <Text fontSize="sm" color="gray.600">Cargando modelos...</Text>
                  </HStack>
                ) : !productoStats || productoStats.modelosSinStock.length === 0 ? (
                  <Text fontSize="sm" color="gray.500">
                    No hay modelos sin stock.
                  </Text>
                ) : (
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Modelo</Th>
                        <Th isNumeric>Stock</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {productoStats.modelosSinStock.map(m => (
                        <Tr key={m.id}>
                          <Td>{m.nombre}</Td>
                          <Td isNumeric>{m.stockTotal}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </Box>
            </>
          )}

          {rangeProductos === 'bajo_stock' && (
            <>

              <Box bg="white" borderWidth="1px" borderRadius="md" p={4} overflowX="auto">

                {loadingProductos ? (
                  <HStack spacing={2}>
                    <Spinner size="sm" />
                    <Text fontSize="sm" color="gray.600">Cargando modelos...</Text>
                  </HStack>
                ) : !productoStats || productoStats.modelosStockBajo.length === 0 ? (
                  <Text fontSize="sm" color="gray.500">
                    No hay modelos con stock bajo.
                  </Text>
                ) : (
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Modelo</Th>
                        <Th isNumeric>Stock</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {productoStats.modelosStockBajo.map(m => (
                        <Tr key={m.id}>
                          <Td>{m.nombre}</Td>
                          <Td isNumeric>{m.stockTotal}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </Box>
            </>
          )}

          {rangeProductos === 'mas_vendido' && (
            <Box mt={2}>

              {loadingProductos ? (
                <HStack spacing={2}>
                  <Spinner size="sm" />
                  <Text fontSize="sm" color="gray.600">Cargando productos...</Text>
                </HStack>
              ) : !productoStats || productoStats.topModelosMasVendidos.length === 0 ? (
                <Text fontSize="sm" color="gray.500">
                  No hay ventas de modelos en este período.
                </Text>
              ) : (
                <Box bg="white" borderWidth="1px" borderRadius="md" p={4} overflowX="auto">
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>#</Th>
                        <Th>Modelo</Th>
                        <Th isNumeric>Unidades vendidas</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {productoStats.topModelosMasVendidos.map((m, idx) => (
                        <Tr key={m.modeloId}>
                          <Td>{idx + 1}</Td>
                          <Td>{m.nombre}</Td>
                          <Td isNumeric>{m.unidadesVendidas}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </Box>
          )}
        </Box>

        <Text fontSize="20px" fontWeight={600} mt={10}>Ventas</Text>
        <Tabs
          index={tabIndex}
          onChange={(i) => setRange(tabs[i].key)}
          variant="line"
          colorScheme="blue"
        >
          <TabList>
            {tabs.map(t => (
              <Tab key={t.key} whiteSpace="nowrap">{t.label}</Tab>
            ))}
          </TabList>
        </Tabs>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={4} mb={6}>
          <MetricCard
            title="Ventas totales"
            value={stats.total}
            loading={loadingVentas}
            help="Cantidad total de equipos vendidos en el período seleccionado."
            suffix={` ${rangeLabel}`}
          />
          <MetricCard
            title="Ventas iPhone"
            value={stats.iphones}
            loading={loadingVentas}
            help="Equipos iPhone vendidos (usados y sellados) en el período."
            suffix={` ${rangeLabel}`}
          />
          <MetricCard
            title="Otros equipos"
            value={stats.otros}
            loading={loadingVentas}
            help="Equipos de las demás categorías vendidos en el período."
            suffix={` ${rangeLabel}`}
          />
        </SimpleGrid>

        <Box mt={8}>
          <StickyNotesBoard />
        </Box>
      </Container>
    </Box>
  );
}

function MetricCard({
  title,
  value,
  help,
  suffix,
  loading,
}: {
  title: string;
  value: number | string;
  help?: string;
  suffix?: string;
  loading?: boolean;
}) {
  return (
    <Box bg="white" borderWidth="1px" borderRadius="md" p={4}>
      <Stat>
        <HStack spacing={2} mb={2}>
          <StatLabel fontWeight={600}>{title}</StatLabel>
          {help && (
            <Tooltip label={help} hasArrow>
              <span>
                <Icon as={InfoOutlineIcon} boxSize={4} color="gray.400" />
              </span>
            </Tooltip>
          )}
        </HStack>

        <StatNumber lineHeight="1" fontSize="2xl">
          {loading ? <Spinner size="sm" /> : value}
        </StatNumber>

        {suffix && (
          <StatHelpText mt={1}>{suffix}</StatHelpText>
        )}
      </Stat>
    </Box>
  );
}
