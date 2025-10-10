import type { SliceRow, TaskRow } from './datastore';

export function calculateUrgency(dueAt?: string | null): number {
  if (!dueAt) return 0;
  
  const now = new Date();
  const due = new Date(dueAt);
  const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursUntilDue < 0) return 3; // Overdue
  if (hoursUntilDue < 24) return 2; // Due today
  if (hoursUntilDue < 72) return 1; // Due in 3 days
  return 0; // Not urgent
}

export function calculateSkipPenalty(skipCount: number): number {
  return Math.min(skipCount, 3); // Cap at 3
}

export function calculateScore(slice: SliceRow & { task: TaskRow }): number {
  const importance = slice.task.importance || 3;
  const urgency = calculateUrgency(slice.task.due_at);
  const skipPenalty = calculateSkipPenalty(slice.skip_count);
  
  return importance + urgency - skipPenalty;
}

export function getNextSlice(slices: (SliceRow & { task: TaskRow })[]): (SliceRow & { task: TaskRow }) | null {
  if (slices.length === 0) return null;
  
  // Filter out snoozed slices
  const now = new Date();
  const availableSlices = slices.filter(slice => 
    !slice.snoozed_until || new Date(slice.snoozed_until) <= now
  );
  
  if (availableSlices.length === 0) return null;
  
  // Sort by score (highest first), then by sequence_index (lowest first)
  availableSlices.sort((a, b) => {
    const scoreA = calculateScore(a);
    const scoreB = calculateScore(b);
    
    if (scoreA !== scoreB) {
      return scoreB - scoreA; // Higher score first
    }
    
    return a.sequence_index - b.sequence_index; // Lower sequence first
  });
  
  return availableSlices[0];
}