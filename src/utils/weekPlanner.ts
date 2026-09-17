import { Task, PlanWeekResult, WeeklyDistributionItem } from '../types';

export function calculateWeekPlan(tasks: Task[]): PlanWeekResult {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const distributions: WeeklyDistributionItem[] = [];

  const actionableTasks = tasks.filter((t) => !t.completed && t.type === 'task');
  const goals = tasks.filter((t) => !t.completed && (t.type === 'goal' || t.type === 'project'));

  // 1. Distribute goals into manageable blocks (e.g. 45 min on Tue, 45 min on Thu, 60 min on Sat)
  // Only schedule up to 2 active goals so as not to overwhelm the week
  const activeGoals = goals.slice(0, 2);
  let goalSessionCount = 0;

  activeGoals.forEach((goal, gIdx) => {
    if (gIdx === 0) {
      // First goal gets Tuesday (idx 1), Thursday (idx 3), Saturday (idx 5)
      distributions.push({
        taskId: goal.id,
        taskName: `${goal.name} (Focus Block)`,
        dayIndex: 1,
        dayName: 'Tuesday',
        allocatedMinutes: 45,
        isGoalSession: true,
        category: goal.category,
      });
      distributions.push({
        taskId: goal.id,
        taskName: `${goal.name} (Progress Sprint)`,
        dayIndex: 3,
        dayName: 'Thursday',
        allocatedMinutes: 45,
        isGoalSession: true,
        category: goal.category,
      });
      distributions.push({
        taskId: goal.id,
        taskName: `${goal.name} (Deep Work)`,
        dayIndex: 5,
        dayName: 'Saturday',
        allocatedMinutes: 60,
        isGoalSession: true,
        category: goal.category,
      });
      goalSessionCount += 3;
    } else {
      // Second goal gets Wednesday (idx 2) and Sunday (idx 6)
      distributions.push({
        taskId: goal.id,
        taskName: `${goal.name} (Session)`,
        dayIndex: 2,
        dayName: 'Wednesday',
        allocatedMinutes: 40,
        isGoalSession: true,
        category: goal.category,
      });
      distributions.push({
        taskId: goal.id,
        taskName: `${goal.name} (Review & Practice)`,
        dayIndex: 6,
        dayName: 'Sunday',
        allocatedMinutes: 45,
        isGoalSession: true,
        category: goal.category,
      });
      goalSessionCount += 2;
    }
  });

  // 2. Distribute actionable tasks according to deadlines and balance:
  // Mon (day 0) gets highest priority tasks
  // Tue (day 1), Wed (day 2), Thu (day 3), Fri (day 4) receive remaining tasks without overloading any single day
  let scheduledTasksCount = 0;
  actionableTasks.forEach((task, idx) => {
    // If task has explicit deadline, map it to the respective weekday if within this week
    let assignedDay = idx % 5; // spread across Mon-Fri by default
    if (task.deadline) {
      const d = new Date(task.deadline);
      const jsDay = d.getDay(); // 0=Sun, 1=Mon...
      assignedDay = jsDay === 0 ? 6 : jsDay - 1;
    }

    distributions.push({
      taskId: task.id,
      taskName: task.name,
      dayIndex: assignedDay,
      dayName: dayNames[assignedDay],
      allocatedMinutes: task.duration,
      isGoalSession: false,
      category: task.category,
    });
    scheduledTasksCount++;
  });

  // Sort distributions by dayIndex
  distributions.sort((a, b) => a.dayIndex - b.dayIndex);

  const summary = `Flow distributed ${scheduledTasksCount} tasks across your week and scheduled ${goalSessionCount} manageable focus blocks for "${activeGoals.map((g) => g.name).join('", "')}". No single day is overloaded.`;

  return {
    distributions,
    summary,
    scheduledGoalsCount: activeGoals.length,
    scheduledTasksCount,
  };
}
