import React from 'react';
import { Sparkles, Check } from 'lucide-react';
import { WinItem } from '../types';

interface WinsSectionProps {
  wins: WinItem[];
}

export const WinsSection: React.FC<WinsSectionProps> = ({ wins }) => {
  const recentWins = wins.slice(0, 5);

  return (
    <div
      id="section-recent-wins"
      className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>Recent wins</span>
        </h4>
        {wins.length > 0 && (
          <span className="text-xs text-stone-400 font-mono">
            {wins.length} recorded
          </span>
        )}
      </div>

      {recentWins.length === 0 ? (
        <p className="text-xs text-stone-400 italic">
          Complete a task or focus session to record your first win today.
        </p>
      ) : (
        <ul className="space-y-2 text-xs">
          {recentWins.map((win) => (
            <li
              key={win.id}
              className="flex items-start gap-2 text-stone-700 leading-snug"
            >
              <span className="text-emerald-600 font-bold mt-0.5">✓</span>
              <span className="font-medium text-stone-800">{win.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
