import React, { useState } from 'react';
import {
  Sparkles,
  Target,
  ArrowRight,
  Plus,
  CheckCircle2,
  Clock,
  Layers,
  Calendar,
  Compass,
  Zap,
  Edit3,
  Trash2,
  Check,
} from 'lucide-react';
import { BigPictureGoal, Task, CategoryType, MonthPlan, WeekPlan, CategoryDefinition } from '../types';
import { CATEGORY_CONFIG } from '../utils/categories';
import { EditGoalModal } from './EditGoalModal';

interface BigPictureViewProps {
  goals: BigPictureGoal[];
  tasks: Task[];
  onSaveGoals: (goals: BigPictureGoal[]) => void;
  onAddTasksFromGoal: (newTasks: Omit<Task, 'id' | 'completed' | 'createdAt' | 'postponeCount'>[]) => void;
  onQuickAddTask?: () => void;
  monthPlan?: MonthPlan;
  thisWeekPlan?: WeekPlan;
  onOpenPlanMonth?: () => void;
  categories?: CategoryDefinition[];
}

export const BigPictureView: React.FC<BigPictureViewProps> = ({
  goals,
  tasks,
  onSaveGoals,
  onAddTasksFromGoal,
  onQuickAddTask,
  monthPlan,
  thisWeekPlan,
  onOpenPlanMonth,
  categories = [],
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'this_month' | 'next_month' | 'this_quarter' | 'eventually'>('all');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newFocus, setNewFocus] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryType>('technical');
  const [appliedGoalId, setAppliedGoalId] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<BigPictureGoal | null>(null);

  const filteredGoals = selectedTimeframe === 'all'
    ? goals
    : goals.filter((g) => g.timeframe === selectedTimeframe);

  const handleBreakdownToTasks = (goal: BigPictureGoal) => {
    // Convert goal subActions into actual tasks scheduled for the coming week
    const today = new Date();
    const generatedTasks: Omit<Task, 'id' | 'completed' | 'createdAt' | 'postponeCount'>[] = goal.subActions.map((sub, idx) => {
      // Calculate scheduled date based on dayHint
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + (idx * 2 + 1)); // distribute spaced out
      const dateStr = targetDate.toISOString().slice(0, 10);

      return {
        name: sub.title,
        type: 'task',
        intent: 'want',
        category: goal.category,
        duration: sub.duration || 30,
        energy: 'medium',
        priority: 2,
        deadline: null,
        scheduledDate: dateStr,
        recurrence: 'none',
        goalId: goal.id,
      };
    });

    onAddTasksFromGoal(generatedTasks);
    setAppliedGoalId(goal.id);
    setTimeout(() => setAppliedGoalId(null), 3000);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newGoal: BigPictureGoal = {
      id: `goal-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      timeframe: selectedTimeframe === 'all' ? 'this_month' : selectedTimeframe,
      weeklyFocus: newFocus.trim() || 'Start with bite-sized exploration',
      progress: 0,
      completed: false,
      subActions: [
        { title: `${newTitle.trim()} fundamentals`, dayHint: 'Tuesday', duration: 30 },
        { title: `${newTitle.trim()} practice session`, dayHint: 'Thursday', duration: 45 },
      ],
    };

    onSaveGoals([newGoal, ...goals]);
    setNewTitle('');
    setNewFocus('');
    setIsAddingGoal(false);
  };

  const handleUpdateGoal = (updated: BigPictureGoal) => {
    const nextGoals = goals.map((g) => (g.id === updated.id ? updated : g));
    onSaveGoals(nextGoals);
  };

  const handleDeleteGoal = (goalId: string) => {
    const nextGoals = goals.filter((g) => g.id !== goalId);
    onSaveGoals(nextGoals);
  };

  const handleToggleCompletion = (goalId: string) => {
    const nextGoals = goals.map((g) => {
      if (g.id === goalId) {
        const nextCompleted = !g.completed;
        return {
          ...g,
          completed: nextCompleted,
          progress: nextCompleted ? 100 : g.progress === 100 ? 50 : g.progress,
        };
      }
      return g;
    });
    onSaveGoals(nextGoals);
  };

  const handleAdjustProgress = (goalId: string, delta: number) => {
    const nextGoals = goals.map((g) => {
      if (g.id === goalId) {
        const newProgress = Math.min(100, Math.max(0, g.progress + delta));
        return {
          ...g,
          progress: newProgress,
          completed: newProgress >= 100,
        };
      }
      return g;
    });
    onSaveGoals(nextGoals);
  };

  // Dynamic values for pyramid
  const topMonthlyGoal = monthPlan?.majorGoals && monthPlan.majorGoals.length > 0
    ? monthPlan.majorGoals[0]
    : null;

  const topWeeklyFocus = thisWeekPlan?.theme || (thisWeekPlan?.topPriorities && thisWeekPlan.topPriorities[0]) || null;

  return (
    <div id="view-big-picture-container" className="space-y-6">
      {/* 1. Header with Connected Hierarchy Diagram */}
      <div className="bg-white/95 border border-stone-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-widest text-stone-400">
                Planning Horizon
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200/80">
                Big Picture Connector
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
              What are you working towards eventually?
            </h2>
            <p className="text-xs text-stone-500 mt-1 max-w-2xl">
              Connect high-level aspirations to weekly focus and bite-sized actions without feeling overwhelmed today.
            </p>
          </div>

          <button
            onClick={() => setIsAddingGoal(!isAddingGoal)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-stone-900 hover:bg-black text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Big Picture Goal</span>
          </button>
        </div>

        {/* The 3-tier Connection Diagram */}
        <div className="mt-4 p-4 rounded-2xl bg-[#faf9f6] border border-[#eeebe5]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
              The Flow Horizon Pyramid
            </span>
            {onOpenPlanMonth && (
              <button
                type="button"
                onClick={onOpenPlanMonth}
                className="text-[11px] font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-teal-600" />
                <span>Plan Monthly Horizon</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-stone-200/80 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-700 block">1. Monthly Goal</span>
                <p className="font-bold text-stone-900 mt-1 line-clamp-2">
                  {topMonthlyGoal || 'No monthly goal set yet'}
                </p>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                {topMonthlyGoal ? 'Current high-level destination' : 'Tap "Plan Monthly Horizon" to set one'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-stone-200/80 flex flex-col justify-between relative">
              <div>
                <span className="text-[10px] font-black uppercase text-teal-700 block">2. Weekly Focus</span>
                <p className="font-bold text-stone-900 mt-1 line-clamp-2">
                  {topWeeklyFocus || 'No weekly focus set yet'}
                </p>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">The focused milestone for this week</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-stone-200/80 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-700 block">3. Paced Tasks</span>
                <p className="font-bold text-stone-900 mt-1">
                  {tasks.filter((t) => !t.completed).length} active tasks scheduled
                </p>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">Zero manual micro-friction</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeframe Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {(
          [
            { key: 'all', label: 'All Goals' },
            { key: 'this_month', label: 'This Month' },
            { key: 'next_month', label: 'Next Month' },
            { key: 'this_quarter', label: 'This Quarter' },
            { key: 'eventually', label: 'Eventually' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedTimeframe(tab.key)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer shrink-0 ${
              selectedTimeframe === tab.key
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            {tab.label} ({tab.key === 'all' ? goals.length : goals.filter((g) => g.timeframe === tab.key).length})
          </button>
        ))}
      </div>

      {/* Add Goal Form */}
      {isAddingGoal && (
        <form
          onSubmit={handleCreateGoal}
          className="p-5 bg-white border border-stone-300 rounded-3xl shadow-sm space-y-3 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900">Define a Big Picture Goal</h3>
            <button
              type="button"
              onClick={() => setIsAddingGoal(false)}
              className="text-xs text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Goal Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Master modern web development"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:bg-white focus:border-stone-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Weekly Focus Arc
              </label>
              <input
                type="text"
                value={newFocus}
                onChange={(e) => setNewFocus(e.target.value)}
                placeholder="e.g. Build interactive canvas prototypes"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:bg-white focus:border-stone-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500">Category:</span>
              {(['technical', 'academic', 'career', 'creative', 'personal'] as CategoryType[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setNewCategory(cat)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                    newCategory === cat
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 text-stone-600 border-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold cursor-pointer"
            >
              Save Goal
            </button>
          </div>
        </form>
      )}

      {/* 2. List of Connected Goals */}
      {filteredGoals.length === 0 ? (
        <div className="bg-white/95 border border-dashed border-stone-300 rounded-3xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">
              No Big Picture goals found
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
              {selectedTimeframe === 'all'
                ? 'Create high-level aspirations that break down into focused weekly milestones and daylight tasks.'
                : `No goals assigned to "${selectedTimeframe.replace('_', ' ')}". Create a new goal or switch filters.`}
            </p>
          </div>
          <button
            onClick={() => setIsAddingGoal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Big Picture Goal</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGoals.map((goal) => {
            const cat = CATEGORY_CONFIG[goal.category] || CATEGORY_CONFIG.technical;
            const isJustApplied = appliedGoalId === goal.id;

            return (
              <div
                key={goal.id}
                className={`bg-white/95 border rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all ${
                  goal.completed
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-stone-200/90'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-stone-100">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleCompletion(goal.id)}
                      className={`mt-1 w-5 h-5 rounded-lg flex items-center justify-center border transition-colors cursor-pointer shrink-0 ${
                        goal.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-stone-300 hover:border-stone-500 bg-white'
                      }`}
                      title={goal.completed ? 'Mark as active' : 'Mark as completed'}
                    >
                      {goal.completed && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-bold">
                          {cat.emoji} {cat.label}
                        </span>
                        <span className="text-[11px] font-semibold text-stone-400 capitalize">
                          Timeframe: {goal.timeframe.replace('_', ' ')}
                        </span>
                        {goal.completed && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Completed
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-lg sm:text-xl font-black tracking-tight ${
                          goal.completed ? 'line-through text-stone-400' : 'text-stone-900'
                        }`}
                      >
                        {goal.title}
                      </h3>

                      <p className="text-xs font-medium text-stone-600 mt-1">
                        <span className="text-stone-400 font-semibold">Weekly Focus Arc:</span>{' '}
                        {goal.weeklyFocus}
                      </p>

                      {/* Progress Bar with Quick Controls */}
                      <div className="mt-3 max-w-md">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-semibold text-stone-500">Progress</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAdjustProgress(goal.id, -10)}
                              className="w-4 h-4 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-[10px] cursor-pointer"
                              title="-10%"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold text-stone-700">{goal.progress}%</span>
                            <button
                              type="button"
                              onClick={() => handleAdjustProgress(goal.id, 10)}
                              className="w-4 h-4 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-[10px] cursor-pointer"
                              title="+10%"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div
                          className="w-full h-2 rounded-full bg-stone-100 overflow-hidden cursor-pointer"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const clickX = e.clientX - rect.left;
                            const newPct = Math.round((clickX / rect.width) * 100);
                            handleAdjustProgress(goal.id, newPct - goal.progress);
                          }}
                          title="Click to set progress"
                        >
                          <div
                            className={`h-full rounded-full transition-all ${
                              goal.completed ? 'bg-emerald-500' : 'bg-purple-600'
                            }`}
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit, Delete, Break down into schedule */}
                  <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setEditingGoal(goal)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer transition-colors"
                      title="Edit goal details and sub-actions"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-2 rounded-xl hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleBreakdownToTasks(goal)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                        isJustApplied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-900 hover:bg-black text-white active:scale-95'
                      }`}
                    >
                      {isJustApplied ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>Added to schedule!</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>Schedule Steps</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Sub-actions preview */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                      Actionable Steps ({goal.subActions?.length || 0})
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingGoal(goal)}
                      className="text-[11px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add/Edit steps</span>
                    </button>
                  </div>

                  {(!goal.subActions || goal.subActions.length === 0) ? (
                    <div className="p-3 rounded-2xl bg-stone-50/70 border border-stone-200/60 text-stone-400 text-xs text-center">
                      No actionable steps yet. Click &quot;Edit&quot; or &quot;Add/Edit steps&quot; to break down into daily sessions.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {goal.subActions.map((sub, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col justify-between"
                        >
                          <div className="text-xs font-bold text-stone-900 mb-2 line-clamp-2">
                            {sub.title}
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                            <span>📅 {sub.dayHint}</span>
                            <span>⏱️ {sub.duration}m</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Goal Modal */}
      <EditGoalModal
        isOpen={Boolean(editingGoal)}
        goal={editingGoal}
        onClose={() => setEditingGoal(null)}
        onSave={handleUpdateGoal}
        onDelete={handleDeleteGoal}
        categories={categories}
      />
    </div>
  );
};
