import { Categoria, ID, Producto } from "./types";


// ===== Mock =====
const categorias: Categoria[] = [
  { id: 'c1', nombre: 'iPhone', slug: 'iphone' },
  { id: 'c2', nombre: 'iPad', slug: 'ipad' },
  { id: 'c3', nombre: 'Accesorios', slug: 'accesorios' },
];

const productos: Producto[] = [
  {
    id: 'p1',
    nombre: 'iPhone 13 128GB',
    precio: 999999,
    imagen: '/images/iphone13_128_black.jpg',
    destacado: true,
    categoriaId: 'c1',
    capacidad: '128 GB',
    color: 'Negro',
    modelo: 'iPhone 13',
  },
  {
    id: 'p2',
    nombre: 'iPhone 12 64GB',
    precio: 699999,
    imagen: '/images/iphone12_64_white.jpg',
    destacado: true,
    categoriaId: 'c1',
    capacidad: '64 GB',
    color: 'Blanco',
    modelo: 'iPhone 12',
  },
  {
    id: 'p3',
    nombre: 'Cargador USB-C 20W',
    precio: 39999,
    imagen: '/images/cargador_20w.jpg',
    destacado: false,
    categoriaId: 'c3',
  },
];

// ===== Simulación de API =====
// (Devolvemos Promises para que luego reemplaces por fetch/axios sin tocar el resto)
const delay = (ms = 150) => new Promise(res => setTimeout(res, ms));

export async function getCategorias(): Promise<Categoria[]> {
  await delay();
  return categorias;
}

export async function getProductos(): Promise<Producto[]> {
  await delay();
  // podés clonar si querés evitar mutaciones externas:
  return productos.map(p => ({ ...p }));
}

export async function getProductosDestacados(): Promise<Producto[]> {
  const all = await getProductos();
  return all.filter(p => p.destacado);
}

export async function getProductosByCategoriaId(categoriaId: ID): Promise<Producto[]> {
  const all = await getProductos();
  return all.filter(p => p.categoriaId === categoriaId);
}

export async function getProductoById(id: ID): Promise<Producto | undefined> {
  const all = await getProductos();
  return all.find(p => p.id === id);
}
