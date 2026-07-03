# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Lab Checkpoint Queue System — a TA queues students for lab-checkpoint inspection; students watch the queue in real time. Full PRD is in `Lab Checkpoint Queue System - PRD.md`; the design system spec is in `DESIGN.md`. Both are the source of truth for product and visual decisions.

## Repo layout

Two **independent** apps, each with its own `package.json`. There is no root package or monorepo tooling — run every command from inside `backend/` or `frontend/`. This project uses **pnpm**.

- `backend/` — NestJS + Mongoose + Socket.io API (global prefix `/api`)
- `frontend/` — Next.js 14 App Router + Tailwind

## Commands

Backend (`cd backend`):

- `pnpm dev` / `pnpm start:dev` — watch-mode API on `:4000`
- `pnpm build` / `pnpm start:prod` — compile to `dist/` and run
- `pnpm seed` — wipe + reseed demo data (reads `.env`; the only way to get sample data)

Frontend (`cd frontend`):

- `pnpm dev` — dev server on `:3000`
- `pnpm build` — production build (also the type/lint gate — there is no separate typecheck script)
- `pnpm lint`

No automated tests exist in either app. Verification so far is manual (`curl` the API, build both apps).

## Environment

- `backend/.env` — `MONGODB_URI` (the DB name in the path matters; Atlas URIs without one default to `test`), `ADMIN_SECRET`, `PORT`, `CORS_ORIGIN` (comma-separated; must include the frontend origin or both REST and the Socket.io gateway will be blocked).
- `frontend/.env.local` — `NEXT_PUBLIC_API_URL` points at the backend **without** the `/api` suffix (the client appends it).

## Architecture (the parts that span files)

**Data hierarchy:** `Subject → Lab → QueueEntry`. Checkpoints are **embedded** in `Lab.checkpoints` (each with its own `_id`); a queue entry references a checkpoint by that id, or `checkpointId: null` when the lab has none. `subjectId`/`labId` are `ObjectId` references.

**Single queue collection, split by status.** `queueEntries` holds both the active queue (`waiting`/`checking`) and history (`passed`/`failed`). Queries filter by `status`. Entries **denormalize** `subjectName`/`labName`/`checkpointName` so history and CSV stay stable even after the source subject/lab is renamed or deleted.

**Auth is named TA accounts with two roles (Phase 2).** `Ta` (`backend/src/tas/ta.schema.ts`) holds `username`/`passwordHash`/`displayName`/`role` (`'admin' | 'ta'`). `POST /auth/login` (`backend/src/auth/`) checks credentials and returns a JWT signed with `ADMIN_SECRET` (now reused purely as the JWT signing secret + the bootstrap admin password — see below). `AdminGuard` (`backend/src/common/admin.guard.ts`) verifies `Authorization: Bearer <jwt>` and attaches the payload to `req.ta`; GET/read endpoints stay public, every mutation is guarded. Routes restricted to Admins (TA account management, the kill-switch) additionally use `RolesGuard` + `@Roles('admin')` (`backend/src/common/roles.{guard,decorator}.ts`). `TasService.onModuleInit` bootstraps one `admin`/`ADMIN_SECRET` account on first boot if the `tas` collection is empty, so there's always a way in. On the frontend the JWT lives in `localStorage` (`lib/auth.ts`); `lib/api.ts` attaches it as a Bearer token when a call is made with `{ admin: true }`; `components/AdminGate.tsx` gates `/admin/*` with a username/password login form and exposes the logged-in TA via `lib/ta-context.tsx` (`useCurrentTa()`) for role-based UI (e.g. `AdminSidebar` hides the Settings nav item from non-admins).

**Real-time = broadcast + refetch.** `RealtimeGateway` is a `@Global` provider; controllers call `realtime.emitChange()` after every successful mutation, emitting `queue:changed` over Socket.io. The frontend `lib/useRealtime.ts` hook just re-runs a refetch callback on that event — payloads carry no data. Keep this pattern: add `emitChange()` to any new mutation that affects what viewers see.

**Cross-module schema registration.** Mongoose has no cascading deletes, so `SubjectsService.remove` and `LabsService.remove` manually `deleteMany` their children. To do this, each module registers the _other_ modules' schemas via `MongooseModule.forFeature` (e.g. `SubjectsModule` registers `Lab` and `QueueEntry`). When adding a service that touches another collection, register that schema in its module the same way rather than importing the other service.

**Queue business rules (all in `backend/src/queue/queue.service.ts`):**

- `attempt` is computed by counting existing entries with the same `studentId` + `labId` + `checkpointId` (so requeues auto-increment).
- `skip` sends an entry to the back of the line by resetting `enqueuedAt = now`.
- The active list is sorted in application code: `checking` first, then `waiting`, each by `enqueuedAt`.
- CSV export is hand-built with a UTF-8 BOM so Excel renders Thai correctly.
