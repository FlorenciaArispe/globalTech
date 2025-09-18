// src/lib/axios.ts
import axios from 'axios';
import { getToken, clearToken } from './auth';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE, // http://localhost:8085
});

console.log('[api] baseURL =', api.defaults.baseURL);

api.interceptors.request.use((config) => {
  const token = getToken?.();
  const short = token ? token.slice(0,12)+'…'+token.slice(-8) : 'NO_TOKEN';
  console.log(`[api] ${config.method?.toUpperCase()} ${config.baseURL}${config.url} auth=`, short);

  // aseguro objeto headers y seteo Authorization
  config.headers = config.headers ?? {};
  if (token) (config.headers as any).Authorization = `Bearer ${token}`;

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.log('[api] ERROR', err?.response?.status, err?.response?.data);
    if (err?.response?.status === 401) {
      clearToken?.();
      // opcional: window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
