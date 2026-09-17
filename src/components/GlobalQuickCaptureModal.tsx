import React, { useState, useEffect, useRef } from 'react';
import { X, CornerDownLeft, Plus, Calendar, Clock, Sparkles } from 'lucide-react';
import { Task, TaskIntent } from '../types';
import { parseNaturalLanguageTask } from '../utils/naturalLanguage';

interface GlobalQuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt' | 'postponeCount'>) => void;
  onOpenFullForm?: () => void;
}

export const GlobalQuickCaptureModal: React.FC<GlobalQuickCaptureModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  onOpenFullForm,
}) => {
  const [rawText, setRawText] = useState('');
  const [manualIntent, setManualIntent] = useState<TaskIntent | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setRawText('');
      setManualIntent(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const parsed = parseNaturalLanguageTask(rawText);
  const activeIntent: TaskIntent = manualIntent || parsed.intent;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    onAddTask({
      name: parsed.name || rawText.trim(),
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

    onClose();
  };

  return (
    <div
      id="modal-quick-capture-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-28 px-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="modal-quick-capture-card"
        className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-xl w-full p-5 sm:p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
              Quick Capture
            </h3>
            <span className="text-[11px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
              Esc to close
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Main prompt input */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="What do you need / want to do? (e.g. Psychology slides due Sunday)"
              className="w-full text-base sm:text-lg font-medium px-4 py-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-stone-900 transition-all pr-12"
            />

            <button
              type="submit"
              disabled={!rawText.trim()}
              className="absolute right-2.5 top-2.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-black disabled:opacity-20 text-white font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Add</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Natural Language Insights (Live Parser) */}
          {rawText.trim() && (
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs flex items-center justify-between flex-wrap gap-2 animate-in fade-in">
              <span className="text-stone-500 font-medium">Flow understands:</span>
              <div className="flex items-center gap-2 flex-wrap text-stone-700 font-mono text-[11px]">
                {parsed.tokens.durationStr && (
                  <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200">
                    ⏱️ {parsed.tokens.durationStr}
                  </span>
                )}
                {parsed.tokens.deadlineStr && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                    📅 {parsed.tokens.deadlineStr}
                  </span>
                )}
                {parsed.tokens.recurrenceStr && (
                  <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-900 border border-teal-200">
                    🔁 {parsed.tokens.recurrenceStr}
                  </span>
                )}
                {parsed.category && (
                  <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200 capitalize">
                    📁 {parsed.category}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Intent distinction selector (Requirement #8) */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setManualIntent('need')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  activeIntent === 'need'
                    ? 'bg-rose-100 text-rose-900 border border-rose-200/90 shadow-2xs'
                    : 'bg-stone-50 text-stone-500 hover:text-stone-800'
                }`}
              >
                📌 Need to do
              </button>

              <button
                type="button"
                onClick={() => setManualIntent('want')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  activeIntent === 'want'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-200/90 shadow-2xs'
                    : 'bg-stone-50 text-stone-500 hover:text-stone-800'
                }`}
              >
                🌱 Want to do
              </button>

              <button
                type="button"
                onClick={() => setManualIntent('someday')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  activeIntent === 'someday'
                    ? 'bg-amber-100 text-amber-900 border border-amber-200/90 shadow-2xs'
                    : 'bg-stone-50 text-stone-500 hover:text-stone-800'
                }`}
              >
                💭 Maybe someday
              </button>
            </div>

            {onOpenFullForm && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullForm();
                }}
                className="text-xs font-semibold text-stone-400 hover:text-stone-800 underline underline-offset-2 cursor-pointer"
              >
                Customize everything...
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
