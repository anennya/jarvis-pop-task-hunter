import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getNextSlice } from '@/lib/scoring';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo';

    // Get all todo slices
    const todoSlices = await store.listTodoSlices(userId);

    // Find the next slice to work on
    const nextSlice = getNextSlice(todoSlices);

    if (!nextSlice) {
      return NextResponse.json({ 
        message: 'No tasks available. Great job! Time to add a new task or take a break.' 
      });
    }

    return NextResponse.json({ slice: nextSlice });
  } catch (error) {
    console.error('Error getting next slice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}