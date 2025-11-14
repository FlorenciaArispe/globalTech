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
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    FormControl,
    FormLabel,
    Input,
    Select,
    Switch,
    Tag,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
} from '@chakra-ui/react';
import { Plus, MoreVertical, Pencil, Trash2, ArrowUpDown } from 'lucide-react';
import { api } from '@/lib/axios';

type Id = number | string;

type ModeloDTO = {
    id: Id;
    categoriaId: Id;
    categoriaNombre: string;
    marcaId: Id;
    marcaNombre: string;
    nombre: string;
    trackeaUnidad: boolean;
    requiereColor: boolean;
    requiereCapacidad: boolean;
};

type CategoriaDTO = {
    id: Id;
    nombre: string;
};

type MarcaDTO = {
    id: Id;
    nombre: string;
};

export default function ModelosPage() {
    const toast = useToast();

    const [rows, setRows] = useState<ModeloDTO[]>([]);
    const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
    const [marcas, setMarcas] = useState<MarcaDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editId, setEditId] = useState<Id | null>(null);
    const [editNombre, setEditNombre] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createNombre, setCreateNombre] = useState('');
    const [createCategoriaId, setCreateCategoriaId] = useState<Id | ''>('');
    const [createMarcaId, setCreateMarcaId] = useState<Id | ''>('');
    const [createTrackeaUnidad, setCreateTrackeaUnidad] = useState<boolean>(true);
    const [createRequiereColor, setCreateRequiereColor] = useState<boolean>(true);
    const [createRequiereCapacidad, setCreateRequiereCapacidad] = useState<boolean>(true);
    const [savingCreate, setSavingCreate] = useState(false);
    const [deleteId, setDeleteId] = useState<Id | null>(null);
    const [deleting, setDeleting] = useState(false);
    const cancelRefDelete = useRef<HTMLButtonElement | null>(null);
    const [search, setSearch] = useState('');
    const [sortNewestFirst, setSortNewestFirst] = useState(false);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const [modelosResp, categoriasResp, marcasResp] = await Promise.all([
                    api.get<ModeloDTO[]>('/api/modelos'),
                    api.get<CategoriaDTO[]>('/api/categorias'),
                    api.get<MarcaDTO[]>('/api/marcas'),
                ]);

                if (!alive) return;

                setRows(Array.isArray(modelosResp.data) ? modelosResp.data : []);
                setCategorias(categoriasResp.data ?? []);
                setMarcas(marcasResp.data ?? []);
            } catch (e: any) {
                toast({
                    status: 'error',
                    title: 'No se pudo cargar la lista de modelos',
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

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const { data } = await api.get<ModeloDTO[]>('/api/modelos');
                if (!alive) return;
                setRows(Array.isArray(data) ? data : []);
            } catch (e: any) {
                toast({
                    status: 'error',
                    title: 'No se pudo cargar los modelos',
                    description: e?.response?.data?.message ?? e?.message,
                });
            }
        })();
        return () => { alive = false; };
    }, [toast]);

    const filteredRows = useMemo(() => {
        let base = rows;
        const q = search.trim().toLowerCase();
        if (q) {
            base = base.filter(m =>
                m.nombre.toLowerCase().includes(q) ||
                m.categoriaNombre.toLowerCase().includes(q) ||
                (m.marcaNombre ? m.marcaNombre.toLowerCase().includes(q) : false)
            );
        }

        if (sortNewestFirst) {
            base = [...base].sort((a, b) => Number(b.id) - Number(a.id));
        }

        return base;
    }, [rows, search, sortNewestFirst]);

    const openEdit = (m: ModeloDTO) => {
        setEditId(m.id);
        setEditNombre(m.nombre);
        setIsEditOpen(true);
    };

    const closeEdit = () => {
        setIsEditOpen(false);
        setEditId(null);
        setEditNombre('');
    };

    const saveEdit = async () => {
        if (!editId || !editNombre.trim()) return;
        setSavingEdit(true);
        try {
            const { data: updated } = await api.patch<ModeloDTO>(`/api/modelos/${editId}/nombre`, {
                nombre: editNombre.trim(),
            });

            setRows(prev =>
                prev.map(m =>
                    String(m.id) === String(updated.id)
                        ? { ...m, nombre: updated.nombre }
                        : m
                ),
            );

            toast({ status: 'success', title: 'Modelo actualizado' });
            closeEdit();
        } catch (e: any) {
            toast({
                status: 'error',
                title: 'No se pudo editar',
                description: e?.response?.data?.message ?? e?.message,
            });
        } finally {
            setSavingEdit(false);
        }
    };

    const openCreate = () => {
        setCreateNombre('');
        setCreateCategoriaId('');
        setCreateMarcaId('');
        setCreateTrackeaUnidad(true);
        setCreateRequiereColor(true);
        setCreateRequiereCapacidad(true);
        setIsCreateOpen(true);
    };

    const closeCreate = () => {
        setIsCreateOpen(false);
        setCreateNombre('');
        setCreateCategoriaId('');
        setCreateMarcaId('');
        setCreateTrackeaUnidad(true);
        setCreateRequiereColor(true);
        setCreateRequiereCapacidad(true);
    };

    const saveCreate = async () => {
        if (!createNombre.trim() || !createCategoriaId || !createMarcaId) {
            toast({
                status: 'warning',
                title: 'Faltan datos',
                description: 'Nombre, categoría y marca son obligatorios.',
            });
            return;
        }

        setSavingCreate(true);
        try {
            const payload = {
                nombre: createNombre.trim(),
                categoriaId: Number(createCategoriaId),
                marcaId: Number(createMarcaId),
                trackeaUnidad: createTrackeaUnidad,
                requiereColor: createRequiereColor,
                requiereCapacidad: createRequiereCapacidad,
            };

            const { data: creado } = await api.post<ModeloDTO>('/api/modelos', payload);

            setRows(prev => [...prev, creado]);

            toast({ status: 'success', title: 'Modelo creado' });
            closeCreate();
        } catch (e: any) {
            toast({
                status: 'error',
                title: 'No se pudo crear el modelo',
                description: e?.response?.data?.message ?? e?.message,
            });
        } finally {
            setSavingCreate(false);
        }
    };

    const openDelete = (id: Id) => {
        setDeleteId(id);
    };

    const closeDelete = () => {
        setDeleteId(null);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await api.delete(`/api/modelos/${deleteId}`);

            setRows(prev => prev.filter(m => String(m.id) !== String(deleteId)));

            toast({ status: 'success', title: 'Modelo eliminado' });
            closeDelete();
        } catch (e: any) {
            toast({
                status: 'error',
                title: 'No se pudo eliminar',
                description: e?.response?.data?.message ?? e?.message,
            });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Box bg="#f6f6f6" minH="100dvh">
            <Container maxW="container.xl" pt={10} pb={10} px={{ base: 4, md: 6 }}>

                <HStack justify="space-between" align="center" mb={2}>
                    <Text fontSize="30px" fontWeight={600}>Modelos</Text>
                    <HStack spacing={3}>

                        <IconButton
                            aria-label="Nuevo producto"
                            icon={<Plus size={18} />}
                            variant="solid"
                            colorScheme="blue"
                            size="sm"
                            onClick={openCreate}
                        />
                    </HStack>
                </HStack>

                <Box mb={3}>
                    <HStack spacing={3} align="center">
                        <Input
                            placeholder="Buscar por nombre, categoría o marca"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            bg="white"
                            size="md"
                        />

                        <Button
                            size="md"
                            variant="outline"
                            leftIcon={<ArrowUpDown size={16} />}
                            onClick={() => setSortNewestFirst(s => !s)}
                        >
                            {sortNewestFirst ? 'Más antiguo' : 'Más nuevo'}
                        </Button>
                    </HStack>


                    <Text mt={2} fontSize="sm" color="gray.600" ml={1}>
                        {filteredRows.length} {filteredRows.length === 1 ? 'modelo' : 'modelos'}
                    </Text>
                </Box>

                {loading ? (
                    <Flex
                        bg="white"
                        borderRadius="md"
                        borderWidth="1px"
                        py={20}
                        align="center"
                        justify="center"
                    >
                        <Spinner />
                    </Flex>
                ) : rows.length === 0 ? (
                    <Flex
                        direction="column"
                        gap={3}
                        bg="white"
                        borderRadius="md"
                        borderWidth="1px"
                        p={6}
                        align="center"
                    >
                        <Text color="gray.600">Aún no hay modelos.</Text>
                        <Button leftIcon={<Plus size={16} />} colorScheme="blue" onClick={openCreate}>
                            Crear modelo
                        </Button>
                    </Flex>
                ) : (
                    <Box bg="white" borderRadius="md" borderWidth="1px" overflowX="auto">
                        <Table size="md" variant="unstyled">
                            <Thead bg="gray.50">
                                <Tr>
                                    <Th>Nombre</Th>
                                    <Th>Categoría</Th>
                                    <Th>Marca</Th>
                                    <Th>Trackea unidad</Th>
                                    <Th>Requiere color</Th>
                                    <Th>Requiere capacidad</Th>
                                    <Th textAlign="right">Acciones</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredRows.map((m, idx) => (
                                    <Tr key={String(m.id)} bg={idx % 2 === 0 ? 'white' : 'gray.50'}>
                                        <Td>
                                            <Text fontWeight={600}>{m.nombre}</Text>
                                        </Td>
                                        <Td>
                                            <Text>{m.categoriaNombre}</Text>
                                        </Td>
                                        <Td>
                                            <Text>{m.marcaNombre}</Text>
                                        </Td>
                                        <Td>
                                            {m.trackeaUnidad ? (
                                                <Tag size="sm" colorScheme="green">
                                                    Sí
                                                </Tag>
                                            ) : (
                                                <Tag size="sm" colorScheme="gray">
                                                    No
                                                </Tag>
                                            )}
                                        </Td>
                                        <Td>
                                            {m.requiereColor ? (
                                                <Tag size="sm" colorScheme="blue">
                                                    Sí
                                                </Tag>
                                            ) : (
                                                <Tag size="sm" colorScheme="gray">
                                                    No
                                                </Tag>
                                            )}
                                        </Td>
                                        <Td>
                                            {m.requiereCapacidad ? (
                                                <Tag size="sm" colorScheme="purple">
                                                    Sí
                                                </Tag>
                                            ) : (
                                                <Tag size="sm" colorScheme="gray">
                                                    No
                                                </Tag>
                                            )}
                                        </Td>
                                        <Td textAlign="right">
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
                                                        onClick={() => openEdit(m)}
                                                    >
                                                        Editar nombre
                                                    </MenuItem>
                                                    <MenuItem
                                                        icon={<Trash2 size={14} />}
                                                        color="red.500"
                                                        onClick={() => openDelete(m.id)}
                                                    >
                                                        Eliminar
                                                    </MenuItem>
                                                </MenuList>
                                            </Menu>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                )}
            </Container>

            <Modal isOpen={isEditOpen} onClose={closeEdit} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Editar modelo</ModalHeader>
                    <ModalBody>
                        <FormControl isRequired>
                            <FormLabel>Nombre</FormLabel>
                            <Input
                                value={editNombre}
                                onChange={e => setEditNombre(e.target.value)}
                                placeholder="Nuevo nombre del modelo"
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={closeEdit}>Cancelar</Button>
                        <Button
                            colorScheme="blue"
                            ml={3}
                            onClick={saveEdit}
                            isLoading={savingEdit}
                        >
                            Guardar
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isCreateOpen} onClose={closeCreate} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Nuevo modelo</ModalHeader>
                    <ModalBody>
                        <FormControl isRequired mb={3}>
                            <FormLabel>Nombre</FormLabel>
                            <Input
                                value={createNombre}
                                onChange={e => setCreateNombre(e.target.value)}
                                placeholder="Ej: iPhone 13"
                            />
                        </FormControl>

                        <FormControl isRequired mb={3}>
                            <FormLabel>Categoría</FormLabel>
                            <Select
                                placeholder="Seleccioná una categoría"
                                value={createCategoriaId}
                                onChange={e => setCreateCategoriaId(e.target.value as Id)}
                            >
                                {categorias.map(c => (
                                    <option key={String(c.id)} value={String(c.id)}>
                                        {c.nombre}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl isRequired mb={3}>
                            <FormLabel>Marca</FormLabel>
                            <Select
                                placeholder="Seleccioná una marca"
                                value={createMarcaId}
                                onChange={e => setCreateMarcaId(e.target.value as Id)}
                            >
                                {marcas.map(m => (
                                    <option key={String(m.id)} value={String(m.id)}>
                                        {m.nombre}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl display="flex" alignItems="center" mb={2}>
                            <FormLabel mb="0">Trackea unidad (IMEI / unidades individuales)</FormLabel>
                            <Switch
                                isChecked={createTrackeaUnidad}
                                onChange={e => setCreateTrackeaUnidad(e.target.checked)}
                            />
                        </FormControl>

                        <FormControl display="flex" alignItems="center" mb={2}>
                            <FormLabel mb="0">Requiere color</FormLabel>
                            <Switch
                                isChecked={createRequiereColor}
                                onChange={e => setCreateRequiereColor(e.target.checked)}
                            />
                        </FormControl>

                        <FormControl display="flex" alignItems="center">
                            <FormLabel mb="0">Requiere capacidad</FormLabel>
                            <Switch
                                isChecked={createRequiereCapacidad}
                                onChange={e => setCreateRequiereCapacidad(e.target.checked)}
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={closeCreate}>Cancelar</Button>
                        <Button
                            colorScheme="blue"
                            ml={3}
                            onClick={saveCreate}
                            isLoading={savingCreate}
                        >
                            Guardar
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <AlertDialog
                isOpen={deleteId != null}
                leastDestructiveRef={cancelRefDelete}
                onClose={closeDelete}
                isCentered
            >
                <AlertDialogOverlay />
                <AlertDialogContent>
                    <AlertDialogHeader>Eliminar modelo</AlertDialogHeader>
                    <AlertDialogBody>
                        ¿Seguro que querés eliminar este modelo? Si tiene variantes asociadas, va a fallar.
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
                            Eliminar
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Box>
    );
}
