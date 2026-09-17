import React from 'react';
import { Sparkles, Clock, CheckCircle2, Coffee, Flame } from 'lucide-react';
import { Task, ScheduleResult } from '../types';
import { formatMinutes } from '../utils/scheduler';

interface DailyProgressCardProps {
  tasks: Task[];
  scheduleResult: ScheduleResult | null;
  onOpenRescueDay?: () => void;
}

export const DailyProgressCard: React.FC<DailyProgressCardProps> = ({
  tasks,
  scheduleResult,
  onOpenRescueDay,
}) => {
  const activeTasks = tasks.filter((t) => t.type === 'task');
  const totalTasks = activeTasks.length;
  const completedTasks = activeTasks.filter((t) => t.completed);
  const completedCount = completedTasks.length;

  const percentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Completed focus time (either recorded actualDuration or planned duration)
  const completedMinutes = completedTasks.reduce(
    (sum, t) => sum + (t.actualDuration || t.duration || 0),
    0
  );

  // Remaining planned work from uncompleted tasks
  const uncompletedTasks = activeTasks.filter((t) => !t.completed);
  const remainingWorkMinutes = uncompletedTasks.reduce((sum, t) => sum + t.duration, 0);

  // Free time remaining from scheduleResult
  const freeMinutes = scheduleResult?.totalFreeMinutes || 0;

  // Anti-burnout philosophy check:
  // Have they completed their highest priority (P3+) tasks?
  const highPriorityTasks = activeTasks.filter((t) => t.priority >= 3);
  const highPriorityCompleted = highPriorityTasks.filter((t) => t.completed);
  const doneWhatMatters =
    (highPriorityTasks.length > 0 && highPriorityCompleted.length === highPriorityTasks.length) ||
    (completedCount >= 3 && remainingWorkMinutes <= 60);

  return (
    <div
      id="card-daily-progress"
      className="bg-white/95 backdrop-blur-xs border border-stone-200/90 rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden"
    >
      {/* Soft gradient accent in background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-100/40 via-teal-50/20 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#78716c]">
              Today’s Horizon
            </span>
            {doneWhatMatters && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-200/80 animate-in fade-in">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>You’ve done what matters today</span>
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1c1917]">
              {percentage}%
            </h2>
            <span className="text-xs sm:text-sm font-semibold text-[#78716c]">
              ({completedCount} / {totalTasks} tasks completed)
            </span>
          </div>
        </div>

        {/* Rescue My Day Quick Button */}
        {uncompletedTasks.length >= 3 && onOpenRescueDay && (
          <button
            onClick={onOpenRescueDay}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
            title="Falling behind? Rebuild your day realistically."
          >
            <span>🆘</span>
            <span>Rescue my day</span>
          </button>
        )}
      </div>

      {/* Progress Bar with Soft Modern Gradient */}
      <div className="w-full bg-[#f3f1ec] h-3.5 rounded-full overflow-hidden p-0.5 border border-[#e5e1d8]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 via-emerald-500 to-emerald-400 transition-all duration-700 ease-out shadow-xs"
          style={{ width: `${Math.max(percentage > 0 ? 5 : 0, percentage)}%` }}
        />
      </div>

      {/* Metric Pills */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 pt-4 border-t border-[#f0ede6]">
        {/* Focused time completed */}
        <div className="p-2.5 rounded-2xl bg-[#faf9f6] border border-[#eeebe5] text-left">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#78716c]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Focused done</span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-[#1c1917] mt-0.5">
            {formatMinutes(completedMinutes)}
          </div>
        </div>

        {/* Remaining planned work */}
        <div className="p-2.5 rounded-2xl bg-[#faf9f6] border border-[#eeebe5] text-left">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#78716c]">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">Remaining work</span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-[#1c1917] mt-0.5">
            {formatMinutes(remainingWorkMinutes)}
          </div>
        </div>

        {/* Free time remaining */}
        <div className="p-2.5 rounded-2xl bg-[#faf9f6] border border-[#eeebe5] text-left">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#78716c]">
            <Coffee className="w-3.5 h-3.5 text-[#3b7082] shrink-0" />
            <span className="truncate">Free headspace</span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-[#1c1917] mt-0.5">
            {formatMinutes(freeMinutes)}
          </div>
        </div>
      </div>
    </div>
  );
};
