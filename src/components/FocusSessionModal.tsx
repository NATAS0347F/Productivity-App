import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Check, RotateCcw, Sparkles } from 'lucide-react';
import { Task } from '../types';
import { CATEGORY_CONFIG } from '../utils/categories';

interface FocusSessionModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleteTask: (taskId: number) => void;
  onRecordFocusTime?: (minutes: number) => void;
  initialMinutes?: number;
}

export const FocusSessionModal: React.FC<FocusSessionModalProps> = ({
  task,
  isOpen,
  onClose,
  onCompleteTask,
  onRecordFocusTime,
  initialMinutes = 25,
}) => {
  if (!isOpen || !task) return null;

  const [secondsRemaining, setSecondsRemaining] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    setSecondsRemaining(initialMinutes * 60);
    setIsRunning(true);
  }, [task.id, initialMinutes]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsRemaining]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalSeconds = initialMinutes * 60;
  const progressPercent = Math.min(100, Math.round(((totalSeconds - secondsRemaining) / totalSeconds) * 100));

  const handleFinish = () => {
    onCompleteTask(task.id);
    if (onRecordFocusTime) {
      const elapsed = Math.max(1, Math.round((totalSeconds - secondsRemaining) / 60));
      onRecordFocusTime(elapsed);
    }
    onClose();
  };

  const cat = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.admin;

  return (
    <div
      id="focus-session-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="focus-session-modal-content"
        className="bg-white border border-[#e7e4df] rounded-3xl shadow-2xl max-w-md w-full p-6 text-center text-[#242424]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full border ${cat.badgeBg} ${cat.badgeBorder} ${cat.badgeText} font-medium`}
          >
            {cat.emoji} {cat.label}
          </span>
          <button
            onClick={onClose}
            className="p-1 text-[#888] hover:text-[#222] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-[#1f1e1d] mb-1">{task.name}</h3>
        <p className="text-xs text-[#777] mb-6">
          Single-task focus session. Only this one thing matters right now.
        </p>

        {/* Big clean circular countdown display */}
        <div className="my-6">
          <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-[#242424] mb-3">
            {formattedTime}
          </div>
          <div className="w-48 mx-auto bg-[#eeebe5] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#242424] h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-[#888] mt-2 font-medium">
            {progressPercent}% completed
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-5 py-2.5 rounded-xl bg-[#242424] hover:bg-[#111] text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-xs"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Resume</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setSecondsRemaining(initialMinutes * 60);
              setIsRunning(false);
            }}
            className="p-2.5 rounded-xl border border-[#dedad2] hover:bg-[#faf9f6] text-[#666] transition-colors cursor-pointer"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleFinish}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>Completed</span>
          </button>
        </div>
      </div>
    </div>
  );
};
