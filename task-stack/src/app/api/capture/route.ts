import { NextRequest, NextResponse } from 'next/server';
import { breakdownTask } from '@/lib/breakdown';
import { store } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, category, estimateMinutes, dueAt, importance, userId } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Break down the task into slices
    const { task, slices } = breakdownTask(
      title,
      category,
      estimateMinutes,
      dueAt,
      importance,
      userId
    );

    // Store the task and slices
    await store.insertTask(task);
    await store.insertSlices(slices);

    return NextResponse.json({ task, slices }, { status: 201 });
  } catch (error) {
    console.error('Error capturing task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}