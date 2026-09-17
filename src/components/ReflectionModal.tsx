import React, { useState } from 'react';
import { X, Moon, Smile, Meh, Frown, BatteryLow, Check, AlertCircle } from 'lucide-react';
import { DayReflection } from '../types';

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveReflection: (reflection: DayReflection) => void;
  reflections: DayReflection[];
}

export const ReflectionModal: React.FC<ReflectionModalProps> = ({
  isOpen,
  onClose,
  onSaveReflection,
  reflections,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().slice(0, 10);
  const existingToday = reflections.find((r) => r.date === todayStr);

  const [rating, setRating] = useState<'good' | 'okay' | 'overloaded' | 'low_energy'>(
    existingToday ? existingToday.rating : 'good'
  );
  const [selectedReasons, setSelectedReasons] = useState<string[]>(
    existingToday ? existingToday.reasons : []
  );
  const [notes, setNotes] = useState(existingToday ? existingToday.notes || '' : '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const reasonOptions = [
    'Procrastination / Starting friction',
    'Underestimated time needed',
    'Unexpected event / Emergency',
    'Low cognitive energy',
    'Task was too vaguely defined',
    'Digital / Environment distractions',
    'Scheduled too many heavy items',
  ];

  const toggleReason = (reason: string) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter((r) => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveReflection({
      id: existingToday ? existingToday.id : `ref-${Date.now()}`,
      date: todayStr,
      rating,
      reasons: selectedReasons,
      notes: notes.trim(),
      timestamp: Date.now(),
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      id="reflection-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="reflection-modal-content"
        className="bg-white border border-[#e7e4df] rounded-2xl shadow-2xl max-w-lg w-full p-6 text-[#242424] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#eeebe5]">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-[#8675a9]" />
            <h3 className="text-lg font-bold text-[#1f1e1d]">End of Day Reflection</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#888] hover:text-[#222] rounded-lg hover:bg-[#f2f0ec] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#242424]">Reflection recorded</h4>
            <p className="text-xs text-[#777]">
              Flow will use this feedback to calibrate your schedule buffer tomorrow.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Rating Question */}
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-2">
                How did your day feel overall?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'good', label: 'Good & Calm', icon: <Smile className="w-4 h-4 text-emerald-600" /> },
                  { id: 'okay', label: 'Balanced', icon: <Meh className="w-4 h-4 text-amber-600" /> },
                  { id: 'overloaded', label: 'Overloaded', icon: <Frown className="w-4 h-4 text-red-500" /> },
                  { id: 'low_energy', label: 'Low Energy', icon: <BatteryLow className="w-4 h-4 text-purple-600" /> },
                ].map((item) => {
                  const active = rating === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRating(item.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        active
                          ? 'bg-[#242424] text-white border-[#242424] shadow-xs'
                          : 'bg-[#faf9f6] text-[#555] border-[#e2ded6] hover:bg-[#edeae4]'
                      }`}
                    >
                      <div className="flex justify-center mb-1">{item.icon}</div>
                      <div className="text-xs font-semibold">{item.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Blockers / Friction Question */}
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5">
                What friction or roadblocks did you encounter? (Select any)
              </label>
              <div className="space-y-1.5">
                {reasonOptions.map((reason) => {
                  const selected = selectedReasons.includes(reason);
                  return (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => toggleReason(reason)}
                      className={`w-full text-left text-xs p-2.5 rounded-xl border transition-colors flex items-center justify-between cursor-pointer ${
                        selected
                          ? 'bg-[#f4f1fa] border-[#ded4f0] text-[#3d2f5a] font-semibold'
                          : 'bg-white border-[#e6e2da] text-[#555] hover:bg-[#faf9f7]'
                      }`}
                    >
                      <span>{reason}</span>
                      {selected && <Check className="w-3.5 h-3.5 text-[#735aa0]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1">
                Any takeaway for tomorrow? (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Schedule math problem set earlier in the day when focus is fresh."
                className="w-full text-xs sm:text-sm border border-[#ddd9d2] rounded-xl p-2.5 bg-white text-[#242424] focus:outline-none focus:border-[#8b8175]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eeebe5]">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold px-3.5 py-2 rounded-xl border border-[#ddd9d2] text-[#666] hover:bg-[#faf9f6] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs font-bold px-4 py-2 rounded-xl bg-[#242424] hover:bg-[#111] text-white transition-colors cursor-pointer"
              >
                Save Reflection
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
