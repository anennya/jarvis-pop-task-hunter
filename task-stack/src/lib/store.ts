import { SheetsStore } from './store.sheets';
import { SupabaseStore } from './store.supabase';
import type { IDataStore, TaskRow, SliceRow } from './datastore';

class MockStore implements IDataStore {
  private tasks: TaskRow[] = [];
  private slices: SliceRow[] = [];

  async insertTask(t: TaskRow) {
    this.tasks.push(t);
  }

  async insertSlices(rows: SliceRow[]) {
    this.slices.push(...rows);
  }

  async listTodoSlices(): Promise<(SliceRow & { task: TaskRow })[]> {
    return this.slices
      .filter(s => s.status === 'todo')
      .map(s => ({
        ...s,
        task: this.tasks.find(t => t.id === s.task_id)!
      }))
      .filter(x => !!x.task);
  }

  async updateSlice(id: string, patch: Partial<SliceRow>) {
    const index = this.slices.findIndex(s => s.id === id);
    if (index >= 0) {
      this.slices[index] = {
        ...this.slices[index],
        ...patch,
        skip_count: patch.skip_count !== undefined 
          ? this.slices[index].skip_count + patch.skip_count 
          : this.slices[index].skip_count
      };
    }
  }
}

export const store: IDataStore = 
  process.env.DATA_BACKEND === 'sheets' ? new SheetsStore() :
  process.env.DATA_BACKEND === 'supabase' ? new SupabaseStore() :
  new MockStore();