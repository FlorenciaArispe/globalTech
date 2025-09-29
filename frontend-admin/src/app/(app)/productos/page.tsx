'use client';

import NextLink from 'next/link';
import { useEffect, useState, useRef } from 'react';
import {
  Box, Container, Text, HStack, IconButton, Table, Thead, Th, Tr, Tbody, Td,
  Image, Badge, Tag, Spinner, Button, useToast, AlertDialog, AlertDialogOverlay,
  AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, Flex
} from '@chakra-ui/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';

type Id = number | string;

type VarianteApi = any; // ajustá a tu DTO real

type ModeloRow = {
  modeloId: Id;
  modeloNombre: string;
  imagenUrl?: string | null;
  stockTotal: number;
  precioMin: number | null;
  colores: string[]; // únicos
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

const money = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 }).format(n ?? 0);

export default function Productos() {
  const toast = useToast();
  const router = useRouter();

  const [rows, setRows] = useState<ModeloRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<Id | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Trae variantes y agrupamos por modelo
        const { data } = await api.get('/api/variantes'); // ajustá si tu endpoint es otro
        if (!alive) return;
        const grouped = groupVariantsByModelo(data as VarianteApi[]);
        setRows(grouped);
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

  const onEdit = (modeloId: Id) => {
    // Ruta de edición de MODELO (ajustá si usás otra)
    router.push(`/modelos/${modeloId}/editar`);
  };

  const onAskDelete = (modeloId: Id) => setDeletingId(modeloId);

  const onDelete = async () => {
    if (!deletingId) return;
    try {
      // Borrás el MODELO (si hay FK a variantes, tu backend debería impedirlo o borrar en cascada)
      await api.delete(`/api/modelos/${deletingId}`);
      setRows(prev => prev.filter(r => String(r.modeloId) !== String(deletingId)));
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

        {/* Loading */}
        {loading && (
          <Flex bg="white" borderRadius="md" borderWidth="1px" py={20} align="center" justify="center">
            <Spinner />
          </Flex>
        )}

        {/* Empty */}
        {!loading && rows.length === 0 && (
          <Flex direction="column" gap={3} bg="white" borderRadius="md" borderWidth="1px" p={6} align="center">
            <Text color="gray.600">Aún no hay productos.</Text>
            <Button as={NextLink} href="/productos/nuevo" colorScheme="blue" leftIcon={<Plus size={16} />}>
              Crear producto
            </Button>
          </Flex>
        )}

        {/* Table */}
        {!loading && rows.length > 0 && (
          <Box bg="white" borderRadius="md" borderWidth="1px" overflowX="auto">
            <Table size="md">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Producto</Th>
                  <Th>Stock</Th>
                  <Th isNumeric>Precio (min)</Th>
                  <Th>Variantes</Th>
                  <Th textAlign="right">Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {rows.map(row => (
                  <Tr key={String(row.modeloId)} _hover={{ bg: 'gray.50' }}>
                    <Td>
                      <HStack spacing={3}>
                        <Image
                          src={row.imagenUrl || PLACEHOLDER_DATAURI}
                          alt={row.modeloNombre}
                          boxSize="48px"
                          borderRadius="md"
                          objectFit="cover"
                          border="1px solid"
                          borderColor="gray.200"
                        />
                        <Text fontWeight={600}>{row.modeloNombre}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      {row.stockTotal > 0 ? (
                        <Badge colorScheme="green">{row.stockTotal} u.</Badge>
                      ) : (
                        <Badge colorScheme="red">Sin stock</Badge>
                      )}
                    </Td>
                    <Td isNumeric>
                      <Text>{row.precioMin != null ? money(row.precioMin) : '—'}</Text>
                    </Td>
                    <Td>
                      {row.colores.length > 0 ? (
                        <HStack wrap="wrap" spacing={1}>
                          {row.colores.slice(0, 3).map((c) => <Tag key={c}>{c}</Tag>)}
                          {row.colores.length > 3 && <Tag>+{row.colores.length - 3}</Tag>}
                        </HStack>
                      ) : (
                        <Text color="gray.500">—</Text>
                      )}
                    </Td>
                    <Td>
                      <HStack justify="flex-end" spacing={1}>
                        <IconButton
                          aria-label="Editar modelo"
                          icon={<Pencil size={16} />}
                          variant="ghost"
                          onClick={() => onEdit(row.modeloId)}
                        />
                        <IconButton
                          aria-label="Eliminar modelo"
                          icon={<Trash2 size={16} />}
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => onAskDelete(row.modeloId)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Container>

      {/* Confirmación eliminar */}
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
    </Box>
  );
}

/** Agrupa las variantes por modelo y calcula agregados */
function groupVariantsByModelo(variantes: VarianteApi[]): ModeloRow[] {
  if (!Array.isArray(variantes)) return [];

  // mapa: modeloId -> acumulador
  const acc = new Map<string, {
    id: Id;
    nombre: string;
    imagenUrl?: string | null;
    stock: number;
    precios: number[];
    colores: Set<string>;
  }>();

  for (const v of variantes) {
    const modeloId: Id =
      v?.modeloId ?? v?.modelo?.id ?? v?.model_id ?? v?.modelo_uuid ?? v?.modelo ?? '';
    const modeloNombre: string =
      v?.modeloNombre ?? v?.modelo?.nombre ?? v?.modelo_name ?? v?.modeloLabel ?? '—';
    const imagenUrl: string | null =
      v?.modeloImagenUrl ?? v?.modelo?.imagenUrl ?? v?.imagenUrl ?? v?.imageUrl ?? null;

    const stock = Number(v?.stock ?? v?.cantidad ?? v?.inventario ?? v?.qty ?? 0);
    const precioRaw = v?.precio ?? v?.price;
    const precio = precioRaw != null ? Number(precioRaw) : null;

    const colorNombre: string | null =
      v?.colorNombre ?? v?.color?.nombre ?? v?.color_name ?? v?.color ?? null;

    const key = String(modeloId);
    if (!acc.has(key)) {
      acc.set(key, {
        id: modeloId,
        nombre: modeloNombre,
        imagenUrl,
        stock: 0,
        precios: [],
        colores: new Set<string>(),
      });
    }
    const item = acc.get(key)!;
    item.stock += isFinite(stock) ? stock : 0;
    if (precio != null && isFinite(precio)) item.precios.push(precio);
    if (colorNombre) item.colores.add(String(colorNombre));
  }

  // transform
  return Array.from(acc.values()).map((m) => ({
    modeloId: m.id,
    modeloNombre: m.nombre,
    imagenUrl: m.imagenUrl,
    stockTotal: m.stock,
    precioMin: m.precios.length ? Math.min(...m.precios) : null,
    colores: Array.from(m.colores),
  }));
}
