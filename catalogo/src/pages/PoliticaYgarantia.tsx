import React from 'react';
import { Box, Text, Divider, VStack, Link, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Heading } from '@chakra-ui/react';
import { FaWhatsapp } from 'react-icons/fa';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';

const PoliticaYgarantia = () => {
    return (
             <Box w="100%" px={4} mt={{ base: "15px", md: "80px" }} maxW="900px" mx="auto" mb={12}>
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
                <BreadcrumbLink as={RouterLink} to="/politicaygarantia">Devolución y garantía</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
  <Heading size="md" mb={4} textAlign={"center"}>Políticas de devolución y garantía</Heading>
   <Divider borderColor="gray.200" mb={4} />
            <VStack spacing={6} align="start" pl={6} pr={6}>
                
                <Box w="100%" textAlign={"center"}>
                    <Text fontSize="lg" fontWeight="bold" mb={2}>¿Cuáles son las condiciones de garantía para iPhones usados premium?</Text>
                   
                    <Text fontSize="sm" color="gray.600">
                        La garantía cubre defectos de fabricación por un periodo de 90 días desde la fecha de compra. No cubre daños por mal uso, como golpes, caídas o agua.
                    </Text>
                </Box>
                <Box w="100%" textAlign={"center"}>
                     <Divider borderColor="gray.200" mb={4} />
                    <Text fontSize="lg" fontWeight="bold" mb={2}>Cuál es la garantía para equipos sellados?</Text>
                   
                    <Text fontSize="sm" color="gray.600">
                        Todos los equipos sellados tienen 1 año de garantía oficial Apple, que empieza a correr desde el momento en el que el equipo se prende por primera vez.
                    </Text>
                </Box>

                <Box w="100%" textAlign={"center"}>
                     <Divider borderColor="gray.200" mb={4} />
                    <Text fontSize="lg" fontWeight="bold" mb={2}>¿Cómo realizo una devolución?</Text>
                   
                    <Text fontSize="sm" color="gray.600">
                        Para realizar una devolución, contactanos via WhatsApp o Instragram.
                    </Text>
                </Box>

                <Box w="100%" textAlign={"center"}>
                     <Divider borderColor="gray.200" mb={4} />
                    <Text fontSize="lg" fontWeight="bold" mb={2}>¿Cuál es la política de devolución?</Text>
                   
                    <Text fontSize="sm" color="gray.600">
                       Podes devolver el iPhone usado Premium será dentro de las primeras 24 horas tras la realización del pago. Pasado este tiempo, no es posible efectuar cambios o cancelaciones. Los iPhones sellados no tienen devolución.
                    </Text>
                </Box>

            </VStack>
       
        
        </Box>
      
    );
};

export default PoliticaYgarantia;
