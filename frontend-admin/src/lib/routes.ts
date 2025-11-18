import { type LucideIcon, Home, Package , DollarSign, Boxes, ListChecks, Tags, Stamp, User, BoxIcon, Star } from 'lucide-react';

export type AppRoute = {
  label: string;
  href?: string;
  icon?: LucideIcon;
  children?: { label: string; href: string; icon?: LucideIcon }[];
};

export const appRoutes: AppRoute[] = [
  { href: '/home', label: 'Inicio', icon: Home },
  {
    label: 'Productos',
    icon: Package,
    children: [
      { href: '/productos', label: 'Productos', icon: Boxes },
      { href: '/productos/inventario', label: 'Inventario', icon: ListChecks },
       { href: '/productos/destacados', label: 'Destacados', icon: Star },
      { href: '/productos/modelos', label: 'Modelos', icon: BoxIcon },
      { href: '/productos/categorias', label: 'Categorías', icon: Tags },
      { href: '/productos/marcas', label: 'Marcas', icon: Stamp },
     
    ],
  },
  { href: '/ventas', label: 'Ventas', icon: DollarSign },
     { href: '/clientes', label: 'Clientes', icon: User },
];
