import {
  Box,
  Flex,
  Image,
  Button,
  IconButton,
  Input,
  useBreakpointValue,
} from "@chakra-ui/react";
import { MenuMobile } from "./MenuMobile";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SearchIcon } from "@chakra-ui/icons";

const Navbar = () => {
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);


  const toggleSearch = () => {
    setSearchVisible((prev) => !prev);
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;

    // Permitir letras, números, tildes, ñ y espacios
    const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]*$/;

    if (regex.test(valor)) {
      setSearchText(valor);

      if (valor.trim().length >= 2) {
        buscarCoincidencias(valor.trim());
      } else {
        setResultados([]);
      }
    }
  };


  // const buscarCoincidencias = async (texto: string) => {
  //   // const productos = await getProductos();
  //   const textoMin = texto.toLowerCase();

  //   const coincidencias = productos.filter(p =>
  //     p.nombre?.toLowerCase().includes(textoMin) ||
  //     p.modelo?.toLowerCase().includes(textoMin)
  //   );

  //   setResultados(coincidencias);
  // };

  const handleSeleccionProducto = (id: number) => {
    navigate(`/productos/${id}`);
    setSearchText('');
    setResultados([]);
    setSearchVisible(false);
  };

  return (
    <Box
      as="nav"
      boxShadow="0px 4px 6px rgba(0, 0, 0, 0.1)"
      position="sticky"
      top={0}
      zIndex={10}
      bg="white"
      p={2}
       height="68px" // Establecer un alto fijo
  minHeight="68px"
    >
      <Flex justify="space-between" align="center">
        {isMobile && (
          <MenuMobile />
        )}

        <Link to="/">
          <Image
            ml={isMobile ? 0 : 10}
            w={isMobile ? "50px" : "100px"}
            src="/images/solo-logo.png"
            alt="Global Technology"
            mx={isMobile ? "auto" : "unset"}
            cursor="pointer"
          />
        </Link>

        {!isMobile && (
          <Flex>
            <Button
              variant="ghost"
              color="black"
              mr={4}
              _hover={{
                outline: "1px solid black",
                backgroundColor: "transparent",
              }}
            >
              Inicio
            </Button>
            <Button
              variant="ghost"
              color="black"
              mr={4}
              _hover={{
                outline: "1px solid black",
                backgroundColor: "transparent",
              }}
            >
              Quiénes somos
            </Button>
            <Button
              variant="ghost"
              color="black"
              mr={4}
              _hover={{
                outline: "1px solid black",
                backgroundColor: "transparent",
              }}
            >
              Contacto
            </Button>
          </Flex>
        )}
        <IconButton
          aria-label="Buscar"
          icon={<SearchIcon />}
          variant="ghost"
          color="black.800"
          fontSize="23px"
          onClick={toggleSearch}
          _hover={{
            backgroundColor: "transparent",
            border: "1px solid white",
          }}
        />
        {searchVisible && (
          <Box position="relative" w="full" ml={4}>
            <Input
              placeholder="Buscar productos..."
              size="sm"
              variant="flushed"
              focusBorderColor="blue.400"
              value={searchText}
              onChange={handleSearchChange}
            />
            {resultados.length > 0 && (
              <Box
                position="absolute"
                top="100%"
                left={0}
                w="full"
                bg="white"
                border="1px solid #ccc"
                borderRadius="md"
                mt={1}
                zIndex={20}
                maxH="200px"
                overflowY="auto"
              >
                {resultados.map((r) => (
                  <Button
                    key={r.id}
                    variant="ghost"
                    justifyContent="flex-start"
                    w="100%"
                    onClick={() => handleSeleccionProducto(r.id)}
                    _hover={{ bg: "gray.100" }}
                    fontSize="sm"
                  >
                    {r.nombre || r.modelo}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Flex>



    </Box>

  );
};

export default Navbar;