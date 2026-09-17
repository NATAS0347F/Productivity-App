import {
  Task,
  CapacitySettings,
  ScheduleBlock,
  UnscheduledTask,
  ScheduleResult,
  ItemType,
  CategoryType,
} from '../types';

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

export function timeToMinutes(time: string): number {
  if (!time || !time.includes(':')) return 9 * 60;
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTime(minutes: number): string {
  const normalized = Math.max(0, minutes);
  const h = Math.floor(normalized / 60) % 24;
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function minutesTo12Hour(minutes: number): string {
  const normalized = Math.max(0, minutes);
  let h = Math.floor(normalized / 60) % 24;
  const m = normalized % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatTimeRange(startMinutes: number, durationMinutes: number): string {
  return `${minutesTo12Hour(startMinutes)} – ${minutesTo12Hour(startMinutes + durationMinutes)}`;
}

export function formatDeadline(deadlineStr: string | null): string {
  if (!deadlineStr) return 'No deadline';
  try {
    const d = new Date(deadlineStr + 'T00:00:00');
    return `Due ${d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })}`;
  } catch {
    return deadlineStr;
  }
}

export function getDaysUntilDeadline(deadlineStr: string | null): number | null {
  if (!deadlineStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(deadlineStr + 'T23:59:59');
  return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Checks if a recurring task should appear on a specific day of the week (0 = Sun, 1 = Mon ... 6 = Sat)
 */
export function isTaskDueOnDay(task: Task, dayOfWeek: number): boolean {
  if (task.recurrence === 'none') return true;
  if (task.recurrence === 'daily') return true;
  if (task.recurrence === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5;
  if (task.recurrence === 'weekly') {
    // Default to task creation day or custom
    const createdDay = new Date(task.createdAt).getDay();
    return dayOfWeek === createdDay;
  }
  if (task.recurrence === 'custom' && task.customDays && task.customDays.length > 0) {
    return task.customDays.includes(dayOfWeek);
  }
  return true;
}

export function scoreTask(task: Task, capacityLevel: CapacitySettings['capacityLevel']): number {
  let score = task.priority * 15;

  // Deadline urgency
  if (task.deadline) {
    const days = getDaysUntilDeadline(task.deadline);
    if (days !== null) {
      if (days <= 0) score += 60; // Overdue / Due today
      else if (days === 1) score += 45; // Tomorrow
      else if (days <= 3) score += 25;
      else if (days <= 7) score += 10;
    }
  }

  // Energy alignment with today's capacity
  if (capacityLevel === 'low') {
    if (task.energy === 'low') score += 25;
    else if (task.energy === 'high') score -= 30; // Deprioritize heavy tasks on gentle days
    if (task.duration <= 30) score += 15; // Quick wins
  } else if (capacityLevel === 'high') {
    if (task.energy === 'high') score += 20; // Deep work priority
  }

  // Procrastination adjustment:
  // If postponed 3+ times, give it a small boost to face it, but schedule a smaller chunk
  if (task.postponeCount >= 2) {
    score += 15;
  }

  // Sitting time in brain dump (stale tasks get slight attention)
  if (task.createdAt) {
    const daysOld = (Date.now() - task.createdAt) / (1000 * 60 * 60 * 24);
    if (daysOld > 7) score += 8;
  }

  // Quick momentum bonus for manageable 15-45m tasks
  if (task.duration <= 45) {
    score += 6;
  }

  return score;
}

export function generateSchedule(
  tasks: Task[],
  capacity: CapacitySettings,
  targetDate: Date = new Date()
): ScheduleResult {
  const currentDayOfWeek = targetDate.getDay();
  const start = timeToMinutes(capacity.startTime);
  const end = timeToMinutes(capacity.endTime);
  const totalWindow = Math.max(0, end - start);

  // Maximum tasks allowed based on Capacity Level (anti-burnout safeguard)
  const maxTasksByCapacity = {
    low: 3,
    medium: 5,
    high: 8,
  }[capacity.capacityLevel];

  // ONLY schedule actionable 'task' items (not raw long-term goals or ideas!)
  // AND ensure recurring tasks match target day
  const candidateTasks = tasks.filter(
    (t) =>
      !t.completed &&
      t.type === 'task' &&
      isTaskDueOnDay(t, currentDayOfWeek)
  );

  // Rank candidate tasks
  const rankedTasks = [...candidateTasks].sort(
    (a, b) => scoreTask(b, capacity.capacityLevel) - scoreTask(a, capacity.capacityLevel)
  );

  const schedule: ScheduleBlock[] = [];
  const unscheduled: UnscheduledTask[] = [];

  let current = start;
  let availableTime = totalWindow;
  let consecutiveWork = 0;
  let scheduledTaskCount = 0;

  // Lunch window configuration
  const lunchStart = capacity.includeLunchBuffer ? timeToMinutes(capacity.lunchTime || '12:30') : -1;
  const lunchDuration = capacity.lunchDuration || 45;
  let lunchScheduled = !capacity.includeLunchBuffer;

  for (const task of rankedTasks) {
    // 1. Check if we reached the max meaningful tasks limit for today's capacity
    if (scheduledTaskCount >= maxTasksByCapacity) {
      unscheduled.push({
        id: task.id,
        name: task.name,
        type: task.type,
        category: task.category,
        remainingDuration: task.duration,
        originalDuration: task.duration,
        energy: task.energy,
        priority: task.priority,
        postponeCount: task.postponeCount,
        reason: `Capped by your ${capacity.capacityLevel}-energy capacity (max ${maxTasksByCapacity} focus tasks to prevent burnout)`,
      });
      continue;
    }

    // 2. Check if schedule window has ended
    if (availableTime <= 0 || current >= end) {
      unscheduled.push({
        id: task.id,
        name: task.name,
        type: task.type,
        category: task.category,
        remainingDuration: task.duration,
        originalDuration: task.duration,
        energy: task.energy,
        priority: task.priority,
        postponeCount: task.postponeCount,
        reason: 'Out of realistic time capacity for today',
      });
      continue;
    }

    // 3. Check for Lunch buffer
    if (!lunchScheduled && current >= lunchStart && current < lunchStart + 60) {
      schedule.push({
        id: `lunch-${current}`,
        type: 'meal',
        start: current,
        duration: lunchDuration,
        title: 'Lunch & Recharge',
        subtitle: 'Step away from screens. Mindful eating and breathing buffer.',
        category: 'meal',
      });
      current += lunchDuration;
      availableTime -= lunchDuration;
      consecutiveWork = 0;
      lunchScheduled = true;
    }

    // 4. Low-energy filter: avoid overwhelming high-energy tasks unless urgent deadline
    const daysUntil = getDaysUntilDeadline(task.deadline);
    const deadlineUrgent = daysUntil !== null && daysUntil <= 1;

    if (capacity.capacityLevel === 'low' && task.energy === 'high' && !deadlineUrgent) {
      unscheduled.push({
        id: task.id,
        name: task.name,
        type: task.type,
        category: task.category,
        remainingDuration: task.duration,
        originalDuration: task.duration,
        energy: task.energy,
        priority: task.priority,
        postponeCount: task.postponeCount,
        reason: 'Deferred: high cognitive load task on a gentle recovery day',
      });
      continue;
    }

    // 5. Recovery break after 75-90 minutes of continuous focus
    if (consecutiveWork >= 75 && availableTime >= 15) {
      schedule.push({
        id: `break-${current}`,
        type: 'break',
        start: current,
        duration: 15,
        title: 'Rest & Decompress',
        subtitle: 'Get up, hydrate, stretch. Brain recovery time.',
        category: 'break',
      });
      current += 15;
      availableTime -= 15;
      consecutiveWork = 0;
    }

    // 6. Procrastination reduction:
    // If a task is postponed 2+ times or marked intimidating, schedule a smaller 20-30 min starting block
    let plannedDuration = task.duration;
    let isAdaptedForProcrastination = false;

    if ((task.postponeCount >= 2 || task.intimidating) && task.duration > 30) {
      plannedDuration = 25; // Starter block!
      isAdaptedForProcrastination = true;
    }

    const effectiveDuration = Math.min(plannedDuration, end - current);

    if (effectiveDuration < 15) {
      unscheduled.push({
        id: task.id,
        name: task.name,
        type: task.type,
        category: task.category,
        remainingDuration: task.duration,
        originalDuration: task.duration,
        energy: task.energy,
        priority: task.priority,
        postponeCount: task.postponeCount,
        reason: 'Insufficient time slot remaining before end time',
      });
      continue;
    }

    // Schedule the work block
    const subtitle = isAdaptedForProcrastination
      ? `Starter chunk (${formatMinutes(effectiveDuration)} of ${formatMinutes(task.duration)}) • Low activation friction`
      : `${formatMinutes(effectiveDuration)} • ${task.energy} energy • P${task.priority}`;

    schedule.push({
      id: `task-${task.id}-${current}`,
      type: 'work',
      start: current,
      duration: effectiveDuration,
      title: task.name,
      subtitle,
      category: task.category,
      taskId: task.id,
      originalTask: task,
    });

    current += effectiveDuration;
    availableTime -= effectiveDuration;
    consecutiveWork += effectiveDuration;
    scheduledTaskCount += 1;

    // Add gentle buffer between tasks (e.g. 10m transition buffer)
    const bufferTime = capacity.bufferBetweenTasks || 10;
    if (bufferTime > 0 && current + bufferTime < end) {
      schedule.push({
        id: `buffer-${current}`,
        type: 'buffer',
        start: current,
        duration: bufferTime,
        title: 'Transition Buffer',
        subtitle: 'Wrap up, take notes, switch context calmly',
        category: 'free',
      });
      current += bufferTime;
      availableTime -= bufferTime;
      consecutiveWork = 0;
    }
  }

  // 7. Insert remaining free time
  if (current < end && end - current >= 15) {
    schedule.push({
      id: `free-${current}`,
      type: 'free',
      start: current,
      duration: end - current,
      title: 'Free Time & Wind-down',
      subtitle: "You don't have to optimize every minute. Space to breathe.",
      category: 'free',
    });
  }

  const totalWorkMinutes = schedule
    .filter((s) => s.type === 'work')
    .reduce((sum, s) => sum + s.duration, 0);

  const totalBreakMinutes = schedule
    .filter((s) => s.type === 'break' || s.type === 'meal')
    .reduce((sum, s) => sum + s.duration, 0);

  const totalBufferMinutes = schedule
    .filter((s) => s.type === 'buffer')
    .reduce((sum, s) => sum + s.duration, 0);

  const totalFreeMinutes = schedule
    .filter((s) => s.type === 'free')
    .reduce((sum, s) => sum + s.duration, 0);

  const totalPlannedMinutes = candidateTasks.reduce((sum, t) => sum + t.duration, 0);

  const isOverloaded = totalPlannedMinutes > totalWindow * 0.9 || unscheduled.length >= 3;

  return {
    schedule,
    unscheduled,
    totalWorkMinutes,
    totalBreakMinutes,
    totalFreeMinutes,
    totalBufferMinutes,
    totalPlannedMinutes,
    capacityMinutes: totalWindow,
    isOverloaded,
  };
}
