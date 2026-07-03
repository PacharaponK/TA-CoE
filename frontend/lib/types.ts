export interface Subject {
  _id: string;
  code: string;
  name: string;
  semester: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Checkpoint {
  _id: string;
  name: string;
  order: number;
}

export interface Lab {
  _id: string;
  subjectId: string;
  name: string;
  order: number;
  checkpoints: Checkpoint[];
  isActive: boolean;
  queuePaused: boolean;
  pausedMessage: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  _id: string;
  studentId: string;
  firstName: string;
  surname: string;
  nickname: string;
  year: number;
  section: string;
  email: string;
  phone: string;
  isActive: boolean;
  /** Subjects this student is enrolled in. */
  subjectIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type QueueStatus = 'waiting' | 'checking' | 'passed' | 'failed';

export type TaRole = 'admin' | 'ta';

/** The logged-in TA's identity, from POST /auth/login or GET /auth/me. */
export interface CurrentTa {
  id: string;
  username: string;
  displayName: string;
  role: TaRole;
}

/** One row of a TA's weekly duty schedule, shown on the public Contact page. */
export interface ScheduleEntry {
  day: string;
  time: string;
  note: string;
}

/** A TA account row as managed from the Settings page (Admin only). */
export interface TaAccount {
  _id: string;
  username: string;
  displayName: string;
  role: TaRole;
  isActive: boolean;
  title: string;
  email: string;
  facebookName: string;
  facebookUrl: string;
  igName: string;
  location: string;
  statusText: string;
  available: boolean;
  showOnContactPage: boolean;
  schedule: ScheduleEntry[];
  createdAt?: string;
  updatedAt?: string;
}

/** Public-safe TA profile for the Contact page — from GET /tas/public (no auth). */
export interface PublicTaProfile {
  id: string;
  displayName: string;
  title: string;
  email: string;
  facebookName: string;
  facebookUrl: string;
  igName: string;
  location: string;
  statusText: string;
  available: boolean;
  schedule: ScheduleEntry[];
}

export interface SystemConfig {
  queueDisabled: boolean;
  disabledMessage: string;
  disabledAt: string | null;
}

export interface QueueEntry {
  _id: string;
  subjectId: string;
  labId: string;
  checkpointId: string | null;
  studentId: string;
  studentName: string;
  section: string;
  subjectName: string;
  labName: string;
  checkpointName: string | null;
  attempt: number;
  status: QueueStatus;
  enqueuedAt: string;
  calledAt: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  createdAt?: string;
  updatedAt?: string;
}
