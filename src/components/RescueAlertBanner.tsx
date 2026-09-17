import React from 'react';
import { ScheduleResult, Task } from '../types';

interface RescueAlertBannerProps {
  scheduleResult: ScheduleResult | null;
  tasks: Task[];
  onOpenRescueDay: () => void;
}

export const RescueAlertBanner: React.FC<RescueAlertBannerProps> = ({
  scheduleResult,
  tasks,
  onOpenRescueDay,
}) => {
  if (!scheduleResult) return null;

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const activeWorkBlocks = scheduleResult.schedule.filter(
    (s) => s.type === 'work' && s.originalTask && !s.originalTask.completed
  );

  // Check if any uncompleted task scheduled start time is past by more than 15 minutes
  const hasOverdueScheduledBlock = activeWorkBlocks.some(
    (b) => nowMinutes > b.start + 15
  );

  const isBehind = scheduleResult.isOverloaded || hasOverdueScheduledBlock;

  if (!isBehind) {
    return null;
  }

  return (
    <div
      id="banner-rescue-behind-schedule"
      className="rounded-2xl p-3.5 bg-amber-50/90 border border-amber-300/80 text-stone-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in"
    >
      <div className="flex items-center gap-2.5 text-xs">
        <span className="text-base leading-none">⚠️</span>
        <div>
          <span className="font-bold text-amber-950">You're behind schedule. </span>
          <span className="text-amber-800">Want me to rebuild the rest of today?</span>
        </div>
      </div>

      <button
        onClick={onOpenRescueDay}
        className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-2xs self-start sm:self-auto cursor-pointer active:scale-[0.98]"
      >
        Rescue My Day
      </button>
    </div>
  );
};
