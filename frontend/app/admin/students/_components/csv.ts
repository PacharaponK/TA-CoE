import type { Student, Subject } from '@/lib/types';

// ── Generic CSV parse/format (RFC4180-ish: quoted fields, "" escape) ──

export function parseCsv(text: string): string[][] {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''));
}

function csvValue(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// ── Student-specific column mapping ───────────────────────────────

const HEADERS = [
  'รหัสนักศึกษา',
  'ชื่อ',
  'นามสกุล',
  'ชื่อเล่น',
  'ชั้นปี',
  'Section',
  'อีเมล',
  'เบอร์โทร',
  'วิชา',
  'สถานะ',
];

const HEADER_KEYS: Record<string, string> = {
  รหัสนักศึกษา: 'studentId',
  ชื่อ: 'firstName',
  นามสกุล: 'surname',
  ชื่อเล่น: 'nickname',
  ชั้นปี: 'year',
  section: 'section',
  อีเมล: 'email',
  เบอร์โทร: 'phone',
  วิชา: 'subjectCodes',
  สถานะ: 'isActive',
};

export function studentsToCsv(students: Student[], subjectById: Map<string, Subject>): string {
  const lines = [HEADERS.map(csvValue).join(',')];
  for (const s of students) {
    const subjectCodes = s.subjectIds
      .map((id) => subjectById.get(id)?.code)
      .filter(Boolean)
      .join(';');
    lines.push(
      [
        s.studentId,
        s.firstName,
        s.surname,
        s.nickname,
        s.year,
        s.section,
        s.email,
        s.phone,
        subjectCodes,
        s.isActive ? 'ใช้งาน' : 'ปิด',
      ]
        .map(csvValue)
        .join(','),
    );
  }
  return lines.join('\r\n');
}

export interface ParsedStudentRow {
  rowNumber: number; // 1-indexed, counting the header as row 1
  studentId: string;
  firstName: string;
  surname: string;
  nickname: string;
  year: number;
  section: string;
  email: string;
  phone: string;
  subjectCodes: string[];
  subjectIds: string[];
  isActive: boolean;
  errors: string[];
}

export function parseStudentsCsv(text: string, subjects: Subject[]): ParsedStudentRow[] {
  const codeToId = new Map(subjects.map((s) => [s.code.trim().toLowerCase(), s._id]));
  const rows = parseCsv(text);
  if (rows.length === 0) return [];

  const headerKeys = rows[0].map((h) => HEADER_KEYS[h.trim()] ?? HEADER_KEYS[h.trim().toLowerCase()] ?? null);

  return rows.slice(1).map((cells, idx) => {
    const rec: Record<string, string> = {};
    headerKeys.forEach((key, i) => {
      if (key) rec[key] = (cells[i] ?? '').trim();
    });

    const errors: string[] = [];
    const studentId = rec.studentId ?? '';
    const firstName = rec.firstName ?? '';
    const surname = rec.surname ?? '';
    const yearNum = Number(rec.year);

    if (!studentId) errors.push('ไม่มีรหัสนักศึกษา');
    if (!firstName) errors.push('ไม่มีชื่อ');
    if (!surname) errors.push('ไม่มีนามสกุล');
    if (!rec.year || Number.isNaN(yearNum) || yearNum < 1 || yearNum > 6) errors.push('ชั้นปีไม่ถูกต้อง (1-6)');

    const subjectCodes = (rec.subjectCodes ?? '').split(/[;,]/).map((c) => c.trim()).filter(Boolean);
    const subjectIds: string[] = [];
    for (const code of subjectCodes) {
      const id = codeToId.get(code.toLowerCase());
      if (id) subjectIds.push(id);
      else errors.push(`ไม่พบวิชารหัส "${code}"`);
    }

    const activeRaw = (rec.isActive ?? '').toLowerCase();
    const isActive = activeRaw === '' ? true : ['ใช้งาน', 'true', '1', 'active'].includes(activeRaw);

    return {
      rowNumber: idx + 2,
      studentId,
      firstName,
      surname,
      nickname: rec.nickname ?? '',
      year: yearNum,
      section: rec.section ?? '',
      email: rec.email ?? '',
      phone: rec.phone ?? '',
      subjectCodes,
      subjectIds,
      isActive,
      errors,
    };
  });
}
