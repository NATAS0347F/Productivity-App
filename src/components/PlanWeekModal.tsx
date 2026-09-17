import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  Check,
  Clock,
  Target,
  ArrowRight,
  Plus,
  Trash2,
  Layers,
  FileText,
} from 'lucide-react';
import { Task, WeekPlan } from '../types';
import { calculateWeekPlan } from '../utils/weekPlanner';
import { CATEGORY_CONFIG } from '../utils/categories';

interface PlanWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  weekPlan: WeekPlan;
  onSaveWeekPlan: (plan: WeekPlan) => void;
  onApplyWeekPlan: () => void;
  isNextWeek?: boolean;
}

export const PlanWeekModal: React.FC<PlanWeekModalProps> = ({
  isOpen,
  onClose,
  tasks,
  weekPlan,
  onSaveWeekPlan,
  onApplyWeekPlan,
  isNextWeek = false,
}) => {
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [theme, setTheme] = useState(weekPlan.theme || '');
  const [subtitle, setSubtitle] = useState(weekPlan.subtitle || '');
  const [p1, setP1] = useState(weekPlan.topPriorities?.[0] || '');
  const [p2, setP2] = useState(weekPlan.topPriorities?.[1] || '');
  const [p3, setP3] = useState(weekPlan.topPriorities?.[2] || '');
  const [fixedText, setFixedText] = useState(
    weekPlan.fixedCommitments?.join('\n') || ''
  );
  const [capacityLevel, setCapacityLevel] = useState<'low' | 'medium' | 'high'>(
    weekPlan.capacityLevel || 'medium'
  );
  const [planningNotes, setPlanningNotes] = useState(weekPlan.planningNotes || '');

  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setTheme(weekPlan.theme || '');
      setSubtitle(weekPlan.subtitle || '');
      setP1(weekPlan.topPriorities?.[0] || '');
      setP2(weekPlan.topPriorities?.[1] || '');
      setP3(weekPlan.topPriorities?.[2] || '');
      setFixedText(weekPlan.fixedCommitments?.join('\n') || '');
      setCapacityLevel(weekPlan.capacityLevel || 'medium');
      setPlanningNotes(weekPlan.planningNotes || '');
    }
  }, [isOpen, weekPlan]);

  if (!isOpen) return null;

  const generatedDistribution = calculateWeekPlan(tasks);

  // Group items into Focus, Schedule, Flexible, Backlog (Requirement #9)
  const focusItems = [p1, p2, p3].filter(Boolean);
  const scheduledTasks = tasks.filter(
    (t) => t.type === 'task' && !t.completed && (t.intent === 'need' || Boolean(t.deadline))
  );
  const flexibleTasks = tasks.filter(
    (t) => t.type === 'task' && !t.completed && t.intent === 'want' && !t.deadline
  );
  const backlogTasks = tasks.filter(
    (t) => t.type === 'idea' || t.intent === 'someday' || (!t.deadline && t.priority === 4)
  );

  const handleGenerate = () => {
    const priorities = [p1, p2, p3].map((s) => s.trim()).filter(Boolean);
    const commitments = fixedText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedPlan: WeekPlan = {
      ...weekPlan,
      theme: theme.trim() || 'Weekly Focus',
      subtitle: subtitle.trim() || undefined,
      topPriorities: priorities,
      fixedCommitments: commitments,
      capacityLevel,
      planningNotes: planningNotes.trim(),
    };

    onSaveWeekPlan(updatedPlan);
    setStep('preview');
  };

  const handleConfirmApply = () => {
    onApplyWeekPlan();
    onClose();
  };

  return (
    <div
      id="plan-week-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="plan-week-modal-content"
        className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full p-5 sm:p-7 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">
                {isNextWeek ? 'Plan Next Week' : 'Plan My Week'}
              </h3>
              <p className="text-xs text-stone-500">
                {step === 'input'
                  ? 'Set your intentional anchor before filling the schedule.'
                  : 'Flow’s paced suggestion: Focus, Schedule, Flexible & Backlog.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {step === 'input' ? (
            <>
              {/* 1. Week Theme */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  1. What is this week’s theme? (Optional)
                </label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g. Week 1: Get Back Into Learning"
                  className="w-full text-sm font-medium px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:bg-white focus:border-stone-900"
                />
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Subtitle: e.g. Gentle momentum, protect morning focus..."
                  className="w-full text-xs font-normal px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 focus:outline-none focus:bg-white focus:border-stone-900 mt-1.5"
                />
              </div>

              {/* 2. Top 1-3 Priorities */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  2. What are the 1–3 things that matter most?
                </label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={p1}
                    onChange={(e) => setP1(e.target.value)}
                    placeholder="Priority 1: e.g. Psychology redo prep"
                    className="w-full text-xs sm:text-sm font-medium px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:bg-white focus:border-stone-900"
                  />
                  <input
                    type="text"
                    value={p2}
                    onChange={(e) => setP2(e.target.value)}
                    placeholder="Priority 2: e.g. Get back into Python (30-45m)"
                    className="w-full text-xs sm:text-sm font-medium px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:bg-white focus:border-stone-900"
                  />
                  <input
                    type="text"
                    value={p3}
                    onChange={(e) => setP3(e.target.value)}
                    placeholder="Priority 3: e.g. Exercise consistently & sleep on time"
                    className="w-full text-xs sm:text-sm font-medium px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:bg-white focus:border-stone-900"
                  />
                </div>
              </div>

              {/* 3. Fixed Commitments */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  3. What commitments are fixed? (Classes, appointments, calls)
                </label>
                <textarea
                  rows={2}
                  value={fixedText}
                  onChange={(e) => setFixedText(e.target.value)}
                  placeholder="One per line (e.g. Tuesday 10am Psychology Lecture)"
                  className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:outline-none focus:bg-white focus:border-stone-900"
                />
              </div>

              {/* 4. Capacity Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  4. How much capacity do you have this week?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'low', label: 'Low Capacity', desc: 'Light pace, essential commitments only' },
                    { id: 'medium', label: 'Medium Capacity', desc: 'Balanced rhythm, steady stride' },
                    { id: 'high', label: 'High Capacity', desc: 'Ready for deep project sprints' },
                  ].map((cap) => (
                    <button
                      key={cap.id}
                      type="button"
                      onClick={() => setCapacityLevel(cap.id as any)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        capacityLevel === cap.id
                          ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                          : 'bg-stone-50 border-stone-200 text-stone-800 hover:bg-stone-100'
                      }`}
                    >
                      <div className="text-xs font-bold">{cap.label}</div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          capacityLevel === cap.id ? 'text-stone-300' : 'text-stone-500'
                        }`}
                      >
                        {cap.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Personal Planning Canvas (Requirement #13) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-stone-400" />
                  <span>5. Personal Planning Thoughts (Free-form canvas)</span>
                </label>
                <textarea
                  rows={3}
                  value={planningNotes}
                  onChange={(e) => setPlanningNotes(e.target.value)}
                  placeholder="e.g. Next week I want to focus on getting back into studying, learn a little Python, and not overwhelm myself..."
                  className="w-full text-xs font-normal px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:outline-none focus:bg-white focus:border-stone-900 leading-relaxed resize-y"
                />
              </div>
            </>
          ) : (
            /* Step 2: Flow's Generated Paced Breakdown */
            <div className="space-y-4">
              {/* Active Theme Anchor */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                  Weekly Theme Anchor
                </span>
                <div className="text-base font-black text-stone-900 mt-0.5">{theme}</div>
                {subtitle && <p className="text-xs text-stone-600 mt-0.5">{subtitle}</p>}
              </div>

              {/* 4 Paced Sections: FOCUS, SCHEDULE, FLEXIBLE, BACKLOG */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 🎯 1. FOCUS: Top Priorities */}
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200">
                  <span className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5 mb-2">
                    <span>🎯</span>
                    <span>1. Focus (What matters most)</span>
                  </span>
                  <div className="space-y-1.5">
                    {focusItems.length === 0 ? (
                      <span className="text-xs text-stone-400 italic">No priorities specified</span>
                    ) : (
                      focusItems.map((item, i) => (
                        <div
                          key={i}
                          className="text-xs font-semibold p-2 rounded-xl bg-stone-50 border border-stone-200/80 text-stone-900"
                        >
                          {i + 1}. {item}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 📅 2. SCHEDULE: Commitments & Deadlines */}
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200">
                  <span className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5 mb-2">
                    <span>📅</span>
                    <span>2. Schedule ({scheduledTasks.length} committed)</span>
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {scheduledTasks.slice(0, 4).map((task) => (
                      <div
                        key={task.id}
                        className="text-xs p-2 rounded-xl bg-rose-50/50 border border-rose-200/70 text-rose-950 flex items-center justify-between"
                      >
                        <span className="font-semibold truncate">📌 {task.name}</span>
                        <span className="text-[10px] font-mono text-rose-600 shrink-0">
                          {task.deadline || `${task.duration}m`}
                        </span>
                      </div>
                    ))}
                    {scheduledTasks.length === 0 && (
                      <span className="text-xs text-stone-400 italic">No urgent deadlines</span>
                    )}
                  </div>
                </div>

                {/* 🌱 3. FLEXIBLE: Want to do */}
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200">
                  <span className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5 mb-2">
                    <span>🌱</span>
                    <span>3. Flexible ({flexibleTasks.length} as daylight allows)</span>
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {flexibleTasks.slice(0, 4).map((task) => (
                      <div
                        key={task.id}
                        className="text-xs p-2 rounded-xl bg-emerald-50/50 border border-emerald-200/70 text-emerald-950 flex items-center justify-between"
                      >
                        <span className="font-semibold truncate">🌱 {task.name}</span>
                        <span className="text-[10px] font-mono text-emerald-600 shrink-0">
                          {task.duration}m
                        </span>
                      </div>
                    ))}
                    {flexibleTasks.length === 0 && (
                      <span className="text-xs text-stone-400 italic">No flexible items</span>
                    )}
                  </div>
                </div>

                {/* 💭 4. BACKLOG: Not this week */}
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200">
                  <span className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5 mb-2">
                    <span>💭</span>
                    <span>4. Backlog / Someday (Protected off-schedule)</span>
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {backlogTasks.slice(0, 4).map((task) => (
                      <div
                        key={task.id}
                        className="text-xs p-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 truncate"
                      >
                        💭 {task.name}
                      </div>
                    ))}
                    {backlogTasks.length === 0 && (
                      <span className="text-xs text-stone-400 italic">Backlog is clear</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between shrink-0">
          {step === 'preview' ? (
            <button
              type="button"
              onClick={() => setStep('input')}
              className="text-xs font-bold text-stone-600 hover:text-stone-900 px-3 py-2 rounded-xl hover:bg-stone-100 cursor-pointer"
            >
              ← Edit inputs
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
            >
              Cancel
            </button>

            {step === 'input' ? (
              <button
                type="button"
                onClick={handleGenerate}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Generate suggested week</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmApply}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Apply balanced schedule</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
