import {
  Box,
  Text,
  VStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Heading,
  Link,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { FaWhatsapp } from "react-icons/fa";
import { Link as RouterLink } from 'react-router-dom';

const Contacto = () => {
  // const [nombre, setNombre] = useState("");
  // const [correo, setCorreo] = useState("");
  // const [telefono, setTelefono] = useState("");
  // const [mensaje, setMensaje] = useState("");
  // const toast = useToast();

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();

  //   // Validación de los campos
  //   if (!nombre || !correo || !telefono || !mensaje) {
  //     toast({
  //       title: "Por favor completá todos los campos.",
  //       status: "warning",
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //     return;
  //   }

  //   // Parámetros del formulario
  //   const templateParams = {
  //     from_name: nombre,
  //     from_email: correo,
  //     message: mensaje,
  //     phone: telefono,
  //     to_email: "santiiserrano13@gmail.com", 
  //     subject: "Nuevo mensaje de contacto",  
  //   };

  //   // Enviar el correo a través de EmailJS
  //   emailjs
  //     .send(
  //       'service_w50h2ap',        // Tu Service ID
  //       'template_67htvp6',       // Tu Template ID
  //       templateParams,           // Parámetros del formulario
  //       'm4u9YQeCAa4ALwjO4'      // Tu User ID
  //     )
  //     .then(
  //       (response) => {
  //         toast({
  //           title: "Mensaje enviado.",
  //           description: "Gracias por contactarnos.",
  //           status: "success",
  //           duration: 3000,
  //           isClosable: true,
  //         });
  //         // Limpiar el formulario
  //         setNombre("");
  //         setCorreo("");
  //         setTelefono("");
  //         setMensaje("");
  //       },
  //       (error) => {
  //         toast({
  //           title: "Error al enviar el mensaje.",
  //           description: error.text,
  //           status: "error",
  //           duration: 3000,
  //           isClosable: true,
  //         });
  //       }
  //     );
  // };

  return (
    <>
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
          color="#25D366" // verde oficial WhatsApp
          _hover={{ transform: "scale(1.1)" }}
          transition="all 0.3s ease"
        />
      </Link>

      <Box w="100%" px={4} mt={{ base: "15px", md: "80px" }} maxW="700px" mx="auto">
        <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500" />} mb={6}>
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/">Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink as={RouterLink} to="/contacto">Contacto</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        <Heading size="md">Contacto</Heading>

        {/* Información de contacto */}
        <VStack align="start" spacing={5} mb={12} mt={5}>
          <Text fontSize="lg">📞 (2932) 551121</Text>
          <Text fontSize="lg">📞 (2932) 476641</Text>
          <Text fontSize="lg">✉️ santiiserrano13@gmail.com</Text>
          <Text fontWeight="medium" mt={2}>
            📍 Retiro directo en Bahía Blanca y CABA
          </Text>
        </VStack>

        {/* Formulario */}
        {/* <Box as="form" onSubmit={handleSubmit} mb={20}>
          <VStack spacing={4} align="stretch">
            <Input
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
            <Input
              type="tel"
              placeholder="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
            <Textarea
              placeholder="Mensaje"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
            />
            <Button type="submit" colorScheme="blue">
              Enviar
            </Button>
          </VStack>
        </Box> */}
      </Box>
    </>
  );
};

export default Contacto;
