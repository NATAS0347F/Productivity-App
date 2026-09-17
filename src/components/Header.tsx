import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Moon,
  Clock,
  Columns,
  CalendarDays,
  Settings,
  Zap,
  Plus,
  Compass,
  Palette,
  Image as ImageIcon,
  Tag,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ViewMode, UserProfile, EnergyLevel } from '../types';
import { SavedIndicator } from './SavedIndicator';
import { isSoundEnabled, toggleSound, playRelaxingClick, playTabSound } from '../utils/sound';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenWhatShouldIDo: () => void;
  onOpenReflection: () => void;
  onOpenSettings: () => void;
  onOpenThemeStudio?: () => void;
  onOpenCategories?: () => void;
  onOpenReset?: () => void;
  onQuickAdd?: () => void;
  activeTheme?: string;
  profile: UserProfile;
  onUpdateEnergy: (energy: EnergyLevel) => void;
  lastSavedAt: number;
  activeTaskCount: number;
  totalPlannedMinutes: number;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewModeChange,
  onOpenWhatShouldIDo,
  onOpenReflection,
  onOpenSettings,
  onOpenThemeStudio,
  onOpenCategories,
  onOpenReset,
  onQuickAdd,
  activeTheme,
  profile,
  onUpdateEnergy,
  lastSavedAt,
  activeTaskCount,
  totalPlannedMinutes,
}) => {
  // Live clock updating every 5 seconds for prominent time display
  const [now, setNow] = useState<Date>(new Date());
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);

  const timeString = now.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  const dateString = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const energyOptions: { key: EnergyLevel; label: string; emoji: string; color: string }[] = [
    { key: 'low', label: 'Low', emoji: '🔋', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    { key: 'medium', label: 'Medium', emoji: '⚡', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    { key: 'high', label: 'High', emoji: '🔥', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  ];

  return (
    <header id="app-header" className="pb-5 mb-6 border-b border-stone-200/90">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Left Side: Brand Logo, Saved Badge & Navigation Switcher */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            <h1
              id="brand-title"
              className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 flex items-center gap-1.5"
            >
              <span>flow</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            </h1>
            <SavedIndicator lastSavedAt={lastSavedAt} />
          </div>

          {/* View Mode Switcher (Today, Week, Month, Big Picture) */}
          <div
            id="view-mode-tabs"
            className="flex items-center p-1 rounded-xl bg-stone-100 border border-stone-200 text-xs font-semibold"
          >
            <button
              id="btn-view-today"
              onClick={() => {
                playTabSound();
                onViewModeChange('today');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'today'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Today</span>
            </button>

            <button
              id="btn-view-week"
              onClick={() => {
                playTabSound();
                onViewModeChange('week');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Week</span>
            </button>

            <button
              id="btn-view-month"
              onClick={() => {
                playTabSound();
                onViewModeChange('month');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Month</span>
            </button>

            <button
              id="btn-view-big-picture"
              onClick={() => {
                playTabSound();
                onViewModeChange('big_picture' as any);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                (viewMode as any) === 'big_picture'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Big Picture</span>
              <span className="sm:hidden">Goals</span>
            </button>

            <button
              id="btn-view-vision"
              onClick={() => {
                playTabSound();
                onViewModeChange('vision');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'vision'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Vision</span>
            </button>
          </div>

          {/* Quick Add Button */}
          {onQuickAdd && (
            <button
              onClick={onQuickAdd}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              title="Quick Capture (Press 'N')"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Capture</span>
              <kbd className="hidden md:inline-block ml-1 px-1.5 py-0.2 bg-stone-700 text-stone-200 text-[10px] rounded font-mono">
                N
              </kbd>
            </button>
          )}

          {/* Compact Energy Selector */}
          <div className="hidden md:flex items-center gap-1 bg-stone-100/90 p-0.5 rounded-xl border border-stone-200/80 text-xs">
            {energyOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => onUpdateEnergy(opt.key)}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                  profile.energyToday === opt.key
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-400 hover:text-stone-700'
                }`}
                title={`Set energy: ${opt.label}`}
              >
                <span>{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Categories Manager Trigger */}
          {onOpenCategories && (
            <button
              id="btn-open-categories"
              onClick={onOpenCategories}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 hover:text-stone-900 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title="Edit & Customise Categories"
            >
              <Tag className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden lg:inline">Categories</span>
            </button>
          )}

          {/* Theme & Visual Style Trigger */}
          {onOpenThemeStudio && (
            <button
              id="btn-open-theme-studio"
              onClick={onOpenThemeStudio}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 hover:text-stone-900 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title="Theme Studio & Aesthetics"
            >
              <Palette className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Theme</span>
            </button>
          )}

          {/* Reset Workspace Trigger */}
          {onOpenReset && (
            <button
              id="btn-open-reset"
              onClick={onOpenReset}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-stone-200 hover:border-rose-200 text-stone-700 hover:text-rose-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title="Reset or Build From Scratch"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden lg:inline">Reset</span>
            </button>
          )}

          {/* Quick reflection trigger */}
          <button
            onClick={onOpenReflection}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 hover:text-stone-900 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            title="Reflect on today"
          >
            <Moon className="w-3.5 h-3.5 text-purple-600" />
            <span>Reflect</span>
          </button>

          {/* Relaxing Sound Effects Toggle */}
          <button
            id="btn-toggle-sound"
            type="button"
            onClick={handleToggleSound}
            className={`p-2 rounded-xl border transition-colors cursor-pointer shadow-2xs flex items-center gap-1 ${
              soundOn
                ? 'bg-amber-50/90 border-amber-200 text-amber-800'
                : 'bg-white border-stone-200 text-stone-400 hover:text-stone-700 hover:bg-stone-50'
            }`}
            title={soundOn ? 'Sound Effects: Relaxing Chimes Enabled' : 'Sound Effects: Muted (Click to enable)'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-amber-600" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Settings & Backup Trigger */}
          <button
            id="btn-open-settings"
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs"
            title="Settings & Data Backup"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Right Side: VERY PROMINENT ELEGANT CURRENT TIME & DATE */}
        <div id="prominent-current-clock" className="text-left sm:text-right">
          <div className="text-2xl sm:text-4xl font-black font-mono tracking-tight text-stone-900 leading-none">
            {timeString}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-stone-500 mt-1">
            {dateString}
          </div>
        </div>
      </div>
    </header>
  );
};
