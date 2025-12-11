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
          color="#25D366" 
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

        <VStack align="start" spacing={5} mb={12} mt={5}>
          <Text fontSize="lg">📞 (2932) 551121</Text>
          <Text fontSize="lg">✉️ santiiserrano13@gmail.com</Text>
          <Text fontWeight="medium" mt={2}>
            📍 Local físico en Bahía Blanca, consultar dirección.
          </Text>
        </VStack>

      </Box>
    </>
  );
};

export default Contacto;
