import React, { useState, useEffect } from 'react';
import { X, Clock, Zap, Repeat, Trash2, CheckCircle2, SplitSquareVertical, Plus, Tag, Palette } from 'lucide-react';
import {
  Task,
  ItemType,
  CategoryType,
  EnergyLevel,
  PriorityLevel,
  RecurrenceType,
  CategoryDefinition,
} from '../types';
import { ITEM_TYPE_CONFIG, DEFAULT_CATEGORIES } from '../utils/categories';
import { generateTaskBreakdown } from '../utils/breakdown';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
  onDelete: (id: number) => void;
  onToggleComplete: (id: number) => void;
  categories?: CategoryDefinition[];
  onAddCategory?: (category: CategoryDefinition) => void;
  onOpenCategoryManager?: () => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onToggleComplete,
  categories = DEFAULT_CATEGORIES,
  onAddCategory,
  onOpenCategoryManager,
}) => {
  if (!isOpen || !task) return null;

  const [name, setName] = useState(task.name);
  const [type, setType] = useState<ItemType>(task.type || 'task');
  const [intent, setIntent] = useState<'need' | 'want' | 'someday'>(task.intent || 'need');
  const [notes, setNotes] = useState<string>(task.notes || '');
  const [category, setCategory] = useState<CategoryType>(task.category || 'academic');
  const [duration, setDuration] = useState<number>(task.duration || 60);
  const [energy, setEnergy] = useState<EnergyLevel>(task.energy || 'medium');
  const [priority, setPriority] = useState<PriorityLevel>(task.priority || 2);
  const [deadline, setDeadline] = useState<string>(task.deadline || '');
  const [recurrence, setRecurrence] = useState<RecurrenceType>(task.recurrence || 'none');
  const [customDays, setCustomDays] = useState<number[]>(task.customDays || [1, 3, 5]);
  const [intimidating, setIntimidating] = useState<boolean>(!!task.intimidating);

  // Quick inline category creation state
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('🏷️');
  const [newCatColor, setNewCatColor] = useState('#8B5CF6');

  useEffect(() => {
    if (task) {
      setName(task.name);
      setType(task.type || 'task');
      setIntent(task.intent || 'need');
      setNotes(task.notes || '');
      setCategory(task.category || 'academic');
      setDuration(task.duration || 60);
      setEnergy(task.energy || 'medium');
      setPriority(task.priority || 2);
      setDeadline(task.deadline || '');
      setRecurrence(task.recurrence || 'none');
      setCustomDays(task.customDays || [1, 3, 5]);
      setIntimidating(!!task.intimidating);
      setIsCreatingCat(false);
    }
  }, [task]);

  const handleQuickAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const id = 'cat_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const newCat: CategoryDefinition = {
      id,
      name: newCatName.trim(),
      emoji: newCatEmoji || '🏷️',
      color: newCatColor || '#8B5CF6',
      isCustom: true,
    };

    if (onAddCategory) {
      onAddCategory(newCat);
    }
    setCategory(id);
    setIsCreatingCat(false);
    setNewCatName('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...task,
      name: name.trim(),
      type,
      intent,
      notes: notes.trim() || undefined,
      category,
      duration: Number(duration),
      energy,
      priority,
      deadline: deadline || null,
      recurrence,
      customDays: recurrence === 'custom' ? customDays : undefined,
      intimidating,
    });
    onClose();
  };

  const handleGenerateBreakdown = () => {
    const subtasks = generateTaskBreakdown({
      ...task,
      name,
      duration,
    });
    onSave({
      ...task,
      name,
      subtasks,
      brokenDown: true,
      intimidating: true,
    });
    onClose();
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (day: number) => {
    if (customDays.includes(day)) {
      setCustomDays(customDays.filter((d) => d !== day));
    } else {
      setCustomDays([...customDays, day].sort());
    }
  };

  return (
    <div
      id="edit-task-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="edit-task-modal-content"
        className="bg-white border border-[#e7e4df] rounded-2xl shadow-xl max-w-lg w-full p-5 sm:p-6 overflow-y-auto max-h-[90vh] text-[#242424]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#eeebe5]">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-[#1f1e1d]">Edit Item</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-md font-semibold ${ITEM_TYPE_CONFIG[type].badgeClass}`}
            >
              {ITEM_TYPE_CONFIG[type].tag}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#888] hover:text-[#222] rounded-lg hover:bg-[#f2f0ec] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Type selector */}
          <div>
            <label className="block text-xs font-semibold text-[#555] mb-1">
              Item Type
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['task', 'goal', 'project', 'idea'] as ItemType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`text-xs py-1.5 px-2 rounded-xl font-semibold border transition-all text-center cursor-pointer ${
                    type === t
                      ? 'bg-[#242424] text-white border-[#242424]'
                      : 'bg-[#faf9f6] text-[#666] border-[#e4e1db] hover:bg-[#edeae4]'
                  }`}
                >
                  {ITEM_TYPE_CONFIG[t].tag}
                </button>
              ))}
            </div>
          </div>

          {/* Intent selector: Need to do / Want to do / Maybe someday */}
          <div>
            <label className="block text-xs font-semibold text-[#555] mb-1">
              Intent Horizon
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'need', label: '📌 Need to do', desc: 'Commitment' },
                { id: 'want', label: '🌱 Want to do', desc: 'Aspiration' },
                { id: 'someday', label: '💭 Maybe someday', desc: 'Idea / Shelf' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIntent(item.id as 'need' | 'want' | 'someday')}
                  className={`text-xs py-2 px-2.5 rounded-xl font-bold border transition-all text-center cursor-pointer ${
                    intent === item.id
                      ? item.id === 'need'
                        ? 'bg-rose-100 text-rose-950 border-rose-300'
                        : item.id === 'want'
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                        : 'bg-amber-100 text-amber-950 border-amber-300'
                      : 'bg-[#faf9f6] text-[#666] border-[#e4e1db] hover:bg-[#edeae4]'
                  }`}
                >
                  <div>{item.label}</div>
                  <div className="text-[10px] font-normal opacity-70 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title input */}
          <div>
            <label className="block text-xs font-semibold text-[#555] mb-1">
              Name / Description
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm border border-[#ddd9d2] rounded-xl px-3.5 py-2.5 bg-white text-[#242424] focus:outline-none focus:border-[#8b8175]"
              required
            />
          </div>

          {/* Category & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#555]">
                  Category
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsCreatingCat((prev) => !prev)}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-900 dark:text-amber-400 flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isCreatingCat ? 'Close' : 'New'}</span>
                  </button>
                  {onOpenCategoryManager && (
                    <>
                      <span className="text-stone-300">·</span>
                      <button
                        type="button"
                        onClick={onOpenCategoryManager}
                        className="text-[11px] text-stone-400 hover:text-stone-600 cursor-pointer"
                      >
                        Manage
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Inline Quick Category Creator */}
              {isCreatingCat && (
                <div className="mb-2 p-2.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2 animate-in fade-in duration-150">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    Create New Category
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newCatEmoji}
                      onChange={(e) => setNewCatEmoji(e.target.value.slice(-2))}
                      className="w-8 h-8 text-center text-sm bg-white border border-stone-300 rounded-lg shrink-0"
                      title="Emoji"
                    />
                    <input
                      type="text"
                      placeholder="Category name..."
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="flex-1 px-2.5 py-1 text-xs bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-medium"
                    />
                    <input
                      type="color"
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer border border-stone-300 p-0 shrink-0"
                      title="Pick Color"
                    />
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsCreatingCat(false)}
                      className="px-2 py-1 text-[11px] text-stone-500 hover:text-stone-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleQuickAddCategory}
                      disabled={!newCatName.trim()}
                      className="px-3 py-1 text-[11px] font-bold bg-stone-900 text-white rounded-lg hover:bg-stone-800 disabled:opacity-50 cursor-pointer"
                    >
                      Add & Select
                    </button>
                  </div>
                </div>
              )}

              <select
                value={category}
                onChange={(e) => {
                  if (e.target.value === '__add_new__') {
                    setIsCreatingCat(true);
                  } else if (e.target.value === '__manage__' && onOpenCategoryManager) {
                    onOpenCategoryManager();
                  } else {
                    setCategory(e.target.value as CategoryType);
                  }
                }}
                className="w-full text-xs sm:text-sm border border-[#ddd9d2] rounded-xl px-3 py-2 bg-white text-[#242424] focus:outline-hidden focus:border-[#8b8175]"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.name}
                  </option>
                ))}
                {!categories.some((c) => c.id === category) && category && (
                  <option value={category}>🏷️ {category}</option>
                )}
                <option disabled>──────────</option>
                <option value="__add_new__">➕ + Add New Category...</option>
                {onOpenCategoryManager && (
                  <option value="__manage__">⚙️ Manage All Categories...</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#888]" />
                <span>Duration</span>
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full text-xs sm:text-sm border border-[#ddd9d2] rounded-xl px-3 py-2 bg-white text-[#242424] focus:outline-none focus:border-[#8b8175]"
              >
                <option value="15">15 min</option>
                <option value="25">25 min (Pomodoro)</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
                <option value="180">3 hours</option>
                <option value="240">4 hours</option>
              </select>
            </div>
          </div>

          {/* Energy & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-[#888]" />
                <span>Energy</span>
              </label>
              <select
                value={energy}
                onChange={(e) => setEnergy(e.target.value as EnergyLevel)}
                className="w-full text-xs sm:text-sm border border-[#ddd9d2] rounded-xl px-3 py-2 bg-white text-[#242424] focus:outline-none focus:border-[#8b8175]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value) as PriorityLevel)}
                className="w-full text-xs sm:text-sm border border-[#ddd9d2] rounded-xl px-3 py-2 bg-white text-[#242424] focus:outline-none focus:border-[#8b8175]"
              >
                <option value="1">P1 — Low</option>
                <option value="2">P2 — Medium</option>
                <option value="3">P3 — High</option>
                <option value="4">P4 — Critical</option>
              </select>
            </div>
          </div>

          {/* Deadline & Recurrence */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1">
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-xs sm:text-sm border border-[#ddd9d2] rounded-xl px-3 py-2 bg-white text-[#242424]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1 flex items-center gap-1">
                <Repeat className="w-3.5 h-3.5 text-[#888]" />
                <span>Recurrence</span>
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                className="w-full text-xs sm:text-sm border border-[#ddd9d2] rounded-xl px-3 py-2 bg-white text-[#242424]"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays (Mon–Fri)</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom days</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          {recurrence === 'custom' && (
            <div className="p-2.5 bg-[#faf9f6] border border-[#e8e4dc] rounded-xl">
              <span className="text-[11px] text-[#666] font-medium block mb-1">
                Recurrence Days:
              </span>
              <div className="flex gap-1 justify-between">
                {dayLabels.map((lbl, idx) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    className={`text-[11px] py-1 px-1.5 rounded-md font-semibold border flex-1 text-center cursor-pointer ${
                      customDays.includes(idx)
                        ? 'bg-[#242424] text-white border-[#242424]'
                        : 'bg-white text-[#666] border-[#e2ded6]'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes & Personal Context */}
          <div>
            <label className="block text-xs font-semibold text-[#555] mb-1">
              Notes & Personal Context
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why this matters, links, notes, or thoughts..."
              className="w-full text-xs sm:text-sm border border-[#ddd9d2] rounded-xl px-3 py-2 bg-white text-[#242424] focus:outline-none focus:border-[#8b8175] resize-y"
            />
          </div>

          {/* Procrastination helper */}
          <div className="p-3 bg-[#f8f6fb] border border-[#e3dbee] rounded-xl flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-[#4e3c73] block">
                Intimidating or complex?
              </span>
              <span className="text-[11px] text-[#78669e]">
                Break into easy 15–25 minute starting steps to beat procrastination.
              </span>
            </div>
            <button
              type="button"
              onClick={handleGenerateBreakdown}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-[#ded4ee] text-[#55407d] hover:bg-[#efeaf7] transition-colors cursor-pointer shrink-0"
            >
              Break down
            </button>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[#eeebe5]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onDelete(task.id);
                  onClose();
                }}
                className="text-xs font-semibold text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onToggleComplete(task.id);
                  onClose();
                }}
                className="text-xs font-semibold text-[#555] hover:text-[#222] p-2 rounded-lg hover:bg-[#f0ede6] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{task.completed ? 'Mark Active' : 'Mark Done'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold px-3.5 py-2 rounded-xl border border-[#ddd9d2] text-[#666] hover:bg-[#faf9f6] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs font-bold px-4 py-2 rounded-xl bg-[#242424] hover:bg-[#111] text-white transition-colors cursor-pointer"
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
