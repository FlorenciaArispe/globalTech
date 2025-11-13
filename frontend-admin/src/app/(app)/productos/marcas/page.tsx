'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box, Container, Text, HStack, IconButton, Table, Tbody, Tr, Td,
  Spinner, useToast, Menu, MenuButton, MenuList, MenuItem,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, FormControl, FormLabel, Input
} from '@chakra-ui/react';
import { Plus, MoreVertical } from 'lucide-react';
import { api } from '@/lib/axios';

type Marca = {
  id: number | string;
  nombre: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function MarcasPage() {
  const toast = useToast();
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get<Marca[]>('/api/marcas');
        if (alive) setMarcas(data);
      } catch (e: any) {
        console.log('status', e?.response?.status, 'data', e?.response?.data);
        toast({
          status: 'error',
          title: 'No se pudieron cargar las marcas',
          description: e?.response?.data?.message ?? e?.message,
        });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [toast]);

  const sorted = useMemo(
    () => [...marcas].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [marcas]
  );

  const openCreate = () => {
    setEditingId(null);
    setNombre('');
    setIsOpen(true);
  };

  const openEdit = (m: Marca) => {
    setEditingId(m.id);
    setNombre(m.nombre);
    setIsOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
    setEditingId(null);
    setNombre('');
  };

  const handleSave = async () => {
    if (!nombre.trim()) {
      toast({ status: 'warning', title: 'Ingresá un nombre' });
      return;
    }
    try {
      if (editingId != null) {
        const { data: updated } = await api.put<Marca>(`/api/marcas/${editingId}`, { nombre: nombre.trim() });
        setMarcas(prev => prev.map(m => (m.id === updated.id ? updated : m)));
        toast({ status: 'success', title: 'Marca actualizada' });
      } else {
        const { data: created } = await api.post<Marca>('/api/marcas', { nombre: nombre.trim() });
        setMarcas(prev => [created, ...prev]);
        toast({ status: 'success', title: 'Marca creada' });
      }
      onClose();
    } catch (e: any) {
      toast({ status: 'error', title: 'No se pudo guardar', description: e?.message });
    }
  };

  const handleDelete = async (id: number | string) => {
    try {
      await api.delete(`/api/marcas/${id}`);
      setMarcas(prev => prev.filter(m => m.id !== id));
    } catch (e: any) {
      toast({ status: 'error', title: 'Error al eliminar, la marca tiene productos referenciando' });
    }
  };

  return (
    <Box bg="#f6f6f6" minH="100dvh">
      <Container maxW="container.lg" pt={10} px={{ base: 4, md: 6 }}>
        <HStack justify="space-between" align="center" mb={4}>
          <Text fontSize="30px" fontWeight={600}>Marcas</Text>
          <IconButton
            aria-label="Agregar marca"
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
          <Box borderWidth="1px" borderRadius="md" overflow="hidden">
            <Table variant="simple" size="md">
              <Tbody>
                {sorted.map(m => (
                  <Tr key={m.id} bg="white" _hover={{ bg: 'gray.50' }}>
                    <Td fontWeight={500}>{m.nombre}</Td>
                    <Td isNumeric w="0">
                      <Menu placement="bottom-end">
                        <MenuButton
                          as={IconButton}
                          aria-label="Acciones"
                          icon={<MoreVertical size={18} />}
                          variant="ghost"
                        />
                        <MenuList>
                          <MenuItem onClick={() => openEdit(m)}>Editar</MenuItem>
                          <MenuItem color="red.500" onClick={() => handleDelete(m.id)}>Eliminar</MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
                {sorted.length === 0 && (
                  <Tr bg="white">
                    <Td colSpan={2}>
                      <Text color="gray.500">No hay marcas todavía.</Text>
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
          <ModalHeader>{editingId != null ? 'Editar marca' : 'Nueva marca'}</ModalHeader>
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Nombre</FormLabel>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Apple, Samsung, Asus…"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>Cancelar</Button>
            <Button colorScheme="blue" onClick={handleSave}>
              {editingId != null ? 'Guardar cambios' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
