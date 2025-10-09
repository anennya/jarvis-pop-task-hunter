# 15‑Minute Task Stack — Web‑only MVP (v2)

This doc consolidates the **PRD + Architecture** and the **starter repo changes** for a **Sheets‑first, swappable storage** design (Mock ⇄ Google Sheets ⇄ Supabase).

---

## 1) Product Requirements (Updated)

### Goals
- Show **one 15‑minute slice** at a time to reduce overwhelm.
- **Fast capture** (title‑only) with optional category, estimate, due date.
- **Deterministic auto‑breakdown (v2)** using improved templates per category.
- **Web‑only** MVP; no calendar, SMS, or watch.

### Non‑Goals
- No AI breakdown (can be Phase 2).
- No recurring tasks.
- No analytics beyond basic counts.

### User Stories
1. Capture a task with just a title.
2. Optionally set category/estimate/due date.
3. Task auto‑breaks into 15‑minute slices following category templates.
4. See a single **Now** card with actions: Done, +15, Skip, Snooze.
5. Manually add/delete/reorder slices in **Task Editor**.
6. Storage is **Google Sheets** by default for easy inspection; can switch with one env flag.

### Acceptance Criteria
- `POST /api/capture` inserts task + slices into the selected backend; returns them.
- `GET /api/next` returns top‑scoring `todo` slice or `{ message }`.
- `POST /api/action` updates slice status or appends a continuation slice for `+15`.
- Switching `DATA_BACKEND` to `mock | sheets | supabase` requires **no UI changes**.

---

## 2) Categories & Templates (v2)

| Category | Template Stages | Default Estimate |
|---|---|---|
| Admin | Setup & Access → Gather Required Info → Complete Core Action → Review & Confirm Submission → Archive Proof & Note Next | 60m |
| Research – Travel | Define Trip Scope → Gather Options → Compare Shortlist → Coordinate With Others → Finalize & Book → Confirm & Save Plans | 90m |
| Research – Shopping | Define Need & Constraints → Gather Options → Compare Key Features → Decide on Best Option → Purchase or Save → Review or Return Outcome | 60m |
| Reading/Learning | Setup & Access Material → Preview Structure → Read/Watch (Focused) → Summarize Key Insights → Apply or Log Learnings | 45m |
| Technical Execution | Setup & Clarify Goal → Explore/Debug Context → Implement Core Change → Test & Verify → Refactor or Polish → Commit & Share Outcome | 60m |
| Quick Chores | Decide What’s Needed → Take Action → Confirm & Log | 15m |
| Generic | Clarify What “Done” Means → Take One Small Step → Reflect & Plan Next | 30m |

**Materialization rules (examples)**
- "Setup & Access" → `Open resources + define 'done' for: {title}`
- "Gather Required Info" → `Collect required docs/links for: {title}`
- "Complete Core Action" → `Do one concrete sub‑action for: {title}`
- "Review & Confirm Submission" → `Review and submit; sanity‑check`
- "Archive Proof & Note Next" → `Save confirmations + add reminder`
- Travel "Coordinate With Others" → `Share shortlist; collect preferences`

---

## 3) Architecture (Updated)

### 3.1 System Overview
```
[ Next.js (App Router) ]
   ├─ UI: /now, /inbox, /tasks/[id]
   └─ API: /api/capture, /api/next, /api/action
        ↓
[ Breakdown Engine ]  (lib/templates.ts, lib/classifier.ts, lib/breakdown.ts)
        ↓
[ Data Adapter ]      (lib/datastore.ts, lib/store.ts)
   ├─ Mock (in‑memory)
   ├─ Google Sheets (service account)
   └─ Supabase (optional)
```

### 3.2 Data Model (logical)
**Task**: `id, user_id, title, category, importance, energy, context, estimate_minutes, due_at, notes, link, created_at`

**Slice**: `id, task_id, title, sequence_index, planned_minutes(=15), status('todo'|'doing'|'done'), skip_count, snoozed_until, done_at`

### 3.3 Scoring
`score = importance (1–5) + urgency (0–3 by due date proximity) − skip_penalty (0–3)`

### 3.4 UI Descriptions
1. Home / Now Page

A minimalist dashboard focused on a single 15-minute slice. The screen centers on a large card showing the current task and slice, with primary buttons for Done, +15, Skip, and Snooze below. A footer provides quick access to Add Task and View Stack.

