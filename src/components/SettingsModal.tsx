import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  Settings,
  ShieldCheck,
  Trash2,
  User,
  Check,
  AlertCircle,
  HardDrive,
  Palette,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { UserProfile, Task } from '../types';
import { downloadBackupFile, importDataFromJson, STORAGE_KEYS } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  tasksCount: number;
  onReloadAllData: () => void;
  onOpenThemeStudio?: () => void;
  onOpenBeginnerManual?: () => void;
  activeThemeName?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  tasksCount,
  onReloadAllData,
  onOpenThemeStudio,
  onOpenBeginnerManual,
  activeThemeName,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(profile.name);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ ...profile, name: name.trim() || 'Nat' });
    setImportStatus({ type: 'success', message: 'Profile updated!' });
    setTimeout(() => setImportStatus(null), 3000);
  };

  const handleExport = () => {
    downloadBackupFile();
    setImportStatus({ type: 'success', message: 'Backup file exported successfully!' });
    setTimeout(() => setImportStatus(null), 3500);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importDataFromJson(content);
      if (res.success) {
        setImportStatus({ type: 'success', message: res.message });
        onReloadAllData();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setImportStatus({ type: 'error', message: res.message });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearAll = () => {
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.CAPACITY);
    localStorage.removeItem(STORAGE_KEYS.REFLECTIONS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITY);
    localStorage.removeItem(STORAGE_KEYS.WINS);
    onReloadAllData();
    setShowClearConfirm(false);
    onClose();
  };

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="settings-modal-content"
        className="bg-white border border-[#e7e4df] rounded-3xl shadow-2xl max-w-md w-full p-6 text-[#242424]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-5 border-b border-[#eeebe5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1e1e1d]">Settings & Memory</h3>
              <p className="text-[11px] text-[#777]">Backup, restore and customize Flow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#888] hover:text-[#222] rounded-xl hover:bg-[#f2f0ec] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notification Status */}
        {importStatus && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              importStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {importStatus.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}

        <div className="space-y-5">
          {/* User Profile / Greeting Name */}
          <form onSubmit={handleSaveProfile} className="p-4 rounded-2xl bg-[#faf9f6] border border-[#ece8e1]">
            <label className="block text-xs font-bold text-[#555] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#888]" />
              <span>Your Name</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nat"
                className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#dedad2] text-xs font-semibold focus:outline-hidden focus:border-[#242424]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#242424] text-white text-xs font-bold hover:bg-[#111] transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>

          {/* Beginner's Guide & Manual */}
          {onOpenBeginnerManual && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>Beginner's Guide & Manual</span>
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full uppercase font-mono">
                  Quick Tour
                </span>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                New to Flow? Learn about capacity planning, draggable timelines, single-task focus, and how to conquer overwhelming days.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBeginnerManual();
                }}
                className="w-full py-2 px-3 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 text-xs font-bold transition-colors cursor-pointer flex items-center justify-between shadow-2xs"
              >
                <span>Open User Manual</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>
            </div>
          )}

          {/* Theme & Appearance Section */}
          {onOpenThemeStudio && (
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-800" />
                  <span>Theme & Visual Style</span>
                </span>
                {activeThemeName && (
                  <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                    {activeThemeName}
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                Personalize your colors, custom background art, typography, card shapes, and aesthetic atmosphere without sacrificing schedule readability.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenThemeStudio();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-between shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-400" />
                  <span>Open Theme Studio</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>
            </div>
          )}

          {/* Persistent Memory & Backup Options */}
          <div className="p-4 rounded-2xl bg-[#f7f9fa] border border-[#e1e8eb] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#23424d] flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-[#3b7082]" />
                <span>Persistent Storage</span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                Active ({tasksCount} items)
              </span>
            </div>
            <p className="text-xs text-[#526f7a] leading-relaxed">
              Your tasks, goals, projects, schedule history, and streaks are automatically saved in your browser storage.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-stone-50 border border-[#ccd9df] text-xs font-bold text-[#1f3a44] transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
              >
                <Download className="w-3.5 h-3.5 text-[#306272]" />
                <span>Export my data</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-stone-50 border border-[#ccd9df] text-xs font-bold text-[#1f3a44] transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
              >
                <Upload className="w-3.5 h-3.5 text-[#306272]" />
                <span>Import my data</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Clear / Reset storage */}
          <div className="pt-2 border-t border-[#f0ede6] flex items-center justify-between">
            <span className="text-xs text-[#888]">Need to reset?</span>
            {showClearConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Yes, delete all
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="text-xs text-[#777] hover:text-[#333] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="text-xs font-medium text-stone-500 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear all data</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
