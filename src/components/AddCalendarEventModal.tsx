import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Tag,
  AlertCircle,
  Zap,
  Repeat,
  FileText,
  Check,
  Flag,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import {
  Task,
  TaskIntent,
  CategoryDefinition,
  EnergyLevel,
  PriorityLevel,
  RecurrenceType,
  ItemType,
} from '../types';

interface AddCalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (task: Omit<Task, 'id' | 'completed' | 'createdAt' | 'postponeCount'>) => void;
  initialDate?: string; // YYYY-MM-DD
  categories: CategoryDefinition[];
}

const DURATION_PRESETS = [
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '45m', value: 45 },
  { label: '1h', value: 60 },
  { label: '1.5h', value: 90 },
  { label: '2h', value: 120 },
  { label: '3h', value: 180 },
];

export const AddCalendarEventModal: React.FC<AddCalendarEventModalProps> = ({
  isOpen,
  onClose,
  onAddEvent,
  initialDate,
  categories,
}) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState(() => initialDate || new Date().toISOString().slice(0, 10));
  const [isAllDay, setIsAllDay] = useState(true);
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState(60);
  const [category, setCategory] = useState<string>('academic');
  const [priority, setPriority] = useState<PriorityLevel>(2);
  const [energy, setEnergy] = useState<EnergyLevel>('medium');
  const [intent, setIntent] = useState<TaskIntent>('need');
  const [eventType, setEventType] = useState<ItemType>('task');
  const [notes, setNotes] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDate(initialDate || new Date().toISOString().slice(0, 10));
      setIsAllDay(true);
      setStartTime('09:00');
      setDuration(60);
      setCategory(categories[0]?.id || 'academic');
      setPriority(2);
      setEnergy('medium');
      setIntent('need');
      setEventType('task');
      setNotes('');
      setRecurrence('none');
      setShowAdvanced(false);
      setTimeout(() => titleInputRef.current?.focus(), 80);
    }
  }, [isOpen, initialDate, categories]);

  if (!isOpen) return null;

  const handleQuickDate = (offsetDays: number) => {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    setDate(target.toISOString().slice(0, 10));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalNotes = notes.trim();
    if (!isAllDay && startTime) {
      const timeNote = `⏰ Scheduled for ${startTime}`;
      finalNotes = finalNotes ? `${timeNote}\n\n${finalNotes}` : timeNote;
    }

    onAddEvent({
      name: name.trim(),
      type: eventType,
      intent,
      category,
      duration,
      energy,
      priority,
      deadline: date,
      scheduledDate: date,
      recurrence,
      notes: finalNotes || undefined,
    });

    onClose();
  };

  // Format date for display
  const parsedDate = date ? new Date(date + 'T00:00:00') : new Date();
  const readableDate = parsedDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      id="modal-add-calendar-event-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="modal-add-calendar-event-content"
        className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
              <CalendarIcon className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-stone-900">
                Add Event to Calendar
              </h2>
              <p className="text-[11px] text-stone-500 font-medium">
                Scheduled for {readableDate}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Title */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-stone-700 block mb-1.5">
              Event / Task Title *
            </label>
            <input
              ref={titleInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Math Midterm Exam, Team Standup, Deep Study Block"
              className="w-full text-sm font-semibold px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-stone-900 transition-all"
              required
            />
          </div>

          {/* Quick Kind Buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: '📌 Deadline', type: 'task', intentVal: 'need' },
              { label: '🗓️ Event', type: 'goal', intentVal: 'need' },
              { label: '⚡ Focus Block', type: 'task', intentVal: 'want' },
              { label: '🎯 Milestone', type: 'project', intentVal: 'need' },
            ].map((item) => {
              const active = eventType === item.type && intent === item.intentVal;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setEventType(item.type as ItemType);
                    setIntent(item.intentVal as TaskIntent);
                  }}
                  className={`py-1.5 px-2 text-[11px] font-bold rounded-xl border transition-all truncate text-center ${
                    active
                      ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Date Picker & Quick Shortcuts */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-stone-400" />
                <span>Date</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleQuickDate(0)}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-stone-100 hover:bg-stone-200 text-stone-700"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDate(1)}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-stone-100 hover:bg-stone-200 text-stone-700"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDate(7)}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-stone-100 hover:bg-stone-200 text-stone-700"
                >
                  +1 Week
                </button>
              </div>
            </div>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:bg-white focus:border-stone-900"
              required
            />
          </div>

          {/* Time & Duration */}
          <div className="p-3 rounded-2xl bg-stone-50/80 border border-stone-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-xs font-bold text-stone-800">Time & Duration</span>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-stone-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={(e) => setIsAllDay(e.target.checked)}
                  className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                />
                <span>All-day item</span>
              </label>
            </div>

            {!isAllDay && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-stone-500 font-medium">Start:</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>
            )}

            {/* Duration Presets */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1">
                Allocated Duration: {duration} mins
              </span>
              <div className="flex flex-wrap gap-1">
                {DURATION_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setDuration(p.value)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                      duration === p.value
                        ? 'bg-stone-900 text-white'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-stone-700 flex items-center gap-1.5 mb-1.5">
              <Tag className="w-3.5 h-3.5 text-stone-400" />
              <span>Category</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    category === cat.id
                      ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Advanced details */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-bold text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors"
            >
              <span>{showAdvanced ? 'Hide details' : 'More options (priority, energy, repeat, notes)'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showAdvanced && (
            <div className="space-y-3 pt-2 border-t border-stone-100 animate-in fade-in duration-150">
              {/* Priority & Energy */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1 mb-1">
                    <Flag className="w-3 h-3 text-stone-400" />
                    <span>Priority</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {([1, 2, 3, 4] as PriorityLevel[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`py-1 rounded-lg text-xs font-bold text-center border ${
                          priority === p
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        P{p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1 mb-1">
                    <Zap className="w-3 h-3 text-stone-400" />
                    <span>Energy</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['low', 'medium', 'high'] as EnergyLevel[]).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setEnergy(lvl)}
                        className={`py-1 rounded-lg text-[11px] font-bold capitalize border ${
                          energy === lvl
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recurrence */}
              <div>
                <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1 mb-1">
                  <Repeat className="w-3 h-3 text-stone-400" />
                  <span>Repeat</span>
                </label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:outline-none"
                >
                  <option value="none">Does not repeat</option>
                  <option value="daily">Every day</option>
                  <option value="weekdays">Every weekday (Mon–Fri)</option>
                  <option value="weekly">Every week on this day</option>
                  <option value="monthly">Every month</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1 mb-1">
                  <FileText className="w-3 h-3 text-stone-400" />
                  <span>Notes / Location / Agenda</span>
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional agenda, zoom link, location, or study details..."
                  className="w-full text-xs px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white resize-none"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Add to Calendar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
