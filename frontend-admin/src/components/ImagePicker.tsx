'use client';
import { Box, FormControl, FormLabel, HStack, Image, Text, IconButton } from '@chakra-ui/react';
import { X } from 'lucide-react';
import { useRef } from 'react';

export type PickedFile = { file: File; alt?: string };

export default function ImagePicker({
  label,
  files,
  setFiles,
  max = 3,
}: {
  label: string;
  files: PickedFile[];
  setFiles: (f: PickedFile[]) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onChoose = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;
    const next = [...files, ...selected.map((f) => ({ file: f }))].slice(0, max);
    setFiles(next);
    e.target.value = '';
  };

  const removeAt = (idx: number) => {
    const next = [...files];
    next.splice(idx, 1);
    setFiles(next);
  };

  return (
    <FormControl>
      <FormLabel>{label} <Text as="span" color="gray.500" fontSize="sm">({files.length}/{max})</Text></FormLabel>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={onChoose}
      />
      <Box
        border="1px dashed"
        borderColor="gray.300"
        borderRadius="md"
        p={4}
        cursor="pointer"
        onClick={() => inputRef.current?.click()}
        _hover={{ bg: 'gray.50' }}
      >
        <Text color="gray.600">Hacé click para elegir imágenes (máx {max})</Text>
      </Box>

      <HStack mt={3} spacing={3} wrap="wrap">
        {files.map((pf, i) => (
          <Box key={i} position="relative" w="96px" h="96px" borderRadius="md" overflow="hidden" borderWidth="1px">
            <Image src={URL.createObjectURL(pf.file)} alt={pf.alt || `img-${i}`} w="100%" h="100%" objectFit="cover" />
            <IconButton
              aria-label="Quitar"
              icon={<X size={14} />}
              size="xs"
              variant="solid"
              colorScheme="red"
              position="absolute"
              top="4px"
              right="4px"
              onClick={(e) => {
                e.stopPropagation();
                removeAt(i);
              }}
            />
          </Box>
        ))}
      </HStack>
    </FormControl>
  );
}
