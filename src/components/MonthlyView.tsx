import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Target,
  Calendar as CalendarIcon,
  Sparkles,
  Compass,
  CheckCircle2,
  Clock,
  ArrowRight,
  Image as ImageIcon,
  Edit3,
  FileText,
  Flame,
  Plus,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { MonthPlan, Task, AestheticCover, CategoryDefinition } from '../types';
import { CATEGORY_CONFIG } from '../utils/categories';
import { CoverModal } from './CoverModal';
import { AddCalendarEventModal } from './AddCalendarEventModal';

interface MonthlyViewProps {
  monthPlan: MonthPlan;
  tasks: Task[];
  onSaveMonthPlan: (plan: MonthPlan) => void;
  onSelectTask: (task: Task) => void;
  onToggleTask: (id: number) => void;
  onOpenPlanMonth?: () => void;
  onQuickAddTask?: () => void;
  onAddTask?: (task: Omit<Task, 'id' | 'completed' | 'createdAt' | 'postponeCount'>) => void;
  categories?: CategoryDefinition[];
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({
  monthPlan,
  tasks,
  onSaveMonthPlan,
  onSelectTask,
  onToggleTask,
  onOpenPlanMonth,
  onQuickAddTask,
  onAddTask,
  categories = [],
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [targetDateForEvent, setTargetDateForEvent] = useState<string>('');
  const [inspectedDay, setInspectedDay] = useState<{ date: string; tasks: Task[] } | null>(null);
  const [editingGoalIndex, setEditingGoalIndex] = useState<number | null>(null);
  const [editingGoalText, setEditingGoalText] = useState('');
  const [newGoalText, setNewGoalText] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newProjectText, setNewProjectText] = useState('');
  const [isAddingProject, setIsAddingProject] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
  const totalDaysInMonth = lastDayOfMonth.getDate();

  // Monday-based calendar grid
  const mondayOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  const calendarDays = [];
  for (let i = 0; i < mondayOffset; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= totalDaysInMonth; d++) {
    calendarDays.push(new Date(year, month, d));
  }

  // Key Dates (Deadlines & Events)
  const keyDates = tasks.filter(
    (t) => Boolean(t.deadline) || t.type === 'goal' || t.type === 'project'
  );

  const cover = monthPlan.cover;

  const handleUpdateCover = (newCover?: AestheticCover) => {
    onSaveMonthPlan({ ...monthPlan, cover: newCover });
  };

  const handleUpdateNotes = (notes: string) => {
    onSaveMonthPlan({ ...monthPlan, planningNotes: notes });
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    const updated = [...(monthPlan.majorGoals || []), newGoalText.trim()];
    onSaveMonthPlan({ ...monthPlan, majorGoals: updated });
    setNewGoalText('');
    setIsAddingGoal(false);
  };

  const handleStartEditGoal = (index: number) => {
    setEditingGoalIndex(index);
    setEditingGoalText(monthPlan.majorGoals[index] || '');
  };

  const handleSaveEditedGoal = (index: number) => {
    if (!editingGoalText.trim()) {
      handleDeleteGoal(index);
      return;
    }
    const updated = [...(monthPlan.majorGoals || [])];
    updated[index] = editingGoalText.trim();
    onSaveMonthPlan({ ...monthPlan, majorGoals: updated });
    setEditingGoalIndex(null);
    setEditingGoalText('');
  };

  const handleDeleteGoal = (index: number) => {
    const updated = (monthPlan.majorGoals || []).filter((_, i) => i !== index);
    onSaveMonthPlan({ ...monthPlan, majorGoals: updated });
    if (editingGoalIndex === index) {
      setEditingGoalIndex(null);
    }
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectText.trim()) return;
    const updated = [...(monthPlan.currentProjects || []), newProjectText.trim()];
    onSaveMonthPlan({ ...monthPlan, currentProjects: updated });
    setNewProjectText('');
    setIsAddingProject(false);
  };

  const handleDeleteProject = (index: number) => {
    const updated = (monthPlan.currentProjects || []).filter((_, i) => i !== index);
    onSaveMonthPlan({ ...monthPlan, currentProjects: updated });
  };

