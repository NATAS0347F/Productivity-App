import { Task, ScheduleResult } from '../types';

export function getMotivationalMessage(
  tasks: Task[],
  scheduleResult: ScheduleResult | null
): { text: string; subtext?: string; type: 'neutral' | 'overloaded' | 'encouraging' | 'gentle' } {
  const completedCount = tasks.filter((t) => t.completed).length;
  const postponedTasks = tasks.filter((t) => !t.completed && t.postponeCount >= 2);
  const isOverloaded = scheduleResult?.isOverloaded || (scheduleResult?.unscheduled.length || 0) >= 3;

  if (isOverloaded) {
    return {
      text: 'You have too much planned. Let’s make today smaller.',
      subtext: 'A realistic plan beats a perfect fantasy every single time.',
      type: 'overloaded',
    };
  }

  if (postponedTasks.length > 0) {
    const taskName = postponedTasks[0].name;
    return {
      text: 'Let’s make the first step ridiculously easy.',
      subtext: `Starting "${taskName}" for just 10 minutes creates momentum out of nowhere.`,
      type: 'gentle',
    };
  }

  if (completedCount >= 3) {
    return {
      text: 'You’re making genuine progress today.',
      subtext: 'Focus on one good block at a time. Momentum builds naturally.',
      type: 'encouraging',
    };
  }

  // Rotating calm, grounding affirmations
  const generalMessages = [
    {
      text: 'You don’t need to finish everything today.',
      subtext: 'Your backlog is not a failure. It’s an intentional holding space.',
    },
    {
      text: 'Start small. Momentum comes after starting, never before.',
      subtext: 'The hardest resistance dissolves in the first five minutes.',
    },
    {
      text: 'A realistic plan beats a perfect plan.',
      subtext: 'Preserving energy for tomorrow is part of high performance.',
    },
    {
      text: 'You have permission to rest.',
      subtext: 'Breaks and free time are not rewards for exhaustion — they are requirements.',
    },
  ];

  // Pick deterministically based on day or hour
  const index = new Date().getDate() % generalMessages.length;
  return {
    text: generalMessages[index].text,
    subtext: generalMessages[index].subtext,
    type: 'neutral',
  };
}
