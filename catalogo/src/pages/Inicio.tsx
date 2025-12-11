import { Box, Button, HStack, Icon, Image, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaMoneyBillWave, FaShieldAlt, FaStore, FaTruck, FaWhatsapp } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import ProductCard from "../components/ProductCard";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { fetchCatalogoDestacados } from "../lib/productos";
import { Producto } from "../types";

const images = [
  '/images-inicio/usadoGarantia.png',
  '/images-inicio/PLANCANJE.png',
  '/images-inicio/ustedes.png',
  '/images-inicio/sobreNosotros.png',
  '/images-inicio/garantiaNuevos.png',
];

const imageLinks = [
  '/politicaygarantia',
  '/plan-canje',
  '/contacto',
  '/quienes-somos',
  '/politicaygarantia',
];

const MotionBox = motion(Box);

function Inicio() {
  const navigate = useNavigate();
  const [productosDestacados, setProductosDestacados] = useState<Producto[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const destacados = await fetchCatalogoDestacados();
        setProductosDestacados(destacados);
      } finally {
      }
    })();
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const itemWidth = 165 + 24;

  useEffect(() => {
    const handleScroll = () => {
      const scrollLeft = scrollRef.current?.scrollLeft || 0;
      const index = Math.round(scrollLeft / itemWidth);
      setActiveIndex(index);
    };

    const container = scrollRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      container?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Box w="100%" position="relative">

      <Box bg="rgb(248, 248, 248)" minHeight="100vh" >
        <Image
          src="/images/portada2.png"
          alt="Imagen descriptiva"
          objectFit="cover"
          w="100%"
        />

        <Box mt={8} px={1}>
          <Box
            ref={scrollRef}
            overflowX="auto"
            whiteSpace="nowrap"
            display="flex"
            gap={6}
            pb={4}
            css={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            {images.map((src, index) => (
              <RouterLink to={imageLinks[index]} key={index}>
                <MotionBox
                  key={index}
                  minW="165px"
                  h="183px"
                  flex="0 0 auto"
                  borderRadius="20px"
                  boxShadow="0 4px 12px rgba(0, 0, 0, 0.2)"
                  backgroundImage={`url(${src})`}
                  backgroundSize="cover"
                  backgroundPosition="center"
                  cursor="pointer"
                  animate={{
                    y: [0, -4, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2,
                  }}
                />
              </RouterLink>
            ))}
          </Box>

          <HStack justify="center" mt={3} spacing={2}>
            {images.map((_, index) => (
              <Box
                key={index}
                w={2}
                h={2}
                borderRadius="full"
                bg={index === activeIndex ? "gray.500" : "gray.300"}
                transition="background 0.3s"
              />
            ))}
          </HStack>
        </Box>

        <RouterLink
          to="https://wa.me/message/5RCBRGOHGKPVL1"
          target="_blank"
          style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: "1000" }}
        >
          <Box
            as={FaWhatsapp}
            boxSize="60px"
            color="#25D366"
            _hover={{ transform: "scale(1.1)" }}
            transition="all 0.3s ease"
          />
        </RouterLink>

        <Box p={8}>
          <Text mb={4} fontSize={"18px"} fontWeight={700}> Productos destacados</Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {productosDestacados.map((product) => (
              <ProductCard key={product.itemId} product={product} destacado={true} />
            ))}
          </SimpleGrid>
          <Box textAlign="center" mt={6}>
            <Button
              size="sm"
              colorScheme="white"
              variant="outline"
              borderColor="black"
              color="black"
              _hover={{
                backgroundColor: "gray.100",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
              }}
              _active={{
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              }}
              onClick={() => navigate('/productos')}
            >
              VER MÁS EQUIPOS
            </Button>
          </Box>
        </Box>

        <VStack mt={10} spacing={8} align="center">
          <Box textAlign="center" maxW="300px">
            <Icon as={FaTruck} boxSize={12} color="black" mb={4} />
            <Box fontWeight="bold" fontSize="xl" mb={2}>
              Envíos a todo el país
            </Box>
            <Box color="gray.600" fontSize="sm">
              Coordinado con el vendedor luego de aprobar el pedido.
            </Box>
          </Box>

          <Box textAlign="center" maxW="300px">
            <Icon as={FaStore} boxSize={12} color="black" mb={4} />
            <Box fontWeight="bold" fontSize="xl" mb={2}>
              Retiros
            </Box>
            <Box color="gray.600" fontSize="sm">
              Retirá personalmente en Bahía Blanca.
            </Box>
          </Box>

          <Box textAlign="center" maxW="300px">
            <Icon as={FaMoneyBillWave} boxSize={12} color="black" mb={4} />
            <Box fontWeight="bold" fontSize="xl" mb={2}>
              Pagos
            </Box>
            <Box color="gray.600" fontSize="sm">
              Pagá en efectivo o transferencia. Dolares, pesos, usdt. Tarjeta de crédito hasta el 100% del valor del quipo, con interes propio del banco desde Mercado Pago.
            </Box>
          </Box>

          <Box textAlign="center" maxW="300px" mb={10}>
            <Icon as={FaShieldAlt} boxSize={12} color="black" mb={4} />
            <Box fontWeight="bold" fontSize="xl" mb={2}>
              Compra segura
            </Box>
            <Box color="gray.600" fontSize="sm">
              Tus datos están protegidos durante toda la operación.
            </Box>
          </Box>
        </VStack>

      </Box>
    </Box>
  );
}

export default Inicio;