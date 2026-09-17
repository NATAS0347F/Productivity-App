import React, { useState } from 'react';
import { Plus, CornerDownLeft, Sparkles, Tag } from 'lucide-react';
import { Task, TaskIntent, CategoryDefinition } from '../types';
import { parseNaturalLanguageTask } from '../utils/naturalLanguage';
import { DEFAULT_CATEGORIES } from '../utils/categories';

interface QuickAddTaskProps {
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt' | 'postponeCount'>) => void;
  onOpenFullForm?: () => void;
  categories?: CategoryDefinition[];
  onAddCategory?: (category: CategoryDefinition) => void;
  onOpenCategoryManager?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const QuickAddTask: React.FC<QuickAddTaskProps> = ({
  onAddTask,
  onOpenFullForm,
  categories = DEFAULT_CATEGORIES,
  onAddCategory,
  onOpenCategoryManager,
  placeholder = 'What do you need / want to do?',
  autoFocus = false,
}) => {
  const [rawInput, setRawInput] = useState('');
  const [manualIntent, setManualIntent] = useState<TaskIntent | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('🎯');
  const [newCatColor, setNewCatColor] = useState('#8B5CF6');

  const parsed = parseNaturalLanguageTask(rawInput);
  const activeIntent: TaskIntent = manualIntent || parsed.intent;
  const currentCatId = selectedCategory || parsed.category || categories[0]?.id || 'academic';

  const handleQuickAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const id = 'cat_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const newCat: CategoryDefinition = {
      id,
      name: newCatName.trim(),
      emoji: newCatEmoji || '🎯',
      color: newCatColor || '#8B5CF6',
      isCustom: true,
    };
    if (onAddCategory) onAddCategory(newCat);
    setSelectedCategory(id);
    setIsCreatingCat(false);
    setNewCatName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawInput.trim()) return;

    onAddTask({
      name: parsed.name || rawInput.trim(),
      type: activeIntent === 'someday' ? 'idea' : 'task',
      intent: activeIntent,
      category: currentCatId,
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
    setSelectedCategory(null);
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

        {/* Inline Quick Category Creator */}
        {isCreatingCat && (
          <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2 animate-in fade-in duration-150">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Quick Add Category
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newCatEmoji}
                onChange={(e) => setNewCatEmoji(e.target.value.slice(-2))}
                className="w-7 h-7 text-center text-xs bg-white border border-stone-300 rounded-lg shrink-0"
                title="Emoji"
              />
              <input
                type="text"
                placeholder="Category name..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 px-2 py-1 text-xs bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-medium"
              />
              <input
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                className="w-7 h-7 rounded-lg cursor-pointer border border-stone-300 p-0 shrink-0"
                title="Color"
              />
            </div>
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setIsCreatingCat(false)}
                className="px-2 py-0.5 text-[11px] text-stone-500 hover:text-stone-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleQuickAddCat}
                disabled={!newCatName.trim()}
                className="px-2.5 py-0.5 text-[11px] font-bold bg-stone-900 text-white rounded-lg hover:bg-stone-800 disabled:opacity-50"
              >
                Add & Pick
              </button>
            </div>
          </div>
        )}

        {/* Category picker & Intent row */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Category select pill */}
            <div className="flex items-center gap-1 bg-stone-100/90 rounded-lg px-2 py-0.5 border border-stone-200/60 text-xs">
              <span className="text-[10px] text-stone-400 font-bold uppercase">Cat:</span>
              <select
                value={currentCatId}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    setIsCreatingCat(true);
                  } else if (e.target.value === '__manage__' && onOpenCategoryManager) {
                    onOpenCategoryManager();
                  } else {
                    setSelectedCategory(e.target.value);
                  }
                }}
                className="bg-transparent text-xs font-bold text-stone-700 cursor-pointer focus:outline-hidden pr-1"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.name}
                  </option>
                ))}
                {!categories.some((c) => c.id === currentCatId) && currentCatId && (
                  <option value={currentCatId}>🏷️ {currentCatId}</option>
                )}
                <option disabled>──────</option>
                <option value="__new__">➕ + New Category...</option>
                {onOpenCategoryManager && (
                  <option value="__manage__">⚙️ Manage...</option>
                )}
              </select>
              <button
                type="button"
                onClick={() => setIsCreatingCat((prev) => !prev)}
                className="text-stone-400 hover:text-amber-700 font-bold text-xs"
                title="Add new category"
              >
                +
              </button>
            </div>

            {/* Intent distinction: Need to do / Want to do / Maybe someday */}
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
                📌 Need
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
                🌱 Want
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
                💭 Someday
              </button>
            </div>
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
