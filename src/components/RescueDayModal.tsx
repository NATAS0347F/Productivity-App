import React from 'react';
import { X, Sparkles, ShieldCheck, ArrowRight, Clock, AlertTriangle, Check } from 'lucide-react';
import { Task, CapacitySettings } from '../types';
import { calculateDayRescue } from '../utils/rescue';
import { formatMinutes } from '../utils/scheduler';
import { CATEGORY_CONFIG } from '../utils/categories';

interface RescueDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  capacity: CapacitySettings;
  onApplyRescue: (keptTaskIds: number[], movedTaskIds: number[]) => void;
}

export const RescueDayModal: React.FC<RescueDayModalProps> = ({
  isOpen,
  onClose,
  tasks,
  capacity,
  onApplyRescue,
}) => {
  if (!isOpen) return null;

  const rescue = calculateDayRescue(tasks, capacity);

  const handleConfirm = () => {
    const keptIds = rescue.keptTasks.map((t) => t.id);
    const movedIds = rescue.movedTasks.map((t) => t.id);
    onApplyRescue(keptIds, movedIds);
    onClose();
  };

  return (
    <div
      id="rescue-day-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="rescue-day-modal-content"
        className="bg-white border border-[#e7e4df] rounded-3xl shadow-2xl max-w-lg w-full p-6 text-[#242424]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#eeebe5]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🆘</span>
            <div>
              <h3 className="text-base font-bold text-[#1e1e1d]">Rescue My Day</h3>
              <p className="text-[11px] text-[#777]">
                Falling behind doesn’t mean failure. Let’s re-plan realistically.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#888] hover:text-[#222] rounded-xl hover:bg-[#f2f0ec] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reassuring Philosophy Statement */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-xs leading-relaxed mb-4">
          <p className="font-bold text-amber-900 mb-1">{rescue.message}</p>
          <p>{rescue.explanation}</p>
        </div>

        {/* Kept vs Moved Tasks Preview */}
        <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
          {/* Kept Core Tasks */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1.5">
              <span>Kept for Today ({rescue.keptTasks.length})</span>
              <span>~{formatMinutes(rescue.totalKeptMinutes)}</span>
            </div>
            <div className="space-y-1.5">
              {rescue.keptTasks.map((t) => {
                const cat = CATEGORY_CONFIG[t.category] || CATEGORY_CONFIG.academic;
                return (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 text-xs flex items-center justify-between"
                  >
                    <span className="font-bold text-emerald-950 truncate mr-2">
                      {cat.emoji} {t.name}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-800 shrink-0">
                      {formatMinutes(t.duration)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Moved to Backlog */}
          {rescue.movedTasks.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                <span>Safely Moved to Backlog ({rescue.movedTasks.length})</span>
                <span className="text-[10px] font-medium text-stone-400">Zero guilt</span>
              </div>
              <div className="space-y-1.5">
                {rescue.movedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between text-stone-600"
                  >
                    <span className="truncate mr-2">• {t.name}</span>
                    <span className="text-[11px] text-stone-400 shrink-0">
                      {formatMinutes(t.duration)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Primary Confirmation Action */}
        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#1c1917] hover:bg-black text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Check className="w-4 h-4" />
            <span>Apply realistic timetable & breathe →</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-2xl border border-stone-200 hover:bg-stone-50 text-xs font-bold text-stone-600 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
