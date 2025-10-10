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
      requestBody: {
        values: [[
          t.id,
          t.user_id ?? 'demo',
          t.title,
          t.category ?? '',
          t.importance ?? 3,
          t.energy ?? 'medium',
          t.context ?? 'any',
          t.estimate_minutes ?? 15,
          t.due_at ?? '',
          t.notes ?? '',
          t.link ?? '',
          t.created_at ?? new Date().toISOString()
        ]]
      }
    });
  }

  async insertSlices(rows: SliceRow[]) {
    const sheets = sheetsClient();
    const values = rows.map(r => [
      r.id,
      r.task_id,
      r.title,
      r.sequence_index,
      r.planned_minutes,
      r.status,
      r.skip_count,
      r.snoozed_until ?? '',
      r.done_at ?? ''
    ]);
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: SLICES_RANGE,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values }
    });
  }

  async listTodoSlices(): Promise<(SliceRow & { task: TaskRow })[]> {
    const sheets = sheetsClient();
    const [tasksResp, slicesResp] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: TASKS_RANGE }),
      sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: SLICES_RANGE }),
    ]);

    const [, ...taskRows] = tasksResp.data.values ?? [];
    const [, ...sliceRows] = slicesResp.data.values ?? [];

    const tasks = new Map(
      taskRows.map(r => [
        r[0],
        {
          id: r[0],
          user_id: r[1],
          title: r[2],
          category: r[3],
          importance: Number(r[4] ?? 3),
          energy: r[5],
          context: r[6],
          estimate_minutes: Number(r[7] ?? 15),
          due_at: r[8] || null,
          notes: r[9] || null,
          link: r[10] || null,
          created_at: r[11]
        } as TaskRow
      ])
    );

    return sliceRows
      .filter(r => (r[5] ?? 'todo') === 'todo')
      .map(r => ({
        id: r[0],
        task_id: r[1],
        title: r[2],
        sequence_index: Number(r[3] ?? 1),
        planned_minutes: Number(r[4] ?? 15),
        status: (r[5] ?? 'todo') as 'todo' | 'doing' | 'done',
        skip_count: Number(r[6] ?? 0),
        snoozed_until: r[7] || null,
        done_at: r[8] || null,
        task: tasks.get(r[1])!
      }))
      .filter(x => !!x.task);
  }

  async updateSlice(id: string, patch: Partial<SliceRow>) {
    // Minimal MVP: re-read Slices, find row by id in column A, then values.update that row's cells.
    // This is a simplified implementation - in production you'd want to be more efficient
    const sheets = sheetsClient();
    const slicesResp = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SLICES_RANGE
    });

    const [header, ...sliceRows] = slicesResp.data.values ?? [];
    const rowIndex = sliceRows.findIndex(r => r[0] === id);
    
    if (rowIndex >= 0) {
      const row = sliceRows[rowIndex];
      const updatedRow = [...row];
      
      // Update specific fields based on patch
      if (patch.status !== undefined) updatedRow[5] = patch.status;
      if (patch.skip_count !== undefined) updatedRow[6] = String(patch.skip_count);
      if (patch.snoozed_until !== undefined) updatedRow[7] = patch.snoozed_until || '';
      if (patch.done_at !== undefined) updatedRow[8] = patch.done_at || '';

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Slices!A${rowIndex + 2}:I${rowIndex + 2}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [updatedRow] }
      });
    }
  }
}