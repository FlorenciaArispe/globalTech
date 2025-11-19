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
} from '@chakra-ui/react';
import { ChevronRightIcon, CloseIcon } from '@chakra-ui/icons';
import { IoFilter } from 'react-icons/io5';
import ProductCard from '../components/ProductCard';

import { FaWhatsapp } from 'react-icons/fa';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { fetchCatalogoDestacados } from '../lib/productos';

const Productos = () => {
   const location = useLocation(); 
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);


  //ACA EMPIEZA LO NUEVO PARA TRAER LO DE BACKEND
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  (async () => {
    try {


      const destacados = await fetchCatalogoDestacados();
   console.log("VER PRODUCTOS DESTACADOS", destacados)

      setItems(destacados);
    } finally {
      setLoading(false);
    }
  })();
}, []);

  //ACA TERMINA



  useEffect(() => {
  const params = new URLSearchParams(location.search);
  const categoriaId = params.get('categoria');

  if (categoriaId && categorias.length > 0 && productos.length > 0) {
    const categoria = categorias.find(cat => cat.id == categoriaId);
    if (categoria) {
      const filtered = productos.filter(product => product.categoria === categoria.id);
      setFilteredProducts(filtered);
      setSelectedCategories([categoria.id]);
    }
  }
}, [location.search, categorias, productos]); 


  const handleToggleCategory = (categoryId: number) => {
    const updatedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(updatedCategories);

    const filtered = productos.filter((product) =>
      updatedCategories.length === 0 ? true : updatedCategories.includes(product.categoria)
    );

    setFilteredProducts(filtered);
  };

  return (
    <Box w="100%" px={4} mt={{ base: "15px", md: "80px" }}>
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
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink as={RouterLink} to="/productos">Productos</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>


      <Flex mt={2} wrap="wrap" gap={2}>
        {selectedCategories.map((id) => {
          const cat = categorias.find((c) => c.id === id);
          return (
            <Box
              key={id}
              px={3}
              py={1}
              bg="gray.100"
              borderRadius="md"
              display="flex"
              alignItems="center"
              fontSize="sm"
            >
              {cat?.nombre}
              <IconButton
                icon={<CloseIcon boxSize={2.5} />}
                size="xs"
                ml={2}
                aria-label="Quitar filtro"
                onClick={() => handleToggleCategory(id)}
              />
            </Box>
          );
        })}

      </Flex>
      <Flex justify="space-between" align="center" mb={5} >
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
            backgroundColor: "gray.100",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
          }}
          _active={{
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
          }}
        >
          Filtrar
        </Button>
      </Flex>
<SimpleGrid columns={2} spacing={3} mb={5}>
  {filteredProducts.length > 0 ? (
    filteredProducts.map((product) => (
      <ProductCard key={product.id} product={product} />
    ))
  ) : (
    <GridItem colSpan={2}>
      <Box w="100%" textAlign="center">
        <Text color="gray.500">
          No se encontraron productos para este filtro.
        </Text>
      </Box>
    </GridItem>
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
            <Heading size="md" textAlign="center">FILTROS</Heading>
            <IconButton
              aria-label="Cerrar filtro"
              icon={<CloseIcon />}
              size="sm"
              variant="ghost"
              onClick={() => setIsFilterOpen(false)}
            />
          </Flex>

          {/* <Box mb={6}>
            <Text fontWeight="bold" mb={2}>Ordenar</Text>
            <Select placeholder="Seleccionar orden">
              <option value="precioMayor">Precio: mayor a menor</option>
              <option value="precioMenor">Precio: menor a mayor</option>
              <option value="az">A - Z</option>
              <option value="za">Z - A</option>
            </Select>
          </Box> */}

          <Box mb={6}>
            <Text fontWeight="bold" mb={4}>Categorías</Text>
            <Flex gap={2} wrap="wrap">
              {categorias.map((cat) =>
                <Button
                  key={cat.id}
                  size="sm"
                  variant="outline"
                  colorScheme="blackAlpha"
                  onClick={() => {
                    const filtered = productos.filter(product => product.categoria === cat.id);
                    setFilteredProducts(filtered);
                    setSelectedCategories([cat.id]);
                    setIsFilterOpen(false);
                  }}
                >
                  {cat.nombre}
                </Button>
              )}
            </Flex>
          </Box>

          {/* <Box>
            <Text fontWeight="bold" mb={2}>Precio</Text>
            <Flex gap={2} mb={3}>
              <Input w={"140px"} placeholder="Desde" type="number" />
              <Input w={"140px"} placeholder="Hasta" type="number" />

              <Button size="sm" colorScheme="blackAlpha">
                Aplicar
              </Button>
            </Flex>
          </Box> */}
        </Box>
      )}
    </Box>
  );
};

export default Productos;
