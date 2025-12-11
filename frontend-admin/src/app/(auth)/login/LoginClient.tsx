'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box, Button, Input, VStack, Heading, useToast,
  FormControl, FormLabel, InputGroup, InputRightElement,
  Flex,
  Image,
  IconButton,
} from '@chakra-ui/react';
import { api } from '@/lib/axios';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { setToken } from '@/lib/auth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const next = searchParams.get('next') || '/home';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({ status: 'warning', title: 'Completá usuario y contraseña' });
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/login', { username, password });
      const token: string = data.token || data.access_token || data.accessToken;
      setToken(token);
      toast({ status: 'success', title: '¡Bienvenido!' });
      router.replace(next);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'No se pudo iniciar sesión';
      toast({ status: 'error', title: 'Error de login', description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      minH="100vh"
      bg="#f6f6f6"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={{ base: 4, md: 0 }}              
    >
      <Box
        bg="white"
        borderRadius={{ base: 0, md: '25px' }} 
        boxShadow="lg"
        w={{ base: '100%', md: '450px', lg: '750px' }} 
      >
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          align={{ base: 'stretch', lg: 'center' }}    
          justify="center"
        >
          <Box
            flex={{ base: '1 1 auto', lg: '0 0 50%' }}
            w={{ base: '100%', lg: 'auto' }}    
            p={4}
          >
            <VStack p={4} spacing={6} as="form" onSubmit={handleSubmit}>
              <Heading
                size="lg"
                fontWeight={700}
              >
                Iniciar sesión
              </Heading>
              <FormControl isRequired>
                <FormLabel>Usuario</FormLabel>
                <Input
                  bg={"white"}
                  sx={{
                    '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus': {
                      boxShadow: '0 0 0 1000px #fff inset !important',
                      WebkitTextFillColor: '#1A202C',
                      caretColor: '#1A202C',
                      transition: 'background-color 9999s ease-out 0s',
                    },
                    '&:-moz-autofill': {
                      boxShadow: '0 0 0 1000px #fff inset !important',
                    },
                    '&:autofill': {
                      boxShadow: '0 0 0 1000px #fff inset !important',
                    },
                  }}
                  autoComplete="username"
                  placeholder="Usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Contraseña</FormLabel>
                <InputGroup>
                  <Input
                    bg={"white"}
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    sx={{
                      '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus': {
                        boxShadow: '0 0 0 1000px #fff inset !important',
                        WebkitTextFillColor: '#1A202C',
                        caretColor: '#1A202C',
                        transition: 'background-color 9999s ease-out 0s',
                      },
                      '&:-moz-autofill': { boxShadow: '0 0 0 1000px #fff inset !important' },
                      '&:autofill': { boxShadow: '0 0 0 1000px #fff inset !important' },
                    }}
                    placeholder="Ingresá tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <InputRightElement>
                    <IconButton
                      variant="ghost"
                      aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                      icon={showPass ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPass((s) => !s)}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <Button
                type="submit"
                bg={"#2c7ef4"}
                color="white"
                width="full"
                isLoading={submitting}
                isDisabled={!username || !password}
              >
                Iniciar sesión
              </Button>
            </VStack>
          </Box>

          <Box
            flex={{ base: '0 0 auto', lg: '1 1 50%' }}
            alignItems="center"
            justifyContent="center"
            display={{ base: 'none', lg: 'flex' }}
          >
            <Image
              src="/LOGO-PRINCIPAL.jpeg"
              alt="Logo Global Technology"
              boxSize={{ base: '100%', md: '100%' }}
              objectFit="contain"
              borderTopRightRadius="23px"
              borderBottomRightRadius="23px"
              borderBottomLeftRadius="50px"
            />
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}