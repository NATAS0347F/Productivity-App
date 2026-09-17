import React, { useState, useEffect } from 'react';
import {
  Check,
  Coffee,
  AlertCircle,
  Play,
  Clock,
  Sparkles,
  Utensils,
  Sun,
} from 'lucide-react';
import { ScheduleResult, Task, BlockType, ScheduleBlock } from '../types';
import { formatMinutes, minutesTo12Hour, formatTimeRange } from '../utils/scheduler';
import { CATEGORY_CONFIG } from '../utils/categories';

interface TimelinePlanProps {
  scheduleResult: ScheduleResult;
  onToggleTask: (id: number) => void;
  onBreakdownTask?: (id: number) => void;
  onStartFocusSession?: (task: Task) => void;
}

export const TimelinePlan: React.FC<TimelinePlanProps> = ({
  scheduleResult,
  onToggleTask,
  onStartFocusSession,
}) => {
  const {
    schedule,
    totalWorkMinutes,
    totalBreakMinutes,
    totalFreeMinutes,
    isOverloaded,
  } = scheduleResult;

  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const nowMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();
  const nowTimeString = currentDate.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div
      id="card-level-2-timeline"
      className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs relative"
    >
      {/* Header bar: Title + Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-stone-200/80">
        <div>
          <h3
            id="heading-today-timeline"
            className="text-base sm:text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2"
          >
            <span>TODAY'S TIMELINE</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono">
              {schedule.filter((s) => s.type === 'work').length} tasks
            </span>
          </h3>
        </div>

        {/* Focus & Rest metrics */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-stone-700 font-semibold">
            {formatMinutes(totalWorkMinutes)} focus
          </span>
          <span className="text-stone-300">•</span>
          <span className="text-stone-500">
            {formatMinutes(totalBreakMinutes)} rest
          </span>
          {totalFreeMinutes > 0 && (
            <>
              <span className="text-stone-300">•</span>
              <span className="text-stone-500">
                {formatMinutes(totalFreeMinutes)} free
              </span>
            </>
          )}
        </div>
      </div>

      {/* Overload Alert if daylight is exceeded */}
      {isOverloaded && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-amber-900">
            <span className="font-bold">Overload prevention active: </span>
            <span>Excess tasks are in Backlog so you don’t burn out.</span>
          </div>
        </div>
      )}

      {/* Schedule Timeline List */}
      {schedule.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-stone-200 rounded-xl text-stone-400 bg-stone-50/50">
          <p className="text-sm font-semibold text-stone-600 mb-1">Timeline is clear</p>
          <p className="text-xs">Add tasks to your brain dump to generate your timetable.</p>
        </div>
      ) : (
        <div id="scheduleTimeline" className="divide-y divide-stone-100">
          {schedule.map((block, idx) => {
            const isWork = block.type === 'work';
            const isBreak = block.type === 'break';
            const isMeal = block.type === 'meal';
            const isFree = block.type === 'free';
            const isBuffer = block.type === 'buffer';

            const catKey = (block.category ||
              (isBreak ? 'break' : isMeal ? 'meal' : isFree || isBuffer ? 'free' : 'admin')) as keyof typeof CATEGORY_CONFIG;
            const style = CATEGORY_CONFIG[catKey] || CATEGORY_CONFIG.admin;

            const blockStart = block.start;
            const blockEnd = block.start + block.duration;
            const isCurrentActive = nowMinutes >= blockStart && nowMinutes < blockEnd;

            // Check if NOW line should appear before this block
            const prevBlock = idx > 0 ? schedule[idx - 1] : null;
            const showNowLineBefore =
              prevBlock &&
              nowMinutes >= prevBlock.start + prevBlock.duration &&
              nowMinutes < blockStart;

            return (
              <React.Fragment key={block.id}>
                {/* Visual NOW Line divider */}
                {showNowLineBefore && (
                  <div className="py-2.5 flex items-center gap-3">
                    <div className="flex-1 h-0.5 bg-amber-400" />
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-900 text-amber-300 font-bold text-[11px] font-mono shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      <span>{nowTimeString} · NOW</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-amber-400" />
                  </div>
                )}

                {/* Scannable Row */}
                <div
                  id={`timeline-row-${block.id}`}
                  className={`py-3.5 px-2 sm:px-3 rounded-xl transition-colors flex items-start sm:items-center justify-between gap-3 group ${
                    isCurrentActive
                      ? 'bg-amber-50/70 border border-amber-300/80'
                      : 'hover:bg-stone-50/80'
                  }`}
                >
                  {/* Left: Time + Category Icon + Title */}
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    {/* Time Column (Medium font, highly legible) */}
                    <div className="w-20 sm:w-24 shrink-0 text-left">
                      <div className="text-xs sm:text-sm font-bold font-mono text-stone-900 leading-tight">
                        {minutesTo12Hour(block.start)}
                      </div>
                      <div className="text-[11px] text-stone-400 font-mono">
                        {formatMinutes(block.duration)}
                      </div>
                    </div>

                    {/* Emoji + Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base sm:text-lg leading-none shrink-0">
                          {style.emoji}
                        </span>

                        <span
                          className={`text-sm sm:text-base font-bold leading-snug ${
                            block.originalTask?.completed
                              ? 'line-through text-stone-400'
                              : isCurrentActive
                              ? 'text-stone-950 font-extrabold'
                              : isWork
                              ? 'text-stone-900'
                              : 'text-stone-600'
                          }`}
                        >
                          {block.title}
                        </span>

                        {isCurrentActive && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-stone-900 text-amber-300 font-mono tracking-wider">
                            ACTIVE
                          </span>
                        )}
                      </div>

                      {block.subtitle && !block.originalTask?.completed && (
                        <p className="text-xs text-stone-400 mt-0.5 truncate max-w-md">
                          {block.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons for work tasks */}
                  {isWork && block.taskId && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {onStartFocusSession && block.originalTask && !block.originalTask.completed && (
                        <button
                          onClick={() => onStartFocusSession(block.originalTask!)}
                          className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          title="Start focus timer"
                        >
                          <Play className="w-3 h-3" />
                          <span className="hidden sm:inline">Focus</span>
                        </button>
                      )}

                      <button
                        onClick={() => onToggleTask(block.taskId!)}
                        className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                          block.originalTask?.completed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 hover:bg-emerald-600 hover:text-white text-stone-700'
                        }`}
                        title={block.originalTask?.completed ? 'Completed' : 'Mark done'}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          {block.originalTask?.completed ? 'Done' : 'Done'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};
