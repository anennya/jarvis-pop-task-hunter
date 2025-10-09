# 15‑Minute Task Stack — Web‑only MVP

## 0. Scope
Minimal browser‑only app that surfaces **one 15‑minute slice** at a time. No SMS, no Watch, no calendar. Includes capture, auto‑breakdown by category templates, scoring, and a minimal Now view.

---

## 1. Product Requirements (PRD)

### 1.1 Goals
- Reduce decision fatigue by showing only the **next 15‑minute slice**.
- Make capture frictionless (title‑only works).
- Auto‑breakdown large tasks into 15‑minute slices using predefined templates.
- Allow manual slice edits in a simple editor.

### 1.2 Non‑Goals (MVP)
- No calendar integration.
- No SMS or Watch surfaces.
- No recurring tasks.
- No analytics beyond basic counts.

### 1.3 Personas
- **You (power user)**: wants rapid capture and a reliable “pop the next 15” loop.

### 1.4 User Stories
1. As a user, I can **capture** a task with title only.
2. As a user, I can **optionally set** category, importance (1–5), estimate, context, and energy.
3. When a task’s estimate > 15m, the system **auto‑breaks** it into 15‑minute slices using category templates.
4. I can **view the next slice** on a single **Now** card and take actions: Done, +15, Skip, Snooze.
5. I can **manually add, delete, or reorder** slices for a task.
6. I can **see my inbox** (uncategorized or newly captured tasks) and a minimal **review** of stuck slices (3+ skips).

### 1.5 MVP Categories & Templates
- **Quick Chores (≤15m)** → Do
- **Admin (long chores)** → Setup → Sort → Do → Confirm
- **Research – Shopping** → Setup → Gather → Compare → Decide → Confirm
- **Research – Travel** → Setup → Gather → Compare → Cooridnate → Decide → Confirm
- **Reading/Learning** → Setup → Skim → Deep Dive → Extract → Summarize
- **Technical Execution** → Setup → Implement → Test → Polish → Commit

### 1.6 Priority Scoring (MVP)
```
score = importance (1–5) + urgency (0–3 from due date proximity) – skip_penalty (0–3)
```
The highest scoring **todo** slice surfaces on **Now**.

### 1.7 Acceptance Criteria
- Capture: Title‑only POST creates a task; default category = Generic→template fallback; estimate default 15m.
- Breakdown: Given estimate > 15m, slices are created in multiples of 15m and include a **Setup**‑like first step.
- Now: GET `/api/next` returns a single top slice or `{message: "No slices found"}`.
- Actions: POST `/api/action` with `done|skip|+15|snooze` updates slice state; +15 appends a continuation slice.
- Manual edit: UI allows add/delete/reorder of slices on a task.
- Performance: Now view interaction < 300ms server roundtrip (mock acceptable in dev).

---

## 2. System Architecture

### 2.1 Overview
- **Client:** Next.js App Router (React) — pages: `/now`, `/inbox`, `/tasks/[id]` (editor).
- **Server:** Next.js API routes — `/api/capture`, `/api/next`, `/api/action`, `/api/tasks/*`.
- **DB:** Supabase Postgres (or mock mode). Tables: `tasks`, `slices`, optional `slice_scores`.
- **Auth:** Supabase Auth (email‑link or OAuth) or mock session in dev.

### 2.2 Component Diagram (textual)
```
[Browser UI]
  ├─ NowCard (fetch /api/next, act /api/action)
  ├─ Inbox (fetch tasks, create via /api/capture)
  └─ TaskEditor (CRUD slices via /api/tasks/:id/slices)

[Next.js API]
  ├─ capture → classify + breakdown → insert tasks/slices
  ├─ next → compute score → pick top slice
  ├─ action → state machine (done/skip/+15/snooze)
  └─ tasks/* → list/update tasks & slices

[Supabase]
  ├─ tasks, slices (RLS)
  └─ policies (user‑scoped access)
```

### 2.3 Data Model
**Task**
```
id uuid, user_id uuid, title text, category text?, importance int=3,
energy text='medium', context text='any', estimate_minutes int=15,
due_at timestamptz?, notes text?, link text?, created_at timestamptz
```
**Slice**
```
id uuid, task_id uuid, title text, sequence_index int,
planned_minutes int=15, status enum('todo','doing','done'),
skip_count int=0, snoozed_until timestamptz?, done_at timestamptz?
```

