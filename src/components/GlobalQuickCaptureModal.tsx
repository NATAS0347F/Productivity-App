import React, { useState, useEffect, useRef } from 'react';
import { X, CornerDownLeft, Plus, Calendar, Clock, Sparkles, Tag } from 'lucide-react';
import { Task, TaskIntent, CategoryDefinition } from '../types';
import { parseNaturalLanguageTask } from '../utils/naturalLanguage';
import { DEFAULT_CATEGORIES } from '../utils/categories';

interface GlobalQuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt' | 'postponeCount'>) => void;
  onOpenFullForm?: () => void;
  categories?: CategoryDefinition[];
  onAddCategory?: (category: CategoryDefinition) => void;
}

export const GlobalQuickCaptureModal: React.FC<GlobalQuickCaptureModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  onOpenFullForm,
  categories = DEFAULT_CATEGORIES,
  onAddCategory,
}) => {
  const [rawText, setRawText] = useState('');
  const [manualIntent, setManualIntent] = useState<TaskIntent | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('🎯');
  const [newCatColor, setNewCatColor] = useState('#8B5CF6');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setRawText('');
      setManualIntent(null);
      setSelectedCategory(null);
      setIsCreatingCat(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const parsed = parseNaturalLanguageTask(rawText);
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
    if (!rawText.trim()) return;

    onAddTask({
      name: parsed.name || rawText.trim(),
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

    setRawText('');
    setManualIntent(null);
    setSelectedCategory(null);
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
              className="w-full text-base sm:text-lg font-medium px-4 py-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:bg-white focus:border-stone-900 transition-all pr-12"
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

          {/* Inline Quick Category Creator */}
          {isCreatingCat && (
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-2 animate-in fade-in duration-150">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                Quick Add Category
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCatEmoji}
                  onChange={(e) => setNewCatEmoji(e.target.value.slice(-2))}
                  className="w-8 h-8 text-center text-sm bg-white border border-stone-300 rounded-xl shrink-0"
                  title="Emoji"
                />
                <input
                  type="text"
                  placeholder="Category name..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-medium"
                />
                <input
                  type="color"
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  className="w-8 h-8 rounded-xl cursor-pointer border border-stone-300 p-0 shrink-0"
                  title="Color"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingCat(false)}
                  className="px-2.5 py-1 text-xs text-stone-500 hover:text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleQuickAddCat}
                  disabled={!newCatName.trim()}
                  className="px-3 py-1 text-xs font-bold bg-stone-900 text-white rounded-xl hover:bg-stone-800 disabled:opacity-50"
                >
                  Add & Select
                </button>
              </div>
            </div>
          )}

          {/* Category Picker & Intent distinction selector */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {/* Category selector pill */}
              <div className="flex items-center gap-1.5 bg-stone-100 rounded-xl px-2.5 py-1 border border-stone-200/70 text-xs">
                <span className="text-[10px] text-stone-400 font-bold uppercase">Category:</span>
                <select
                  value={currentCatId}
                  onChange={(e) => {
                    if (e.target.value === '__new__') {
                      setIsCreatingCat(true);
                    } else {
                      setSelectedCategory(e.target.value);
                    }
                  }}
                  className="bg-transparent text-xs font-bold text-stone-800 cursor-pointer focus:outline-hidden"
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
                  <option value="__new__">➕ + Add New Category...</option>
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

            {/* Intent buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
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
          </div>
        </form>
      </div>
    </div>
  );
};
