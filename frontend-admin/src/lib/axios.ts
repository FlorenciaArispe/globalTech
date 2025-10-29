// /lib/axios.ts
import axios from 'axios';
import { getToken, clearToken, clearUser } from './auth';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE, // ej: http://localhost:8085
  withCredentials: false,
});

// Interceptor de salida (antes de hacer la request)
api.interceptors.request.use((config) => {
  // nos aseguramos que headers existe
  config.headers = config.headers ?? {};

  // 1. Authorization
  const token = getToken?.();
  if (token) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  } else {
    delete (config.headers as any).Authorization;
  }

  // 2. Content-Type dinámico
  //
  // - Si estoy subiendo FormData (archivos), NO tocar Content-Type.
  //   Axios va a poner multipart/form-data con boundary correcto.
  //
  // - Si NO es FormData y todavía no hay Content-Type,
  //   lo forzamos a application/json.
  //
  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;

  if (!isFormData) {
    // body normal (JSON). Seteamos si el header no vino ya seteado a mano.
    if (!(config.headers as any)['Content-Type']) {
      (config.headers as any)['Content-Type'] = 'application/json';
    }
  } else {
    // body = FormData → asegurate de NO dejar el JSON anterior pegado
    if ((config.headers as any)['Content-Type'] === 'application/json') {
      delete (config.headers as any)['Content-Type'];
    }
  }

  // 3. Log (útil para ver en consola del browser)
  const shownAuth = String((config.headers as any).Authorization ?? 'NO_TOKEN');
  const shownCT = String((config.headers as any)['Content-Type'] ?? 'AUTO(MULTIPART)');
  console.log(
    `[api] ${config.method?.toUpperCase()} ${api.defaults.baseURL}${config.url} Authorization=${shownAuth} CT=${shownCT}`
  );

  return config;
});

// Interceptor de respuesta
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