2. Add Task Modal

A compact popup for capturing new tasks. It includes fields for Title, Category, Estimated Time, and Due Date, with Save and Cancel buttons. On submission, it triggers an auto-breakdown into 15-minute slices.

3. Task Stack Page/ Inbox page

A collapsible list view showing all tasks and their slices. Each task card can expand to show subtasks, progress indicators, and editing options. Includes search and filter tools for All, Todo, or Done statuses.
---

## 4) Storage: Sheets‑first via Adapter

### 4.1 Env Toggle
```
DATA_BACKEND=mock | sheets | supabase
```

### 4.2 Google Sheets Setup
1. Create a Google Cloud **Service Account**; download JSON key.
2. Share your spreadsheet with the service account email (Editor).
3. Set env vars (see `.env.example`).

### 4.3 Spreadsheet Tabs
**Tasks** (header row):
```
id | user_id | title | category | importance | energy | context | estimate_minutes | due_at | notes | link | created_at
```
**Slices** (header row):
```
id | task_id | title | sequence_index | planned_minutes | status | skip_count | snoozed_until | done_at
```

---

## 5) Repo Changes (apply to starter)

### 5.1 Folder Structure (delta)
```
lib/
  sheets.ts         # Google Sheets client (JWT)
  datastore.ts      # IDataStore interface
  store.ts          # picks the active store by DATA_BACKEND
  store.sheets.ts   # Sheets implementation
  store.supabase.ts # Supabase implementation (optional)
  templates.ts      # v2 templates
  classifier.ts     # rules → category
  breakdown.ts      # deterministic breakdown
```

### 5.2 `.env.example`
```bash
# Select backend: mock | sheets | supabase
DATA_BACKEND=mock

# Google Sheets (only if DATA_BACKEND=sheets)
SHEETS_ID="<your-spreadsheet-id>"
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","client_email":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n", "token_uri":"https://oauth2.googleapis.com/token"}'

# Supabase (only if DATA_BACKEND=supabase)
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
SUPABASE_SERVICE_ROLE="<service-role-key>"
SUPABASE_ANON_KEY="<anon-key>"
```

### 5.3 `package.json` (delta)
```json
{
  "dependencies": {
    "googleapis": "131.0.0",
    "uuid": "9.0.1"
  },
  "devDependencies": {
    "@types/uuid": "9.0.7"
  }
}
```

### 5.4 `lib/datastore.ts`
```ts
export type TaskRow = { id: string; user_id?: string; title: string; category?: string | null; importance?: number | null; estimate_minutes?: number | null; due_at?: string | null; created_at?: string };
export type SliceRow = { id: string; task_id: string; title: string; sequence_index: number; planned_minutes: number; status: 'todo'|'doing'|'done'; skip_count: number; snoozed_until?: string | null; done_at?: string | null };

export interface IDataStore {
  insertTask(t: TaskRow): Promise<void>;
  insertSlices(rows: SliceRow[]): Promise<void>;
  listTodoSlices(userId?: string): Promise<(SliceRow & { task: TaskRow })[]>;
  updateSlice(id: string, patch: Partial<SliceRow>): Promise<void>;
}
```

### 5.5 `lib/sheets.ts`
```ts
import { google } from 'googleapis';

export function sheetsClient() {
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
  const auth = new google.auth.JWT(
    creds.client_email,
    undefined,
    creds.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  return google.sheets({ version: 'v4', auth });
}
```

### 5.6 `lib/store.ts`
```ts
import { SheetsStore } from './store.sheets';
import { SupabaseStore } from './store.supabase';
import type { IDataStore } from './datastore';

class MockStore implements IDataStore {
  private tasks: any[] = [];
  private slices: any[] = [];
  async insertTask(t: any) { this.tasks.push(t); }
  async insertSlices(rows: any[]) { this.slices.push(...rows); }
  async listTodoSlices() { return this.slices.filter(s=>s.status==='todo').map(s=>({ ...s, task: this.tasks.find(t=>t.id===s.task_id) })); }
  async updateSlice(id: string, patch: any) { const i=this.slices.findIndex(s=>s.id===id); if(i>=0) this.slices[i]={...this.slices[i],...patch, skip_count:(patch.skip_count? (this.slices[i].skip_count+patch.skip_count): this.slices[i].skip_count)}; }
}

export const store: IDataStore =
  process.env.DATA_BACKEND === 'sheets' ? new SheetsStore() :
  process.env.DATA_BACKEND === 'supabase' ? new SupabaseStore() :
  new MockStore();
```

