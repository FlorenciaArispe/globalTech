'use client';

import NextLink from 'next/link';
import { useEffect, useState, useRef } from 'react';
import {
  Box, Container, Text, HStack, IconButton, Table, Thead, Th, Tr, Tbody, Td,
  Image, Badge, Spinner, Button, useToast, AlertDialog, AlertDialogOverlay,
  AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, Flex,
  Tooltip,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField
} from '@chakra-ui/react';
import { Plus, Pencil, Trash2, Minus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';

type Id = number | string;

type VarianteResumenDTO = {
  id: Id;
  colorNombre?: string | null;
  capacidadEtiqueta?: string | null;
  stock: number;   
  stockNuevos?: number | null;  
  stockUsados?: number | null;
  precio?: number | null;
  precioPromo?: number | null;
};


type ModeloTablaDTO = {
  id: Id;
  nombre: string;
  categoriaId: Id;
  categoriaNombre: string;
  trackeaUnidad: boolean;  
  marcaId?: Id;
  marcaNombre?: string;
  variantes: VarianteResumenDTO[];
};

const nombreVariante = (v: VarianteResumenDTO) => {
  const partes = [v.colorNombre, v.capacidadEtiqueta].filter(Boolean) as string[];
  if (partes.length === 0) return 'Variante';
  return partes.join(' - ');
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

type EstadoComercial = 'NUEVO' | 'USADO';

export default function Productos() {
  const toast = useToast();
  const router = useRouter();

  const [rows, setRows] = useState<ModeloTablaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<Id | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [targetVarianteId, setTargetVarianteId] = useState<Id | null>(null);
  const [formImei, setFormImei] = useState('');
  const [formEstado, setFormEstado] = useState<EstadoComercial>('NUEVO');
  const [formBateria, setFormBateria] = useState<string>(''); // %
  const [formPrecioOverride, setFormPrecioOverride] = useState<string>(''); 
  const [savingUnidad, setSavingUnidad] = useState(false);
  const [isAddMovOpen, setIsAddMovOpen] = useState(false);
  const [movVarianteId, setMovVarianteId] = useState<Id | null>(null);
  const [movCantidad, setMovCantidad] = useState<string>(''); 
  const [savingMov, setSavingMov] = useState(false);
  const [movTipo, setMovTipo] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA');
  

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get<ModeloTablaDTO[]>('api/modelos/tabla');

        console.log("TABLA", data)

        const dataVARIANTES  = await api.get<[]>('api/variantes');
        console.log("ACA DATA DE VARIANTES", dataVARIANTES)

        if (!alive) return;
        setRows(Array.isArray(data) ? data : []);
      } catch (e: any) {
        const status = e?.response?.status;
        if (status === 401) {
          router.replace('/login?next=/productos');
          return;
        }
        toast({
          status: 'error',
          title: 'No se pudo cargar la lista',
          description: e?.response?.data?.message ?? e?.message,
        });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [router, toast]);


  const openAddUnidad = (varianteId: Id) => {
    setTargetVarianteId(varianteId);
    setFormImei('');
    setFormEstado('NUEVO');
    setFormBateria('');
    setFormPrecioOverride('');
    setIsAddOpen(true);
  };

  const openAddMovimiento = (varianteId: Id, tipo: 'ENTRADA' | 'SALIDA' = 'ENTRADA') => {
    setMovVarianteId(varianteId);
    setMovCantidad('');
    setMovTipo(tipo);
    setIsAddMovOpen(true);
  };

  const closeAddMovimiento = () => setIsAddMovOpen(false);

  function parsePrecio(v: string): number | null {
    if (!v) return null;
    const normalized = v.replace(/\./g, '').replace(',', '.');
    const n = Number(normalized);
    return Number.isFinite(n) && n >= 0 ? n : null;
  }

  useEffect(() => {
    if (formEstado === 'NUEVO') setFormPrecioOverride('');
  }, [formEstado]);

  const saveMovimiento = async () => {
    if (!movVarianteId) return;

    const n = Number(movCantidad);
    if (!Number.isFinite(n) || n <= 0) {
      toast({ status: 'warning', title: 'Cantidad inválida', description: 'Debe ser un número positivo.' });
      return;
    }
    const current = (() => {
      for (const m of rows) {
        const found = m.variantes.find(v => String(v.id) === String(movVarianteId));
        if (found) return found.stock ?? 0;
      }
      return 0;
    })();

    if (movTipo === 'SALIDA' && n > current) {
      toast({ status: 'warning', title: 'Stock insuficiente', description: `Disponibles: ${current}` });
      return;
    }

    setSavingMov(true);
    try {
      await api.post('/api/movimientos', {
        varianteId: Number(movVarianteId),
        tipo: movTipo,       // 'ENTRADA' | 'SALIDA'
        cantidad: n,         // el backend interpreta el signo por "tipo"
        notas: movTipo === 'ENTRADA' ? 'Alta desde Productos' : 'Baja desde Productos',
      });

      // ✅ actualizar UI local
      setRows(prev => prev.map(m => ({
        ...m,
        variantes: m.variantes.map(v => {
          if (String(v.id) !== String(movVarianteId)) return v;
          const total = v.stock ?? 0;
          const nuevo = movTipo === 'ENTRADA' ? total + n : total - n;
          return { ...v, stock: Math.max(0, nuevo) };
        })
      })));

      toast({ status: 'success', title: `Movimiento registrado (${movTipo.toLowerCase()})` });
      setIsAddMovOpen(false);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 400 || status === 409) {
        toast({ status: 'error', title: 'No se pudo crear el movimiento', description: e?.response?.data?.message ?? e?.message });
      } else {
        toast({ status: 'error', title: 'Error de red', description: e?.response?.data?.message ?? e?.message });
      }
    } finally {
      setSavingMov(false);
    }
  };

  const saveUnidad = async () => {
    if (!targetVarianteId) return;

    if (!formImei.trim()) {
      toast({ status: 'warning', title: 'IMEI requerido' });
      return;
    }

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
      setSavingUnidad(false);
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

      // dentro de saveUnidad(), luego del POST exitoso:
      setRows(prev => prev.map(m => ({
        ...m,
        variantes: m.variantes.map(v => {
          if (String(v.id) !== String(targetVarianteId)) return v;
          const nuevoTotal = (v.stock ?? 0) + 1;

          if (formEstado === 'NUEVO') {
            return {
              ...v,
              stock: nuevoTotal,
              stockNuevos: (v.stockNuevos ?? 0) + 1
            };
          } else {
            return {
              ...v,
              stock: nuevoTotal,
              stockUsados: (v.stockUsados ?? 0) + 1
            };
          }
        })
      })));


      setIsAddOpen(false);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 409) {
        toast({ status: 'error', title: 'IMEI duplicado' });
      } else if (status === 400) {
        toast({ status: 'error', title: 'Datos inválidos', description: e?.response?.data?.message ?? e?.message });
      } else {
        toast({ status: 'error', title: 'No se pudo crear la unidad', description: e?.response?.data?.message ?? e?.message });
      }
    } finally {
      setSavingUnidad(false);
    }
  };

  const closeAddUnidad = () => setIsAddOpen(false);

  const onDelete = async () => {
    if (!deletingId) return;
    try {

      await api.delete(`/modelos/${deletingId}`);

      setRows(prev => prev.filter(r => String(r.id) !== String(deletingId)));
      toast({ status: 'success', title: 'Modelo eliminado' });
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 409) {
        toast({ status: 'error', title: 'No se puede eliminar', description: 'El modelo tiene variantes asociadas.' });
      } else {
        toast({
          status: 'error',
          title: 'No se pudo eliminar',
          description: e?.response?.data?.message ?? e?.message,
        });
      }
    } finally {
      setDeletingId(null);
    }
  };

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

        {loading && (
          <Flex bg="white" borderRadius="md" borderWidth="1px" py={20} align="center" justify="center">
            <Spinner />
          </Flex>
        )}


        {!loading && rows.length === 0 && (
          <Flex direction="column" gap={3} bg="white" borderRadius="md" borderWidth="1px" p={6} align="center">
            <Text color="gray.600">Aún no hay productos.</Text>
            <Button as={NextLink} href="/productos/nuevo" colorScheme="blue" leftIcon={<Plus size={16} />}>
              Crear producto
            </Button>
          </Flex>
        )}


        {!loading && rows.length > 0 && (
          <Box bg="white" borderRadius="md" borderWidth="1px" overflowX="auto">
            <Table size="md" variant="unstyled">

              <Thead bg="gray.50">
                <Tr>
                  <Th>Producto</Th>
                  {/* <Th>Stock</Th> */}
                  <Th>Variante</Th>
                  {/* <Th textAlign="right">Acciones</Th> */}
                </Tr>
              </Thead>
              <Tbody>
                {rows.map((modelo, idx) => {
                  const rowBg = idx % 2 === 0 ? 'white' : 'gray.50';
                  return (
                    <Tr key={String(modelo.id)} bg={rowBg}>
                      <Td>
                        <HStack spacing={3}>
                          <Image
                            src={PLACEHOLDER_DATAURI}
                            alt={modelo.nombre}
                            boxSize="48px"
                            borderRadius="md"
                            objectFit="cover"
                            border="1px solid"
                            borderColor="gray.200"
                          />
                          <Box>
                            <Text fontWeight={600}>{modelo.nombre}</Text>
                            <Text fontSize="sm" color="gray.500">{modelo.categoriaNombre}</Text>
                          </Box>
                        </HStack>
                      </Td>

                      <Td>
                        {(modelo.variantes?.length ?? 0) === 0 && (
                          <Text color="gray.500">Sin variantes</Text>
                        )}

                        {(modelo.variantes ?? []).map((v) => (
                          <HStack key={String(v.id)} spacing={3} mb={2} align="center">
                            <Text flex="1">{nombreVariante(v)}</Text>

                            {modelo.trackeaUnidad ? (
                              <HStack gap={10}>
                               
                                <Badge colorScheme="green" minW="72px" textAlign="center">NUEVOS: {v.stockNuevos ?? 0}</Badge>
                                <Badge colorScheme="yellow" minW="72px" textAlign="center">USADOS: {v.stockUsados ?? 0}</Badge>
                                 <Badge colorScheme="blue" minW="72px" textAlign="center">TOTAL: {v.stock ?? 0}</Badge>

                                <Tooltip label="Agregar unidad">
                                  <IconButton
                                    aria-label="Agregar unidad"
                                    icon={<Plus size={16} />}
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openAddUnidad(v.id)}
                                  />
                                </Tooltip>
                              </HStack>
                            ) : (
                              <HStack gap={10}>
                                <Badge colorScheme="blue" minW="72px" textAlign="center">
                                  TOTAL: {v.stock > 0 ? v.stock : 0}
                                </Badge>

                                <Tooltip label="Agregar">
                                  <IconButton
                                    aria-label="Agregar stock"
                                    icon={<Plus size={16} />}
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openAddMovimiento(v.id, 'ENTRADA')}
                                  />
                                </Tooltip>

                              </HStack>

                            )}

                          </HStack>
                        ))}
                      </Td>

                    </Tr>
                  );
                })}
              </Tbody>


            </Table>
          </Box>
        )}
      </Container>

      <AlertDialog
        isOpen={!!deletingId}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingId(null)}
        isCentered
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Eliminar modelo</AlertDialogHeader>
          <AlertDialogBody>
            ¿Seguro que querés eliminar este modelo? {`(Si tiene variantes, puede fallar)`}.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={() => setDeletingId(null)}>Cancelar</Button>
            <Button colorScheme="red" ml={3} onClick={onDelete}>Eliminar</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog isOpen={isAddOpen} leastDestructiveRef={cancelRef} onClose={closeAddUnidad} isCentered>
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
                  Si lo dejás vacío, se usa el precio base del sellado.
                </Text>
              </>
            )}

          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={closeAddUnidad}>Cancelar</Button>
            <Button colorScheme="blue" ml={3} onClick={saveUnidad} isLoading={savingUnidad}>
              Guardar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog isOpen={isAddMovOpen} leastDestructiveRef={cancelRef} onClose={closeAddMovimiento} isCentered>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>
            {movTipo === 'ENTRADA' ? 'Agregar stock (ENTRADA)' : 'Quitar stock (SALIDA)'}
          </AlertDialogHeader>

          <AlertDialogBody>
            <FormControl isRequired mb={3}>
              <FormLabel>Cantidad
              </FormLabel>
              <NumberInput min={1} value={movCantidad} onChange={(v) => setMovCantidad(v)}>
                <NumberInputField placeholder="Ej: 5" />
              </NumberInput>
            </FormControl>
            <Text fontSize="sm" color="gray.500">
              Esto crea un Movimiento de Inventario de tipo <b>{movTipo}</b> para la variante seleccionada.
            </Text>

          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={closeAddMovimiento}>Cancelar</Button>
            <Button colorScheme="blue" ml={3} onClick={saveMovimiento} isLoading={savingMov}>
              Guardar
            </Button>

          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </Box>
  );
}
