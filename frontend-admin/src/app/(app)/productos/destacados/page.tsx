'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Container,
  Text,
  HStack,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Flex,
  Spinner,
  IconButton,
  Button,
  useToast,
  Input,
  Tag,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Tooltip,
} from '@chakra-ui/react';
import { Star, ChevronDown, MoreVertical, Trash2 } from 'lucide-react';
import { api } from '@/lib/axios';

type Id = number | string;

type TipoCatalogoItem =
  | 'TRACKED_USADO_UNIDAD'
  | 'TRACKED_SELLADO_AGREGADO'
  | 'NO_TRACK_AGREGADO';

type VarianteOpcionCatalogoDTO = {
  color: string | null;
  capacidad: string | null;
  stock: number;
};

type CatalogoItemDTO = {
  itemId: Id;
  modeloId: Id;
  modeloNombre: string;
  categoriaId: Id;
  categoriaNombre: string;
  marcaId: Id;
  marcaNombre: string;
  tipo: TipoCatalogoItem;

  // para unidades usadas
  color: string | null;
  capacidad: string | null;
  bateriaCondicionPct: number | null;

  precio: number | null;
  enStock: boolean;
  stockTotal: number;

  // agregados
  coloresEnStock: string[];
  variantesEnStock: VarianteOpcionCatalogoDTO[];

};

type ProductoDestacadoCreateDTO = {
  tipo: TipoCatalogoItem;
  itemId: Id;
  orden: number | null;
};

