import React from 'react';
import { Sparkles, MessageCircleHeart } from 'lucide-react';
import { Task, ScheduleResult, EnergyLevel } from '../types';
import { getSupportiveFriendMessage } from '../utils/personality';

interface MotivationalBannerProps {
  tasks: Task[];
  scheduleResult: ScheduleResult | null;
  userEnergy: EnergyLevel;
}

export const MotivationalBanner: React.FC<MotivationalBannerProps> = ({
  tasks,
  scheduleResult,
  userEnergy,
}) => {
  const voice = getSupportiveFriendMessage(tasks, scheduleResult, userEnergy);

  return (
    <div
      id="card-motivational-banner"
      className={`rounded-3xl p-4 sm:p-5 border ${voice.borderColor} bg-gradient-to-r ${voice.bgGradient} shadow-2xs relative overflow-hidden transition-all`}
    >
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-8 h-8 rounded-2xl bg-white/90 shadow-2xs flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
          <MessageCircleHeart className="w-4 h-4 text-rose-500" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-500">
              {voice.author}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/80 border border-stone-200/80 text-stone-700">
              {voice.tag}
            </span>
          </div>
          <p className={`text-xs sm:text-sm font-bold ${voice.textColor} leading-snug`}>
            "{voice.quote}"
          </p>
        </div>
      </div>
    </div>
  );
};
