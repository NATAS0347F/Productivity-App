import React from 'react';
import { Eye, Sparkles, Play, ArrowRight, Hourglass } from 'lucide-react';
import { Task } from '../types';
import { CATEGORY_CONFIG } from '../utils/categories';
import { generateTaskBreakdown } from '../utils/breakdown';

interface AvoidingThisCardProps {
  tasks: Task[];
  onStartFocusSession: (task: Task, starterMinutes?: number) => void;
  onBreakdownTask: (id: number) => void;
}

export const AvoidingThisCard: React.FC<AvoidingThisCardProps> = ({
  tasks,
  onStartFocusSession,
  onBreakdownTask,
}) => {
  // Find task with highest postpone count (at least 2)
  const avoidedTasks = tasks
    .filter((t) => !t.completed && t.postponeCount >= 2 && t.type === 'task')
    .sort((a, b) => b.postponeCount - a.postponeCount);

  if (avoidedTasks.length === 0) return null;

  const task = avoidedTasks[0];
  const cat = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.academic;

  // Generate tiny starting action
  const subtasks = task.subtasks && task.subtasks.length > 0 ? task.subtasks : generateTaskBreakdown(task);
  const firstSubtask = subtasks[0] || {
    name: `Open ${task.name} and review notes for 10 minutes`,
    duration: 10,
  };

  const handleMakeItSmaller = () => {
    onBreakdownTask(task.id);
    onStartFocusSession(task, Math.min(15, firstSubtask.duration || 10));
  };

  return (
    <div
      id="card-avoiding-this"
      className="bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent border border-purple-200/80 rounded-3xl p-5 shadow-xs relative overflow-hidden"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">👀</span>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-900">
            You’ve been avoiding this
          </span>
        </div>
        <span className="text-[11px] font-bold text-purple-800 bg-purple-100/70 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Hourglass className="w-3 h-3 text-purple-600" />
          <span>Postponed {task.postponeCount} times</span>
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <h4 className="text-base font-extrabold text-stone-900">
          {cat.emoji} {task.name}
        </h4>
      </div>

      <p className="text-xs text-stone-600 leading-relaxed mb-3">
        No guilt or shame here. Big tasks trigger natural resistance. Don’t do the whole thing—just take this 10-minute micro step:
      </p>

      {/* Tiny starting action prompt */}
      <div className="p-3 rounded-2xl bg-white/90 border border-purple-200/60 mb-3 shadow-2xs">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-900 mb-0.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Tiny starter step:</span>
        </div>
        <div className="text-xs font-semibold text-stone-800">
          ⏱️ {firstSubtask.duration} min — {firstSubtask.name}
        </div>
      </div>

      {/* Action Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleMakeItSmaller}
          className="flex-1 py-2.5 px-4 rounded-2xl bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Make it smaller & start 10 min →</span>
        </button>
      </div>
    </div>
  );
};
