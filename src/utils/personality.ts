import { Task, ScheduleResult, EnergyLevel } from '../types';

export interface PersonalityVoice {
  quote: string;
  author: string;
  tag: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
}

export function getSupportiveFriendMessage(
  tasks: Task[],
  scheduleResult: ScheduleResult | null,
  userEnergy: EnergyLevel
): PersonalityVoice {
  const activeTasks = tasks.filter((t) => !t.completed && t.type === 'task');
  const completedToday = tasks.filter((t) => t.completed);
  const postponedTasks = tasks.filter((t) => !t.completed && t.postponeCount >= 2);
  const totalPlannedMinutes = activeTasks.reduce((sum, t) => sum + t.duration, 0);
  const capacityHours = ((scheduleResult?.capacityMinutes || 480) / 60).toFixed(0);
  const plannedHours = (totalPlannedMinutes / 60).toFixed(1);

  // 1. Extreme overload: planned hours way higher than capacity
  if (totalPlannedMinutes > (scheduleResult?.capacityMinutes || 480) * 1.5) {
    return {
      quote: `Bestie, you have ${plannedHours} hours of work scheduled for a ${capacityHours}-hour day. Let’s be serious.`,
      author: 'Your honest friend',
      tag: 'Reality Check',
      bgGradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-900',
    };
  }

  // 2. High accomplishment: done what matters
  if (completedToday.length >= 4 || (completedToday.length >= 2 && activeTasks.length <= 1)) {
    return {
      quote: 'Look at you actually getting things done 👀 That’s enough for today. Go live your life.',
      author: 'Supportive Flow',
      tag: 'Proud of you',
      bgGradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-950',
    };
  }

  // 3. Procrastination / avoiding
  if (postponedTasks.length > 0) {
    return {
      quote: `You’ve been avoiding "${postponedTasks[0].name}". Let’s make the first step stupidly easy.`,
      author: 'Gentle push',
      tag: 'No Shame',
      bgGradient: 'from-purple-500/10 via-indigo-500/5 to-transparent',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-950',
    };
  }

  // 4. Low energy day
  if (userEnergy === 'low') {
    return {
      quote: 'Low battery today? You still showed up. That counts more than grinding.',
      author: 'Rest advocate',
      tag: 'Self-compassion',
      bgGradient: 'from-stone-500/10 via-blue-500/5 to-transparent',
      borderColor: 'border-stone-200',
      textColor: 'text-stone-900',
    };
  }

  // 5. Default encouraging
  return {
    quote: 'Start with 10 minutes. The resistance almost always vanishes once you’re in.',
    author: 'Flow buddy',
    tag: 'Quick Momentum',
    bgGradient: 'from-teal-500/10 via-emerald-500/5 to-transparent',
    borderColor: 'border-teal-200',
    textColor: 'text-teal-950',
  };
}
