import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Button,
  Flex,
  SimpleGrid,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  IconButton,
  Text,
  Link,
  GridItem,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
} from '@chakra-ui/react';
import { ChevronRightIcon, CloseIcon } from '@chakra-ui/icons';
import { IoFilter } from 'react-icons/io5';
import ProductCard from '../components/ProductCard';
import { FaWhatsapp } from 'react-icons/fa';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { fetchProductosCatalogo } from '../lib/productos';
import { Producto, TipoCatalogoItem } from '../types';

const MAX_PRICE = 5000;
const MIN_PRICE = 0;

function getTipoLabel(tipo: TipoCatalogoItem): string {
  switch (tipo) {
    case 'TRACKED_USADO_UNIDAD':
      return 'iPhone Usados';
    case 'TRACKED_SELLADO_AGREGADO':
      return 'iPhone Sellados';
    case 'NO_TRACK_AGREGADO':
      return 'Otros';
    default:
      return tipo;
  }
}

const Productos = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<TipoCatalogoItem | null>(
    null
  );

  const [priceRange, setPriceRange] = useState<[number, number]>([
    MIN_PRICE,
    MAX_PRICE,
  ]);

  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tipoParam = params.get('tipo') as TipoCatalogoItem | null;

    if (
      tipoParam === 'TRACKED_USADO_UNIDAD' ||
      tipoParam === 'TRACKED_SELLADO_AGREGADO' ||
      tipoParam === 'NO_TRACK_AGREGADO'
    ) {
      setSelectedTipo(tipoParam);
    } else {
      setSelectedTipo(null);
    }
  }, [location.search]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const prods = await fetchProductosCatalogo(selectedTipo ?? undefined);
        setProductos(prods);
      } catch (e) {
        console.error('Error cargando productos', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedTipo]);

  const handleClearTipo = () => {
    setSelectedTipo(null);
  };

  const handleClearPrice = () => {
    setPriceRange([MIN_PRICE, MAX_PRICE]);
  };

  const [minPrice, maxPrice] = priceRange;
  const filteredProductos = productos.filter(
    (p) => p.precio >= minPrice && p.precio <= maxPrice
  );

  const showPriceChip =
    minPrice !== MIN_PRICE || maxPrice !== MAX_PRICE; 
  return (
    <Box w="100%" px={4} mt={{ base: '15px', md: '80px' }}>
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
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink as={RouterLink} to="/productos">
            Productos
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Flex mt={2} wrap="wrap" gap={2} mb={2}>
        {selectedTipo && (
          <Box
            px={3}
            py={1}
            bg="gray.100"
            borderRadius="md"
            display="flex"
            alignItems="center"
            fontSize="sm"
          >
            {getTipoLabel(selectedTipo)}
            <IconButton
              icon={<CloseIcon boxSize={2.5} />}
              size="xs"
              ml={2}
              aria-label="Quitar filtro tipo"
              onClick={handleClearTipo}
            />
          </Box>
        )}

        {showPriceChip && (
          <Box
            px={3}
            py={1}
            bg="gray.100"
            borderRadius="md"
            display="flex"
            alignItems="center"
            fontSize="sm"
          >
            USD {minPrice} - USD {maxPrice}
            <IconButton
              icon={<CloseIcon boxSize={2.5} />}
              size="xs"
              ml={2}
              aria-label="Quitar filtro precio"
              onClick={handleClearPrice}
            />
          </Box>
        )}
      </Flex>

      <Flex justify="space-between" align="center" mb={5}>
        <Heading size="md">Productos</Heading>
        <Button
          size="sm"
          colorScheme="white"
          variant="outline"
          borderColor="black"
          color="black"
          onClick={() => setIsFilterOpen(true)}
          leftIcon={<IoFilter />}
          _hover={{
            backgroundColor: 'gray.100',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
          _active={{
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        >
          Filtrar
        </Button>
      </Flex>

      {/* Grid de productos */}
      <SimpleGrid columns={2} spacing={3} mb={5}>
        {filteredProductos.length > 0 ? (
          filteredProductos.map((product) => (
            <ProductCard
              key={product.itemId}
              product={product}
              destacado={false}
            />
          ))
        ) : (
          !loading && (
            <GridItem colSpan={2}>
              <Box w="100%" textAlign="center">
                <Text color="gray.500">
                  No se encontraron productos para este filtro.
                </Text>
              </Box>
            </GridItem>
          )
        )}
      </SimpleGrid>

      {isFilterOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          w="100vw"
          h="100vh"
          bg="white"
          zIndex="1000"
          px={4}
          py={6}
          overflowY="auto"
        >
          <Flex justify="space-between" align="center" mb={6}>
            <Box w="32px" />
            <Heading size="md" textAlign="center">
              FILTROS
            </Heading>
            <IconButton
              aria-label="Cerrar filtro"
              icon={<CloseIcon />}
              size="sm"
              variant="ghost"
              onClick={() => setIsFilterOpen(false)}
            />
          </Flex>

          <Box mb={6}>
            <Text fontWeight="bold" mb={4}>
              Tipo de producto
            </Text>
            <Flex gap={2} wrap="wrap">
              <Button
                size="sm"
                variant={selectedTipo === null ? 'solid' : 'outline'}
                colorScheme="blackAlpha"
                onClick={() => {
                  setSelectedTipo(null); 
                  setIsFilterOpen(false);
                }}
              >
                Todos
              </Button>

              <Button
                size="sm"
                variant={
                  selectedTipo === 'TRACKED_USADO_UNIDAD' ? 'solid' : 'outline'
                }
                colorScheme="blackAlpha"
                onClick={() => {
                  setSelectedTipo('TRACKED_USADO_UNIDAD');
                  setIsFilterOpen(false);
                }}
              >
                iPhone Usados
              </Button>

              <Button
                size="sm"
                variant={
                  selectedTipo === 'TRACKED_SELLADO_AGREGADO'
                    ? 'solid'
                    : 'outline'
                }
                colorScheme="blackAlpha"
                onClick={() => {
                  setSelectedTipo('TRACKED_SELLADO_AGREGADO');
                  setIsFilterOpen(false);
                }}
              >
                iPhone Sellados
              </Button>

              <Button
                size="sm"
                variant={
                  selectedTipo === 'NO_TRACK_AGREGADO' ? 'solid' : 'outline'
                }
                colorScheme="blackAlpha"
                onClick={() => {
                  setSelectedTipo('NO_TRACK_AGREGADO');
                  setIsFilterOpen(false);
                }}
              >
                Otros
              </Button>
            </Flex>
          </Box>

          <Box mb={6}>
            <Text fontWeight="bold" mb={2}>
              Rango de precio
            </Text>
            <Text fontSize="sm" mb={2}>
              De <b>{minPrice} USD</b> a <b>{maxPrice} USD</b>
            </Text>

            <RangeSlider
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={50}
              value={priceRange}
              onChange={(val) => setPriceRange(val as [number, number])}
            >
              <RangeSliderTrack>
                <RangeSliderFilledTrack />
              </RangeSliderTrack>
              <RangeSliderThumb index={0} />
              <RangeSliderThumb index={1} />
            </RangeSlider>

            <Flex justify="space-between" mt={1}>
              <Text fontSize="xs">min {MIN_PRICE} USD</Text>
              <Text fontSize="xs">max {MAX_PRICE} USD</Text>
            </Flex>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Productos;
