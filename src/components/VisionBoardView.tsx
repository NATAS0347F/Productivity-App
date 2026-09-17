import React, { useState, useRef } from 'react';
import {
  VisionBoardItem,
  BigPictureGoal,
  CategoryDefinition,
} from '../types';
import {
  Sparkles,
  Plus,
  Pin,
  Trash2,
  Edit3,
  Image as ImageIcon,
  ExternalLink,
  Target,
  Upload,
  RotateCcw,
  Check,
  X,
  Heart,
  Compass,
} from 'lucide-react';
import { compressImageFile } from '../utils/theme';

interface VisionBoardViewProps {
  items: VisionBoardItem[];
  onSaveItems: (items: VisionBoardItem[]) => void;
  bigPictureGoals: BigPictureGoal[];
  categories: CategoryDefinition[];
}

const VISION_CATEGORIES = [
  'All',
  'Mindset & Mood',
  'Career & Ambition',
  'Aesthetic & Life',
  'Health & Wellness',
  'Dream Projects',
  'Travel & Adventure',
];

const CURATED_AESTHETIC_PHOTOS = [
  {
    title: 'Misty Eucalyptus',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1000&q=80',
    category: 'Mindset & Mood',
    affirmation: 'Calm mind, steady breath, natural clarity.',
  },
  {
    title: 'Minimal Architecture',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
    category: 'Career & Ambition',
    affirmation: 'Building things that stand the test of time.',
  },
  {
    title: 'Deep Coding Flow',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80',
    category: 'Career & Ambition',
    affirmation: 'Small daily commits create extraordinary mastery.',
  },
  {
    title: 'Warm Morning Studio',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
    category: 'Aesthetic & Life',
    affirmation: 'My space is my sanctuary of peace and creation.',
  },
  {
    title: 'Mountain Sunlight',
    url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1000&q=80',
    category: 'Health & Wellness',
    affirmation: 'Energized by nature, renewed by movement.',
  },
  {
    title: 'Writer Notebook & Coffee',
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=80',
    category: 'Dream Projects',
    affirmation: 'Honor the craft every day with curiosity.',
  },
  {
    title: 'Kyoto Zen Garden',
    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80',
    category: 'Travel & Adventure',
    affirmation: 'Curiosity opens doors across the world.',
  },
];

