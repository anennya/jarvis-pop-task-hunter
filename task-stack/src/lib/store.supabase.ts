import type { IDataStore, TaskRow, SliceRow } from './datastore';

export class SupabaseStore implements IDataStore {
  async insertTask(t: TaskRow): Promise<void> {
    // TODO: Implement Supabase integration when needed
    throw new Error('Supabase integration not implemented yet');
  }

  async insertSlices(rows: SliceRow[]): Promise<void> {
    // TODO: Implement Supabase integration when needed
    throw new Error('Supabase integration not implemented yet');
  }

  async listTodoSlices(userId?: string): Promise<(SliceRow & { task: TaskRow })[]> {
    // TODO: Implement Supabase integration when needed
    throw new Error('Supabase integration not implemented yet');
  }

  async listAllSlices(userId?: string): Promise<(SliceRow & { task: TaskRow })[]> {
    // TODO: Implement Supabase integration when needed
    throw new Error('Supabase integration not implemented yet');
  }

  async updateSlice(id: string, patch: Partial<SliceRow>): Promise<void> {
    // TODO: Implement Supabase integration when needed
    throw new Error('Supabase integration not implemented yet');
  }

  async updateTask(id: string, patch: Partial<TaskRow>): Promise<TaskRow> {
    // TODO: Implement Supabase integration when needed
    throw new Error('Supabase integration not implemented yet');
  }

  async deleteTask(id: string): Promise<void> {
    // TODO: Implement Supabase integration when needed
    throw new Error('Supabase integration not implemented yet');
  }
}