// catalogo/src/lib/productos.ts
import { api } from './api';
import type { ProductoCatalogoDTO } from '../types';

export async function fetchProductosCatalogo(): Promise<ProductoCatalogoDTO[]> {
  const { data } = await api.get<ProductoCatalogoDTO[]>('/catalogo/productos');
 console.log("DATA DE CATALOGO ACA", data)
 
  return data;
}
