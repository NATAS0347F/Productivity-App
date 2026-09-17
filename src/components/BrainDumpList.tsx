import React, { useState } from 'react';
import {
  Check,
  X,
  Edit3,
  Repeat,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Hourglass,
  Clock,
  Zap,
  SplitSquareVertical,
} from 'lucide-react';
import { Task, ItemType } from '../types';
import { formatMinutes, formatDeadline } from '../utils/scheduler';
import { CATEGORY_CONFIG, ITEM_TYPE_CONFIG } from '../utils/categories';
import { generateTaskBreakdown } from '../utils/breakdown';

interface BrainDumpListProps {
  tasks: Task[];
  onToggleTask: (id: number) => void;
  onRemoveTask: (id: number) => void;
  onEditTask: (task: Task) => void;
  onPostponeTask: (id: number) => void;
  onBreakdownTask: (id: number) => void;
  onClearCompleted?: () => void;
}

export const BrainDumpList: React.FC<BrainDumpListProps> = ({
  tasks,
  onToggleTask,
  onRemoveTask,
  onEditTask,
  onPostponeTask,
  onBreakdownTask,
  onClearCompleted,
}) => {
  const [selectedType, setSelectedType] = useState<ItemType | 'all' | 'recurring'>('all');
  const [showCompleted, setShowCompleted] = useState(false);

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const filteredTasks = activeTasks.filter((t) => {
    if (selectedType === 'all') return true;
    if (selectedType === 'recurring') return t.recurrence && t.recurrence !== 'none';
    return t.type === selectedType;
  });

  const counts = {
    all: activeTasks.length,
    task: activeTasks.filter((t) => t.type === 'task').length,
    goal: activeTasks.filter((t) => t.type === 'goal').length,
    project: activeTasks.filter((t) => t.type === 'project').length,
    idea: activeTasks.filter((t) => t.type === 'idea').length,
    recurring: activeTasks.filter((t) => t.recurrence && t.recurrence !== 'none').length,
  };

  return (
    <div id="card-brain-dump" className="bg-white/95 backdrop-blur-xs border border-stone-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-3.5">
        <h2 id="heading-brain-dump" className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
          <span>Brain dump & backlog</span>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
            {activeTasks.length}
          </span>
        </h2>

        <span className="text-xs font-semibold text-stone-500">
          {activeTasks.reduce((sum, t) => sum + t.duration, 0)} min total load
        </span>
      </div>

      {/* Filter Tabs by Item Type */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3 scrollbar-none border-b border-[#f0ede6]">
        {[
          { id: 'all', label: 'All', count: counts.all },
          { id: 'task', label: 'Tasks', count: counts.task },
          { id: 'goal', label: 'Goals', count: counts.goal },
          { id: 'project', label: 'Projects', count: counts.project },
          { id: 'idea', label: 'Ideas', count: counts.idea },
          { id: 'recurring', label: 'Recurring', count: counts.recurring },
        ].map((tab) => {
          const active = selectedType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id as any)}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                active
                  ? 'bg-[#242424] text-white'
                  : 'text-[#666] hover:text-[#222] hover:bg-[#f4f2ee]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  active ? 'bg-white/20 text-white' : 'bg-[#eae7e0] text-[#777]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 px-4 border border-dashed border-[#ddd9d2] rounded-xl text-[#777] bg-[#faf9f7]">
          <p className="text-xs sm:text-sm font-medium mb-1.5">
            {selectedType === 'all'
              ? 'Your brain dump is completely clear.'
              : `No items found in "${selectedType}".`}
          </p>
          <p className="text-xs text-[#999]">
            Add your thoughts, tasks, or long-term goals anytime using the form below.
          </p>
        </div>
      ) : (
        <div id="taskList" className="flex flex-col gap-2.5">
          {filteredTasks.map((task) => {
            const cat = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.admin;
            const deadlineText = formatDeadline(task.deadline);
            const isDueSoon =
              task.deadline &&
              (() => {
                const diff =
                  (new Date(task.deadline + 'T23:59:59').getTime() -
                    new Date().getTime()) /
                  (1000 * 60 * 60 * 24);
                return diff <= 1;
              })();

            const isPostponedHeavy = task.postponeCount >= 2;

            return (
              <div
                key={task.id}
                id={`task-item-${task.id}`}
                className={`border rounded-xl p-3 bg-white transition-all shadow-2xs hover:border-[#cfcac1] ${
                  isPostponedHeavy
                    ? 'border-[#e4dcf2] bg-[#fcfbfe]'
                    : 'border-[#e8e5df]'
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="min-w-0 flex-1">
                    {/* Header tags: Type + Category */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          ITEM_TYPE_CONFIG[task.type || 'task'].badgeClass
                        }`}
                      >
                        {ITEM_TYPE_CONFIG[task.type || 'task'].tag}
                      </span>

                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full border ${cat.badgeBg} ${cat.badgeBorder} ${cat.badgeText} font-medium flex items-center gap-1`}
                      >
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </span>

                      {task.recurrence && task.recurrence !== 'none' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#f4f1ea] text-[#635d50] border border-[#e5e0d4] flex items-center gap-0.5 font-medium">
                          <Repeat className="w-2.5 h-2.5" />
                          <span className="capitalize">{task.recurrence}</span>
                        </span>
                      )}
                    </div>

                    {/* Task Title */}
                    <div className="font-semibold text-xs sm:text-sm text-[#242424] break-words">
                      {task.name}
                    </div>

                    {/* Meta info: duration, energy, priority, deadline */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2 text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-[#f0eeea] text-[#555] text-[11px]">
                        {formatMinutes(task.duration)}
                      </span>

                      <span className="px-2 py-0.5 rounded-md bg-[#f0eeea] text-[#555] text-[11px]">
                        {task.energy} energy
                      </span>

                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[11px] font-medium ${
                          task.priority >= 3
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-[#f0eeea] text-[#555]'
                        }`}
                      >
                        P{task.priority}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] border ${
                          isDueSoon
                            ? 'bg-red-50 text-red-700 border-red-200 font-semibold'
                            : 'bg-[#faf9f6] text-[#777] border-[#e8e5df]'
                        }`}
                      >
                        {deadlineText}
                      </span>
                    </div>

                    {/* Procrastination alert & breakdown helper if postponed */}
                    {isPostponedHeavy && (
                      <div className="mt-2.5 pt-2 border-t border-[#ede8f5] flex items-center justify-between gap-2 flex-wrap text-xs">
                        <span className="text-[#644f88] font-medium flex items-center gap-1">
                          <Hourglass className="w-3 h-3 text-[#7962a2]" />
                          <span>Postponed {task.postponeCount} times</span>
                        </span>

                        <button
                          onClick={() => onBreakdownTask(task.id)}
                          className="text-[11px] font-semibold text-[#57427d] bg-[#f2ecfa] hover:bg-[#e9e0f5] border border-[#dcd0ee] px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-[#7a62a3]" />
                          <span>Break into 15m starter</span>
                        </button>
                      </div>
                    )}

                    {/* Display Subtasks if already broken down */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="mt-2.5 p-2 rounded-lg bg-[#faf9f7] border border-[#ede9e2] space-y-1">
                        <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider block mb-1">
                          Starter Actions:
                        </span>
                        {task.subtasks.map((st) => (
                          <div
                            key={st.id}
                            className="flex items-center justify-between text-xs text-[#555]"
                          >
                            <span className="truncate mr-2">• {st.name}</span>
                            <span className="text-[11px] text-[#888] shrink-0">
                              {st.duration}m
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-col sm:flex-row items-center gap-1 shrink-0">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      title="Mark as complete"
                      className="p-1.5 rounded-lg bg-[#efede9] hover:bg-[#242424] text-[#333] hover:text-white transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onEditTask(task)}
                      title="Edit this task"
                      className="p-1.5 rounded-lg text-[#666] hover:bg-[#f0ede6] hover:text-[#111] transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onPostponeTask(task.id)}
                      title="Postpone for later (record pattern)"
                      className="p-1.5 rounded-lg text-[#857161] hover:bg-[#f5f1eb] transition-colors cursor-pointer"
                    >
                      <Hourglass className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onRemoveTask(task.id)}
                      title="Delete item"
                      className="p-1.5 rounded-lg text-[#a33] hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed Section */}
      {completedTasks.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-[#eeebe5]">
          <button
            type="button"
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center justify-between w-full text-xs font-medium text-[#777] hover:text-[#242424] transition-colors py-1 cursor-pointer"
          >
            <span>Completed archive ({completedTasks.length})</span>
            {showCompleted ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showCompleted && (
            <div className="mt-2 space-y-1.5">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#faf9f7] border border-[#ece9e3] text-xs text-[#888]"
                >
                  <span className="line-through truncate mr-2">{task.name}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="text-[#666] hover:text-[#222] px-1.5 py-0.5 rounded border border-[#ddd] bg-white text-[11px] cursor-pointer"
                    >
                      Undo
                    </button>
                    <button
                      onClick={() => onRemoveTask(task.id)}
                      className="text-[#a33] hover:text-red-700 p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {onClearCompleted && (
                <div className="pt-2 text-right">
                  <button
                    onClick={onClearCompleted}
                    className="text-[11px] text-[#a33] hover:underline cursor-pointer"
                  >
                    Clear all completed
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
