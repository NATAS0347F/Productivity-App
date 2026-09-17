import {
  Task,
  CapacitySettings,
  DayReflection,
  UserProfile,
  ActivityDay,
  WinItem,
  WeekPlan,
  MonthPlan,
  BigPictureGoal,
  ThemeSettings,
  CategoryDefinition,
  VisionBoardItem,
  VisionCategory,
  VisionBoardLayoutSettings,
} from '../types';
import { INITIAL_TASKS } from '../data/initialTasks';
import { DEFAULT_MONTH_COVER, DEFAULT_WEEK_COVER } from './covers';
import { PRESET_THEMES } from './theme';

export const STORAGE_KEYS = {
  TASKS: 'flow_v3_tasks',
  CAPACITY: 'flow_v3_capacity',
  REFLECTIONS: 'flow_v3_reflections',
  PROFILE: 'flow_v3_profile',
  ACTIVITY: 'flow_v3_activity',
  WINS: 'flow_v3_wins',
  LAST_SAVED: 'flow_v3_last_saved',
  WEEK_PLAN_THIS: 'flow_v4_week_plan_this',
  WEEK_PLAN_NEXT: 'flow_v4_week_plan_next',
  MONTH_PLAN: 'flow_v4_month_plan',
  BIG_PICTURE_GOALS: 'flow_v4_big_picture_goals',
  ACTIVE_THEME: 'flow_v6_active_theme',
  SAVED_THEMES: 'flow_v6_saved_themes',
  CATEGORIES: 'flow_v6_categories',
  VISION_BOARD: 'flow_v6_vision_board',
  VISION_CATEGORIES: 'flow_v6_vision_categories',
  VISION_LAYOUT: 'flow_v6_vision_layout',
};

// Legacy keys to migrate from if present
const LEGACY_KEYS = {
  TASKS_V2: 'flowTasks_v2',
  CAPACITY_V2: 'flowCapacity_v2',
  REFLECTIONS_V2: 'flowReflections_v2',
};

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Nat',
  energyToday: 'medium',
  lastActiveDate: new Date().toISOString().slice(0, 10),
};

export const DEFAULT_CAPACITY: CapacitySettings = {
  startTime: '09:00',
  endTime: '18:00',
  capacityLevel: 'medium',
  includeLunchBuffer: true,
  lunchTime: '12:30',
  lunchDuration: 45,
  bufferBetweenTasks: 10,
};

// Helper: safe local storage read
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

// Helper: safe local storage write
function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    localStorage.setItem(STORAGE_KEYS.LAST_SAVED, Date.now().toString());
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

/**
 * Load tasks with migration from V2 if present, or initial tasks if brand new.
 * If user cleared tasks to build from scratch (existing is []), respect that!
 */
