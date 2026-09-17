import React, { useState } from 'react';
import {
  Plus,
  Clock,
  Zap,
  AlertCircle,
  Repeat,
  FolderTree,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  EnergyLevel,
  PriorityLevel,
  ItemType,
  CategoryType,
  RecurrenceType,
  Task,
} from '../types';
import { CATEGORY_CONFIG, ITEM_TYPE_CONFIG } from '../utils/categories';

interface TaskFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt' | 'postponeCount'>) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onAddTask }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<ItemType>('task');
  const [category, setCategory] = useState<CategoryType>('academic');
  const [duration, setDuration] = useState<number>(60);
  const [energy, setEnergy] = useState<EnergyLevel>('medium');
  const [priority, setPriority] = useState<PriorityLevel>(2);
  const [deadline, setDeadline] = useState<string>('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [customDays, setCustomDays] = useState<number[]>([1, 3, 5]); // Mon, Wed, Fri default
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg('Give your item a name first.');
      return;
    }

    setErrorMsg(null);
    onAddTask({
      name: trimmed,
      type,
      category,
      duration: Number(duration),
      energy,
      priority,
      deadline: deadline || null,
      recurrence,
      customDays: recurrence === 'custom' ? customDays : undefined,
    });

    setName('');
  };

  const toggleDay = (day: number) => {
    if (customDays.includes(day)) {
      setCustomDays(customDays.filter((d) => d !== day));
    } else {
      setCustomDays([...customDays, day].sort());
    }
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div
      id="card-add-task"
      className="bg-white/95 backdrop-blur-xs border border-stone-200/90 rounded-3xl p-5 sm:p-6 shadow-xs mb-6"
    >
      <div className="flex items-center justify-between mb-3.5">
        <h2 id="heading-add-task" className="text-base sm:text-lg font-black text-stone-900">
          Add to brain dump
        </h2>
        <span className="text-xs text-[#8c8880] font-medium">Capture anything</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Item Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#54514d] mb-1.5">
            What type of item is this?
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(['task', 'goal', 'project', 'idea'] as ItemType[]).map((t) => {
              const active = type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`text-xs py-1.5 px-1 rounded-xl font-semibold border transition-all text-center cursor-pointer ${
                    active
                      ? 'bg-[#242424] text-white border-[#242424]'
                      : 'bg-[#faf9f6] text-[#666] border-[#e4e1db] hover:bg-[#edeae4]'
                  }`}
                >
                  {ITEM_TYPE_CONFIG[t].tag}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-[#888] mt-1">
            {type === 'task'
              ? '✨ Candidate for today’s actionable timetable'
              : `Safe in your brain dump / ${type} list; won't overwhelm today's timetable`}
          </p>
        </div>

        {/* Name input */}
        <div>
          <label htmlFor="taskName" className="block text-xs font-semibold text-[#54514d] mb-1">
            {type === 'task'
              ? 'What do you want to do?'
              : type === 'goal'
              ? 'What long-term goal are you working towards?'
              : type === 'project'
              ? 'What multi-step project are you planning?'
              : 'What idea or thought is on your mind?'}
          </label>
          <input
            id="taskName"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder={
              type === 'task'
                ? 'e.g. Finish psychology slides, Draft proposal'
                : type === 'goal'
                ? 'e.g. Learn Python, Master system design'
                : type === 'project'
                ? 'e.g. Build productivity web app'
                : 'e.g. Marketing analytics SaaS concept'
            }
            className={`w-full text-sm border rounded-xl px-3.5 py-2.5 bg-white text-[#242424] placeholder:text-[#a19d96] focus:outline-none transition-colors ${
              errorMsg
                ? 'border-red-400 focus:border-red-500'
                : 'border-[#ddd9d2] focus:border-[#8b8175]'
            }`}
          />
          {errorMsg && (
            <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errorMsg}
            </p>
          )}
        </div>

        {/* Category & Duration */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="taskCategory" className="block text-xs font-semibold text-[#54514d] mb-1">
              Category
            </label>
            <select
              id="taskCategory"
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryType)}
              className="w-full text-xs sm:text-sm border border-[#ddd9d2] rounded-xl px-2.5 py-2 bg-white text-[#242424] focus:outline-none focus:border-[#8b8175]"
            >
              <option value="academic">🧠 Academic / School</option>
              <option value="technical">💻 Technical / Coding</option>
              <option value="career">📊 Career / Analytics</option>
              <option value="creative">🎨 Creative</option>
              <option value="personal">🌱 Personal</option>
              <option value="admin">🏠 Life / Admin</option>
            </select>
          </div>

          <div>
            <label htmlFor="duration" className="block text-xs font-semibold text-[#54514d] mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#888]" />
              <span>Est. time</span>
            </label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full text-xs sm:text-sm border border-[#ddd9d2] rounded-xl px-2.5 py-2 bg-white text-[#242424] focus:outline-none focus:border-[#8b8175]"
            >
              <option value="15">15 min</option>
              <option value="25">25 min (Pomodoro)</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
              <option value="180">3 hours</option>
            </select>
          </div>
        </div>

        {/* Energy & Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="energy" className="block text-xs font-semibold text-[#54514d] mb-1 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#888]" />
              <span>Energy</span>
            </label>
            <select
              id="energy"
              value={energy}
              onChange={(e) => setEnergy(e.target.value as EnergyLevel)}
              className="w-full text-xs sm:text-sm border border-[#ddd9d2] rounded-xl px-2.5 py-2 bg-white text-[#242424] focus:outline-none focus:border-[#8b8175]"
            >
              <option value="low">Low (Light / Routine)</option>
              <option value="medium">Medium (Standard focus)</option>
              <option value="high">High (Deep cognitive)</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-xs font-semibold text-[#54514d] mb-1">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value) as PriorityLevel)}
              className="w-full text-xs sm:text-sm border border-[#ddd9d2] rounded-xl px-2.5 py-2 bg-white text-[#242424] focus:outline-none focus:border-[#8b8175]"
            >
              <option value="1">P1 — Low</option>
              <option value="2">P2 — Medium</option>
              <option value="3">P3 — High</option>
              <option value="4">P4 — Critical</option>
            </select>
          </div>
        </div>

        {/* Deadline & Advanced Recurrence Toggle */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="deadline" className="block text-xs font-semibold text-[#54514d]">
              Deadline (optional)
            </label>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-[#787268] hover:text-[#222] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Repeat className="w-3 h-3" />
              <span>{showAdvanced ? 'Hide recurrence' : 'Add recurrence'}</span>
              {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          <input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full text-xs sm:text-sm border border-[#ddd9d2] rounded-xl px-3 py-2 bg-white text-[#242424] focus:outline-none focus:border-[#8b8175]"
          />
        </div>

        {/* Recurrence Settings Accordion */}
        {showAdvanced && (
          <div className="p-3 bg-[#faf9f6] border border-[#e8e4dc] rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#555] flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-[#888]" />
                <span>Repeat pattern</span>
              </span>
            </div>

            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
              className="w-full text-xs border border-[#ddd9d2] rounded-lg px-2.5 py-1.5 bg-white text-[#242424]"
            >
              <option value="none">Does not repeat</option>
              <option value="daily">Daily (Every day)</option>
              <option value="weekdays">Weekdays (Mon–Fri)</option>
              <option value="weekly">Weekly (Once a week)</option>
              <option value="custom">Custom Days (e.g. 3x/week, Tue & Thu)</option>
              <option value="monthly">Monthly</option>
            </select>

            {recurrence === 'custom' && (
              <div className="pt-1.5">
                <span className="text-[11px] text-[#777] block mb-1.5 font-medium">
                  Active days:
                </span>
                <div className="flex items-center gap-1 justify-between">
                  {dayLabels.map((lbl, idx) => {
                    const isSelected = customDays.includes(idx);
                    return (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => toggleDay(idx)}
                        className={`text-[11px] py-1 px-1.5 rounded-md font-semibold border transition-all cursor-pointer flex-1 text-center ${
                          isSelected
                            ? 'bg-[#242424] text-white border-[#242424]'
                            : 'bg-white text-[#666] border-[#e2ded6]'
                        }`}
                      >
                        {lbl}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          id="btn-add-task"
          type="submit"
          className="w-full mt-2 bg-[#242424] hover:bg-[#111] text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl transition-all shadow-xs active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add to {ITEM_TYPE_CONFIG[type].tag}</span>
        </button>
      </form>
    </div>
  );
};
