import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Play,
  SplitSquareVertical,
  Hourglass,
  Coffee,
  CheckCircle,
  Clock,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Task, EnergyLevel } from '../types';
import { CATEGORY_CONFIG } from '../utils/categories';
import { formatMinutes } from '../utils/scheduler';
import { generateTaskBreakdown } from '../utils/breakdown';

interface WhatShouldIDoModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  userEnergy?: EnergyLevel;
  onStartFocusSession: (task: Task, starterMinutes?: number) => void;
  onPostponeTask: (id: number) => void;
  onBreakdownTask: (id: number) => void;
}

export const WhatShouldIDoModal: React.FC<WhatShouldIDoModalProps> = ({
  isOpen,
  onClose,
  tasks,
  userEnergy = 'medium',
  onStartFocusSession,
  onPostponeTask,
  onBreakdownTask,
}) => {
  if (!isOpen) return null;

  const [tooTiredMode, setTooTiredMode] = useState(userEnergy === 'low');
  const [showSubtasks, setShowSubtasks] = useState(false);

  // Active actionable tasks only
  const activeTasks = tasks.filter((t) => !t.completed && t.type === 'task');

  // Multi-factor recommendation algorithm:
  // 1. Current time & energy
  // 2. Deadlines
  // 3. Procrastination count
  // 4. Task duration vs focus window
  let candidate: Task | null = null;
  let whyReasons: string[] = [];
  let starterAction = '';
  let suggestedMinutes = 25;

  if (tooTiredMode) {
    const lowEnergyTasks = activeTasks.filter((t) => t.energy === 'low');
    if (lowEnergyTasks.length > 0) {
      candidate = lowEnergyTasks[0];
      suggestedMinutes = Math.min(15, candidate.duration);
      whyReasons = [
        'Your energy is currently depleted (low battery mode)',
        'This task has low cognitive friction and zero intense strain',
        'Finishing it protects your consistency without causing exhaustion',
      ];
      starterAction = `Spend just ${suggestedMinutes} minutes tackling the easiest part.`;
    } else {
      candidate = null;
      whyReasons = [
        'No light tasks remain in your queue',
        'Prowling through heavy work while exhausted harms retention',
      ];
      starterAction = 'Take a 15-minute screen-free walk, stretch, or hydrate.';
    }
  } else {
    // Check for high-postponed tasks first (avoidance pattern)
    const postponedCandidate = activeTasks.find((t) => t.postponeCount >= 2);

    if (postponedCandidate) {
      candidate = postponedCandidate;
      suggestedMinutes = 15;
      whyReasons = [
        `You've postponed it ${candidate.postponeCount} times (friction pattern detected)`,
        `It is prioritized at P${candidate.priority} and needs gentle closure`,
        'Starting with a micro-version bypasses the freeze response',
      ];
      const subtasks = candidate.subtasks && candidate.subtasks.length > 0
        ? candidate.subtasks
        : generateTaskBreakdown(candidate);
      starterAction = `Start with a 15-minute review: "${subtasks[0]?.name || 'Open and review notes'}"`;
    } else {
      // Find highest leverage task (deadline + priority)
      const sorted = [...activeTasks].sort((a, b) => {
        const priorityDiff = b.priority - a.priority;
        if (priorityDiff !== 0) return priorityDiff;
        return a.duration - b.duration;
      });

      if (sorted.length > 0) {
        candidate = sorted[0];
        suggestedMinutes = Math.min(25, candidate.duration);
        whyReasons = [
          `Highest leverage action on your horizon (Priority P${candidate.priority})`,
          candidate.deadline ? `Due soon: ${candidate.deadline}` : 'Clear path with high payoff',
          `You have daylight available right now for a solid ${suggestedMinutes}-minute window`,
        ];
        starterAction = `Dive in for a focused ${suggestedMinutes}-minute sprint on the core requirements.`;
      }
    }
  }

  const handleStart = () => {
    if (candidate) {
      onStartFocusSession(candidate, suggestedMinutes);
      onClose();
    }
  };

  const handleNotNow = () => {
    if (candidate) {
      onPostponeTask(candidate.id);
      setShowSubtasks(false);
    }
  };

  const handleBreakdown = () => {
    if (candidate) {
      onBreakdownTask(candidate.id);
      setShowSubtasks(true);
    }
  };

  return (
    <div
      id="what-should-i-do-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="what-should-i-do-modal-content"
        className="bg-white border border-[#e7e4df] rounded-3xl shadow-2xl max-w-lg w-full p-6 text-[#242424]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#eeebe5]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Sparkles className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-black text-stone-900">What should I do right now?</h3>
              <p className="text-[11px] text-stone-500">
                Calibrated by energy, deadlines, and behavioral friction.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-800 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {candidate ? (
          <div className="space-y-4">
            {/* Candidate Card */}
            <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e8e4dc]">
              <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                You should work on:
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h4 className="text-xl font-black text-stone-900">
                  {candidate.name}
                </h4>

                {candidate.category && (
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full border ${
                      CATEGORY_CONFIG[candidate.category]?.badgeBg
                    } ${CATEGORY_CONFIG[candidate.category]?.badgeBorder} ${
                      CATEGORY_CONFIG[candidate.category]?.badgeText
                    } font-bold`}
                  >
                    {CATEGORY_CONFIG[candidate.category]?.emoji}{' '}
                    {CATEGORY_CONFIG[candidate.category]?.label}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-stone-500 font-semibold mt-1">
                <span>⏱️ Full: {formatMinutes(candidate.duration)}</span>
                <span>⚡ {candidate.energy} energy</span>
                {candidate.postponeCount > 0 && (
                  <span className="text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                    Postponed {candidate.postponeCount}x
                  </span>
                )}
              </div>
            </div>

            {/* Why section */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs">
              <span className="font-extrabold text-amber-950 block mb-1.5">Why?</span>
              <ul className="space-y-1 text-amber-900">
                {whyReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-600 shrink-0">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action prescription */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs">
              <span className="font-extrabold text-emerald-950 block mb-0.5">Action:</span>
              <p className="font-semibold text-emerald-900">{starterAction}</p>
            </div>

            {/* Subtasks view */}
            {showSubtasks && candidate.subtasks && (
              <div className="p-3 rounded-2xl bg-white border border-stone-200 space-y-1.5">
                <span className="text-xs font-bold text-stone-600 block mb-1">
                  Bite-sized starter steps:
                </span>
                {candidate.subtasks.map((st) => (
                  <div key={st.id} className="flex items-center justify-between text-xs text-stone-800">
                    <span>• {st.name}</span>
                    <span className="text-[11px] text-stone-400 font-mono">{st.duration}m</span>
                  </div>
                ))}
              </div>
            )}

            {/* Primary Action Button */}
            <button
              onClick={handleStart}
              className="w-full py-3.5 px-4 rounded-2xl bg-stone-900 hover:bg-black text-white font-black text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start {suggestedMinutes}-minute focus block →</span>
            </button>

            {/* Alternative options */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={handleBreakdown}
                className="py-2.5 px-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-bold text-stone-600 text-center transition-colors cursor-pointer"
              >
                Break down
              </button>

              <button
                type="button"
                onClick={handleNotNow}
                className="py-2.5 px-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-bold text-stone-600 text-center transition-colors cursor-pointer"
              >
                Not now
              </button>

              <button
                type="button"
                onClick={() => setTooTiredMode(!tooTiredMode)}
                className={`py-2.5 px-2 rounded-xl border text-xs font-bold text-center transition-colors cursor-pointer ${
                  tooTiredMode
                    ? 'bg-blue-100 border-blue-300 text-blue-900'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                }`}
              >
                {tooTiredMode ? 'Standard mode' : 'I’m too tired'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-600">
              <Coffee className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-stone-900">Rest & Recharge</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
              No pressing tasks right now or you are in recovery mode. Step away from your desk for 15 minutes.
            </p>
            <button
              onClick={onClose}
              className="mt-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-stone-900 text-white hover:bg-black transition-colors cursor-pointer"
            >
              Take a breather
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