  return (
    <div id="view-monthly-container" className="space-y-6">
      {/* 1. DIGITAL JOURNAL MONTHLY THEME HEADER (Requirements 2, 3, 11) */}
      <div
        id="card-monthly-theme-header"
        className={`bg-white/95 border border-stone-200/90 rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all ${
          cover?.displayStyle === 'subtle_bg' && cover.url ? 'bg-stone-50/90' : ''
        }`}
        style={
          cover?.displayStyle === 'subtle_bg' && cover.url
            ? {
                backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.96), rgba(255,255,255,0.88)), url(${cover.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        {/* Sleek top banner mode if cover style === 'cover' */}
        {cover?.displayStyle === 'cover' && cover.url && (
          <div className="relative -mx-5 -mt-5 sm:-mx-6 sm:-mt-6 mb-5 h-28 sm:h-36 overflow-hidden rounded-t-3xl border-b border-stone-200">
            <img
              src={cover.url}
              alt="Month Moodboard"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent flex items-end p-4">
              {cover.caption && (
                <span className="text-xs font-semibold text-white/90 bg-black/40 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                  {cover.caption}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Small Side Image mode (Notion style) */}
            {cover?.displayStyle === 'side' && cover.url && (
              <div
                onClick={() => setIsCoverModalOpen(true)}
                className="w-18 h-18 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-stone-200/90 shrink-0 shadow-2xs cursor-pointer group relative hover:opacity-90 transition-opacity"
                title="Click to customize monthly moodboard photo"
              >
                <img
                  src={cover.url}
                  alt="Month cover"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Edit3 className="w-4 h-4 text-white" />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs font-black uppercase tracking-widest text-stone-400">
                  Monthly Journal Horizon
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/80">
                  Big Picture Vision
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                {monthPlan.theme || `${monthName.toUpperCase()} — RESET & REBUILD`}
              </h2>
              {monthPlan.subtitle && (
                <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
                  {monthPlan.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons: Moodboard & Plan Month */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={() => setIsCoverModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer transition-colors"
              title="Add or change monthly moodboard photo"
            >
              <ImageIcon className="w-3.5 h-3.5 text-stone-500" />
              <span>{cover ? 'Change Mood' : '+ Add Moodboard'}</span>
            </button>

            {onOpenPlanMonth && (
              <button
                onClick={onOpenPlanMonth}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Compass className="w-4 h-4 text-teal-300" />
                <span>Plan My Month</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. THE 4 JOURNAL DASHBOARD PANELS (Requirement 11) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 🎯 PANEL 1: MONTHLY FOCUS & MAJOR GOALS */}
        <div className="bg-white/95 border border-stone-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-stone-100">
              <span className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-purple-600" />
                <span>Monthly Focus & Major Goals</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-stone-400">1–3 Commitments</span>
                {!isAddingGoal && (
                  <button
                    type="button"
                    onClick={() => setIsAddingGoal(true)}
                    className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-0.5 px-2 py-0.5 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                )}
              </div>
            </div>

            {/* Inline Add Goal Form */}
            {isAddingGoal && (
              <form onSubmit={handleAddGoal} className="mb-3 p-3 rounded-2xl bg-purple-50/50 border border-purple-200 flex items-center gap-2">
                <input
                  type="text"
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  placeholder="Enter major monthly goal..."
                  className="flex-1 text-xs px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-900 focus:outline-none focus:border-purple-600"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingGoal(false);
                    setNewGoalText('');
                  }}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Goal List or Empty State */}
            {(!monthPlan.majorGoals || monthPlan.majorGoals.length === 0) ? (
              <div className="p-4 rounded-2xl bg-stone-50 border border-dashed border-stone-200 text-center space-y-2">
                <p className="text-xs text-stone-500 font-medium">
                  No monthly goals set yet. Add 1–3 high-level commitments to guide your weekly focus.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingGoal(true)}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white cursor-pointer shadow-xs"
                  >
                    + Add Monthly Goal
                  </button>
                  {onOpenPlanMonth && (
                    <button
                      type="button"
                      onClick={onOpenPlanMonth}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-white cursor-pointer"
                    >
                      Plan Month
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {monthPlan.majorGoals.map((goal, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-[#faf9f6] border border-[#eeebe5] group transition-all">
                    {editingGoalIndex === idx ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingGoalText}
                          onChange={(e) => setEditingGoalText(e.target.value)}
                          className="flex-1 text-xs px-2.5 py-1.5 rounded-xl bg-white border border-stone-300 text-stone-900 focus:outline-none focus:border-stone-900"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEditedGoal(idx);
                            if (e.key === 'Escape') setEditingGoalIndex(null);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEditedGoal(idx)}
                          className="p-1.5 rounded-lg bg-stone-900 text-white hover:bg-black text-xs font-bold cursor-pointer"
                          title="Save"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingGoalIndex(null)}
                          className="p-1.5 text-stone-400 hover:text-stone-700"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between text-xs font-bold text-stone-900 mb-1.5">
                          <span className="flex-1 mr-2">
                            {idx + 1}. {goal}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[11px] font-mono text-purple-700 font-semibold mr-1">
                              {idx === 0 ? '35%' : idx === 1 ? '50%' : '65%'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStartEditGoal(idx)}
                              className="p-1 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-200/60 transition-colors opacity-80 group-hover:opacity-100"
                              title="Edit goal"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteGoal(idx)}
                              className="p-1 text-stone-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors opacity-80 group-hover:opacity-100"
                              title="Delete goal"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {/* Subtle clean progress bar */}
                        <div className="w-full h-1.5 rounded-full bg-stone-200 overflow-hidden">
                          <div
                            className="h-full bg-stone-900 rounded-full transition-all"
                            style={{ width: `${idx === 0 ? 35 : idx === 1 ? 50 : 65}%` }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current Projects sub-shelf */}
          <div className="mt-4 pt-3 border-t border-stone-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                Active Projects In Flight
              </span>
              {!isAddingProject && (
                <button
                  type="button"
                  onClick={() => setIsAddingProject(true)}
                  className="text-[10px] font-bold text-stone-500 hover:text-stone-800 flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Project</span>
                </button>
              )}
            </div>

            {isAddingProject && (
              <form onSubmit={handleAddProject} className="mb-2 flex items-center gap-1.5">
                <input
                  type="text"
                  value={newProjectText}
                  onChange={(e) => setNewProjectText(e.target.value)}
                  placeholder="Project name..."
                  className="text-xs px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:bg-white"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded-lg bg-stone-900 text-white text-xs font-bold cursor-pointer"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingProject(false);
                    setNewProjectText('');
                  }}
                  className="p-1 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {(!monthPlan.currentProjects || monthPlan.currentProjects.length === 0) ? (
              <span className="text-xs text-stone-400 italic">No active projects listed.</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {monthPlan.currentProjects.map((p, i) => (
                  <span
                    key={i}
                    className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-200/70"
                  >
                    <span>📁 {p}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(i)}
                      className="text-stone-400 hover:text-rose-600 rounded-full p-0.5 hover:bg-stone-200 transition-colors"
                      title="Remove project"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 📅 PANEL 2: KEY DATES & UPCOMING MILESTONES */}
        <div className="bg-white/95 border border-stone-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-stone-100">
              <span className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-rose-600" />
                <span>Key Dates & Critical Deadlines</span>
              </span>
              <span className="text-[11px] font-bold text-rose-600">High Horizon</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {keyDates.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-400 italic">
                  No critical deadlines logged for this month.
                </div>
              ) : (
                keyDates.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="p-2.5 rounded-2xl bg-rose-50/40 border border-rose-200/70 flex items-center justify-between text-xs cursor-pointer hover:border-rose-300"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      <span className="font-bold text-rose-950 truncate">{task.name}</span>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-rose-700 bg-white/80 px-2 py-0.5 rounded-md shrink-0 border border-rose-200/50">
                      {task.deadline || 'This month'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-400 flex items-center justify-between">
            <span>Filtered for clarity — micro tasks remain in weekly views.</span>
            <button
              type="button"
              onClick={() => {
                setTargetDateForEvent(new Date().toISOString().slice(0, 10));
                setIsAddEventOpen(true);
              }}
              className="text-rose-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add key date</span>
            </button>
          </div>
        </div>

        {/* 📆 PANEL 3: 4-WEEK THEMES ARC */}
        <div className="bg-white/95 border border-stone-200/90 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-stone-100">
            <span className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>The 4 Weekly Themes Arc</span>
            </span>
            <span className="text-[11px] font-mono text-stone-400">Paced progression</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {monthPlan.weeklyThemes.map((w) => (
              <div
                key={w.weekNumber}
                className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80"
              >
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                  <span>Week {w.weekNumber}</span>
                  <span className="text-amber-700 font-bold">Arc</span>
                </div>
                <div className="text-xs font-bold text-stone-900">{w.title}</div>
                <div className="text-[11px] text-stone-500 mt-0.5">{w.focus}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 🌱 PANEL 4: MORE OF / LESS OF & INTENTIONAL CANVAS */}
        <div className="bg-white/95 border border-stone-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-stone-100">
              <span className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Rhythm & Personal Canvas</span>
              </span>
              <span className="text-[11px] font-mono text-stone-400">Monthly alignment</span>
            </div>

            {/* More / Less badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
              <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200/70">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block mb-1">
                  🌱 More Of
                </span>
                <p className="text-xs text-emerald-950 font-medium leading-snug">
                  {monthPlan.moreOf || 'Focus sessions, daylight walks, deep reading'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-200/70">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 block mb-1">
                  🛡️ Less Of
                </span>
                <p className="text-xs text-rose-950 font-medium leading-snug">
                  {monthPlan.lessOf || 'Panic rushing, revenge bedtime delay, guilt'}
                </p>
              </div>
            </div>

            {/* Personal notes canvas */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1">
                Personal Journal Thoughts
              </span>
              <textarea
                rows={2}
                value={monthPlan.planningNotes || ''}
                onChange={(e) => handleUpdateNotes(e.target.value)}
                placeholder="What is your mindset for this month? (e.g. 'This month is not about grinding yourself down...')"
                className="w-full text-xs text-stone-700 bg-stone-50 border border-stone-200/80 rounded-2xl p-2.5 focus:outline-none focus:bg-white focus:border-stone-900 leading-relaxed resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. CALENDAR OVERVIEW GRID (Quiet, clean overview) */}
      <div className="bg-white/95 border border-stone-200/90 rounded-3xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-3 border-b border-stone-100 gap-2">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-stone-600" />
            <h3 className="text-sm font-bold text-stone-900">{monthName} Calendar Grid</h3>
            <span className="text-xs text-stone-400 font-medium">Click any date to add event</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              type="button"
              id="btn-add-calendar-event"
              onClick={() => {
                setTargetDateForEvent(new Date().toISOString().slice(0, 10));
                setIsAddEventOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Event</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 cursor-pointer"
                title="Previous month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 cursor-pointer"
                title="Next month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Day name headers */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((d, index) => {
            if (!d) {
              return <div key={`empty-${index}`} className="min-h-16 rounded-xl bg-transparent" />;
            }

            const dStr = d.toISOString().slice(0, 10);
            const isToday = d.toDateString() === new Date().toDateString();
            const dayKeyTasks = tasks.filter((t) => t.deadline === dStr || t.scheduledDate === dStr);

            return (
              <div
                key={dStr}
                onClick={() => {
                  setTargetDateForEvent(dStr);
                  setIsAddEventOpen(true);
                }}
                className={`min-h-16 rounded-2xl p-1.5 border transition-all text-left flex flex-col justify-between group cursor-pointer relative ${
                  isToday
                    ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-300/40 hover:bg-amber-50/70'
                    : 'bg-stone-50/60 border-stone-200/80 hover:bg-white hover:border-stone-400 hover:shadow-2xs'
                }`}
                title={`Click to add event on ${dStr}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isToday ? 'text-amber-950 font-black' : 'text-stone-700'
                    }`}
                  >
                    {d.getDate()}
                  </span>

                  <div className="flex items-center gap-1">
                    {dayKeyTasks.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    )}
                    <span className="w-4 h-4 rounded-md flex items-center justify-center text-stone-400 opacity-0 group-hover:opacity-100 hover:bg-stone-200 hover:text-stone-800 transition-all text-[11px] font-bold">
                      +
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5 mt-1 overflow-hidden">
                  {dayKeyTasks.slice(0, 2).map((t) => (
                    <div
                      key={t.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTask(t);
                      }}
                      className="truncate text-[10px] px-1 py-0.5 rounded bg-white border border-stone-200 text-stone-800 font-semibold cursor-pointer hover:border-stone-500 shadow-2xs"
                    >
                      {t.name}
                    </div>
                  ))}
                  {dayKeyTasks.length > 2 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectedDay({ date: dStr, tasks: dayKeyTasks });
                      }}
                      className="text-[9px] text-stone-500 font-bold pl-1 hover:underline cursor-pointer text-left block"
                    >
                      +{dayKeyTasks.length - 2} more
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inspected Day Details Modal */}
      {inspectedDay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setInspectedDay(null)}
        >
          <div
            className="bg-white border border-stone-200 text-stone-900 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-stone-700" />
                <h3 className="text-sm font-bold text-stone-900">
                  Events for {new Date(inspectedDay.date + 'T00:00:00').toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h3>
              </div>
              <button
                onClick={() => setInspectedDay(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {inspectedDay.tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => {
                    setInspectedDay(null);
                    onSelectTask(task);
                  }}
                  className="p-2.5 rounded-xl border border-stone-200 hover:border-stone-400 bg-stone-50 flex items-center justify-between text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-bold text-stone-900 truncate">{task.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-500">
                    {task.duration}m
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setInspectedDay(null)}
                className="px-3 py-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = inspectedDay.date;
                  setInspectedDay(null);
                  setTargetDateForEvent(d);
                  setIsAddEventOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add event to this day</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
        title="Monthly Moodboard / Cover"
      />
    </div>
  );
};
