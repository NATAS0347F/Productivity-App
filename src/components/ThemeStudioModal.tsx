import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Palette,
  Image as ImageIcon,
  Type,
  Layers,
  Sparkles,
  Save,
  Download,
  Upload,
  Check,
  RotateCcw,
  AlertTriangle,
  Eye,
  Sliders,
  Sun,
  Moon,
  Trash2,
  Copy,
} from 'lucide-react';
import {
  ThemeSettings,
  PresetThemeKey,
  CardStyleType,
  BorderRadiusType,
  FontFamilyType,
  FontSizeScaleType,
  SpacingDensityType,
  CategoryType,
} from '../types';
import {
  PRESET_THEMES,
  AESTHETIC_WALLPAPER_PRESETS,
  checkContrastSafety,
  compressImageFile,
  getBorderRadiusValue,
  DEFAULT_CATEGORY_COLORS,
  applyThemeToDocument,
} from '../utils/theme';

interface ThemeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTheme: ThemeSettings;
  onSaveTheme: (theme: ThemeSettings) => void;
  savedThemes: ThemeSettings[];
  onSaveCustomTheme: (theme: ThemeSettings) => void;
  onDeleteCustomTheme: (id: string) => void;
}

type TabType = 'colours' | 'background' | 'typography' | 'cards' | 'effects' | 'saved';

