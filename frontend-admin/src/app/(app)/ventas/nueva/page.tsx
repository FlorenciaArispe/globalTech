'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box, Container, Text, SimpleGrid, FormControl, FormLabel, Select, Input,
  NumberInput, NumberInputField, Button, HStack, Table, Thead, Tr, Th, Tbody, Td,
  IconButton, useToast, Tag, Badge, Flex, Spinner
} from '@chakra-ui/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';

type Id = number | string;

type InventarioRowDTO = {
  modeloId: Id;
  modeloNombre: string;
  varianteId: Id;
  colorNombre?: string | null;
  capacidadEtiqueta?: string | null;
  unidadId?: Id | null;
  imei?: string | null;
  estadoProducto?: 'NUEVO' | 'USADO' | null;
  estadoStock?: 'EN_STOCK' | 'RESERVADO' | 'VENDIDO' | null;
  precioBase?: number | null;
  precioOverride?: number | null;
  precioEfectivo?: number | null;
  stockAcumulado?: number | null; // para no-trackeados
  trackeaUnidad: boolean;
};

type VentaItemCreate = {
  unidadId?: Id | null;              // para trackeados
  varianteId?: Id | null;            // para no-trackeados (si el back lo soporta)
  cantidad?: number | null;          // para no-trackeados
  precioUnitario: number;
  descuentoItem?: number | null;
  observaciones?: string | null;
};

type VentaCreateDTO = {
  clienteId?: Id | null;
  observaciones?: string | null;
  descuentoTotal?: number | null;
  impuestos?: number | null;
  items: VentaItemCreate[];
};

const money = (n?: number | null) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
    .format(n ?? 0);

