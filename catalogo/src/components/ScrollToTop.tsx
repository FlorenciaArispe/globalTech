import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Siempre hace scroll al top cuando cambia la ruta
    window.scrollTo({ top: 0, behavior: 'instant' }); // instant evita el salto animado
  }, [pathname]);

  return null;
};

export default ScrollToTop;
