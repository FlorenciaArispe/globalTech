import { Box, Text } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

const scroll = keyframes`
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
`;

const SectionSale = () => {
  return (
    <Box
      bg="black"
      color="white"
      w="100%"
      overflow="hidden"
      py={2}
    >
      <Box
        display="inline-block"
        whiteSpace="nowrap"
        animation={`${scroll} 20s linear infinite`}
      >
        <Text mx={8} fontSize="sm">
          Envíos a todo el país &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
          Pago en pesos o dólares &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
          Plan canje: con tu iPhone usado te damos uno nuevo
        </Text>
      </Box>
    </Box>
  );
};

export default SectionSale;
