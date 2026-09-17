export type EnergyLevel = 'low' | 'medium' | 'high';
export type PriorityLevel = 1 | 2 | 3 | 4;

export type ItemType = 'task' | 'goal' | 'project' | 'idea';
export type TaskIntent = 'need' | 'want' | 'someday'; // Distinguish "Need to do" from "Want to do" from "Maybe someday"

export type CategoryType =
  | 'academic'
  | 'technical'
  | 'career'
  | 'creative'
  | 'personal'
  | 'admin'
  | string;

export interface CategoryDefinition {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description?: string;
  isCustom?: boolean;
  isDefault?: boolean;
}

export interface VisionBoardItem {
  id: string;
  title: string;
  caption?: string;
  imageUrl: string;
  category: string;
  affirmation?: string;
  linkedGoalId?: string;
  targetDate?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  isPinned?: boolean;
  createdAt: number;
}

export type RecurrenceType =
  | 'none'
  | 'daily'
  | 'weekdays'
  | 'weekly'
  | 'monthly'
  | 'custom';

export interface SubTask {
  id: string;
  name: string;
  duration: number; // in minutes
  completed: boolean;
}

export interface Task {
  id: number;
  name: string;
  type: ItemType;
  intent?: TaskIntent; // 'need' | 'want' | 'someday'
  category: CategoryType;
  duration: number; // in minutes
  energy: EnergyLevel;
  priority: PriorityLevel;
  deadline: string | null; // YYYY-MM-DD
  completed: boolean;
  createdAt: number;
  
  // Procrastination & behavioral tracking
  postponeCount: number;
  lastPostponedAt?: number;
  postponeReasons?: string[];
  intimidating?: boolean;
  brokenDown?: boolean;
  subtasks?: SubTask[];
  starterAction?: string;
  scheduledDate?: string; // YYYY-MM-DD
  goalId?: string; // Connected to higher horizon goal
  notes?: string;
  
  // Recurrence
  recurrence: RecurrenceType;
  customDays?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  
  // Completion data
  completedAt?: number;
  actualDuration?: number; // in minutes
  timeOfDayCompleted?: 'morning' | 'afternoon' | 'evening';
}

export interface CapacitySettings {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  capacityLevel: 'low' | 'medium' | 'high';
  includeLunchBuffer: boolean;
  lunchTime: string; // HH:mm, default '12:30'
  lunchDuration: number; // minutes, default 45
  bufferBetweenTasks: number; // minutes, default 10
}

export type BlockType = 'work' | 'break' | 'meal' | 'buffer' | 'free';

export interface ScheduleBlock {
  id: string;
  type: BlockType;
  start: number; // in minutes from midnight
  duration: number; // in minutes
  title: string;
  subtitle: string;
  category?: CategoryType | 'break' | 'free' | 'meal';
  taskId?: number;
  originalTask?: Task;
  isSubtask?: boolean;
  subtaskId?: string;
}

export interface UnscheduledTask {
  id: number;
  name: string;
  type: ItemType;
  category: CategoryType;
  remainingDuration: number;
  originalDuration: number;
  energy: EnergyLevel;
  priority: PriorityLevel;
  reason?: string;
  postponeCount: number;
}

export interface ScheduleResult {
  schedule: ScheduleBlock[];
  unscheduled: UnscheduledTask[];
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  totalFreeMinutes: number;
  totalBufferMinutes: number;
  totalPlannedMinutes: number;
  capacityMinutes: number;
  isOverloaded: boolean;
}

export type ViewMode = 'today' | 'week' | 'month' | 'big_picture' | 'vision';
export type HorizonLevel = 'today' | 'week' | 'next_week' | 'month' | 'big_picture';

export type CoverDisplayStyle = 'cover' | 'side' | 'subtle_bg' | 'none';

export interface AestheticCover {
  url: string;
  displayStyle: CoverDisplayStyle;
  caption?: string;
}

export type PresetThemeKey =
  | 'sage'
  | 'soft'
  | 'midnight'
  | 'autumn'
  | 'lavender'
  | 'clean'
  | 'ocean'
  | 'dark_academia'
  | 'custom';

export type CardStyleType = 'minimal' | 'soft' | 'glass' | 'journal' | 'dark';
export type BorderRadiusType = 'sharp' | 'medium' | 'curved' | 'pill';
export type FontFamilyType = 'Inter' | 'DM Sans' | 'Manrope' | 'Geist' | 'Plus Jakarta Sans';
export type FontSizeScaleType = 'compact' | 'normal' | 'large';
export type SpacingDensityType = 'compact' | 'comfortable';

