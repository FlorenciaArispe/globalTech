export const TOKEN_KEY = 'jwt';
export const USER_KEY = 'user';

export function setToken(token: string) {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
}
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function clearToken() {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
}

export const setUser = (u: string) => localStorage.setItem(USER_KEY, u);
export const getUser = () => (typeof window === 'undefined' ? null : localStorage.getItem(USER_KEY));
export const clearUser = () => localStorage.removeItem(USER_KEY);

export function logoutAll() {
  try {
    localStorage.removeItem('persist:root');
  } catch {}
  clearToken();
  clearUser();
}

export function isAuthenticated() {
  return !!getToken();
}