export const ThemeStudioModal: React.FC<ThemeStudioModalProps> = ({
  isOpen,
  onClose,
  activeTheme,
  onSaveTheme,
  savedThemes,
  onSaveCustomTheme,
  onDeleteCustomTheme,
}) => {
  if (!isOpen) return null;

  // Local draft theme for live editing and instant preview
  const [draft, setDraft] = useState<ThemeSettings>(activeTheme);
  const [activeTab, setActiveTab] = useState<TabType>('colours');
  const [customThemeName, setCustomThemeName] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'info'; text: string } | null>(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const jsonInputRef = useRef<HTMLInputElement | null>(null);

  // Sync draft state with incoming activeTheme whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setDraft(activeTheme);
    }
  }, [isOpen, activeTheme]);

  const showNotification = (text: string, type: 'success' | 'info' = 'success') => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleApplyPreset = (presetKey: PresetThemeKey) => {
    const preset = PRESET_THEMES[presetKey];
    if (!preset) return;
    const updated: ThemeSettings = {
      ...preset,
      backgroundImage: preset.backgroundImage || undefined,
    };
    setDraft(updated);
    onSaveTheme(updated);
    applyThemeToDocument(updated);
    showNotification(`Applied ${preset.name} theme`);
  };

  const handleUpdateDraft = (updater: (prev: ThemeSettings) => ThemeSettings) => {
    const next = updater(draft);
    setDraft(next);
    onSaveTheme(next);
    applyThemeToDocument(next);
  };

  const handleColorChange = (key: keyof ThemeSettings['colors'], value: string) => {
    handleUpdateDraft((prev) => ({
      ...prev,
      presetKey: 'custom',
      colors: {
        ...prev.colors,
        [key]: value,
      },
    }));
  };

  const handleCategoryColorChange = (category: CategoryType | 'break' | 'free', value: string) => {
    handleUpdateDraft((prev) => ({
      ...prev,
      categoryColors: {
        ...prev.categoryColors,
        [category]: value,
      },
    }));
  };

  // Image Upload handler with canvas compression
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showNotification('Compressing and loading image...', 'info');
      const dataUrl = await compressImageFile(file, 1600, 0.82);
      handleUpdateDraft((prev) => ({
        ...prev,
        backgroundImage: {
          url: dataUrl,
          position: 'center',
          size: 'cover',
          opacity: 90,
          blur: 0,
          overlayType: 'auto',
          overlayOpacity: 35,
          protectReadability: true,
        },
      }));
      showNotification('Background image set successfully!');
    } catch (err) {
      console.error('Image compression error:', err);
      showNotification('Could not load image. Try another file.', 'info');
    }
    e.target.value = '';
  };

  const handleSelectWallpaperPreset = (url: string, recommendedTheme?: PresetThemeKey) => {
    handleUpdateDraft((prev) => {
      let updated = { ...prev };
      if (recommendedTheme && PRESET_THEMES[recommendedTheme]) {
        updated = {
          ...PRESET_THEMES[recommendedTheme],
          ...updated,
          colors: PRESET_THEMES[recommendedTheme].colors,
        };
      }
      return {
        ...updated,
        backgroundImage: {
          url,
          position: 'center',
          size: 'cover',
          opacity: 90,
          blur: 0,
          overlayType: 'auto',
          overlayOpacity: 40,
          protectReadability: true,
        },
      };
    });
    showNotification('Wallpaper applied with readability overlay');
  };

  const handleRemoveBackground = () => {
    handleUpdateDraft((prev) => {
      const next = { ...prev };
      delete next.backgroundImage;
      return next;
    });
    showNotification('Background image removed');
  };

  // Contrast check
  const textContrast = checkContrastSafety(draft.colors.text, draft.colors.card);
  const bgContrast = checkContrastSafety(draft.colors.text, draft.colors.background);

  const handleAutoBoostContrast = () => {
    const isDarkBg = draft.colors.background.toLowerCase() < '#777777';
    handleUpdateDraft((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        text: isDarkBg ? '#F9FAFB' : '#111827',
        textMuted: isDarkBg ? '#9CA3AF' : '#4B5563',
        card: isDarkBg ? '#181B24' : '#FFFFFF',
        cardBorder: isDarkBg ? '#2D3345' : '#E5E7EB',
      },
      backgroundImage: prev.backgroundImage
        ? {
            ...prev.backgroundImage,
            overlayOpacity: Math.max(45, prev.backgroundImage.overlayOpacity),
            protectReadability: true,
          }
        : undefined,
    }));
    showNotification('Contrast boosted for optimal readability');
  };

  // Save custom theme
  const handleSaveCurrentTheme = () => {
    const name = customThemeName.trim() || `My Theme ${savedThemes.length + 1}`;
    const newTheme: ThemeSettings = {
      ...draft,
      id: `custom-theme-${Date.now()}`,
      name,
      isCustom: true,
      updatedAt: Date.now(),
    };
    onSaveCustomTheme(newTheme);
    setCustomThemeName('');
    showNotification(`Saved "${name}" to your themes!`);
  };

  // Export JSON
  const handleExportThemeJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(draft, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `flow-theme-${draft.name.toLowerCase().replace(/\s+/g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification('Theme configuration downloaded');
  };

  const handleCopyThemeJson = () => {
    navigator.clipboard.writeText(JSON.stringify(draft, null, 2));
    showNotification('Theme JSON copied to clipboard');
  };

  // Import JSON
  const handleImportJson = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      if (parsed && parsed.colors && parsed.colors.background) {
        const importedTheme: ThemeSettings = {
          ...PRESET_THEMES.clean,
          ...parsed,
          id: `imported-${Date.now()}`,
          isCustom: true,
        };
        setDraft(importedTheme);
        onSaveTheme(importedTheme);
        onSaveCustomTheme(importedTheme);
        setShowImportBox(false);
        setImportJsonText('');
        showNotification(`Theme "${importedTheme.name || 'Custom'}" imported successfully!`);
      } else {
        showNotification('Invalid theme JSON structure', 'info');
      }
    } catch {
      showNotification('Could not parse JSON. Check syntax.', 'info');
    }
  };

  return (
    <div
      id="theme-studio-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="theme-studio-modal-content"
        className="bg-white border border-stone-200/90 rounded-3xl shadow-2xl max-w-5xl w-full h-[90vh] max-h-[850px] flex flex-col overflow-hidden text-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-stone-200/80 flex items-center justify-between bg-stone-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shadow-2xs font-bold">
              <Palette className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-stone-900">Theme Studio & Aesthetic</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Personalize colors, background art, cards, typography & atmosphere
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-900 rounded-xl hover:bg-stone-200/60 transition-colors cursor-pointer"
              title="Close Theme Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NOTIFICATION TOAST */}
        {notification && (
          <div className="bg-stone-900 text-white text-xs font-semibold px-4 py-2 text-center flex items-center justify-center gap-2 animate-in slide-in-from-top-1">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{notification.text}</span>
          </div>
        )}

        {/* MAIN BODY: 2-COLUMN LAYOUT (CONTROLS LEFT, LIVE PREVIEW RIGHT) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-stone-200/80">
          {/* LEFT: CONTROLS & SECTIONS */}
          <div className="flex flex-col min-h-0 overflow-hidden">
            {/* TABS HEADER */}
            <div className="flex items-center gap-1 px-5 py-2.5 bg-stone-100/60 border-b border-stone-200/80 overflow-x-auto shrink-0 scrollbar-none">
              {[
                { id: 'colours', label: 'Colours', icon: Palette },
                { id: 'background', label: 'Background', icon: ImageIcon },
                { id: 'typography', label: 'Typography', icon: Type },
                { id: 'cards', label: 'Cards', icon: Layers },
                { id: 'effects', label: 'Effects', icon: Sparkles },
                { id: 'saved', label: 'Saved', icon: Save },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT (SCROLLABLE) */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
              {/* ---------------- SECTION: COLOURS ---------------- */}
              {activeTab === 'colours' && (
                <div className="space-y-6">
                  {/* PRESET PALETTES */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-stone-500 mb-2.5">
                      Curated Preset Palettes
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { key: 'sage', name: '🌿 Sage', bg: '#F3F5EF', accent: '#3D684E' },
                        { key: 'soft', name: '🌸 Soft', bg: '#FAF6F7', accent: '#BD5876' },
                        { key: 'midnight', name: '🌙 Midnight', bg: '#0F1117', accent: '#7586E8' },
                        { key: 'autumn', name: '🍂 Autumn', bg: '#F9F4EE', accent: '#B8582E' },
                        { key: 'lavender', name: '🪻 Lavender', bg: '#F5F3F9', accent: '#7C60A6' },
                        { key: 'clean', name: '🧊 Clean', bg: '#F8F9FA', accent: '#2563EB' },
                        { key: 'ocean', name: '🌊 Ocean', bg: '#F0F6F7', accent: '#217885' },
                        { key: 'dark_academia', name: '🖤 Dark Academia', bg: '#181613', accent: '#C79A63' },
                      ].map((preset) => (
                        <button
                          key={preset.key}
                          onClick={() => handleApplyPreset(preset.key as PresetThemeKey)}
                          className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-18 ${
                            draft.presetKey === preset.key
                              ? 'border-stone-900 ring-2 ring-stone-900/10 shadow-2xs'
                              : 'border-stone-200 hover:border-stone-400 bg-white'
                          }`}
                        >
                          <span className="text-xs font-bold text-stone-900 truncate">
                            {preset.name}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className="w-4 h-4 rounded-full border border-black/10 shadow-2xs inline-block"
                              style={{ backgroundColor: preset.bg }}
                            />
                            <span
                              className="w-4 h-4 rounded-full border border-black/10 shadow-2xs inline-block"
                              style={{ backgroundColor: preset.accent }}
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CONTRAST SAFETY BANNER */}
                  <div
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                      textContrast.isSafe
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                        : 'bg-amber-50/80 border-amber-300 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {textContrast.isSafe ? (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold">Text Contrast: {textContrast.ratio}:1</span>
                        <p className="text-[11px] opacity-80">{textContrast.message}</p>
                      </div>
                    </div>
                    {!textContrast.isSafe && (
                      <button
                        onClick={handleAutoBoostContrast}
                        className="px-3 py-1 rounded-xl bg-amber-900 text-white font-bold text-[11px] hover:bg-black transition-colors cursor-pointer shrink-0"
                      >
                        Boost Contrast
                      </button>
                    )}
                  </div>

                  {/* CUSTOM COLOR PICKERS */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-stone-500 mb-2.5">
                      Fine-Tune Colors
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: 'background', label: 'Background' },
                        { key: 'card', label: 'Card Color' },
                        { key: 'cardBorder', label: 'Card Border' },
                        { key: 'text', label: 'Primary Text' },
                        { key: 'textMuted', label: 'Muted Text' },
                        { key: 'accent', label: 'Primary Accent' },
                        { key: 'accentSecondary', label: 'Secondary Accent' },
                      ].map((item) => {
                        const val = draft.colors[item.key as keyof ThemeSettings['colors']];
                        return (
                          <div
                            key={item.key}
                            className="flex items-center justify-between p-2.5 rounded-2xl bg-stone-50 border border-stone-200/80"
                          >
                            <span className="text-xs font-bold text-stone-700">{item.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono text-stone-500 uppercase">
                                {val}
                              </span>
                              <input
                                type="color"
                                value={val}
                                onChange={(e) =>
                                  handleColorChange(item.key as keyof ThemeSettings['colors'], e.target.value)
                                }
                                className="w-7 h-7 rounded-lg border border-stone-300 cursor-pointer overflow-hidden p-0"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* CUSTOM TASK CATEGORY COLOURS */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-stone-500">
                        Task Category Accents
                      </label>
                      <button
                        onClick={() =>
                          handleUpdateDraft((prev) => ({
                            ...prev,
                            categoryColors: { ...DEFAULT_CATEGORY_COLORS },
                          }))
                        }
                        className="text-[11px] font-bold text-stone-500 hover:text-stone-900 cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset defaults</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-400 mb-3">
                      Rendered subtly as left borders & pastel pills without dominating cards.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { key: 'academic', label: '🎓 Academic' },
                        { key: 'technical', label: '💻 Coding' },
                        { key: 'career', label: '📊 Career' },
                        { key: 'creative', label: '🎨 Creative' },
                        { key: 'personal', label: '🌱 Personal' },
                        { key: 'admin', label: '🏠 Life / Admin' },
                        { key: 'break', label: '☕ Break' },
                        { key: 'free', label: '🫧 Free time' },
                      ].map((cat) => {
                        const col = draft.categoryColors[cat.key as CategoryType | 'break' | 'free'];
                        return (
                          <div
                            key={cat.key}
                            className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200/80"
                          >
                            <span className="text-[11px] font-bold text-stone-700 truncate pr-1">
                              {cat.label}
                            </span>
                            <input
                              type="color"
                              value={col}
                              onChange={(e) =>
                                handleCategoryColorChange(
                                  cat.key as CategoryType | 'break' | 'free',
                                  e.target.value
                                )
                              }
                              className="w-6 h-6 rounded-md border border-stone-300 cursor-pointer overflow-hidden p-0 shrink-0"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- SECTION: BACKGROUND ---------------- */}
              {activeTab === 'background' && (
                <div className="space-y-6">
                  {/* UPLOAD & CONTROLS */}
                  <div className="p-4 rounded-3xl bg-stone-50 border border-stone-200/90 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-black text-stone-900">Custom Background Image</h4>
                        <p className="text-xs text-stone-500">
                          Upload Pinterest aesthetics, personal photos, or wallpapers
                        </p>
                      </div>

                      {draft.backgroundImage && (
                        <button
                          onClick={handleRemoveBackground}
                          className="px-2.5 py-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload photo or wallpaper</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* BACKGROUND SETTINGS (SLIDERS) */}
                  {draft.backgroundImage ? (
                    <div className="space-y-4 p-4 rounded-3xl bg-white border border-stone-200 shadow-2xs">
                      <h4 className="text-xs font-black uppercase tracking-wider text-stone-500">
                        Atmosphere & Image Controls
                      </h4>

                      {/* Position & Size */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">Position</label>
                          <div className="flex gap-1">
                            {['center', 'top', 'bottom'].map((pos) => (
                              <button
                                key={pos}
                                onClick={() =>
                                  handleUpdateDraft((prev) => ({
                                    ...prev,
                                    backgroundImage: {
                                      ...prev.backgroundImage!,
                                      position: pos as any,
                                    },
                                  }))
                                }
                                className={`flex-1 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                                  draft.backgroundImage?.position === pos
                                    ? 'bg-stone-900 text-white'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                              >
                                {pos}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">Scale</label>
                          <div className="flex gap-1">
                            {['cover', 'contain'].map((sz) => (
                              <button
                                key={sz}
                                onClick={() =>
                                  handleUpdateDraft((prev) => ({
                                    ...prev,
                                    backgroundImage: {
                                      ...prev.backgroundImage!,
                                      size: sz as any,
                                    },
                                  }))
                                }
                                className={`flex-1 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                                  draft.backgroundImage?.size === sz
                                    ? 'bg-stone-900 text-white'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                              >
                                {sz}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Opacity Slider */}
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-stone-700">Image Opacity</span>
                          <span className="font-mono text-stone-500">
                            {draft.backgroundImage.opacity}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={100}
                          value={draft.backgroundImage.opacity}
                          onChange={(e) =>
                            handleUpdateDraft((prev) => ({
                              ...prev,
                              backgroundImage: {
                                ...prev.backgroundImage!,
                                opacity: Number(e.target.value),
                              },
                            }))
                          }
                          className="w-full accent-stone-900 cursor-pointer"
                        />
                      </div>

                      {/* Blur Slider */}
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-stone-700">Soft Focus Blur</span>
                          <span className="font-mono text-stone-500">
                            {draft.backgroundImage.blur}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={20}
                          value={draft.backgroundImage.blur}
                          onChange={(e) =>
                            handleUpdateDraft((prev) => ({
                              ...prev,
                              backgroundImage: {
                                ...prev.backgroundImage!,
                                blur: Number(e.target.value),
                              },
                            }))
                          }
                          className="w-full accent-stone-900 cursor-pointer"
                        />
                      </div>

                      {/* Translucent Readability Overlay */}
                      <div className="pt-2 border-t border-stone-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-stone-800">
                              Translucent Readability Overlay
                            </span>
                            <p className="text-[11px] text-stone-400">
                              Protects schedule readability above busy visuals
                            </p>
                          </div>

                          <div className="flex gap-1">
                            {[
                              { id: 'auto', label: 'Auto' },
                              { id: 'dark', label: 'Dark' },
                              { id: 'light', label: 'Light' },
                            ].map((ov) => (
                              <button
                                key={ov.id}
                                onClick={() =>
                                  handleUpdateDraft((prev) => ({
                                    ...prev,
                                    backgroundImage: {
                                      ...prev.backgroundImage!,
                                      overlayType: ov.id as any,
                                    },
                                  }))
                                }
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                  draft.backgroundImage?.overlayType === ov.id
                                    ? 'bg-stone-900 text-white'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                              >
                                {ov.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-stone-700">Overlay Tint Intensity</span>
                            <span className="font-mono text-stone-500">
                              {draft.backgroundImage.overlayOpacity}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={90}
                            value={draft.backgroundImage.overlayOpacity}
                            onChange={(e) =>
                              handleUpdateDraft((prev) => ({
                                ...prev,
                                backgroundImage: {
                                  ...prev.backgroundImage!,
                                  overlayOpacity: Number(e.target.value),
                                },
                              }))
                            }
                            className="w-full accent-stone-900 cursor-pointer"
                          />
                        </div>

                        {/* Readability Guard Checkbox */}
                        <label className="flex items-center gap-2 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={draft.backgroundImage.protectReadability}
                            onChange={(e) =>
                              handleUpdateDraft((prev) => ({
                                ...prev,
                                backgroundImage: {
                                  ...prev.backgroundImage!,
                                  protectReadability: e.target.checked,
                                },
                              }))
                            }
                            className="w-4 h-4 rounded text-stone-900 focus:ring-stone-900 cursor-pointer"
                          />
                          <span className="text-xs font-bold text-stone-800">
                            Always safeguard text contrast (Recommended)
                          </span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                      Currently using solid background. Select an aesthetic preset below or upload your own image.
                    </div>
                  )}

                  {/* AESTHETIC WALLPAPER PRESETS */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-stone-500 mb-2.5">
                      Aesthetic Preset Wallpapers
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {AESTHETIC_WALLPAPER_PRESETS.map((wp) => (
                        <button
                          key={wp.id}
                          onClick={() => handleSelectWallpaperPreset(wp.url, wp.recommendedTheme)}
                          className="group relative h-22 rounded-2xl overflow-hidden border border-stone-200 hover:border-stone-400 text-left transition-all cursor-pointer shadow-2xs"
                        >
                          <img
                            src={wp.url}
                            alt={wp.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2 flex flex-col justify-end">
                            <span className="text-[10px] text-stone-300 font-medium">{wp.category}</span>
                            <span className="text-xs font-bold text-white truncate">{wp.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- SECTION: TYPOGRAPHY ---------------- */}
              {activeTab === 'typography' && (
                <div className="space-y-6">
                  {/* FONT FAMILY */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-stone-500 mb-2.5">
                      Font Family
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { key: 'DM Sans', sample: 'The quick brown fox', desc: 'Warm, balanced & natural' },
                        { key: 'Inter', sample: 'The quick brown fox', desc: 'Precise & modern interface' },
                        { key: 'Plus Jakarta Sans', sample: 'The quick brown fox', desc: 'Soft, contemporary curves' },
                        { key: 'Manrope', sample: 'The quick brown fox', desc: 'Geometric, structured clarity' },
                        { key: 'Geist', sample: 'The quick brown fox', desc: 'Minimalist editorial feel' },
                      ].map((font) => (
                        <button
                          key={font.key}
                          onClick={() =>
                            handleUpdateDraft((prev) => ({
                              ...prev,
                              typography: {
                                ...prev.typography,
                                fontFamily: font.key as FontFamilyType,
                              },
                            }))
                          }
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            draft.typography.fontFamily === font.key
                              ? 'border-stone-900 bg-stone-50 ring-2 ring-stone-900/10'
                              : 'border-stone-200 bg-white hover:border-stone-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-stone-900">{font.key}</span>
                            {draft.typography.fontFamily === font.key && (
                              <Check className="w-4 h-4 text-emerald-600" />
                            )}
                          </div>
                          <p className="text-xs text-stone-500">{font.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* FONT SCALE */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-stone-500 mb-2.5">
                      Font Size Scale
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'compact', label: 'Compact (Dense)' },
                        { key: 'normal', label: 'Default (Balanced)' },
                        { key: 'large', label: 'Large (Airy)' },
                      ].map((scale) => (
                        <button
                          key={scale.key}
                          onClick={() =>
                            handleUpdateDraft((prev) => ({
                              ...prev,
                              typography: {
                                ...prev.typography,
                                fontSizeScale: scale.key as FontSizeScaleType,
                              },
                            }))
                          }
                          className={`p-3 rounded-2xl border text-center text-xs font-bold transition-all cursor-pointer ${
                            draft.typography.fontSizeScale === scale.key
                              ? 'border-stone-900 bg-stone-900 text-white'
                              : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          {scale.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SPACING DENSITY */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-stone-500 mb-2.5">
                      Information Density
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          key: 'comfortable',
                          label: 'Comfortable',
                          desc: 'Spacious journal layout with breathing room',
                        },
                        {
                          key: 'compact',
                          label: 'Compact',
                          desc: 'Denser task cards and tighter list pacing',
                        },
                      ].map((density) => (
                        <button
                          key={density.key}
                          onClick={() =>
                            handleUpdateDraft((prev) => ({
                              ...prev,
                              typography: {
                                ...prev.typography,
                                spacingDensity: density.key as SpacingDensityType,
                              },
                            }))
                          }
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            draft.typography.spacingDensity === density.key
                              ? 'border-stone-900 bg-stone-50 ring-2 ring-stone-900/10'
                              : 'border-stone-200 bg-white hover:border-stone-300'
                          }`}
                        >
                          <span className="text-xs font-bold text-stone-900 block mb-0.5">
                            {density.label}
                          </span>
                          <span className="text-[11px] text-stone-500">{density.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- SECTION: CARDS & BORDERS ---------------- */}
              {activeTab === 'cards' && (
                <div className="space-y-6">
                  {/* CARD STYLES */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-stone-500 mb-2.5">
                      Card Appearance
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          key: 'minimal',
                          name: 'Minimal',
                          desc: 'Simple flat cards with clean 1px hairline border',
                        },
                        {
                          key: 'soft',
                          name: 'Soft',
                          desc: 'Rounded cards with gentle, delicate drop shadows',
                        },
                        {
                          key: 'glass',
                          name: 'Glass',
                          desc: 'Semi-transparent frosted glass with backdrop blur',
                        },
                        {
                          key: 'journal',
                          name: 'Journal',
                          desc: 'Warm paper texture feel with refined borders',
                        },
                        {
                          key: 'dark',
                          name: 'Dark',
                          desc: 'Deep dark translucent cards for evening focus',
                        },
                      ].map((style) => (
                        <button
                          key={style.key}
                          onClick={() =>
                            handleUpdateDraft((prev) => ({
                              ...prev,
                              cardStyle: style.key as CardStyleType,
                            }))
                          }
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            draft.cardStyle === style.key
                              ? 'border-stone-900 bg-stone-50 ring-2 ring-stone-900/10'
                              : 'border-stone-200 bg-white hover:border-stone-300'
                          }`}
                        >
                          <span className="text-xs font-bold text-stone-900 block mb-1">
                            {style.name}
                          </span>
                          <span className="text-[11px] text-stone-500 leading-relaxed">
                            {style.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CORNER RADIUS */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-stone-500 mb-2.5">
                      Corner Radius
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { key: 'sharp', label: 'Sharp (6px)' },
                        { key: 'medium', label: 'Medium (12px)' },
                        { key: 'curved', label: 'Curved (18px)' },
                        { key: 'pill', label: 'Pill (24px)' },
                      ].map((rad) => (
                        <button
                          key={rad.key}
                          onClick={() =>
                            handleUpdateDraft((prev) => ({
                              ...prev,
                              borderRadius: rad.key as BorderRadiusType,
                            }))
                          }
                          className={`py-2 px-1 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                            draft.borderRadius === rad.key
                              ? 'border-stone-900 bg-stone-900 text-white'
                              : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          {rad.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- SECTION: EFFECTS ---------------- */}
              {activeTab === 'effects' && (
                <div className="space-y-6">
                  {/* SUBTLE GRADIENT */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-stone-500 mb-2.5">
                      Ambient Atmosphere Gradient
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { key: 'none', label: 'None (Clean)' },
                        { key: 'subtle_warm', label: 'Subtle Warm Amber' },
                        { key: 'subtle_cool', label: 'Subtle Cool Teal' },
                        { key: 'dusk', label: 'Dusk Violet Glow' },
                        { key: 'aurora', label: 'Aurora Emerald' },
                      ].map((grad) => (
                        <button
                          key={grad.key}
                          onClick={() =>
                            handleUpdateDraft((prev) => ({
                              ...prev,
                              backgroundEffects: {
                                ...prev.backgroundEffects,
                                gradient: grad.key as any,
                              },
                            }))
                          }
                          className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                            draft.backgroundEffects.gradient === grad.key
                              ? 'border-stone-900 bg-stone-900 text-white'
                              : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          {grad.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* GRAIN & VIGNETTE TOGGLES */}
                  <div className="space-y-3">
                    <label className="block text-xs font-black uppercase tracking-wider text-stone-500">
                      Subtle Visual Textures
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/80 cursor-pointer">
                      <div>
                        <span className="text-xs font-bold text-stone-900 block">
                          Paper Grain / Noise Texture
                        </span>
                        <span className="text-[11px] text-stone-500">
                          Adds an organic, matte tactile feeling to the canvas
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={draft.backgroundEffects.grain}
                        onChange={(e) =>
                          handleUpdateDraft((prev) => ({
                            ...prev,
                            backgroundEffects: {
                              ...prev.backgroundEffects,
                              grain: e.target.checked,
                            },
                          }))
                        }
                        className="w-4 h-4 rounded text-stone-900 focus:ring-stone-900 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/80 cursor-pointer">
                      <div>
                        <span className="text-xs font-bold text-stone-900 block">
                          Cinematic Vignette
                        </span>
                        <span className="text-[11px] text-stone-500">
                          Gently darkens extreme outer edges to draw focus inward
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={draft.backgroundEffects.vignette}
                        onChange={(e) =>
                          handleUpdateDraft((prev) => ({
                            ...prev,
                            backgroundEffects: {
                              ...prev.backgroundEffects,
                              vignette: e.target.checked,
                            },
                          }))
                        }
                        className="w-4 h-4 rounded text-stone-900 focus:ring-stone-900 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* ---------------- SECTION: SAVED THEMES & EXPORT ---------------- */}
              {activeTab === 'saved' && (
                <div className="space-y-6">
                  {/* SAVE CURRENT THEME */}
                  <div className="p-4 rounded-3xl bg-stone-50 border border-stone-200/90 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-stone-500">
                      Save Current Configuration
                    </h4>
                    <p className="text-xs text-stone-500">
                      Give your custom palette, background, and fonts a name to switch back to it anytime.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customThemeName}
                        onChange={(e) => setCustomThemeName(e.target.value)}
                        placeholder="e.g. September Reset, Late Night Study..."
                        className="flex-1 px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-semibold focus:outline-hidden focus:border-stone-900"
                      />
                      <button
                        onClick={handleSaveCurrentTheme}
                        className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Theme</span>
                      </button>
                    </div>
                  </div>

                  {/* USER'S SAVED THEMES LIST */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-stone-500 mb-2.5">
                      Your Custom Saved Themes ({savedThemes.length})
                    </label>

                    {savedThemes.length === 0 ? (
                      <div className="p-4 rounded-2xl border border-dashed border-stone-200 text-center text-xs text-stone-400">
                        No saved custom themes yet. Create one above!
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {savedThemes.map((st) => (
                          <div
                            key={st.id}
                            className="flex items-center justify-between p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                                style={{ backgroundColor: st.colors.accent }}
                              />
                              <div>
                                <span className="text-xs font-bold text-stone-900 block">
                                  {st.name}
                                </span>
                                <span className="text-[10px] text-stone-400">
                                  {st.typography.fontFamily} · {st.cardStyle}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setDraft(st);
                                  onSaveTheme(st);
                                  showNotification(`Loaded theme "${st.name}"`);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-800 transition-colors cursor-pointer"
                              >
                                Apply
                              </button>
                              <button
                                onClick={() => {
                                  onDeleteCustomTheme(st.id);
                                  showNotification(`Deleted "${st.name}"`);
                                }}
                                className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                                title="Delete saved theme"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* EXPORT / IMPORT THEME */}
                  <div className="p-4 rounded-3xl bg-stone-50 border border-stone-200/90 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-stone-500">
                      Export / Import Theme
                    </h4>
                    <p className="text-xs text-stone-500">
                      Share your theme with friends or back it up as clean JSON.
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleExportThemeJson}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-xs font-bold text-stone-800 cursor-pointer shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export JSON</span>
                      </button>

                      <button
                        onClick={handleCopyThemeJson}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-xs font-bold text-stone-800 cursor-pointer shadow-2xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy to Clipboard</span>
                      </button>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => setShowImportBox((prev) => !prev)}
                        className="text-xs font-bold text-stone-700 hover:text-stone-900 cursor-pointer flex items-center gap-1"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{showImportBox ? 'Cancel import' : 'Import Theme from JSON...'}</span>
                      </button>

                      {showImportBox && (
                        <div className="mt-3 space-y-2">
                          <textarea
                            rows={4}
                            value={importJsonText}
                            onChange={(e) => setImportJsonText(e.target.value)}
                            placeholder="Paste exported Theme JSON here..."
                            className="w-full p-2.5 rounded-xl bg-white border border-stone-300 font-mono text-[11px] focus:outline-hidden focus:border-stone-900"
                          />
                          <button
                            onClick={() => handleImportJson(importJsonText)}
                            className="px-4 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer"
                          >
                            Apply Imported Theme
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: REAL-TIME SIMULATED DASHBOARD PREVIEW */}
          <div className="flex flex-col min-h-0 bg-stone-100/50 p-5 sm:p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-stone-500" />
                <span className="text-xs font-black uppercase tracking-wider text-stone-500">
                  Live Atmosphere Preview
                </span>
              </div>
              <span className="text-[11px] font-bold text-stone-400">
                Functional Hierarchy Preserved
              </span>
            </div>

            {/* LIVE SIMULATED PREVIEW CONTAINER */}
            <div
              className="flex-1 rounded-3xl p-5 border relative overflow-hidden transition-all duration-200 flex flex-col justify-between shadow-sm min-h-[420px]"
              style={{
                backgroundColor: draft.colors.background,
                color: draft.colors.text,
                borderColor: draft.colors.cardBorder,
                fontFamily:
                  draft.typography.fontFamily === 'Inter'
                    ? 'Inter, sans-serif'
                    : draft.typography.fontFamily === 'Manrope'
                    ? 'Manrope, sans-serif'
                    : draft.typography.fontFamily === 'Plus Jakarta Sans'
                    ? '"Plus Jakarta Sans", sans-serif'
                    : '"DM Sans", sans-serif',
              }}
            >
              {/* Optional Simulated Background Image Layer */}
              {draft.backgroundImage && (
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity"
                  style={{
                    backgroundImage: `url(${draft.backgroundImage.url})`,
                    backgroundPosition: draft.backgroundImage.position,
                    backgroundSize: draft.backgroundImage.size,
                    opacity: draft.backgroundImage.opacity / 100,
                    filter: `blur(${draft.backgroundImage.blur}px)`,
                  }}
                />
              )}

              {/* Translucent Readability Overlay */}
              {draft.backgroundImage && (
                <div
                  className="absolute inset-0 pointer-events-none transition-colors"
                  style={{
                    backgroundColor:
                      draft.backgroundImage.overlayType === 'dark' ||
                      (draft.backgroundImage.overlayType === 'auto' &&
                        draft.colors.background.toLowerCase() < '#777777')
                        ? '#000000'
                        : '#ffffff',
                    opacity:
                      draft.backgroundImage.protectReadability
                        ? Math.max(0.35, draft.backgroundImage.overlayOpacity / 100)
                        : draft.backgroundImage.overlayOpacity / 100,
                  }}
                />
              )}

              {/* Simulated Ambient Gradient */}
              {draft.backgroundEffects.gradient !== 'none' && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
                  style={{
                    background:
                      draft.backgroundEffects.gradient === 'subtle_warm'
                        ? 'radial-gradient(circle at top right, #fed7aa, transparent 70%)'
                        : draft.backgroundEffects.gradient === 'subtle_cool'
                        ? 'radial-gradient(circle at top right, #bae6fd, transparent 70%)'
                        : draft.backgroundEffects.gradient === 'dusk'
                        ? 'radial-gradient(circle at bottom left, #c4b5fd, transparent 70%)'
                        : 'radial-gradient(circle at top, #a7f3d0, transparent 70%)',
                  }}
                />
              )}

              {/* SIMULATED CONTENT (Z-10) */}
              <div className="relative z-10 space-y-4">
                {/* Simulated Header Clock & Date */}
                <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black tracking-tight" style={{ color: draft.colors.text }}>
                      flow
                    </span>
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: draft.colors.accent }}
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black font-mono leading-none block">
                      10:45 AM
                    </span>
                    <span className="text-[10px] opacity-70">Thursday, Sep 3</span>
                  </div>
                </div>

                {/* Simulated NOW Card (Level 1 Emphasis) */}
                <div
                  className="p-4 rounded-2xl border transition-all"
                  style={{
                    backgroundColor:
                      draft.cardStyle === 'glass'
                        ? `${draft.colors.card}b3`
                        : draft.cardStyle === 'dark'
                        ? '#181b24'
                        : draft.colors.card,
                    borderColor: draft.colors.cardBorder,
                    borderRadius: getBorderRadiusValue(draft.borderRadius),
                    boxShadow:
                      draft.cardStyle === 'soft'
                        ? '0 4px 12px -2px rgba(0,0,0,0.06)'
                        : draft.cardStyle === 'glass'
                        ? '0 8px 24px -4px rgba(0,0,0,0.08)'
                        : 'none',
                    backdropFilter: draft.cardStyle === 'glass' ? 'blur(12px)' : 'none',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md text-white shadow-2xs"
                      style={{ backgroundColor: draft.colors.accent }}
                    >
                      NOW TARGET
                    </span>
                    <span className="text-[11px] font-mono opacity-80">10:30 AM – 11:30 AM</span>
                  </div>

                  <h5 className="text-sm font-bold leading-snug mb-1" style={{ color: draft.colors.text }}>
                    Review psychology lecture notes & flashcards
                  </h5>

                  <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-black/5 dark:border-white/10">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: `${draft.categoryColors.academic}20`,
                        color: draft.categoryColors.academic,
                        border: `1px solid ${draft.categoryColors.academic}40`,
                      }}
                    >
                      🧠 Academic
                    </span>

                    <button
                      className="px-3 py-1 rounded-xl text-white text-xs font-bold shadow-xs cursor-default"
                      style={{ backgroundColor: draft.colors.accent }}
                    >
                      Start Focus
                    </button>
                  </div>
                </div>

                {/* Simulated Today's Progress Bar */}
                <div
                  className="p-3.5 rounded-2xl border"
                  style={{
                    backgroundColor: draft.colors.card,
                    borderColor: draft.colors.cardBorder,
                    borderRadius: getBorderRadiusValue(draft.borderRadius),
                  }}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span style={{ color: draft.colors.text }}>Today's Progress</span>
                    <span className="font-mono text-[11px]" style={{ color: draft.colors.accent }}>
                      3 / 7 done (43%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: '43%',
                        backgroundColor: draft.colors.accent,
                      }}
                    />
                  </div>
                </div>

                {/* Simulated NEXT Card */}
                <div
                  className="p-3 rounded-2xl border flex items-center justify-between"
                  style={{
                    backgroundColor: draft.colors.card,
                    borderColor: draft.colors.cardBorder,
                    borderRadius: getBorderRadiusValue(draft.borderRadius),
                  }}
                >
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 block">
                      UP NEXT
                    </span>
                    <span className="text-xs font-bold" style={{ color: draft.colors.text }}>
                      💻 Python variables & loops practice
                    </span>
                  </div>
                  <span className="text-[11px] font-mono opacity-70">11:45 AM</span>
                </div>
              </div>

              {/* PREVIEW FOOTER */}
              <div className="relative z-10 pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] opacity-70">
                <span>Theme: <strong>{draft.name}</strong></span>
                <span>Font: {draft.typography.fontFamily}</span>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 border-t border-stone-200/80 flex items-center justify-between bg-stone-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleApplyPreset('sage')}
              className="text-xs font-bold text-stone-500 hover:text-stone-900 cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to default Sage</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
