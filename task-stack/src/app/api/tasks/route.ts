import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo';

    // Get all slices with their tasks
    const slices = await store.listTodoSlices(userId);
    
    // Group slices by task
    const taskMap = new Map();
    
    slices.forEach(slice => {
      const taskId = slice.task_id;
      if (!taskMap.has(taskId)) {
        taskMap.set(taskId, {
          ...slice.task,
          slices: []
        });
      }
      taskMap.get(taskId).slices.push(slice);
    });

    // Sort slices within each task by sequence_index
    taskMap.forEach(task => {
      task.slices.sort((a: any, b: any) => a.sequence_index - b.sequence_index);
    });

    const tasks = Array.from(taskMap.values());
    
    // Sort tasks by creation date (newest first)
    tasks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}