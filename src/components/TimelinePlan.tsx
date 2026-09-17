import React, { useState, useEffect, useMemo } from 'react';
import {
  Check,
  Coffee,
  AlertCircle,
  Play,
  Clock,
  Sparkles,
  Utensils,
  Sun,
  GripVertical,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Calendar,
  Plus,
  ArrowRight,
  ListTodo,
  CheckCircle2,
  Filter,
  Zap,
  Tag,
  Sunrise,
} from 'lucide-react';
import {
  ScheduleResult,
  Task,
  BlockType,
  ScheduleBlock,
  CapacitySettings,
  CategoryDefinition,
  PriorityLevel,
  EnergyLevel,
} from '../types';
import {
  formatMinutes,
  minutesTo12Hour,
  formatTimeRange,
  generateSchedule,
  recalculateBlockTimes,
  timeToMinutes,
} from '../utils/scheduler';
import { getCategoryStyle, CATEGORY_CONFIG } from '../utils/categories';
import {
  playRelaxingClick,
  playCompletionDing,
  playDragSound,
  playTabSound,
} from '../utils/sound';

interface TimelinePlanProps {
  scheduleResult: ScheduleResult;
  tasks: Task[];
  capacity: CapacitySettings;
  categories?: CategoryDefinition[];
  onToggleTask: (id: number) => void;
  onBreakdownTask?: (id: number) => void;
  onStartFocusSession?: (task: Task) => void;
  onAddTask?: (task: Omit<Task, 'id' | 'completed' | 'createdAt' | 'postponeCount'>) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: number) => void;
}

type TimelineTab = 'today' | 'tomorrow' | 'tasks';

