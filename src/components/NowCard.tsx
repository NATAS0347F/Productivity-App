import React, { useState, useEffect } from 'react';
import { Sparkles, Play, Check, Clock, Calendar, AlertCircle } from 'lucide-react';
import { ScheduleResult, Task, ScheduleBlock } from '../types';
import { CATEGORY_CONFIG } from '../utils/categories';
import { formatMinutes, minutesTo12Hour, formatTimeRange, formatDeadline, getDaysUntilDeadline } from '../utils/scheduler';

interface NowCardProps {
  scheduleResult: ScheduleResult | null;
  tasks: Task[];
  onOpenWhatShouldIDo: () => void;
  onStartFocusSession: (task: Task) => void;
  onToggleTask: (id: number) => void;
}

export const NowCard: React.FC<NowCardProps> = ({
  scheduleResult,
  tasks,
  onOpenWhatShouldIDo,
  onStartFocusSession,
  onToggleTask,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 10000); // sync every 10s
    return () => clearInterval(timer);
  }, []);

  const nowMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

  const schedule = scheduleResult?.schedule || [];

  // Find active block or upcoming block
  let currentBlock: ScheduleBlock | null = null;
  let nextUpcomingBlock: ScheduleBlock | null = null;

  for (const block of schedule) {
    const start = block.start;
    const end = block.start + block.duration;
    if (nowMinutes >= start && nowMinutes < end) {
      currentBlock = block;
      break;
    }
    if (start > nowMinutes && !nextUpcomingBlock && (block.type === 'work' || block.type === 'meal')) {
      nextUpcomingBlock = block;
    }
  }

  // Active target block to feature in the NOW hero spot
  const activeBlock = currentBlock || nextUpcomingBlock || schedule.find((s) => s.type === 'work' && s.originalTask && !s.originalTask.completed);

  const matchingTask = activeBlock?.taskId
    ? tasks.find((t) => t.id === activeBlock.taskId)
    : activeBlock?.originalTask;

  const isCurrentActive = currentBlock !== null;
  const isWorkTask = activeBlock?.type === 'work';

  // Calculate remaining minutes if active
  let remainingMinutes: number | null = null;
  if (activeBlock) {
    if (isCurrentActive) {
      const end = activeBlock.start + activeBlock.duration;
      remainingMinutes = Math.max(1, end - nowMinutes);
    } else {
      remainingMinutes = activeBlock.duration;
    }
  }

  // Deadline info
  const daysUntilDeadline = matchingTask?.deadline ? getDaysUntilDeadline(matchingTask.deadline) : null;
  const deadlineText = matchingTask?.deadline ? formatDeadline(matchingTask.deadline) : null;

  const catKey = activeBlock?.category || (matchingTask ? matchingTask.category : 'academic');
  const catStyle = CATEGORY_CONFIG[catKey as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.academic;

  return (
    <div
      id="card-level-1-now"
      className="bg-white border-2 border-stone-900 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden transition-all"
    >
      {/* Subtle top indicator bar with category color */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-stone-900" />

      {activeBlock ? (
        <div>
          {/* Header Row: NOW badge + Time Range + Remaining Minutes */}
          <div className="flex items-center justify-between gap-3 flex-wrap mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-stone-900 text-amber-300 flex items-center gap-1.5 shadow-2xs">
                {isCurrentActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
                <span>{isCurrentActive ? 'NOW' : 'UP NEXT'}</span>
              </span>

              {/* Time Range */}
              <span className="text-xs sm:text-sm font-bold font-mono text-stone-600">
                {formatTimeRange(activeBlock.start, activeBlock.duration)}
              </span>
            </div>

            {/* Remaining time pill */}
            {remainingMinutes !== null && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-mono">
                {isCurrentActive ? `${remainingMinutes} min remaining` : `${formatMinutes(remainingMinutes)} block`}
              </span>
            )}
          </div>

          {/* Task Title (LEVEL 1 - Strongest Visual Emphasis) */}
          <div className="mt-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-950 flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl sm:text-3xl leading-none">{catStyle.emoji}</span>
              <span>{activeBlock.title}</span>
            </h2>

            {/* Subtitle / Context */}
            {activeBlock.subtitle && (
              <p className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed">
                {activeBlock.subtitle}
              </p>
            )}

            {/* Due date tag / intimidation hint */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {deadlineText && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    daysUntilDeadline !== null && daysUntilDeadline <= 2
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  <span>{deadlineText}</span>
                </span>
              )}

              {matchingTask?.starterAction && (
                <span className="text-[11px] font-medium text-stone-600 bg-amber-50/80 border border-amber-200/60 px-2 py-0.5 rounded-md">
                  💡 Starter: {matchingTask.starterAction}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons: [ Start ] [ What should I do? ] [ Mark Done ] */}
          <div className="mt-5 pt-4 border-t border-stone-100 flex flex-wrap items-center gap-2.5">
            {matchingTask && !matchingTask.completed && (
              <button
                id="btn-now-start-focus"
                onClick={() => onStartFocusSession(matchingTask)}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs sm:text-sm transition-all shadow-2xs flex items-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Start</span>
              </button>
            )}

            {matchingTask && (
              <button
                id="btn-now-toggle-done"
                onClick={() => onToggleTask(matchingTask.id)}
                className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-emerald-600 hover:text-white text-stone-700 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="Mark completed"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Done</span>
              </button>
            )}

            {/* Contextual "What should I do?" Button */}
            <button
              id="btn-now-what-should-i-do"
              onClick={onOpenWhatShouldIDo}
              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300/80 text-amber-950 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98] shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>What should I do?</span>
            </button>
          </div>
        </div>
      ) : (
        /* Empty / Open State */
        <div className="py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-stone-900 text-stone-300">
              NOW
            </span>
            <span className="text-xs text-stone-400 font-mono">Headspace open</span>
          </div>

          <h3 className="text-xl font-bold text-stone-900 mt-1">
            ✨ No active task scheduled right now
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            You’re either all caught up or between scheduled blocks. Choose your next move or take a restorative break.
          </p>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2.5">
            <button
              onClick={onOpenWhatShouldIDo}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>What should I do right now?</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
