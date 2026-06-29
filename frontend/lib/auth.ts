'use client';

const KEY = 'lab-queue-admin-secret';

export function getSecret(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(KEY) ?? '';
}

export function setSecret(secret: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, secret);
}

export function clearSecret() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
}

export function isLoggedIn(): boolean {
  return getSecret().length > 0;
}
