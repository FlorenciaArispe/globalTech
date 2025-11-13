'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box, Container, Text, HStack, IconButton, Table, Tbody, Tr, Td,
  Spinner, useToast, Menu, MenuButton, MenuList, MenuItem,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, FormControl, FormLabel, Input,
} from '@chakra-ui/react';
import { Plus, MoreVertical } from 'lucide-react';
import { api } from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';

type Categoria = {
  id: string;
  nombre: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function CategoriasPage() {
  const toast = useToast();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const router = useRouter();

  useEffect(() => {
    let alive = true;

    const token = getToken();
    console.log("TOKEN CATEGORIAS", token)
    if (!token) {
      router.replace('/login'); 
      return;
    }

    (async () => {
      try {
        const { data } = await api.get<Categoria[]>('/api/categorias'); 
        if (alive) setCategorias(data);
      } catch (e: any) {
        console.log('status', e?.response?.status, 'data', e?.response?.data);
        toast({
          status: 'error',
          title: 'No se pudieron cargar las categorías',
          description: e?.response?.data?.message ?? e?.message,
        });
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [router, toast]);

  const sorted = useMemo(
    () => [...categorias].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [categorias]
  );

  const openCreate = () => {
    setEditingId(null);
    setNombre('');
    setIsOpen(true);
  };

  const openEdit = (cat: Categoria) => {
    setEditingId(cat.id);
    setNombre(cat.nombre);
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
      if (editingId) {
        const { data: updated } = await api.put<Categoria>(`/api/categorias/${editingId}`, { nombre: nombre.trim() });
        setCategorias(prev => prev.map(c => (c.id === updated.id ? updated : c)));
        toast({ status: 'success', title: 'Categoría actualizada' });
      } else {
        const { data: created } = await api.post<Categoria>('/api/categorias', { nombre: nombre.trim() });
        setCategorias(prev => [created, ...prev]);
        toast({ status: 'success', title: 'Categoría creada' });
      }

      onClose();
    } catch (e: any) {
      toast({ status: 'error', title: 'No se pudo guardar', description: e?.message });
    }
  };

  const handleDelete = async (id: number | string) => {
    try {
      await api.delete(`/api/categorias/${id}`);
      setCategorias(prev => prev.filter(m => m.id !== id));
    } catch (e: any) {
      toast({ status: 'error', title: 'Error al eliminar, la categoría tiene productos referenciando' });
    }
  };

  return (
    <Box bg="#f6f6f6" minH="100dvh">
      <Container maxW="container.lg" pt={10} px={{ base: 4, md: 6 }}>
        <HStack justify="space-between" align="center" mb={4}>
          <Text fontSize="30px" fontWeight={600}>Categorías</Text>
          <IconButton
            aria-label="Agregar categoría"
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
                {sorted.map(cat => (
                  <Tr key={cat.id} bg="white" _hover={{ bg: 'gray.50' }}>
                    <Td fontWeight={500}>{cat.nombre}</Td>
                    <Td isNumeric w="0">
                      <Menu placement="bottom-end">
                        <MenuButton
                          as={IconButton}
                          aria-label="Acciones"
                          icon={<MoreVertical size={18} />}
                          variant="ghost"
                        />
                        <MenuList>
                          <MenuItem onClick={() => openEdit(cat)}>Editar</MenuItem>
                          <MenuItem color="red.500" onClick={() => handleDelete(cat.id)}>Eliminar</MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
                {sorted.length === 0 && (
                  <Tr bg="white">
                    <Td colSpan={2}>
                      <Text color="gray.500">No hay categorías todavía.</Text>
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
          <ModalHeader>{editingId ? 'Editar categoría' : 'Nueva categoría'}</ModalHeader>
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Nombre</FormLabel>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: iPhone, Accesorios, Macs…"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>Cancelar</Button>
            <Button colorScheme="blue" onClick={handleSave}>
              {editingId ? 'Guardar cambios' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
