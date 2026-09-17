import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Clock,
  CheckCircle2,
  Calendar,
  Compass,
  LifeBuoy,
  Volume2,
  GripVertical,
  ArrowRight,
  Zap,
  Target,
  Coffee,
  HelpCircle,
  ImageIcon,
  Layers,
  ShieldCheck,
  Palette,
  Keyboard,
  Download,
  RefreshCw,
  Heart,
  Maximize2,
} from 'lucide-react';
import { playRelaxingClick, playCompletionDing, playTabSound } from '../utils/sound';

interface BeginnerManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

type GuideChapter =
  | 'scratch'
  | 'vision'
  | 'horizons'
  | 'timeline'
  | 'rescue'
  | 'shortcuts';

export const BeginnerManualModal: React.FC<BeginnerManualModalProps> = ({
  isOpen,
  onClose,
  userName = 'Nat',
}) => {
  const [activeChapter, setActiveChapter] = useState<GuideChapter>('scratch');

  const handleClose = () => {
    playCompletionDing();
    onClose();
  };

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTabChange = (chapter: GuideChapter) => {
    playTabSound();
    setActiveChapter(chapter);
  };

  return (
    <div
      id="modal-beginner-manual"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-stone-950/75 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-stone-200/90 dark:border-stone-800 flex items-center justify-between bg-gradient-to-r from-amber-50/90 via-stone-50 to-orange-50/60 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-300 dark:border-amber-700/60 flex items-center justify-center text-amber-800 dark:text-amber-300 shadow-2xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                  Flow Master Manual
                </h2>
                <span className="text-[10px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-200/90 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-800">
                  From Scratch Guide
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Welcome, {userName}! A complete guide from empty slate to calm, visionary focus.
              </p>
            </div>
          </div>

          <button
            id="btn-close-manual"
            type="button"
            onClick={handleClose}
            className="p-2.5 rounded-2xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="Close Manual (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Horizontal Navigation Chapters Bar */}
        <div className="flex items-center gap-1 px-4 sm:px-6 py-2.5 border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/60 overflow-x-auto no-scrollbar text-xs font-bold">
          <button
            type="button"
            onClick={() => handleTabChange('scratch')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeChapter === 'scratch'
                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
            <span>1. Start From Scratch</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('vision')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeChapter === 'vision'
                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
            <span>2. Vision Board & Big Picture</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('horizons')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeChapter === 'horizons'
                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span>3. Month & Week Planning</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('timeline')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeChapter === 'timeline'
                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>4. Draggable Daily Timeline</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('rescue')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeChapter === 'rescue'
                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5 text-amber-400" />
            <span>5. Companion Tools & Rescue</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('shortcuts')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeChapter === 'shortcuts'
                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5 text-sky-400" />
            <span>6. Sounds & Shortcuts</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-stone-700 dark:text-stone-300">
          {/* CHAPTER 1: START FROM SCRATCH */}
          {activeChapter === 'scratch' && (
            <div className="space-y-6">
              {/* Introduction Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-100/40 to-orange-500/10 dark:from-amber-950/40 dark:via-stone-900 dark:to-stone-900 border border-amber-200/90 dark:border-amber-800/60 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌱</span>
                  <h3 className="text-base font-black text-stone-900 dark:text-stone-100">
                    The Capacity-First Philosophy: Unlearning the "Endless To-Do List"
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  Traditional to-do apps are endless scrolls of guilt. You add 30 tasks, accomplish 5, and go to bed feeling like a failure. Flow treats <strong>time as a physical container</strong>. You cannot pour 10 gallons of water into a 3-gallon bucket. Flow protects your lunch, schedules breathing room between tasks, and shapes a realistic day you can actually finish with pride.
                </p>
              </div>

              {/* 3 Steps from Empty Slate */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  Your First 10 Minutes: A 3-Step Routine
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Step 1 */}
                  <div className="p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-800/70 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-mono font-bold text-xs flex items-center justify-center">
                        1
                      </span>
                      <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        The Quick Brain Dump
                      </h5>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                      Click <strong>Capture (N)</strong> or the plus icon. Dump anything weighing on your mind: emails, project milestones, grocery stops, or study sessions. Assign a duration (15m, 30m, 45m).
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-800/70 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-mono font-bold text-xs flex items-center justify-center">
                        2
                      </span>
                      <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        Timeline Sequencing
                      </h5>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                      Flow structures your day automatically! It puts Priority 1 items early, preserves lunch, and gives you draggable handles to customize the sequence to your mood.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-800/70 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-mono font-bold text-xs flex items-center justify-center">
                        3
                      </span>
                      <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        Execute via NOW Card
                      </h5>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                      Ignore the whole list. Check the dark <strong>NOW</strong> card at the top. Click <strong>Focus</strong> to start your timer, and enjoy the soothing completion chime when you finish.
                    </p>
                  </div>
                </div>
              </div>

              {/* Guilt-Free Rule */}
              <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 flex items-start gap-3">
                <Coffee className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    The Golden Rule of Pacing
                  </h5>
                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                    If Flow flags your day as <em>Overloaded</em>, do not rush. Click <strong>Rescue Day</strong> or defer secondary tasks to tomorrow. Protect your health and mental clarity first.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 2: VISION BOARD & BIG PICTURE */}
          {activeChapter === 'vision' && (
            <div className="space-y-6">
              {/* Overview */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-rose-500/10 via-stone-50 to-purple-500/10 dark:from-rose-950/40 dark:via-stone-900 dark:to-stone-900 border border-rose-200/80 dark:border-rose-900/60 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <h3 className="text-base font-black text-stone-900 dark:text-stone-100">
                    Why the Vision Board is the Heart of Flow
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  Daily tasks without a vision become a joyless grind. The <strong>Vision Board</strong> and <strong>Big Picture</strong> horizons ground your daily schedule in the future you are intentionally creating. Priming your mind with visual affirmations for 60 seconds each morning boosts motivation by over 40%.
                </p>
              </div>

              {/* Vision Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/70 space-y-2">
                  <h5 className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <ImageIcon className="w-4 h-4" />
                    <span>Visual Manifestation Cards</span>
                  </h5>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    Add inspiring images for your physical health, dream projects, tranquil living spaces, and travel. Include an empowering <strong>Affirmation</strong> and target dates.
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/70 space-y-2">
                  <h5 className="text-xs font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Palette className="w-4 h-4" />
                    <span>4 Flexible Display Layouts</span>
                  </h5>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    Click the <strong>Layout Settings</strong> icon in the Vision tab to toggle between <strong>Masonry</strong> (Pinterest waterfall), <strong>Clean Grid</strong>, <strong>Artistic Mosaic</strong>, or <strong>Editorial Journal</strong>.
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/70 space-y-2">
                  <h5 className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Target className="w-4 h-4" />
                    <span>Custom Vision Categories</span>
                  </h5>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    Organize your visions into custom pillars: <em>Career & Craft, Mind & Vitality, Creative Arts, Financial Abundance, Exploration, and Serenity</em>. Filter anytime with top pills.
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/70 space-y-2">
                  <h5 className="text-xs font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Compass className="w-4 h-4" />
                    <span>Big Picture 1/3/5-Year Goals</span>
                  </h5>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    Switch to the <strong>Big Picture</strong> tab in the header. Break multi-year ambitions down into active quarterly milestones that cascade directly into your monthly and weekly plans.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 3: MONTH & WEEK PLANNING */}
          {activeChapter === 'horizons' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-teal-500/10 via-stone-50 to-sky-500/10 dark:from-teal-950/40 dark:via-stone-900 dark:to-stone-900 border border-teal-200/80 dark:border-teal-900/60 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏔️</span>
                  <h3 className="text-base font-black text-stone-900 dark:text-stone-100">
                    The Nested Horizon Hierarchy
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  How does an abstract dream become Tuesday afternoon's work? Flow uses <strong>Nested Horizons</strong>:
                  <br /><strong>Vision</strong> (Someday) → <strong>Big Picture Goals</strong> (This Year) → <strong>Month Plan</strong> (This Month) → <strong>Week Plan</strong> (This Week) → <strong>Today's Timeline</strong> (Right Now).
                </p>
              </div>

              {/* Month Plan Breakdown */}
              <div className="p-4.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>The Monthly View: Setting the Theme & 3 Anchors</span>
                  </h5>
                  <span className="text-[10px] font-mono font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-full">
                    30-Day Focus
                  </span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  At the beginning of each month, define your <strong>Overarching Theme</strong> (e.g., <em>"Rest & Craft Foundation"</em>) and choose up to 3 non-negotiable core milestones. Any task in your backlog can be associated with your monthly anchors.
                </p>
              </div>

              {/* Weekly Plan Breakdown */}
              <div className="p-4.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>The Weekly View: Choosing Your "Big Stones"</span>
                  </h5>
                  <span className="text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                    7-Day Flow
                  </span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  In the <strong>Week</strong> tab, allocate tasks across Monday to Friday. Flow calculates daily load distribution to prevent back-to-back overloading, while leaving your weekend open for genuine leisure.
                </p>
              </div>
            </div>
          )}

          {/* CHAPTER 4: DRAGGABLE DAILY TIMELINE */}
          {activeChapter === 'timeline' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-stone-50 to-sky-500/10 dark:from-indigo-950/40 dark:via-stone-900 dark:to-stone-900 border border-indigo-200/80 dark:border-indigo-900/60 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⏳</span>
                  <h3 className="text-base font-black text-stone-900 dark:text-stone-100">
                    Interactive Scheduling: Drag, Drop & Re-anchor
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  Your day shouldn't be locked into stone. Life changes, calls run over, and inspiration strikes. Flow gives you full dynamic agency over your schedule.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/70 space-y-2">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      Draggable Activity Blocks
                    </h5>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    Hover over any activity block in the timeline and use the grip handle <strong>⠿</strong> (or the accessible up/down arrows) to drag it to a new position. Flow instantly recalculates consecutive start and finish times!
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/70 space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      Live Clock Anchor ("Starts Now")
                    </h5>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    Opening the app at 11:15 AM? Click the <strong>Starts Now</strong> button on the timeline header. Flow anchors the beginning of your active schedule to the current time, so you're never burdened by past morning hours.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/70 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      Tomorrow's Timeline & Today's Tasks
                    </h5>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    Use the <strong>Tomorrow's Timeline</strong> tab to preview and drag tomorrow's activities before you log off for the night. Use the <strong>Today's Tasks</strong> tab for a rapid checklist view with priority filters.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 5: COMPANION TOOLS & RESCUE */}
          {activeChapter === 'rescue' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-stone-50 to-rose-500/10 dark:from-amber-950/40 dark:via-stone-900 dark:to-stone-900 border border-amber-200/80 dark:border-amber-900/60 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🛡️</span>
                  <h3 className="text-base font-black text-stone-900 dark:text-stone-100">
                    Overload Protection & Cognitive Relief
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  When motivation dips or chaos strikes, Flow acts as your calm copilot to protect your peace of mind.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/70 space-y-2">
                  <h5 className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>"What Should I Do?" AI Companion</span>
                  </h5>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    Frozen by decision fatigue? Click the sparkle button. Flow evaluates your current energy level (Low/Med/High), remaining day headroom, and priorities to recommend the single best next action.
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/70 space-y-2">
                  <h5 className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <LifeBuoy className="w-4 h-4" />
                    <span>Rescue My Day (Instant Rebalance)</span>
                  </h5>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    If an emergency stole your afternoon, don't try to sprint through the evening. Hit <strong>Rescue Day</strong>: Flow keeps your top priority and safely defers lower-tier items to tomorrow without guilt.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 6: SOUNDS & SHORTCUTS */}
          {activeChapter === 'shortcuts' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-sky-500/10 via-stone-50 to-indigo-500/10 dark:from-sky-950/40 dark:via-stone-900 dark:to-stone-900 border border-sky-200/80 dark:border-sky-900/60 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎵</span>
                  <h3 className="text-base font-black text-stone-900 dark:text-stone-100">
                    Acoustic Feedback & Keyboard Power
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  Every click in Flow is synthesized live through your browser's Web Audio engine for a calm, satisfying wooden tactile response with zero lag.
                </p>
              </div>

              {/* Keyboard Shortcuts Table */}
              <div className="border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden bg-white dark:bg-stone-800/70">
                <div className="px-4 py-3 bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-900 dark:text-stone-100">
                  Keyboard Shortcuts Reference
                </div>
                <div className="divide-y divide-stone-100 dark:divide-stone-700/60 text-xs">
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-stone-600 dark:text-stone-300">Quick Capture Task</span>
                    <kbd className="px-2 py-0.5 bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-mono rounded font-bold border border-stone-200 dark:border-stone-600">
                      N
                    </kbd>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-stone-600 dark:text-stone-300">Cycle Inspiring Quotes</span>
                    <kbd className="px-2 py-0.5 bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-mono rounded font-bold border border-stone-200 dark:border-stone-600">
                      Click 🔄 on Greeting
                    </kbd>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-stone-600 dark:text-stone-300">Toggle Relaxing Sounds</span>
                    <kbd className="px-2 py-0.5 bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-mono rounded font-bold border border-stone-200 dark:border-stone-600">
                      Speaker Icon in Header
                    </kbd>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-stone-600 dark:text-stone-300">Open User Manual</span>
                    <kbd className="px-2 py-0.5 bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-mono rounded font-bold border border-stone-200 dark:border-stone-600">
                      Guide Button / Greeting
                    </kbd>
                  </div>
                </div>
              </div>

              {/* Privacy & Backups */}
              <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    100% Offline & Private Local Storage
                  </h5>
                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                    Your tasks, vision photos, and reflections never leave your browser. You can export a full JSON backup anytime from <strong>Settings → Export Backup</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-200/90 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900 flex items-center justify-between">
          <div className="text-xs text-stone-400 font-medium">
            Flow is here to help you enjoy your work and protect your rest.
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <span>Close Guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