### 5.7 `lib/store.sheets.ts` (minimal)
```ts
import { sheetsClient } from './sheets';
import type { IDataStore, TaskRow, SliceRow } from './datastore';

const SPREADSHEET_ID = process.env.SHEETS_ID!;
const TASKS_RANGE = 'Tasks!A:Z';
const SLICES_RANGE = 'Slices!A:Z';

export class SheetsStore implements IDataStore {
  async insertTask(t: TaskRow) {
    const sheets = sheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: TASKS_RANGE,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[t.id, t.user_id ?? 'demo', t.title, t.category ?? '', t.importance ?? 3, 'medium', 'any', t.estimate_minutes ?? 15, t.due_at ?? '', '', '', t.created_at ?? new Date().toISOString()]] }
    });
  }
  async insertSlices(rows: SliceRow[]) {
    const sheets = sheetsClient();
    const values = rows.map(r => [r.id, r.task_id, r.title, r.sequence_index, r.planned_minutes, r.status, r.skip_count, r.snoozed_until ?? '', r.done_at ?? '']);
    await sheets.spreadsheets.values.append({ spreadsheetId: SPREADSHEET_ID, range: SLICES_RANGE, valueInputOption: 'USER_ENTERED', requestBody: { values } });
  }
  async listTodoSlices(): Promise<(SliceRow & { task: TaskRow })[]> {
    const sheets = sheetsClient();
    const [tasksResp, slicesResp] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: TASKS_RANGE }),
      sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: SLICES_RANGE }),
    ]);
    const [, ...taskRows] = tasksResp.data.values ?? [];
    const [, ...sliceRows] = slicesResp.data.values ?? [];
    const tasks = new Map(taskRows.map(r => [r[0], { id: r[0], user_id: r[1], title: r[2], category: r[3], importance: Number(r[4] ?? 3), estimate_minutes: Number(r[7] ?? 15), due_at: r[8] || null, created_at: r[11] }] as const));
    return sliceRows
      .filter(r => (r[5] ?? 'todo') === 'todo')
      .map(r => ({ id: r[0], task_id: r[1], title: r[2], sequence_index: Number(r[3] ?? 1), planned_minutes: Number(r[4] ?? 15), status: r[5] ?? 'todo', skip_count: Number(r[6] ?? 0), snoozed_until: r[7] || null, done_at: r[8] || null, task: tasks.get(r[1])! }))
      .filter(x => !!x.task);
  }
  async updateSlice(id: string, patch: Partial<SliceRow>) {
    // Minimal MVP: re-read Slices, find row by id in column A, then values.update that row's cells.
    // (Left as exercise; behavior matches README Next Steps.)
    return;
  }
}
```

### 5.8 API (unchanged endpoints; now call adapter)
- `POST /api/capture` → uses `breakdownTask()` then `store.insertTask/insertSlices()`
- `GET /api/next` → `store.listTodoSlices()` then score & pick one
- `POST /api/action` → `store.updateSlice()`

---

## 6) Breakdown Engine (v2)

- `templates.ts` — updated category templates (above)
- `classifier.ts` — simple keyword rules, user can override
- `breakdown.ts` — deterministic expansion to 15‑minute slices

**Rules**
- First slice must be setup/clarify.
- Every slice is exactly 15 minutes.
- Expand/trim template stages to match `ceil(estimate/15)`; cap at 32 slices.
- Titles are short, verb‑led next actions.

---

## 7) README (delta)

### Run (Mock)
```bash
npm i
npm run dev
open http://localhost:3000/now
```

### Switch to Google Sheets
1) Create Service Account, share the sheet with its email (Editor).
2) Set `.env` → `DATA_BACKEND=sheets`, `SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_JSON`.
3) Restart `npm run dev`.

### Switch to Supabase (optional)
Set `DATA_BACKEND=supabase` and fill Supabase envs; run SQL in `supabase/`.

---

## 8) Definition of Done
- Sheets mode works end‑to‑end: capture → breakdown → store in sheet → pop next.
- Mock mode continues to work.
- Swapping backends requires only `DATA_BACKEND` change.
- v2 templates produce better, more actionable slices for Admin, Travel, Shopping, Reading, Technical, Quick Chores, and Generic.