export interface BackgroundImageSettings {
  url: string;
  position: 'center' | 'top' | 'bottom';
  size: 'cover' | 'contain';
  opacity: number; // 0-100
  blur: number; // 0-20 px
  overlayType: 'none' | 'light' | 'dark' | 'auto';
  overlayOpacity: number; // 0-100
  protectReadability: boolean;
}

export interface BackgroundEffectsSettings {
  gradient: 'none' | 'subtle_warm' | 'subtle_cool' | 'dusk' | 'aurora';
  grain: boolean;
  vignette: boolean;
}

export interface ThemeColors {
  background: string;
  accent: string;
  accentSecondary: string;
  card: string;
  cardBorder: string;
  text: string;
  textMuted: string;
}

export interface ThemeSettings {
  id: string;
  name: string;
  presetKey: PresetThemeKey;
  colors: ThemeColors;
  categoryColors: Record<CategoryType | 'break' | 'free', string>;
  cardStyle: CardStyleType;
  borderRadius: BorderRadiusType;
  typography: {
    fontFamily: FontFamilyType;
    fontSizeScale: FontSizeScaleType;
    spacingDensity: SpacingDensityType;
  };
  backgroundEffects: BackgroundEffectsSettings;
  backgroundImage?: BackgroundImageSettings;
  isCustom?: boolean;
  updatedAt?: number;
}

export interface HorizonTheme {
  title: string;
  subtitle?: string;
  cover?: AestheticCover;
  accentColor?: string;
  backgroundImage?: string;
  presetKey?: PresetThemeKey;
  planningNotes?: string;
}

export interface WeekPlan {
  theme: string;
  subtitle?: string;
  topPriorities: string[]; // 1–3 things that matter most
  fixedCommitments: string[]; // Fixed calendar commitments
  capacityLevel: 'low' | 'medium' | 'high';
  planningNotes: string; // Personal planning canvas text
  cover?: AestheticCover;
  accentColor?: string;
  backgroundImage?: string;
  presetKey?: PresetThemeKey;
}

export interface MonthPlan {
  monthKey: string; // e.g. '2026-09'
  theme: string;
  subtitle?: string;
  majorGoals: string[];
  currentProjects: string[];
  moreOf?: string;
  lessOf?: string;
  weeklyThemes: { weekNumber: number; title: string; focus: string }[];
  planningNotes: string;
  cover?: AestheticCover;
  accentColor?: string;
  backgroundImage?: string;
  presetKey?: PresetThemeKey;
}

export interface BigPictureGoal {
  id: string;
  title: string;
  category: CategoryType;
  timeframe: 'this_month' | 'next_month' | 'this_quarter' | 'eventually';
  weeklyFocus: string;
  subActions: { title: string; dayHint: string; duration: number }[];
  completed: boolean;
  progress: number; // 0..100
}

export interface DayReflection {
  id: string;
  date: string; // YYYY-MM-DD
  rating: 'good' | 'okay' | 'overloaded' | 'low_energy';
  reasons: string[];
  notes?: string;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  energyToday: EnergyLevel;
  lastActiveDate: string; // YYYY-MM-DD
}

export interface ActivityDay {
  date: string; // YYYY-MM-DD
  checkedIn: boolean;
  tasksCompleted: number;
  focusMinutes: number;
  focusSessions: number;
}

export interface WinItem {
  id: string;
  text: string;
  category?: CategoryType;
  timestamp: number;
  type: 'task' | 'goal' | 'postpone_defeated' | 'focus' | 'milestone';
  detail?: string;
}

export interface RescueResult {
  keptTasks: Task[];
  movedTasks: Task[];
  remainingAvailableMinutes: number;
  totalKeptMinutes: number;
  message: string;
  explanation: string;
}

export interface WeeklyDistributionItem {
  taskId: number;
  taskName: string;
  dayIndex: number; // 0=Mon, ..., 6=Sun
  dayName: string;
  allocatedMinutes: number;
  isGoalSession?: boolean;
  category: CategoryType;
}

export interface PlanWeekResult {
  distributions: WeeklyDistributionItem[];
  summary: string;
  scheduledGoalsCount: number;
  scheduledTasksCount: number;
}

export interface AppBackupData {
  version: string;
  exportedAt: string;
  tasks: Task[];
  capacity: CapacitySettings;
  reflections: DayReflection[];
  userProfile?: UserProfile;
  activityHistory?: Record<string, ActivityDay>;
}

