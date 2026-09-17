import React, { useState, useEffect } from 'react';
import { CategoryDefinition } from '../types';
import {
  X,
  Plus,
  Trash2,
  RotateCcw,
  Check,
  Palette,
  Sparkles,
  Info,
} from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryDefinition[];
  onSaveCategories: (categories: CategoryDefinition[]) => void;
  onResetCategories: () => void;
}

const PRESET_PALETTE_COLORS = [
  '#4F46E5', // Indigo
  '#0D9488', // Teal
  '#D97706', // Amber
  '#DB2777', // Pink
  '#10B981', // Emerald
  '#64748B', // Slate
  '#8B5CF6', // Purple
  '#F43F5E', // Rose
  '#0284C7', // Sky
  '#65A30D', // Lime
  '#EA580C', // Orange
  '#7C3AED', // Violet
  '#57534E', // Warm Stone
];

const PRESET_EMOJIS = ['🧠', '💻', '📊', '🎨', '🌱', '🏠', '🏋️', '📚', '✍️', '💰', '🧘', '🎯', '🚀', '☕', '💡', '🎵', '🌿', '✨'];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategories,
  onResetCategories,
}) => {
  if (!isOpen) return null;

  const [list, setList] = useState<CategoryDefinition[]>(categories);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setList(categories);
  }, [categories, isOpen]);

  // New category form
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🎯');
  const [newColor, setNewColor] = useState('#8B5CF6');
  const [newDesc, setNewDesc] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdateItem = (id: string, updates: Partial<CategoryDefinition>) => {
    const updated = list.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setList(updated);
    onSaveCategories(updated);
  };

  const handleDeleteItem = (id: string) => {
    if (list.length <= 1) {
      showToast('You must keep at least one category.');
      return;
    }
    const updated = list.filter((c) => c.id !== id);
    setList(updated);
    onSaveCategories(updated);
    showToast('Category removed');
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const id = 'cat_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const newCat: CategoryDefinition = {
      id,
      name: newName.trim(),
      emoji: newEmoji || '🎯',
      color: newColor || '#8B5CF6',
      description: newDesc.trim() || undefined,
      isCustom: true,
    };

    const updated = [...list, newCat];
    setList(updated);
    onSaveCategories(updated);
    setIsAddingNew(false);
    setNewName('');
    setNewDesc('');
    showToast(`Created category "${newCat.name}"`);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all categories back to initial defaults? Custom categories will be replaced.')) {
      onResetCategories();
      onClose();
    }
  };

  return (
    <div
      id="category-manager-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="category-manager-modal"
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
              🏷️
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Edit Categories</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Rename, pick accent colors, or add custom life domains
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Notification */}
        {notification && (
          <div className="mx-6 mt-3 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-lg flex items-center gap-2">
            <Check className="w-3.5 h-3.5" />
            <span>{notification}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Add Category Trigger / Form */}
          {!isAddingNew ? (
            <button
              id="btn-add-new-category"
              onClick={() => setIsAddingNew(true)}
              className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-500 text-stone-600 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer bg-stone-50/50 dark:bg-stone-800/30"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Category (e.g. Fitness, Reading, Client Work)</span>
            </button>
          ) : (
            <form
              onSubmit={handleCreateCategory}
              className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                  New Custom Category
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-stone-400 hover:text-stone-600 text-xs"
                >
                  Cancel
                </button>
              </div>

              {/* Emoji + Name */}
              <div className="grid grid-cols-[56px_1fr] gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-stone-400 uppercase mb-1">
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value.slice(-2))}
                    className="w-full text-center py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-stone-400 uppercase mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fitness & Health"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Quick Emojis */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {PRESET_EMOJIS.slice(0, 12).map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewEmoji(emoji)}
                    className={`w-7 h-7 rounded-md text-sm flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors ${
                      newEmoji === emoji ? 'bg-amber-100 dark:bg-amber-950/60 ring-1 ring-amber-400' : ''
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-[10px] font-semibold text-stone-400 uppercase mb-1">
                  Accent Color
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_PALETTE_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewColor(col)}
                      className={`w-6 h-6 rounded-full border border-black/10 transition-transform ${
                        newColor === col ? 'scale-125 ring-2 ring-stone-900 dark:ring-white' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-6 h-6 rounded-full border-0 p-0 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-stone-400 uppercase mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Workouts, mobility & nutrition"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 rounded-lg shadow-2xs"
                >
                  Save Category
                </button>
              </div>
            </form>
          )}

          {/* Existing Categories List */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
              All Categories ({list.length})
            </span>
            {list.map((cat) => {
              const isEditing = editingId === cat.id;

              return (
                <div
                  key={cat.id}
                  className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 hover:border-stone-300 dark:hover:border-stone-700 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      {/* Emoji button / preview */}
                      <button
                        type="button"
                        onClick={() => setEditingId(isEditing ? null : cat.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 transition-transform hover:scale-105"
                        style={{ backgroundColor: `${cat.color}15`, border: `1px solid ${cat.color}30` }}
                      >
                        {cat.emoji}
                      </button>

                      {/* Name display or edit input */}
                      {isEditing ? (
                        <input
                          type="text"
                          value={cat.name}
                          onChange={(e) => handleUpdateItem(cat.id, { name: e.target.value })}
                          className="px-2 py-1 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-bold flex-1"
                        />
                      ) : (
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold truncate">{cat.name}</span>
                            {cat.isCustom && (
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                                Custom
                              </span>
                            )}
                          </div>
                          {cat.description && (
                            <p className="text-[11px] text-stone-400 truncate">{cat.description}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Color dot + Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Color picker */}
                      <label className="cursor-pointer flex items-center gap-1 p-1 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800" title="Change Color">
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 inline-block"
                          style={{ backgroundColor: cat.color }}
                        />
                        <input
                          type="color"
                          value={cat.color}
                          onChange={(e) => handleUpdateItem(cat.id, { color: e.target.value })}
                          className="sr-only"
                        />
                      </label>

                      {/* Edit toggle */}
                      <button
                        onClick={() => setEditingId(isEditing ? null : cat.id)}
                        className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isEditing
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                        }`}
                        title={isEditing ? 'Done Editing' : 'Edit Category'}
                      >
                        {isEditing ? <Check className="w-3.5 h-3.5" /> : <Palette className="w-3.5 h-3.5" />}
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteItem(cat.id)}
                        className="p-1.5 text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Edit Panel if active */}
                  {isEditing && (
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2">
                      <div className="grid grid-cols-[80px_1fr] gap-2">
                        <div>
                          <label className="text-[10px] text-stone-400 block mb-0.5">Emoji</label>
                          <input
                            type="text"
                            value={cat.emoji}
                            onChange={(e) => handleUpdateItem(cat.id, { emoji: e.target.value.slice(-2) })}
                            className="w-full text-center py-1 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-400 block mb-0.5">Description</label>
                          <input
                            type="text"
                            placeholder="What belongs here?"
                            value={cat.description || ''}
                            onChange={(e) => handleUpdateItem(cat.id, { description: e.target.value })}
                            className="w-full px-2 py-1 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-xs"
                          />
                        </div>
                      </div>

                      {/* Palette color swatches */}
                      <div>
                        <label className="text-[10px] text-stone-400 block mb-1">Preset Palette</label>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {PRESET_PALETTE_COLORS.map((col) => (
                            <button
                              key={col}
                              type="button"
                              onClick={() => handleUpdateItem(cat.id, { color: col })}
                              className={`w-5 h-5 rounded-full border border-black/10 transition-transform ${
                                cat.color === col ? 'scale-125 ring-2 ring-stone-900 dark:ring-white' : 'hover:scale-110'
                              }`}
                              style={{ backgroundColor: col }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
          <button
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Categories</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 rounded-xl shadow-2xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
