import React, { useState, useEffect } from 'react';
import { X, Target, Trash2, Plus, Check, Clock, Calendar, AlertCircle } from 'lucide-react';
import { BigPictureGoal, CategoryType, CategoryDefinition } from '../types';
import { CATEGORY_CONFIG } from '../utils/categories';

interface EditGoalModalProps {
  isOpen: boolean;
  goal: BigPictureGoal | null;
  onClose: () => void;
  onSave: (updated: BigPictureGoal) => void;
  onDelete: (id: string) => void;
  categories?: CategoryDefinition[];
}

export const EditGoalModal: React.FC<EditGoalModalProps> = ({
  isOpen,
  goal,
  onClose,
  onSave,
  onDelete,
  categories = [],
}) => {
  if (!isOpen || !goal) return null;

  const [title, setTitle] = useState(goal.title);
  const [category, setCategory] = useState<CategoryType>(goal.category);
  const [timeframe, setTimeframe] = useState<BigPictureGoal['timeframe']>(goal.timeframe);
  const [weeklyFocus, setWeeklyFocus] = useState(goal.weeklyFocus);
  const [progress, setProgress] = useState(goal.progress);
  const [completed, setCompleted] = useState(goal.completed);
  const [subActions, setSubActions] = useState(goal.subActions || []);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setCategory(goal.category);
      setTimeframe(goal.timeframe);
      setWeeklyFocus(goal.weeklyFocus);
      setProgress(goal.progress);
      setCompleted(goal.completed);
      setSubActions(goal.subActions || []);
      setConfirmDelete(false);
    }
  }, [goal]);

  const handleAddSubAction = () => {
    setSubActions([
      ...subActions,
      {
        title: '',
        dayHint: 'Mid-week',
        duration: 30,
      },
    ]);
  };

  const handleUpdateSubAction = (
    index: number,
    field: 'title' | 'dayHint' | 'duration',
    val: string | number
  ) => {
    const updated = [...subActions];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    setSubActions(updated);
  };

  const handleRemoveSubAction = (index: number) => {
    setSubActions(subActions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Filter out completely empty steps
    const cleanedSubActions = subActions
      .map((s) => ({
        ...s,
        title: s.title.trim(),
        dayHint: s.dayHint.trim() || 'Flexible',
        duration: Number(s.duration) || 30,
      }))
      .filter((s) => s.title.length > 0);

    const updatedGoal: BigPictureGoal = {
      ...goal,
      title: title.trim(),
      category,
      timeframe,
      weeklyFocus: weeklyFocus.trim() || 'Steady progress',
      progress: Math.min(100, Math.max(0, Number(progress) || 0)),
      completed: completed || progress >= 100,
      subActions: cleanedSubActions,
    };

    onSave(updatedGoal);
    onClose();
  };

  const handleDelete = () => {
    onDelete(goal.id);
    onClose();
  };

  const categoryOptions: { key: CategoryType; label: string; emoji: string }[] = [
    { key: 'technical', label: 'Technical', emoji: '💻' },
    { key: 'academic', label: 'Academic', emoji: '📚' },
    { key: 'career', label: 'Career', emoji: '💼' },
    { key: 'creative', label: 'Creative', emoji: '🎨' },
    { key: 'personal', label: 'Personal', emoji: '🌱' },
  ];

  const timeframeOptions: { key: BigPictureGoal['timeframe']; label: string }[] = [
    { key: 'this_month', label: 'This Month' },
    { key: 'next_month', label: 'Next Month' },
    { key: 'this_quarter', label: 'This Quarter' },
    { key: 'eventually', label: 'Eventually' },
  ];

  return (
    <div
      id="edit-goal-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="edit-goal-modal"
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">Edit Big Picture Goal</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Update aspiration, milestone focus, and actionable steps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Goal Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
              Goal Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master modern web development"
              className="w-full text-sm font-medium px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-stone-800 focus:border-stone-900 dark:focus:border-stone-500"
              required
            />
          </div>

          {/* Category & Timeframe Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                {categoryOptions.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setCategory(opt.key)}
                    className={`text-xs px-2.5 py-1.5 rounded-xl font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                      category === opt.key
                        ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 border-stone-900 dark:border-white shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                Planning Horizon
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {timeframeOptions.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setTimeframe(opt.key)}
                    className={`text-xs px-2 py-1.5 rounded-xl font-bold border transition-all cursor-pointer text-center ${
                      timeframe === opt.key
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Focus Arc */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
              Current Weekly Focus Arc
            </label>
            <input
              type="text"
              value={weeklyFocus}
              onChange={(e) => setWeeklyFocus(e.target.value)}
              placeholder="e.g. Build clean responsive prototypes & explore APIs"
              className="w-full text-sm font-medium px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-stone-800 focus:border-stone-900 dark:focus:border-stone-500"
            />
            <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 block">
              Translates the high-level aspiration into what you're actually prioritizing this week.
            </span>
          </div>

          {/* Progress & Completion Status */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Progress Percentage
              </span>
              <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-lg border border-purple-200 dark:border-purple-800">
                {progress}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={(e) => {
                    setCompleted(e.target.checked);
                    if (e.target.checked && progress < 100) setProgress(100);
                  }}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  Mark Goal as Completed
                </span>
              </label>
              <div className="flex items-center gap-1 text-[11px] text-stone-400">
                <button
                  type="button"
                  onClick={() => setProgress(Math.max(0, progress - 10))}
                  className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 font-bold"
                >
                  -10%
                </button>
                <button
                  type="button"
                  onClick={() => setProgress(Math.min(100, progress + 10))}
                  className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 font-bold"
                >
                  +10%
                </button>
              </div>
            </div>
          </div>

          {/* Actionable Steps / Sub-Actions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Actionable Steps
                </label>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Paced bite-sized actions that can be turned into scheduled weekly tasks
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSubAction}
                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>

            {subActions.length === 0 ? (
              <div className="p-4 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 text-center text-xs text-stone-500 dark:text-stone-400">
                No actionable steps added yet. Click &quot;Add Step&quot; to outline micro-actions.
              </div>
            ) : (
              <div className="space-y-2.5">
                {subActions.map((sub, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80 flex flex-col sm:flex-row sm:items-center gap-2"
                  >
                    <input
                      type="text"
                      value={sub.title}
                      onChange={(e) => handleUpdateSubAction(idx, 'title', e.target.value)}
                      placeholder="Step description (e.g. Practice flashcards)"
                      className="flex-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-white focus:outline-none"
                    />

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        <input
                          type="text"
                          value={sub.dayHint}
                          onChange={(e) => handleUpdateSubAction(idx, 'dayHint', e.target.value)}
                          placeholder="Day (e.g. Tue)"
                          className="w-20 text-xs px-2 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <input
                          type="number"
                          value={sub.duration}
                          min="5"
                          step="5"
                          onChange={(e) =>
                            handleUpdateSubAction(idx, 'duration', parseInt(e.target.value) || 15)
                          }
                          className="w-16 text-xs px-2 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-white focus:outline-none"
                        />
                        <span className="text-[10px] text-stone-400 font-mono">m</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSubAction(idx)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="Remove step"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delete Section */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-600 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Are you sure?
                </span>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs"
                >
                  Yes, Delete Goal
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Goal</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-stone-900 hover:bg-black dark:bg-white dark:hover:bg-stone-200 text-white dark:text-stone-900 rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
