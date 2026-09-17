import { ActivityDay, Task, ScheduleResult } from '../types';

export interface MomentumDetails {
  score: 'Thriving' | 'Good' | 'Steady' | 'Gentle Pace' | 'Recharging';
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  headline: string;
  rationale: string;
  planningStreakDays: number;
  actionStreakDays: number;
  focusSessionsCount: number;
  weeklyActiveDays: number; // e.g. 5 / 7
  weeklyDaysTotal: number;
  weeklyDayStatuses: { dayName: string; active: boolean; isToday: boolean }[];
}

export function calculateMomentum(
  tasks: Task[],
  scheduleResult: ScheduleResult | null,
  activityHistory: ActivityDay[]
): MomentumDetails {
  const todayStr = new Date().toISOString().slice(0, 10);
  const completedToday = tasks.filter(
    (t) => t.completed && t.completedAt && new Date(t.completedAt).toISOString().slice(0, 10) === todayStr
  );
  const highPriorityCompleted = completedToday.filter((t) => t.priority >= 3);
  const postponedTasks = tasks.filter((t) => !t.completed && t.postponeCount >= 2);
  const isOverloaded = scheduleResult?.isOverloaded ?? false;

  // Calculate gentle streaks from history
  // 1. Planning Streak: consecutive days checked in ending today or yesterday
  let planningStreak = 0;
  const sortedHistory = [...activityHistory].sort((a, b) => b.date.localeCompare(a.date));
  
  for (const day of sortedHistory) {
    if (day.checkedIn) {
      planningStreak++;
    } else {
      break;
    }
  }
  if (planningStreak === 0) planningStreak = 1;

  // 2. Action Streak: consecutive days with at least 1 task completed
  let actionStreak = 0;
  for (const day of sortedHistory) {
    if (day.tasksCompleted > 0) {
      actionStreak++;
    } else {
      break;
    }
  }
  if (actionStreak === 0 && completedToday.length > 0) actionStreak = 1;

  // 3. Focus sessions count (total in last 7 days)
  const last7Days = sortedHistory.slice(0, 7);
  const totalFocusSessions = last7Days.reduce((acc, d) => acc + (d.focusSessions || 0), 0);

  // 4. Weekly active days (out of 7)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon ...
  const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const mondayDate = new Date(today);
  mondayDate.setDate(today.getDate() + mondayOffset);

  const weeklyDayStatuses = daysOfWeek.map((dayName, idx) => {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + idx);
    const dateStr = d.toISOString().slice(0, 10);
    const historyEntry = activityHistory.find((h) => h.date === dateStr);
    const isToday = dateStr === todayStr;
    const active = Boolean(historyEntry?.checkedIn || (isToday && completedToday.length >= 0));
    return { dayName, active, isToday };
  });

  const weeklyActiveDays = weeklyDayStatuses.filter((d) => d.active).length;

  // Non-judgmental Momentum Determination:
  let score: MomentumDetails['score'] = 'Good';
  let headline = 'Consistent & Centered';
  let rationale = 'You are maintaining steady progress without burning yourself out.';
  let color = 'text-emerald-700';
  let badgeBg = 'bg-emerald-50';
  let badgeBorder = 'border-emerald-200';
  let badgeText = 'text-emerald-800';

  if (highPriorityCompleted.length >= 2 || completedToday.length >= 4) {
    score = 'Thriving';
    headline = 'Deep Traction & Flow';
    rationale = `You've tackled ${highPriorityCompleted.length > 0 ? 'vital high-impact work' : 'multiple meaningful items'} today. That takes genuine discipline.`;
    color = 'text-teal-700';
    badgeBg = 'bg-teal-50';
    badgeBorder = 'border-teal-200';
    badgeText = 'text-teal-800';
  } else if (isOverloaded) {
    score = 'Steady';
    headline = 'Calibrating Day Capacity';
    rationale = 'You have a rich ambition today. Flow trimmed excess tasks so your momentum stays clean and unburdened.';
    color = 'text-amber-700';
    badgeBg = 'bg-amber-50';
    badgeBorder = 'border-amber-200';
    badgeText = 'text-amber-800';
  } else if (postponedTasks.length >= 2 && completedToday.length === 0) {
    score = 'Gentle Pace';
    headline = 'Friction Detected — Start Small';
    rationale = 'Resistance is normal. Try a 10-minute micro sprint on just one item to break the freeze.';
    color = 'text-purple-700';
    badgeBg = 'bg-purple-50';
    badgeBorder = 'border-purple-200';
    badgeText = 'text-purple-800';
  } else if (completedToday.length === 0) {
    score = 'Recharging';
    headline = 'Setting the Stage';
    rationale = 'Showing up and checking in is the foundation. Pick one easy starting step when you feel ready.';
    color = 'text-stone-700';
    badgeBg = 'bg-stone-100';
    badgeBorder = 'border-stone-200';
    badgeText = 'text-stone-800';
  }

  return {
    score,
    color,
    badgeBg,
    badgeBorder,
    badgeText,
    headline,
    rationale,
    planningStreakDays: Math.max(1, planningStreak),
    actionStreakDays: Math.max(1, actionStreak),
    focusSessionsCount: Math.max(1, totalFocusSessions),
    weeklyActiveDays: Math.max(1, Math.min(7, weeklyActiveDays)),
    weeklyDaysTotal: 7,
    weeklyDayStatuses,
  };
}
