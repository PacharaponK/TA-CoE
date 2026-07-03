'use client';

/**
 * Remembers which studentId this browser last used to join a queue, so the
 * queue page can alert "you're up" without any student login. Scoped to
 * localStorage — a different device/tab simply won't get the alert.
 */
const KEY = 'queue:myStudentId';
const EVENT = 'myqueue:changed';

export function getMyStudentId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEY);
}

export function setMyStudentId(studentId: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, studentId);
  window.dispatchEvent(new Event(EVENT));
}

export const MY_QUEUE_EVENT = EVENT;
