import { CategoryType } from '../types';
export { DEFAULT_CATEGORIES } from './storage';

export interface CategoryStyle {
  key: CategoryType | 'break' | 'free' | 'meal';
  label: string;
  emoji: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  blockBorderLeft: string;
  blockBg: string;
  description: string;
}

export const CATEGORY_CONFIG: Record<CategoryType | 'break' | 'free' | 'meal', CategoryStyle> = {
  academic: {
    key: 'academic',
    label: 'Academic / School',
    emoji: '🧠',
    badgeBg: 'bg-[#f4f1fa]',
    badgeBorder: 'border-[#dfd8ed]',
    badgeText: 'text-[#4c3d6d]',
    blockBorderLeft: 'border-l-[#6a5697]',
    blockBg: 'bg-[#faf8fd]',
    description: 'Courses, readings, study & revision',
  },
  technical: {
    key: 'technical',
    label: 'Technical / Coding',
    emoji: '💻',
    badgeBg: 'bg-[#edf6f6]',
    badgeBorder: 'border-[#cde8e7]',
    badgeText: 'text-[#1c5653]',
    blockBorderLeft: 'border-l-[#2a7b76]',
    blockBg: 'bg-[#f8fbfb]',
    description: 'Programming, architectures & systems',
  },
  career: {
    key: 'career',
    label: 'Career / Analytics',
    emoji: '📊',
    badgeBg: 'bg-[#edf3fb]',
    badgeBorder: 'border-[#cee0f7]',
    badgeText: 'text-[#1b4b80]',
    blockBorderLeft: 'border-l-[#2b6eb5]',
    blockBg: 'bg-[#f8fafd]',
    description: 'Work goals, portfolios, analytics & metrics',
  },
  creative: {
    key: 'creative',
    label: 'Creative',
    emoji: '🎨',
    badgeBg: 'bg-[#fdf4ec]',
    badgeBorder: 'border-[#fae0cb]',
    badgeText: 'text-[#7d4118]',
    blockBorderLeft: 'border-l-[#c2621b]',
    blockBg: 'bg-[#fdf9f5]',
    description: 'Writing, designing, art & generative work',
  },
  personal: {
    key: 'personal',
    label: 'Personal',
    emoji: '🌱',
    badgeBg: 'bg-[#f0f6f2]',
    badgeBorder: 'border-[#d2e9d7]',
    badgeText: 'text-[#215735]',
    blockBorderLeft: 'border-l-[#368652]',
    blockBg: 'bg-[#f8fbf9]',
    description: 'Health, habits, reflection & reading',
  },
  admin: {
    key: 'admin',
    label: 'Life / Admin',
    emoji: '🏠',
    badgeBg: 'bg-[#f5f3ef]',
    badgeBorder: 'border-[#e5e1d8]',
    badgeText: 'text-[#4e4a42]',
    blockBorderLeft: 'border-l-[#787268]',
    blockBg: 'bg-[#faf9f7]',
    description: 'Errands, finances, organization & household',
  },
  break: {
    key: 'break',
    label: 'Break',
    emoji: '☕',
    badgeBg: 'bg-[#f8f5ee]',
    badgeBorder: 'border-[#e8dfcf]',
    badgeText: 'text-[#6e5a44]',
    blockBorderLeft: 'border-l-[#9c8468]',
    blockBg: 'bg-[#fcfbf9]',
    description: 'Stretching, water, rest & decompressing',
  },
  meal: {
    key: 'meal',
    label: 'Meal / Buffer',
    emoji: '🥪',
    badgeBg: 'bg-[#fcf5e9]',
    badgeBorder: 'border-[#fae3c3]',
    badgeText: 'text-[#7e5318]',
    blockBorderLeft: 'border-l-[#b58137]',
    blockBg: 'bg-[#fdfaf5]',
    description: 'Lunch, dinner or mindful nourishment break',
  },
  free: {
    key: 'free',
    label: 'Free Time',
    emoji: '🫧',
    badgeBg: 'bg-[#faf9f7]',
    badgeBorder: 'border-[#e7e4df]',
    badgeText: 'text-[#605f5d]',
    blockBorderLeft: 'border-l-[#94918c]',
    blockBg: 'bg-[#fdfdfc]',
    description: 'Unstructured breathing space',
  },
};

