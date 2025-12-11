export type ID = number | string;

export type Categoria = {
  id: string;
  nombre: string;
};

export type TipoCatalogoItem =
  | 'TRACKED_USADO_UNIDAD'
  | 'TRACKED_SELLADO_AGREGADO'
  | 'NO_TRACK_AGREGADO';

  export type VarianteOpcionCatalogoDTO = {
  color: string | null;
  capacidad: string | null;
  stock: number;
};

export interface Producto {
  itemId: ID;                     
  modeloId: ID;               
  modeloNombre: string;
  categoriaId: ID;
  categoriaNombre: string;
  tipo: TipoCatalogoItem;
  color: string | null;
  capacidad: string | null;
  bateriaCondicionPct: number | null;
  precio: number;
  imagenUrl: string | null;  
}

export interface ProductoDetalle {
  id: ID;
  modeloId: ID;
  modeloNombre: string;
  categoriaId: ID;
  categoriaNombre: string;
  marcaID: ID;
  marcaNombre: string;
  tipo: TipoCatalogoItem;
  color: string | null;
  capacidad: string | null;
  bateriaCondicionPct: number | null;
  precio: number;
  enStock: boolean;
  stockTotal: number;
  variantesEnStock: VarianteOpcionCatalogoDTO[];
  imagenes: {
    id: number;
    url: string;
    altText: string | null;
    set: 'CATALOGO' | 'SELLADO' | 'USADO';
    orden: number;
  }[];
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