export default function NuevaVentaPage() {
  const toast = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [inventario, setInventario] = useState<InventarioRowDTO[]>([]);
  const [clientes, setClientes] = useState<{id: Id; nombre: string}[]>([]);
  const [clienteId, setClienteId] = useState<Id | ''>('');
  const [observaciones, setObservaciones] = useState('');
  const [descuentoTotal, setDescuentoTotal] = useState<string>('');
  const [impuestos, setImpuestos] = useState<string>('');
  const [items, setItems] = useState<VentaItemCreate[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [inv, cls] = await Promise.all([
          api.get<InventarioRowDTO[]>('/api/inventario'),
          api.get<{id: Id; nombre: string}[]>('/api/clientes'), // <-- si no existe, podés omitir y dejar "Mostrador"
        ]);
        if (!alive) return;
        // filtrar solo vendibles
        const vendibles = (inv.data ?? []).filter(r => {
          if (r.trackeaUnidad) return r.estadoStock === 'EN_STOCK';
          return (r.stockAcumulado ?? 0) > 0;
        });
        setInventario(vendibles);
        setClientes(cls.data ?? []);
      } catch (e: any) {
        toast({ status: 'error', title: 'No se pudo cargar datos', description: e?.response?.data?.message ?? e?.message });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [toast]);

  const opcionesTrackeados = useMemo(
    () => inventario.filter(r => r.trackeaUnidad),
    [inventario]
  );
  const opcionesNoTrack = useMemo(
    () => inventario.filter(r => !r.trackeaUnidad),
    [inventario]
  );

  const addItemTrackeado = (unidadId: Id) => {
    const row = opcionesTrackeados.find(r => String(r.unidadId) === String(unidadId));
    if (!row) return;
    const precio = row.precioEfectivo ?? row.precioBase ?? 0;
    // evitar duplicar la misma unidad
    if (items.some(it => String(it.unidadId) === String(unidadId))) {
      toast({ status: 'warning', title: 'La unidad ya está en la venta' });
      return;
    }
    setItems(prev => [...prev, {
      unidadId,
      precioUnitario: precio,
      descuentoItem: 0,
    }]);
  };

  const addItemNoTrack = (varianteId: Id) => {
    const row = opcionesNoTrack.find(r => String(r.varianteId) === String(varianteId));
    if (!row) return;
    const precio = row.precioBase ?? 0;
    // podés permitir múltiples renglones misma variante (diferentes precios/descuentos) o consolidar. Acá dejamos 1:
    if (items.some(it => String(it.varianteId) === String(varianteId))) {
      toast({ status: 'warning', title: 'La variante ya está en la venta' });
      return;
    }
    setItems(prev => [...prev, {
      varianteId,
      cantidad: 1,
      precioUnitario: precio,
      descuentoItem: 0,
    }]);
  };

  const removeItemAt = (idx: number) =>
    setItems(prev => prev.filter((_, i) => i !== idx));

  const parseNum = (v: string) => {
    if (!v) return 0;
    const n = Number(v.replace(/\./g,'').replace(',','.'));
    return Number.isFinite(n) ? n : 0;
  };

  const subtotal = useMemo(() => {
    return items.reduce((acc, it) => {
      const precio = it.precioUnitario ?? 0;
      const desc   = it.descuentoItem ?? 0;
      const cant   = (it.cantidad ?? 1);
      return acc + (precio - desc) * cant;
    }, 0);
  }, [items]);

  const onSubmit = async () => {
    if (items.length === 0) {
      toast({ status: 'warning', title: 'Agregá al menos un ítem' });
      return;
    }

    // BACKEND: si hoy solo acepta unidadId, rechazará los ítems sin unidad.
    // Si implementás la variante con cantidad, esto funciona para ambos.
    const payload: VentaCreateDTO = {
      clienteId: clienteId ? Number(clienteId) : null,
      observaciones: observaciones || null,
      descuentoTotal: parseNum(descuentoTotal) || null,
      impuestos: parseNum(impuestos) || null,
      items: items.map(it => ({
        unidadId: it.unidadId ? Number(it.unidadId) : null,
        varianteId: it.varianteId ? Number(it.varianteId) : null,
        cantidad: it.cantidad ?? (it.unidadId ? 1 : null),
        precioUnitario: it.precioUnitario,
        descuentoItem: it.descuentoItem ?? 0,
        observaciones: it.observaciones ?? null,
      })),
    };

    setSaving(true);
    try {
      await api.post('/api/ventas', payload);
      toast({ status: 'success', title: 'Venta confirmada' });
      router.replace('/ventas');
    } catch (e: any) {
      toast({ status: 'error', title: 'No se pudo crear la venta', description: e?.response?.data?.message ?? e?.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box bg="#f6f6f6" minH="100dvh">
        <Container maxW="container.lg" pt={10} px={{ base: 4, md: 6 }}>
          <Flex bg="white" borderRadius="md" borderWidth="1px" py={20} align="center" justify="center">
            <Spinner />
          </Flex>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg="#f6f6f6" minH="100dvh">
      <Container maxW="container.lg" pt={10} px={{ base: 4, md: 6 }}>

        <HStack justify="space-between" mb={4}>
          <HStack>
            <IconButton aria-label="Volver" icon={<ArrowLeft size={18}/>} variant="ghost" onClick={() => router.back()} />
            <Text fontSize="30px" fontWeight={600}>Nueva venta</Text>
          </HStack>
          <HStack>
            <Badge colorScheme="purple">Subtotal: {money(subtotal)}</Badge>
          </HStack>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} bg="white" p={4} borderRadius="md" borderWidth="1px">
          <FormControl>
            <FormLabel>Cliente</FormLabel>
            <Select placeholder="Mostrador" value={String(clienteId)} onChange={(e) => setClienteId(e.target.value)}>
              {clientes.map(c => <option key={c.id} value={String(c.id)}>{c.nombre}</option>)}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Observaciones</FormLabel>
            <Input value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Opcional" />
          </FormControl>

          <FormControl>
            <FormLabel>Descuento total</FormLabel>
            <NumberInput value={descuentoTotal} onChange={v => setDescuentoTotal(v)}>
              <NumberInputField placeholder="0" />
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel>Impuestos</FormLabel>
            <NumberInput value={impuestos} onChange={v => setImpuestos(v)}>
              <NumberInputField placeholder="0" />
            </NumberInput>
          </FormControl>
        </SimpleGrid>

        <Box mt={4} bg="white" borderRadius="md" borderWidth="1px" p={4}>
          <Text fontWeight={600} mb={3}>Agregar ítems</Text>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={4}>
            {/* Trackeados por IMEI */}
            <FormControl>
              <FormLabel>Unidad (IMEI)</FormLabel>
              <HStack>
                <Select placeholder="Elegí unidad" id="sel-unidad">
                  {opcionesTrackeados.map(r => (
                    <option key={String(r.unidadId)} value={String(r.unidadId)}>
                      {r.modeloNombre} {r.colorNombre ? `- ${r.colorNombre}` : ''} {r.capacidadEtiqueta ? `- ${r.capacidadEtiqueta}` : ''} · IMEI {r.imei} · {money(r.precioEfectivo ?? r.precioBase ?? 0)}
                    </option>
                  ))}
                </Select>
                <IconButton
                  aria-label="Agregar unidad"
                  icon={<Plus size={16} />}
                  onClick={() => {
                    const sel = document.getElementById('sel-unidad') as HTMLSelectElement | null;
                    if (sel?.value) addItemTrackeado(sel.value);
                  }}
                />
              </HStack>
            </FormControl>

            {/* No trackeados (por variante + cantidad) */}
            <FormControl>
              <FormLabel>Variante (sin IMEI)</FormLabel>
              <HStack>
                <Select placeholder="Elegí variante" id="sel-variante">
                  {opcionesNoTrack.map(r => (
                    <option key={String(r.varianteId)} value={String(r.varianteId)}>
                      {r.modeloNombre} {r.colorNombre ? `- ${r.colorNombre}` : ''} {r.capacidadEtiqueta ? `- ${r.capacidadEtiqueta}` : ''} · Stock: {r.stockAcumulado} · {money(r.precioBase ?? 0)}
                    </option>
                  ))}
                </Select>
                <IconButton
                  aria-label="Agregar variante"
                  icon={<Plus size={16} />}
                  onClick={() => {
                    const sel = document.getElementById('sel-variante') as HTMLSelectElement | null;
                    if (sel?.value) addItemNoTrack(sel.value);
                  }}
                />
              </HStack>
            </FormControl>
          </SimpleGrid>

          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Ítem</Th>
                <Th>Cant.</Th>
                <Th isNumeric>Precio</Th>
                <Th isNumeric>Desc.</Th>
                <Th isNumeric>Subtotal</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {items.map((it, idx) => {
                const row = it.unidadId
                  ? opcionesTrackeados.find(r => String(r.unidadId) === String(it.unidadId))
                  : opcionesNoTrack.find(r => String(r.varianteId) === String(it.varianteId));

                const titulo = row
                  ? `${row.modeloNombre}${row.colorNombre ? ' - ' + row.colorNombre : ''}${row.capacidadEtiqueta ? ' - ' + row.capacidadEtiqueta : ''}${row.imei ? ' · IMEI ' + row.imei : ''}`
                  : (it.unidadId ? `Unidad ${it.unidadId}` : `Variante ${it.varianteId}`);

                const cant = it.unidadId ? 1 : (it.cantidad ?? 1);
                const linea = (it.precioUnitario - (it.descuentoItem ?? 0)) * cant;

                return (
                  <Tr key={idx}>
                    <Td>{titulo}</Td>
                    <Td width="100px">
                      {it.unidadId ? (
                        <Tag size="sm">1</Tag>
                      ) : (
                        <NumberInput min={1} value={String(it.cantidad ?? 1)} onChange={v => {
                          const n = Number(v);
                          setItems(prev => prev.map((x, i) => i === idx ? { ...x, cantidad: Number.isFinite(n) && n > 0 ? n : 1 } : x));
                        }}>
                          <NumberInputField />
                        </NumberInput>
                      )}
                    </Td>
                    <Td isNumeric width="140px">
                      <NumberInput value={String(it.precioUnitario)} onChange={v => {
                        const n = Number(v.replace(/\./g,'').replace(',','.'));
                        setItems(prev => prev.map((x, i) => i === idx ? { ...x, precioUnitario: Number.isFinite(n) ? n : 0 } : x));
                      }}>
                        <NumberInputField />
                      </NumberInput>
                    </Td>
                    <Td isNumeric width="140px">
                      <NumberInput value={String(it.descuentoItem ?? 0)} onChange={v => {
                        const n = Number(v.replace(/\./g,'').replace(',','.'));
                        setItems(prev => prev.map((x, i) => i === idx ? { ...x, descuentoItem: Number.isFinite(n) ? n : 0 } : x));
                      }}>
                        <NumberInputField />
                      </NumberInput>
                    </Td>
                    <Td isNumeric>{money(linea)}</Td>
                    <Td>
                      <IconButton aria-label="Quitar" icon={<Trash2 size={16}/>} variant="ghost" onClick={() => removeItemAt(idx)} />
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>

          <HStack justify="flex-end" mt={4}>
            <Button variant="ghost" onClick={() => router.back()}>Cancelar</Button>
            <Button colorScheme="blue" onClick={onSubmit} isLoading={saving}>Confirmar venta</Button>
          </HStack>
        </Box>
      </Container>
    </Box>
  );
}
