import { Box, Container, Text } from '@chakra-ui/react'
import React from 'react'

export default function Home() {
  return (
    <Box  bg="#f6f6f6" minH="100dvh" >
       
      <Container bg="#f6f6f6" maxW="container.lg" pt={10}>
       <Text fontSize={"30px"}>Inicio</Text>

      </Container>
    </Box>
  )
}
