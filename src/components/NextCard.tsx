import React from 'react';
import { Clock, Play } from 'lucide-react';
import { ScheduleResult, Task, ScheduleBlock } from '../types';
import { CATEGORY_CONFIG } from '../utils/categories';
import { formatTimeRange, formatMinutes } from '../utils/scheduler';

interface NextCardProps {
  scheduleResult: ScheduleResult | null;
  tasks: Task[];
  onStartFocusSession?: (task: Task) => void;
}

export const NextCard: React.FC<NextCardProps> = ({
  scheduleResult,
  tasks,
  onStartFocusSession,
}) => {
  const schedule = scheduleResult?.schedule || [];
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  // Determine current active index or block
  let activeIndex = -1;
  for (let i = 0; i < schedule.length; i++) {
    const block = schedule[i];
    if (nowMinutes >= block.start && nowMinutes < block.start + block.duration) {
      activeIndex = i;
      break;
    }
  }

  // Next block is either activeIndex + 1, or first block starting after nowMinutes
  let nextBlock: ScheduleBlock | null = null;
  if (activeIndex >= 0 && activeIndex + 1 < schedule.length) {
    nextBlock = schedule[activeIndex + 1];
  } else {
    nextBlock = schedule.find((s) => s.start > nowMinutes) || null;
  }

  const matchingTask = nextBlock?.taskId
    ? tasks.find((t) => t.id === nextBlock?.taskId)
    : nextBlock?.originalTask;

  const catKey = nextBlock?.category || (matchingTask ? matchingTask.category : 'admin');
  const catStyle = CATEGORY_CONFIG[catKey as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.admin;

  return (
    <div
      id="card-level-3-next"
      className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-black uppercase tracking-wider text-stone-400">
          NEXT
        </span>
        {nextBlock && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono">
            {formatMinutes(nextBlock.duration)}
          </span>
        )}
      </div>

      {nextBlock ? (
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-1.5">
                <span>{catStyle.emoji}</span>
                <span>{nextBlock.title}</span>
              </h4>

              <div className="flex items-center gap-2 mt-1 text-xs text-stone-500 font-mono">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>{formatTimeRange(nextBlock.start, nextBlock.duration)}</span>
              </div>
            </div>

            {matchingTask && onStartFocusSession && !matchingTask.completed && (
              <button
                onClick={() => onStartFocusSession(matchingTask)}
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-700 transition-colors cursor-pointer shrink-0"
                title="Start this task early"
              >
                <Play className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {nextBlock.subtitle && (
            <p className="text-xs text-stone-500 mt-2 line-clamp-2">
              {nextBlock.subtitle}
            </p>
          )}
        </div>
      ) : (
        <div className="py-2 text-stone-500">
          <h4 className="text-sm font-bold text-stone-800">No upcoming blocks</h4>
          <p className="text-xs text-stone-400 mt-0.5">
            Your schedule for today is complete or clear.
          </p>
        </div>
      )}
    </div>
  );
};
