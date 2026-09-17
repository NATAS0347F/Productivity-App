import React, { useState } from 'react';
import {
  Eye,
  Scissors,
  Play,
  Sparkles,
  ArrowRight,
  Clock,
  Zap,
  Check,
} from 'lucide-react';
import { Task } from '../types';
import { generateTaskBreakdown } from '../utils/breakdown';
import { CATEGORY_CONFIG } from '../utils/categories';
import { formatMinutes } from '../utils/scheduler';

interface AvoidingThisSectionProps {
  tasks: Task[];
  onStartFocusSession: (task: Task) => void;
  onAddStarterAction: (originalTask: Task, starterActionTitle: string, duration: number) => void;
}

export const AvoidingThisSection: React.FC<AvoidingThisSectionProps> = ({
  tasks,
  onStartFocusSession,
  onAddStarterAction,
}) => {
  // Find incomplete tasks postponed at least 2 times
  const avoidedTasks = tasks.filter(
    (t) => !t.completed && t.type === 'task' && (t.postponeCount || 0) >= 2
  );

  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);

  if (avoidedTasks.length === 0) return null;

  return (
    <div
      id="section-avoiding-tasks"
      className="bg-linear-to-br from-[#fef8f6] to-[#fff4f0] border border-[#fbdad2] rounded-3xl p-5 shadow-xs"
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#fbdad2]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700">
            <Eye className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#3d1912] flex items-center gap-1.5">
              <span>You've been avoiding this</span>
              <span className="text-xs font-bold text-rose-700 bg-white/80 px-2 py-0.5 rounded-full border border-rose-200">
                {avoidedTasks.length}
              </span>
            </h2>
            <p className="text-xs text-[#8c5a50]">
              Resistance is normal. Let's make the first step so small it feels effortless.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {avoidedTasks.map((task) => {
          const breakdown = generateTaskBreakdown(task);
          const firstSubtask = breakdown[0];
          const isExpanded = expandedTaskId === task.id;
          const cat = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.admin;

          const starterText =
            task.starterAction ||
            (firstSubtask
              ? `${firstSubtask.duration} min — ${firstSubtask.name}`
              : `10 minutes — Open ${task.name} and review requirements`);

          return (
            <div
              key={task.id}
              className="p-4 rounded-2xl bg-white border border-[#f8d0c7] shadow-2xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{cat.emoji}</span>
                    <h4 className="text-sm font-bold text-[#291c19]">{task.name}</h4>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      Postponed {task.postponeCount} times
                    </span>
                  </div>
                  <p className="text-xs text-[#7d5e56] mt-0.5">
                    Original estimate: {formatMinutes(task.duration)} · Priority P{task.priority}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e5d5cf] bg-[#faf6f5] hover:bg-[#f3ece9] text-xs font-bold text-[#442b25] transition-all cursor-pointer"
                  >
                    <Scissors className="w-3.5 h-3.5 text-rose-600" />
                    <span>{isExpanded ? 'Hide starter' : 'Make it smaller'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onStartFocusSession(task)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#242424] hover:bg-[#111] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Start {formatMinutes(Math.min(15, task.duration))}</span>
                  </button>
                </div>
              </div>

              {/* Starter Action Reveal */}
              {isExpanded && (
                <div className="p-3 rounded-xl bg-[#fdf9f7] border border-[#f2ded8] space-y-2 animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#633a30]">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    <span>Micro-Action to Break Friction:</span>
                  </div>
                  <p className="text-xs text-[#442c27] font-medium pl-5">
                    "{starterText}"
                  </p>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onAddStarterAction(task, starterText, 10);
                        setExpandedTaskId(null);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Add 10-min version to Today</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
