'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, SimpleGrid, IconButton, useDisclosure, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea,
  HStack, Text, useToast, VisuallyHidden, chakra,
  Spinner
} from '@chakra-ui/react';
import { Plus, Trash2, Edit3, Check } from 'lucide-react';
import { api } from '@/lib/axios';

type Note = {
  id: string;
  text: string;
  color: string;
  tilt: number;
  createdAt: string;
  updatedAt: string;
};

const PASTELS = [
  '#FFF4A3',
  '#FFD1DC',
  '#BDE0FE',
  '#C6F6D5',
  '#E9D8FD',
  '#FBD38D',
  '#FEEBC8',
  '#BEE3F8',
];

export default function StickyNotesBoard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [draftText, setDraftText] = useState('');
  const [draftColor, setDraftColor] = useState(PASTELS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const toast = useToast();
  const createModal = useDisclosure();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get<Note[]>('/api/notes');
        if (alive) setNotes(data);
      } catch (e: any) {
        toast({ status: 'error', title: 'No se pudieron cargar las notas', description: e?.message });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [toast]);

  const sorted = useMemo(
    () => [...notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notes]
  );

  const openCreate = () => {
    setEditingId(null);
    setDraftText('');
    setDraftColor(PASTELS[0]);
    createModal.onOpen();
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setDraftText(note.text);
    setDraftColor(note.color);
    createModal.onOpen();
  };

  const handleAdd = async () => {
    if (!draftText.trim()) {
      toast({ status: 'warning', title: 'Escribí algo en la nota' });
      return;
    }
    try {
      const tilt = (Math.random() * 2 - 1.0) * 1.5;
      const { data: created } = await api.post<Note>('/api/notes', {
        text: draftText.trim(),
        color: draftColor,
        tilt,
      });
      setNotes(prev => [created, ...prev]);
      createModal.onClose();
      toast({ status: 'success', title: 'Nota agregada' });
    } catch (e: any) {
      toast({ status: 'error', title: 'No se pudo crear la nota', description: e?.message });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    if (!draftText.trim()) {
      toast({ status: 'warning', title: 'La nota no puede estar vacía' });
      return;
    }
    try {
      const { data: updated } = await api.put<Note>(`/api/notes/${editingId}`, {
        text: draftText.trim(),
        color: draftColor,
      });
      setNotes(prev => prev.map(n => (n.id === updated.id ? updated : n)));
      setEditingId(null);
      createModal.onClose();
      toast({ status: 'success', title: 'Nota actualizada' });
    } catch (e: any) {
      toast({ status: 'error', title: 'No se pudo actualizar la nota', description: e?.message });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/notes/${id}`);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (e: any) {
      toast({ status: 'error', title: 'No se pudo eliminar la nota', description: e?.message });
    }
  };

  return (
    <Box

      p={{ base: 3, md: 4 }}
      position="relative"
      minH="300px"
    >
      <HStack justify="space-between" mb={3}>
        <Text fontSize="lg" fontWeight="bold">Mis notas</Text>
        <IconButton
          aria-label="Agregar nota"
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
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={3}>
          {sorted.map((note) => (
            <StickyNoteCard
              key={note.id}
              note={note}
              onDelete={() => handleDelete(note.id)}
              onEdit={() => startEdit(note)}
            />
          ))}
        </SimpleGrid>
      )}

      <Modal
        isOpen={createModal.isOpen}
        onClose={() => { setEditingId(null); createModal.onClose(); }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingId ? 'Editar nota' : 'Nueva nota'}</ModalHeader>
          <ModalBody>
            <Text mb={2} fontSize="sm" color="gray.500">Color</Text>
            <ColorSwatches
              colors={PASTELS}
              value={draftColor}
              onChange={setDraftColor}
            />
            <Textarea
              mt={4}
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder="Escribí tu recordatorio…"
              rows={5}
              bg="white"
            />
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={() => { setEditingId(null); createModal.onClose(); }}>
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<Check size={16} />}
              onClick={editingId ? handleSaveEdit : handleAdd}
            >
              {editingId ? 'Guardar cambios' : 'Agregar'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

function StickyNoteCard({
  note,
  onDelete,
  onEdit,
}: {
  note: Note;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <Box
      bg={note.color}
      borderRadius="md"
      boxShadow="md"
      p={3}
      pl={5}
      minH="140px"
      position="relative"
      overflow="hidden"
      transform={`rotate(${note.tilt}deg)`}
      transition="transform 0.15s ease"
      _hover={{ transform: `rotate(${note.tilt}deg) translateY(-2px)` }}
    >

      <HStack spacing={1} position="absolute" top="6px" right="6px" zIndex={1}>
        <IconButton
          aria-label="Editar nota"
          icon={<Edit3 size={14} />}
          size="xs"
          variant="ghost"
          onClick={onEdit}
          _hover={{ bg: 'transparent', color: 'inherit' }}
          _active={{ bg: 'transparent' }}
          _focusVisible={{ boxShadow: 'none' }}
        />

        <IconButton
          aria-label="Eliminar nota"
          icon={<Trash2 size={14} />}
          size="xs"
          variant="ghost"
          onClick={onDelete}
          _hover={{ bg: 'transparent', color: 'inherit' }}
          _active={{ bg: 'transparent' }}
          _focusVisible={{ boxShadow: 'none' }}
        />
      </HStack>

      <Text mt={6} whiteSpace="pre-wrap">
        {note.text}
      </Text>
    </Box>
  );
}

function ColorSwatches({
  colors,
  value,
  onChange,
}: {
  colors: string[];
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <HStack wrap="wrap" spacing={2}>
      {colors.map((c) => (
        <Swatch
          key={c}
          color={c}
          selected={value === c}
          onClick={() => onChange(c)}
        />
      ))}
    </HStack>
  );
}

function Swatch({
  color,
  selected,
  onClick,
}: {
  color: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      as="button"
      w="28px"
      h="28px"
      borderRadius="md"
      bg={color}
      borderWidth={selected ? '2px' : '1px'}
      borderColor={selected ? 'blue.500' : 'gray.200'}
      boxShadow={selected ? '0 0 0 2px rgba(66,153,225,0.4)' : 'none'}
      aria-pressed={selected}
      title={color}
      onClick={onClick}
    >
      <VisuallyHidden>
        <chakra.span>{selected ? 'Seleccionado' : 'Elegir'} {color}</chakra.span>
      </VisuallyHidden>
    </Box>
  );
}
