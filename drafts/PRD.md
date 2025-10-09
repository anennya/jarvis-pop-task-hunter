# PRD: Minimalist 15-Minute Task Stack (Calendar-Free MVP)

## 1. Goal
Help users reduce overwhelm by:  
- Breaking all tasks into **15-minute slices**.  
- Showing **only one slice at a time**.  
- Providing a **stack/queue** where users “pop the top” when ready.  
- Keeping setup frictionless: title-only capture works, breakdown is automatic, slices can be edited manually.  

---

## 2. Core User Flow
1. **Capture Task**  
   - Quick add: just type/dictate a title.  
   - Optional fields: category, importance, estimate, context, energy.  
   - Inbox holds new tasks until categorized.  

2. **Auto-Breakdown**  
   - Tasks classified into one of 5 MVP categories.  
   - Breakdown templates generate 15-minute slices.  
   - Estimate >15m → sliced into multiple steps.  

3. **Manual Slice Editing**  
   - User can add, delete, or merge slices via web dashboard (or by SMS command `add slice`).  

4. **Stack/Queue**  
   - Slices are scored by importance + urgency.  
   - Highest scoring slice surfaces at the top.  

5. **Pop the Stack**  
   - User taps “Next” (Watch) or replies “yes” (SMS).  
   - App shows one slice with a 15-minute timer.  

6. **Actions on Slice**  
   - **Done** → mark complete.  
   - **+15** → add next slice for same task.  
   - **Skip** → small penalty, slice moves down.  
   - **Snooze** → hide until later.  

---

## 3. Interfaces

### A. Apple Watch App  
- **Card View:**  
  - Task slice title.  
  - Progress ring for parent task.  
  - Big button: **Start 15:00**.  
- **Controls:** Done / +15 / Skip / Snooze.  
- **Quick Capture:** dictate task title → defaults applied.  

### B. SMS Bot  
- **Capture:**  
  - “File taxes” → defaults applied.  
  - Optional parsing: `@desk`, `!high`, `45m`.  
- **Prompt:** “Ready for 15?” → reply “yes” → next slice pops.  
- **Controls:** reply `done`, `skip`, `+15`, `snooze`, `add slice <text>`.  

### C. Web Dashboard (minimal)  
- **Now view:** one card (same as Watch/SMS).  
- **Inbox:** list of captured tasks awaiting category.  
- **Review/Edit:** manual slice editing, delete/merge slices.  

---

## 4. MVP Categories & Templates

### 1. Quick Chores (≤15m)  
- Slice: direct action (`Do`).  

### 2. Admin (long chores)  
- Steps: Setup → Sort → Do → Confirm.  

### 3. Research  
- **Shopping:** Setup → Gather → Compare → Decide → Confirm.  
- **Travel:** Setup → Gather → Compare → Decide → Confirm.  

### 4. Reading / Learning  
- Steps: Setup → Skim → Deep Dive → Extract → Summarize.  

### 5. Technical Execution  
- Steps: Setup → Implement → Test → Polish → Commit.  

---

## 5. Data Model

**Task**  
id, title, category?, importance=3, energy="medium", context="any",
estimate_minutes=15, due_at?, notes?, link?, created_at

**Slice**  
id, task_id, title, sequence_index,
planned_minutes=15, status="todo|doing|done",
skip_count=0, snoozed_until?, done_at?

---

## 6. Priority Scoring
Simple MVP scoring:  
score = importance (1–5)
+ urgency (due soon = +1–3)
- skip_count * penalty

Later: context/energy matching.  

---

## 7. Non-Goals (MVP)
- No calendar integration.  
- No recurring tasks.  
- No project views beyond optional tags.  
- No analytics beyond slice counts.  

---

## 8. Success Criteria
- User can capture a task in <5 seconds.  
- Auto-breakdown produces usable 15-minute slices.  
- User can always see just one slice at a time.  
- Manual slice editing available when needed.  

---

## 9. Future Extensions (Phase 2+)
- Calendar awareness (free/busy).  
- Recurring tasks.  
- Richer slice templates (fitness, meetings, creative).  
- Analytics: streaks, completions, trends.  
- Personalization: learn from user’s manual edits.  