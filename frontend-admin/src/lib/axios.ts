import axios from 'axios';
import { getToken, clearToken, clearUser } from './auth';

const isServer = typeof window === 'undefined';
const BASE =
  (isServer ? process.env.INTERNAL_API_BASE : process.env.NEXT_PUBLIC_API_BASE) ?? '';

export const api = axios.create({
  baseURL: BASE, 
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken?.();
  config.headers = config.headers ?? {};
  if (token) {
    const authHeader = `Bearer ${token}`;
    (config.headers as any).Authorization = authHeader;
  } else {
    delete (config.headers as any).Authorization;
  }

  const shown = String((config.headers as any).Authorization ?? 'NO_TOKEN');

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const st = err?.response?.status;
    if (st === 401) {
      clearToken?.();
      clearUser?.();
    }
    return Promise.reject(err);
  }
);
