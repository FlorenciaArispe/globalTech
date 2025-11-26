import { api } from './api';
import type { Categoria, Producto } from '../types';

export async function fetchProductosCatalogo(): Promise<Producto[]> {
  const { data } = await api.get<Producto[]>('/catalogo/productos');
 console.log("DATA DE CATALOGO ACA", data)
 
  return data;
}

export async function fetchCatalogoDestacados(): Promise<Producto[]> {
  const { data } = await api.get<Producto[]>('/catalogo/destacados');
  console.log("DESTACADOS", data)
  return data;
}

export async function fetchCategorias(): Promise<Categoria[]> {
 const { data } = await api.get<Categoria[]>('/categorias');
  console.log("categorias", data)
  return data;
}

