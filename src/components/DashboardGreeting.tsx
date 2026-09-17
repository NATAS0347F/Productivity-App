import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Edit2,
  Check,
  RefreshCw,
  BookOpen,
  Sun,
  Moon,
  CloudSun,
  Heart,
} from 'lucide-react';
import { UserProfile } from '../types';
import { playRelaxingClick, playTabSound } from '../utils/sound';

interface DashboardGreetingProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onOpenBeginnerManual: () => void;
}

const INSPIRING_QUOTES = [
  { text: 'ready for a great day?', emoji: '✨', advice: 'Take it one intentional step at a time.' },
  { text: 'ready to make today count?', emoji: '🎯', advice: 'Pick one priority first and protect your focus.' },
  { text: 'steady progress beats perfection every time.', emoji: '🌱', advice: 'Small consistent blocks add up to massive momentum.' },
  { text: 'one intentional step at a time.', emoji: '🪴', advice: 'You do not need to do everything at once. Just start gently.' },
  { text: 'protect your mental peace and make space for what matters.', emoji: '☕', advice: 'Guard your bandwidth like the rare asset it is.' },
  { text: "what's the one thing that will give you momentum today?", emoji: '🚀', advice: 'Conquer the hardest friction point first.' },
  { text: 'take a deep breath — today is full of possibilities.', emoji: '🌤️', advice: 'Be kind to your energy rhythms.' },
  { text: 'clarity comes from taking action, not overthinking.', emoji: '💡', advice: 'Start for just 5 minutes and let the momentum follow.' },
];

