'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box, Container, Text, HStack, IconButton, Table, Tbody, Tr, Td, Th, Thead,
  Spinner, useToast, Menu, MenuButton, MenuList, MenuItem,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, FormControl, FormLabel, Input, AlertDialog, AlertDialogOverlay,
  AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
} from '@chakra-ui/react';
import { Plus, MoreVertical } from 'lucide-react';
import { api } from '@/lib/axios';
import { useRouter } from 'next/navigation';

type Id = string | number;

type Cliente = {
  id: Id;
  nombre: string;
  telefono?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export default function ClientesPage() {
  const toast = useToast();
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id | null>(null);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<Id | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const { data } = await api.get<Cliente[]>('/api/clientes');
        if (alive) setClientes(data ?? []);
      } catch (e: any) {
        toast({
          status: 'error',
          title: 'No se pudieron cargar los clientes',
          description: e?.response?.data?.message ?? e?.message,
        });
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [router, toast]);

  const sorted = useMemo(
    () => [...clientes].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [clientes]
  );

  const openCreate = () => {
    setEditingId(null);
    setNombre('');
    setTelefono('');
    setIsOpen(true);
  };

  const openEdit = (c: Cliente) => {
    setEditingId(c.id);
    setNombre(c.nombre);
    setTelefono(c.telefono ?? '');
    setIsOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
    setEditingId(null);
    setNombre('');
    setTelefono('');
  };

  const handleSave = async () => {
    if (!nombre.trim()) {
      toast({ status: 'warning', title: 'Ingresá el nombre del cliente' });
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const { data: updated } = await api.put<Cliente>(`/api/clientes/${editingId}`, {
          nombre: nombre.trim(),
          telefono: telefono.trim() || null,
        });
        setClientes(prev => prev.map(c => (String(c.id) === String(updated.id) ? updated : c)));
        toast({ status: 'success', title: 'Cliente actualizado' });
      } else {
        const { data: created } = await api.post<Cliente>('/api/clientes', {
          nombre: nombre.trim(),
          telefono: telefono.trim() || null,
        });
        setClientes(prev => [created, ...prev]);
        toast({ status: 'success', title: 'Cliente creado' });
      }
      onClose();
    } catch (e: any) {
      toast({ status: 'error', title: 'No se pudo guardar', description: e?.response?.data?.message ?? e?.message });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id: Id) => setDeleteId(id);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/api/clientes/${deleteId}`);
      setClientes(prev => prev.filter(c => String(c.id) !== String(deleteId)));
      toast({ status: 'success', title: 'Cliente eliminado' });
      setDeleteId(null);
    } catch (e: any) {
      toast({ status: 'error', title: 'No se pudo eliminar', description: e?.response?.data?.message ?? e?.message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box bg="#f6f6f6" minH="100dvh">
     <Container maxW="container.xl" pt={10} pb={10} px={{ base: 4, md: 6 }}>
        <HStack justify="space-between" align="center" mb={4}>
          <Text fontSize="30px" fontWeight={600}>Clientes</Text>
          <IconButton
            aria-label="Agregar cliente"
            icon={<Plus size={18} />}
            onClick={openCreate}
            variant="solid"
            colorScheme="blue"
            size="sm"
          />
        </HStack>

        {loading ? (
          <Box py={16} textAlign="center">
            <Spinner />
          </Box>
        ) : (
          <Box borderWidth="1px" borderRadius="md" overflow="hidden" bg="white">
            <Table variant="simple" size="md">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Nombre</Th>
                  <Th>Teléfono</Th>
                  <Th isNumeric w="0">Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sorted.map(cli => (
                  <Tr key={String(cli.id)} _hover={{ bg: 'gray.50' }}>
                    <Td fontWeight={500}>{cli.nombre}</Td>
                    <Td>{cli.telefono ?? <Text as="span" color="gray.500">—</Text>}</Td>
                    <Td isNumeric>
                      <Menu placement="bottom-end">
                        <MenuButton
                          as={IconButton}
                          aria-label="Acciones"
                          icon={<MoreVertical size={18} />}
                          variant="ghost"
                        />
                        <MenuList>
                          <MenuItem onClick={() => openEdit(cli)}>Editar</MenuItem>
                          <MenuItem color="red.500" onClick={() => confirmDelete(cli.id)}>Eliminar</MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
                {sorted.length === 0 && (
                  <Tr>
                    <Td colSpan={3}>
                      <Text color="gray.500">No hay clientes todavía.</Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        )}
      </Container>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingId ? 'Editar cliente' : 'Nuevo cliente'}</ModalHeader>
          <ModalBody>
            <FormControl isRequired mb={3}>
              <FormLabel>Nombre</FormLabel>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Juan Pérez"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Teléfono</FormLabel>
              <Input
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: 291..."
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>Cancelar</Button>
            <Button colorScheme="blue" onClick={handleSave} isLoading={saving}>
              {editingId ? 'Guardar cambios' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        leastDestructiveRef={cancelRef}
        isCentered
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Eliminar cliente</AlertDialogHeader>
          <AlertDialogBody>
            ¿Seguro que querés eliminar este cliente? Esta acción no se puede deshacer.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef as any} onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button colorScheme="red" onClick={handleDelete} ml={3} isLoading={deleting}>
              Eliminar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
}
