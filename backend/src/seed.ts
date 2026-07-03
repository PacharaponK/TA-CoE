/**
 * Seed demo data: run with `npm run seed`.
 * Requires MONGODB_URI in the environment (or .env).
 */
import 'reflect-metadata';
import * as dotenvLike from 'fs';
import * as path from 'path';
import mongoose, { Types } from 'mongoose';
import { SubjectSchema } from './subjects/subject.schema';
import { LabSchema } from './labs/lab.schema';
import { QueueEntrySchema } from './queue/queue-entry.schema';

// minimal .env loader (avoids an extra dependency)
function loadEnv() {
  const file = path.resolve(process.cwd(), '.env');
  if (!dotenvLike.existsSync(file)) return;
  for (const line of dotenvLike.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2] ?? '';
    if (/^".*"$/.test(val) || /^'.*'$/.test(val)) val = val.slice(1, -1);
    if (!(key in process.env)) process.env[key] = val;
  }
}

async function run() {
  loadEnv();
  const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/lab_queue';
  await mongoose.connect(uri);
  console.log('Connected to', uri);

  const Subject = mongoose.model('Subject', SubjectSchema);
  const Lab = mongoose.model('Lab', LabSchema);
  const QueueEntry = mongoose.model('QueueEntry', QueueEntrySchema);

  await Promise.all([
    Subject.deleteMany({}),
    Lab.deleteMany({}),
    QueueEntry.deleteMany({}),
  ]);

  const subject = await Subject.create({
    code: 'CS101',
    name: 'Programming Fundamentals',
    semester: '2026/1',
    isActive: true,
  });

  const cp1 = new Types.ObjectId();
  const cp2 = new Types.ObjectId();
  const lab = await Lab.create({
    subjectId: subject._id,
    name: 'Lab 3 — Linked List',
    order: 3,
    isActive: true,
    checkpoints: [
      { _id: cp1, name: 'CP1 — Compile ผ่าน', order: 0 },
      { _id: cp2, name: 'CP2 — Insert/Delete ถูกต้อง', order: 1 },
    ],
  });

  await Lab.create({
    subjectId: subject._id,
    name: 'Lab 4 — Stack & Queue',
    order: 4,
    isActive: true,
    checkpoints: [],
  });

  await QueueEntry.create([
    {
      subjectId: subject._id,
      labId: lab._id,
      checkpointId: cp1,
      studentId: '6500001',
      studentName: 'สมชาย ใจดี',
      section: '1',
      subjectName: subject.name,
      labName: lab.name,
      checkpointName: 'CP1 — Compile ผ่าน',
      attempt: 1,
      status: 'waiting',
      enqueuedAt: new Date(),
    },
    {
      subjectId: subject._id,
      labId: lab._id,
      checkpointId: cp1,
      studentId: '6500002',
      studentName: 'สมหญิง รักเรียน',
      section: '1',
      subjectName: subject.name,
      labName: lab.name,
      checkpointName: 'CP1 — Compile ผ่าน',
      attempt: 1,
      status: 'waiting',
      enqueuedAt: new Date(Date.now() + 1000),
    },
  ]);

  console.log('✅ Seeded demo data.');
  console.log(
    '   Note: TA accounts are bootstrapped by the backend itself (not this script) —',
    'start it once and log in as username "admin" with your ADMIN_SECRET.',
  );
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