### 2.4 APIs (contract)
- **POST `/api/capture`**
  - Body: `{ title: string, category?: string, importance?: number, estimate_minutes?: number, due_at?: string }`
  - Returns: `{ task, slices }`
- **GET `/api/next`**
  - Returns: `{ id, title, sequence_index, task_title, score } | { message }`
- **POST `/api/action`**
  - Body: `{ sliceId: string, action: 'done'|'skip'|'+15'|'snooze', snoozeForMinutes?: number }`
  - Returns: `{ ok: boolean }`
- **GET `/api/tasks/:id`** → task + slices
- **POST `/api/tasks/:id/slices`** → add slice `{ title }`
- **PATCH `/api/tasks/:id/slices/:sliceId`** → update (status, title, index)
- **DELETE `/api/tasks/:id/slices/:sliceId`** → delete slice

### 2.5 Server Modules
- `classifier.ts` → maps title/category to template
- `templates.ts` → JSON templates (your MVP set)
- `breakdown.ts` → materializes 15‑min slices from a task
- `scoring.ts` → computes slice score
- `state.ts` → action handler (done/skip/+15/snooze)

### 2.6 State Machine (slice)
```
[ todo ] --Start--> [ doing ] --Done--> [ done ]
   |                      |               ^
   |--Skip (+1 penalty)-->|               |
   |--Snooze (hide)-------|---------------|
   |--+15 (append cont.)--|               |
```
`doing` is optional for MVP; you can jump `todo → done` after the 15‑min timer.

### 2.7 Scoring Workflow
1. Fetch `todo` slices joined with parent tasks.
2. Compute `score` per slice.
3. Return the **max** (tie‑break by lower `sequence_index`).
4. (Optional) cache in `slice_scores` on write.

### 2.8 Security
- Enable RLS on all tables; scope by `tasks.user_id = auth.uid()`.
- Only server routes use `SERVICE_ROLE` key; client uses anon key.
- Validate inputs with `zod`; sanitize user text for display.

### 2.9 Observability
- Log API timing + action type; keep PII minimal.
- Feature flags: `USE_SUPABASE` (mock vs DB).

---

## 3. UX Spec (Web)

### 3.1 Now (/now)
- Card shows: slice title, tiny subtext (From: task title, step X/Y), buttons: **Start 15:00**, **Done**, **+15**, **Skip**, **Snooze**.
- Empty state: “Get next slice” button.

### 3.2 Inbox (/inbox)
- Capture input (title only) + Add button.
- List of newly captured tasks (with category badges); click opens Task Editor.

### 3.3 Task Editor (/tasks/[id])
- Task header: title, category select, importance (1–5), estimate.
- Slice list with drag‑reorder, add, delete.
- Primary button: “Save & Re‑score”.

---

## 4. Implementation Plan

### Milestone A — Core Loop
- Implement templates JSON + classifier.
- Implement `breakdown.ts` and wire into `POST /api/capture`.
- Implement `GET /api/next` scoring.
- Implement `POST /api/action` state updates.
- Build `/now` card.

### Milestone B — Capture & Edit
- Build `/inbox` capture + list.
- Build `/tasks/[id]` editor (CRUD slices; reorder).

### Milestone C — DB & Auth
- Switch from mock to Supabase; add RLS + basic auth.
- Write integration tests for API routes.

### Milestone D — Polish
- Stuck items surfacing (skip_count ≥ 3) on a simple Review section.
- Empty states, toasts, and basic keyboard shortcuts (Enter to capture, Cmd+Enter to complete).

---

## 5. Risks & Mitigations
- **Over‑eager breakdown** → allow easy manual edit; keep templates small.
- **Scope creep** → maintain strict non‑goals; calendar/SMS/Watch are Phase 2.
- **Latency** → pre‑compute scores on write if needed (or keep datasets small).

---

## 6. Definition of Done (MVP)
- `/now` reliably shows a single, sensible next slice; actions work.
- `/inbox` captures tasks; `/tasks/[id]` allows manual slice control.
- Auto‑breakdown works for all MVP categories.
- Basic auth + RLS secure user data (in DB mode).

