// context/CotizacionContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';

interface CotizacionContextProps {
  cotizacion: number | null;
  loading: boolean;
}

const CotizacionContext = createContext<CotizacionContextProps>({
  cotizacion: null,
  loading: true,
});

export const CotizacionProvider = ({ children }: { children: React.ReactNode }) => {
  const [cotizacion, setCotizacion] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const cargar = async () => {
  //     const valor = await obtenerCotizacionDelDia();
  //     setCotizacion(valor);
  //     setLoading(false);
  //   };
  //   cargar();
  // }, []);

  return (
    <CotizacionContext.Provider value={{ cotizacion, loading }}>
      {children}
    </CotizacionContext.Provider>
  );
};

export const useCotizacionContext = () => useContext(CotizacionContext);
