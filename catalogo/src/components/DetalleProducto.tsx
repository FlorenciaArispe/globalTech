import { useParams } from 'react-router-dom';
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
  Badge
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { FaStore, FaTruck, FaWhatsapp } from 'react-icons/fa';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import Slider from 'react-slick';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';


const DetalleProducto = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState<any>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalIndex, setModalIndex] = useState(0);
  const [detallesProducto, setDetalleProducto] = useState<any[]>([]);


  // useEffect(() => {
  //   const fetchProducto = async () => {
  //     try {
  //       const data = await getProductoPorId(id);
  //       setProducto(data);

  //       const detalles = await getDetallesProducto(id);
  //       setDetalleProducto(detalles);
  //     } catch (error) {
  //       console.error("Error al obtener los detalles", error);
  //     }
  //   };

  //   fetchProducto();
  // }, [id]);


  if (!producto) return <Text>Cargando producto...</Text>;

  // const precioPesos =
  //   !loading && cotizacion
  //     ? (producto.minorista * cotizacion).toLocaleString('es-AR', {
  //       style: 'currency',
  //       currency: 'ARS',
  //     })
  //     : null;


  const nombreFinal =
    producto.categoria === 1 || producto.categoria === 2
      ? `${producto.modelo} - ${producto.capacidad || ''}`.trim()
      : producto.nombre;

  const imagenes: string[] = producto.fotos?.length > 0 ? producto.fotos : ['/images/default.png'];


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
    setModalIndex((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };

  return (
    <Box
      w="100%"
      px={4}
      mt={{ base: "15px", md: "80px" }}
      overflowX="hidden" // ⬅️ esto evita el desbordamiento lateral
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
          _hover={{ transform: "scale(1.1)" }}
          transition="all 0.3s ease"
        />
      </Link>

      <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500" />} mb={4}>
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to="/">Inicio</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to="/productos">Productos</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>{nombreFinal}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>


      {/* Galería de imágenes */}
      <Box maxW="400px" mb={6}>
        {imagenes.length > 1 ? (
          <Slider
            {...sliderSettings}
            style={{ maxWidth: "100%", overflow: "hidden" }}
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
          <ModalCloseButton color="black" right={6} zIndex={2} />
          <ModalBody display="flex" alignItems="center" justifyContent="center" position="relative">
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

      {/* Info */}


      <Text fontSize="2xl" fontWeight="bold" mb={2}>{nombreFinal}</Text>

      <Flex direction="row" justify="space-between" align="center" mb={4} flexWrap="wrap">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="green.600">
            USD ${producto.minorista}
            {/* <Badge ml={2} h="20px" colorScheme="green" variant="subtle">
        USD
      </Badge> */}
          </Text>
{/* 
          {!loading && precioPesos && (
            <Text fontSize="md" color="gray.600" mt={1}>
              {precioPesos}
              <Badge ml={2} h="20px" colorScheme="blue" variant="subtle">
                ARG
              </Badge>
            </Text>
          )} */}
        </Box>

        <Button
          as="a"
          href={`https://wa.me/5492914197099?text=${encodeURIComponent(`*¡Hola Global Technology!*\nQuiero consultar sobre *${nombreFinal}*`)}`}
          target="_blank"
          rel="noopener noreferrer"
          leftIcon={<FaWhatsapp />}
          bg="#25D366"
          color="white"
          _hover={{ bg: "#1EBE5D" }}
        >
          Consultas
        </Button>
      </Flex>


      {producto.categoria !== 3 && (
        <Box mt={12} mb={6}>
          <Heading size="md" mb={3}>Detalles del equipo</Heading>
          <Table variant="simple">
            <Tbody>
              {producto.modelo && (
                <Tr>
                  <Td fontWeight="bold">Modelo</Td>
                  <Td>{producto.modelo}</Td>
                </Tr>
              )}
              {detallesProducto.length > 0 && (
                <Tr>
                  <Td fontWeight="bold">Colores</Td>
                  <Td>
                    {detallesProducto.map((v, i) => (
                      <Text as="span" key={i}>
                        {v.color}{i < detallesProducto.length - 1 ? ', ' : ''}
                      </Text>
                    ))}
                  </Td>
                </Tr>
              )}

              {producto.capacidad && (
                <Tr>
                  <Td fontWeight="bold">Capacidad</Td>
                  <Td>{producto.capacidad}</Td>
                </Tr>
              )}

            </Tbody>
          </Table>
        </Box>
      )}




      {producto.categoria === 2 && (
        <Text mt={4} mb={4} fontStyle="italic" color="gray.600">
          Garantía Apple oficial de un año
        </Text>
      )}

      {/* Info local/envío */}
      <Flex direction={{ base: 'column', md: 'row' }} gap={6} mb={10}>
        <Box borderWidth="1px" borderRadius="md" p={4} flex={1}>
          <HStack mb={2}><Icon as={FaStore} /><Text fontWeight="bold">Nuestros locales</Text></HStack>
          <VStack align="start" spacing={1}>
            <Text>📍 Bahía Blanca, Buenos Aires</Text>
            <Text>📍 CABA, Capital Federal</Text>
          </VStack>
          <Text>CON TURNO PREVIO</Text>
          <Text color="green.500" fontWeight="bold" mt={2}>Gratis</Text>
        </Box>
        <Box borderWidth="1px" borderRadius="md" p={4} flex={1}>
          <HStack mb={2}><Icon as={FaTruck} /><Text fontWeight="bold">Envíos a todo el país</Text></HStack>
          <Text>A coordinar con el vendedor.</Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default DetalleProducto;
