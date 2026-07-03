'use client';

const KEY = 'lab-queue-ta-token';

export function getToken(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(KEY) ?? '';
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, token);
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
}

export function isLoggedIn(): boolean {
  return getToken().length > 0;
}
