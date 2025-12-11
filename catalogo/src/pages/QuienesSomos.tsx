import { ChevronRightIcon } from '@chakra-ui/icons'
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Heading, Link, Text, Stack } from '@chakra-ui/react'
import { FaWhatsapp } from 'react-icons/fa'
import { Link as RouterLink } from 'react-router-dom';

export default function QuienesSomos() {
    return (
        <Box w="100%" px={4} mt={{ base: "15px", md: "80px" }} maxW="900px" mx="auto">
            
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

            <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500" />} mb={6}>
                <BreadcrumbItem>
                    <BreadcrumbLink as={RouterLink} to="/">Inicio</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                    <BreadcrumbLink as={RouterLink} to="/quienes-somos">Quiénes Somos</BreadcrumbLink>
                </BreadcrumbItem>
            </Breadcrumb>

            <Heading size="md" mb={5}>Quiénes Somos</Heading>

            <Stack spacing={4} lineHeight="1.7" color="gray.700" mb={16}>

                <Text>
                    <b>Global Technology</b> es la empresa líder de Bahía Blanca en venta de iPhones, reconocida por la
                    <b> calidad, seguridad y confianza</b> que brinda a cada cliente. Con un local propio, ofrecemos una
                    experiencia de compra presencial segura, transparente y con atención personalizada.
                </Text>

                <Text>
                    Nos especializamos en <b>iPhones usados premium</b>, seleccionados cuidadosamente, en excelente estado
                    y con <b>garantía oficial de 90 días</b> a través de nuestro servicio técnico.
                </Text>

                <Text>
                    Además, contamos con nuestro <b>Plan Canje</b>: podés entregar tu iPhone usado como parte de pago,
                    lo cotizamos en el momento y solo abonás la diferencia para llevarte un equipo superior. Fácil, rápido
                    y sin vueltas.
                </Text>

                <Text>
                    Realizamos <b>envíos seguros a todo el país</b>, con seguimiento y total respaldo para que tu compra
                    llegue en tiempo y forma, sin importar dónde estés.
                </Text>

                <Text fontWeight="semibold" mt={2}>
                    En Global Technology trabajamos para que tengas la mejor experiencia y el mejor iPhone al mejor precio.
                </Text>

            </Stack>

        </Box>
    );
}