export const VisionBoardView: React.FC<VisionBoardViewProps> = ({
  items,
  onSaveItems,
  bigPictureGoals,
  categories,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VisionBoardItem | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formCaption, setFormCaption] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formCategory, setFormCategory] = useState('Mindset & Mood');
  const [formAffirmation, setFormAffirmation] = useState('');
  const [formLinkedGoal, setFormLinkedGoal] = useState('');
  const [formAspectRatio, setFormAspectRatio] = useState<'portrait' | 'square' | 'landscape'>('portrait');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredItems = items
    .filter((item) => {
      if (selectedCategory === 'All') return true;
      return item.category === selectedCategory;
    })
    .sort((a, b) => {
      // Pinned items first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.createdAt - a.createdAt;
    });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormCaption('');
    setFormImageUrl(CURATED_AESTHETIC_PHOTOS[0].url);
    setFormCategory('Mindset & Mood');
    setFormAffirmation('');
    setFormLinkedGoal('');
    setFormAspectRatio('portrait');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: VisionBoardItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormCaption(item.caption || '');
    setFormImageUrl(item.imageUrl);
    setFormCategory(item.category || 'Mindset & Mood');
    setFormAffirmation(item.affirmation || '');
    setFormLinkedGoal(item.linkedGoalId || '');
    setFormAspectRatio(item.aspectRatio || 'portrait');
    setIsModalOpen(true);
  };

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = items.map((item) =>
      item.id === id ? { ...item, isPinned: !item.isPinned } : item
    );
    onSaveItems(updated);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = items.filter((item) => item.id !== id);
    onSaveItems(updated);
    showToast('Removed vision card');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingItem) {
      const updated = items.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              title: formTitle.trim(),
              caption: formCaption.trim() || undefined,
              imageUrl: formImageUrl.trim() || CURATED_AESTHETIC_PHOTOS[0].url,
              category: formCategory,
              affirmation: formAffirmation.trim() || undefined,
              linkedGoalId: formLinkedGoal || undefined,
              aspectRatio: formAspectRatio,
            }
          : item
      );
      onSaveItems(updated);
      showToast('Vision card updated');
    } else {
      const newItem: VisionBoardItem = {
        id: 'vision_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        title: formTitle.trim(),
        caption: formCaption.trim() || undefined,
        imageUrl: formImageUrl.trim() || CURATED_AESTHETIC_PHOTOS[0].url,
        category: formCategory,
        affirmation: formAffirmation.trim() || undefined,
        linkedGoalId: formLinkedGoal || undefined,
        aspectRatio: formAspectRatio,
        isPinned: false,
        createdAt: Date.now(),
      };
      onSaveItems([newItem, ...items]);
      showToast('Added to Vision Board');
    }

    setIsModalOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Compressing photo...');
      const dataUrl = await compressImageFile(file, 1200, 0.82);
      setFormImageUrl(dataUrl);
      showToast('Photo loaded successfully');
    } catch (err) {
      console.error(err);
      showToast('Failed to load image file');
    }
  };

  const handleLoadCurated = () => {
    const newItems: VisionBoardItem[] = CURATED_AESTHETIC_PHOTOS.map((photo, i) => ({
      id: 'curated_' + Date.now().toString(36) + '_' + i,
      title: photo.title,
      caption: 'Visual anchor for daily inspiration and alignment',
      imageUrl: photo.url,
      category: photo.category,
      affirmation: photo.affirmation,
      aspectRatio: i % 2 === 0 ? 'portrait' : 'landscape',
      isPinned: i < 2,
      createdAt: Date.now() - i * 1000,
    }));
    onSaveItems([...newItems, ...items]);
    showToast('Loaded aesthetic starter cards');
  };

  return (
    <div id="vision-board-page" className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-150">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div
        id="vision-board-header"
        className="p-6 sm:p-8 rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md shadow-2xs transition-colors"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Visual Horizon</span>
              </span>
              <span className="text-xs text-stone-400 font-semibold">
                {items.length} {items.length === 1 ? 'Anchor' : 'Anchors'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight mt-2">
              Vision Board & Mood Collage
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-xl">
              Curate your aesthetic, dream goals, visual anchors & affirmations. Keep your long-term aspirations vivid and emotionally alive.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="btn-add-vision-card"
              onClick={handleOpenAdd}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 text-xs font-bold shadow-xs cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Vision Tile</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-6 border-t border-stone-100 dark:border-stone-800/80 mt-6 no-scrollbar">
          {VISION_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white bg-stone-100/60 dark:bg-stone-800/40 hover:bg-stone-200/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Vision Cards */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 bg-white/40 dark:bg-stone-900/30">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto mb-3">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-white">Your Vision Board is clean and open</h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto mt-1 mb-4">
            Add photos, affirmations, and dream goals to build your personalized aesthetic mood board.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={handleLoadCurated}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Load Curated Inspiration
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 shadow-xs"
            >
              + Create First Card
            </button>
          </div>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {filteredItems.map((item) => {
            const linkedGoal = bigPictureGoals.find((g) => g.id === item.linkedGoalId);

            return (
              <div
                key={item.id}
                onClick={() => handleOpenEdit(item)}
                className="break-inside-avoid rounded-2xl overflow-hidden border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs hover:shadow-md transition-all group cursor-pointer relative"
              >
                {/* Photo container */}
                <div className="relative overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-103"
                    style={{
                      maxHeight: item.aspectRatio === 'landscape' ? '220px' : item.aspectRatio === 'square' ? '300px' : '420px',
                      minHeight: '160px',
                    }}
                    loading="lazy"
                  />

                  {/* Badges / Overlays */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20">
                      {item.category}
                    </span>

                    <div className="flex items-center gap-1 pointer-events-auto">
                      <button
                        type="button"
                        onClick={(e) => handleTogglePin(item.id, e)}
                        className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
                          item.isPinned
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-black/40 text-white/80 hover:bg-black/60'
                        }`}
                        title={item.isPinned ? 'Unpin' : 'Pin to top'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-1.5 rounded-full bg-black/40 text-white/80 hover:bg-rose-600 hover:text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete Card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 leading-snug">
                    {item.title}
                  </h3>

                  {item.affirmation && (
                    <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800/80">
                      <p className="text-xs italic text-stone-700 dark:text-stone-300 font-medium">
                        "{item.affirmation}"
                      </p>
                    </div>
                  )}

                  {item.caption && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-3">
                      {item.caption}
                    </p>
                  )}

                  {linkedGoal && (
                    <div className="pt-2 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                      <Target className="w-3.5 h-3.5" />
                      <span>Linked: {linkedGoal.title}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Vision Item Modal */}
      {isModalOpen && (
        <div
          id="vision-card-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            id="vision-card-modal"
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h2 className="text-base font-bold">
                  {editingItem ? 'Edit Vision Tile' : 'Add Vision Tile'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveForm} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Image Preview & Sources */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                  Vision Photography / Artwork *
                </label>

                {/* Preview Box */}
                <div className="relative h-44 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 mb-2">
                  <img
                    src={formImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = CURATED_AESTHETIC_PHOTOS[0].url;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                    <span className="text-xs text-white/90 font-medium">Live Visual Preview</span>
                  </div>
                </div>

                {/* Image URL input + Upload Button */}
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <input
                    type="url"
                    required
                    placeholder="Paste image URL (Unsplash, etc.)"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-stone-300 dark:border-stone-700 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="sr-only"
                  />
                </div>

                {/* Quick Curated Pickers */}
                <div className="mt-2">
                  <span className="text-[10px] text-stone-400 block mb-1">Or pick aesthetic photography:</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {CURATED_AESTHETIC_PHOTOS.map((p) => (
                      <button
                        key={p.title}
                        type="button"
                        onClick={() => {
                          setFormImageUrl(p.url);
                          if (!formAffirmation) setFormAffirmation(p.affirmation);
                          if (!formTitle) setFormTitle(p.title);
                        }}
                        className="w-12 h-10 rounded-lg overflow-hidden border border-stone-300 dark:border-stone-700 shrink-0 hover:scale-105 transition-transform"
                        title={p.title}
                      >
                        <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Anchor Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Technical Craft, Serene Morning Light"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Affirmation */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Empowering Affirmation
                </label>
                <input
                  type="text"
                  placeholder='e.g. "I protect my mornings and trust my steady pace."'
                  value={formAffirmation}
                  onChange={(e) => setFormAffirmation(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs italic focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Category + Aspect Ratio */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                    Life Area / Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    {VISION_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                    Aspect Ratio
                  </label>
                  <select
                    value={formAspectRatio}
                    onChange={(e) => setFormAspectRatio(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="portrait">Portrait (Tall)</option>
                    <option value="square">Square</option>
                    <option value="landscape">Landscape (Wide)</option>
                  </select>
                </div>
              </div>

              {/* Linked Big Picture Goal */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Connect to Long-Term Goal (Optional)
                </label>
                <select
                  value={formLinkedGoal}
                  onChange={(e) => setFormLinkedGoal(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">None (Independent Visual Anchor)</option>
                  {bigPictureGoals.map((g) => (
                    <option key={g.id} value={g.id}>
                      🎯 {g.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Caption / Story */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Notes & Details
                </label>
                <textarea
                  rows={2}
                  placeholder="Why does this vision matter to your season of life?"
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 rounded-xl shadow-xs cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Add to Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
