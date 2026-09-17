import React, { useState } from 'react';
import {
  Calendar,
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  ArrowRight,
  Repeat,
  Trophy,
  Target,
  Flame,
  CheckCircle2,
  Image as ImageIcon,
  Edit3,
  FileText,
  HelpCircle,
  Plus,
} from 'lucide-react';
import { Task, CapacitySettings, ActivityDay, WeekPlan, AestheticCover, CategoryDefinition } from '../types';
import { isTaskDueOnDay, formatMinutes } from '../utils/scheduler';
import { CATEGORY_CONFIG } from '../utils/categories';
import { CoverModal } from './CoverModal';
import { AddCalendarEventModal } from './AddCalendarEventModal';

interface WeeklyViewProps {
  tasks: Task[];
  capacity: CapacitySettings;
  activityHistory?: ActivityDay[];
  thisWeekPlan: WeekPlan;
  nextWeekPlan: WeekPlan;
  onSaveWeekPlan: (plan: WeekPlan, isNextWeek?: boolean) => void;
  onToggleTask: (id: number) => void;
  onMoveTaskToDay: (taskId: number, newDayIndex: number) => void;
  onSelectTask: (task: Task) => void;
  onOpenPlanWeek?: () => void;
  onQuickAddTask?: () => void;
  onAddTask?: (task: Omit<Task, 'id' | 'completed' | 'createdAt' | 'postponeCount'>) => void;
  categories?: CategoryDefinition[];
}

