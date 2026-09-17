import React, { useState, useEffect } from 'react';
import { X, Sparkles, Target, Calendar, Check, ArrowRight, Plus, Compass } from 'lucide-react';
import { MonthPlan, Task } from '../types';

interface PlanMonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthPlan: MonthPlan;
  tasks: Task[];
  onSaveMonthPlan: (plan: MonthPlan) => void;
}

export const PlanMonthModal: React.FC<PlanMonthModalProps> = ({
  isOpen,
  onClose,
  monthPlan,
  tasks,
  onSaveMonthPlan,
}) => {
  const [theme, setTheme] = useState(monthPlan.theme || '');
  const [subtitle, setSubtitle] = useState(monthPlan.subtitle || '');
  const [accentColor, setAccentColor] = useState(monthPlan.accentColor || '');
  const [g1, setG1] = useState(monthPlan.majorGoals?.[0] || '');
  const [g2, setG2] = useState(monthPlan.majorGoals?.[1] || '');
  const [g3, setG3] = useState(monthPlan.majorGoals?.[2] || '');
  const [projectsText, setProjectsText] = useState(
    monthPlan.currentProjects?.join('\n') || ''
  );
  const [moreOf, setMoreOf] = useState(monthPlan.moreOf || '');
  const [lessOf, setLessOf] = useState(monthPlan.lessOf || '');
  const [planningNotes, setPlanningNotes] = useState(monthPlan.planningNotes || '');

  // 4 Weekly Themes mapping
  const [w1, setW1] = useState(monthPlan.weeklyThemes?.[0]?.title || 'Get Back Into Rhythm');
  const [w1Focus, setW1Focus] = useState(monthPlan.weeklyThemes?.[0]?.focus || 'Bite-sized habits');
  const [w2, setW2] = useState(monthPlan.weeklyThemes?.[1]?.title || 'Build & Explore');
  const [w2Focus, setW2Focus] = useState(monthPlan.weeklyThemes?.[1]?.focus || 'Technical fundamentals');
  const [w3, setW3] = useState(monthPlan.weeklyThemes?.[2]?.title || 'Academic Catch-Up');
  const [w3Focus, setW3Focus] = useState(monthPlan.weeklyThemes?.[2]?.focus || 'Slide reviews & assignments');
  const [w4, setW4] = useState(monthPlan.weeklyThemes?.[3]?.title || 'Sustainable Consolidation');
  const [w4Focus, setW4Focus] = useState(monthPlan.weeklyThemes?.[3]?.focus || 'Review wins and celebrate');

  useEffect(() => {
    if (isOpen) {
      setTheme(monthPlan.theme || '');
      setSubtitle(monthPlan.subtitle || '');
      setAccentColor(monthPlan.accentColor || '');
      setG1(monthPlan.majorGoals?.[0] || '');
      setG2(monthPlan.majorGoals?.[1] || '');
      setG3(monthPlan.majorGoals?.[2] || '');
      setProjectsText(monthPlan.currentProjects?.join('\n') || '');
      setMoreOf(monthPlan.moreOf || '');
      setLessOf(monthPlan.lessOf || '');
      setPlanningNotes(monthPlan.planningNotes || '');
      setW1(monthPlan.weeklyThemes?.[0]?.title || '');
      setW1Focus(monthPlan.weeklyThemes?.[0]?.focus || '');
      setW2(monthPlan.weeklyThemes?.[1]?.title || '');
      setW2Focus(monthPlan.weeklyThemes?.[1]?.focus || '');
      setW3(monthPlan.weeklyThemes?.[2]?.title || '');
      setW3Focus(monthPlan.weeklyThemes?.[2]?.focus || '');
      setW4(monthPlan.weeklyThemes?.[3]?.title || '');
      setW4Focus(monthPlan.weeklyThemes?.[3]?.focus || '');
    }
  }, [isOpen, monthPlan]);

  if (!isOpen) return null;

  const handleSave = () => {
    const goals = [g1, g2, g3].map((s) => s.trim()).filter(Boolean);
    const projects = projectsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const updated: MonthPlan = {
      ...monthPlan,
      theme: theme.trim() || 'Monthly Horizon',
      subtitle: subtitle.trim() || undefined,
      majorGoals: goals,
      currentProjects: projects,
      moreOf: moreOf.trim() || undefined,
      lessOf: lessOf.trim() || undefined,
      planningNotes: planningNotes.trim(),
      weeklyThemes: [
        { weekNumber: 1, title: w1.trim(), focus: w1Focus.trim() },
        { weekNumber: 2, title: w2.trim(), focus: w2Focus.trim() },
        { weekNumber: 3, title: w3.trim(), focus: w3Focus.trim() },
        { weekNumber: 4, title: w4.trim(), focus: w4Focus.trim() },
      ],
    };

    onSaveMonthPlan(updated);
    onClose();
  };

  return (
    <div
      id="plan-month-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="plan-month-modal-content"
        className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full p-5 sm:p-7 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">Plan My Month</h3>
              <p className="text-xs text-stone-500">
                Set overarching goals and translate them into weekly focus arcs.
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

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* 1. Month Theme */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              1. What is this month’s theme?
            </label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. September: Reset & Rebuild"
              className="w-full text-sm font-medium px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:bg-white focus:border-stone-900"
            />
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Subtitle: e.g. A month for getting back into rhythm..."
              className="w-full text-xs font-normal px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 focus:outline-none focus:bg-white focus:border-stone-900 mt-1.5"
            />
          </div>

          {/* 2. Major Goals */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              2. What are your 1–3 major goals this month?
            </label>
            <div className="space-y-1.5">
              <input
                type="text"
                value={g1}
                onChange={(e) => setG1(e.target.value)}
                placeholder="Goal 1: e.g. Improve technical skills (Learn Python)"
                className="w-full text-xs sm:text-sm font-medium px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:bg-white focus:border-stone-900"
              />
              <input
                type="text"
                value={g2}
                onChange={(e) => setG2(e.target.value)}
                placeholder="Goal 2: e.g. Get back into academic studying rhythm"
                className="w-full text-xs sm:text-sm font-medium px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:bg-white focus:border-stone-900"
              />
              <input
                type="text"
                value={g3}
                onChange={(e) => setG3(e.target.value)}
                placeholder="Goal 3: e.g. Health: daily walks & reset sleep routine"
                className="w-full text-xs sm:text-sm font-medium px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:bg-white focus:border-stone-900"
              />
            </div>
          </div>

          {/* 3. Projects */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              3. What projects are you working on?
            </label>
            <textarea
              rows={2}
              value={projectsText}
              onChange={(e) => setProjectsText(e.target.value)}
              placeholder="One per line (e.g. Psychology Slide Revisions)"
              className="w-full text-xs font-normal px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:outline-none focus:bg-white focus:border-stone-900"
            />
          </div>

          {/* 4. More of / Less of */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                More of this month:
              </label>
              <input
                type="text"
                value={moreOf}
                onChange={(e) => setMoreOf(e.target.value)}
                placeholder="e.g. Deep morning focus, daylight walks"
                className="w-full text-xs px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:bg-white focus:border-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-rose-800 mb-1">
                Less of this month:
              </label>
              <input
                type="text"
                value={lessOf}
                onChange={(e) => setLessOf(e.target.value)}
                placeholder="e.g. Panic rushing, guilt over pauses"
                className="w-full text-xs px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:bg-white focus:border-stone-900"
              />
            </div>
          </div>

          {/* 5. Weekly Focus Translation Arcs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              5. Translate into 4 Weekly Focus Arcs:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[10px] font-black uppercase text-stone-500">Week 1 Theme</span>
                <input
                  type="text"
                  value={w1}
                  onChange={(e) => setW1(e.target.value)}
                  className="w-full text-xs font-bold bg-white px-2 py-1 rounded border border-stone-200"
                />
                <input
                  type="text"
                  value={w1Focus}
                  onChange={(e) => setW1Focus(e.target.value)}
                  placeholder="Focus detail..."
                  className="w-full text-[11px] bg-white px-2 py-1 rounded border border-stone-200 text-stone-600"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[10px] font-black uppercase text-stone-500">Week 2 Theme</span>
                <input
                  type="text"
                  value={w2}
                  onChange={(e) => setW2(e.target.value)}
                  className="w-full text-xs font-bold bg-white px-2 py-1 rounded border border-stone-200"
                />
                <input
                  type="text"
                  value={w2Focus}
                  onChange={(e) => setW2Focus(e.target.value)}
                  placeholder="Focus detail..."
                  className="w-full text-[11px] bg-white px-2 py-1 rounded border border-stone-200 text-stone-600"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[10px] font-black uppercase text-stone-500">Week 3 Theme</span>
                <input
                  type="text"
                  value={w3}
                  onChange={(e) => setW3(e.target.value)}
                  className="w-full text-xs font-bold bg-white px-2 py-1 rounded border border-stone-200"
                />
                <input
                  type="text"
                  value={w3Focus}
                  onChange={(e) => setW3Focus(e.target.value)}
                  placeholder="Focus detail..."
                  className="w-full text-[11px] bg-white px-2 py-1 rounded border border-stone-200 text-stone-600"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[10px] font-black uppercase text-stone-500">Week 4 Theme</span>
                <input
                  type="text"
                  value={w4}
                  onChange={(e) => setW4(e.target.value)}
                  className="w-full text-xs font-bold bg-white px-2 py-1 rounded border border-stone-200"
                />
                <input
                  type="text"
                  value={w4Focus}
                  onChange={(e) => setW4Focus(e.target.value)}
                  placeholder="Focus detail..."
                  className="w-full text-[11px] bg-white px-2 py-1 rounded border border-stone-200 text-stone-600"
                />
              </div>
            </div>
          </div>

          {/* 6. Personal Planning Canvas */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              6. Personal Planning Thoughts (Free-form canvas)
            </label>
            <textarea
              rows={2}
              value={planningNotes}
              onChange={(e) => setPlanningNotes(e.target.value)}
              placeholder="e.g. This month is about steady, gentle momentum. One day at a time..."
              className="w-full text-xs font-normal px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:outline-none focus:bg-white focus:border-stone-900"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Save Monthly Horizon</span>
          </button>
        </div>
      </div>
    </div>
  );
};
