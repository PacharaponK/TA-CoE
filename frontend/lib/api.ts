'use client';

import { getSecret } from './auth';
import type { Subject, Lab, QueueEntry, QueueStatus, Student, SystemConfig } from './types';

export const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
).replace(/\/+$/, '');

const API = `${API_BASE}/api`;

type Opts = { admin?: boolean; query?: Record<string, string | undefined> };

function buildUrl(path: string, query?: Opts['query']) {
  const url = new URL(`${API}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== '') url.searchParams.set(k, v);
    }
  }
  return url.toString();
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  opts: Opts = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (opts.admin) headers['x-admin-secret'] = getSecret();

  const res = await fetch(buildUrl(path, opts.query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (!res.ok) {
    let message = `เกิดข้อผิดพลาด (${res.status})`;
    try {
      const data = await res.json();
      if (data?.message)
        message = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---- Subjects ----
export const subjectsApi = {
  list: (activeOnly = false) =>
    request<Subject[]>('GET', '/subjects', undefined, {
      query: { activeOnly: activeOnly ? 'true' : undefined },
    }),
  create: (data: Partial<Subject>) =>
    request<Subject>('POST', '/subjects', data, { admin: true }),
  update: (id: string, data: Partial<Subject>) =>
    request<Subject>('PATCH', `/subjects/${id}`, data, { admin: true }),
  remove: (id: string) =>
    request<unknown>('DELETE', `/subjects/${id}`, undefined, { admin: true }),
};

// ---- Labs ----
export const labsApi = {
  list: (subjectId?: string, activeOnly = false) =>
    request<Lab[]>('GET', '/labs', undefined, {
      query: {
        subjectId,
        activeOnly: activeOnly ? 'true' : undefined,
      },
    }),
  create: (data: Partial<Lab>) =>
    request<Lab>('POST', '/labs', data, { admin: true }),
  update: (id: string, data: Partial<Lab>) =>
    request<Lab>('PATCH', `/labs/${id}`, data, { admin: true }),
  remove: (id: string) =>
    request<unknown>('DELETE', `/labs/${id}`, undefined, { admin: true }),
};

// ---- Queue ----
export const queueApi = {
  active: (q: { subjectId?: string; labId?: string; checkpointId?: string }) =>
    request<QueueEntry[]>('GET', '/queue', undefined, { query: q }),
  history: (q: {
    subjectId?: string;
    labId?: string;
    checkpointId?: string;
    studentId?: string;
  }) => request<QueueEntry[]>('GET', '/queue/history', undefined, {
    admin: true,
    query: q,
  }),
  enqueue: (data: {
    subjectId: string;
    labId: string;
    checkpointId?: string | null;
    studentId: string;
    studentName: string;
    section?: string;
  }) => request<QueueEntry>('POST', '/queue', data, { admin: true }),
  join: (data: {
    subjectId: string;
    labId: string;
    checkpointId?: string | null;
    studentId: string;
    studentName: string;
    section?: string;
  }) => request<QueueEntry>('POST', '/queue/join', data),
  call: (id: string) =>
    request<QueueEntry>('PATCH', `/queue/${id}/call`, undefined, {
      admin: true,
    }),
  skip: (id: string) =>
    request<QueueEntry>('PATCH', `/queue/${id}/skip`, undefined, {
      admin: true,
    }),
  resolve: (id: string, result: 'passed' | 'failed', resolvedBy?: string) =>
    request<QueueEntry>('PATCH', `/queue/${id}/resolve`, { result, resolvedBy }, {
      admin: true,
    }),
  requeue: (id: string) =>
    request<QueueEntry>('POST', `/queue/${id}/requeue`, undefined, {
      admin: true,
    }),
  remove: (id: string) =>
    request<unknown>('DELETE', `/queue/${id}`, undefined, { admin: true }),
  downloadCsv: async (q: {
    subjectId?: string;
    labId?: string;
    checkpointId?: string;
  }) => {
    const res = await fetch(buildUrl('/queue/export', q), {
      headers: { 'x-admin-secret': getSecret() },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('ดาวน์โหลด CSV ไม่สำเร็จ');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab-queue-export-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};

// ---- System Config (kill-switch) ----
export const systemConfigApi = {
  get: () => request<SystemConfig>('GET', '/system-config'),
  set: (queueDisabled: boolean, disabledMessage = '') =>
    request<SystemConfig>(
      'PATCH',
      '/system-config',
      { queueDisabled, disabledMessage },
      { admin: true },
    ),
};

// ---- Students ----
export const studentsApi = {
  list: (activeOnly = false) =>
    request<Student[]>('GET', '/students', undefined, {
      query: { activeOnly: activeOnly ? 'true' : undefined },
    }),
  create: (data: Partial<Student>) =>
    request<Student>('POST', '/students', data, { admin: true }),
  update: (id: string, data: Partial<Student>) =>
    request<Student>('PATCH', `/students/${id}`, data, { admin: true }),
  remove: (id: string) =>
    request<unknown>('DELETE', `/students/${id}`, undefined, { admin: true }),
};

export type { Subject, Lab, QueueEntry, QueueStatus, Student, SystemConfig };
