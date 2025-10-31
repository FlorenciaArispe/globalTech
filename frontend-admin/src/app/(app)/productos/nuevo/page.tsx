'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box, Container, Text, SimpleGrid, FormControl, FormLabel, Select, Button,
  HStack, Input, Switch, useToast, IconButton, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalBody, ModalFooter, Checkbox, Spinner,
  AlertDialog
} from '@chakra-ui/react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';

type Id = number | string;
type Categoria = { id: Id; nombre: string };
type Marca = { id: Id; nombre: string };

type Modelo = {
  id: Id;
  nombre: string;
  categoriaId: Id;
  marcaId: Id;
  trackeaUnidad: boolean;   // <— antes: trackeaImei
  requiereColor: boolean;
  requiereCapacidad: boolean;
};

type Color = { id: Id; nombre: string };
type Capacidad = { id: Id; etiqueta: string };


export default function NuevoProductoPage() {
  const toast = useToast();
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [colores, setColores] = useState<Color[]>([]);
  const [capacidades, setCapacidades] = useState<Capacidad[]>([]);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [nuevoColorNombre, setNuevoColorNombre] = useState('');
  const [creatingColor, setCreatingColor] = useState(false);
  const [isCapOpen, setIsCapOpen] = useState(false);
  const [nuevaCapEtiqueta, setNuevaCapEtiqueta] = useState('');
  const [creatingCap, setCreatingCap] = useState(false);
  const [loadingBase, setLoadingBase] = useState(true);
  const [loadingModelos, setLoadingModelos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categoriaId, setCategoriaId] = useState<Id>('');
  const [marcaId, setMarcaId] = useState<Id>('');
  const [modeloId, setModeloId] = useState<Id | 'new'>('');
  const [precioBase, setPrecioBase] = useState<string>(''); // string para permitir coma/punto
  // arriba, junto con otros useState
  const [isMarcaOpen, setIsMarcaOpen] = useState(false);
  const [nuevaMarcaNombre, setNuevaMarcaNombre] = useState('');
  const [creatingMarca, setCreatingMarca] = useState(false);


  const isNewModelo = modeloId === 'new' || !modeloId;

  const selectedModelo = useMemo(() => {
    if (isNewModelo) return undefined;
    return modelos.find(m => String(m.id) === String(modeloId));
  }, [isNewModelo, modeloId, modelos]);

  const [colorId, setColorId] = useState<Id>('');
  const [capacidadId, setCapacidadId] = useState<Id>('');
  const [sku, setSku] = useState('');
  const [activo, setActivo] = useState(true);

  const [isModeloOpen, setIsModeloOpen] = useState(false);
  const [nuevoModeloNombre, setNuevoModeloNombre] = useState('');
  const [nuevoModeloTrackeaUnidad, setNuevoModeloTrackeaUnidad] = useState(false);
  const [nuevoModeloReqColor, setNuevoModeloReqColor] = useState(false);
  const [nuevoModeloReqCap, setNuevoModeloReqCap] = useState(false);
  const [creatingModelo, setCreatingModelo] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [cats, mks, cols, caps] = await Promise.all([
          api.get<Categoria[]>('/api/categorias'),
          api.get<Marca[]>('/api/marcas'),
          api.get<Color[]>('/api/colores'),
          api.get<Capacidad[]>('/api/capacidades'),
        ]);
        if (!alive) return;
        setCategorias(cats.data);
        setMarcas(mks.data);
        setColores(cols.data);
        setCapacidades(caps.data);
      } catch (e: any) {
        const status = e?.response?.status;
        if (status === 401) {
          router.replace('/login?next=/productos/nuevo');
          return;
        }
        toast({
          status: 'error',
          title: 'Error cargando datos',
          description: e?.response?.data?.message ?? e?.message,
        });
      } finally {
        if (alive) setLoadingBase(false);
      }
    })();

    return () => { alive = false; };
  }, [router, toast]);

  useEffect(() => {
    const hasFilters = categoriaId && marcaId;
    if (!hasFilters) {
      setModelos([]);
      setModeloId('');
      return;
    }
    let alive = true;
    setLoadingModelos(true);
    (async () => {
      try {
        const { data } = await api.get<Modelo[]>(`/api/modelos`, {
          params: { categoriaId, marcaId },
        });
        if (!alive) return;
        setModelos(data);
      } catch (e: any) {
        toast({
          status: 'error',
          title: 'No se pudieron cargar los modelos',
          description: e?.response?.data?.message ?? e?.message,
        });
      } finally {
        if (alive) setLoadingModelos(false);
      }
    })();
    return () => { alive = false; };
  }, [categoriaId, marcaId, toast]);

  useEffect(() => {
    setColorId('');
    setCapacidadId('');
    setSku('');
    setActivo(true);
  }, [modeloId]);

  const requiereColor = isNewModelo ? nuevoModeloReqColor : !!selectedModelo?.requiereColor;
  const requiereCapacidad = isNewModelo ? nuevoModeloReqCap : !!selectedModelo?.requiereCapacidad;

  const openCrearModelo = () => {
    if (!categoriaId || !marcaId) {
      toast({ status: 'warning', title: 'Elegí categoría y marca primero' });
      return;
    }
    setNuevoModeloNombre('');
    setNuevoModeloTrackeaUnidad(false);
    setNuevoModeloReqColor(false);
    setNuevoModeloReqCap(false);
    setIsModeloOpen(true);
  };

  const handleCrearModelo = async () => {
    console.log("entre")
    if (!categoriaId || !marcaId || !nuevoModeloNombre.trim()) {
      toast({ status: 'warning', title: 'Completá categoría, marca y nombre' });
      return;
    }

    setCreatingModelo(true);
    try {
      const payload = {
        categoriaId: Number(categoriaId),
        marcaId: Number(marcaId),
        nombre: nuevoModeloNombre.trim(),
        trackeaUnidad: Boolean(nuevoModeloTrackeaUnidad), 
        requiereColor: Boolean(nuevoModeloReqColor),
        requiereCapacidad: Boolean(nuevoModeloReqCap),
      };

      console.log("payload", payload)
      const token = localStorage.getItem('jwt');
      const resp = await api.post('/api/modelos', payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (resp.status === 201) {
        const creado = resp.data as Modelo;
        setModelos(prev => [creado, ...prev]);
        setModeloId(creado.id as any);
        setIsModeloOpen(false);
        toast({ status: 'success', title: 'Modelo creado' });
      } else {
        toast({ status: 'error', title: `Respuesta inesperada (${resp.status})` });
        console.log('POST /api/modelos resp', resp);
      }
    } catch (e: any) {
      const status = e?.response?.status;
      console.log('POST /api/modelos error', status, e?.response?.data);

      if (status === 401) {
        toast({ status: 'error', title: 'Sesión expirada' });
        router.replace('/login?next=/productos/nuevo');
        return;
      }
      if (status === 403) {
        toast({ status: 'error', title: 'Sin permisos', description: 'Necesitás rol ADMIN para crear modelos.' });
        return;
      }

      toast({
        status: 'error',
        title: 'No se pudo crear el modelo',
        description: e?.response?.data?.message ?? e?.message,
      });
    } finally {
      setCreatingModelo(false);
    }
  };

  const openCrearCapacidad = () => {
    setNuevaCapEtiqueta('');
    setIsCapOpen(true);
  };

  const handleCrearMarca = async () => {
    if (!nuevaMarcaNombre.trim()) {
      toast({ status: 'warning', title: 'Ingresá un nombre de marca' });
      return;
    }
    setCreatingMarca(true);
    try {
      const payload = { nombre: nuevaMarcaNombre.trim() };
      const { data: created } = await api.post<Marca>('/api/marcas', payload);
      setMarcas(prev => [created, ...prev]);
      setMarcaId(String(created.id));
      setIsMarcaOpen(false);
      toast({ status: 'success', title: 'Marca creada' });
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 409) {
        toast({ status: 'error', title: 'Duplicado', description: 'Ya existe una marca con ese nombre.' });
      } else if (status === 401) {
        toast({ status: 'error', title: 'Sesión expirada' });
        router.replace('/login?next=/productos/nuevo');
      } else if (status === 403) {
        toast({ status: 'error', title: 'Sin permisos', description: 'Necesitás rol ADMIN para crear marcas.' });
      } else {
        toast({ status: 'error', title: 'No se pudo crear la marca', description: e?.response?.data?.message ?? e?.message });
      }
    } finally {
      setCreatingMarca(false);
    }
  };

  const handleCrearCapacidad = async () => {
    if (!nuevaCapEtiqueta.trim()) {
      toast({ status: 'warning', title: 'Ingresá una etiqueta (ej: 128GB)' });
      return;
    }
    setCreatingCap(true);
    try {
      const payload = { etiqueta: nuevaCapEtiqueta.trim() };
      const token = localStorage.getItem('jwt');
      const resp = await api.post('/api/capacidades', payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (resp.status === 201) {
        const creado = resp.data as Capacidad;
        setCapacidades(prev => [creado, ...prev]);
        setCapacidadId(String(creado.id));
        setIsCapOpen(false);
        toast({ status: 'success', title: 'Capacidad creada' });
      } else {
        toast({ status: 'error', title: `Respuesta inesperada (${resp.status})` });
        console.log('POST /api/capacidades', resp.status, resp.data);
      }
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) {
        toast({ status: 'error', title: 'Sesión expirada' });
        router.replace('/login?next=/productos/nuevo');
        return;
      }
      if (status === 403) {
        toast({ status: 'error', title: 'Sin permisos', description: 'Necesitás rol ADMIN para crear capacidades.' });
        return;
      }
      if (status === 409) {
        toast({ status: 'error', title: 'Duplicado', description: 'Ya existe una capacidad con esa etiqueta.' });
        return;
      }
      toast({
        status: 'error',
        title: 'No se pudo crear la capacidad',
        description: e?.response?.data?.message ?? e?.message,
      });
    } finally {
      setCreatingCap(false);
    }
  };

  function parsePrecio(v: string): number | null {
    if (!v) return null;
    const normalized = v.replace(/\./g, '').replace(',', '.'); // “1.234,56” → “1234.56”
    const n = Number(normalized);
    return Number.isFinite(n) && n >= 0 ? n : null;
  }


  const handleCrearVariante = async () => {
    if (!categoriaId || !marcaId) {
      toast({ status: 'warning', title: 'Seleccioná categoría y marca' });
      return;
    }
    if (!modeloId || modeloId === 'new') {
      toast({ status: 'warning', title: 'Seleccioná un modelo (o crealo)' });
      return;
    }
    if (requiereColor && !colorId) {
      toast({ status: 'warning', title: 'Seleccioná color' });
      return;
    }
    if (requiereCapacidad && !capacidadId) {
      toast({ status: 'warning', title: 'Seleccioná capacidad' });
      return;
    }
    const precio = parsePrecio(precioBase);
    if (precio == null) {
      toast({ status: 'warning', title: 'Precio base inválido', description: 'Usá números, con punto o coma.' });
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/variantes', {
        modeloId: Number(modeloId),
        colorId: requiereColor ? Number(colorId) : null,
        capacidadId: requiereCapacidad ? Number(capacidadId) : null,
        precioBase: Number(precio),
      });
      toast({ status: 'success', title: 'Variante creada' });
      router.replace('/productos');
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 409) {
        toast({ status: 'error', title: 'Duplicado', description: 'Ya existe una variante con esa combinación.' });
      } else {
        toast({ status: 'error', title: 'No se pudo crear la variante', description: e?.response?.data?.message ?? e?.message });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingBase) {
    return (
      <Box bg="#f6f6f6" minH="100dvh">
        <Container maxW="container.lg" pt={10} px={{ base: 4, md: 6 }}>
          <Box py={16} textAlign="center"><Spinner /></Box>
        </Container>
      </Box>
    );
  }

  const openCrearColor = () => {
    setNuevoColorNombre('');
    setIsColorOpen(true);
  };

  const handleCrearColor = async () => {
    if (!nuevoColorNombre.trim()) {
      toast({ status: 'warning', title: 'Ingresá un nombre de color' });
      return;
    }

    setCreatingColor(true);
    try {
      const payload = { nombre: nuevoColorNombre.trim() };

      const token = localStorage.getItem('jwt');
      const resp = await api.post('/api/colores', payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (resp.status === 201) {
        const creado = resp.data as Color;
        setColores(prev => [{ id: creado.id, nombre: creado.nombre }, ...prev]);
        setColorId(String(creado.id));
        setIsColorOpen(false);
        toast({ status: 'success', title: 'Color creado' });
      } else {
        toast({ status: 'error', title: `Respuesta inesperada (${resp.status})` });
        console.log('POST /api/colores', resp.status, resp.data);
      }
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) {
        toast({ status: 'error', title: 'Sesión expirada' });
        router.replace('/login?next=/productos/nuevo');
        return;
      }
      if (status === 403) {
        toast({ status: 'error', title: 'Sin permisos', description: 'Necesitás rol ADMIN para crear colores.' });
        return;
      }
      toast({
        status: 'error',
        title: 'No se pudo crear el color',
        description: e?.response?.data?.message ?? e?.message,
      });
    } finally {
      setCreatingColor(false);
    }
  };

  return (
    <Box bg="#f6f6f6" minH="100dvh">
      <Container maxW="container.lg" pt={10} px={{ base: 4, md: 6 }}>
        <HStack justify="space-between" mb={4}>
          <HStack>
            <IconButton
              aria-label="Volver"
              icon={<ArrowLeft size={18} />}
              variant="ghost"
              onClick={() => router.back()}
            />
            <Text fontSize="30px" fontWeight={600}>Nuevo producto</Text>
          </HStack>
          <HStack>
            <IconButton
              aria-label="Crear modelo"
              icon={<Plus size={18} />}
              onClick={openCrearModelo}
              variant="outline"
              colorScheme="blue"
              size="sm"
            />
          </HStack>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} bg="white" p={4} borderRadius="md" borderWidth="1px">

          <FormControl isRequired>
            <FormLabel>Categoría</FormLabel>
            <Select placeholder="Elegí categoría" value={String(categoriaId)} onChange={(e) => setCategoriaId(e.target.value)}>
              {categorias.map(c => <option key={c.id} value={String(c.id)}>{c.nombre}</option>)}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Marca</FormLabel>
            <Select
              placeholder="Elegí marca"
              value={String(marcaId)}
              onChange={(e) => {
                const v = e.target.value;
                if (v === 'new-marca') {
                  // limpiar y abrir modal
                  setNuevaMarcaNombre('');
                  setIsMarcaOpen(true);
                  return;
                }
                setMarcaId(v);
              }}
            >
              {marcas.map(m => (
                <option key={m.id} value={String(m.id)}>{m.nombre}</option>
              ))}
              <option value="new-marca">➕ Crear nueva marca…</option>
            </Select>
          </FormControl>

          <FormControl isRequired isDisabled={!categoriaId || !marcaId}>
            <FormLabel>Modelo</FormLabel>
            <HStack align="start">
              <Select
                flex="1"
                placeholder={loadingModelos ? 'Cargando modelos…' : 'Elegí modelo'}
                value={modeloId === 'new' ? 'new' : String(modeloId || '')}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === 'new') {
                    setModeloId('new');
                    openCrearModelo();
                  } else {
                    setModeloId(v);
                  }
                }}
              >
                {modelos.map(m => (
                  <option key={m.id} value={String(m.id)}>
                    {m.nombre}
                  </option>
                ))}
                <option value="new">➕ Crear nuevo modelo…</option>
              </Select>
            </HStack>
          </FormControl>

          {requiereColor && (
            <FormControl isRequired>
              <FormLabel>Color</FormLabel>
              <Select
                placeholder="Elegí color"
                value={String(colorId)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === 'new-color') {
                    openCrearColor();
                    return;
                  }
                  setColorId(v);
                }}
              >
                {colores.map(c => (
                  <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                ))}
                <option value="new-color">➕ Crear nuevo color…</option>
              </Select>
            </FormControl>
          )}

          {requiereCapacidad && (
            <FormControl isRequired>
              <FormLabel>Capacidad</FormLabel>
              <Select
                placeholder="Elegí capacidad"
                value={String(capacidadId)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === 'new-cap') {
                    openCrearCapacidad();
                    return;
                  }
                  setCapacidadId(v);
                }}
              >
                {capacidades.map(c => (
                  <option key={c.id} value={String(c.id)}>
                    {('etiqueta' in c ? (c as any).etiqueta : (c as any).nombre)}
                  </option>
                ))}
                <option value="new-cap">➕ Crear nueva capacidad…</option>
              </Select>
            </FormControl>
          )}

          <FormControl isRequired>
            <FormLabel>Precio base</FormLabel>
            <Input
              placeholder="Ej: 999999.99"
              value={precioBase}
              onChange={(e) => setPrecioBase(e.target.value)}
              inputMode="decimal"
            />
          </FormControl>

        </SimpleGrid>

        <HStack justify="flex-end" mt={4}>
          <Button variant="ghost" onClick={() => router.back()}>Cancelar</Button>
          <Button colorScheme="blue" onClick={handleCrearVariante} isLoading={submitting}>Crear producto</Button>
        </HStack>
      </Container>

      <Modal isOpen={isModeloOpen} onClose={() => setIsModeloOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nuevo modelo</ModalHeader>
          <ModalBody>
            <SimpleGrid columns={{ base: 1 }} spacing={3}>
              <FormControl isRequired>
                <FormLabel>Nombre del modelo</FormLabel>
                <Input
                  value={nuevoModeloNombre}
                  onChange={(e) => setNuevoModeloNombre(e.target.value)}
                  placeholder="Ej: iPhone 13, Galaxy S22, Zenbook..."
                />
              </FormControl>
              <Checkbox isChecked={nuevoModeloTrackeaUnidad} onChange={(e) => setNuevoModeloTrackeaUnidad(e.target.checked)}>
                Tiene IMEI
              </Checkbox>
              <Checkbox isChecked={nuevoModeloReqColor} onChange={(e) => setNuevoModeloReqColor(e.target.checked)}>
                Requiere color
              </Checkbox>
              <Checkbox isChecked={nuevoModeloReqCap} onChange={(e) => setNuevoModeloReqCap(e.target.checked)}>
                Requiere capacidad
              </Checkbox>
            </SimpleGrid>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={() => setIsModeloOpen(false)}>Cancelar</Button>
            <Button colorScheme="blue"
              onClick={() => {
                handleCrearModelo();
              }}
              isLoading={creatingModelo}>
              Crear modelo
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isColorOpen} onClose={() => setIsColorOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nuevo color</ModalHeader>
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Nombre del color</FormLabel>
              <Input
                value={nuevoColorNombre}
                onChange={(e) => setNuevoColorNombre(e.target.value)}
                placeholder="Ej: Negro, Blanco, Azul medianoche…"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={() => setIsColorOpen(false)}>Cancelar</Button>
            <Button colorScheme="blue" onClick={handleCrearColor} isLoading={creatingColor}>
              Crear color
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isCapOpen} onClose={() => setIsCapOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nueva capacidad</ModalHeader>
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Etiqueta</FormLabel>
              <Input
                value={nuevaCapEtiqueta}
                onChange={(e) => setNuevaCapEtiqueta(e.target.value)}
                placeholder="Ej: 64GB, 128GB, 256GB…"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={() => setIsCapOpen(false)}>Cancelar</Button>
            <Button colorScheme="blue" onClick={handleCrearCapacidad} isLoading={creatingCap}>
              Crear capacidad
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isMarcaOpen} onClose={() => setIsMarcaOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nueva marca</ModalHeader>
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Nombre de la marca</FormLabel>
              <Input
                value={nuevaMarcaNombre}
                onChange={(e) => setNuevaMarcaNombre(e.target.value)}
                placeholder="Ej: Apple, Samsung, Sony…"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={() => setIsMarcaOpen(false)}>Cancelar</Button>
            <Button colorScheme="blue" onClick={handleCrearMarca} isLoading={creatingMarca}>
              Crear marca
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
}