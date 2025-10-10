export type TaskRow = {
  id: string;
  user_id?: string;
  title: string;
  category?: string | null;
  importance?: number | null;
  energy?: string | null;
  context?: string | null;
  estimate_minutes?: number | null;
  due_at?: string | null;
  notes?: string | null;
  link?: string | null;
  created_at?: string;
};

export type SliceRow = {
  id: string;
  task_id: string;
  title: string;
  sequence_index: number;
  planned_minutes: number;
  status: 'todo' | 'doing' | 'done';
  skip_count: number;
  snoozed_until?: string | null;
  done_at?: string | null;
};

export interface IDataStore {
  insertTask(t: TaskRow): Promise<void>;
  insertSlices(rows: SliceRow[]): Promise<void>;
  listTodoSlices(userId?: string): Promise<(SliceRow & { task: TaskRow })[]>;
  updateSlice(id: string, patch: Partial<SliceRow>): Promise<void>;
}