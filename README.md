# Lab Checkpoint Queue System

ระบบจัดคิว **Checkpoint การทดลอง** ในแต่ละ Lab — TA จัดการคิวเมื่อนักศึกษายกมือขอตรวจ
และนักศึกษาดูสถานะคิวแบบ **Real-time** ได้ (ดู [PRD](./Lab%20Checkpoint%20Queue%20System%20-%20PRD.md))

ดีไซน์อิงระบบ Notion-inspired ใน [DESIGN.md](./DESIGN.md) — canvas กระดาษอุ่น, ฟอนต์ Inter,
สีหลักฟ้า Notion เพียงสีเดียวสำหรับปุ่ม/ลิงก์ และ sticker palette สำหรับตกแต่ง/สถานะ

## Stack

| Layer    | Tech                                          |
| -------- | --------------------------------------------- |
| Frontend | Next.js 14 (App Router) + Tailwind            |
| Backend  | NestJS + Mongoose + Socket.io (real-time)     |
| Database | MongoDB (Atlas)                               |

ลำดับชั้นข้อมูล: **Subject → Lab (embed Checkpoints) → QueueEntry**

---

## โครงสร้างโปรเจกต์

```
backend/    NestJS API  (subjects, labs, queue, realtime gateway)
frontend/   Next.js app (public queue + admin dashboard)
```

---

## การติดตั้งและรัน (Local)

### 1. Backend

```bash
cd backend
cp .env.example .env        # แล้วแก้ค่าใน .env
pnpm install
pnpm seed                   # (ครั้งแรก) สร้างข้อมูลตัวอย่าง
pnpm dev                    # (หรือ pnpm start:dev) http://localhost:4000/api
```

ตัวแปรใน `backend/.env`:

| Key           | ความหมาย                                            |
| ------------- | --------------------------------------------------- |
| `MONGODB_URI` | connection string ของ MongoDB (Atlas หรือ local)    |
| `ADMIN_SECRET`| รหัสผ่านที่ TA ใช้เข้าระบบจัดการคิว (Phase 1 auth)   |
| `PORT`        | พอร์ตของ API (ดีฟอลต์ 4000)                          |
| `CORS_ORIGIN` | URL ของ frontend (คั่นด้วย comma ได้)               |

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local   # ตั้ง NEXT_PUBLIC_API_URL ให้ชี้ไป backend
pnpm install
pnpm dev                           # http://localhost:3000
```

---

## การใช้งาน

- **`/`** — หน้าดูคิวสำหรับนักศึกษา (เลือกวิชา + Lab แล้วดูคิวแบบ real-time)
- **`/admin`** — TA จัดการคิว: เพิ่มเข้าคิว · เรียกตรวจ · ข้าม · บันทึกผล (ผ่าน/ไม่ผ่าน)
- **`/admin/subjects`** — CRUD วิชา + Lab + Checkpoint
- **`/admin/history`** — ประวัติผลการตรวจ + ปุ่ม "เข้าคิวใหม่" สำหรับคนที่ไม่ผ่าน + Export CSV

หน้า `/admin/*` จะถามรหัสผ่าน (`ADMIN_SECRET`) ครั้งแรก แล้วเก็บไว้ใน `localStorage`
ทุกคำสั่งที่เปลี่ยนข้อมูลจะส่ง header `x-admin-secret` ไปยัง API

---

## Real-time

Backend ยิง event `queue:changed` ผ่าน Socket.io ทุกครั้งที่คิว/ข้อมูลเปลี่ยน
ฝั่ง frontend (`lib/useRealtime.ts`) subscribe แล้ว refetch หน้าจอที่กำลังดูอยู่ทันที

---

## API สรุป

| Method | Path                       | สิทธิ์  | หน้าที่                          |
| ------ | -------------------------- | ------ | ------------------------------- |
| GET    | `/api/subjects`            | public | รายชื่อวิชา                      |
| POST/PATCH/DELETE | `/api/subjects[/:id]` | admin | CRUD วิชา (ลบ = cascade lab+queue) |
| GET    | `/api/labs?subjectId=`     | public | รายชื่อ Lab ของวิชา             |
| POST/PATCH/DELETE | `/api/labs[/:id]` | admin  | CRUD Lab + Checkpoints          |
| GET    | `/api/queue?subjectId=&labId=` | public | คิว active (waiting+checking) |
| POST   | `/api/queue`               | admin  | เพิ่มเข้าคิว (นับ attempt อัตโนมัติ) |
| PATCH  | `/api/queue/:id/call`      | admin  | เรียกตรวจ → checking            |
| PATCH  | `/api/queue/:id/skip`      | admin  | ข้าม → กลับไปท้ายแถว            |
| PATCH  | `/api/queue/:id/resolve`   | admin  | บันทึกผล (passed/failed)        |
| POST   | `/api/queue/:id/requeue`   | admin  | เพิ่มเข้าคิวใหม่ (attempt +1)    |
| GET    | `/api/queue/history`       | admin  | ประวัติผลการตรวจ                |
| GET    | `/api/queue/export`        | admin  | ดาวน์โหลด CSV (UTF-8 + BOM)     |

---

## Deploy (Free Tier)

- **Frontend → Vercel**: import `frontend/`, ตั้ง env `NEXT_PUBLIC_API_URL` = URL ของ backend
- **Backend → Railway / Render**: deploy `backend/`, ตั้ง env ตามตารางด้านบน,
  start command `pnpm start:prod` (build ด้วย `pnpm build` ก่อน)
- เพิ่ม URL ของ Vercel เข้าไปใน `CORS_ORIGIN` ของ backend

---

## Phase 2 (อนาคต)

- นักศึกษาเพิ่มตัวเองเข้าคิว (self check-in)
- Multi-TA พร้อม per-user authentication (โครงสร้าง `resolvedBy` เตรียมไว้แล้ว)
