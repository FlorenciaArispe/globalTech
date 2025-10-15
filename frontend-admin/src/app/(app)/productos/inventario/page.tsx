'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box, Container, Text, HStack, Table, Thead, Tr, Th, Tbody, Td, Image, Badge,
  Flex, Spinner, IconButton, Tooltip, Button, useToast, AlertDialogOverlay,
  AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
  FormControl, FormLabel, Input, Select, NumberInput, NumberInputField, Tag, SimpleGrid,
  AlertDialog
} from '@chakra-ui/react';
import { Plus, Minus } from 'lucide-react';
import { api } from '@/lib/axios';

type Id = number | string;

type EstadoComercial = 'NUEVO' | 'USADO';
type EstadoStock = 'EN_STOCK' | 'RESERVADO' | 'VENDIDO';

type InventarioRowDTO = {
  // modelo / variante
  modeloId: Id;
  modeloNombre: string;
  varianteId: Id;
  colorNombre?: string | null;
  capacidadEtiqueta?: string | null;

  // unidad (solo si trackea)
  unidadId?: Id | null;
  imei?: string | null;
  bateriaCondicionPct?: number | null;
  estadoProducto?: EstadoComercial | null; // NUEVO/USADO
  estadoStock?: EstadoStock | null;

  // precios
  precioBase?: number | null;      // de variante
  precioOverride?: number | null;  // de unidad usada (opcional)
  precioEfectivo?: number | null;  // override || base

  // stock
  stockAcumulado?: number | null;  // solo untracked

  // control
  trackeaUnidad: boolean;

  createdAt: string;
  updatedAt: string;
};

