import { Task, CapacitySettings, RescueResult } from '../types';

export function calculateDayRescue(
  tasks: Task[],
  capacity: CapacitySettings
): RescueResult {
  const activeTasks = tasks.filter((t) => !t.completed && t.type === 'task');
  const completedTasks = tasks.filter((t) => t.completed && t.type === 'task');

  // Calculate remaining daylight from now until capacity.endTime
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [endH, endM] = capacity.endTime.split(':').map(Number);
  const endMinutes = endH * 60 + endM;

  // Remaining available minutes for today (with 15m minimum buffer for peace of mind)
  let remainingDaylight = Math.max(30, endMinutes - currentMinutes);
  if (currentMinutes >= endMinutes) {
    // If it's already evening past end time, provide a gentle 60-minute recovery buffer
    remainingDaylight = 60;
  }

  // Account for buffer time between tasks (e.g. 10m buffer per task)
  const bufferTime = capacity.bufferBetweenTasks || 10;

  // Sort active tasks by urgency and importance:
  // 1. Due today or past due
  // 2. Priority (4 down to 1)
  // 3. Postpone count (if postponed, give high attention or fit small starter)
  const todayStr = new Date().toISOString().slice(0, 10);
  const sorted = [...activeTasks].sort((a, b) => {
    const aIsDueToday = a.deadline === todayStr ? 1 : 0;
    const bIsDueToday = b.deadline === todayStr ? 1 : 0;
    if (aIsDueToday !== bIsDueToday) return bIsDueToday - aIsDueToday;

    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.duration - b.duration;
  });

  const keptTasks: Task[] = [];
  const movedTasks: Task[] = [];
  let allocatedMinutes = 0;

  for (const task of sorted) {
    const neededTime = task.duration + bufferTime;
    // Keep at most 2 or 3 essential tasks, and only if they fit into remaining daylight
    if (allocatedMinutes + neededTime <= remainingDaylight && keptTasks.length < 3) {
      keptTasks.push(task);
      allocatedMinutes += neededTime;
    } else {
      movedTasks.push(task);
    }
  }

  // If nothing fit, keep at least the single highest priority task adapted to a 20m starter
  if (keptTasks.length === 0 && sorted.length > 0) {
    keptTasks.push({
      ...sorted[0],
      duration: Math.min(25, sorted[0].duration),
    });
    for (let i = 1; i < sorted.length; i++) {
      movedTasks.push(sorted[i]);
    }
    allocatedMinutes = 25;
  }

  const remainingHoursFormatted = (remainingDaylight / 60).toFixed(1).replace('.0', '');
  const plannedTotal = completedTasks.length + activeTasks.length;

  const explanation = `You planned ${plannedTotal} tasks today and have finished ${completedTasks.length}. With ~${remainingHoursFormatted}h remaining before your wind-down time (${capacity.endTime}), squeezing everything in will only cause stress. Flow kept the ${keptTasks.length} most vital task${keptTasks.length > 1 ? 's' : ''} and moved the rest safely to Later / Backlog.`;

  return {
    keptTasks,
    movedTasks,
    remainingAvailableMinutes: remainingDaylight,
    totalKeptMinutes: allocatedMinutes,
    message: 'Falling behind doesn’t mean the day is ruined. Let’s re-plan.',
    explanation,
  };
}
