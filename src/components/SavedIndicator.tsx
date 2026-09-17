import React from 'react';
import { Check } from 'lucide-react';

interface SavedIndicatorProps {
  lastSavedAt: number;
}

export const SavedIndicator: React.FC<SavedIndicatorProps> = ({ lastSavedAt }) => {
  return (
    <div
      id="saved-indicator"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold tracking-wide transition-all shadow-2xs"
      title="All your tasks, preferences, and progress are stored safely in local memory"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span className="flex items-center gap-1">
        <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
        <span>Saved</span>
      </span>
    </div>
  );
};
