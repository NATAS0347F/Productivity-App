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
  Edit2,
  RefreshCw,
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
  onUpdateProfile?: (profile: UserProfile) => void;
  tasks: Task[];
  capacity: CapacitySettings;
  scheduleResult: ScheduleResult | null;
  onOpenWhatShouldIDo: () => void;
  onOpenRescueDay: () => void;
  onStartFocusSession: (task: Task) => void;
  onToggleTask: (id: number) => void;
}

const INSPIRING_QUOTES = [
  { text: 'ready for a great day?', emoji: '✨', advice: 'Take it one intentional step at a time.' },
  { text: 'ready to make today count?', emoji: '🎯', advice: 'Pick one priority first and protect your focus.' },
  { text: 'steady progress beats perfection every time.', emoji: '🌱', advice: 'Small consistent blocks add up to massive momentum.' },
  { text: 'one intentional step at a time.', emoji: '🪴', advice: 'You do not need to do everything at once. Just start gently.' },
  { text: 'protect your mental peace and make space for what matters.', emoji: '☕', advice: 'Guard your bandwidth like the rare asset it is.' },
  { text: "what's the one thing that will give you momentum today?", emoji: '🚀', advice: 'Conquer the hardest friction point first.' },
  { text: 'take a deep breath — today is full of possibilities.', emoji: '🌤️', advice: 'Be kind to your energy rhythms.' },
  { text: 'clarity comes from taking action, not overthinking.', emoji: '💡', advice: 'Start for just 5 minutes and let the momentum follow.' },
];

export const DailyDashboardHero: React.FC<DailyDashboardHeroProps> = ({
  userProfile,
  onUpdateEnergy,
  onUpdateProfile,
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
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userProfile.name || 'Friend');

  useEffect(() => {
    setNameInput(userProfile.name || 'Friend');
  }, [userProfile.name]);

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

  // Time of day badge
  const hour = currentTime.getHours();
  const timeOfDayTag = hour < 12 ? '☀️ Morning Focus' : hour < 17 ? '🌤️ Afternoon Flow' : '🌙 Evening Wind-down';
  const rawName = userProfile.name?.trim() || 'Friend';
  const activeQuote = INSPIRING_QUOTES[quoteIndex % INSPIRING_QUOTES.length];

  const handleSaveName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = nameInput.trim() || 'Friend';
    if (onUpdateProfile) {
      onUpdateProfile({
        ...userProfile,
        name: trimmed,
      });
    }
    setIsEditingName(false);
  };

  const cycleQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % INSPIRING_QUOTES.length);
  };

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
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-200/80 text-stone-600 font-mono">
              {timeOfDayTag}
            </span>
            <span className="text-stone-300">·</span>
            <span className="text-[11px] font-medium text-stone-500 font-mono">
              {timeFormatted}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-1.5 my-1">
                <span className="text-lg sm:text-2xl font-black text-[#1e1e1e]">Hello</span>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Your Name"
                  autoFocus
                  className="px-2 py-0.5 bg-white border border-stone-300 rounded-lg text-sm sm:text-lg font-bold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 w-32 sm:w-44"
                />
                <button
                  type="submit"
                  className="p-1.5 rounded-lg bg-stone-900 text-white hover:bg-stone-800 text-xs font-bold"
                  title="Save Name"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(rawName);
                    setIsEditingName(false);
                  }}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 text-xs"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#1e1e1e] flex items-center gap-2 flex-wrap">
                <span>Hello</span>
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  className="inline-flex items-center gap-1 text-stone-900 hover:text-amber-800 border-b-2 border-dashed border-stone-300 hover:border-amber-600 transition-colors group cursor-pointer"
                  title="Click to change your name"
                >
                  <span>{rawName}</span>
                  <Edit2 className="w-3 h-3 text-stone-400 group-hover:text-amber-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                </button>
                <span className="text-stone-300">,</span>
                <span className="text-stone-700 font-semibold">{activeQuote.text}</span>
                <span className="text-base select-none">{activeQuote.emoji}</span>
              </h1>
            )}

            {/* Quote cycler */}
            <button
              type="button"
              onClick={cycleQuote}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
              title="See another inspiring quote"
            >
              <RefreshCw className="w-3.5 h-3.5 transition-transform hover:rotate-180 duration-500" />
            </button>
          </div>

          <p className="text-xs sm:text-sm text-[#666] mt-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{activeQuote.advice}</span>
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
