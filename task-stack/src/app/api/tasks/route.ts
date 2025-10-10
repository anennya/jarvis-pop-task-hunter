import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import type { TaskRow, SliceRow } from '@/lib/datastore';

interface TaskWithSlices extends TaskRow {
  slices: SliceRow[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo';

    // Get all slices with their tasks
    const slices = await store.listAllSlices(userId);
    
    // Group slices by task
    const taskMap = new Map<string, TaskWithSlices>();
    
    slices.forEach(slice => {
      const taskId = slice.task_id;
      if (!taskMap.has(taskId)) {
        taskMap.set(taskId, {
          ...slice.task,
          slices: []
        });
      }
      taskMap.get(taskId)!.slices.push(slice);
    });

    // Sort slices within each task by sequence_index
    taskMap.forEach(task => {
      task.slices.sort((a: SliceRow, b: SliceRow) => a.sequence_index - b.sequence_index);
    });

    const tasks = Array.from(taskMap.values());
    
    // Sort tasks by creation date (newest first)
    tasks.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}