import { Task, SubTask } from '../types';

/**
 * Breaks down an intimidating or frequently postponed task into bite-sized starter actions.
 * Reduces activation energy so the user can easily get started without cognitive dread.
 */
export function generateTaskBreakdown(task: Task): SubTask[] {
  const nameLower = task.name.toLowerCase();

  // Custom breakdowns based on keywords or general pattern
  if (nameLower.includes('slide') || nameLower.includes('presentation') || nameLower.includes('psychology')) {
    return [
      { id: 'sub-1', name: 'Open file, review instructor notes & jot 3 changes', duration: 10, completed: false },
      { id: 'sub-2', name: 'Draft / fix the first 3 slides only', duration: 25, completed: false },
      { id: 'sub-3', name: 'Micro-break: water & deep breath', duration: 5, completed: false },
      { id: 'sub-4', name: 'Refine remaining slides & preview presentation', duration: 25, completed: false },
    ];
  }

  if (nameLower.includes('code') || nameLower.includes('python') || nameLower.includes('app') || nameLower.includes('bug')) {
    return [
      { id: 'sub-1', name: 'Open editor, read error log or target spec', duration: 10, completed: false },
      { id: 'sub-2', name: 'Write initial test or barebones minimal logic', duration: 25, completed: false },
      { id: 'sub-3', name: 'Verify single working unit', duration: 15, completed: false },
    ];
  }

  if (nameLower.includes('essay') || nameLower.includes('write') || nameLower.includes('report') || nameLower.includes('proposal')) {
    return [
      { id: 'sub-1', name: 'Dump rough bullet points without self-editing', duration: 10, completed: false },
      { id: 'sub-2', name: 'Flesh out first section / intro paragraph', duration: 25, completed: false },
      { id: 'sub-3', name: 'Draft core body points with sources', duration: 25, completed: false },
    ];
  }

  if (nameLower.includes('read') || nameLower.includes('study') || nameLower.includes('math')) {
    return [
      { id: 'sub-1', name: 'Skim headings and identify the key 2 concepts', duration: 10, completed: false },
      { id: 'sub-2', name: 'Focused reading of section 1 with notes', duration: 20, completed: false },
      { id: 'sub-3', name: 'Attempt 2 practice questions or summarize key takeaway', duration: 15, completed: false },
    ];
  }

  // General breakdown for long or vague tasks
  if (task.duration >= 90) {
    return [
      { id: 'sub-1', name: `Define the very first 5-minute action for "${task.name}"`, duration: 10, completed: false },
      { id: 'sub-2', name: 'Sprint 1: Make initial tangible progress without perfectionism', duration: 25, completed: false },
      { id: 'sub-3', name: 'Short reset break', duration: 5, completed: false },
      { id: 'sub-4', name: 'Sprint 2: Complete the highest-impact chunk', duration: 25, completed: false },
    ];
  }

  // Shorter tasks breakdown
  return [
    { id: 'sub-1', name: `Set up workspace & launch materials for "${task.name}"`, duration: 5, completed: false },
    { id: 'sub-2', name: 'Dedicate one uninterrupted 20-minute focus block', duration: 20, completed: false },
    { id: 'sub-3', name: 'Wrap up loose ends & record current state', duration: 10, completed: false },
  ];
}

/**
 * Returns supportive, non-shaming coaching notes when procrastination is detected.
 */
export function getProcrastinationAdvice(task: Task): string {
  if (task.postponeCount >= 3) {
    return `You've postponed "${task.name}" ${task.postponeCount} times. That's completely normal when a task feels heavy or unclear. Instead of scheduling another giant block, let's start with a 15-minute gentle version.`;
  }
  if (task.postponeCount === 2) {
    return `You've postponed this twice. The hardest part is almost always the friction of starting. What if we just commit to opening the file for 10 minutes?`;
  }
  if (task.duration >= 90 && task.energy === 'high') {
    return `This is a big 90+ minute deep-work task. To protect your energy, Flow recommends tackling it as smaller 25-minute sprints with built-in recovery.`;
  }
  return `Start small. Momentum comes after starting, not before.`;
}
