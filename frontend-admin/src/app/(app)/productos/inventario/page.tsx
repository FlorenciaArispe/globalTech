import { Box, Container, Text } from "@chakra-ui/react";

export default function InventarioPage() { 
    return(
<Box bg="#f6f6f6" minH="100dvh">
         <Container maxW="container.lg" pt={10} px={{ base: 4, md: 6 }}>
           <Text fontSize="30px" fontWeight={600} mb={4}>Inventario</Text>
           </Container>
           </Box>
    )

    
    }