export function getCategoryAccentColor(
  category: CategoryType | 'break' | 'free' | 'meal' | string,
  customColors?: Record<string, string>,
  categoriesList?: { id: string; color: string }[]
): string {
  // Check category list (from user categories)
  if (categoriesList) {
    const found = categoriesList.find((c) => c.id === category);
    if (found?.color) return found.color;
  }

  // Check theme customColors override
  if (customColors && customColors[category]) {
    return customColors[category];
  }

  const defaults: Record<string, string> = {
    academic: '#4F46E5',
    technical: '#0D9488',
    career: '#D97706',
    creative: '#DB2777',
    personal: '#10B981',
    admin: '#64748B',
    break: '#CA8A04',
    meal: '#CA8A04',
    free: '#06B6D4',
  };
  return defaults[category] || '#64748B';
}

export function getCategoryBadgeStyle(
  category: CategoryType | 'break' | 'free' | 'meal' | string,
  customColors?: Record<string, string>,
  categoriesList?: { id: string; color: string }[]
): { bg: string; text: string; border: string; accent: string } {
  const accent = getCategoryAccentColor(category, customColors, categoriesList);
  return {
    bg: `${accent}18`, // 10% opacity tint
    text: accent,
    border: `${accent}33`, // 20% opacity border
    accent,
  };
}

export function getCategoryStyle(
  categoryKey: string,
  categoriesList?: { id: string; name: string; emoji: string; color: string; description?: string }[]
): CategoryStyle {
  // Check if standard break / meal / free block
  if (categoryKey === 'break' || categoryKey === 'meal' || categoryKey === 'free') {
    return CATEGORY_CONFIG[categoryKey];
  }

  // Check user categories list
  if (categoriesList && categoriesList.length > 0) {
    const found = categoriesList.find((c) => c.id === categoryKey);
    if (found) {
      const col = found.color || '#64748B';
      return {
        key: found.id,
        label: found.name,
        emoji: found.emoji || '🏷️',
        badgeBg: `${col}15`,
        badgeBorder: `${col}35`,
        badgeText: col,
        blockBorderLeft: `border-l-[${col}]`,
        blockBg: `${col}08`,
        description: found.description || '',
      };
    }
  }

  // Check default CATEGORY_CONFIG
  if (CATEGORY_CONFIG[categoryKey as keyof typeof CATEGORY_CONFIG]) {
    return CATEGORY_CONFIG[categoryKey as keyof typeof CATEGORY_CONFIG];
  }

  // Fallback for custom or unmapped string
  const capitalized = categoryKey
    ? categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1).replace(/_/g, ' ')
    : 'General';
  return {
    key: categoryKey || 'admin',
    label: capitalized,
    emoji: '🏷️',
    badgeBg: 'bg-stone-100',
    badgeBorder: 'border-stone-200',
    badgeText: 'text-stone-700',
    blockBorderLeft: 'border-l-stone-400',
    blockBg: 'bg-stone-50',
    description: '',
  };
}

export function getCategoryDisplay(
  category: string,
  categoriesList?: { id: string; name: string; emoji: string; color: string }[]
): { label: string; emoji: string; color: string } {
  if (categoriesList) {
    const found = categoriesList.find((c) => c.id === category);
    if (found) {
      return {
        label: found.name,
        emoji: found.emoji,
        color: found.color,
      };
    }
  }

  if (CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]) {
    const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
    return {
      label: config.label,
      emoji: config.emoji,
      color: getCategoryAccentColor(category),
    };
  }

  // Fallback for custom or untyped category
  const capitalized = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    label: capitalized,
    emoji: '🏷️',
    color: '#64748B',
  };
}


export const ITEM_TYPE_CONFIG: Record<
  'task' | 'goal' | 'project' | 'idea',
  { label: string; tag: string; description: string; badgeClass: string }
> = {
  task: {
    label: 'Actionable Task',
    tag: 'TASK',
    description: 'Concrete things to do today or this week',
    badgeClass: 'bg-[#242424] text-white',
  },
  goal: {
    label: 'Long-Term Goal',
    tag: 'GOAL',
    description: 'Something you want to work towards over time (e.g. Learn Python)',
    badgeClass: 'bg-[#e2ded6] text-[#2c2b29] font-medium',
  },
  project: {
    label: 'Project',
    tag: 'PROJECT',
    description: 'Consists of multiple tasks & milestones',
    badgeClass: 'bg-[#d8e7ea] text-[#1b4e54] font-medium',
  },
  idea: {
    label: 'Idea / Backlog',
    tag: 'IDEA',
    description: 'Might want to do eventually, no immediate pressure',
    badgeClass: 'bg-[#f0ede6] text-[#716c62] font-medium',
  },
};
