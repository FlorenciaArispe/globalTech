import { Box, Image, Text, Stack, Badge } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }: any) => {
  

  const nombre =
    product.categoria === 1 || product.categoria === 2
      ? `${product.modelo || ''} ${product.capacidad || ''}`.trim()
      : product.nombre;

  const primeraFoto =
    Array.isArray(product.fotos) && product.fotos.length > 0
      ? product.fotos[0]
      : "/images/no-image.jpg";

  // Precio en pesos (solo si no es categoría 3)
  // const precioPesos =
  //   product.categoria !== 3 && !loading && cotizacion
  //     ? (product.minorista * cotizacion).toLocaleString('es-AR', {
  //         style: 'currency',
  //         currency: 'ARS',
  //       })
  //     : null;

  return (
    <Link to={`/productos/${product.id}`}>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        bg="white"
        boxShadow="lg"

        cursor="pointer"
      >
        <Image
          src={primeraFoto}
          alt={nombre}
          width="100%"
          height="220px"
          objectFit="cover"
        />
        <Stack p={3} minH="125px" justify="space-between">
          <Text fontSize="15px" fontWeight="semibold" noOfLines={2}>
            {nombre}{" "}
            {product.categoria === 1 && (
              <Text  fontSize="15px" as="span"  color="gray.500">
                - NUEVO SELLADO
              </Text>
            )}
            {product.categoria === 2 && (
              <Text as="span"  fontSize="15px" color="gray.500">
                - USADO PREMIUM
              </Text>
            )}
          </Text>

          <Box>
            {product.categoria === 3 ? (
              <Text fontSize="20px" fontWeight="bold" color="green.600">
                
               
                {product.minorista.toLocaleString('es-AR', {
                  style: 'currency',
                  currency: 'ARS',
                })}{" "}
              
                 
               
              </Text>
            ) : (
              <>
                <Text fontSize="19px" fontWeight="bold" color="green.600">
                  USD ${product.minorista}
                </Text>
                {/* {!loading && precioPesos && (
                  <Text fontSize="14px"color="gray.600">
                    {precioPesos}
                    <Badge ml={2} h="20px" colorScheme="blue" variant="subtle">
                      ARG
                    </Badge>
                  </Text>
                )} */}
              </>
            )}
          </Box>
        </Stack>
      </Box>
    </Link>
  );
};

export default ProductCard;
