'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box, Container, Text, SimpleGrid, FormControl, FormLabel, Select, Button,
  HStack, Input, Switch, useToast, IconButton, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalBody, ModalFooter, Checkbox, Spinner
} from '@chakra-ui/react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';
import { getToken } from '@/lib/auth';

type Id = number | string;

// ====== Tipos básicos (ajustá a tus DTO reales) ======
type Categoria = { id: Id; nombre: string };
type Marca     = { id: Id; nombre: string };

// Incluyo flags en Modelo para no tener que pedir detalle aparte.
// Si tu listado de modelos no trae flags, hacé un GET /api/modelos/{id} al seleccionar.
type Modelo = {
  id: Id;
  nombre: string;
  categoriaId: Id;
  marcaId: Id;
  trackeaImei: boolean;
  requiereColor: boolean;
  requiereCapacidad: boolean;
};

type Color     = { id: Id; nombre: string };
type Capacidad = { id: Id; nombre: string };

// Ajustá a tu enum real del backend:
type EstadoComercial = 'NUEVO' | 'USADO' | 'REACONDICIONADO';

export default function NuevoProductoPage() {
  const toast = useToast();
  const router = useRouter();

  // ---------- listas base ----------
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [colores, setColores] = useState<Color[]>([]);
  const [capacidades, setCapacidades] = useState<Capacidad[]>([]);

  const [loadingBase, setLoadingBase] = useState(true);
  const [loadingModelos, setLoadingModelos] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ---------- selección ----------
  const [categoriaId, setCategoriaId] = useState<Id>('');
  const [marcaId, setMarcaId] = useState<Id>('');
  const [modeloId, setModeloId] = useState<Id | 'new'>('');

  // flags del modelo seleccionado (si viene del listado, los tomamos; si no, pedimos detalle)
  const selectedModelo = useMemo(
    () => (typeof modeloId === 'string' ? undefined : modelos.find(m => String(m.id) === String(modeloId))),
    [modeloId, modelos]
  );

  // ---------- campos de variante ----------
  const [colorId, setColorId] = useState<Id>('');
  const [capacidadId, setCapacidadId] = useState<Id>('');
  const [estadoComercial, setEstadoComercial] = useState<EstadoComercial>('NUEVO');
  const [sku, setSku] = useState('');
  const [activo, setActivo] = useState(true);

  // ---------- modal crear modelo ----------
  const [isModeloOpen, setIsModeloOpen] = useState(false);
  const [nuevoModeloNombre, setNuevoModeloNombre] = useState('');
  const [nuevoModeloTrackeaImei, setNuevoModeloTrackeaImei] = useState(false);
  const [nuevoModeloReqColor, setNuevoModeloReqColor] = useState(false);
  const [nuevoModeloReqCap, setNuevoModeloReqCap] = useState(false);
  const [creatingModelo, setCreatingModelo] = useState(false);

 
  useEffect(() => {
    let alive = true;
  
    const token = getToken();
    console.log('TOKEN 1', token);
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      router.replace('/login');
      return;
    }
  
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
        if (e?.response?.status === 401) { router.replace('/login'); return; }
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
  }, [router, toast]);   // ← SIEMPRE el mismo array (2 elementos)
  

  // Cargar modelos filtrados por categoría y marca
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

  // Reset de campos dependientes al cambiar modelo
  useEffect(() => {
    setColorId('');
    setCapacidadId('');
    setSku('');
    setActivo(true);
    setEstadoComercial('NUEVO');
  }, [modeloId]);

  const requiereColor = selectedModelo?.requiereColor ?? nuevoModeloReqColor;
  const requiereCapacidad = selectedModelo?.requiereCapacidad ?? nuevoModeloReqCap;

  // ---- crear modelo inline ----
  const openCrearModelo = () => {
    if (!categoriaId || !marcaId) {
      toast({ status: 'warning', title: 'Elegí categoría y marca primero' });
      return;
    }
    setNuevoModeloNombre('');
    setNuevoModeloTrackeaImei(false);
    setNuevoModeloReqColor(false);
    setNuevoModeloReqCap(false);
    setIsModeloOpen(true);
  };

  const handleCrearModelo = async () => {
    if (!categoriaId || !marcaId || !nuevoModeloNombre.trim()) {
      toast({ status: 'warning', title: 'Completá categoría, marca y nombre' });
      return;
    }
  
    // evita disparar sin token
    const token = getToken();
    if (!token) {
      toast({ status: 'error', title: 'Sesión expirada' });
      router.replace('/login');
      return;
    }
  
    setCreatingModelo(true);
    try {
      const { data: creado } = await api.post<Modelo>('/api/modelos', {
        categoriaId,
        marcaId,
        nombre: nuevoModeloNombre.trim(),
        trackeaImei: nuevoModeloTrackeaImei,
        requiereColor: nuevoModeloReqColor,
        requiereCapacidad: nuevoModeloReqCap,
      });
      setModelos(prev => [creado, ...prev]);
      setModeloId(creado.id as any);
      setIsModeloOpen(false);
      toast({ status: 'success', title: 'Modelo creado' });
    } catch (e: any) {
      console.log('POST /api/modelos error', e?.response?.status, e?.response?.data);
      toast({ status: 'error', title: 'No se pudo crear el modelo', description: e?.response?.data?.message ?? e?.message });
    } finally {
      setCreatingModelo(false);
    }
  };
  

  // ---- crear variante (producto) ----
  const handleCrearVariante = async () => {
    // Validaciones básicas
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

    setSubmitting(true);
    try {
      await api.post('/api/variantes', {
        modeloId,
        colorId: requiereColor ? colorId : null,
        capacidadId: requiereCapacidad ? capacidadId : null,
        estadoComercial, // asegurate de usar los valores EXACTOS del enum backend
        activo,
        sku: sku?.trim() || null,
      });
      toast({ status: 'success', title: 'Producto creado' });
      router.replace('/productos'); // o a detalle si querés
    } catch (e: any) {
      toast({ status: 'error', title: 'No se pudo crear el producto', description: e?.response?.data?.message ?? e?.message });
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
          {/* Categoría */}
          <FormControl isRequired>
            <FormLabel>Categoría</FormLabel>
            <Select placeholder="Elegí categoría" value={String(categoriaId)} onChange={(e) => setCategoriaId(e.target.value)}>
              {categorias.map(c => <option key={c.id} value={String(c.id)}>{c.nombre}</option>)}
            </Select>
          </FormControl>

          {/* Marca */}
          <FormControl isRequired>
            <FormLabel>Marca</FormLabel>
            <Select placeholder="Elegí marca" value={String(marcaId)} onChange={(e) => setMarcaId(e.target.value)}>
              {marcas.map(m => <option key={m.id} value={String(m.id)}>{m.nombre}</option>)}
            </Select>
          </FormControl>

          {/* Modelo */}
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

          {/* SKU (opcional) */}
          <FormControl>
            <FormLabel>SKU (opcional)</FormLabel>
            <Input placeholder="SKU interno" value={sku} onChange={(e) => setSku(e.target.value)} />
          </FormControl>

          {/* Color (si el modelo lo requiere) */}
          {requiereColor && (
            <FormControl isRequired>
              <FormLabel>Color</FormLabel>
              <Select placeholder="Elegí color" value={String(colorId)} onChange={(e) => setColorId(e.target.value)}>
                {colores.map(c => <option key={c.id} value={String(c.id)}>{c.nombre}</option>)}
              </Select>
            </FormControl>
          )}

          {/* Capacidad (si el modelo lo requiere) */}
          {requiereCapacidad && (
            <FormControl isRequired>
              <FormLabel>Capacidad</FormLabel>
              <Select placeholder="Elegí capacidad" value={String(capacidadId)} onChange={(e) => setCapacidadId(e.target.value)}>
                {capacidades.map(c => <option key={c.id} value={String(c.id)}>{c.nombre}</option>)}
              </Select>
            </FormControl>
          )}

          {/* Estado comercial */}
          <FormControl>
            <FormLabel>Estado comercial</FormLabel>
            <Select value={estadoComercial} onChange={(e) => setEstadoComercial(e.target.value as EstadoComercial)}>
              <option value="NUEVO">NUEVO</option>
              <option value="USADO">USADO</option>
              <option value="REACONDICIONADO">REACONDICIONADO</option>
            </Select>
          </FormControl>

          {/* Activo */}
          <FormControl display="flex" alignItems="center">
            <FormLabel mb="0">Activo</FormLabel>
            <Switch isChecked={activo} onChange={(e) => setActivo(e.target.checked)} />
          </FormControl>
        </SimpleGrid>

        <HStack justify="flex-end" mt={4}>
          <Button variant="ghost" onClick={() => router.back()}>Cancelar</Button>
          <Button colorScheme="blue" onClick={handleCrearVariante} isLoading={submitting}>Crear producto</Button>
        </HStack>
      </Container>

      {/* Modal: crear modelo */}
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
              <Checkbox isChecked={nuevoModeloTrackeaImei} onChange={(e) => setNuevoModeloTrackeaImei(e.target.checked)}>
                Trackea IMEI
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
            <Button colorScheme="blue" onClick={handleCrearModelo} isLoading={creatingModelo}>
              Crear modelo
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
