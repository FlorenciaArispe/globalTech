import { Box, Image, Text, Stack, Flex } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import type { Producto, TipoCatalogoItem } from '../types';

type Props = {
  product: Producto;
  destacado: boolean;
};

const ProductCard = ({ product, destacado }: Props) => {

  const nombre = `${product.modeloNombre} ${product.capacidad ? ` - ${product.capacidad}` : ''} ${product.color ?? ''} ${product.bateriaCondicionPct ? `${product.bateriaCondicionPct}%` : ''}`
    .trim();

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

  const imagenSrc = product.imagenUrl ?? '/images/default.png';

  return (
    <Link
      to={`/productos/${product.itemId}`}
      state={{
        tipo: product.tipo as TipoCatalogoItem,
      }}
    >
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        bg="white"
        boxShadow="lg"
        cursor="pointer"
      >
        <Image
          src={imagenSrc}
          alt={nombre}
          width="100%"
          height={destacado ? "220px" : "180px"}
          objectFit="cover"
        />

        <Stack p={3} h={destacado ? "125px" : "120px"} justify="space-between">
          <Flex direction={"column"}>
            <Text fontSize={destacado ? "16px" : "14px"} fontWeight="semibold" noOfLines={2}>
              {nombre}{" "}
            </Text>

            {badge && (
              <Text as="span" fontSize={destacado ? "15px" : "14px"} color="gray.500" fontWeight="semibold">
                {badge}
              </Text>
            )}
          </Flex>

          <Flex direction="row" align={"center"} gap={3} >
            {destacado &&
              <Text
                fontSize="14px"
                color="gray.400"
                textDecoration="line-through"
              >
                USD ${precioAnterior}
              </Text>
            }

            <Text fontSize={destacado ? "19px" : "17px"} fontWeight="bold" color="green.600">
              USD ${product.precio}
            </Text>
          </Flex>

        </Stack>
      </Box>
    </Link>
  );
};

export default ProductCard;
