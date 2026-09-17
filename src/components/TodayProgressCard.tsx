import React from 'react';
import { Sparkles, Flame, CheckCircle2 } from 'lucide-react';
import { Task, ScheduleResult } from '../types';
import { MomentumDetails } from '../utils/momentum';
import { formatMinutes } from '../utils/scheduler';

interface TodayProgressCardProps {
  tasks: Task[];
  scheduleResult: ScheduleResult | null;
  momentum: MomentumDetails;
}

export const TodayProgressCard: React.FC<TodayProgressCardProps> = ({
  tasks,
  scheduleResult,
  momentum,
}) => {
  const activeTasks = tasks.filter((t) => t.type === 'task');
  const totalTasks = activeTasks.length;
  const completedTasks = activeTasks.filter((t) => t.completed);
  const completedCount = completedTasks.length;

  const percentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Completed focus time
  const completedMinutes = completedTasks.reduce(
    (sum, t) => sum + (t.actualDuration || t.duration || 0),
    0
  );

  // Subtle companion text
  const companionMessage =
    percentage === 100
      ? '✨ Everything planned for today is done.'
      : percentage >= 50
      ? '🌱 You’ve done what matters most today.'
      : completedCount > 0
      ? '🌱 You’re doing enough for today.'
      : '🌱 Take it one block at a time.';

  return (
    <div
      id="card-level-3-progress"
      className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs"
    >
      {/* Header with Title & Percentage */}
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[11px] font-black uppercase tracking-wider text-stone-400">
          TODAY'S PROGRESS
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-black text-stone-900 font-mono">
            {percentage}%
          </span>
          <span className="text-xs font-semibold text-stone-500 font-mono">
            ({completedCount} / {totalTasks} tasks)
          </span>
        </div>
      </div>

      {/* Compact Progress Bar */}
      <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-stone-200/80">
        <div
          className="h-full rounded-full bg-stone-900 transition-all duration-500 ease-out"
          style={{ width: `${Math.max(percentage > 0 ? 5 : 0, percentage)}%` }}
        />
      </div>

      {/* Supporting stats: Focused time + Compact Streak */}
      <div className="flex items-center justify-between text-xs text-stone-600 mt-3 pt-2.5 border-t border-stone-100">
        {/* Focused time */}
        <div className="flex items-center gap-1 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{formatMinutes(completedMinutes)} focused</span>
        </div>

        {/* Compact Streak (User requirement #11) */}
        <div className="flex items-center gap-1 font-bold text-stone-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
          <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span>{momentum.actionStreakDays} day action streak</span>
        </div>
      </div>

      {/* Subtle Companion Encouragement (User requirement #5) */}
      <div className="mt-2 text-xs text-stone-500 font-medium flex items-center gap-1">
        <span>{companionMessage}</span>
      </div>
    </div>
  );
};
