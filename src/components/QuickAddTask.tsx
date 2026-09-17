import React, { useState } from 'react';
import { Plus, CornerDownLeft, Sparkles } from 'lucide-react';
import { Task, TaskIntent } from '../types';
import { parseNaturalLanguageTask } from '../utils/naturalLanguage';

interface QuickAddTaskProps {
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt' | 'postponeCount'>) => void;
  onOpenFullForm?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const QuickAddTask: React.FC<QuickAddTaskProps> = ({
  onAddTask,
  onOpenFullForm,
  placeholder = 'What do you need / want to do?',
  autoFocus = false,
}) => {
  const [rawInput, setRawInput] = useState('');
  const [manualIntent, setManualIntent] = useState<TaskIntent | null>(null);

  const parsed = parseNaturalLanguageTask(rawInput);
  const activeIntent: TaskIntent = manualIntent || parsed.intent;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawInput.trim()) return;

    onAddTask({
      name: parsed.name || rawInput.trim(),
      type: activeIntent === 'someday' ? 'idea' : 'task',
      intent: activeIntent,
      category: parsed.category || 'academic',
      duration: parsed.duration,
      energy: 'medium',
      priority: activeIntent === 'need' ? 3 : 2,
      deadline: parsed.deadline,
      scheduledDate: parsed.scheduledDate,
      recurrence: parsed.recurrence,
      customDays: parsed.customDays,
    });

    setRawInput('');
    setManualIntent(null);
  };

  return (
    <div
      id="card-quick-add-task"
      className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs"
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-stone-400">
            QUICK ADD
          </span>
          <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
            Press 'N'
          </span>
        </div>

        {onOpenFullForm && (
          <button
            type="button"
            onClick={onOpenFullForm}
            className="text-[11px] font-semibold text-stone-500 hover:text-stone-900 cursor-pointer"
          >
            + More options
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5">
        {/* The single clean input field */}
        <div className="relative">
          <input
            type="text"
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200/90 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition-all pr-9 font-medium"
          />

          <button
            type="submit"
            disabled={!rawInput.trim()}
            className="absolute right-2 top-2 p-1.5 rounded-lg bg-stone-900 hover:bg-black disabled:opacity-20 text-white transition-all cursor-pointer"
            title="Press Enter to add task"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Intent distinction: Need to do / Want to do / Maybe someday */}
        <div className="flex items-center justify-between gap-1 flex-wrap pt-0.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setManualIntent('need')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer transition-all ${
                activeIntent === 'need'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200/80 shadow-2xs'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              📌 Need to do
            </button>

            <button
              type="button"
              onClick={() => setManualIntent('want')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer transition-all ${
                activeIntent === 'want'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/80 shadow-2xs'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              🌱 Want to do
            </button>

            <button
              type="button"
              onClick={() => setManualIntent('someday')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer transition-all ${
                activeIntent === 'someday'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200/80 shadow-2xs'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              💭 Maybe someday
            </button>
          </div>

          {/* Natural language detected chips */}
          {rawInput.trim() && (
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-stone-500">
              {parsed.tokens.durationStr && (
                <span className="px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200/70">
                  ⏱️ {parsed.tokens.durationStr}
                </span>
              )}
              {parsed.tokens.deadlineStr && (
                <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/70">
                  📅 {parsed.tokens.deadlineStr}
                </span>
              )}
              {parsed.tokens.recurrenceStr && (
                <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200/70">
                  🔁 {parsed.tokens.recurrenceStr}
                </span>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
