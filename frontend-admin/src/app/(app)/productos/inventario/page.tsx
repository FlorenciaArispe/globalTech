'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box, Container, Text, HStack, Table, Thead, Tr, Th, Tbody, Td, Image, Badge,
  Flex, Spinner, IconButton, Tooltip, Button, useToast, AlertDialogOverlay,
  AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
  FormControl, FormLabel, Input, Select, NumberInput, NumberInputField, Tag, SimpleGrid,
  AlertDialog,
  MenuButton,
  MenuList,
  MenuItem,
  Menu,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  Modal,
  ModalHeader
} from '@chakra-ui/react';
import { Minus, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/axios';

type Id = number | string;
type EstadoComercial = 'NUEVO' | 'USADO';
type EstadoStock = 'EN_STOCK' | 'RESERVADO' | 'VENDIDO';

type InventarioRowDTO = {
  modeloId: Id;
  modeloNombre: string;
  varianteId: Id;
  colorNombre?: string | null;
  capacidadEtiqueta?: string | null;
  unidadId?: Id | null;
  imei?: string | null;
  bateriaCondicionPct?: number | null;
  estadoProducto?: EstadoComercial | null;
  estadoStock?: EstadoStock | null;
  precioBase?: number | null;
  precioOverride?: number | null;
  precioEfectivo?: number | null;
  stockAcumulado?: number | null;
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

export default function InventarioPage() {
  const toast = useToast();
  const [rows, setRows] = useState<InventarioRowDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddUnidadOpen, setIsAddUnidadOpen] = useState(false);
  const [targetVarianteId, setTargetVarianteId] = useState<Id | null>(null);
  const [formImei, setFormImei] = useState('');
  const [formEstado, setFormEstado] = useState<EstadoComercial>('NUEVO');
  const [formBateria, setFormBateria] = useState<string>('');
  const [formPrecioOverride, setFormPrecioOverride] = useState<string>('');
  const [savingUnidad, setSavingUnidad] = useState(false);
  const [isMovOpen, setIsMovOpen] = useState(false);
  const [movVarianteId, setMovVarianteId] = useState<Id | null>(null);
  const [movTipo, setMovTipo] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA');
  const [movCantidad, setMovCantidad] = useState<string>('1');
  const [movNotas, setMovNotas] = useState('');
  const [savingMov, setSavingMov] = useState(false);
  const [isEditUnidadOpen, setIsEditUnidadOpen] = useState(false);
  const [editUnidadId, setEditUnidadId] = useState<Id | null>(null);
  const [editEstado, setEditEstado] = useState<EstadoComercial>('NUEVO');
  const [isDelUnidadOpen, setIsDelUnidadOpen] = useState(false);
  const [delUnidadId, setDelUnidadId] = useState<Id | null>(null);
  const [deletingUnidad, setDeletingUnidad] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<InventarioRowDTO | null>(null);
  const [editImei, setEditImei] = useState('');
  const [editBateria, setEditBateria] = useState<string>('');
  const [editPrecioOverride, setEditPrecioOverride] = useState<string>('');
  const [editPrecioBase, setEditPrecioBase] = useState<string>('');
  const [savingEdit, setSavingEdit] = useState(false);
  const cancelRefAdd = useRef<HTMLButtonElement>(null);
  const cancelRefMov = useRef<HTMLButtonElement>(null);
  const cancelRefEditUnidad = useRef<HTMLButtonElement>(null);
  const cancelRefDelUnidad = useRef<HTMLButtonElement>(null);
  const [isEditVarianteOpen, setIsEditVarianteOpen] = useState(false);
  const [editVarianteId, setEditVarianteId] = useState<Id | null>(null);
  const [editVarPrecioBase, setEditVarPrecioBase] = useState<string>('');

  const openEdit = (r: InventarioRowDTO) => {
    setEditRow(r);
    setEditImei(r.imei ?? '');
    setEditBateria(r.bateriaCondicionPct != null ? String(r.bateriaCondicionPct) : '');
    setEditPrecioOverride(r.precioOverride != null ? String(r.precioOverride) : '');
    setEditPrecioBase(r.precioBase != null ? String(r.precioBase) : '');
    setIsEditOpen(true);
  };
  const closeEdit = () => setIsEditOpen(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
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

  const openEditVariante = (r: InventarioRowDTO) => {
    setEditVarianteId(r.varianteId);
    setEditVarPrecioBase(
      r.precioBase != null ? String(r.precioBase) : ''
    );
    setIsEditVarianteOpen(true);
  };

  const closeEditVariante = () => setIsEditVarianteOpen(false);

  const saveEditVariante = async () => {
    if (!editVarianteId) return;

    const p = parsePrecio(editVarPrecioBase);
    if (p == null) {
      toast({ status: 'warning', title: 'Precio base inválido' });
      return;
    }

    try {
      await api.patch(`/api/variantes/${editVarianteId}/precio-base`, { precioBase: p });

      const { data } = await api.get<InventarioRowDTO[]>('/api/inventario');
      setRows(Array.isArray(data) ? data : []);

      toast({ status: 'success', title: 'Precio base actualizado' });
      setIsEditVarianteOpen(false);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 400 || status === 409) {
        toast({ status: 'error', title: 'No se pudo actualizar', description: e?.response?.data?.message ?? e?.message });
      } else {
        toast({ status: 'error', title: 'Error de red', description: e?.response?.data?.message ?? e?.message });
      }
    }
  };

  const closeEditUnidad = () => setIsEditUnidadOpen(false);

  const saveEdit = async () => {
    if (!editRow || !editRow.unidadId) return;

    if (!editImei.trim()) {
      toast({ status: 'warning', title: 'IMEI requerido' });
      return;
    }

    const unidadPayload: any = { imei: editImei.trim() };

    if (editRow.estadoProducto === 'USADO') {
      const bat = editBateria ? Number(editBateria) : null;
      if (bat == null || !Number.isFinite(bat) || bat < 0 || bat > 100) {
        toast({ status: 'warning', title: 'Batería inválida (0–100)' });
        return;
      }
      unidadPayload.bateriaCondicionPct = bat;

      if (editPrecioOverride) {
        const p = parsePrecio(editPrecioOverride);
        if (p == null) {
          toast({ status: 'warning', title: 'Precio override inválido' });
          return;
        }
        unidadPayload.precioOverride = p;
      } else {
        unidadPayload.precioOverride = null;
      }
    }

    let nuevoPrecioBase: number | null = null;
    if (editRow.estadoProducto === 'NUEVO') {
      const p = parsePrecio(editPrecioBase);
      if (p == null) {
        toast({ status: 'warning', title: 'Precio base inválido' });
        return;
      }
      nuevoPrecioBase = p;
    }

    setSavingEdit(true);
    try {
      await api.put(`/api/unidades/${editRow.unidadId}`, unidadPayload);

      if (editRow.estadoProducto === 'NUEVO' && nuevoPrecioBase != null) {
        await api.patch(`/api/variantes/${editRow.varianteId}/precio-base`, {
          precioBase: nuevoPrecioBase,
        });
      }

      const { data } = await api.get<InventarioRowDTO[]>('/api/inventario');
      setRows(Array.isArray(data) ? data : []);

      toast({ status: 'success', title: 'Cambios guardados' });
      setIsEditOpen(false);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 409) {
        toast({ status: 'error', title: 'Conflicto', description: e?.response?.data?.message ?? e?.message });
      } else if (status === 400) {
        toast({ status: 'error', title: 'Datos inválidos', description: e?.response?.data?.message ?? e?.message });
      } else {
        toast({ status: 'error', title: 'No se pudo guardar', description: e?.response?.data?.message ?? e?.message });
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const saveEditUnidad = async () => {
    if (!editUnidadId) return;

    const bNum = editBateria ? Number(editBateria) : null;
    if (editEstado === 'USADO' && (bNum == null || !Number.isFinite(bNum) || bNum < 0 || bNum > 100)) {
      toast({ status: 'warning', title: 'Batería inválida (0–100) para usados' });
      return;
    }
    const precioNum = editPrecioOverride
      ? Number(editPrecioOverride.replace(/\./g, '').replace(',', '.'))
      : null;
    if (editPrecioOverride && !Number.isFinite(precioNum as number)) {
      toast({ status: 'warning', title: 'Precio override inválido' });
      return;
    }

    setSavingEdit(true);
    try {
      await api.put(`/api/unidades/${editUnidadId}`, {
        estadoProducto: editEstado,
        bateriaCondicionPct: editEstado === 'USADO' ? bNum : null,
        precioOverride: editEstado === 'USADO' ? (precioNum ?? null) : null,
      });
      toast({ status: 'success', title: 'Unidad actualizada' });

      const { data } = await api.get<InventarioRowDTO[]>('/api/inventario');
      setRows(Array.isArray(data) ? data : []);

      setIsEditUnidadOpen(false);
    } catch (e: any) {
      toast({ status: 'error', title: 'No se pudo actualizar', description: e?.response?.data?.message ?? e?.message });
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteVariante = async (varianteId: Id) => {
    const ok = window.confirm('¿Eliminar esta variante y su stock asociado? Esta acción no se puede deshacer.');
    if (!ok) return;

    try {
      await api.delete(`/api/variantes/${varianteId}`);
      toast({ status: 'success', title: 'Variante eliminada' });

      // refresco del inventario
      const { data } = await api.get<InventarioRowDTO[]>('/api/inventario');
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 409) {
        toast({ status: 'error', title: 'No se puede eliminar', description: e?.response?.data?.message ?? e?.message });
      } else {
        toast({ status: 'error', title: 'Error al eliminar', description: e?.response?.data?.message ?? e?.message });
      }
    }
  };

  const openDeleteUnidad = (unidadId: Id) => {
    setDelUnidadId(unidadId);
    setIsDelUnidadOpen(true);
  };
  const closeDeleteUnidad = () => setIsDelUnidadOpen(false);

  const confirmDeleteUnidad = async () => {
    if (!delUnidadId) return;
    setDeletingUnidad(true);
    try {
      await api.delete(`/api/unidades/${delUnidadId}`);
      toast({ status: 'success', title: 'Unidad eliminada' });

      const { data } = await api.get<InventarioRowDTO[]>('/api/inventario');
      setRows(Array.isArray(data) ? data : []);

      setIsDelUnidadOpen(false);
    } catch (e: any) {
      toast({ status: 'error', title: 'No se pudo eliminar', description: e?.response?.data?.message ?? e?.message });
    } finally {
      setDeletingUnidad(false);
    }
  };

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
        tipo: movTipo,
        cantidad: Number(movCantidad),
        refTipo: 'ajuste',
        notas: movNotas?.trim() || null,
      });

      toast({ status: 'success', title: `Movimiento registrado (${movTipo.toLowerCase()})` });

      const { data } = await api.get<InventarioRowDTO[]>('/api/inventario');
      setRows(Array.isArray(data) ? data : []);

      setIsMovOpen(false);
    } catch (e: any) {
      toast({ status: 'error', title: 'No se pudo registrar el movimiento', description: e?.response?.data?.message ?? e?.message });
    } finally {
      setSavingMov(false);
    }
  };

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
                  <Th>Unidad</Th>
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
                                  <Tag size="sm"> {(r.stockAcumulado ?? 0) > 0 ? `${r.stockAcumulado} UNIDADES` : 'Sin stock'}</Tag>
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

                            <HStack justify="flex-end" spacing={2} >
                              <Tooltip label="Agregar unidad">
                                <IconButton
                                  aria-label="Agregar unidad"
                                  icon={<Plus size={16} />}
                                  size="sm"
                                  variant="outline"
                                  onClick={r.trackeaUnidad ? () => openAddUnidad(r.varianteId) : () => openMovimiento(r.varianteId, 'ENTRADA')}
                                />
                              </Tooltip>

                              {!r.trackeaUnidad && (
                                <Tooltip label="Quitar stock (movimiento SALIDA)">
                                  <IconButton
                                    aria-label="Quitar stock"
                                    icon={<Minus size={16} />}
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openMovimiento(r.varianteId, 'SALIDA')}
                                  />
                                </Tooltip>
                              )}

                              <Menu>
                                <MenuButton
                                  as={IconButton}
                                  aria-label="Acciones"
                                  icon={<MoreVertical size={16} />}
                                  size="sm"
                                  variant="outline"
                                />
                                <MenuList>
                                  <MenuItem
                                    icon={<Pencil size={14} />}
                                    onClick={r.trackeaUnidad ? () => openEdit(r) : () => openEditVariante(r)}
                                  >
                                    Editar
                                  </MenuItem>

                                  <MenuItem
                                    icon={<Trash2 size={14} />}
                                    color="red.500"
                                    onClick={r.trackeaUnidad ? () => (r.unidadId && openDeleteUnidad(r.unidadId)) : () => deleteVariante(r.varianteId)}
                                  >
                                    Eliminar
                                  </MenuItem>

                                </MenuList>
                              </Menu>

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

      <AlertDialog isOpen={isAddUnidadOpen} onClose={closeAddUnidad} isCentered leastDestructiveRef={cancelRefAdd}>
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

      <AlertDialog isOpen={isMovOpen} onClose={closeMovimiento} isCentered leastDestructiveRef={cancelRefMov}>
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

      <AlertDialog isOpen={isEditUnidadOpen} onClose={closeEditUnidad} isCentered leastDestructiveRef={cancelRefEditUnidad}>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Editar unidad</AlertDialogHeader>
          <AlertDialogBody>
            <FormControl isRequired mb={3}>
              <FormLabel>Estado del producto</FormLabel>
              <Select value={editEstado} onChange={e => setEditEstado(e.target.value as EstadoComercial)}>
                <option value="NUEVO">NUEVO</option>
                <option value="USADO">USADO</option>
              </Select>
            </FormControl>

            {editEstado === 'USADO' && (
              <FormControl isRequired mb={3}>
                <FormLabel>Batería (condición %)</FormLabel>
                <NumberInput min={0} max={100} value={editBateria} onChange={v => setEditBateria(v)}>
                  <NumberInputField placeholder="0 a 100" />
                </NumberInput>
              </FormControl>
            )}

            {editEstado === 'USADO' && (
              <>
                <FormControl mb={1}>
                  <FormLabel>Precio</FormLabel>
                  <Input
                    value={editPrecioOverride}
                    onChange={e => setEditPrecioOverride(e.target.value)}
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
            <Button onClick={closeEditUnidad}>Cancelar</Button>
            <Button colorScheme="blue" ml={3} onClick={saveEditUnidad} isLoading={savingEdit}>
              Guardar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog isOpen={isDelUnidadOpen} onClose={closeDeleteUnidad} isCentered leastDestructiveRef={cancelRefDelUnidad}>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Eliminar unidad</AlertDialogHeader>
          <AlertDialogBody>
            ¿Seguro que querés eliminar esta unidad? Esta acción no se puede deshacer.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button onClick={closeDeleteUnidad}>Cancelar</Button>
            <Button colorScheme="red" ml={3} onClick={confirmDeleteUnidad} isLoading={deletingUnidad}>
              Eliminar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Modal isOpen={isEditOpen} onClose={closeEdit} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar unidad {editRow?.imei ? `(${editRow.imei})` : ''}</ModalHeader>
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>IMEI</FormLabel>
              <Input value={editImei} onChange={(e) => setEditImei(e.target.value)} />
            </FormControl>

            {editRow?.estadoProducto === 'USADO' && (
              <>
                <FormControl isRequired mb={3}>
                  <FormLabel>Batería (condición %)</FormLabel>
                  <NumberInput min={0} max={100} value={editBateria} onChange={(v) => setEditBateria(v)}>
                    <NumberInputField placeholder="0 a 100" />
                  </NumberInput>
                </FormControl>

                <FormControl mb={1}>
                  <FormLabel>Precio (override, opcional)</FormLabel>
                  <Input
                    value={editPrecioOverride}
                    onChange={(e) => setEditPrecioOverride(e.target.value)}
                    placeholder="Ej: 499999.99"
                    inputMode="decimal"
                  />
                </FormControl>
                <Text fontSize="xs" color="gray.500" mb={2}>
                  Si lo dejás vacío, se usa el precio base de la variante.
                </Text>
              </>
            )}

            {editRow?.estadoProducto === 'NUEVO' && (
              <>
                <FormControl isRequired mb={3}>
                  <FormLabel>Precio base (variante)</FormLabel>
                  <Input
                    value={editPrecioBase}
                    onChange={(e) => setEditPrecioBase(e.target.value)}
                    placeholder="Ej: 999999.99"
                    inputMode="decimal"
                  />
                </FormControl>
                <Text fontSize="xs" color="gray.500">
                  Modificás el precio base de la <b>variante</b> (afecta a todos los nuevos).
                </Text>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeEdit}>Cancelar</Button>
            <Button colorScheme="blue" ml={3} onClick={async () => { await saveEdit(); }} isLoading={savingEdit}>
              Guardar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditVarianteOpen} onClose={closeEditVariante} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar precio base de la variante</ModalHeader>
          <ModalBody>
            <FormControl isRequired mb={3}>
              <FormLabel>Precio base (USD)</FormLabel>
              <Input
                value={editVarPrecioBase}
                onChange={(e) => setEditVarPrecioBase(e.target.value)}
                placeholder="Ej: 999999.99"
                inputMode="decimal"
              />
            </FormControl>
            <Text fontSize="xs" color="gray.500">
              Afecta a todas las unidades <b>NUEVAS</b> de esta variante (los usados pueden tener override).
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeEditVariante}>Cancelar</Button>
            <Button colorScheme="blue" ml={3} onClick={saveEditVariante}>
              Guardar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
}
