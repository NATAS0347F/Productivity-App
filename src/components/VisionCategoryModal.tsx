import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Palette,
  Layers,
} from 'lucide-react';
import { VisionCategory, VisionBoardItem } from '../types';

interface VisionCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: VisionCategory[];
  onSaveCategories: (categories: VisionCategory[]) => void;
  visionItems: VisionBoardItem[];
  onUpdateItemCategoryNames: (oldName: string, newName: string) => void;
  onResetCategories: () => void;
}

const PRESET_EMOJIS = ['✨', '🚀', '🌿', '☀️', '💡', '✈️', '🎨', '🧠', '💼', '🧘', '🏖️', '📚', '🎯', '🔥', '💎', '🌊'];
const PRESET_COLORS = [
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#84CC16', // Lime
];

export const VisionCategoryModal: React.FC<VisionCategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategories,
  visionItems,
  onUpdateItemCategoryNames,
  onResetCategories,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmoji, setEditEmoji] = useState('✨');
  const [editColor, setEditColor] = useState('#8B5CF6');

  // New Category State
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('✨');
  const [newColor, setNewColor] = useState('#8B5CF6');

  if (!isOpen) return null;

  const handleStartEdit = (cat: VisionCategory) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditEmoji(cat.emoji);
    setEditColor(cat.color || '#8B5CF6');
  };

  const handleSaveEdit = (cat: VisionCategory) => {
    if (!editName.trim()) return;
    const oldName = cat.name;
    const updatedName = editName.trim();

    const updated = categories.map((c) =>
      c.id === cat.id
        ? {
            ...c,
            name: updatedName,
            emoji: editEmoji,
            color: editColor,
          }
        : c
    );

    onSaveCategories(updated);
    if (oldName !== updatedName) {
      onUpdateItemCategoryNames(oldName, updatedName);
    }
    setEditingId(null);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newCat: VisionCategory = {
      id: 'vcat_' + Date.now().toString(36),
      name: newName.trim(),
      emoji: newEmoji,
      color: newColor,
    };

    onSaveCategories([...categories, newCat]);
    setNewName('');
    setNewEmoji('✨');
    setIsAdding(false);
  };

  const handleDeleteCategory = (cat: VisionCategory) => {
    if (categories.length <= 1) {
      alert('You must have at least one category.');
      return;
    }

    const remaining = categories.filter((c) => c.id !== cat.id);
    onSaveCategories(remaining);

    // Reassign items that had this category to the first remaining category
    const fallbackCategory = remaining[0].name;
    onUpdateItemCategoryNames(cat.name, fallbackCategory);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCats = [...categories];
    const [moved] = newCats.splice(index, 1);
    newCats.splice(targetIndex, 0, moved);
    onSaveCategories(newCats);
  };

  return (
    <div
      id="modal-vision-categories-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="modal-vision-categories-content"
        className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-stone-900">
                Edit Vision Categories
              </h2>
              <p className="text-[11px] text-stone-500 font-medium">
                Organize your mood board by life horizons & aesthetic themes
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Existing Categories List */}
        <div className="space-y-2.5 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-400">
              Active Categories ({categories.length})
            </span>
            <button
              type="button"
              onClick={onResetCategories}
              className="text-[11px] font-bold text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors"
              title="Reset to default categories"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>

          {categories.map((cat, idx) => {
            const cardCount = visionItems.filter((it) => it.category === cat.name).length;
            const isEditingThis = editingId === cat.id;

            if (isEditingThis) {
              return (
                <div
                  key={cat.id}
                  className="p-3 rounded-2xl border-2 border-stone-900 bg-stone-50 space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{editEmoji}</span>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Category name"
                      className="flex-1 text-xs font-bold px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  {/* Emoji selection */}
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1">
                      Choose Emoji
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_EMOJIS.map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setEditEmoji(em)}
                          className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center transition-all ${
                            editEmoji === em
                              ? 'bg-stone-900 text-white scale-110 shadow-xs'
                              : 'bg-white border border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color selection */}
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1">
                      Theme Color
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setEditColor(c)}
                          style={{ backgroundColor: c }}
                          className={`w-6 h-6 rounded-full transition-transform ${
                            editColor === c ? 'scale-125 ring-2 ring-stone-900 ring-offset-2' : 'hover:scale-110'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-200/60"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(cat)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-black flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2.5 px-3 rounded-xl border border-stone-200/90 bg-stone-50/50 hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color || '#8B5CF6' }}
                  />
                  <span className="text-base">{cat.emoji}</span>
                  <span className="text-xs font-bold text-stone-900">{cat.name}</span>
                  <span className="text-[11px] font-semibold text-stone-400">
                    ({cardCount} {cardCount === 1 ? 'card' : 'cards'})
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700 disabled:opacity-20 hover:bg-stone-200/60 transition-colors"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === categories.length - 1}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700 disabled:opacity-20 hover:bg-stone-200/60 transition-colors"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartEdit(cat)}
                    className="p-1 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition-colors"
                    title="Edit category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat)}
                    disabled={categories.length <= 1}
                    className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-20"
                    title="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Category */}
        {!isAdding ? (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="w-full py-2.5 rounded-2xl border-2 border-dashed border-stone-200 hover:border-stone-400 text-stone-600 hover:text-stone-900 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Vision Category</span>
          </button>
        ) : (
          <form
            onSubmit={handleAddCategory}
            className="p-4 rounded-2xl border border-stone-300 bg-stone-50 space-y-3 animate-in fade-in"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-stone-800">
                New Category
              </span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs text-stone-400 hover:text-stone-700"
              >
                Cancel
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xl">{newEmoji}</span>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Travel & Wandering, Writing Sanctuary"
                className="flex-1 text-xs font-bold px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 focus:outline-none focus:border-stone-900"
                autoFocus
                required
              />
            </div>

            {/* Emojis */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1">
                Pick an Icon
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setNewEmoji(em)}
                    className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center transition-all ${
                      newEmoji === em
                        ? 'bg-stone-900 text-white scale-110 shadow-xs'
                        : 'bg-white border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1">
                Color Badge
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      newColor === c ? 'scale-125 ring-2 ring-stone-900 ring-offset-2' : 'hover:scale-110'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-200/60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newName.trim()}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-black disabled:opacity-30 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Category</span>
              </button>
            </div>
          </form>
        )}

        {/* Done Button */}
        <div className="pt-4 mt-4 border-t border-stone-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-black text-white cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
