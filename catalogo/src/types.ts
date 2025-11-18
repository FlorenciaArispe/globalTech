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

export type CatalogoItemDTO = {
  itemId: number;
  modeloId: number;
  modeloNombre: string;

  categoriaId: number;
  categoriaNombre: string;

  marcaId: number;
  marcaNombre: string;

  tipo: 'TRACKED_SELLADO_AGREGADO' | 'TRACKED_USADO_UNIDAD' | 'NO_TRACK_AGREGADO';

  color: string | null;
  bateriaCondicionPct: number | null;

  precio: number | null;

  enStock: boolean;
  stockTotal: number;

  coloresEnStock: string[];
  capacidadesEnStock: string[];

  imagenes: {
    id: number;
    url: string;
    altText: string | null;
    set: 'CATALOGO' | 'SELLADO' | 'USADO';
    orden: number;
  }[];
};