export const WeeklyView: React.FC<WeeklyViewProps> = ({
  tasks,
  capacity,
  activityHistory = [],
  thisWeekPlan,
  nextWeekPlan,
  onSaveWeekPlan,
  onToggleTask,
  onMoveTaskToDay,
  onSelectTask,
  onOpenPlanWeek,
  onQuickAddTask,
  onAddTask,
  categories = [],
}) => {
  const [isViewingNextWeek, setIsViewingNextWeek] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [targetDateForEvent, setTargetDateForEvent] = useState<string>('');

  // Active plan depending on toggle
  const currentPlan = isViewingNextWeek ? nextWeekPlan : thisWeekPlan;
  const effectiveOffset = weekOffset + (isViewingNextWeek ? 1 : 0);

  // Calculate dates for week starting from Monday
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon ...
  const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const mondayDate = new Date(today);
  mondayDate.setDate(today.getDate() + mondayOffset + effectiveOffset * 7);

  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);
    return d;
  });

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Workload and capacity calculation
  const [startH, startM] = capacity.startTime.split(':').map(Number);
  const [endH, endM] = capacity.endTime.split(':').map(Number);
  const standardDailyCapacityMins = Math.max(0, endH * 60 + endM - (startH * 60 + startM));

  // Determine tasks for each day
  const weekData = daysOfWeek.map((date, dayIdx) => {
    const jsDay = date.getDay(); // 0 = Sun, 1 = Mon, etc.
    const dateStr = date.toISOString().slice(0, 10);
    const isToday = date.toDateString() === new Date().toDateString();

    const dayTasks = tasks.filter((t) => {
      if (t.type !== 'task') return false;
      if (t.deadline === dateStr || t.scheduledDate === dateStr) return true;
      if (t.recurrence && t.recurrence !== 'none') {
        return isTaskDueOnDay(t, jsDay);
      }
      return false;
    });

    const totalMinutes = dayTasks.reduce((sum, t) => sum + (t.duration || 30), 0);
    const isOverloaded = totalMinutes > standardDailyCapacityMins && standardDailyCapacityMins > 0;

    return {
      dayIndex: dayIdx,
      dayName: dayNames[dayIdx],
      date,
      dateStr,
      isToday,
      tasks: dayTasks,
      totalMinutes,
      isOverloaded,
    };
  });

  // Flexible Tasks (Want to do, without strict dates)
  const flexibleTasks = tasks.filter(
    (t) => t.type === 'task' && !t.completed && t.intent === 'want' && !t.deadline && !t.scheduledDate
  );

  // Protected Backlog (Ideas / Someday)
  const backlogTasks = tasks.filter(
    (t) => (t.type === 'idea' || t.intent === 'someday') && !t.completed
  );

  const handleUpdateCover = (cover?: AestheticCover) => {
    const updated = { ...currentPlan, cover };
    onSaveWeekPlan(updated, isViewingNextWeek);
  };

  const handleUpdateNotes = (notes: string) => {
    const updated = { ...currentPlan, planningNotes: notes };
    onSaveWeekPlan(updated, isViewingNextWeek);
  };

  const cover = currentPlan.cover;

  return (
    <div id="weekly-view-container" className="space-y-6">
      {/* 1. WEEK THEME & AESTHETIC BANNER (Requirements 2, 3, 12) */}
      <div
        id="card-weekly-theme-banner"
        className={`bg-white/95 border border-stone-200/90 rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all ${
          cover?.displayStyle === 'subtle_bg' && cover.url ? 'bg-stone-50/90' : ''
        }`}
        style={
          cover?.displayStyle === 'subtle_bg' && cover.url
            ? {
                backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.95), rgba(255,255,255,0.85)), url(${cover.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        {/* Sleek top banner mode if cover style === 'cover' */}
        {cover?.displayStyle === 'cover' && cover.url && (
          <div className="relative -mx-5 -mt-5 sm:-mx-6 sm:-mt-6 mb-4 h-24 sm:h-28 overflow-hidden rounded-t-3xl border-b border-stone-200">
            <img
              src={cover.url}
              alt="Week Moodboard"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-3">
              {cover.caption && (
                <span className="text-[11px] font-medium text-white/90 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {cover.caption}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Small Side Image mode if cover style === 'side' (Notion style) */}
            {cover?.displayStyle === 'side' && cover.url && (
              <div
                onClick={() => setIsCoverModalOpen(true)}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-stone-200/90 shrink-0 shadow-2xs cursor-pointer group relative hover:opacity-90 transition-opacity"
                title="Click to customize moodboard image"
              >
                <img
                  src={cover.url}
                  alt="Week cover"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Edit3 className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            )}

            <div>
              {/* Planning Horizon Level Selector (This Week vs Next Week) */}
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs font-black uppercase tracking-widest text-stone-400">
                  Planning Horizon:
                </span>
                <div className="inline-flex p-0.5 rounded-xl bg-stone-100 border border-stone-200/80">
                  <button
                    onClick={() => {
                      setIsViewingNextWeek(false);
                      setWeekOffset(0);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      !isViewingNextWeek
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => {
                      setIsViewingNextWeek(true);
                      setWeekOffset(0);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isViewingNextWeek
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Next Week
                  </button>
                </div>

                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80">
                  {isViewingNextWeek ? 'Upcoming Horizon' : 'Active Execution'}
                </span>
              </div>

              {/* Theme Title & Subtitle */}
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                {currentPlan.theme || 'Focused & Sustainable Rhythm'}
              </h2>
              {currentPlan.subtitle && (
                <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                  {currentPlan.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Controls: Plan Week & Moodboard Cover */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={() => setIsCoverModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer transition-colors"
              title="Add or change visual moodboard photo"
            >
              <ImageIcon className="w-3.5 h-3.5 text-stone-500" />
              <span>{cover ? 'Change Mood' : '+ Add Moodboard'}</span>
            </button>

            {onOpenPlanWeek && (
              <button
                onClick={onOpenPlanWeek}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isViewingNextWeek ? 'Plan Next Week' : 'Plan My Week'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN PRIORITIES & PERSONAL PLANNING CANVAS ROW (Requirements 12, 13) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Priorities (1-3 Things that matter most) */}
        <div className="lg:col-span-6 bg-white/95 border border-stone-200/90 rounded-3xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
            <span className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-purple-600" />
              <span>What matters most this week</span>
            </span>
            <span className="text-[11px] font-semibold text-stone-400">1–3 Priorities</span>
          </div>

          <div className="space-y-2">
            {currentPlan.topPriorities.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-2xl bg-[#faf9f6] border border-[#eeebe5] flex items-center gap-2.5 text-xs text-stone-900 font-semibold"
              >
                <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="truncate">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Planning Canvas (Requirement 13) */}
        <div className="lg:col-span-6 bg-white/95 border border-stone-200/90 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-stone-100">
            <span className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Personal Planning Canvas</span>
            </span>
            <span className="text-[11px] font-mono text-stone-400">Lightweight context</span>
          </div>

          <textarea
            rows={3}
            value={currentPlan.planningNotes || ''}
            onChange={(e) => handleUpdateNotes(e.target.value)}
            placeholder="Write your free-form planning thoughts here (e.g. 'I want to get back into studying but not overwhelm myself...')"
            className="w-full text-xs text-stone-700 bg-stone-50 border border-stone-200/80 rounded-2xl p-3 focus:outline-none focus:bg-white focus:border-stone-900 leading-relaxed resize-none"
          />
          <div className="text-[10px] text-stone-400 mt-1.5 text-right">
            Flow uses this context to gently shape your schedules.
          </div>
        </div>
      </div>

      {/* Week Navigation Dates Strip */}
      <div className="flex items-center justify-between bg-white border border-stone-200/90 rounded-2xl px-4 py-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-stone-600" />
          <span className="font-bold text-sm text-stone-900">
            {daysOfWeek[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} –{' '}
            {daysOfWeek[6].toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setWeekOffset((prev) => prev - 1)}
            className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 cursor-pointer"
            title="Previous week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setWeekOffset(0);
              setIsViewingNextWeek(false);
            }}
            className="px-3 py-1 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={() => setWeekOffset((prev) => prev + 1)}
            className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 cursor-pointer"
            title="Next week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. 7-DAY SCHEDULE GRID (Requirement 12) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3.5">
        {weekData.map((day) => (
          <div
            key={day.dayIndex}
            className={`flex flex-col rounded-3xl border transition-all p-3.5 min-h-[320px] ${
              day.isToday
                ? 'bg-amber-50/20 border-amber-300 ring-2 ring-amber-300/40'
                : 'bg-white/90 border-stone-200/90'
            }`}
          >
            {/* Day Header */}
            <div className="pb-2.5 mb-2.5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-stone-900 block">{day.dayName}</span>
                <span className="text-[11px] text-stone-500 font-medium">
                  {day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {day.isToday && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-stone-950">
                    Today
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setTargetDateForEvent(day.date.toISOString().slice(0, 10));
                    setIsAddEventOpen(true);
                  }}
                  className="p-1 rounded-md text-stone-400 hover:text-stone-900 hover:bg-stone-200/70 transition-colors"
                  title={`Add event for ${day.dayName}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Workload Indicator */}
            <div className="mb-2.5 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-stone-500">
                {formatMinutes(day.totalMinutes)}
              </span>
              {day.isOverloaded ? (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  Heavy
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-emerald-700">Paced</span>
              )}
            </div>

            {/* Task list for this day */}
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[380px] pr-0.5">
              {day.tasks.length === 0 ? (
                <div className="h-28 flex items-center justify-center text-[11px] text-stone-400 text-center italic border border-dashed border-stone-100 rounded-2xl">
                  Open daylight
                </div>
              ) : (
                day.tasks.map((task) => {
                  const cat = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.academic;
                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className={`p-2.5 rounded-2xl border transition-all text-xs cursor-pointer shadow-2xs hover:border-stone-400 ${
                        task.completed
                          ? 'bg-stone-50 border-stone-200 text-stone-400 line-through'
                          : task.intent === 'need'
                          ? 'bg-rose-50/40 border-rose-200/80 text-stone-900'
                          : 'bg-[#faf9f6] border-[#eeebe5] text-stone-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="font-bold truncate leading-snug">
                          {task.intent === 'need' ? '📌 ' : ''}
                          {cat.emoji} {task.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleTask(task.id);
                          }}
                          className={`p-1 rounded-md transition-colors shrink-0 ${
                            task.completed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-200 text-stone-600 hover:bg-emerald-500 hover:text-white'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-stone-500 font-mono">
                        <span>⏱️ {task.duration}m</span>
                        {task.recurrence && task.recurrence !== 'none' && (
                          <span className="flex items-center gap-0.5 text-stone-600 font-sans">
                            <Repeat className="w-2.5 h-2.5" />
                            {task.recurrence}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 4. FLEXIBLE TASKS & BACKLOG SECTIONS (Requirement 9, 12) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* 🌱 Flexible Tasks */}
        <div className="bg-white/95 border border-stone-200/90 rounded-3xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-100">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-stone-900 flex items-center gap-1.5">
                <span>🌱</span>
                <span>Flexible Work ({flexibleTasks.length})</span>
              </h3>
              <p className="text-[11px] text-stone-400">
                Aspirations & want-to-do items to tackle when you have bonus daylight.
              </p>
            </div>
            {onQuickAddTask && (
              <button
                onClick={onQuickAddTask}
                className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
                title="Add flexible task"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {flexibleTasks.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-400 italic">
                No flexible tasks currently pending.
              </div>
            ) : (
              flexibleTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTask(t)}
                  className="p-2.5 rounded-2xl bg-emerald-50/40 border border-emerald-200/70 flex items-center justify-between text-xs cursor-pointer hover:border-emerald-300"
                >
                  <span className="font-semibold text-emerald-950 truncate">🌱 {t.name}</span>
                  <span className="text-[10px] font-mono text-emerald-700 shrink-0">
                    ⏱️ {t.duration}m
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 💭 Backlog / Someday Shelf */}
        <div className="bg-white/95 border border-stone-200/90 rounded-3xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-100">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-stone-900 flex items-center gap-1.5">
                <span>💭</span>
                <span>Someday Shelf ({backlogTasks.length})</span>
              </h3>
              <p className="text-[11px] text-stone-400">
                Safe ideas that don't need attention this week. No fake deadlines.
              </p>
            </div>
            {onQuickAddTask && (
              <button
                onClick={onQuickAddTask}
                className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
                title="Add someday idea"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {backlogTasks.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-400 italic">
                Someday shelf is calm and clear.
              </div>
            ) : (
              backlogTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTask(t)}
                  className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs cursor-pointer hover:border-stone-300 flex items-center justify-between"
                >
                  <span className="font-semibold text-stone-700 truncate">💭 {t.name}</span>
                  <span className="text-[10px] text-stone-400 shrink-0">Someday</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Calendar Event Modal */}
      <AddCalendarEventModal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        onAddEvent={(taskData) => {
          if (onAddTask) {
            onAddTask(taskData);
          }
        }}
        initialDate={targetDateForEvent}
        categories={categories}
      />

      {/* Cover Customizer Modal */}
      <CoverModal
        isOpen={isCoverModalOpen}
        onClose={() => setIsCoverModalOpen(false)}
        currentCover={cover}
        onSaveCover={handleUpdateCover}
        title="Weekly Moodboard / Cover"
      />
    </div>
  );
};
