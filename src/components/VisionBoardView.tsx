import React, { useState, useRef, useEffect } from 'react';
import {
  VisionBoardItem,
  BigPictureGoal,
  CategoryDefinition,
  VisionCategory,
  VisionBoardLayoutSettings,
  VisionLayoutMode,
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
  LayoutGrid,
  Sliders,
  Tag,
  Grid3X3,
  Columns,
  BookOpen,
} from 'lucide-react';
import { compressImageFile } from '../utils/theme';
import {
  loadVisionCategories,
  saveVisionCategories,
  resetVisionCategories,
  loadVisionLayout,
  saveVisionLayout,
  resetVisionLayout,
} from '../utils/storage';
import { VisionCategoryModal } from './VisionCategoryModal';
import { VisionLayoutModal } from './VisionLayoutModal';
import { playRelaxingClick, playTabSound } from '../utils/sound';

interface VisionBoardViewProps {
  items: VisionBoardItem[];
  onSaveItems: (items: VisionBoardItem[]) => void;
  bigPictureGoals: BigPictureGoal[];
  categories: CategoryDefinition[];
}

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
  categories: globalCategories,
}) => {
  // Categories and Layout State
  const [visionCategories, setVisionCategories] = useState<VisionCategory[]>(() =>
    loadVisionCategories()
  );
  const [layout, setLayout] = useState<VisionBoardLayoutSettings>(() => loadVisionLayout());

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VisionBoardItem | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formCaption, setFormCaption] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formAffirmation, setFormAffirmation] = useState('');
  const [formLinkedGoal, setFormLinkedGoal] = useState('');
  const [formAspectRatio, setFormAspectRatio] = useState<'portrait' | 'square' | 'landscape'>(
    'portrait'
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync category changes
  const handleSaveVisionCategories = (newCategories: VisionCategory[]) => {
    setVisionCategories(newCategories);
    saveVisionCategories(newCategories);
    showToast('Categories updated');
  };

  const handleResetVisionCategories = () => {
    const defaults = resetVisionCategories();
    setVisionCategories(defaults);
    showToast('Reset categories to default');
  };

  const handleUpdateItemCategoryNames = (oldName: string, newName: string) => {
    const updated = items.map((it) =>
      it.category === oldName ? { ...it, category: newName } : it
    );
    onSaveItems(updated);
  };

  // Sync layout changes
  const handleSaveLayout = (newLayout: VisionBoardLayoutSettings) => {
    setLayout(newLayout);
    saveVisionLayout(newLayout);
    showToast('Layout updated');
  };

  const handleResetLayout = () => {
    const defaults = resetVisionLayout();
    setLayout(defaults);
    showToast('Reset layout to default');
  };

  // When selectedCategory is no longer valid, switch back to 'All'
  useEffect(() => {
    if (
      selectedCategory !== 'All' &&
      !visionCategories.some((c) => c.name === selectedCategory)
    ) {
      setSelectedCategory('All');
    }
  }, [visionCategories, selectedCategory]);

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
    setFormCategory(visionCategories[0]?.name || 'Mindset & Mood');
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
    setFormCategory(item.category || visionCategories[0]?.name || 'Mindset & Mood');
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

    const chosenCategory = formCategory || visionCategories[0]?.name || 'Mindset & Mood';

    if (editingItem) {
      const updated = items.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              title: formTitle.trim(),
              caption: formCaption.trim() || undefined,
              imageUrl: formImageUrl.trim() || CURATED_AESTHETIC_PHOTOS[0].url,
              category: chosenCategory,
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
        category: chosenCategory,
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

  // Helper classes for rounding
  const roundingClass =
    layout.cardRounding === 'subtle'
      ? 'rounded-xl'
      : layout.cardRounding === 'curved'
      ? 'rounded-3xl'
      : 'rounded-2xl';

  // Helper classes for gap spacing
  const gapClass =
    layout.gap === 'compact' ? 'gap-3.5' : layout.gap === 'spacious' ? 'gap-7' : 'gap-5';
  const spaceYClass =
    layout.gap === 'compact' ? 'space-y-3.5' : layout.gap === 'spacious' ? 'space-y-7' : 'space-y-5';

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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
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

          {/* Controls: Layout, Categories, Add Tile */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Quick Layout Mode Buttons */}
            <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200/80 dark:border-stone-700">
              <button
                type="button"
                onClick={() => handleSaveLayout({ ...layout, mode: 'masonry' })}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  layout.mode === 'masonry'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white'
                }`}
                title="Masonry Collage"
              >
                <Columns className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleSaveLayout({ ...layout, mode: 'grid' })}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  layout.mode === 'grid'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white'
                }`}
                title="Uniform Grid"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleSaveLayout({ ...layout, mode: 'mosaic' })}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  layout.mode === 'mosaic'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white'
                }`}
                title="Editorial Mosaic"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleSaveLayout({ ...layout, mode: 'journal' })}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  layout.mode === 'journal'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white'
                }`}
                title="Journal Cards"
              >
                <BookOpen className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Layout Customizer Button */}
            <button
              id="btn-edit-vision-layout"
              type="button"
              onClick={() => {
                playRelaxingClick();
                setIsLayoutModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold border border-stone-200/80 dark:border-stone-700 transition-all cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Layout</span>
            </button>

            {/* Edit Categories Button */}
            <button
              id="btn-edit-vision-categories"
              type="button"
              onClick={() => {
                playRelaxingClick();
                setIsCategoryModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold border border-stone-200/80 dark:border-stone-700 transition-all cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Categories</span>
            </button>

            {/* Add Vision Card Button */}
            <button
              id="btn-add-vision-card"
              onClick={() => {
                playRelaxingClick();
                handleOpenAdd();
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 text-xs font-bold shadow-xs cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Vision Tile</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-6 border-t border-stone-100 dark:border-stone-800/80 mt-6 no-scrollbar">
          <button
            onClick={() => {
              playTabSound();
              setSelectedCategory('All');
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs'
                : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white bg-stone-100/60 dark:bg-stone-800/40 hover:bg-stone-200/60'
            }`}
          >
            All ({items.length})
          </button>

          {visionCategories.map((cat) => {
            const count = items.filter((it) => it.category === cat.name).length;
            const isSelected = selectedCategory === cat.name;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white bg-stone-100/60 dark:bg-stone-800/40 hover:bg-stone-200/60'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-60 font-mono">({count})</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-2.5 py-1.5 rounded-full text-xs font-bold text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1 transition-colors shrink-0"
            title="Manage categories"
          >
            <Plus className="w-3 h-3" />
            <span>Edit Categories</span>
          </button>
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
      ) : layout.mode === 'journal' ? (
        /* Journal Cards Layout (Horizontal Widescreen Editorial Cards) */
        <div className={`max-w-4xl mx-auto ${spaceYClass}`}>
          {filteredItems.map((item) => {
            const linkedGoal = bigPictureGoals.find((g) => g.id === item.linkedGoalId);
            const catObj = visionCategories.find((c) => c.name === item.category);

            return (
              <div
                key={item.id}
                onClick={() => handleOpenEdit(item)}
                className={`overflow-hidden border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs hover:shadow-md transition-all group cursor-pointer ${roundingClass} flex flex-col sm:flex-row`}
              >
                {/* Photo Left/Top */}
                <div className="sm:w-2/5 min-h-[200px] relative overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20">
                      {catObj?.emoji} {item.category}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1">
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

                {/* Content Right */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100 leading-snug">
                      {item.title}
                    </h3>

                    {layout.showAffirmation && item.affirmation && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50">
                        <p className="text-xs sm:text-sm italic font-medium text-amber-950 dark:text-amber-200 font-serif leading-relaxed">
                          "{item.affirmation}"
                        </p>
                      </div>
                    )}

                    {layout.showCaption && item.caption && (
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-3 leading-relaxed">
                        {item.caption}
                      </p>
                    )}
                  </div>

                  {layout.showLinkedGoal && linkedGoal && (
                    <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      <Target className="w-4 h-4" />
                      <span>Connected Goal: {linkedGoal.title}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : layout.mode === 'mosaic' ? (
        /* Editorial Mosaic Layout */
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${gapClass}`}
        >
          {filteredItems.map((item, index) => {
            const linkedGoal = bigPictureGoals.find((g) => g.id === item.linkedGoalId);
            const catObj = visionCategories.find((c) => c.name === item.category);
            const isHero = index === 0 || item.isPinned;

            return (
              <div
                key={item.id}
                onClick={() => handleOpenEdit(item)}
                className={`overflow-hidden border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs hover:shadow-md transition-all group cursor-pointer relative flex flex-col justify-between ${roundingClass} ${
                  isHero ? 'sm:col-span-2 lg:col-span-2' : ''
                }`}
              >
                {/* Photo container */}
                <div className="relative overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-103"
                    style={{
                      height: isHero ? '320px' : '200px',
                    }}
                    loading="lazy"
                  />

                  {/* Badges / Overlays */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center gap-1">
                      <span>{catObj?.emoji}</span>
                      <span>{item.category}</span>
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
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className={`font-bold text-stone-900 dark:text-stone-100 leading-snug ${isHero ? 'text-base sm:text-lg' : 'text-sm'}`}>
                      {item.title}
                    </h3>

                    {layout.showAffirmation && item.affirmation && (
                      <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800/80 mt-2">
                        <p className="text-xs italic text-stone-700 dark:text-stone-300 font-medium">
                          "{item.affirmation}"
                        </p>
                      </div>
                    )}

                    {layout.showCaption && item.caption && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mt-1">
                        {item.caption}
                      </p>
                    )}
                  </div>

                  {layout.showLinkedGoal && linkedGoal && (
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
      ) : layout.mode === 'grid' ? (
        /* Uniform Grid Layout */
        <div
          className={`grid grid-cols-1 ${
            layout.columns === 2
              ? 'sm:grid-cols-2'
              : layout.columns === 4
              ? 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              : 'sm:grid-cols-2 lg:grid-cols-3'
          } ${gapClass}`}
        >
          {filteredItems.map((item) => {
            const linkedGoal = bigPictureGoals.find((g) => g.id === item.linkedGoalId);
            const catObj = visionCategories.find((c) => c.name === item.category);

            // Aspect ratio calculation
            const aspectClass =
              layout.aspectRatioOverride === 'square'
                ? 'aspect-square'
                : layout.aspectRatioOverride === 'portrait'
                ? 'aspect-[3/4]'
                : layout.aspectRatioOverride === 'landscape'
                ? 'aspect-[16/9]'
                : item.aspectRatio === 'landscape'
                ? 'aspect-[16/9]'
                : item.aspectRatio === 'square'
                ? 'aspect-square'
                : 'aspect-[3/4]';

            return (
              <div
                key={item.id}
                onClick={() => handleOpenEdit(item)}
                className={`overflow-hidden border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs hover:shadow-md transition-all group cursor-pointer relative flex flex-col justify-between ${roundingClass}`}
              >
                {/* Photo container */}
                <div className={`relative overflow-hidden bg-stone-100 dark:bg-stone-800 ${aspectClass}`}>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                    loading="lazy"
                  />

                  {/* Badges / Overlays */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center gap-1">
                      <span>{catObj?.emoji}</span>
                      <span>{item.category}</span>
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
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 leading-snug">
                      {item.title}
                    </h3>

                    {layout.showAffirmation && item.affirmation && (
                      <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800/80 mt-2">
                        <p className="text-xs italic text-stone-700 dark:text-stone-300 font-medium">
                          "{item.affirmation}"
                        </p>
                      </div>
                    )}

                    {layout.showCaption && item.caption && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mt-1">
                        {item.caption}
                      </p>
                    )}
                  </div>

                  {layout.showLinkedGoal && linkedGoal && (
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
      ) : (
        /* Masonry Flow Layout (Default Pinterest Style) */
        <div
          className={`columns-1 ${
            layout.columns === 2
              ? 'sm:columns-2'
              : layout.columns === 4
              ? 'sm:columns-2 md:columns-3 lg:columns-4'
              : 'sm:columns-2 lg:columns-3'
          } ${gapClass} ${spaceYClass}`}
        >
          {filteredItems.map((item) => {
            const linkedGoal = bigPictureGoals.find((g) => g.id === item.linkedGoalId);
            const catObj = visionCategories.find((c) => c.name === item.category);

            const maxHeight =
              layout.aspectRatioOverride === 'landscape'
                ? '200px'
                : layout.aspectRatioOverride === 'square'
                ? '300px'
                : layout.aspectRatioOverride === 'portrait'
                ? '420px'
                : item.aspectRatio === 'landscape'
                ? '220px'
                : item.aspectRatio === 'square'
                ? '300px'
                : '420px';

            return (
              <div
                key={item.id}
                onClick={() => handleOpenEdit(item)}
                className={`break-inside-avoid overflow-hidden border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs hover:shadow-md transition-all group cursor-pointer relative ${roundingClass}`}
              >
                {/* Photo container */}
                <div className="relative overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-103"
                    style={{
                      maxHeight,
                      minHeight: '160px',
                    }}
                    loading="lazy"
                  />

                  {/* Badges / Overlays */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center gap-1">
                      <span>{catObj?.emoji}</span>
                      <span>{item.category}</span>
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

                  {layout.showAffirmation && item.affirmation && (
                    <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800/80">
                      <p className="text-xs italic text-stone-700 dark:text-stone-300 font-medium">
                        "{item.affirmation}"
                      </p>
                    </div>
                  )}

                  {layout.showCaption && item.caption && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-3">
                      {item.caption}
                    </p>
                  )}

                  {layout.showLinkedGoal && linkedGoal && (
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

                <div className="relative h-44 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 mb-3">
                  <img
                    src={formImageUrl || CURATED_AESTHETIC_PHOTOS[0].url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                    <span className="text-white text-xs font-bold tracking-wide">
                      {formTitle || 'Untitled Vision Anchor'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="url"
                    placeholder="Paste image web URL..."
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>
                </div>

                {/* Quick curated aesthetics thumbnail strip */}
                <div>
                  <span className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                    Or select curated aesthetic inspiration:
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-400">
                      Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-[10px] font-bold text-stone-400 hover:text-stone-700 dark:hover:text-white"
                    >
                      + Manage
                    </button>
                  </div>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    {visionCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.emoji} {cat.name}
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

      {/* Category Manager Modal */}
      <VisionCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={visionCategories}
        onSaveCategories={handleSaveVisionCategories}
        visionItems={items}
        onUpdateItemCategoryNames={handleUpdateItemCategoryNames}
        onResetCategories={handleResetVisionCategories}
      />

      {/* Layout Customizer Modal */}
      <VisionLayoutModal
        isOpen={isLayoutModalOpen}
        onClose={() => setIsLayoutModalOpen(false)}
        layout={layout}
        onChangeLayout={handleSaveLayout}
        onResetLayout={handleResetLayout}
      />
    </div>
  );
};
