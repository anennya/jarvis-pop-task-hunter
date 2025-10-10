import { v4 as uuidv4 } from 'uuid';
import type { TaskRow, SliceRow } from './datastore';
import type { Category } from './templates';
import { getTemplate, materializeStage } from './templates';
import { classifyTask } from './classifier';

export interface BreakdownResult {
  task: TaskRow;
  slices: SliceRow[];
}

export function breakdownTask(
  title: string,
  category?: string,
  estimateMinutes?: number,
  dueAt?: string,
  importance?: number,
  userId?: string
): BreakdownResult {
  // Classify the task if category not provided
  const finalCategory = classifyTask(title, category);
  const template = getTemplate(finalCategory);
  
  // Use provided estimate or template default
  const estimate = estimateMinutes || template.defaultEstimate;
  
  // Calculate number of 15-minute slices needed
  const numSlices = Math.min(Math.ceil(estimate / 15), 32); // Cap at 32 slices
  
  // Create the task
  const taskId = uuidv4();
  const task: TaskRow = {
    id: taskId,
    user_id: userId || 'demo',
    title,
    category: finalCategory,
    importance: importance || 3,
    energy: 'medium',
    context: 'any',
    estimate_minutes: estimate,
    due_at: dueAt || null,
    notes: null,
    link: null,
    created_at: new Date().toISOString()
  };

  // Generate slices based on template stages
  const slices: SliceRow[] = [];
  const stages = template.stages;
  
  // Distribute slices across stages
  // If we have more slices than stages, repeat stages proportionally
  // If we have fewer slices than stages, take the first N stages
  
  for (let i = 0; i < numSlices; i++) {
    const stageIndex = Math.floor((i * stages.length) / numSlices);
    const stage = stages[stageIndex];
    const sliceTitle = materializeStage(stage, title);
    
    slices.push({
      id: uuidv4(),
      task_id: taskId,
      title: sliceTitle,
      sequence_index: i + 1,
      planned_minutes: 15,
      status: 'todo',
      skip_count: 0,
      snoozed_until: null,
      done_at: null
    });
  }

  return { task, slices };
}