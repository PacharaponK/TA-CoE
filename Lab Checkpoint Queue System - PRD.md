# Lab Checkpoint Queue System — PRD

## ภาพรวม (Overview)

ระบบเว็บแอปสำหรับจัดคิว **Checkpoint การทดลอง** ในแต่ละ Lab ของวิชา
TA เป็นผู้จัดการคิวเมื่อนักศึกษายกมือขอตรวจ และนักศึกษาสามารถดูสถานะคิวแบบ Real-time ได้

---

## Stack

| Layer        | Technology                                                 |
| ------------ | ---------------------------------------------------------- |
| **Frontend** | Next.js                                                    |
| **Backend**  | Nest.js                                                    |
| **Database** | MongoDB (Atlas Free Tier)                                  |
| **Deploy**   | Vercel (Frontend) + Railway / Render (Backend) — Free Tier |

---

## ผู้ใช้งาน (User Roles)

| Role | สิทธิ์ |
|---|---|
| **Admin (TA)** | จัดการคิว, ดู History, จัดการวิชา + Lab (CRUD) |
| **นักศึกษา (Viewer)** | ดูคิว Real-time อย่างเดียว |

**Admin Auth (Phase 1):** Shared Secret (password เดียว ไม่มี login per-user)

---

## Scale

- นักศึกษา: ~30–35 คน
- TA: 1 คน (อาจเพิ่มในอนาคต → ออกแบบให้รองรับ multi-TA ไว้ด้วย)
- วิชา: หลายวิชาต่อ semester → แต่ละวิชามีหลาย Lab
- Lab: หลาย Lab ต่อวิชา → TA จัดการเองผ่าน CRUD

**โครงสร้างข้อมูล (Hierarchy):** วิชา (Subject) → Lab → Checkpoint

---

## Workflow จริง

1. อาจารย์ปล่อยให้นักศึกษาทำแลปแต่ละ Checkpoint
2. เมื่อนักศึกษาทำเสร็จ → **ยกมือ**
3. TA เพิ่มชื่อนักศึกษาเข้าคิว (อาจมีหลายคนยกมือพร้อมกัน → คิวช่วยจัดลำดับ)
4. TA เรียกคิวตามลำดับ → ตรวจ Checkpoint
5. **ผ่าน** → บันทึก, ปิดคิว
6. **ไม่ผ่าน** → นักศึกษาแก้ไขแล้วยกมือใหม่ → TA เพิ่มเข้าคิวอีกรอบได้

---

## ข้อมูลในแต่ละคิว (Queue Entry)

- รหัสนักศึกษา
- ชื่อ-นามสกุล
- Section / กลุ่ม
- วิชา (Subject)
- Lab ที่ตรวจ
- Checkpoint (ถ้า Lab มีหลาย Checkpoint)
- ครั้งที่พยายาม (attempt count — สำหรับ History)
- สถานะ: `รอ` / `กำลังตรวจ` / `ผ่าน` / `ไม่ผ่าน`
- เวลาเข้าคิว

---

## Data Model (MongoDB Schema)

ลำดับชั้น: **Subject → Lab (มี Checkpoint ฝังอยู่) → QueueEntry**
ใช้ reference (`ObjectId`) เชื่อมระหว่าง collection หลัก และ embed `checkpoints` ไว้ใน Lab เพราะผูกกับ Lab โดยตรงและจำนวนไม่มาก

### `subjects`

```ts
{
  _id: ObjectId,
  code: string,          // รหัสวิชา เช่น "CS101" (unique)
  name: string,          // ชื่อวิชา เช่น "Programming Fundamentals"
  semester: string,      // เช่น "2026/1"
  isActive: boolean,     // ปิดวิชาที่จบแล้วโดยไม่ต้องลบ
  createdAt: Date,
  updatedAt: Date
}
```

### `labs`

