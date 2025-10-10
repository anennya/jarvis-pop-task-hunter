import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { store } from '@/lib/store';
import type { SliceRow } from '@/lib/datastore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sliceId, action, snoozeMinutes } = body;

    if (!sliceId || !action) {
      return NextResponse.json({ error: 'Slice ID and action are required' }, { status: 400 });
    }

    switch (action) {
      case 'done':
        await store.updateSlice(sliceId, {
          status: 'done',
          done_at: new Date().toISOString()
        });
        break;

      case 'skip':
        await store.updateSlice(sliceId, {
          skip_count: 1 // This will be added to existing skip_count in the store
        });
        break;

      case 'snooze':
        const snoozeUntil = new Date();
        snoozeUntil.setMinutes(snoozeUntil.getMinutes() + (snoozeMinutes || 15));
        
        await store.updateSlice(sliceId, {
          snoozed_until: snoozeUntil.toISOString()
        });
        break;

      case '+15':
        // Get the current slice to create a continuation
        const todoSlices = await store.listTodoSlices();
        const currentSlice = todoSlices.find(s => s.id === sliceId);
        
        if (!currentSlice) {
          return NextResponse.json({ error: 'Slice not found' }, { status: 404 });
        }

        // Mark current slice as done
        await store.updateSlice(sliceId, {
          status: 'done',
          done_at: new Date().toISOString()
        });

        // Create a continuation slice
        const continuationSlice: SliceRow = {
          id: uuidv4(),
          task_id: currentSlice.task_id,
          title: `Continue: ${currentSlice.task.title}`,
          sequence_index: currentSlice.sequence_index + 0.5, // Insert between current and next
          planned_minutes: 15,
          status: 'todo',
          skip_count: 0,
          snoozed_until: null,
          done_at: null
        };

        await store.insertSlices([continuationSlice]);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}