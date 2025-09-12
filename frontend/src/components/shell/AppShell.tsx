'use client';

import { ReactNode } from 'react';
import { Box, Drawer, DrawerContent } from '@chakra-ui/react';

import type { UseDisclosureReturn } from '@chakra-ui/react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import { useDispatch } from 'react-redux';

import { logout } from '@/store/slices/authSlice';
import { logoutAll } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function AppShell({
  disclosure,
  children,
}: {
  disclosure: UseDisclosureReturn;
  children: ReactNode;
}) {
      const dispatch = useDispatch();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = disclosure;

   const handleLogout = () => {
    dispatch(logout());  
    logoutAll(); 
    router.replace('/login');
  };

  return (
    <Box w="100%" h="100dvh">
      <Topbar onOpenMenu={onOpen} />
      <Box display={{ base: 'none', lg: 'block' }} position="fixed" top="64px" left="0" h="calc(100dvh - 64px)" w="260px" borderRightWidth="1px" bg="white" _dark={{ bg: 'gray.800' }}>
        <Sidebar onNavigate={onClose} />
      </Box>
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerContent pt="64px" w="260px">
          <Sidebar onNavigate={handleLogout} />
        </DrawerContent>
      </Drawer>
      <Box pl={{ base: 0, lg: '260px' }} pt="64px">
        {children}
      </Box>
    </Box>
  );
}
