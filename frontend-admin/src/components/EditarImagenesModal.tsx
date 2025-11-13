'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  Tabs, TabList, Tab, TabPanels, TabPanel,
  Box, HStack, VStack, Image, Text, IconButton, Button, Input, SimpleGrid, useToast, Spinner,
  ModalCloseButton,
  Flex
} from '@chakra-ui/react';
import { Trash2, Upload } from 'lucide-react';
import {
  getVarianteImagenes,
  deleteVarianteImage,
  type ImagenSet,
  type VarianteImagenListDTO,
  addVarianteImages,
} from '@/lib/uploadImages';

const SETS_TRACKED: ImagenSet[] = ['SELLADO', 'USADO'];
const SETS_UNTRACKED: ImagenSet[] = ['CATALOGO'];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  varianteId: number;
  trackeaUnidad: boolean;
  onChanged?: () => void;
};

export default function EditarImagenesModal({ ...props }: Props) {
  const { isOpen, onClose, varianteId, trackeaUnidad, onChanged } = props;
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VarianteImagenListDTO | null>(null);
  type Pick = { file: File; alt?: string };
  const [pending, setPending] = useState<Record<ImagenSet, Pick[]>>({
    SELLADO: [], USADO: [], CATALOGO: []
  });
  const [tabIndex, setTabIndex] = useState(0);

  const sets = useMemo(
    () => (trackeaUnidad ? SETS_TRACKED : SETS_UNTRACKED),
    [trackeaUnidad]
  );

  const refresh = async () => {
    setLoading(true);
    try {
      const d = await getVarianteImagenes(varianteId);
      setData(d);
    } catch (e: any) {
      toast({ status: 'error', title: 'No se pudieron cargar las imágenes', description: e?.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTabIndex(0);
      setPending({ SELLADO: [], USADO: [], CATALOGO: [] });
      refresh();
    }
  }, [isOpen, varianteId]);

  const handlePickFiles = (set: ImagenSet, files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 3);
    setPending(prev => ({ ...prev, [set]: arr.map(f => ({ file: f })) }));
  };

  const handleDelete = async (imagenId: number) => {
    try {
      await deleteVarianteImage(varianteId, imagenId);
      toast({ status: 'success', title: 'Imagen eliminada' });
      await refresh();
      onChanged?.();
    } catch (e: any) { }
  };

  const handleAppendToSet = async (set: ImagenSet) => {
    const picks = pending[set] ?? [];
    try {
      await addVarianteImages(varianteId, set, picks);
      toast({ status: 'success', title: `Agregadas a ${set}` });
      await refresh();
      setPending(prev => ({ ...prev, [set]: [] }));
      onChanged?.();
    } catch (e: any) { }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader>Editar imágenes</ModalHeader>
        <ModalBody>
          {loading || !data ? (
            <Box py={12} textAlign="center"><Spinner /></Box>
          ) : (
            <Tabs
              variant="enclosed"
              index={tabIndex}
              onChange={(i) => setTabIndex(i)}
            >
              <TabList>
                {sets.map(s => <Tab key={s}>{s}</Tab>)}
              </TabList>
              <TabPanels>
                {sets.map(s => {
                  const actuales = data.sets?.[s] ?? [];
                  const picks = pending[s] ?? [];
                  return (
                    <TabPanel key={s}>

                      <Text fontWeight="semibold" mb={2}>Actuales</Text>
                      {actuales.length === 0 ? (
                        <Text color="gray.500" mb={4}>Sin imágenes en {s}.</Text>
                      ) : (
                        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mb={6}>
                          {actuales.map(img => (
                            <Box key={img.id} borderWidth="1px" borderRadius="md" p={2}>
                              <Image src={img.url} alt={img.altText ?? ''} borderRadius="md" objectFit="cover" w="100%" h="140px" />
                              <VStack align="start" spacing={1} mt={2}>
                                <Text fontSize="xs" color="gray.600">orden: {img.orden} {img.principal ? '· principal' : ''}</Text>
                                {img.altText && <Text fontSize="xs" noOfLines={1} title={img.altText}>alt: {img.altText}</Text>}
                              </VStack>
                              <HStack mt={2} justify="flex-end">
                                <IconButton
                                  aria-label="Eliminar"
                                  icon={<Trash2 size={16} />}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(img.id)}
                                />
                              </HStack>
                            </Box>
                          ))}
                        </SimpleGrid>
                      )}

                      <Text fontWeight="semibold" mb={4}>Subir nueva imágen</Text>
                      <Flex direction={"row"} alignItems={"center"} gap={3} borderWidth="1px" borderRadius="md" p={3}>
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          multiple
                          onChange={e => handlePickFiles(s, e.target.files)}
                        />

                        <Button
                          onClick={() => handleAppendToSet(s)}
                          leftIcon={<Upload size={16} />}
                          size="sm"
                          colorScheme="blue"
                          isDisabled={(pending[s] ?? []).length === 0}
                        >
                          Agregar
                        </Button>

                      </Flex>
                      <Text fontSize="xs" color="gray.500">
                        Máximo 3 imágenes
                      </Text>
                    </TabPanel>
                  );
                })}
              </TabPanels>
            </Tabs>
          )}
        </ModalBody>

      </ModalContent>
    </Modal>
  );
}
