import {
  Box,
  Button,
  Flex,
  Icon,
  Image,
  Input,
  Select,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Text,
  useSteps,
  VStack,
  Divider,
  RadioGroup,
  Stack,
  Radio,
  Collapse,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink
} from "@chakra-ui/react";

import { FiMapPin, FiTruck } from "react-icons/fi";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { useState } from "react";

const steps = [
  { title: "Productos", description: "Carrito" },
  { title: "Entrega", description: "Datos de envío" },
  { title: "Pago", description: "Confirmación" },
];

function Carrito() {
  const { activeStep, setActiveStep } = useSteps({ index: 0, count: steps.length });
  const [deliveryOption, setDeliveryOption] = useState("retiro");
  const [shippingType, setShippingType] = useState("sucursal");

  const mockCart = [
    {
      id: 1,
      name: "iPhone 16",
      capacity: "128GB",
      description: "Negro espacial",
      quantity: 1,
      price: 1200,
      image: "/images/iphone_mock.png",
    },
  ];

  const subtotal = mockCart.reduce((acc, item) => acc + item.quantity * item.price, 0);

  return (
    <Box w="100%" px={4} mt={{ base: "65px", md: "80px" }}>
      {/* Breadcrumb */}
      <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500" />} mb={4}>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink href="/productos">Productos</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Box p={4} maxW="900px" mx="auto">
        <Stepper index={activeStep} size="md" colorScheme="blue" mb={6}>
          {steps.map((step, index) => (
            <Step key={index} onClick={() => setActiveStep(index)} cursor="pointer">
              <StepIndicator>
                <StepStatus complete={<StepIcon />} incomplete={<StepNumber />} active={<StepNumber />} />
              </StepIndicator>
              <Box flexShrink="0">
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </Box>
              <StepSeparator />
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box>
            {mockCart.map((item) => (
              <Flex key={item.id} mb={4} gap={4} align="center">
                <Image src={item.image} boxSize="80px" />
                <Box>
                  <Text fontWeight="bold">{item.name} - {item.capacity}</Text>
                  <Text>{item.description}</Text>
                  <Text fontWeight="semibold">${item.price}</Text>
                </Box>
              </Flex>
            ))}
            <Divider my={4} />
            <Text fontSize="xl" fontWeight="bold">Total: ${subtotal}</Text>
            <Button colorScheme="blue" mt={4} onClick={() => setActiveStep(1)}>Continuar</Button>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Text fontWeight="bold" mb={2}>Entrega</Text>
            <RadioGroup onChange={setDeliveryOption} value={deliveryOption} mb={4}>
              <Stack direction="row">
                <Radio value="retiro">Punto de retiro</Radio>
                <Radio value="envio">Envío</Radio>
              </Stack>
            </RadioGroup>

            <Collapse in={deliveryOption === "envio"}>
              <VStack spacing={3} align="stretch">
                <Select placeholder="País" />
                <Select placeholder="Provincia" />
                <Input placeholder="DNI" />
                <Input placeholder="Nombre" />
                <Input placeholder="Apellido" />
                <Input placeholder="Teléfono" />
                <RadioGroup onChange={setShippingType} value={shippingType} mb={2}>
                  <Stack direction="row">
                    <Radio value="sucursal">A sucursal</Radio>
                    <Radio value="domicilio">A domicilio</Radio>
                  </Stack>
                </RadioGroup>
                <Collapse in={shippingType === "domicilio"}>
                  <VStack spacing={3} align="stretch">
                    <Input placeholder="Calle" />
                    <Input placeholder="Número" />
                    <Input placeholder="Departamento" />
                    <Input placeholder="Piso" />
                    <Input placeholder="Ciudad" />
                    <Input placeholder="Código postal" />
                  </VStack>
                </Collapse>
              </VStack>
            </Collapse>

            {deliveryOption === "retiro" && (
              <Box mt={4} p={3} bg="gray.50" borderRadius="md">
                <Text><Icon as={FiMapPin} mr={2} />A coordinar con el vendedor al finalizar la compra.</Text>
              </Box>
            )}

            <Flex justify="space-between" mt={6}>
              <Button onClick={() => setActiveStep(0)}>Volver</Button>
              <Button colorScheme="blue" onClick={() => setActiveStep(2)}>Continuar al pago</Button>
            </Flex>
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Text fontWeight="bold" mb={2}>Detalles de tu compra</Text>
            <Text mb={4}>Productos: {mockCart.length}</Text>

            {deliveryOption === "envio" ? (
              <Box mb={4} p={3} bg="gray.50" borderRadius="md">
                <Text fontWeight="bold" mb={2}><Icon as={FiTruck} mr={2} />Envío</Text>
                <Text>Tarda entre 2 y 3 días hábiles</Text>
                <Text>Dirección a confirmar por correo</Text>
              </Box>
            ) : (
              <Box mb={4} p={3} bg="gray.50" borderRadius="md">
                <Text fontWeight="bold" mb={2}><Icon as={FiMapPin} mr={2} />Punto de retiro</Text>
                <Text>Gratis - A coordinar con el vendedor</Text>
              </Box>
            )}

            <Box mb={4}>
              <Text fontWeight="bold">Datos de facturación</Text>
              <Text>Juan Pérez</Text>
              <Text>DNI 12345678</Text>
              <Text>Teléfono 1122334455</Text>
            </Box>

            <Box mb={6}>
              <Text fontWeight="bold">Medio de pago</Text>
              <Text>Recibirás un mensaje por WhatsApp con los detalles y opciones para abonar.</Text>
            </Box>

            <Flex justify="space-between">
              <Button onClick={() => setActiveStep(1)}>Volver</Button>
              <Button colorScheme="green">Finalizar compra</Button>
            </Flex>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Carrito;
