import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Clock,
  Battery,
  BatteryMedium,
  BatteryCharging,
  Play,
  CheckCircle,
  LifeBuoy,
  Coffee,
  ArrowRight,
  Flame,
  Check,
} from 'lucide-react';
import {
  Task,
  CapacitySettings,
  ScheduleResult,
  EnergyLevel,
  UserProfile,
  ScheduleBlock,
} from '../types';
import { formatMinutes, minutesToTime } from '../utils/scheduler';
import { CATEGORY_CONFIG } from '../utils/categories';

interface DailyDashboardHeroProps {
  userProfile: UserProfile;
  onUpdateEnergy: (energy: EnergyLevel) => void;
  tasks: Task[];
  capacity: CapacitySettings;
  scheduleResult: ScheduleResult | null;
  onOpenWhatShouldIDo: () => void;
  onOpenRescueDay: () => void;
  onStartFocusSession: (task: Task) => void;
  onToggleTask: (id: number) => void;
}

export const DailyDashboardHero: React.FC<DailyDashboardHeroProps> = ({
  userProfile,
  onUpdateEnergy,
  tasks,
  capacity,
  scheduleResult,
  onOpenWhatShouldIDo,
  onOpenRescueDay,
  onStartFocusSession,
  onToggleTask,
}) => {
  // Real-time clock updating every 10 seconds
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const currentMinutesFromMidnight = currentTime.getHours() * 60 + currentTime.getMinutes();
  const timeFormatted = currentTime.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  // Greeting based on hour
  const hour = currentTime.getHours();
  const greetingTime = hour < 12 ? 'GOOD MORNING' : hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';
  const userName = userProfile.name?.toUpperCase() || 'NAT';

  // Task calculations
  const allTasks = tasks.filter((t) => t.type === 'task');
  const activeTasks = allTasks.filter((t) => !t.completed);
  const completedTasks = allTasks.filter((t) => t.completed);

  const totalTasksCount = allTasks.length;
  const completedTasksCount = completedTasks.length;

  const progressPercent = totalTasksCount > 0
    ? Math.round((completedTasksCount / totalTasksCount) * 100)
    : 0;

  // Time calculations
  const focusedTimeCompleted = completedTasks.reduce(
    (sum, t) => sum + (t.actualDuration || t.duration || 0),
    0
  );
  const remainingPlannedWork = activeTasks.reduce((sum, t) => sum + t.duration, 0);
  const freeHeadroom = scheduleResult?.totalFreeMinutes || 0;

  // "You've done what matters today" check:
  // If user completed at least 2 tasks or any Priority 3/4 task, or if all planned tasks done
  const hasDoneWhatMatters =
    (completedTasks.some((t) => t.priority >= 3) && completedTasksCount >= 1) ||
    (completedTasksCount >= 3) ||
    (totalTasksCount > 0 && activeTasks.length === 0);

  // Determine current active schedule block
  const scheduleBlocks = scheduleResult?.schedule || [];
  const currentBlock: ScheduleBlock | undefined = scheduleBlocks.find(
    (b) => currentMinutesFromMidnight >= b.start && currentMinutesFromMidnight < b.start + b.duration
  );

  // If no block is active right now, find the next upcoming block
  const upcomingBlock: ScheduleBlock | undefined = scheduleBlocks.find(
    (b) => b.start > currentMinutesFromMidnight
  );

  // Current task if block is a work block
  const activeTaskFromBlock = currentBlock?.originalTask;

  return (
    <div id="daily-dashboard-hero" className="space-y-4 mb-6">
      {/* Top Greeting & Energy Check-in */}
      <div className="bg-linear-to-r from-white via-[#faf9f6] to-[#f4f2eb] border border-[#e5e1d8] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#1e1e1e]">
              {greetingTime}, {userName} 🌱
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#666] mt-0.5">
            Let’s protect your mental bandwidth and focus on what truly matters.
          </p>
        </div>

        {/* Energy Check-in Selector */}
        <div className="flex items-center gap-2 bg-[#ede9e1]/70 p-1.5 rounded-2xl border border-[#dedad0]">
          <span className="text-[11px] font-bold text-[#666] px-2 uppercase tracking-wider hidden sm:inline">
            Energy:
          </span>
          <button
            id="btn-energy-low"
            type="button"
            onClick={() => onUpdateEnergy('low')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              userProfile.energyToday === 'low'
                ? 'bg-amber-100/90 text-amber-900 border border-amber-300 shadow-xs scale-105'
                : 'text-[#666] hover:text-[#111] hover:bg-white/50'
            }`}
          >
            <span>🪫</span>
            <span>Low</span>
          </button>

          <button
            id="btn-energy-medium"
            type="button"
            onClick={() => onUpdateEnergy('medium')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              userProfile.energyToday === 'medium'
                ? 'bg-teal-100/90 text-teal-900 border border-teal-300 shadow-xs scale-105'
                : 'text-[#666] hover:text-[#111] hover:bg-white/50'
            }`}
          >
            <span>⚡</span>
            <span>Medium</span>
          </button>

          <button
            id="btn-energy-high"
            type="button"
            onClick={() => onUpdateEnergy('high')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              userProfile.energyToday === 'high'
                ? 'bg-indigo-100/90 text-indigo-900 border border-indigo-300 shadow-xs scale-105'
                : 'text-[#666] hover:text-[#111] hover:bg-white/50'
            }`}
          >
            <span>🔥</span>
            <span>High</span>
          </button>
        </div>
      </div>

      {/* Grid: Progress Bar + NOW Highlight Card */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4">
        {/* TODAY'S PROGRESS CARD */}
        <div
          id="card-daily-progress"
          className="bg-white border border-[#e6e2da] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#777]">
                  Today's Progress
                </span>
                {hasDoneWhatMatters && (
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 animate-pulse">
                    <span>✨</span>
                    <span>You've done what matters today</span>
                  </span>
                )}
              </div>
              <span className="text-2xl sm:text-3xl font-black text-[#1e1e1e] font-mono">
                {progressPercent}%
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-3.5 bg-[#f0ede6] rounded-full overflow-hidden p-0.5 border border-[#e4e0d7] mb-3">
              <div
                className="h-full rounded-full transition-all duration-700 bg-linear-to-r from-emerald-500 via-teal-500 to-indigo-500 shadow-xs"
                style={{ width: `${Math.min(100, Math.max(progressPercent, 4))}%` }}
              />
            </div>

            {/* Task count summary */}
            <div className="flex items-center justify-between text-xs font-medium text-[#666] mb-4">
              <span>
                <strong className="text-[#1e1e1e] font-bold">{completedTasksCount}</strong> of{' '}
                <strong className="text-[#1e1e1e] font-bold">{totalTasksCount}</strong> meaningful tasks completed
              </span>
              <span className="text-[11px] text-[#888]">
                {activeTasks.length} remaining
              </span>
            </div>
          </div>

          {/* Metric Stats Chips */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#f0ede6]">
            <div className="p-2.5 rounded-2xl bg-[#faf9f6] border border-[#ece8df]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#888] block">
                Focused
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-800">
                {formatMinutes(focusedTimeCompleted)}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#faf9f6] border border-[#ece8df]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#888] block">
                Planned Left
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-[#333]">
                {formatMinutes(remainingPlannedWork)}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#faf9f6] border border-[#ece8df]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#888] block">
                Free Headroom
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-[#5c6875]">
                {formatMinutes(freeHeadroom)}
              </span>
            </div>
          </div>
        </div>

        {/* NOW CARD: Big Time & Action Recommendation */}
        <div
          id="card-now-indicator"
          className="bg-linear-to-br from-[#1e1e1e] to-[#2c2b29] text-white border border-[#383734] rounded-3xl p-5 sm:p-6 shadow-md flex flex-col justify-between relative overflow-hidden"
        >
          {/* Subtle decorative glow */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            {/* Real-time Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                  NOW · {timeFormatted}
                </span>
              </div>

              <button
                id="btn-rescue-day-trigger"
                onClick={onOpenRescueDay}
                title="Falling behind? Rebalance the rest of today with one click"
                className="flex items-center gap-1.5 text-[11px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
              >
                <LifeBuoy className="w-3.5 h-3.5 text-amber-300" />
                <span>Rescue my day</span>
              </button>
            </div>

            {/* Current Activity Content */}
            {currentBlock ? (
              <div className="mt-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold text-amber-300 font-mono">
                    {minutesToTime(currentBlock.start)} – {minutesToTime(currentBlock.start + currentBlock.duration)}
                  </span>
                  <span className="text-[11px] text-gray-300 bg-white/10 px-2 py-0.5 rounded-md font-medium">
                    {formatMinutes(currentBlock.duration)}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight line-clamp-2 mt-1">
                  {currentBlock.title}
                </h3>

                <p className="text-xs text-gray-300 mt-1 line-clamp-1">
                  {currentBlock.subtitle || 'Focus on this block with presence and zero multitasking.'}
                </p>
              </div>
            ) : upcomingBlock ? (
              <div className="mt-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    Next at {minutesToTime(upcomingBlock.start)}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    (in {Math.max(1, upcomingBlock.start - currentMinutesFromMidnight)}m)
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight line-clamp-1">
                  {upcomingBlock.title}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Take a moment to hydrate or step away from screens before starting.
                </p>
              </div>
            ) : (
              <div className="mt-1">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Schedule Complete / Open Space
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  You’ve wrapped up scheduled items for today. Rest and recharge guilt-free.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
            {activeTaskFromBlock && (
              <button
                onClick={() => onStartFocusSession(activeTaskFromBlock)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#1e1e1e] font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-[0.98]"
              >
                <Play className="w-3.5 h-3.5 fill-[#1e1e1e]" />
                <span>Focus Session</span>
              </button>
            )}

            <button
              onClick={onOpenWhatShouldIDo}
              className={`py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-white/15 cursor-pointer active:scale-[0.98] ${
                activeTaskFromBlock ? '' : 'flex-1 bg-amber-400 text-[#1e1e1e] hover:bg-amber-300 border-none'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${activeTaskFromBlock ? 'text-amber-300' : 'text-[#1e1e1e]'}`} />
              <span>What should I do?</span>
            </button>

            {activeTaskFromBlock && (
              <button
                onClick={() => onToggleTask(activeTaskFromBlock.id)}
                title="Mark this current task done"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-emerald-600 hover:text-white text-gray-300 border border-white/15 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
