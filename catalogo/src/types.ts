export type ID = string;

export interface Categoria {
  id: ID;
  nombre: string;
  slug: string;
}

export interface Producto {
  id: ID;
  nombre: string;
  precio: number;
  imagen: string;
  destacado?: boolean;
  categoriaId: ID;
  capacidad?: string;
  color?: string;
  modelo?: string;
}

export type ProductoCatalogoDTO = {
  id: number;
  nombre: string;
  categoria: string;
  marca: string;
  variantes: {
    id: number;
    color?: string | null;
    capacidad?: string | null;
    precio: number;
    imagenes: string[];
  }[];
};