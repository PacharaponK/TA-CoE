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
  createdAt?: string;
  updatedAt?: string;
}

export type QueueStatus = 'waiting' | 'checking' | 'passed' | 'failed';

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
