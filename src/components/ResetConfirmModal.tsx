import React, { useState } from 'react';
import {
  X,
  RotateCcw,
  Sparkles,
  Palette,
  AlertTriangle,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAllTasks: () => void;
  onClearGoalsAndPlans: () => void;
  onResetTasksToDefault: () => void;
  onResetTheme: () => void;
  onFullReset: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onClearAllTasks,
  onClearGoalsAndPlans,
  onResetTasksToDefault,
  onResetTheme,
  onFullReset,
}) => {
  if (!isOpen) return null;

  const [confirmStep, setConfirmStep] = useState<
    'select' | 'confirm_clear' | 'confirm_goals' | 'confirm_default' | 'confirm_theme' | 'confirm_full'
  >('select');

  const handleExecute = () => {
    if (confirmStep === 'confirm_clear') {
      onClearAllTasks();
      onClose();
    } else if (confirmStep === 'confirm_goals') {
      onClearGoalsAndPlans();
      onClose();
    } else if (confirmStep === 'confirm_default') {
      onResetTasksToDefault();
      onClose();
    } else if (confirmStep === 'confirm_theme') {
      onResetTheme();
      onClose();
    } else if (confirmStep === 'confirm_full') {
      onFullReset();
      onClose();
    }
  };

  return (
    <div
      id="reset-confirm-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="reset-confirm-modal"
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold text-sm">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Reset Workspace</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Start from scratch or restore clean demo presets
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

        {/* Content */}
        <div className="p-6">
          {confirmStep === 'select' ? (
            <div className="space-y-3">
              <p className="text-xs text-stone-600 dark:text-stone-400 mb-2">
                Select how you'd like to reset your Flow workspace:
              </p>

              {/* 1. Clear All & Build from Scratch (HIGHEST USER DESIRE) */}
              <div
                onClick={() => setConfirmStep('confirm_clear')}
                className="p-4 rounded-xl border-2 border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-stone-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                        Clear All Tasks (Build From Scratch)
                      </h3>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Wipe all demo tasks and start with a completely empty canvas ready for your real schedule.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Clear Goals & Horizons */}
              <div
                onClick={() => setConfirmStep('confirm_goals')}
                className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white group-hover:text-purple-600">
                      Clear Monthly & Big Picture Goals
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Wipe all monthly commitments, active projects, and big picture goals without touching your tasks.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Restore Starter Template */}
              <div
                onClick={() => setConfirmStep('confirm_default')}
                className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white group-hover:text-blue-600">
                      Restore Starter Demo Template
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Reset back to the sample student & builder tasks to explore Flow features.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Reset Theme to Sage */}
              <div
                onClick={() => setConfirmStep('confirm_theme')}
                className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white group-hover:text-amber-600">
                      Reset Theme & Colors
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Restore the original calming Sage color scheme and reset background wallpaper.
                    </p>
                  </div>
                </div>
              </div>

              {/* 5. Full Clean Slate */}
              <div
                onClick={() => setConfirmStep('confirm_full')}
                className="p-4 rounded-xl border border-rose-200/70 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300">
                      Full Factory Clean Slate
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Clear all tasks, monthly goals, big picture goals, vision boards, reflections, and weekly plans to start 100% from ground zero.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  {confirmStep === 'confirm_clear' && 'Clear all tasks to build from scratch?'}
                  {confirmStep === 'confirm_goals' && 'Clear all monthly and big picture goals?'}
                  {confirmStep === 'confirm_default' && 'Restore starter demo template?'}
                  {confirmStep === 'confirm_theme' && 'Reset visual theme to default?'}
                  {confirmStep === 'confirm_full' && 'Perform full factory clean slate?'}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                  {confirmStep === 'confirm_clear' &&
                    'This will remove all current tasks so you have a clean slate to add your own real tasks.'}
                  {confirmStep === 'confirm_goals' &&
                    'This will clear your monthly major goals, active projects, and big picture goals so you can start with a completely fresh horizon.'}
                  {confirmStep === 'confirm_default' &&
                    'This will replace your current task list with the initial sample tasks.'}
                  {confirmStep === 'confirm_theme' &&
                    'Your theme will be reverted to the Sage preset with default fonts and styles.'}
                  {confirmStep === 'confirm_full' &&
                    'This will clear tasks, monthly goals, big picture goals, vision board items, and weekly plans for a 100% clean slate.'}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setConfirmStep('select')}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleExecute}
                  className="px-5 py-2 text-xs font-bold bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 rounded-xl shadow-xs cursor-pointer transition-all"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
