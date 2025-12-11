import {
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  useDisclosure,
  VStack,
  Button,
  Divider,
} from "@chakra-ui/react";
import { FiArrowRight, FiMenu, FiHome, FiBox } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export const MenuMobile = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const goTo = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      <IconButton
        icon={<FiMenu />}
        variant="ghost"
        aria-label="Abrir menú"
        onClick={onOpen}
        display={{ base: "block", md: "none" }}
        fontSize="24px"
        mt={2}
      />

      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="full">
        <DrawerOverlay />
        <DrawerContent width="full">
          <DrawerCloseButton fontSize="18px" mt={1} mr={2} />

          <DrawerBody>
            <VStack spacing={3} mt={10} align="start" w="100%">

              <Button
                w="100%"
                variant="ghost"
                color="black"
                leftIcon={<FiHome />}
                onClick={() => goTo("/")}
                justifyContent="flex-start"
              >
                Inicio
              </Button>

              <Button
                w="100%"
                variant="ghost"
                color="black"
                leftIcon={<FiBox />}
                onClick={() => goTo("/productos")}
                justifyContent="flex-start"
              >
                Productos
              </Button>

              <Button
                w="100%"
                pl={8}
                variant="ghost"
                color="black"
                fontWeight="normal"
                onClick={() =>
                  goTo("/productos?tipo=TRACKED_SELLADO_AGREGADO")
                }
                justifyContent="space-between"
                rightIcon={<FiArrowRight />}
              >
                iPhone Sellados
              </Button>

              <Button
                w="100%"
                pl={8}
                variant="ghost"
                color="black"
                fontWeight="normal"
                onClick={() =>
                  goTo("/productos?tipo=TRACKED_USADO_UNIDAD")
                }
                justifyContent="space-between"
                rightIcon={<FiArrowRight />}
              >
                iPhone Usados
              </Button>

              <Button
                w="100%"
                pl={8}
                variant="ghost"
                color="black"
                fontWeight="normal"
                onClick={() => goTo("/productos?tipo=NO_TRACK_AGREGADO")}
                justifyContent="space-between"
                rightIcon={<FiArrowRight />}
              >
                Otros
              </Button>

              <Divider my={4} borderColor="gray.300" />

              <Button
                variant="ghost"
                color="black"
                onClick={() => goTo("/plan-canje")}
                justifyContent="flex-start"
              >
                PLAN CANJE
              </Button>

              <Button
                variant="ghost"
                color="black"
                onClick={() => goTo("/politicaygarantia")}
                justifyContent="flex-start"
              >
                Política de devolución y garantía
              </Button>

              <Button
                variant="ghost"
                color="black"
                onClick={() => goTo("/quienes-somos")}
                justifyContent="flex-start"
              >
                Quiénes somos
              </Button>

              <Button
                variant="ghost"
                color="black"
                onClick={() => goTo("/contacto")}
                justifyContent="flex-start"
              >
                Contacto
              </Button>

            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