export function loadTasks(): Task[] {
  const existing = getStored<Task[] | null>(STORAGE_KEYS.TASKS, null);
  if (existing !== null && Array.isArray(existing)) {
    return existing;
  }

  // Check legacy v2
  const legacy = getStored<Task[] | null>(LEGACY_KEYS.TASKS_V2, null);
  if (legacy && Array.isArray(legacy) && legacy.length > 0) {
    setStored(STORAGE_KEYS.TASKS, legacy);
    return legacy;
  }

  // Fresh start with default tasks
  setStored(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  return INITIAL_TASKS;
}

export function saveTasks(tasks: Task[]): void {
  setStored(STORAGE_KEYS.TASKS, tasks);
}

/**
 * Clear all tasks to start with a blank canvas from scratch
 */
export function clearAllTasks(): Task[] {
  setStored(STORAGE_KEYS.TASKS, []);
  return [];
}

/**
 * Reset tasks to the starter demo template
 */
export function resetTasksToDefault(): Task[] {
  setStored(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  return INITIAL_TASKS;
}

export function loadCapacity(): CapacitySettings {
  const existing = getStored<CapacitySettings | null>(STORAGE_KEYS.CAPACITY, null);
  if (existing) {
    return { ...DEFAULT_CAPACITY, ...existing };
  }
  const legacy = getStored<CapacitySettings | null>(LEGACY_KEYS.CAPACITY_V2, null);
  if (legacy) {
    const merged = { ...DEFAULT_CAPACITY, ...legacy };
    setStored(STORAGE_KEYS.CAPACITY, merged);
    return merged;
  }
  return DEFAULT_CAPACITY;
}

export function saveCapacity(capacity: CapacitySettings): void {
  setStored(STORAGE_KEYS.CAPACITY, capacity);
}

export function loadReflections(): DayReflection[] {
  const existing = getStored<DayReflection[] | null>(STORAGE_KEYS.REFLECTIONS, null);
  if (existing && Array.isArray(existing)) return existing;
  const legacy = getStored<DayReflection[] | null>(LEGACY_KEYS.REFLECTIONS_V2, null);
  if (legacy && Array.isArray(legacy)) {
    setStored(STORAGE_KEYS.REFLECTIONS, legacy);
    return legacy;
  }
  return [];
}

export function saveReflections(reflections: DayReflection[]): void {
  setStored(STORAGE_KEYS.REFLECTIONS, reflections);
}

export function loadUserProfile(): UserProfile {
  const existing = getStored<UserProfile | null>(STORAGE_KEYS.PROFILE, null);
  if (existing) return { ...DEFAULT_PROFILE, ...existing };
  return DEFAULT_PROFILE;
}

export function saveUserProfile(profile: UserProfile): void {
  setStored(STORAGE_KEYS.PROFILE, profile);
}

export function loadActivityHistory(): ActivityDay[] {
  const existing = getStored<ActivityDay[] | null>(STORAGE_KEYS.ACTIVITY, null);
  if (existing && Array.isArray(existing)) return existing;

  // Initialize with last 7 days baseline activity so user has a forgiving momentum immediately
  const initialHistory: ActivityDay[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    // Give some realistic gentle past days
    initialHistory.push({
      date: dateStr,
      checkedIn: i !== 3, // 6 out of 7 days checked in
      tasksCompleted: i === 0 ? 1 : i % 2 === 0 ? 3 : 2,
      focusMinutes: i === 0 ? 25 : i % 2 === 0 ? 60 : 45,
      focusSessions: i === 0 ? 1 : i % 2 === 0 ? 2 : 1,
    });
  }
  setStored(STORAGE_KEYS.ACTIVITY, initialHistory);
  return initialHistory;
}

export function saveActivityHistory(history: ActivityDay[]): void {
  setStored(STORAGE_KEYS.ACTIVITY, history);
}

export function recordDayCheckIn(history: ActivityDay[]): ActivityDay[] {
  const todayStr = new Date().toISOString().slice(0, 10);
  const existingIndex = history.findIndex((h) => h.date === todayStr);

  if (existingIndex >= 0) {
    const updated = [...history];
    updated[existingIndex] = {
      ...updated[existingIndex],
      checkedIn: true,
    };
    saveActivityHistory(updated);
    return updated;
  } else {
    const newEntry: ActivityDay = {
      date: todayStr,
      checkedIn: true,
      tasksCompleted: 0,
      focusMinutes: 0,
      focusSessions: 0,
    };
    const updated = [...history, newEntry].slice(-30); // keep last 30 days
    saveActivityHistory(updated);
    return updated;
  }
}

export function recordTaskCompletionInHistory(
  history: ActivityDay[],
  task: Task
): ActivityDay[] {
  const todayStr = new Date().toISOString().slice(0, 10);
  const existingIndex = history.findIndex((h) => h.date === todayStr);

  const duration = task.actualDuration || task.duration || 25;

  if (existingIndex >= 0) {
    const updated = [...history];
    updated[existingIndex] = {
      ...updated[existingIndex],
      tasksCompleted: updated[existingIndex].tasksCompleted + 1,
      focusMinutes: updated[existingIndex].focusMinutes + duration,
    };
    saveActivityHistory(updated);
    return updated;
  } else {
    const newEntry: ActivityDay = {
      date: todayStr,
      checkedIn: true,
      tasksCompleted: 1,
      focusMinutes: duration,
      focusSessions: 1,
    };
    const updated = [...history, newEntry].slice(-30);
    saveActivityHistory(updated);
    return updated;
  }
}

export function recordFocusSessionInHistory(
  history: ActivityDay[],
  minutes: number
): ActivityDay[] {
  const todayStr = new Date().toISOString().slice(0, 10);
  const existingIndex = history.findIndex((h) => h.date === todayStr);

  if (existingIndex >= 0) {
    const updated = [...history];
    updated[existingIndex] = {
      ...updated[existingIndex],
      focusMinutes: updated[existingIndex].focusMinutes + minutes,
      focusSessions: (updated[existingIndex].focusSessions || 0) + 1,
    };
    saveActivityHistory(updated);
    return updated;
  } else {
    const newEntry: ActivityDay = {
      date: todayStr,
      checkedIn: true,
      tasksCompleted: 0,
      focusMinutes: minutes,
      focusSessions: 1,
    };
    const updated = [...history, newEntry].slice(-30);
    saveActivityHistory(updated);
    return updated;
  }
}

export function loadWins(): WinItem[] {
  const existing = getStored<WinItem[] | null>(STORAGE_KEYS.WINS, null);
  if (existing && Array.isArray(existing) && existing.length > 0) return existing;

  // Baseline wins to encourage user immediately
  const initialWins: WinItem[] = [
    {
      id: 'win-1',
      text: 'Set up your realistic daily capacity & buffer intervals',
      timestamp: Date.now() - 3600000 * 24,
      type: 'milestone',
      detail: 'Realistic planning beats toxic grind.',
    },
    {
      id: 'win-2',
      text: 'Conquered a 25-minute deep focus block',
      timestamp: Date.now() - 3600000 * 12,
      type: 'focus',
      detail: 'Starting is the hardest part.',
    },
    {
      id: 'win-3',
      text: 'Broke an intimidating goal into bite-sized subtasks',
      timestamp: Date.now() - 3600000 * 4,
      type: 'task',
      detail: 'Reduced mental friction.',
    },
  ];
  setStored(STORAGE_KEYS.WINS, initialWins);
  return initialWins;
}

export function saveWins(wins: WinItem[]): void {
  setStored(STORAGE_KEYS.WINS, wins);
}

export function addWinForTask(task: Task, currentWins: WinItem[]): WinItem[] {
  let winText = `Finished "${task.name}"`;
  let winType: WinItem['type'] = 'task';
  let detail = '';

  if (task.postponeCount >= 2) {
    winText = `Conquered "${task.name}" after postponing ${task.postponeCount} times!`;
    winType = 'postpone_defeated';
    detail = 'Defeated procrastination with a gentle start.';
  } else if (task.priority >= 3) {
    winText = `High-impact win: "${task.name}" completed`;
    winType = 'task';
    detail = `Crushed a P${task.priority} core priority.`;
  }

  const newWin: WinItem = {
    id: `win-${Date.now()}`,
    text: winText,
    category: task.category,
    timestamp: Date.now(),
    type: winType,
    detail,
  };

  const updated = [newWin, ...currentWins].slice(0, 20); // keep 20 recent wins
  saveWins(updated);
  return updated;
}

/**
 * Export all data to JSON string
 */
export function exportDataAsJson(): string {
  const payload = {
    version: '3.0.0',
    exportedAt: new Date().toISOString(),
    tasks: getStored(STORAGE_KEYS.TASKS, []),
    capacity: getStored(STORAGE_KEYS.CAPACITY, DEFAULT_CAPACITY),
    reflections: getStored(STORAGE_KEYS.REFLECTIONS, []),
    profile: getStored(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE),
    activity: getStored(STORAGE_KEYS.ACTIVITY, []),
    wins: getStored(STORAGE_KEYS.WINS, []),
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Trigger download of JSON backup
 */
export function downloadBackupFile(): void {
  const json = exportDataAsJson();
  const dateStr = new Date().toISOString().slice(0, 10);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `flow-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import and validate JSON backup file
 */
export function importDataFromJson(jsonStr: string): {
  success: boolean;
  message: string;
  data?: {
    tasks?: Task[];
    capacity?: CapacitySettings;
    reflections?: DayReflection[];
    profile?: UserProfile;
    activity?: ActivityDay[];
    wins?: WinItem[];
  };
} {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'Invalid JSON format.' };
    }

    const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : undefined;
    const capacity = parsed.capacity && typeof parsed.capacity === 'object' ? parsed.capacity : undefined;
    const reflections = Array.isArray(parsed.reflections) ? parsed.reflections : undefined;
    const profile = parsed.profile && typeof parsed.profile === 'object' ? parsed.profile : undefined;
    const activity = Array.isArray(parsed.activity) ? parsed.activity : undefined;
    const wins = Array.isArray(parsed.wins) ? parsed.wins : undefined;

    if (tasks) saveTasks(tasks);
    if (capacity) saveCapacity(capacity);
    if (reflections) saveReflections(reflections);
    if (profile) saveUserProfile(profile);
    if (activity) saveActivityHistory(activity);
    if (wins) saveWins(wins);

    return {
      success: true,
      message: `Successfully imported ${tasks?.length || 0} tasks and settings.`,
      data: { tasks, capacity, reflections, profile, activity, wins },
    };
  } catch (err: any) {
    return { success: false, message: `Failed to import: ${err?.message || 'Unknown error'}` };
  }
}

// -------------------------------------------------------------
// V5 Horizon Planning Storage (Week, Month, Big Picture Goals)
// -------------------------------------------------------------

export const DEFAULT_THIS_WEEK_PLAN: WeekPlan = {
  theme: 'Week 1: Get Back Into Learning',
  subtitle: 'Gentle momentum, protect morning focus, forgive pauses',
  topPriorities: [
    'Psychology redo prep & lecture review',
    'Get back into Python (30-45m practice sessions)',
    'Sustainable walking breaks & reset rhythm',
  ],
  fixedCommitments: [
    'Tuesday 10:00 AM — Psychology Lecture',
    'Thursday 2:00 PM — Coding Lab',
    'Friday 11:00 AM — Academic Check-in',
  ],
  capacityLevel: 'medium',
  planningNotes:
    'I want to get back into studying but not overwhelm myself. Prioritize 1 solid win per day and keep evenings open for genuine rest.',
  cover: DEFAULT_WEEK_COVER,
};

export const DEFAULT_NEXT_WEEK_PLAN: WeekPlan = {
  theme: 'Week 2: Deep Dive & Creative Exploration',
  subtitle: 'Applying foundations and building momentum',
  topPriorities: [
    'Complete Python mini-project script',
    'Draft psychology summary notes',
    'Creative prototype exploration',
  ],
  fixedCommitments: [
    'Tuesday 10:00 AM — Psychology Lecture',
    'Wednesday 3:00 PM — Study Group',
    'Friday 2:00 PM — Project Review',
  ],
  capacityLevel: 'medium',
  planningNotes:
    'Next week is about stretching a bit further. If energy is high, push deeper into technical building.',
  cover: {
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    displayStyle: 'side',
    caption: 'Creative Exploration',
  },
};

export const DEFAULT_MONTH_PLAN: MonthPlan = {
  monthKey: '2026-09',
  theme: 'September: Reset & Rebuild',
  subtitle: 'A month for getting back into rhythm, pacing gently, and building traction',
  majorGoals: [
    'Improve technical skills (Start learning Python)',
    'Get back into academic studying rhythm',
    'Health: daily walks & reset sleep routine',
  ],
  currentProjects: [
    'Psychology Slide Revisions',
    'Flow App Polish',
    'Intro to Python Curriculum',
  ],
  moreOf: 'Deep morning focus blocks, daylight walks, gentle progress tracking',
  lessOf: 'All-or-nothing guilt, late night revenge procrastination',
  weeklyThemes: [
    { weekNumber: 1, title: 'Get Back Into Rhythm', focus: 'Bite-sized habits and clean schedule' },
    { weekNumber: 2, title: 'Build & Explore', focus: 'Python fundamentals and creative project' },
    { weekNumber: 3, title: 'Academic Catch-Up', focus: 'Deep slide reviews and assignment completion' },
    { weekNumber: 4, title: 'Sustainable Consolidation', focus: 'Review wins and celebrate consistency' },
  ],
  planningNotes:
    'This month is not about grinding yourself down. It is about steady, gentle momentum. One day at a time.',
  cover: DEFAULT_MONTH_COVER,
};

export const DEFAULT_BIG_PICTURE_GOALS: BigPictureGoal[] = [
  {
    id: 'goal-python',
    title: 'Improve Technical Skills: Learn Python',
    category: 'technical',
    timeframe: 'this_month',
    weeklyFocus: 'Start learning Python fundamentals & basic data structures',
    progress: 35,
    completed: false,
    subActions: [
      { title: 'Python basics & variables', dayHint: 'Tuesday', duration: 30 },
      { title: 'Python loops & functions practice', dayHint: 'Thursday', duration: 45 },
      { title: 'Python 1-hour mini project script', dayHint: 'Saturday', duration: 60 },
    ],
  },
  {
    id: 'goal-academic',
    title: 'Get Back Into Academic Studying Rhythm',
    category: 'academic',
    timeframe: 'this_month',
    weeklyFocus: 'Psychology slides redo & active recall sessions',
    progress: 50,
    completed: false,
    subActions: [
      { title: 'Review psychology lecture notes', dayHint: 'Monday', duration: 45 },
      { title: 'Practice slide flashcards & summary', dayHint: 'Wednesday', duration: 40 },
      { title: 'Psychology redo submission polish', dayHint: 'Friday', duration: 30 },
    ],
  },
  {
    id: 'goal-health',
    title: 'Sustainable Reset & Daily Well-being',
    category: 'personal',
    timeframe: 'this_quarter',
    weeklyFocus: 'Consistent daily daylight walk & evening digital wind-down',
    progress: 60,
    completed: false,
    subActions: [
      { title: 'Morning walk in natural light', dayHint: 'Daily', duration: 20 },
      { title: 'Evening book reading & screen reset', dayHint: 'Nightly', duration: 25 },
    ],
  },
];

export function loadWeekPlan(isNextWeek = false): WeekPlan {
  const key = isNextWeek ? STORAGE_KEYS.WEEK_PLAN_NEXT : STORAGE_KEYS.WEEK_PLAN_THIS;
  const existing = getStored<WeekPlan | null>(key, null);
  if (existing) return existing;
  const defaultPlan = isNextWeek ? DEFAULT_NEXT_WEEK_PLAN : DEFAULT_THIS_WEEK_PLAN;
  setStored(key, defaultPlan);
  return defaultPlan;
}

export function saveWeekPlan(plan: WeekPlan, isNextWeek = false): void {
  const key = isNextWeek ? STORAGE_KEYS.WEEK_PLAN_NEXT : STORAGE_KEYS.WEEK_PLAN_THIS;
  setStored(key, plan);
}

export function loadMonthPlan(): MonthPlan {
  const existing = getStored<MonthPlan | null>(STORAGE_KEYS.MONTH_PLAN, null);
  if (existing) return existing;
  setStored(STORAGE_KEYS.MONTH_PLAN, DEFAULT_MONTH_PLAN);
  return DEFAULT_MONTH_PLAN;
}

export function saveMonthPlan(plan: MonthPlan): void {
  setStored(STORAGE_KEYS.MONTH_PLAN, plan);
}

export function loadBigPictureGoals(): BigPictureGoal[] {
  const existing = getStored<BigPictureGoal[] | null>(STORAGE_KEYS.BIG_PICTURE_GOALS, null);
  if (existing && Array.isArray(existing)) return existing;
  setStored(STORAGE_KEYS.BIG_PICTURE_GOALS, DEFAULT_BIG_PICTURE_GOALS);
  return DEFAULT_BIG_PICTURE_GOALS;
}

export function saveBigPictureGoals(goals: BigPictureGoal[]): void {
  setStored(STORAGE_KEYS.BIG_PICTURE_GOALS, goals);
}

export function loadThemeSettings(): ThemeSettings {
  const existing = getStored<ThemeSettings | null>(STORAGE_KEYS.ACTIVE_THEME, null);
  if (existing) return existing;
  // Default to Sage preset (beautiful, clean natural feeling)
  setStored(STORAGE_KEYS.ACTIVE_THEME, PRESET_THEMES.sage);
  return PRESET_THEMES.sage;
}

export function saveThemeSettings(theme: ThemeSettings): void {
  setStored(STORAGE_KEYS.ACTIVE_THEME, theme);
}

export function resetThemeSettings(): ThemeSettings {
  setStored(STORAGE_KEYS.ACTIVE_THEME, PRESET_THEMES.sage);
  return PRESET_THEMES.sage;
}

export function loadSavedThemes(): ThemeSettings[] {
  const existing = getStored<ThemeSettings[] | null>(STORAGE_KEYS.SAVED_THEMES, null);
  if (existing && Array.isArray(existing)) return existing;
  return [];
}

export function saveCustomTheme(theme: ThemeSettings): ThemeSettings[] {
  const current = loadSavedThemes();
  const exists = current.some((t) => t.id === theme.id);
  const updated = exists
    ? current.map((t) => (t.id === theme.id ? theme : t))
    : [theme, ...current];
  setStored(STORAGE_KEYS.SAVED_THEMES, updated);
  return updated;
}

export function deleteCustomTheme(id: string): ThemeSettings[] {
  const current = loadSavedThemes();
  const updated = current.filter((t) => t.id !== id);
  setStored(STORAGE_KEYS.SAVED_THEMES, updated);
  return updated;
}

// -------------------------------------------------------------
// Category Management Storage (Allow editing & custom categories)
// -------------------------------------------------------------

export const DEFAULT_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'academic',
    name: 'Academic / School',
    emoji: '🧠',
    color: '#4F46E5',
    description: 'Courses, readings, study & revision',
    isDefault: true,
  },
  {
    id: 'technical',
    name: 'Technical / Coding',
    emoji: '💻',
    color: '#0D9488',
    description: 'Programming, architectures & systems',
    isDefault: true,
  },
  {
    id: 'career',
    name: 'Career / Analytics',
    emoji: '📊',
    color: '#D97706',
    description: 'Work goals, portfolios, analytics & metrics',
    isDefault: true,
  },
  {
    id: 'creative',
    name: 'Creative',
    emoji: '🎨',
    color: '#DB2777',
    description: 'Writing, designing, art & generative work',
    isDefault: true,
  },
  {
    id: 'personal',
    name: 'Personal',
    emoji: '🌱',
    color: '#10B981',
    description: 'Health, habits, reflection & reading',
    isDefault: true,
  },
  {
    id: 'admin',
    name: 'Life / Admin',
    emoji: '🏠',
    color: '#64748B',
    description: 'Errands, finances, organization & household',
    isDefault: true,
  },
];

export function loadCategories(): CategoryDefinition[] {
  const existing = getStored<CategoryDefinition[] | null>(STORAGE_KEYS.CATEGORIES, null);
  if (existing && Array.isArray(existing) && existing.length > 0) {
    return existing;
  }
  setStored(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  return DEFAULT_CATEGORIES;
}

export function saveCategories(categories: CategoryDefinition[]): void {
  setStored(STORAGE_KEYS.CATEGORIES, categories);
}

export function resetCategories(): CategoryDefinition[] {
  setStored(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  return DEFAULT_CATEGORIES;
}

// -------------------------------------------------------------
// Vision Board Storage
// -------------------------------------------------------------

export const DEFAULT_VISION_BOARD_ITEMS: VisionBoardItem[] = [
  {
    id: 'vision-1',
    title: 'Serene Focus & Natural Light',
    caption: 'Build a calm morning workflow with intention and a clear mind',
    imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1000&q=80',
    category: 'Mindset & Mood',
    affirmation: 'I protect my mornings and trust my steady pace.',
    aspectRatio: 'portrait',
    isPinned: true,
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'vision-2',
    title: 'Master Technical Craft',
    caption: 'Learn Python and build elegant software tools that empower others',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80',
    category: 'Career & Ambition',
    affirmation: 'Consistency turns hard concepts into second nature.',
    linkedGoalId: 'goal-python',
    aspectRatio: 'landscape',
    isPinned: true,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'vision-3',
    title: 'Daily Sunlight & Vitality',
    caption: 'Outdoor walks every single afternoon to clear mental fog',
    imageUrl: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1000&q=80',
    category: 'Health & Wellness',
    affirmation: 'My body deserves movement, fresh air, and deep breaths.',
    aspectRatio: 'square',
    isPinned: false,
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'vision-4',
    title: 'Minimalist Study Sanctuary',
    caption: 'Clean desk, warm coffee, clutter-free desk surfaces',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
    category: 'Aesthetic & Life',
    affirmation: 'Simplicity creates space for deep thinking.',
    aspectRatio: 'portrait',
    isPinned: false,
    createdAt: Date.now() - 40000000,
  },
  {
    id: 'vision-5',
    title: 'Creative Writing & Flow',
    caption: 'Drafting ideas in quiet evening notebooks without self-criticism',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=80',
    category: 'Dream Projects',
    affirmation: 'Show up for the practice, not just the outcome.',
    aspectRatio: 'landscape',
    isPinned: false,
    createdAt: Date.now() - 20000000,
  },
];

export function loadVisionBoardItems(): VisionBoardItem[] {
  const existing = getStored<VisionBoardItem[] | null>(STORAGE_KEYS.VISION_BOARD, null);
  if (existing && Array.isArray(existing)) {
    return existing;
  }
  setStored(STORAGE_KEYS.VISION_BOARD, DEFAULT_VISION_BOARD_ITEMS);
  return DEFAULT_VISION_BOARD_ITEMS;
}

export function saveVisionBoardItems(items: VisionBoardItem[]): void {
  setStored(STORAGE_KEYS.VISION_BOARD, items);
}

export function resetVisionBoard(): VisionBoardItem[] {
  setStored(STORAGE_KEYS.VISION_BOARD, DEFAULT_VISION_BOARD_ITEMS);
  return DEFAULT_VISION_BOARD_ITEMS;
}

// -------------------------------------------------------------
// Vision Board Categories & Layout Preferences Storage
// -------------------------------------------------------------

export const DEFAULT_VISION_CATEGORIES: VisionCategory[] = [
  { id: 'mindset', name: 'Mindset & Mood', emoji: '✨', color: '#8B5CF6', description: 'Internal peace, presence & mindset', isDefault: true },
  { id: 'career', name: 'Career & Ambition', emoji: '🚀', color: '#3B82F6', description: 'Professional craft & impact', isDefault: true },
  { id: 'aesthetic', name: 'Aesthetic & Life', emoji: '🌿', color: '#10B981', description: 'Environment, spaces & style', isDefault: true },
  { id: 'health', name: 'Health & Wellness', emoji: '☀️', color: '#F59E0B', description: 'Vitality, energy & movement', isDefault: true },
  { id: 'projects', name: 'Dream Projects', emoji: '💡', color: '#EC4899', description: 'Creative works & ventures', isDefault: true },
  { id: 'travel', name: 'Travel & Adventure', emoji: '✈️', color: '#06B6D4', description: 'Exploration & journeys', isDefault: true },
];

export const DEFAULT_VISION_LAYOUT: VisionBoardLayoutSettings = {
  mode: 'masonry',
  columns: 3,
  gap: 'normal',
  aspectRatioOverride: 'original',
  showAffirmation: true,
  showCaption: true,
  showLinkedGoal: true,
  cardRounding: 'rounded',
};

export function loadVisionCategories(): VisionCategory[] {
  const existing = getStored<VisionCategory[] | null>(STORAGE_KEYS.VISION_CATEGORIES, null);
  if (existing && Array.isArray(existing) && existing.length > 0) {
    return existing;
  }
  setStored(STORAGE_KEYS.VISION_CATEGORIES, DEFAULT_VISION_CATEGORIES);
  return DEFAULT_VISION_CATEGORIES;
}

export function saveVisionCategories(categories: VisionCategory[]): void {
  setStored(STORAGE_KEYS.VISION_CATEGORIES, categories);
}

export function resetVisionCategories(): VisionCategory[] {
  setStored(STORAGE_KEYS.VISION_CATEGORIES, DEFAULT_VISION_CATEGORIES);
  return DEFAULT_VISION_CATEGORIES;
}

export function loadVisionLayout(): VisionBoardLayoutSettings {
  const existing = getStored<VisionBoardLayoutSettings | null>(STORAGE_KEYS.VISION_LAYOUT, null);
  if (existing && existing.mode) {
    return { ...DEFAULT_VISION_LAYOUT, ...existing };
  }
  setStored(STORAGE_KEYS.VISION_LAYOUT, DEFAULT_VISION_LAYOUT);
  return DEFAULT_VISION_LAYOUT;
}

export function saveVisionLayout(layout: VisionBoardLayoutSettings): void {
  setStored(STORAGE_KEYS.VISION_LAYOUT, layout);
}

export function resetVisionLayout(): VisionBoardLayoutSettings {
  setStored(STORAGE_KEYS.VISION_LAYOUT, DEFAULT_VISION_LAYOUT);
  return DEFAULT_VISION_LAYOUT;
}

export const EMPTY_MONTH_PLAN: MonthPlan = {
  monthKey: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
  theme: '',
  subtitle: '',
  majorGoals: [],
  currentProjects: [],
  moreOf: '',
  lessOf: '',
  weeklyThemes: [],
  planningNotes: '',
};

export const EMPTY_WEEK_PLAN: WeekPlan = {
  theme: '',
  subtitle: '',
  topPriorities: [],
  fixedCommitments: [],
  capacityLevel: 'medium',
  planningNotes: '',
};

export function resetMonthPlan(): MonthPlan {
  const empty: MonthPlan = {
    monthKey: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    theme: '',
    subtitle: '',
    majorGoals: [],
    currentProjects: [],
    moreOf: '',
    lessOf: '',
    weeklyThemes: [],
    planningNotes: '',
  };
  setStored(STORAGE_KEYS.MONTH_PLAN, empty);
  return empty;
}

export function resetBigPictureGoals(): BigPictureGoal[] {
  setStored(STORAGE_KEYS.BIG_PICTURE_GOALS, []);
  return [];
}

export function resetWeekPlan(isNextWeek = false): WeekPlan {
  const empty: WeekPlan = {
    theme: '',
    subtitle: '',
    topPriorities: [],
    fixedCommitments: [],
    capacityLevel: 'medium',
    planningNotes: '',
  };
  setStored(isNextWeek ? STORAGE_KEYS.WEEK_PLAN_NEXT : STORAGE_KEYS.WEEK_PLAN_THIS, empty);
  return empty;
}

/**
 * Wipe all data to start completely fresh from a clean blank canvas
 */
export function resetAllDataToCleanSlate(): void {
  setStored(STORAGE_KEYS.TASKS, []);
  setStored(STORAGE_KEYS.REFLECTIONS, []);
  setStored(STORAGE_KEYS.WINS, []);
  setStored(STORAGE_KEYS.ACTIVITY, []);
  setStored(STORAGE_KEYS.WEEK_PLAN_THIS, EMPTY_WEEK_PLAN);
  setStored(STORAGE_KEYS.WEEK_PLAN_NEXT, EMPTY_WEEK_PLAN);
  setStored(STORAGE_KEYS.MONTH_PLAN, EMPTY_MONTH_PLAN);
  setStored(STORAGE_KEYS.BIG_PICTURE_GOALS, []);
  setStored(STORAGE_KEYS.VISION_BOARD, []);
}


