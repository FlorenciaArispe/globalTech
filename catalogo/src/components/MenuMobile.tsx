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
  Flex,
} from "@chakra-ui/react";
import { FaArrowRight } from "react-icons/fa";
import { FiArrowRight, FiMenu } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export const MenuMobile = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

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
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        size="full"
      >
        <DrawerOverlay />
        <DrawerContent width="full">
          <DrawerCloseButton fontSize="18px" mt={1} mr={2} />

          <DrawerBody  >
            <VStack spacing={3} mt={10} align="start"  >
              <Button
                variant="ghost"
                color="black"
                onClick={() => {
                  navigate('/');
                  onClose();
                }}
              >
                Inicio
              </Button>
              <Button
                variant="ghost"
                color="black"
                onClick={() => {
                  navigate('/productos');
                  onClose();
                }}
              >
                Productos
              </Button>

              <Button
                w={"100%"}
                variant="ghost"
                color="black"
                fontWeight="normal"
                onClick={() => {
                  navigate('/productos?categoria=1');
                  onClose();
                }}
                display={"flex"}
                flexDirection={"row"} justifyContent="space-between" alignContent="center"
              >

                <span>Sellados</span>
                <FiArrowRight style={{ strokeWidth: 1.5, fontSize: '20px' }} />


              </Button>
              <Button
                w={"100%"}
                variant="ghost"
                color="black"
                fontWeight="normal"
                onClick={() => {
                  navigate('/productos?categoria=2');
                  onClose();
                }}
                display={"flex"}
                flexDirection={"row"} justifyContent="space-between" alignContent="center"
              >
                <span>Usados</span>
                <FiArrowRight style={{ strokeWidth: 1.5, fontSize: '20px' }} />
              </Button>
              <Button
              mb={6}
                w={"100%"}
                variant="ghost"
                color="black"
                fontWeight="normal"
                onClick={() => {
                  navigate('/productos?categoria=3');
                  onClose();
                }}
                display={"flex"}
                flexDirection={"row"} justifyContent="space-between" alignContent="center"
              >
                <span>Accesorios</span>
                <FiArrowRight style={{ strokeWidth: 1.5, fontSize: '20px' }} />
              </Button>
              <Button
                variant="ghost"
                color="black"
                onClick={() => {
                  navigate('/plan-canje');
                  onClose();
                }}
              >
                PLAN CANJE
              </Button>
              <Button
                variant="ghost"
                color="black"
                onClick={() => {
                  navigate('/politicaygarantia');
                  onClose();
                }}
              >
                Política de devolución y garantía
              </Button>
              <Button
                variant="ghost"
                color="black"
                onClick={() => {
                  navigate('/quienes-somos');
                  onClose();
                }}
              >
                Quienes somos
              </Button>
              <Button
                variant="ghost"
                color="black"
                onClick={() => {
                  navigate('/contacto');
                  onClose();
                }}
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
