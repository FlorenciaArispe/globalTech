import { api } from './api';
import type { ProductoCatalogoDTO, ProductoDestacado } from '../types';

// export async function fetchCatalogo(): Promise<CatalogoItemDTO[]> {
//   const { data } = await api.get<CatalogoItemDTO[]>('/modelos/catalogo');
//   return data;
// }


export async function fetchProductosCatalogo(): Promise<ProductoCatalogoDTO[]> {
  const { data } = await api.get<ProductoCatalogoDTO[]>('/catalogo/productos');
 console.log("DATA DE CATALOGO ACA", data)
 
  return data;
}

export async function fetchCatalogoDestacados(): Promise<ProductoDestacado[]> {
  const { data } = await api.get<ProductoDestacado[]>('/catalogo/destacados');
  console.log("dataaaaaaaaaa", data)
  return data;
}