const PLACEHOLDER_DATAURI =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
      <rect width="100%" height="100%" fill="#EDF2F7"/>
      <g fill="#A0AEC0" font-family="Arial, Helvetica, sans-serif" font-size="10">
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">Sin imagen</text>
      </g>
    </svg>`
  );

const money = (n?: number | null) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
    .format(n ?? 0);
// ej: moneyUSD(1234.56) => "US$ 1.234,56"


const varianteLabel = (r: InventarioRowDTO) => {
  const partes = [r.colorNombre, r.capacidadEtiqueta].filter(Boolean) as string[];
  return partes.length ? partes.join(' - ') : 'Variante';
};

export default function InventarioPage() {
  const toast = useToast();
  const [rows, setRows] = useState<InventarioRowDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal: agregar unidad (para trackeados)
  const [isAddUnidadOpen, setIsAddUnidadOpen] = useState(false);
  const [targetVarianteId, setTargetVarianteId] = useState<Id | null>(null);
  const [formImei, setFormImei] = useState('');
  const [formEstado, setFormEstado] = useState<EstadoComercial>('NUEVO');
  const [formBateria, setFormBateria] = useState<string>(''); // %
  const [formPrecioOverride, setFormPrecioOverride] = useState<string>(''); // opcional
  const [savingUnidad, setSavingUnidad] = useState(false);

  // Modal: movimiento (para NO trackeados)
  const [isMovOpen, setIsMovOpen] = useState(false);
  const [movVarianteId, setMovVarianteId] = useState<Id | null>(null);
  const [movTipo, setMovTipo] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA');
  const [movCantidad, setMovCantidad] = useState<string>('1');
  const [movNotas, setMovNotas] = useState('');
  const [savingMov, setSavingMov] = useState(false);

  // filtros opcionales (si más adelante querés sumar selects de categoría/marca)
  // const [categoriaId, setCategoriaId] = useState<Id | ''>('');
  // const [marcaId, setMarcaId] = useState<Id | ''>('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // podés pasar params ?categoriaId=&marcaId= si querés
        const { data } = await api.get<InventarioRowDTO[]>('/api/inventario');
        if (!alive) return;
        setRows(Array.isArray(data) ? data : []);
      } catch (e: any) {
        toast({
          status: 'error',
          title: 'No se pudo cargar el inventario',
          description: e?.response?.data?.message ?? e?.message,
        });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [toast]);

  // ======== Agregar UNIDAD (tracked) ========

  useEffect(() => {
    if (formEstado === 'NUEVO') setFormPrecioOverride('');
  }, [formEstado]);

  const openAddUnidad = (varianteId: Id) => {
    setTargetVarianteId(varianteId);
    setFormImei('');
    setFormEstado('NUEVO');
    setFormBateria('');
    setFormPrecioOverride('');
    setIsAddUnidadOpen(true);
  };
  const closeAddUnidad = () => setIsAddUnidadOpen(false);

  const parsePrecio = (v: string) => {
    if (!v) return null;
    const normalized = v.replace(/\./g, '').replace(',', '.');
    const n = Number(normalized);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };

  const saveUnidad = async () => {
    if (!targetVarianteId) return;

    if (!formImei.trim()) {
      toast({ status: 'warning', title: 'IMEI requerido' });
      return;
    }
    // batería obligatoria si USADO
    const bateriaNum = formBateria ? Number(formBateria) : null;
    if (formEstado === 'USADO' && (bateriaNum == null || !Number.isFinite(bateriaNum))) {
      toast({ status: 'warning', title: 'Batería requerida (0–100) para usados' });
      return;
    }
    if (bateriaNum != null && (bateriaNum < 0 || bateriaNum > 100)) {
      toast({ status: 'warning', title: 'La batería debe estar entre 0 y 100' });
      return;
    }

    const precioNum = formEstado === 'USADO' ? parsePrecio(formPrecioOverride) : null;
    if (formEstado === 'USADO' && formPrecioOverride && precioNum == null) {
      toast({ status: 'warning', title: 'Precio override inválido' });
      return;
    }

    setSavingUnidad(true);
    try {
      await api.post('/api/unidades', {
        varianteId: Number(targetVarianteId),
        imei: formImei.trim(),
        estadoProducto: formEstado,
        bateriaCondicionPct: formEstado === 'USADO' ? bateriaNum : null,
        precioOverride: (formEstado === 'USADO' && formPrecioOverride) ? precioNum : null,
      });

      toast({ status: 'success', title: 'Unidad agregada' });

      // Refresco rápido: volvé a pedir inventario o actualizá local si querés micro-optimizar.
      const { data } = await api.get<InventarioRowDTO[]>('/api/inventario');
      setRows(Array.isArray(data) ? data : []);

      setIsAddUnidadOpen(false);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 409) {
        toast({ status: 'error', title: 'IMEI duplicado' });
      } else {
        toast({ status: 'error', title: 'No se pudo crear la unidad', description: e?.response?.data?.message ?? e?.message });
      }
    } finally {
      setSavingUnidad(false);
    }
  };

  // ======== Movimiento (untracked) ========

  const openMovimiento = (varianteId: Id, tipo: 'ENTRADA' | 'SALIDA') => {
    setMovVarianteId(varianteId);
    setMovTipo(tipo);
    setMovCantidad('1');
    setMovNotas('');
    setIsMovOpen(true);
  };
  const closeMovimiento = () => setIsMovOpen(false);

  const saveMovimiento = async () => {
    if (!movVarianteId) return;
    const cant = Number(movCantidad);
    if (!Number.isFinite(cant) || cant <= 0) {
      toast({ status: 'warning', title: 'Cantidad inválida' });
      return;
    }

    setSavingMov(true);
    try {
      await api.post('/api/movimientos', {
  varianteId: Number(movVarianteId),
  tipo: movTipo,                 // 'ENTRADA' | 'SALIDA'
  cantidad: Number(movCantidad), // siempre >= 1
  refTipo: 'ajuste',
  notas: movNotas?.trim() || null,
});

      toast({ status: 'success', title: `Movimiento registrado (${movTipo.toLowerCase()})` });

      // Refrescar listado
      const { data } = await api.get<InventarioRowDTO[]>('/api/inventario');
      setRows(Array.isArray(data) ? data : []);

      setIsMovOpen(false);
    } catch (e: any) {
      toast({ status: 'error', title: 'No se pudo registrar el movimiento', description: e?.response?.data?.message ?? e?.message });
    } finally {
      setSavingMov(false);
    }
  };

  // agrupado visual opcional por modelo (se ve más ordenado)
  const grupos = useMemo(() => {
    const map = new Map<string, InventarioRowDTO[]>();
    for (const r of rows) {
      const k = `${r.modeloId}:::${r.modeloNombre}`;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(r);
    }
    return Array.from(map.entries()).map(([k, arr]) => {
      const [, modeloNombre] = k.split(':::');
      return { key: k, modeloNombre, items: arr };
    });
  }, [rows]);

  return (
    <Box bg="#f6f6f6" minH="100dvh">
      <Container maxW="container.lg" pt={10} px={{ base: 4, md: 6 }}>
        <HStack justify="space-between" align="center" mb={4}>
          <Text fontSize="30px" fontWeight={600}>Inventario</Text>
          {/* Botón global opcional: podrías abrir un pequeño menú para elegir acción,
              pero como las acciones dependen de la fila (tracked/untracked),
              dejamos los + dentro de cada fila */}
        </HStack>

        {loading ? (
          <Flex bg="white" borderRadius="md" borderWidth="1px" py={20} align="center" justify="center">
            <Spinner />
          </Flex>
        ) : rows.length === 0 ? (
          <Flex direction="column" gap={3} bg="white" borderRadius="md" borderWidth="1px" p={6} align="center">
            <Text color="gray.600">Aún no hay inventario.</Text>
          </Flex>
        ) : (
          <Box bg="white" borderRadius="md" borderWidth="1px" overflowX="auto">
            <Table size="md" variant="unstyled">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Producto</Th>
                  <Th>Variante</Th>
                  <Th textAlign="center">Detalle</Th>
                  <Th textAlign="right">Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {grupos.map((g, gi) => (
                  <Tr key={g.key} bg={gi % 2 === 0 ? 'white' : 'gray.50'}>
         
                    <Td verticalAlign="top" width="22%">
                      <HStack spacing={3}>
                        <Image
                          src={PLACEHOLDER_DATAURI}
                          alt={g.modeloNombre}
                          boxSize="48px"
                          borderRadius="md"
                          objectFit="cover"
                          border="1px solid"
                          borderColor="gray.200"
                        />
                       
                          <Text fontWeight={600}>{g.modeloNombre}</Text>
                        
                      </HStack>
                    </Td>

                    <Td colSpan={3} columnGap={6} p={0} >
                      <Box py={2} px={1}>
                        {g.items.map((r, idx) => (
                          <Flex key={`${r.varianteId}-${r.unidadId ?? 'v'}`} align="center" py={2} px={3} borderTopWidth={idx === 0 ? '0' : '1px'}>                     
                            <Box flex="1" >
                              {!r.trackeaUnidad ? (
                                <HStack mt={1} spacing={2}>
                            
                                  <Tag size="sm"> { (r.stockAcumulado ?? 0) > 0 ? `${r.stockAcumulado} UNIDADES` : 'Sin stock' }</Tag>
                                
                                </HStack>
                              ) : (
                                <HStack mt={1} spacing={2}>
                                  {r.estadoProducto && (
                                    <Badge colorScheme={r.estadoProducto === 'NUEVO' ? 'green' : 'yellow'}>
                                      {r.estadoProducto}
                                    </Badge>
                                  )}
                                  {r.estadoStock && <Tag size="sm">{r.estadoStock}</Tag>}
                                </HStack>
                              )}
                            </Box>

                            <Box flex="2" >
                              {r.trackeaUnidad ? (
                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={2}>
                                  <Text fontSize="sm"><b>IMEI:</b> {r.imei ?? '-'}</Text>
                                  {r.bateriaCondicionPct != null ? 
                                   <Text fontSize="sm"><b>Batería:</b> {`${r.bateriaCondicionPct}%`}</Text>
                                    : <Text fontSize="sm"><b>Sellado</b></Text>
                                   }
                                 
                                  <Text fontSize="sm">
                                    <b>Precio:</b> {money(r.precioEfectivo)} 
                                  </Text>
                                </SimpleGrid>
                              ) : (
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                                  
                                  <Text fontSize="sm"><b>Precio:</b> {money(r.precioBase)}</Text>
                                 
                                </SimpleGrid>
                              )}
                            </Box>

                            {/* Acciones */}
                            <HStack justify="flex-end" spacing={2} >
                              {r.trackeaUnidad ? (
                                <Tooltip label="Agregar unidad a esta variante">
                                  <IconButton
                                    aria-label="Agregar unidad"
                                    icon={<Plus size={16} />}
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openAddUnidad(r.varianteId)}
                                  />
                                </Tooltip>
                              ) : (
                                <>
                                  <Tooltip label="Registrar entrada">
                                    <IconButton
                                      aria-label="Entrada"
                                      icon={<Plus size={16} />}
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openMovimiento(r.varianteId, 'ENTRADA')}
                                    />
                                  </Tooltip>
                                  <Tooltip label="Registrar salida">
                                    <IconButton
                                      aria-label="Salida"
                                      icon={<Minus size={16} />}
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openMovimiento(r.varianteId, 'SALIDA')}
                                    />
                                  </Tooltip>
                                </>
                              )}
                            </HStack>
                          </Flex>
                        ))}
                      </Box>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Container>

      {/* Modal: Agregar unidad */}
      <AlertDialog isOpen={isAddUnidadOpen} onClose={closeAddUnidad} isCentered>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Agregar unidad</AlertDialogHeader>
          <AlertDialogBody>
            <FormControl isRequired mb={3}>
              <FormLabel>IMEI</FormLabel>
              <Input value={formImei} onChange={e => setFormImei(e.target.value)} placeholder="Ej: 351234567890123" />
            </FormControl>

            <FormControl isRequired mb={3}>
              <FormLabel>Estado del producto</FormLabel>
              <Select value={formEstado} onChange={e => setFormEstado(e.target.value as EstadoComercial)}>
                <option value="NUEVO">NUEVO</option>
                <option value="USADO">USADO</option>
              </Select>
            </FormControl>

            {formEstado === 'USADO' && (
              <FormControl isRequired mb={3}>
                <FormLabel>Batería (condición %)</FormLabel>
                <NumberInput min={0} max={100} value={formBateria} onChange={(v) => setFormBateria(v)}>
                  <NumberInputField placeholder="0 a 100" />
                </NumberInput>
              </FormControl>
            )}

            {formEstado === 'USADO' && (
              <>
                <FormControl mb={1}>
                  <FormLabel>Precio (opcional)</FormLabel>
                  <Input
                    value={formPrecioOverride}
                    onChange={e => setFormPrecioOverride(e.target.value)}
                    placeholder="Ej: 499999.99"
                    inputMode="decimal"
                  />
                </FormControl>
                <Text fontSize="xs" color="gray.500">
                  Si lo dejás vacío, se usa el precio base de la variante.
                </Text>
              </>
            )}
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button onClick={closeAddUnidad}>Cancelar</Button>
            <Button colorScheme="blue" ml={3} onClick={saveUnidad} isLoading={savingUnidad}>
              Guardar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal: Movimiento (entrada/salida) */}
      <AlertDialog isOpen={isMovOpen} onClose={closeMovimiento} isCentered>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Movimiento de inventario</AlertDialogHeader>
          <AlertDialogBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              <FormControl isRequired>
                <FormLabel>Tipo</FormLabel>
                <Select value={movTipo} onChange={e => setMovTipo(e.target.value as 'ENTRADA' | 'SALIDA')}>
                  <option value="ENTRADA">ENTRADA (+)</option>
                  <option value="SALIDA">SALIDA (-)</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Cantidad</FormLabel>
                <NumberInput min={1} value={movCantidad} onChange={(v) => setMovCantidad(v)}>
                  <NumberInputField placeholder="1" />
                </NumberInput>
              </FormControl>
            </SimpleGrid>
            <FormControl mt={3}>
              <FormLabel>Notas (opcional)</FormLabel>
              <Input value={movNotas} onChange={e => setMovNotas(e.target.value)} placeholder="Ej: ajuste inicial" />
            </FormControl>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button onClick={closeMovimiento}>Cancelar</Button>
            <Button colorScheme="blue" ml={3} onClick={saveMovimiento} isLoading={savingMov}>
              Guardar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </Box>
  );
}
