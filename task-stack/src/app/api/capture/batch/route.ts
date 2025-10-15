import { NextRequest, NextResponse } from 'next/server';
import { breakdownTask } from '@/lib/breakdown';
import { store } from '@/lib/store';

interface BatchTaskInput {
  title: string;
  category?: string;
  estimateMinutes?: number;
  dueAt?: string;
  importance?: number;
}

interface BatchProcessResult {
  success: boolean;
  processed: number;
  tasks: Array<{
    title: string;
    category: string;
    sliceCount: number;
    estimateMinutes: number;
  }>;
  errors: Array<{
    title: string;
    error: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Batch API called with DATA_BACKEND:', process.env.DATA_BACKEND);
    const body = await request.json();
    const { tasks, userId = 'demo' } = body;
    console.log('Processing', tasks.length, 'tasks for user:', userId);

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json({ error: 'Tasks array is required' }, { status: 400 });
    }

    const result: BatchProcessResult = {
      success: true,
      processed: 0,
      tasks: [],
      errors: []
    };

    // Process each task
    for (const taskInput of tasks) {
      try {
        if (!taskInput.title?.trim()) {
          result.errors.push({
            title: taskInput.title || 'Unknown',
            error: 'Title is required'
          });
          continue;
        }

        // Break down the task into slices
        const { task, slices } = breakdownTask(
          taskInput.title.trim(),
          taskInput.category,
          taskInput.estimateMinutes,
          taskInput.dueAt,
          taskInput.importance,
          userId
        );

        // Store the task and slices
        console.log('Storing task:', task.title, 'with', slices.length, 'slices');
        await store.insertTask(task);
        await store.insertSlices(slices);
        console.log('Successfully stored task:', task.id);

        result.tasks.push({
          title: task.title,
          category: task.category || 'Generic',
          sliceCount: slices.length,
          estimateMinutes: task.estimate_minutes || 15
        });

        result.processed++;
      } catch (error) {
        result.errors.push({
          title: taskInput.title || 'Unknown',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Set success to false if there were any errors
    if (result.errors.length > 0) {
      result.success = false;
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error in batch capture:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}