export const TimelinePlan: React.FC<TimelinePlanProps> = ({
  scheduleResult,
  tasks,
  capacity,
  categories = [],
  onToggleTask,
  onBreakdownTask,
  onStartFocusSession,
  onAddTask,
  onEditTask,
  onDeleteTask,
}) => {
  const [activeTab, setActiveTab] = useState<TimelineTab>('today');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [startFromNow, setStartFromNow] = useState<boolean>(true);

  // Custom reordered blocks for Today and Tomorrow
  const [customTodayBlocks, setCustomTodayBlocks] = useState<ScheduleBlock[] | null>(null);
  const [customTomorrowBlocks, setCustomTomorrowBlocks] = useState<ScheduleBlock[] | null>(null);

  // Drag state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Today's Tasks quick-add input & filter
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState(30);
  const [newTaskCategory, setNewTaskCategory] = useState<string>(categories[0]?.id || 'academic');
  const [taskFilter, setTaskFilter] = useState<'all' | 'high' | 'quick' | 'incomplete'>('incomplete');

  // Live timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const nowMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();
  const roundedNow = Math.floor(nowMinutes / 15) * 15;
  const nowTimeString = currentDate.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  // Effective base schedule for Today
  const baseTodaySchedule = useMemo(() => {
    return generateSchedule(tasks, capacity, currentDate, startFromNow);
  }, [tasks, capacity, currentDate, startFromNow]);

  // Tomorrow's Date and Schedule
  const tomorrowDate = useMemo(() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    return d;
  }, [currentDate]);

  const tomorrowDateString = tomorrowDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const baseTomorrowSchedule = useMemo(() => {
    // Tomorrow schedule starts at capacity.startTime (e.g. 9:00 AM)
    return generateSchedule(tasks, capacity, tomorrowDate, false);
  }, [tasks, capacity, tomorrowDate]);

  // Active blocks depending on active tab
  const activeScheduleBlocks = useMemo(() => {
    if (activeTab === 'today') {
      if (customTodayBlocks) return customTodayBlocks;
      return baseTodaySchedule.schedule;
    }
    if (activeTab === 'tomorrow') {
      if (customTomorrowBlocks) return customTomorrowBlocks;
      return baseTomorrowSchedule.schedule;
    }
    return [];
  }, [activeTab, customTodayBlocks, baseTodaySchedule.schedule, customTomorrowBlocks, baseTomorrowSchedule.schedule]);

  // Reset custom order if base tasks change significantly
  useEffect(() => {
    setCustomTodayBlocks(null);
  }, [tasks.length, startFromNow]);

  useEffect(() => {
    setCustomTomorrowBlocks(null);
  }, [tasks.length]);

  // Timeline starting minute
  const timelineStartMin = useMemo(() => {
    if (activeTab === 'today') {
      return startFromNow ? Math.max(0, roundedNow) : timeToMinutes(capacity.startTime);
    }
    return timeToMinutes(capacity.startTime);
  }, [activeTab, startFromNow, roundedNow, capacity.startTime]);

  // Handle Drag and Drop Reordering
  const handleDragStart = (idx: number, e: React.DragEvent) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
    playDragSound();
  };

  const handleDragOver = (idx: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIdx !== idx) {
      setDragOverIdx(idx);
    }
  };

  const handleDrop = (dropIdx: number, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === dropIdx) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }

    const currentBlocks = [...activeScheduleBlocks];
    const [movedItem] = currentBlocks.splice(draggedIdx, 1);
    currentBlocks.splice(dropIdx, 0, movedItem);

    // Recalculate block times sequentially
    const updated = recalculateBlockTimes(currentBlocks, timelineStartMin);

    if (activeTab === 'today') {
      setCustomTodayBlocks(updated);
    } else {
      setCustomTomorrowBlocks(updated);
    }

    playDragSound();
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleMoveBlock = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= activeScheduleBlocks.length) return;

    const currentBlocks = [...activeScheduleBlocks];
    const [movedItem] = currentBlocks.splice(idx, 1);
    currentBlocks.splice(targetIdx, 0, movedItem);

    const updated = recalculateBlockTimes(currentBlocks, timelineStartMin);

    if (activeTab === 'today') {
      setCustomTodayBlocks(updated);
    } else {
      setCustomTomorrowBlocks(updated);
    }

    playDragSound();
  };

  const handleResetOrder = () => {
    playRelaxingClick();
    if (activeTab === 'today') {
      setCustomTodayBlocks(null);
    } else {
      setCustomTomorrowBlocks(null);
    }
  };

  // Switch tab with relaxing sound
  const handleTabChange = (tab: TimelineTab) => {
    playTabSound();
    setActiveTab(tab);
  };

  // Toggle task with completion sound
  const handleTaskToggle = (id: number) => {
    playCompletionDing();
    onToggleTask(id);
  };

  // Quick Add task for today's list
  const handleQuickAddForToday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim() || !onAddTask) return;

    playRelaxingClick();
    onAddTask({
      name: newTaskName.trim(),
      type: 'task',
      category: (newTaskCategory as any) || 'academic',
      duration: newTaskDuration,
      energy: 'medium',
      priority: 2,
      deadline: currentDate.toISOString().slice(0, 10),
      recurrence: 'none',
    });

    setNewTaskName('');
  };

  // Today's tasks filtered list
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.type !== 'task') return false;
      if (taskFilter === 'incomplete') return !t.completed;
      if (taskFilter === 'high') return t.priority >= 3 && !t.completed;
      if (taskFilter === 'quick') return t.duration <= 30 && !t.completed;
      return true; // 'all'
    });
  }, [tasks, taskFilter]);

  const totalWorkMinutes = activeScheduleBlocks
    .filter((s) => s.type === 'work')
    .reduce((sum, s) => sum + s.duration, 0);

  const totalBreakMinutes = activeScheduleBlocks
    .filter((s) => s.type === 'break' || s.type === 'meal')
    .reduce((sum, s) => sum + s.duration, 0);

  const isCustom = activeTab === 'today' ? !!customTodayBlocks : !!customTomorrowBlocks;

  return (
    <div
      id="card-level-2-timeline"
      className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs relative"
    >
      {/* Top Header: View Switcher (Today Timeline, Tomorrow Timeline, Today's Tasks) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-stone-200/80">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 border border-stone-200/90 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            id="tab-timeline-today"
            type="button"
            onClick={() => handleTabChange('today')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'today'
                ? 'bg-white text-stone-900 shadow-2xs font-extrabold'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Today's Timeline</span>
          </button>

          <button
            id="tab-timeline-tomorrow"
            type="button"
            onClick={() => handleTabChange('tomorrow')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'tomorrow'
                ? 'bg-white text-stone-900 shadow-2xs font-extrabold'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Sunrise className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tomorrow's Timeline</span>
          </button>

          <button
            id="tab-timeline-tasks"
            type="button"
            onClick={() => handleTabChange('tasks')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'bg-white text-stone-900 shadow-2xs font-extrabold'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5 text-emerald-600" />
            <span>Today's Tasks</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
              {tasks.filter((t) => !t.completed && t.type === 'task').length}
            </span>
          </button>
        </div>

        {/* Right Info: Start Time badge & focus metric */}
        <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
          {activeTab === 'today' && (
            <button
              type="button"
              onClick={() => {
                playRelaxingClick();
                setStartFromNow(!startFromNow);
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title={startFromNow ? 'Click to start at scheduled 9:00 AM' : 'Click to anchor timeline to current time'}
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>{startFromNow ? `Starts Now (${minutesTo12Hour(timelineStartMin)})` : `Starts ${minutesTo12Hour(timelineStartMin)}`}</span>
            </button>
          )}

          {activeTab === 'tomorrow' && (
            <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] font-bold font-sans">
              🌅 {tomorrowDateString}
            </span>
          )}

          {activeTab !== 'tasks' && (
            <>
              <span className="text-stone-700 font-semibold font-sans">
                {formatMinutes(totalWorkMinutes)} focus
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-stone-500 font-sans">
                {formatMinutes(totalBreakMinutes)} rest
              </span>
            </>
          )}

          {isCustom && (
            <button
              type="button"
              onClick={handleResetOrder}
              className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-600 text-[11px] font-sans font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Reset to automated priority schedule"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset order</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1 & 2: TODAY & TOMORROW TIMELINES */}
      {(activeTab === 'today' || activeTab === 'tomorrow') && (
        <>
          {/* Subtitle helper / drag hint */}
          <div className="flex items-center justify-between text-xs text-stone-400 mb-3 px-1">
            <div className="flex items-center gap-1.5 font-medium">
              <GripVertical className="w-3.5 h-3.5 text-stone-400" />
              <span>Drag any activity by its handle to reorder your schedule.</span>
            </div>
            {activeTab === 'today' && startFromNow && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Dynamic Sync
              </span>
            )}
          </div>

          {/* Schedule Timeline List */}
          {activeScheduleBlocks.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-stone-200 rounded-xl text-stone-400 bg-stone-50/50">
              <p className="text-sm font-semibold text-stone-600 mb-1">
                {activeTab === 'today' ? 'Timeline is clear' : 'Tomorrow is open'}
              </p>
              <p className="text-xs">
                {activeTab === 'today'
                  ? 'Add tasks to your brain dump or Today’s Tasks tab to generate your timetable.'
                  : 'Tasks will be scheduled automatically based on your weekly intentions.'}
              </p>
            </div>
          ) : (
            <div id="scheduleTimeline" className="divide-y divide-stone-100">
              {activeScheduleBlocks.map((block, idx) => {
                const isWork = block.type === 'work';
                const isBreak = block.type === 'break';
                const isMeal = block.type === 'meal';
                const isFree = block.type === 'free';
                const isBuffer = block.type === 'buffer';

                const catKey = (block.category ||
                  (isBreak ? 'break' : isMeal ? 'meal' : isFree || isBuffer ? 'free' : 'academic')) as string;
                const style = getCategoryStyle(catKey, categories);

                const blockStart = block.start;
                const blockEnd = block.start + block.duration;
                const isCurrentActive =
                  activeTab === 'today' && nowMinutes >= blockStart && nowMinutes < blockEnd;

                // Check if NOW line should appear before this block in Today's view
                const prevBlock = idx > 0 ? activeScheduleBlocks[idx - 1] : null;
                const showNowLineBefore =
                  activeTab === 'today' &&
                  prevBlock &&
                  nowMinutes >= prevBlock.start + prevBlock.duration &&
                  nowMinutes < blockStart;

                const isBeingDragged = draggedIdx === idx;
                const isTargetDrop = dragOverIdx === idx && draggedIdx !== idx;

                return (
                  <React.Fragment key={block.id || `block-${idx}`}>
                    {/* Visual NOW Line divider */}
                    {showNowLineBefore && (
                      <div className="py-2.5 flex items-center gap-3">
                        <div className="flex-1 h-0.5 bg-amber-400" />
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-900 text-amber-300 font-bold text-[11px] font-mono shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                          <span>{nowTimeString} · NOW</span>
                        </div>
                        <div className="flex-1 h-0.5 bg-amber-400" />
                      </div>
                    )}

                    {/* Scannable Draggable Row */}
                    <div
                      id={`timeline-row-${block.id}`}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(idx, e)}
                      onDragOver={(e) => handleDragOver(idx, e)}
                      onDrop={(e) => handleDrop(idx, e)}
                      onDragEnd={() => {
                        setDraggedIdx(null);
                        setDragOverIdx(null);
                      }}
                      className={`py-3.5 px-2 sm:px-3 rounded-xl transition-all flex items-start sm:items-center justify-between gap-3 group relative cursor-grab active:cursor-grabbing select-none ${
                        isBeingDragged
                          ? 'opacity-40 scale-[0.99] bg-stone-100 border border-dashed border-stone-400'
                          : isTargetDrop
                          ? 'bg-amber-100/70 border-2 border-amber-400'
                          : isCurrentActive
                          ? 'bg-amber-50/70 border border-amber-300/80 shadow-2xs'
                          : 'hover:bg-stone-50/80'
                      }`}
                    >
                      {/* Left: Drag Handle + Time + Category Icon + Title */}
                      <div className="flex items-start sm:items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                        {/* Drag Handle & Up/Down Arrows */}
                        <div className="flex items-center gap-0.5 shrink-0 text-stone-300 group-hover:text-stone-500">
                          <GripVertical className="w-4 h-4 cursor-grab" />
                          <div className="hidden sm:flex flex-col -space-y-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveBlock(idx, 'up');
                              }}
                              disabled={idx === 0}
                              className="p-0.5 text-stone-400 hover:text-stone-800 disabled:opacity-20 cursor-pointer"
                              title="Move earlier"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveBlock(idx, 'down');
                              }}
                              disabled={idx === activeScheduleBlocks.length - 1}
                              className="p-0.5 text-stone-400 hover:text-stone-800 disabled:opacity-20 cursor-pointer"
                              title="Move later"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Time Column (Medium font, highly legible) */}
                        <div className="w-20 sm:w-24 shrink-0 text-left">
                          <div className="text-xs sm:text-sm font-bold font-mono text-stone-900 leading-tight">
                            {minutesTo12Hour(block.start)}
                          </div>
                          <div className="text-[11px] text-stone-400 font-mono">
                            {formatMinutes(block.duration)}
                          </div>
                        </div>

                        {/* Emoji + Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base sm:text-lg leading-none shrink-0">
                              {style.emoji}
                            </span>

                            <span
                              className={`text-sm sm:text-base font-bold leading-snug ${
                                block.originalTask?.completed
                                  ? 'line-through text-stone-400'
                                  : isCurrentActive
                                  ? 'text-stone-950 font-extrabold'
                                  : isWork
                                  ? 'text-stone-900'
                                  : 'text-stone-600'
                              }`}
                            >
                              {block.title}
                            </span>

                            {isCurrentActive && (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-stone-900 text-amber-300 font-mono tracking-wider">
                                ACTIVE
                              </span>
                            )}
                          </div>

                          {block.subtitle && !block.originalTask?.completed && (
                            <p className="text-xs text-stone-400 mt-0.5 truncate max-w-md">
                              {block.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Quick Action Buttons for work tasks */}
                      {isWork && block.taskId && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {onStartFocusSession && block.originalTask && !block.originalTask.completed && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                playRelaxingClick();
                                onStartFocusSession(block.originalTask!);
                              }}
                              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="Start focus timer"
                            >
                              <Play className="w-3 h-3" />
                              <span className="hidden sm:inline">Focus</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTaskToggle(block.taskId!);
                            }}
                            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                              block.originalTask?.completed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-100 hover:bg-emerald-600 hover:text-white text-stone-700'
                            }`}
                            title={block.originalTask?.completed ? 'Completed' : 'Mark done'}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">
                              {block.originalTask?.completed ? 'Done' : 'Done'}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* VIEW 3: TODAY'S TASKS (Dedicated Focus Checklist) */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Quick Input Form to Add Task Directly to Today */}
          <form onSubmit={handleQuickAddForToday} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="Add a task for today..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
            <div className="flex items-center gap-2">
              <select
                value={newTaskDuration}
                onChange={(e) => setNewTaskDuration(Number(e.target.value))}
                className="px-2.5 py-2 rounded-xl border border-stone-200 text-xs font-mono font-semibold bg-white"
              >
                <option value={15}>15 min</option>
                <option value={25}>25 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1 hr</option>
                <option value={90}>1.5 hr</option>
              </select>

              <select
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                className="px-2.5 py-2 rounded-xl border border-stone-200 text-xs font-bold bg-white max-w-[130px] truncate"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.name}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={!newTaskName.trim()}
                className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </form>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                playTabSound();
                setTaskFilter('incomplete');
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                taskFilter === 'incomplete'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              To Do ({tasks.filter((t) => !t.completed && t.type === 'task').length})
            </button>
            <button
              type="button"
              onClick={() => {
                playTabSound();
                setTaskFilter('high');
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                taskFilter === 'high'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              🔥 High Priority
            </button>
            <button
              type="button"
              onClick={() => {
                playTabSound();
                setTaskFilter('quick');
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                taskFilter === 'quick'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              ⚡ Quick Wins (≤30m)
            </button>
            <button
              type="button"
              onClick={() => {
                playTabSound();
                setTaskFilter('all');
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                taskFilter === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All
            </button>
          </div>

          {/* Task Items List */}
          {todayTasks.length === 0 ? (
            <div className="text-center py-10 px-4 border border-dashed border-stone-200 rounded-xl text-stone-400 bg-stone-50/50">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-80" />
              <p className="text-sm font-bold text-stone-700">All caught up!</p>
              <p className="text-xs text-stone-500 mt-1">No matching tasks for today right now.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {todayTasks.map((t) => {
                const style = getCategoryStyle(t.category, categories);
                return (
                  <div
                    key={t.id}
                    className="py-3 px-2 rounded-xl hover:bg-stone-50/90 transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => handleTaskToggle(t.id)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                          t.completed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-stone-300 hover:border-emerald-500 bg-white'
                        }`}
                      >
                        {t.completed && <Check className="w-3.5 h-3.5" />}
                      </button>

                      {/* Title & Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm shrink-0">{style.emoji}</span>
                          <span
                            className={`text-sm font-bold truncate ${
                              t.completed ? 'line-through text-stone-400' : 'text-stone-900'
                            }`}
                          >
                            {t.name}
                          </span>

                          <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-stone-100 text-stone-600">
                            {formatMinutes(t.duration)}
                          </span>

                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${style.badgeBg} ${style.badgeText}`}>
                            {style.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {onStartFocusSession && !t.completed && (
                        <button
                          type="button"
                          onClick={() => {
                            playRelaxingClick();
                            onStartFocusSession(t);
                          }}
                          className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          title="Focus on this task"
                        >
                          <Play className="w-3 h-3" />
                          <span className="hidden sm:inline">Focus</span>
                        </button>
                      )}

                      {onEditTask && (
                        <button
                          type="button"
                          onClick={() => {
                            playRelaxingClick();
                            onEditTask(t);
                          }}
                          className="px-2 py-1 rounded-lg bg-stone-50 hover:bg-stone-200 text-stone-600 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
