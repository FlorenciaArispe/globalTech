import axios from 'axios';
import { getToken /*, clearToken, clearUser */ } from './auth';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const t = getToken();
  config.headers = config.headers ?? {};
  if (t) (config.headers as any).Authorization = `Bearer ${t}`;

  const short = t ? t.slice(0, 12) + '…' + t.slice(-8) : 'NO_TOKEN';
  console.log(`[api] OUT ${config.method?.toUpperCase()} ${config.baseURL}${config.url} Authorization=${short}`);
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const s = err?.response?.status;
    console.log('[api] ERROR', s, err?.config?.method?.toUpperCase(), err?.config?.url, err?.response?.data);
    // NO limpiar aquí por ahora:
    // if (s === 401) { clearToken(); clearUser(); }
    return Promise.reject(err);
  }
);
