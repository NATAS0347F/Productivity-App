import React from 'react';
import { Clock, Battery, BatteryMedium, BatteryFull, Utensils, ShieldCheck } from 'lucide-react';
import { CapacitySettings } from '../types';
import { formatMinutes } from '../utils/scheduler';

interface CapacityFormProps {
  capacity: CapacitySettings;
  onChange: (capacity: CapacitySettings) => void;
  availableMinutes: number;
  scheduledMinutes: number;
}

export const CapacityForm: React.FC<CapacityFormProps> = ({
  capacity,
  onChange,
  availableMinutes,
  scheduledMinutes,
}) => {
  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    onChange({ ...capacity, [field]: value });
  };

  const handleLevelChange = (level: 'low' | 'medium' | 'high') => {
    onChange({ ...capacity, capacityLevel: level });
  };

  const percentUsed = Math.min(100, Math.round((scheduledMinutes / (availableMinutes || 1)) * 100));

  return (
    <div
      id="card-capacity-settings"
      className="bg-white/95 backdrop-blur-xs border border-stone-200/90 rounded-3xl p-5 sm:p-6 shadow-xs mb-6"
    >
      <div className="flex items-center justify-between mb-3.5">
        <h2 id="heading-today-capacity" className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
          <span>Today’s capacity</span>
        </h2>
        <span className="text-xs font-semibold text-stone-500">Realistic bounds</span>
      </div>

      <div className="space-y-4">
        {/* Working Hours Range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="startTime"
              className="block text-xs font-semibold text-[#54514d] mb-1 flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5 text-[#888]" />
              <span>Day starts</span>
            </label>
            <input
              id="startTime"
              type="time"
              value={capacity.startTime}
              onChange={(e) => handleTimeChange('startTime', e.target.value)}
              className="w-full text-xs sm:text-sm border border-[#ddd9d2] rounded-xl px-3 py-2 bg-white text-[#242424] focus:outline-none focus:border-[#8b8175]"
            />
          </div>

          <div>
            <label
              htmlFor="endTime"
              className="block text-xs font-semibold text-[#54514d] mb-1 flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5 text-[#888]" />
              <span>Day ends</span>
            </label>
            <input
              id="endTime"
              type="time"
              value={capacity.endTime}
              onChange={(e) => handleTimeChange('endTime', e.target.value)}
              className="w-full text-xs sm:text-sm border border-[#ddd9d2] rounded-xl px-3 py-2 bg-white text-[#242424] focus:outline-none focus:border-[#8b8175]"
            />
          </div>
        </div>

        {/* Capacity Level: Low / Medium / High */}
        <div>
          <label className="block text-xs font-semibold text-[#54514d] mb-1.5">
            Energy & bandwidth today
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                id: 'low',
                label: 'Gentle',
                desc: '2–3 key tasks',
                icon: <Battery className="w-4 h-4" />,
              },
              {
                id: 'medium',
                label: 'Normal',
                desc: '4–5 tasks',
                icon: <BatteryMedium className="w-4 h-4" />,
              },
              {
                id: 'high',
                label: 'Deep Energy',
                desc: 'Deep work & challenge',
                icon: <BatteryFull className="w-4 h-4" />,
              },
            ].map((level) => {
              const active = capacity.capacityLevel === level.id;
              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => handleLevelChange(level.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-[#242424] text-white border-[#242424] shadow-xs'
                      : 'bg-[#faf9f6] text-[#666] border-[#e4e1db] hover:bg-[#edeae4]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    {level.icon}
                    <span>{level.label}</span>
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 ${
                      active ? 'text-gray-300' : 'text-[#888]'
                    }`}
                  >
                    {level.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Protection Safeguards: Lunch & Transition Buffers */}
        <div className="p-3 bg-[#faf9f6] border border-[#e7e3db] rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-[#444] flex items-center gap-1.5 cursor-pointer">
              <Utensils className="w-3.5 h-3.5 text-[#888]" />
              <span>Reserve lunch / meal buffer (45 min)</span>
            </label>
            <input
              type="checkbox"
              checked={capacity.includeLunchBuffer}
              onChange={(e) =>
                onChange({ ...capacity, includeLunchBuffer: e.target.checked })
              }
              className="accent-[#242424] w-4 h-4 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#eeebe5]">
            <span className="font-semibold text-[#444] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>10-minute transition buffers</span>
            </span>
            <span className="text-[11px] text-[#777] font-medium">Automatic</span>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="pt-1">
          <div className="flex justify-between items-center text-xs font-medium text-[#777] mb-1.5">
            <span>Day load</span>
            <span>
              {formatMinutes(scheduledMinutes)} scheduled / {formatMinutes(availableMinutes)} total
            </span>
          </div>
          <div className="w-full bg-[#eeebe5] rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                percentUsed > 85 ? 'bg-amber-600' : 'bg-[#242424]'
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
