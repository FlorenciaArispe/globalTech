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
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SearchIcon } from "@chakra-ui/icons";
import { fetchProductosCatalogo } from "../lib/productos";
import type { Producto } from "../types";

const Navbar = () => {
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [resultados, setResultados] = useState<Producto[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoadingProductos(true);
        const all = await fetchProductosCatalogo();
        setProductos(all);
      } catch (e) {
        console.error("Error cargando productos para búsqueda", e);
      } finally {
        setLoadingProductos(false);
      }
    })();
  }, []);

  const toggleSearch = () => {
    setSearchVisible((prev) => !prev);
    if (!searchVisible) {
    } else {
      setSearchText("");
      setResultados([]);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;

    const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]*$/;

    if (!regex.test(valor)) return;

    setSearchText(valor);

    const texto = valor.trim().toLowerCase();

    if (texto.length < 2) {
      setResultados([]);
      return;
    }

    const coincidencias = productos.filter((p) => {
      const modelo = p.modeloNombre?.toLowerCase() ?? "";
      const capacidad = p.capacidad?.toLowerCase() ?? "";
      return (
        modelo.includes(texto) ||
        capacidad.includes(texto)
      );
    });

    setResultados(coincidencias);
  };

  const handleSeleccionProducto = (producto: Producto) => {
    const id = (producto as any).itemId ?? (producto as any).id;

    navigate(`/productos/${id}`, {
      state: { tipo: producto.tipo },
    });

    setSearchText("");
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
      height="68px"
      minHeight="68px"
    >
      <Flex justify="space-between" align="center">
        {isMobile && <MenuMobile />}

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
              as={Link}
              to="/"
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
          <Box position="relative" w={isMobile ? "60%" : "40%"} ml={4}>
            <Input
              placeholder={
                loadingProductos ? "Cargando productos..." : "Buscar productos..."
              }
              size="sm"
              variant="flushed"
              focusBorderColor="blue.400"
              value={searchText}
              onChange={handleSearchChange}
              isDisabled={loadingProductos}
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
                maxH="250px"
                overflowY="auto"
              >
                {resultados.map((r) => {
                  let texto = r.modeloNombre;

                  if (r.tipo === "TRACKED_USADO_UNIDAD") {
                    const capacidad = r.capacidad ? ` ${r.capacidad}` : "";
                    const color = r.color ? ` ${r.color}` : "";
                    const bateria =
                      r.bateriaCondicionPct != null ? ` ${r.bateriaCondicionPct}%` : "";
                    texto = `${r.modeloNombre}${capacidad}${color}${bateria}`;
                  }

                  return (
                    <Button
                      key={r.itemId}
                      variant="ghost"
                      justifyContent="flex-start"
                      w="100%"
                      onClick={() => handleSeleccionProducto(r)}
                      _hover={{ bg: "gray.100" }}
                      fontSize="sm"
                      py={2}
                    >
                      {texto}
                    </Button>
                  );
                })}
              </Box>
            )}

            {resultados.length === 0 &&
              searchText.trim().length >= 2 &&
              !loadingProductos && (
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
                  fontSize="sm"
                  color="gray.500"
                  px={3}
                  py={2}
                >
                  No se encontraron productos.
                </Box>
              )}
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default Navbar;
