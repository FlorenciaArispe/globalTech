import axios from 'axios';
import { getToken, clearToken, clearUser } from './auth';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE, // http://localhost:8085
  headers: { 'Content-Type': 'application/json' },
});

// setear en el arranque (por si recargás la página)
const bootToken = getToken?.();
if (bootToken) api.defaults.headers.common.Authorization = `Bearer ${bootToken}`;

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // limpiar sesión y (opcional) redirigir desde un handler más arriba
      clearToken();
      clearUser();
    }
    return Promise.reject(err);
  }
);
