import { Box, Image, Text, Stack, Flex } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import type { Producto } from '../types';

type Props = {
  product: Producto;
};

const ProductCard = ({ product }: Props) => {

  const nombre = `${product.modeloNombre} ${product.capacidad ? ` - ${product.capacidad}` : ''} ${product.color ?? ''} ${product.bateriaCondicionPct ? `${product.bateriaCondicionPct}%` : ''}`
    .trim();

  const primeraFoto =
    Array.isArray(product.imagenes) &&
      product.imagenes.length > 0 &&
      product.imagenes[0].url
      ? product.imagenes[0].url
      : "/images/no-image.jpg";

  const badge = (() => {
    switch (product.tipo) {
      case "TRACKED_SELLADO_AGREGADO":
        return "NUEVO SELLADO";
      case "TRACKED_USADO_UNIDAD":
        return "USADO PREMIUM";
      case "NO_TRACK_AGREGADO":
        return "NUEVO";
      default:
        return "";
    }
  })();

  const precioAnterior = product.precio + 35;

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

        <Stack p={3} minH="120px" justify="space-around">
          <Flex direction={"column"}>
            <Text fontSize="16px" fontWeight="semibold" noOfLines={2}>
              {nombre}{" "}
            </Text>
            <Text fontSize="15px" fontWeight="semibold">
              {badge && (
                <Text as="span" fontSize="15px" color="gray.500">
                  {badge}
                </Text>
              )}
            </Text>
          </Flex>


          <Flex direction="row" align={"center"} gap={3}>
            <Text
              fontSize="14px"
              color="gray.400"
              textDecoration="line-through"
            >
              USD ${precioAnterior}
            </Text>

            <Text fontSize="19px" fontWeight="bold" color="green.600">
              USD ${product.precio}
            </Text>
          </Flex>

        </Stack>
      </Box>
    </Link>
  );
};

export default ProductCard;