```ts
{
  _id: ObjectId,
  subjectId: ObjectId,   // ref → subjects._id
  name: string,          // เช่น "Lab 3 — Linked List"
  order: number,         // ลำดับการแสดงผลภายในวิชา
  checkpoints: [         // embed: TA เพิ่ม/ลบได้ยืดหยุ่น
    {
      _id: ObjectId,     // id ของ checkpoint (อ้างอิงจากคิวได้)
      name: string,      // เช่น "CP1 — Compile ผ่าน"
      order: number
    }
  ],
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

> หมายเหตุ: ถ้า Lab ไม่มี Checkpoint ย่อย ให้ `checkpoints` เป็น `[]` แล้วคิวเก็บ `checkpointId: null`

### `queueEntries`

เก็บทั้งคิวที่ active และ record ที่ตรวจเสร็จแล้ว (History) ใน collection เดียว — แยกด้วย `status`

```ts
{
  _id: ObjectId,
  subjectId: ObjectId,        // ref → subjects._id
  labId: ObjectId,            // ref → labs._id
  checkpointId: ObjectId | null, // ref → labs.checkpoints._id (null ถ้า Lab ไม่มี checkpoint)

  // snapshot ข้อมูลนักศึกษา (กรอก manual, ยังไม่มี collection students ใน Phase 1)
  studentId: string,          // รหัสนักศึกษา
  studentName: string,        // ชื่อ-นามสกุล
  section: string,            // Section / กลุ่ม

  // denormalize ชื่อไว้กันข้อมูลเพี้ยนเวลาแก้ Subject/Lab ทีหลัง + ใช้ใน CSV ได้เลย
  subjectName: string,
  labName: string,
  checkpointName: string | null,

  attempt: number,            // ครั้งที่พยายาม (1, 2, 3, ...)
  status: "waiting" | "checking" | "passed" | "failed",

  enqueuedAt: Date,           // เวลาเข้าคิว
  calledAt: Date | null,      // เวลาเริ่มตรวจ
  resolvedAt: Date | null,    // เวลาบันทึกผล (passed/failed)
  resolvedBy: string | null,  // TA ที่ตรวจ (เผื่อ multi-TA ใน Phase 2)

  createdAt: Date,
  updatedAt: Date
}
```

### Indexes ที่แนะนำ

| Collection     | Index                                                | เหตุผล                                  |
| -------------- | ---------------------------------------------------- | --------------------------------------- |
| `subjects`     | `{ code: 1 }` unique                                 | กันรหัสวิชาซ้ำ                           |
| `labs`         | `{ subjectId: 1, order: 1 }`                         | ดึง Lab ของวิชาเรียงลำดับ               |
| `queueEntries` | `{ status: 1, subjectId: 1, labId: 1, enqueuedAt: 1 }` | ดึงคิว active เรียงตามเวลาเข้า          |
| `queueEntries` | `{ studentId: 1, labId: 1, checkpointId: 1 }`        | นับ attempt + ดู History รายคน          |

---

## Features หลัก

### Phase 1 — MVP

- [ ] TA เพิ่มนักศึกษาเข้าคิวแบบ manual (กรอก รหัส / ชื่อ / Section / วิชา / Lab)
- [ ] แสดงคิวปัจจุบันแบบ Real-time (นักศึกษาดูได้ผ่าน URL เดียวกัน)
- [ ] TA เรียก / ข้าม / บันทึกผล (ผ่าน / ไม่ผ่าน) ต่อคิว
- [ ] นักศึกษาที่ไม่ผ่านสามารถถูกเพิ่มเข้าคิวใหม่ได้
- [ ] History (admin-only) — ดูว่าใครตรวจ Checkpoint ไหนไปแล้ว
- [ ] CRUD สำหรับจัดการวิชา — TA เพิ่ม/แก้ไข/ลบวิชาได้ (แต่ละวิชามีหลาย Lab)
- [ ] CRUD สำหรับจัดการ Lab (ภายใต้วิชา) — แต่ละ Lab กำหนด Checkpoint ได้เองแบบยืดหยุ่น (TA เพิ่ม/ลบ Checkpoint ต่อ Lab ได้)
- [ ] Export ผลสรุปเป็น CSV (ใครผ่าน Checkpoint ไหนบ้าง)
- [ ] UI Responsive รองรับมือถือ

### Phase 2 — อนาคต

- [ ] นักศึกษาเพิ่มตัวเองเข้าคิว (Self-check-in)
- [ ] Multi-TA support พร้อม per-user authentication
