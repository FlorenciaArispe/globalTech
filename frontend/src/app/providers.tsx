'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { Provider as ReduxProvider } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { makeStore, makePersistor } from '@/store';
import { PersistGate } from 'redux-persist/integration/react';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const storeRef = useRef(makeStore());
  const [persistor, setPersistor] = useState<ReturnType<typeof makePersistor> | null>(null);
  useEffect(() => {
    const p = makePersistor(storeRef.current);
    setPersistor(p);
  }, []);

  return (
    <ReduxProvider store={storeRef.current}>
      {persistor ? (
        <PersistGate loading={null} persistor={persistor}>
          <ChakraProvider>{children}</ChakraProvider>
        </PersistGate>
      ) : (
        <ChakraProvider>{children}</ChakraProvider>
      )}
    </ReduxProvider>
  );
}
