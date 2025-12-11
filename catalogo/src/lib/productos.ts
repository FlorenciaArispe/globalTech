import { api } from './api';
import type { Categoria, ID, Producto, ProductoDetalle, TipoCatalogoItem } from '../types';

export async function fetchProductosCatalogo(
  tipo?: TipoCatalogoItem
): Promise<Producto[]> {
  const { data } = await api.get<Producto[]>('/catalogo', {
    params: {
      tipo,
    },
  });
  return data;
}

export async function fetchCatalogoDestacados(): Promise<Producto[]> {
  const { data } = await api.get<Producto[]>('/catalogo/destacados');
  return data;
}

export async function fetchCategorias(): Promise<Categoria[]> {
 const { data } = await api.get<Categoria[]>('/categorias');
  return data;
}

export async function fetchProductoDetalle(
  itemId: ID,
  tipo: TipoCatalogoItem
): Promise<ProductoDetalle> {
  const { data } = await api.get<ProductoDetalle>('/catalogo/detalle', {
    params: { itemId, tipo },
  });
  return data;
}