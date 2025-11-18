import { api } from './api';
import type { ProductoCatalogoDTO } from '../types';
import type { CatalogoItemDTO } from '../types';

export async function fetchCatalogo(): Promise<CatalogoItemDTO[]> {
  const { data } = await api.get<CatalogoItemDTO[]>('/modelos/catalogo');
  return data;
}


export async function fetchProductosCatalogo(): Promise<ProductoCatalogoDTO[]> {
  const { data } = await api.get<ProductoCatalogoDTO[]>('/catalogo/productos');
 console.log("DATA DE CATALOGO ACA", data)
 
  return data;
}

export async function fetchCatalogoDestacados(): Promise<CatalogoItemDTO[]> {
  const { data } = await api.get<CatalogoItemDTO[]>('/catalogo/destacados');
  console.log("dataaaaaaaaaa", data)
  return data;
}

