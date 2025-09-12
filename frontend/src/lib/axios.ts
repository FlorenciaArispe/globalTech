// src/lib/axios.ts
import axios from 'axios';
import { getToken, clearToken } from './auth';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE, // ej: http://localhost:8085 o /api
});

// Adjunta el token si existe
api.interceptors.request.use((config) => {
  const token = getToken?.();
  if (token) {
    // headers puede venir undefined
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el backend devuelve 401, limpiamos sesión (opcional)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearToken?.();
      // opcional: redirigir a /login
      // if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
