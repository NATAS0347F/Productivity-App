import React, { useState, useEffect } from 'react';
import {
  Task,
  CapacitySettings,
  ScheduleResult,
  ViewMode,
  DayReflection,
  UserProfile,
  ActivityDay,
  WinItem,
  EnergyLevel,
  WeekPlan,
  MonthPlan,
  BigPictureGoal,
  ThemeSettings,
  CategoryDefinition,
  VisionBoardItem,
} from './types';
import { generateSchedule, formatTimeRange, minutesTo12Hour, timeToMinutes } from './utils/scheduler';
import { generateTaskBreakdown } from './utils/breakdown';
import {
  loadTasks,
  saveTasks,
  clearAllTasks,
  resetTasksToDefault,
  loadCapacity,
  saveCapacity,
  loadReflections,
  saveReflections,
  loadUserProfile,
  saveUserProfile,
  loadActivityHistory,
  saveActivityHistory,
  recordDayCheckIn,
  recordTaskCompletionInHistory,
  recordFocusSessionInHistory,
  loadWins,
  saveWins,
  addWinForTask,
  loadWeekPlan,
  saveWeekPlan,
  loadMonthPlan,
  saveMonthPlan,
  loadBigPictureGoals,
  saveBigPictureGoals,
  loadThemeSettings,
  saveThemeSettings,
  resetThemeSettings,
  loadSavedThemes,
  saveCustomTheme,
  deleteCustomTheme,
  loadCategories,
  saveCategories,
  resetCategories,
  loadVisionBoardItems,
  saveVisionBoardItems,
  resetVisionBoard,
  resetAllDataToCleanSlate,
  resetMonthPlan,
  resetBigPictureGoals,
  resetWeekPlan,
  EMPTY_MONTH_PLAN,
  EMPTY_WEEK_PLAN,
} from './utils/storage';
import { calculateMomentum } from './utils/momentum';
import { applyThemeToDocument, getLuminance } from './utils/theme';

import { Header } from './components/Header';
import { NowCard } from './components/NowCard';
import { NextCard } from './components/NextCard';
import { TodayProgressCard } from './components/TodayProgressCard';
import { TimelinePlan } from './components/TimelinePlan';
import { RescueAlertBanner } from './components/RescueAlertBanner';
import { QuickAddTask } from './components/QuickAddTask';
import { WinsSection } from './components/WinsSection';
import { MomentumCard } from './components/MomentumCard';
import { AvoidingThisCard } from './components/AvoidingThisCard';

import { CapacityForm } from './components/CapacityForm';
import { TaskForm } from './components/TaskForm';
import { BrainDumpList } from './components/BrainDumpList';
import { WeeklyView } from './components/WeeklyView';
import { MonthlyView } from './components/MonthlyView';
import { BigPictureView } from './components/BigPictureView';
import { VisionBoardView } from './components/VisionBoardView';

import { EditTaskModal } from './components/EditTaskModal';
import { WhatShouldIDoModal } from './components/WhatShouldIDoModal';
import { FocusSessionModal } from './components/FocusSessionModal';
import { ReflectionModal } from './components/ReflectionModal';
import { SettingsModal } from './components/SettingsModal';
import { RescueDayModal } from './components/RescueDayModal';
import { PlanWeekModal } from './components/PlanWeekModal';
import { PlanMonthModal } from './components/PlanMonthModal';
import { GlobalQuickCaptureModal } from './components/GlobalQuickCaptureModal';
import { ThemeStudioModal } from './components/ThemeStudioModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';

import { ChevronDown, ChevronUp, Sliders, Plus, Sparkles, Compass } from 'lucide-react';

