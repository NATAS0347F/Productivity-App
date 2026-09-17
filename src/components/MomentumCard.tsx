import React from 'react';
import { Sprout, Flame } from 'lucide-react';
import { MomentumDetails } from '../utils/momentum';

interface MomentumCardProps {
  momentum: MomentumDetails;
}

export const MomentumCard: React.FC<MomentumCardProps> = ({ momentum }) => {
  return (
    <div
      id="card-momentum-compact"
      className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
          <Sprout className="w-4 h-4 text-emerald-600" />
          <span>Consistency & Pacing</span>
        </h4>

        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${momentum.badgeBg} ${momentum.badgeBorder} ${momentum.badgeText}`}
        >
          {momentum.score}
        </span>
      </div>

      <p className="text-xs text-stone-500 leading-relaxed mb-3">
        {momentum.headline} — {momentum.rationale}
      </p>

      {/* Compact Metrics Row */}
      <div className="flex items-center justify-between text-xs pt-2.5 border-t border-stone-100 text-stone-600">
        <div className="flex items-center gap-1 font-semibold">
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{momentum.actionStreakDays} day action streak</span>
        </div>

        <div className="font-mono text-stone-500">
          {momentum.weeklyActiveDays} / {momentum.weeklyDaysTotal} days active this week
        </div>
      </div>
    </div>
  );
};
