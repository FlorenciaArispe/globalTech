// src/lib/routes.ts
import { type LucideIcon, Home, Package, DollarSign } from 'lucide-react';

export type AppRoute = {
  label: string;
  href?: string;
  icon?: LucideIcon;
  children?: { label: string; href: string }[];
};

export const appRoutes: AppRoute[] = [
  { href: '/home', label: 'Inicio', icon: Home },
  {
    label: 'Productos',
    icon: Package,
    children: [
      { href: '/productos', label: 'Productos' },
      { href: '/productos/inventario', label: 'Inventario' },
      { href: '/productos/categorias', label: 'Categorías' },
    ],
  },
  { href: '/ventas', label: 'Ventas', icon: DollarSign },
];