export const DashboardGreeting: React.FC<DashboardGreetingProps> = ({
  userProfile,
  onUpdateProfile,
  onOpenBeginnerManual,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userProfile.name || 'Nat');

  useEffect(() => {
    setNameInput(userProfile.name || 'Nat');
  }, [userProfile.name]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const timeFormatted = currentTime.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  const hour = currentTime.getHours();
  const timeOfDayTag =
    hour < 12
      ? { label: 'Morning Focus', icon: Sun, color: 'text-amber-800 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/60 border-amber-300/80 dark:border-amber-800/60' }
      : hour < 17
      ? { label: 'Afternoon Flow', icon: CloudSun, color: 'text-sky-800 dark:text-sky-300 bg-sky-100/90 dark:bg-sky-950/60 border-sky-300/80 dark:border-sky-800/60' }
      : { label: 'Evening Wind-down', icon: Moon, color: 'text-indigo-800 dark:text-indigo-300 bg-indigo-100/90 dark:bg-indigo-950/60 border-indigo-300/80 dark:border-indigo-800/60' };

  const rawName = userProfile.name?.trim() || 'Nat';
  const activeQuote = INSPIRING_QUOTES[quoteIndex % INSPIRING_QUOTES.length];

  const handleSaveName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = nameInput.trim() || 'Nat';
    onUpdateProfile({
      ...userProfile,
      name: trimmed,
    });
    setIsEditingName(false);
    playRelaxingClick();
  };

  const handleCycleQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % INSPIRING_QUOTES.length);
    playTabSound();
  };

  const TimeIcon = timeOfDayTag.icon;

  return (
    <div
      id="dashboard-greeting-banner"
      className="relative overflow-hidden rounded-3xl border border-amber-200/90 dark:border-amber-900/40 bg-gradient-to-br from-amber-100/80 via-amber-50/50 to-orange-100/60 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 p-6 sm:p-8 md:p-10 shadow-sm transition-all"
    >
      {/* Decorative ambient atmospheric glow backdrops */}
      <div className="absolute top-0 right-1/4 -mt-16 w-80 h-80 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-16 w-80 h-80 bg-orange-400/15 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Centralised Content Container */}
      <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center text-center">
        {/* Top Badges: Time of Day + Live Clock + Quick Manual Link */}
        <div className="flex items-center gap-2 mb-3.5 flex-wrap justify-center">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${timeOfDayTag.color}`}
          >
            <TimeIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{timeOfDayTag.label}</span>
          </span>

          <span className="text-stone-300 dark:text-stone-600 font-bold">·</span>

          <span className="text-xs font-mono font-bold text-stone-700 dark:text-stone-200 px-2.5 py-1 rounded-full bg-white/80 dark:bg-stone-800/90 border border-stone-200/80 dark:border-stone-700 shadow-2xs">
            {timeFormatted}
          </span>

          <span className="text-stone-300 dark:text-stone-600 font-bold">·</span>

          <button
            id="btn-greeting-manual"
            type="button"
            onClick={onOpenBeginnerManual}
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 dark:text-amber-200 hover:text-amber-950 bg-amber-200/70 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-900/80 px-2.5 py-1 rounded-full border border-amber-300/90 dark:border-amber-700/80 transition-colors cursor-pointer shadow-2xs"
            title="Open comprehensive user manual"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-800 dark:text-amber-300" />
            <span>Beginner's Guide</span>
          </button>
        </div>

        {/* Big Centralized Greeting with Inline Name Editor & Quote Cycler */}
        <div className="my-1.5 flex flex-col items-center justify-center w-full">
          {isEditingName ? (
            <form
              onSubmit={handleSaveName}
              className="flex items-center justify-center gap-2 flex-wrap"
            >
              <span className="text-2xl sm:text-4xl font-black text-[#1c1917] dark:text-[#f8fafc] tracking-tight">
                Hello
              </span>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your Name"
                autoFocus
                className="px-3 py-1.5 bg-white dark:bg-stone-800 border-2 border-amber-500 rounded-2xl text-xl sm:text-3xl font-black text-[#1c1917] dark:text-[#f8fafc] focus:outline-none focus:ring-4 focus:ring-amber-300/40 w-44 sm:w-56 text-center shadow-xs"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                title="Save Name"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setNameInput(rawName);
                  setIsEditingName(false);
                }}
                className="px-3 py-1.5 rounded-xl text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-stone-100 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center flex-wrap gap-x-2 gap-y-1">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#1c1917] dark:text-[#f8fafc] leading-tight">
                <span className="text-[#1c1917] dark:text-[#f8fafc]">Hello </span>
                <button
                  type="button"
                  id="btn-edit-user-name"
                  onClick={() => {
                    playRelaxingClick();
                    setIsEditingName(true);
                  }}
                  className="inline-flex items-center gap-1.5 text-[#1c1917] dark:text-[#f8fafc] hover:text-amber-800 dark:hover:text-amber-300 border-b-2 border-dashed border-amber-600/70 dark:border-amber-400 hover:border-amber-800 transition-colors group cursor-pointer"
                  title="Click to edit your name"
                >
                  <span className="font-black underline-offset-4">{rawName}</span>
                  <Edit2 className="w-4 h-4 text-amber-700 dark:text-amber-300 group-hover:text-amber-800 opacity-90 group-hover:opacity-100 transition-opacity" />
                </button>
                <span className="text-stone-400 dark:text-stone-500">, </span>
                <span className="text-[#292524] dark:text-[#f5f5f4] font-bold">
                  {activeQuote.text}
                </span>
                <span className="text-2xl sm:text-3xl ml-1 select-none inline-block align-middle">
                  {activeQuote.emoji}
                </span>
              </h1>

              {/* Inspiring Quote Cycler Button */}
              <button
                id="btn-cycle-quote"
                type="button"
                onClick={handleCycleQuote}
                className="p-2 rounded-2xl bg-white/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-200 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-white dark:hover:bg-stone-700 border border-stone-200/80 dark:border-stone-700 transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Rotate to next inspirational quote"
              >
                <RefreshCw className="w-4 h-4 transition-transform active:rotate-180 duration-300" />
              </button>
            </div>
          )}
        </div>

        {/* Centralized Curated Soothing Advice */}
        <p className="text-xs sm:text-sm text-[#44403c] dark:text-[#e7e5e4] mt-2 font-medium flex items-center justify-center gap-1.5 max-w-lg">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{activeQuote.advice}</span>
        </p>
      </div>
    </div>
  );
};
