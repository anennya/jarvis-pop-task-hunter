import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const body = await request.json();
    
    const { title, category, importance, dueAt, estimateMinutes } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Update the task
    const updatedTask = await store.updateTask(taskId, {
      title: title.trim(),
      category,
      importance,
      due_at: dueAt || null,
      estimate_minutes: estimateMinutes
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    
    // Delete task and its slices
    await store.deleteTask(taskId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}