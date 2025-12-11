import { useParams, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Heading,
  Text,
  Image,
  Flex,
  Button,
  Icon,
  Table,
  Tbody,
  Tr,
  Td,
  VStack,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  IconButton,
  Link,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { FaStore, FaTruck, FaWhatsapp } from 'react-icons/fa';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import Slider from 'react-slick';
import { useEffect, useState } from 'react';
import { fetchProductoDetalle } from '../lib/productos';
import {
  ID,
  ProductoDetalle,
  TipoCatalogoItem,
  VarianteOpcionCatalogoDTO,
} from '../types';

const DetalleProducto = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const locationState = location.state as { tipo?: TipoCatalogoItem } | null;
  const tipoFromState = locationState?.tipo;
  const [producto, setProducto] = useState<ProductoDetalle | null>(null);
  const [detallesProducto, setDetalleProducto] = useState<VarianteOpcionCatalogoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalIndex, setModalIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    const tipo: TipoCatalogoItem = tipoFromState ?? 'NO_TRACK_AGREGADO';
    const itemId = id as ID;

    setLoading(true);

    fetchProductoDetalle(itemId, tipo)
      .then((data) => {
        setProducto(data);
        setDetalleProducto(data.variantesEnStock ?? []);
      })
      .finally(() => setLoading(false));
  }, [id, tipoFromState]);

  if (loading) return <Text>Cargando producto...</Text>;
  if (!producto) return <Text>No se encontró el producto.</Text>;

  const nombreFinal = (() => {
    switch (producto.tipo) {
      case 'TRACKED_USADO_UNIDAD':
        return `${producto.modeloNombre}${producto.capacidad ? ` - ${producto.capacidad}` : ''
          }${producto.bateriaCondicionPct != null
            ? ` - ${producto.bateriaCondicionPct}% batería`
            : ''
          }`.trim();

      case 'TRACKED_SELLADO_AGREGADO':
        return producto.modeloNombre;

      case 'NO_TRACK_AGREGADO':
      default:
        return `${producto.modeloNombre}${producto.capacidad ? ` - ${producto.capacidad}` : ''
          }`.trim();
    }
  })();

  const imagenes: string[] =
    producto.imagenes && producto.imagenes.length > 0
      ? producto.imagenes.map((img) => img.url)
      : ['/images/default.png'];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  const handleImageClick = (index: number) => {
    setModalIndex(index);
    onOpen();
  };

  const handlePrev = () => {
    setModalIndex((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setModalIndex((prev) =>
      prev === imagenes.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <Box
      w="100%"
      px={4}
      mt={{ base: '15px', md: '80px' }}
      overflowX="hidden"
    >
      <Link
        href="https://wa.me/message/5RCBRGOHGKPVL1"
        isExternal
        position="fixed"
        bottom="20px"
        right="20px"
        zIndex="1000"
      >
        <Box
          as={FaWhatsapp}
          boxSize="60px"
          color="#25D366"
          _hover={{ transform: 'scale(1.1)' }}
          transition="all 0.3s ease"
        />
      </Link>

      <Breadcrumb
        spacing="8px"
        separator={<ChevronRightIcon color="gray.500" />}
        mb={4}
      >
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to="/">
            Inicio
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to="/productos">
            Productos
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>{nombreFinal}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Box maxW="400px" mb={6}>
        {imagenes.length > 1 ? (
          <Slider
            {...sliderSettings}
            style={{ maxWidth: '100%', overflow: 'hidden' }}
          >
            {imagenes.map((img, i) => (
              <Image
                key={i}
                src={img}
                alt={nombreFinal}
                borderRadius="md"
                onClick={() => handleImageClick(i)}
                cursor="pointer"
              />
            ))}
          </Slider>
        ) : (
          <Image
            src={imagenes[0]}
            alt={nombreFinal}
            borderRadius="md"
            onClick={() => handleImageClick(0)}
            cursor="pointer"
          />
        )}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
        <ModalOverlay bg="blackAlpha.700" />
        <ModalContent bg="transparent" boxShadow="none">
          <ModalCloseButton color="white" right={6} zIndex={2} />
          <ModalBody
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
          >
            <IconButton
              icon={<IoIosArrowBack />}
              position="absolute"
              left={2}
              top="50%"
              transform="translateY(-50%)"
              onClick={handlePrev}
              aria-label="Anterior"
              colorScheme="whiteAlpha"
            />
            <Image src={imagenes[modalIndex]} maxH="80vh" borderRadius="md" />
            <IconButton
              icon={<IoIosArrowForward />}
              position="absolute"
              right={2}
              top="50%"
              transform="translateY(-50%)"
              onClick={handleNext}
              aria-label="Siguiente"
              colorScheme="whiteAlpha"
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      <Text fontSize="2xl" fontWeight="bold" mb={2}>
        {nombreFinal}
      </Text>

      <Flex
        direction="row"
        justify="space-between"
        align="center"
        mb={4}
        flexWrap="wrap"
      >
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="green.600">
            USD ${producto.precio}
          </Text>
        </Box>

        <Button
          as="a"
          href={`https://wa.me/5492914197099?text=${encodeURIComponent(
            `*¡Hola Global Technology!*\nQuiero consultar sobre *${nombreFinal}*`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          leftIcon={<FaWhatsapp />}
          bg="#25D366"
          color="white"
          _hover={{ bg: '#1EBE5D' }}
        >
          Consultas
        </Button>
      </Flex>

      <Box mt={12} mb={6}>
        <Heading size="md" mb={3}>
          Detalles del equipo
        </Heading>
        <Table variant="simple">
          <Tbody>
            <Tr>
              <Td fontWeight="bold">Modelo</Td>
              <Td>{producto.modeloNombre}</Td>
            </Tr>

            {(producto.tipo === 'TRACKED_SELLADO_AGREGADO' ||
              producto.tipo === 'NO_TRACK_AGREGADO') &&
              detallesProducto.length > 0 && (
                <Tr>
                  <Td fontWeight="bold" w="120px">
                    En stock
                  </Td>
                  <Td>
                    {detallesProducto.map((v, i) => {
                      const label = [v.color, v.capacidad].filter(Boolean).join(' ');
                      return (
                        <Text as="span" key={i}>
                          {label || ''}
                          {i < detallesProducto.length - 1 ? ', ' : ''}
                        </Text>
                      );
                    })}
                  </Td>
                </Tr>
              )}

            {producto.tipo === 'NO_TRACK_AGREGADO' && (
              <>
                {producto.color && (
                  <Tr>
                    <Td fontWeight="bold">Color principal</Td>
                    <Td>{producto.color}</Td>
                  </Tr>
                )}

                {producto.capacidad && (
                  <Tr>
                    <Td fontWeight="bold">Capacidad principal</Td>
                    <Td>{producto.capacidad}</Td>
                  </Tr>
                )}
              </>
            )}

            {producto.tipo === 'TRACKED_USADO_UNIDAD' && (
              <>
                {producto.color && (
                  <Tr>
                    <Td fontWeight="bold">Color</Td>
                    <Td>{producto.color}</Td>
                  </Tr>
                )}
                {producto.capacidad && (
                  <Tr>
                    <Td fontWeight="bold">Capacidad</Td>
                    <Td>{producto.capacidad}</Td>
                  </Tr>
                )}
                {producto.bateriaCondicionPct != null && (
                  <Tr>
                    <Td fontWeight="bold">Batería</Td>
                    <Td>{producto.bateriaCondicionPct}%</Td>
                  </Tr>
                )}
              </>
            )}
          </Tbody>
        </Table>
      </Box>

      {(producto.tipo === 'TRACKED_SELLADO_AGREGADO' || producto.tipo === "NO_TRACK_AGREGADO") ? (
        <Text mt={4} mb={4} fontStyle="italic" color="gray.600">
          Garantía Apple oficial de un año
        </Text>
      ) : (
        <Text mt={4} mb={4} fontStyle="italic" color="gray.600">
          Garantía de 90 días
        </Text>
      )}

      <Flex direction={{ base: 'column', md: 'row' }} gap={6} mb={16}>
        <Box borderWidth="1px" borderRadius="md" p={4} flex={1}>
          <HStack mb={2}>
            <Icon as={FaStore} />
            <Text fontWeight="bold">Nuestros locales</Text>
          </HStack>
          <VStack align="start" spacing={1}>
            <Text>📍 Bahía Blanca, Buenos Aires</Text>
          </VStack>
          <Text>CON TURNO PREVIO</Text>
          <Text color="green.500" fontWeight="bold" mt={2}>
            Gratis
          </Text>
        </Box>
        <Box borderWidth="1px" borderRadius="md" p={4} flex={1}>
          <HStack mb={2}>
            <Icon as={FaTruck} />
            <Text fontWeight="bold">Envíos a todo el país</Text>
          </HStack>
          <Text>A coordinar con el vendedor.</Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default DetalleProducto;