export default function DestacadosPage() {
  const toast = useToast();

  const [catalogo, setCatalogo] = useState<CatalogoItemDTO[]>([]);
  const [destacados, setDestacados] = useState<CatalogoItemDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchNuevo, setSearchNuevo] = useState('');
  const [adding, setAdding] = useState(false);

  const [deleteItem, setDeleteItem] = useState<CatalogoItemDTO | null>(null);
  const [deleting, setDeleting] = useState(false);
  const cancelRefDelete = useRef<HTMLButtonElement | null>(null);

  const makeKey = (i: CatalogoItemDTO) => `${i.tipo}#${i.itemId}`;

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const [catalogoResp, destacadosResp] = await Promise.all([
          api.get<CatalogoItemDTO[]>('/api/modelos/catalogo'),
          api.get<CatalogoItemDTO[]>('/api/catalogo/destacados'),
        ]);


        if (!alive) return;
        console.log("DESTACADOS FRONT", destacadosResp)
        setCatalogo(catalogoResp.data ?? []);
        setDestacados(destacadosResp.data ?? []);
      } catch (e: any) {
        console.error(e);
        toast({
          status: 'error',
          title: 'No se pudo cargar el catálogo / destacados',
          description: e?.response?.data?.message ?? e?.message,
        });
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [toast]);

  const opcionesDisponibles = useMemo(() => {
    const setDest = new Set(destacados.map(makeKey));
    return catalogo.filter((item) => !setDest.has(makeKey(item)));
  }, [catalogo, destacados]);

  const opcionesFiltradas = useMemo(() => {
    const q = searchNuevo.trim().toLowerCase();
    if (!q) return opcionesDisponibles;

    return opcionesDisponibles.filter((item) =>
      formatItemLabel(item).toLowerCase().includes(q),
    );
  }, [opcionesDisponibles, searchNuevo]);

  function formatItemLabel(item: CatalogoItemDTO): string {
    const parts: string[] = [];
    parts.push(item.modeloNombre);

    if (item.color) parts.push(item.color);
    if (item.capacidad) parts.push(item.capacidad);

    if (item.tipo === 'TRACKED_USADO_UNIDAD' && item.bateriaCondicionPct != null) {
      parts.push(`${item.bateriaCondicionPct}% batería`);
    }

    if (item.precio != null) {
      parts.push(`$${item.precio}`);
    }

    return parts.join(' · ');
  }


  async function handleAddDestacado(item: CatalogoItemDTO) {
    try {
      setAdding(true);

      const payload: ProductoDestacadoCreateDTO = {
        tipo: item.tipo,
        itemId: item.itemId,
        orden: destacados.length + 1,
      };

      await api.post('/api/catalogo/destacados', payload);

      setDestacados((prev) => [...prev, item]);

      toast({
        status: 'success',
        title: 'Producto agregado a destacados',
        description: formatItemLabel(item),
      });
    } catch (e: any) {
      console.error(e);
      toast({
        status: 'error',
        title: 'No se pudo agregar como destacado',
        description: e?.response?.data?.message ?? e?.message,
      });
    } finally {
      setAdding(false);
    }
  }

  function openDelete(item: CatalogoItemDTO) {
    setDeleteItem(item);
  }

  function closeDelete() {
    setDeleteItem(null);
  }

  async function confirmDelete() {
    if (!deleteItem) return;
    try {
      setDeleting(true);

      await api.delete('/api/catalogo/destacados', {
        params: {
          tipo: deleteItem.tipo,
          itemId: deleteItem.itemId,
        },
      });

      setDestacados((prev) => prev.filter((d) => makeKey(d) !== makeKey(deleteItem)));

      toast({
        status: 'success',
        title: 'Producto quitado de destacados',
        description: formatItemLabel(deleteItem),
      });
      closeDelete();
    } catch (e: any) {
      console.error(e);
      toast({
        status: 'error',
        title: 'No se pudo quitar de destacados',
        description: e?.response?.data?.message ?? e?.message,
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Box bg="#f6f6f6" minH="100dvh">
      <Container maxW="container.xl" pt={10} pb={10} px={{ base: 4, md: 6 }}>
        <HStack justify="space-between" align="center" mb={2}>
          <Text fontSize="30px" fontWeight={600}>
            Productos destacados
          </Text>

          <Menu>
            <MenuButton
              as={Button}
              colorScheme="blue"
              size="sm"
              rightIcon={<ChevronDown size={16} />}
              isDisabled={opcionesDisponibles.length === 0 || adding}
            >
              Nuevo destacado
            </MenuButton>
            <MenuList minW="420px" p={3}>
              <Text fontSize="sm" mb={2} fontWeight={600}>
                Elegí un producto del catálogo
              </Text>
              <Input
                size="sm"
                placeholder="Buscar por modelo, color, capacidad..."
                value={searchNuevo}
                onChange={(e) => setSearchNuevo(e.target.value)}
                mb={3}
                bg="white"
              />
              <Box maxH="260px" overflowY="auto">
                {opcionesFiltradas.length === 0 ? (
                  <Text fontSize="sm" color="gray.500" px={2} py={1}>
                    No hay productos disponibles para agregar como destacados.
                  </Text>
                ) : (
                  opcionesFiltradas.map((item) => (
                    <MenuItem
                      key={makeKey(item)}
                      onClick={() => handleAddDestacado(item)}
                      isDisabled={adding}
                    >
                      <Box>
                        <Text fontSize="sm" fontWeight={600}>
                          {item.modeloNombre}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {formatItemLabel(item)}
                        </Text>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Box>
            </MenuList>
          </Menu>
        </HStack>

        <Text mt={2} fontSize="sm" color="gray.600" ml={1}>
          {destacados.length} {destacados.length === 1 ? 'producto destacado' : 'productos destacados'}
        </Text>

        {loading ? (
          <Flex
            bg="white"
            borderRadius="md"
            borderWidth="1px"
            py={20}
            align="center"
            justify="center"
            mt={4}
          >
            <Spinner />
          </Flex>
        ) : destacados.length === 0 ? (
          <Flex
            direction="column"
            gap={3}
            bg="white"
            borderRadius="md"
            borderWidth="1px"
            p={6}
            mt={4}
            align="center"
          >
            <Text color="gray.600">Todavía no hay productos destacados.</Text>
      
          </Flex>
        ) : (
          <Box
            bg="white"
            borderRadius="md"
            borderWidth="1px"
            overflowX="auto"
            mt={4}
          >
            <Table size="md" variant="unstyled">
              <Thead bg="gray.50">
                <Tr>
                  <Th width="40px"></Th>
                  <Th>Producto</Th>
                  <Th>Detalle</Th>
                  <Th isNumeric>Precio</Th>
                  <Th>Stock</Th>
                  <Th textAlign="right">Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {destacados.map((item, idx) => (
                  <Tr
                    key={makeKey(item)}
                    bg={idx % 2 === 0 ? 'white' : 'gray.50'}
                  >
                    <Td>
                      <Star size={16} />
                    </Td>
                    <Td>
                      <Text fontWeight={600}>{item.modeloNombre}</Text>
                      <Text fontSize="xs" color="gray.600">
                        {item.marcaNombre} · {item.categoriaNombre}
                      </Text>
                    </Td>
                    <Td>
                      {item.tipo === 'TRACKED_USADO_UNIDAD' ? (
                        <Text fontSize="sm">
                          {item.color && <>{item.color} </>}
                          {item.capacidad && <>{item.capacidad} </>}
                          {item.bateriaCondicionPct != null && (
                            <>{item.bateriaCondicionPct}% </>
                          )}
                        </Text>
                      ) : item.variantesEnStock?.length ? (
                        <Text fontSize="sm">
                          {item.variantesEnStock
                            .map((v) => {
                              const p: string[] = [];
                              if (v.color) p.push(v.color);
                              if (v.capacidad) p.push(v.capacidad);

                              return p.join(' ');
                            })
                            .join(' - ')}
                        </Text>
                      ) : (
                        <Text fontSize="sm" color="gray.500">
                          Variantes múltiples
                        </Text>
                      )}
                    </Td>
                    <Td isNumeric>
                      {item.precio != null ? (
                        <Text fontSize="sm">${item.precio}</Text>
                      ) : (
                        <Text fontSize="xs" color="gray.500">
                          Sin precio
                        </Text>
                      )}
                    </Td>
                    <Td>
                      {item.enStock ? (
                        <Badge colorScheme="green">
                          En stock: {item.stockTotal}
                        </Badge>
                      ) : (
                        <Badge colorScheme="red">Sin stock</Badge>
                      )}
                    </Td>
                    <Td textAlign="right">
                      <Tooltip label=" Quitar de destacados">
                        <IconButton
                          aria-label=" Quitar de destacados"
                          icon={<Trash2 size={16} />}
                          size="xs"
                          variant="ghost"
                          onClick={() => openDelete(item)}
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

      <AlertDialog
        isOpen={deleteItem != null}
        leastDestructiveRef={cancelRefDelete}
        onClose={closeDelete}
        isCentered
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Quitar de destacados</AlertDialogHeader>
          <AlertDialogBody>
            ¿Seguro que querés quitar este producto de los destacados?
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRefDelete} onClick={closeDelete}>
              Cancelar
            </Button>
            <Button
              colorScheme="red"
              ml={3}
              onClick={confirmDelete}
              isLoading={deleting}
            >
              Quitar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
}
