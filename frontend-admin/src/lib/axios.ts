// /lib/axios.ts
import axios from 'axios';
import { getToken, clearToken, clearUser } from './auth';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE, // http://localhost:8085
  headers: { 'Content-Type': 'application/json' },
});

// NO seteamos Authorization por default acá. Siempre via interceptor.

api.interceptors.request.use((config) => {
  const token = getToken?.();
  config.headers = config.headers ?? {};
  if (token) {
    const authHeader = `Bearer ${token}`;
    (config.headers as any).Authorization = authHeader;
  } else {
    delete (config.headers as any).Authorization;
  }

  // log claro de lo que REALMENTE va a salir
  const shown = String((config.headers as any).Authorization ?? 'NO_TOKEN');
  console.log(
    `[api] ${config.method?.toUpperCase()} ${api.defaults.baseURL}${config.url} Authorization=`,
    shown
  );

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const st = err?.response?.status;
    console.log('[api] ERROR', st, err?.config?.url, err?.response?.data ?? '');
    if (st === 401) {
      clearToken?.();
      clearUser?.();
    }
    return Promise.reject(err);
  }
);