export default function App() {
  // 1. Core persistent states loaded safely from storage
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [capacity, setCapacity] = useState<CapacitySettings>(() => loadCapacity());
  const [reflections, setReflections] = useState<DayReflection[]>(() => loadReflections());
  const [profile, setProfile] = useState<UserProfile>(() => loadUserProfile());
  const [activityHistory, setActivityHistory] = useState<ActivityDay[]>(() => {
    const hist = loadActivityHistory();
    return recordDayCheckIn(hist);
  });
  const [wins, setWins] = useState<WinItem[]>(() => loadWins());
  const [lastSavedAt, setLastSavedAt] = useState<number>(() => Date.now());

  // V5 Planning Horizons State
  const [thisWeekPlan, setThisWeekPlan] = useState<WeekPlan>(() => loadWeekPlan(false));
  const [nextWeekPlan, setNextWeekPlan] = useState<WeekPlan>(() => loadWeekPlan(true));
  const [monthPlan, setMonthPlan] = useState<MonthPlan>(() => loadMonthPlan());
  const [bigPictureGoals, setBigPictureGoals] = useState<BigPictureGoal[]>(() => loadBigPictureGoals());

  // Dynamic Categories & Vision Board State
  const [categories, setCategories] = useState<CategoryDefinition[]>(() => loadCategories());
  const [visionBoardItems, setVisionBoardItems] = useState<VisionBoardItem[]>(() => loadVisionBoardItems());

  // View mode and calculated schedule
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [scheduleResult, setScheduleResult] = useState<ScheduleResult | null>(null);

  // Brain dump drawer / accordion toggle
  const [isBrainDumpOpen, setIsBrainDumpOpen] = useState(false);
  const [isCapacityOpen, setIsCapacityOpen] = useState(false);

  // Modal States
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [focusSession, setFocusSession] = useState<{ task: Task; minutes: number } | null>(null);
  const [isWhatShouldIDoOpen, setIsWhatShouldIDoOpen] = useState(false);
  const [isReflectionOpen, setIsReflectionOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRescueDayOpen, setIsRescueDayOpen] = useState(false);
  const [isPlanWeekOpen, setIsPlanWeekOpen] = useState(false);
  const [isPlanMonthOpen, setIsPlanMonthOpen] = useState(false);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isThemeStudioOpen, setIsThemeStudioOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  // V6 Theme & Aesthetic Customization State
  const [theme, setTheme] = useState<ThemeSettings>(() => loadThemeSettings());
  const [savedThemes, setSavedThemes] = useState<ThemeSettings[]>(() => loadSavedThemes());

  // Theme Hierarchy: Global Theme selected by user is primary.
  const activeHorizonOverride = React.useMemo(() => {
    if (viewMode === 'week' && thisWeekPlan.accentColor) {
      return {
        accentColor: thisWeekPlan.accentColor,
        backgroundImage: thisWeekPlan.backgroundImage,
      };
    }
    if (viewMode === 'month' && monthPlan.accentColor) {
      return {
        accentColor: monthPlan.accentColor,
        backgroundImage: monthPlan.backgroundImage,
      };
    }
    return undefined;
  }, [viewMode, thisWeekPlan.accentColor, thisWeekPlan.backgroundImage, monthPlan.accentColor, monthPlan.backgroundImage]);

  // Apply active theme variables to document root
  useEffect(() => {
    applyThemeToDocument(theme, activeHorizonOverride);
  }, [theme, activeHorizonOverride]);

  const handleSaveTheme = (newTheme: ThemeSettings) => {
    setTheme(newTheme);
    saveThemeSettings(newTheme);
    applyThemeToDocument(newTheme);
  };

  const handleSaveCustomTheme = (newTheme: ThemeSettings) => {
    const updated = saveCustomTheme(newTheme);
    setSavedThemes(updated);
  };

  const handleDeleteCustomTheme = (id: string) => {
    const updated = deleteCustomTheme(id);
    setSavedThemes(updated);
  };

  // Reset Actions
  const handleClearAllTasks = () => {
    const cleared = clearAllTasks();
    setTasks(cleared);
    setLastSavedAt(Date.now());
  };

  const handleResetTasksToDefault = () => {
    const defaults = resetTasksToDefault();
    setTasks(defaults);
    setLastSavedAt(Date.now());
  };

  const handleClearGoalsAndPlans = () => {
    const emptyMonth = resetMonthPlan();
    const emptyThisWeek = resetWeekPlan(false);
    const emptyNextWeek = resetWeekPlan(true);
    const emptyGoals = resetBigPictureGoals();
    setMonthPlan(emptyMonth);
    setThisWeekPlan(emptyThisWeek);
    setNextWeekPlan(emptyNextWeek);
    setBigPictureGoals(emptyGoals);
    setLastSavedAt(Date.now());
  };

  const handleResetTheme = () => {
    const defaultTheme = resetThemeSettings();
    setTheme(defaultTheme);
    applyThemeToDocument(defaultTheme);
    setLastSavedAt(Date.now());
  };

  const handleFullReset = () => {
    resetAllDataToCleanSlate();
    setTasks([]);
    setReflections([]);
    setWins([]);
    setActivityHistory([]);
    setBigPictureGoals([]);
    setMonthPlan({ ...EMPTY_MONTH_PLAN });
    setThisWeekPlan({ ...EMPTY_WEEK_PLAN });
    setNextWeekPlan({ ...EMPTY_WEEK_PLAN });
    const defaultTheme = resetThemeSettings();
    setTheme(defaultTheme);
    applyThemeToDocument(defaultTheme);
    const defCats = resetCategories();
    setCategories(defCats);
    setVisionBoardItems([]);
    setLastSavedAt(Date.now());
  };

  // Categories & Vision Handlers
  const handleSaveCategories = (newCategories: CategoryDefinition[]) => {
    setCategories(newCategories);
    saveCategories(newCategories);
    setLastSavedAt(Date.now());
  };

  const handleAddCategory = (newCat: CategoryDefinition) => {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === newCat.id);
      const updated = exists ? prev.map((c) => (c.id === newCat.id ? newCat : c)) : [...prev, newCat];
      saveCategories(updated);
      return updated;
    });
    setLastSavedAt(Date.now());
  };

  const handleResetCategories = () => {
    const defCats = resetCategories();
    setCategories(defCats);
    setLastSavedAt(Date.now());
  };

  const handleSaveVisionBoardItems = (items: VisionBoardItem[]) => {
    setVisionBoardItems(items);
    saveVisionBoardItems(items);
    setLastSavedAt(Date.now());
  };

  // Auto-save sync effects
  useEffect(() => {
    saveTasks(tasks);
    setLastSavedAt(Date.now());
  }, [tasks]);

  useEffect(() => {
    saveCapacity(capacity);
    setLastSavedAt(Date.now());
  }, [capacity]);

  useEffect(() => {
    saveReflections(reflections);
    setLastSavedAt(Date.now());
  }, [reflections]);

  useEffect(() => {
    saveUserProfile(profile);
    setLastSavedAt(Date.now());
  }, [profile]);

  useEffect(() => {
    saveActivityHistory(activityHistory);
    setLastSavedAt(Date.now());
  }, [activityHistory]);

  useEffect(() => {
    saveWins(wins);
    setLastSavedAt(Date.now());
  }, [wins]);

  useEffect(() => {
    saveWeekPlan(thisWeekPlan, false);
  }, [thisWeekPlan]);

  useEffect(() => {
    saveWeekPlan(nextWeekPlan, true);
  }, [nextWeekPlan]);

  useEffect(() => {
    saveMonthPlan(monthPlan);
  }, [monthPlan]);

  useEffect(() => {
    saveBigPictureGoals(bigPictureGoals);
  }, [bigPictureGoals]);

  // Global keyboard shortcut 'N' for Quick Capture (Requirement #8)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if ((e.key === 'n' || e.key === 'N') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setIsQuickCaptureOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Recalculate schedule whenever tasks or capacity change
  useEffect(() => {
    const result = generateSchedule(tasks, capacity);
    setScheduleResult(result);
  }, [tasks, capacity]);

  // Momentum calculation
  const momentum = calculateMomentum(tasks, scheduleResult, activityHistory);

  // Handlers
  const handleAddTask = (
    newTaskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'postponeCount'>
  ) => {
    const newTask: Task = {
      id: Date.now(),
      completed: false,
      createdAt: Date.now(),
      postponeCount: 0,
      ...newTaskData,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleToggleTask = (id: number) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === id);
      const willBeCompleted = target ? !target.completed : false;

      if (target && willBeCompleted) {
        setActivityHistory((hist) => recordTaskCompletionInHistory(hist, target));
        setWins((w) => addWinForTask(target, w));
      }

      return prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? Date.now() : undefined,
            }
          : t
      );
    });
  };

  const handleRemoveTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  const handlePostponeTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const newCount = (t.postponeCount || 0) + 1;
        return {
          ...t,
          postponeCount: newCount,
          lastPostponedAt: Date.now(),
        };
      })
    );
  };

  const handleBreakdownTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const subtasks = generateTaskBreakdown(t);
        return {
          ...t,
          subtasks,
          brokenDown: true,
          intimidating: true,
        };
      })
    );
  };

  const handleStartFocusSession = (task: Task, starterMinutes?: number) => {
    setFocusSession({
      task,
      minutes: starterMinutes || Math.min(25, task.duration),
    });
  };

  const handleRecordFocusTime = (minutes: number) => {
    setActivityHistory((hist) => recordFocusSessionInHistory(hist, minutes));
    setWins((w) => [
      {
        id: `focus-win-${Date.now()}`,
        text: `Completed a ${minutes}-minute focus session`,
        timestamp: Date.now(),
        type: 'focus',
      },
      ...w,
    ]);
  };

  const handleSaveReflection = (reflection: DayReflection) => {
    setReflections((prev) => [
      ...prev.filter((r) => r.date !== reflection.date),
      reflection,
    ]);
  };

  const handleUpdateEnergy = (energy: EnergyLevel) => {
    setProfile((prev) => ({ ...prev, energyToday: energy }));
  };

  const handleReloadAllData = () => {
    setTasks(loadTasks());
    setCapacity(loadCapacity());
    setReflections(loadReflections());
    setProfile(loadUserProfile());
    setActivityHistory(loadActivityHistory());
    setWins(loadWins());
    setThisWeekPlan(loadWeekPlan(false));
    setNextWeekPlan(loadWeekPlan(true));
    setMonthPlan(loadMonthPlan());
    setBigPictureGoals(loadBigPictureGoals());
    setLastSavedAt(Date.now());
  };

  const handleApplyRescue = (keptTaskIds: number[], movedTaskIds: number[]) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (movedTaskIds.includes(t.id)) {
          return {
            ...t,
            priority: 1, // lowered to backlog
          };
        }
        return t;
      })
    );
  };

  const handleApplyWeekPlan = () => {
    setViewMode('week');
  };

  const handleSaveWeekPlan = (updated: WeekPlan, isNextWeek = false) => {
    if (isNextWeek) {
      setNextWeekPlan(updated);
    } else {
      setThisWeekPlan(updated);
    }
  };

  const handleAddTasksFromGoal = (
    newTasks: Omit<Task, 'id' | 'completed' | 'createdAt' | 'postponeCount'>[]
  ) => {
    const created: Task[] = newTasks.map((t, idx) => ({
      id: Date.now() + idx,
      completed: false,
      createdAt: Date.now(),
      postponeCount: 0,
      ...t,
    }));
    setTasks((prev) => [...created, ...prev]);
  };

  const activeTasks = tasks.filter((t) => !t.completed && t.type === 'task');
  const totalPlannedMinutes = activeTasks.reduce((sum, t) => sum + t.duration, 0);

  const startMin = timeToMinutes(capacity.startTime);
  const endMin = timeToMinutes(capacity.endTime);

  const isDarkTheme =
    getLuminance(theme.colors.background) < 0.25 ||
    theme.presetKey === 'midnight' ||
    theme.presetKey === 'dark_academia';

  const activeBackgroundImage =
    activeHorizonOverride?.backgroundImage || theme.backgroundImage?.url;

  return (
    <div
      id="flow-app"
      className={`min-h-screen relative selection:bg-stone-900 selection:text-white transition-colors duration-200 theme-dynamic-cards ${
        isDarkTheme ? 'dark dark-theme' : 'light-theme'
      }`}
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        fontFamily: 'var(--theme-font, inherit)',
      }}
    >
      {/* ATMOSPHERE BACKGROUND LAYERS */}
      {/* 1. Custom Background Image Layer */}
      {activeBackgroundImage && (
        <div
          id="app-theme-background-image"
          className="fixed inset-0 pointer-events-none transition-all duration-300 z-0"
          style={{
            backgroundImage: `url(${activeBackgroundImage})`,
            backgroundPosition: theme.backgroundImage?.position || 'center',
            backgroundSize: theme.backgroundImage?.size || 'cover',
            opacity: (theme.backgroundImage?.opacity ?? 90) / 100,
            filter: `blur(${theme.backgroundImage?.blur ?? 0}px)`,
          }}
        />
      )}

      {/* 2. Translucent Readability Overlay */}
      {activeBackgroundImage && (
        <div
          id="app-theme-overlay"
          className="fixed inset-0 pointer-events-none transition-colors duration-300 z-0"
          style={{
            backgroundColor:
              theme.backgroundImage?.overlayType === 'dark' ||
              (theme.backgroundImage?.overlayType === 'auto' && isDarkTheme)
                ? '#000000'
                : theme.colors.background,
            opacity: theme.backgroundImage?.protectReadability
              ? Math.max(0.35, (theme.backgroundImage?.overlayOpacity ?? 40) / 100)
              : (theme.backgroundImage?.overlayOpacity ?? 40) / 100,
          }}
        />
      )}

      {/* 3. Ambient Atmosphere Gradient */}
      {theme.backgroundEffects?.gradient && theme.backgroundEffects.gradient !== 'none' && (
        <div
          id="app-theme-gradient"
          className="fixed inset-0 pointer-events-none opacity-40 mix-blend-multiply z-0"
          style={{
            background:
              theme.backgroundEffects.gradient === 'subtle_warm'
                ? 'radial-gradient(circle at top right, #fed7aa, transparent 70%)'
                : theme.backgroundEffects.gradient === 'subtle_cool'
                ? 'radial-gradient(circle at top right, #bae6fd, transparent 70%)'
                : theme.backgroundEffects.gradient === 'dusk'
                ? 'radial-gradient(circle at bottom left, #c4b5fd, transparent 70%)'
                : 'radial-gradient(circle at top, #a7f3d0, transparent 70%)',
          }}
        />
      )}

      {/* 4. Subtle Tactile Paper Grain */}
      {theme.backgroundEffects?.grain && (
        <div
          id="app-theme-grain"
          className="fixed inset-0 pointer-events-none opacity-15 z-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]"
        />
      )}

      {/* 5. Cinematic Focus Vignette */}
      {theme.backgroundEffects?.vignette && (
        <div
          id="app-theme-vignette"
          className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,transparent_65%,rgba(0,0,0,0.3)_100%)]"
        />
      )}

      {/* MAIN APPLICATION CONTENT (Z-10) */}
      <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* TOP BAR: Flow Brand + View Switcher + PROMINENT CURRENT TIME */}
        <Header
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenWhatShouldIDo={() => setIsWhatShouldIDoOpen(true)}
          onOpenReflection={() => setIsReflectionOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenThemeStudio={() => setIsThemeStudioOpen(true)}
          onOpenCategories={() => setIsCategoriesOpen(true)}
          onOpenReset={() => setIsResetOpen(true)}
          onQuickAdd={() => setIsQuickCaptureOpen(true)}
          activeTheme={theme.name}
          profile={profile}
          onUpdateEnergy={handleUpdateEnergy}
          lastSavedAt={lastSavedAt}
          activeTaskCount={activeTasks.length}
          totalPlannedMinutes={totalPlannedMinutes}
        />

        {/* TODAY VIEW: ACTION FIRST -> PLANNING SECOND -> MOTIVATION LAST */}
        {viewMode === 'today' && (
          <div className="space-y-5">
            {/* Subtle intentional theme badge (Non-intrusive, never pushes schedule down) */}
            {thisWeekPlan.theme && (
              <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs shadow-2xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-bold text-stone-900 truncate">
                    🌱 {thisWeekPlan.theme}
                  </span>
                  {thisWeekPlan.subtitle && (
                    <span className="hidden sm:inline text-stone-500 font-medium truncate">
                      — {thisWeekPlan.subtitle}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsPlanWeekOpen(true)}
                    className="text-[11px] font-bold text-amber-900 hover:underline cursor-pointer"
                  >
                    Adjust week
                  </button>
                  <span className="text-amber-300">·</span>
                  <button
                    onClick={() => setViewMode('week')}
                    className="text-[11px] font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
                  >
                    View week →
                  </button>
                </div>
              </div>
            )}

            {/* Conditional Behind Schedule Alert */}
            <RescueAlertBanner
              scheduleResult={scheduleResult}
              tasks={tasks}
              onOpenRescueDay={() => setIsRescueDayOpen(true)}
            />

            {/* Core 2-Column Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
              {/* LEFT / MAIN COLUMN: NOW (Level 1) + TODAY'S TIMELINE (Level 2) + Backlog */}
              <div className="space-y-6 min-w-0">
                {/* LEVEL 1: WHAT I NEED TO DO NOW (Highest Visual Emphasis) */}
                <NowCard
                  scheduleResult={scheduleResult}
                  tasks={tasks}
                  onOpenWhatShouldIDo={() => setIsWhatShouldIDoOpen(true)}
                  onStartFocusSession={handleStartFocusSession}
                  onToggleTask={handleToggleTask}
                />

                {/* LEVEL 2: TODAY'S TIMELINE (Main Body of the App) */}
                {scheduleResult && (
                  <TimelinePlan
                    scheduleResult={scheduleResult}
                    tasks={tasks}
                    capacity={capacity}
                    categories={categories}
                    onToggleTask={handleToggleTask}
                    onBreakdownTask={handleBreakdownTask}
                    onStartFocusSession={handleStartFocusSession}
                    onAddTask={handleAddTask}
                    onEditTask={(task) => setEditingTask(task)}
                    onDeleteTask={handleRemoveTask}
                  />
                )}

                {/* Brain Dump & Backlog Accordion (Doesn't push the schedule down) */}
                <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                        <span>Brain Dump & Backlog</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono">
                          {tasks.length} items
                        </span>
                      </h4>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Capture all ideas, upcoming projects, and backlog tasks.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsBrainDumpOpen((prev) => !prev)}
                        className="flex items-center gap-1 text-xs font-bold text-stone-700 hover:text-stone-950 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 transition-colors cursor-pointer"
                      >
                        <span>{isBrainDumpOpen ? 'Collapse' : 'Manage tasks'}</span>
                        {isBrainDumpOpen ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Task Management */}
                  {isBrainDumpOpen && (
                    <div className="mt-5 pt-5 border-t border-stone-100 space-y-6">
                      <TaskForm
                        onAddTask={handleAddTask}
                        categories={categories}
                        onAddCategory={handleAddCategory}
                        onOpenCategoryManager={() => setIsCategoriesOpen(true)}
                      />

                      <BrainDumpList
                        tasks={tasks}
                        onToggleTask={handleToggleTask}
                        onRemoveTask={handleRemoveTask}
                        onEditTask={(task) => setEditingTask(task)}
                        onPostponeTask={handlePostponeTask}
                        onBreakdownTask={handleBreakdownTask}
                        onClearCompleted={handleClearCompleted}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT / SECONDARY COLUMN: Progress + Up Next + Quick Add + Capacity */}
              <div className="space-y-5 lg:sticky lg:top-6">
                {/* LEVEL 3: TODAY'S PROGRESS (Compact) */}
                <TodayProgressCard
                  tasks={tasks}
                  scheduleResult={scheduleResult}
                  momentum={momentum}
                />

                {/* LEVEL 3: UP NEXT (Immediate foresight) */}
                <NextCard
                  scheduleResult={scheduleResult}
                  tasks={tasks}
                  onStartFocusSession={handleStartFocusSession}
                />

                {/* QUICK ADD TASK (Instant 1-step natural language capture) */}
                <QuickAddTask
                  onAddTask={handleAddTask}
                  onOpenFullForm={() => setIsBrainDumpOpen(true)}
                  categories={categories}
                  onAddCategory={handleAddCategory}
                  onOpenCategoryManager={() => setIsCategoriesOpen(true)}
                />

                {/* Compact Day Capacity Card */}
                <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-stone-400 block">
                        DAY HOURS
                      </span>
                      <div className="text-xs font-bold text-stone-800 font-mono mt-0.5">
                        {minutesTo12Hour(startMin)} – {minutesTo12Hour(endMin)}
                      </div>
                    </div>

                    <button
                      onClick={() => setIsCapacityOpen((prev) => !prev)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
                      title="Adjust day hours and lunch"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{isCapacityOpen ? 'Close' : 'Adjust'}</span>
                    </button>
                  </div>

                  {isCapacityOpen && (
                    <div className="mt-3 pt-3 border-t border-stone-100">
                      <CapacityForm
                        capacity={capacity}
                        onChange={setCapacity}
                        availableMinutes={scheduleResult?.capacityMinutes || 8 * 60}
                        scheduledMinutes={scheduleResult?.totalWorkMinutes || 0}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* LEVEL 4: MOTIVATION & SECONDARY WINS (Bottom of page, never pushes schedule down) */}
            <div className="pt-6 border-t border-stone-200/80">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Recent Wins */}
                <WinsSection wins={wins} />

                {/* Consistency & Pacing */}
                <MomentumCard momentum={momentum} />

                {/* Avoiding this nudge (if any) */}
                <AvoidingThisCard
                  tasks={tasks}
                  onStartFocusSession={handleStartFocusSession}
                  onBreakdownTask={handleBreakdownTask}
                />
              </div>
            </div>
          </div>
        )}

        {/* WEEK VIEW */}
        {viewMode === 'week' && (
          <WeeklyView
            tasks={tasks}
            capacity={capacity}
            activityHistory={activityHistory}
            thisWeekPlan={thisWeekPlan}
            nextWeekPlan={nextWeekPlan}
            onSaveWeekPlan={handleSaveWeekPlan}
            onToggleTask={handleToggleTask}
            onMoveTaskToDay={() => {}}
            onSelectTask={(task) => setEditingTask(task)}
            onOpenPlanWeek={() => setIsPlanWeekOpen(true)}
            onQuickAddTask={() => setIsQuickCaptureOpen(true)}
            onAddTask={handleAddTask}
            categories={categories}
          />
        )}

        {/* MONTH VIEW */}
        {viewMode === 'month' && (
          <MonthlyView
            monthPlan={monthPlan}
            tasks={tasks}
            onSaveMonthPlan={setMonthPlan}
            onSelectTask={(task) => setEditingTask(task)}
            onToggleTask={handleToggleTask}
            onOpenPlanMonth={() => setIsPlanMonthOpen(true)}
            onQuickAddTask={() => setIsQuickCaptureOpen(true)}
            onAddTask={handleAddTask}
            categories={categories}
          />
        )}

        {/* BIG PICTURE VIEW */}
        {(viewMode as any) === 'big_picture' && (
          <BigPictureView
            goals={bigPictureGoals}
            tasks={tasks}
            monthPlan={monthPlan}
            thisWeekPlan={thisWeekPlan}
            onOpenPlanMonth={() => setIsPlanMonthOpen(true)}
            categories={categories}
            onSaveGoals={setBigPictureGoals}
            onAddTasksFromGoal={handleAddTasksFromGoal}
            onQuickAddTask={() => setIsQuickCaptureOpen(true)}
          />
        )}

        {/* VISION BOARD VIEW */}
        {viewMode === 'vision' && (
          <VisionBoardView
            items={visionBoardItems}
            onSaveItems={handleSaveVisionBoardItems}
            bigPictureGoals={bigPictureGoals}
            categories={categories}
          />
        )}
      </div>

      {/* Floating Quick Capture Trigger (Bottom right) */}
      <button
        onClick={() => setIsQuickCaptureOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-stone-900 text-white shadow-xl hover:bg-black flex items-center justify-center cursor-pointer active:scale-95 transition-all"
        title="Quick Capture (Press 'N')"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modals & Dialogs */}
      <CategoryManagerModal
        isOpen={isCategoriesOpen}
        onClose={() => setIsCategoriesOpen(false)}
        categories={categories}
        onSaveCategories={handleSaveCategories}
        onResetCategories={handleResetCategories}
      />

      <ResetConfirmModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onClearAllTasks={handleClearAllTasks}
        onClearGoalsAndPlans={handleClearGoalsAndPlans}
        onResetTasksToDefault={handleResetTasksToDefault}
        onResetTheme={handleResetTheme}
        onFullReset={handleFullReset}
      />
      <GlobalQuickCaptureModal
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
        onAddTask={handleAddTask}
        categories={categories}
        onAddCategory={handleAddCategory}
        onOpenFullForm={() => setIsBrainDumpOpen(true)}
      />

      <EditTaskModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleUpdateTask}
        onDelete={handleRemoveTask}
        onToggleComplete={handleToggleTask}
        categories={categories}
        onAddCategory={handleAddCategory}
        onOpenCategoryManager={() => setIsCategoriesOpen(true)}
      />

      <WhatShouldIDoModal
        isOpen={isWhatShouldIDoOpen}
        onClose={() => setIsWhatShouldIDoOpen(false)}
        tasks={tasks}
        userEnergy={profile.energyToday}
        onStartFocusSession={handleStartFocusSession}
        onPostponeTask={handlePostponeTask}
        onBreakdownTask={handleBreakdownTask}
      />

      <FocusSessionModal
        task={focusSession?.task || null}
        isOpen={!!focusSession}
        onClose={() => setFocusSession(null)}
        onCompleteTask={handleToggleTask}
        onRecordFocusTime={handleRecordFocusTime}
        initialMinutes={focusSession?.minutes}
      />

      <ReflectionModal
        isOpen={isReflectionOpen}
        onClose={() => setIsReflectionOpen(false)}
        onSaveReflection={handleSaveReflection}
        reflections={reflections}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onUpdateProfile={setProfile}
        tasksCount={tasks.length}
        onReloadAllData={handleReloadAllData}
        onOpenThemeStudio={() => setIsThemeStudioOpen(true)}
        activeThemeName={theme.name}
      />

      <ThemeStudioModal
        isOpen={isThemeStudioOpen}
        onClose={() => setIsThemeStudioOpen(false)}
        activeTheme={theme}
        onSaveTheme={handleSaveTheme}
        savedThemes={savedThemes}
        onSaveCustomTheme={handleSaveCustomTheme}
        onDeleteCustomTheme={handleDeleteCustomTheme}
      />

      <RescueDayModal
        isOpen={isRescueDayOpen}
        onClose={() => setIsRescueDayOpen(false)}
        tasks={tasks}
        capacity={capacity}
        onApplyRescue={handleApplyRescue}
      />

      <PlanWeekModal
        isOpen={isPlanWeekOpen}
        onClose={() => setIsPlanWeekOpen(false)}
        tasks={tasks}
        weekPlan={thisWeekPlan}
        onSaveWeekPlan={handleSaveWeekPlan}
        onApplyWeekPlan={handleApplyWeekPlan}
      />

      <PlanMonthModal
        isOpen={isPlanMonthOpen}
        onClose={() => setIsPlanMonthOpen(false)}
        monthPlan={monthPlan}
        tasks={tasks}
        onSaveMonthPlan={setMonthPlan}
      />
    </div>
  );
}
