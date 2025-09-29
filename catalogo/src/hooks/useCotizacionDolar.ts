import { useEffect, useState } from 'react';
import { obtenerCotizacionDelDia } from '../supabase/cotizacion.service';

const useCotizacionDolar = () => {
  const [cotizacion, setCotizacion] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  console.log("Cargando cotización...");
  const cargar = async () => {
    const valor = await obtenerCotizacionDelDia();
    console.log("Cotización cargada desde hook:", valor);
    setCotizacion(valor);
    setLoading(false);
  };
  cargar();
}, []);

  return { cotizacion, loading };
};

export default useCotizacionDolar;
