import {
  ThemeSettings,
  PresetThemeKey,
  CategoryType,
  BackgroundImageSettings,
} from '../types';

export const DEFAULT_CATEGORY_COLORS: Record<CategoryType | 'break' | 'free', string> = {
  academic: '#4F46E5', // Indigo
  technical: '#0D9488', // Teal
  career: '#D97706', // Amber
  creative: '#DB2777', // Pink
  personal: '#10B981', // Emerald
  admin: '#64748B', // Slate
  break: '#CA8A04', // Warm Ochre
  free: '#06B6D4', // Cyan
};

export const PRESET_THEMES: Record<PresetThemeKey, ThemeSettings> = {
  clean: {
    id: 'preset-clean',
    name: 'Clean',
    presetKey: 'clean',
    colors: {
      background: '#F8F9FA',
      card: '#FFFFFF',
      cardBorder: '#E5E7EB',
      text: '#111827',
      textMuted: '#6B7280',
      accent: '#2563EB',
      accentSecondary: '#64748B',
    },
    categoryColors: { ...DEFAULT_CATEGORY_COLORS },
    cardStyle: 'minimal',
    borderRadius: 'medium',
    typography: {
      fontFamily: 'Inter',
      fontSizeScale: 'normal',
      spacingDensity: 'comfortable',
    },
    backgroundEffects: {
      gradient: 'none',
      grain: false,
      vignette: false,
    },
  },
  sage: {
    id: 'preset-sage',
    name: 'Sage',
    presetKey: 'sage',
    colors: {
      background: '#F3F5EF',
      card: '#FFFFFF',
      cardBorder: '#DCE2D4',
      text: '#1C261F',
      textMuted: '#5F7263',
      accent: '#3D684E',
      accentSecondary: '#6E8B76',
    },
    categoryColors: {
      academic: '#3B6B56',
      technical: '#2D7068',
      career: '#5C7449',
      creative: '#876D49',
      personal: '#4A7A57',
      admin: '#646D65',
      break: '#96815B',
      free: '#52857C',
    },
    cardStyle: 'soft',
    borderRadius: 'curved',
    typography: {
      fontFamily: 'DM Sans',
      fontSizeScale: 'normal',
      spacingDensity: 'comfortable',
    },
    backgroundEffects: {
      gradient: 'none',
      grain: true,
      vignette: false,
    },
  },
  soft: {
    id: 'preset-soft',
    name: 'Soft',
    presetKey: 'soft',
    colors: {
      background: '#FAF6F7',
      card: '#FFFFFF',
      cardBorder: '#F2E1E5',
      text: '#2F1E24',
      textMuted: '#8A6F77',
      accent: '#BD5876',
      accentSecondary: '#DB9EAE',
    },
    categoryColors: {
      academic: '#8C5282',
      technical: '#507482',
      career: '#AD6D57',
      creative: '#B5506E',
      personal: '#608569',
      admin: '#786C72',
      break: '#B57C58',
      free: '#6B8C9C',
    },
    cardStyle: 'soft',
    borderRadius: 'curved',
    typography: {
      fontFamily: 'Plus Jakarta Sans',
      fontSizeScale: 'normal',
      spacingDensity: 'comfortable',
    },
    backgroundEffects: {
      gradient: 'subtle_warm',
      grain: false,
      vignette: false,
    },
  },
  midnight: {
    id: 'preset-midnight',
    name: 'Midnight',
    presetKey: 'midnight',
    colors: {
      background: '#0F1117',
      card: '#181B24',
      cardBorder: '#272C3B',
      text: '#F3F4F8',
      textMuted: '#8E98B0',
      accent: '#7586E8',
      accentSecondary: '#A07CE8',
    },
    categoryColors: {
      academic: '#818CF8',
      technical: '#2DD4BF',
      career: '#FBBF24',
      creative: '#F472B6',
      personal: '#34D399',
      admin: '#94A3B8',
      break: '#F59E0B',
      free: '#38BDF8',
    },
    cardStyle: 'dark',
    borderRadius: 'medium',
    typography: {
      fontFamily: 'Inter',
      fontSizeScale: 'normal',
      spacingDensity: 'comfortable',
    },
    backgroundEffects: {
      gradient: 'dusk',
      grain: true,
      vignette: true,
    },
  },
  autumn: {
    id: 'preset-autumn',
    name: 'Autumn',
    presetKey: 'autumn',
    colors: {
      background: '#F9F4EE',
      card: '#FFFFFF',
      cardBorder: '#EFE0D2',
      text: '#2C2017',
      textMuted: '#7D685B',
      accent: '#B8582E',
      accentSecondary: '#D28557',
    },
    categoryColors: {
      academic: '#8A4F3D',
      technical: '#496B5B',
      career: '#BA6824',
      creative: '#C25244',
      personal: '#617846',
      admin: '#78685C',
      break: '#B07B37',
      free: '#5C7E82',
    },
    cardStyle: 'journal',
    borderRadius: 'medium',
    typography: {
      fontFamily: 'DM Sans',
      fontSizeScale: 'normal',
      spacingDensity: 'comfortable',
    },
    backgroundEffects: {
      gradient: 'subtle_warm',
      grain: true,
      vignette: false,
    },
  },
  lavender: {
    id: 'preset-lavender',
    name: 'Lavender',
    presetKey: 'lavender',
    colors: {
      background: '#F5F3F9',
      card: '#FFFFFF',
      cardBorder: '#E6E0F1',
      text: '#272036',
      textMuted: '#756A88',
      accent: '#7C60A6',
      accentSecondary: '#A995C9',
    },
    categoryColors: {
      academic: '#7053A3',
      technical: '#4B7382',
      career: '#9C6842',
      creative: '#A85289',
      personal: '#56806C',
      admin: '#6F6A78',
      break: '#A68254',
      free: '#68869E',
    },
    cardStyle: 'soft',
    borderRadius: 'curved',
    typography: {
      fontFamily: 'Plus Jakarta Sans',
      fontSizeScale: 'normal',
      spacingDensity: 'comfortable',
    },
    backgroundEffects: {
      gradient: 'aurora',
      grain: false,
      vignette: false,
    },
  },
  ocean: {
    id: 'preset-ocean',
    name: 'Ocean',
    presetKey: 'ocean',
    colors: {
      background: '#F0F6F8',
      card: '#FFFFFF',
      cardBorder: '#DCE8EC',
      text: '#13242B',
      textMuted: '#57727B',
      accent: '#217885',
      accentSecondary: '#5DA3AF',
    },
    categoryColors: {
      academic: '#39608F',
      technical: '#1E7C85',
      career: '#B87233',
      creative: '#8C5685',
      personal: '#3D7C66',
      admin: '#5F6E73',
      break: '#B08848',
      free: '#388B9E',
    },
    cardStyle: 'soft',
    borderRadius: 'curved',
    typography: {
      fontFamily: 'Manrope',
      fontSizeScale: 'normal',
      spacingDensity: 'comfortable',
    },
    backgroundEffects: {
      gradient: 'subtle_cool',
      grain: false,
      vignette: false,
    },
  },
  dark_academia: {
    id: 'preset-dark-academia',
    name: 'Dark Academia',
    presetKey: 'dark_academia',
    colors: {
      background: '#181613',
      card: '#24211C',
      cardBorder: '#36322A',
      text: '#ECE5D8',
      textMuted: '#A09788',
      accent: '#C79A63',
      accentSecondary: '#8B5B41',
    },
    categoryColors: {
      academic: '#C79A63',
      technical: '#5E8276',
      career: '#B07548',
      creative: '#9A524C',
      personal: '#6A7D5C',
      admin: '#7D776C',
      break: '#B58D54',
      free: '#5F7C85',
    },
    cardStyle: 'dark',
    borderRadius: 'sharp',
    typography: {
      fontFamily: 'DM Sans',
      fontSizeScale: 'normal',
      spacingDensity: 'comfortable',
    },
    backgroundEffects: {
      gradient: 'none',
      grain: true,
      vignette: true,
    },
  },
  custom: {
    id: 'preset-custom',
    name: 'Custom',
    presetKey: 'custom',
    colors: {
      background: '#F8F9FA',
      card: '#FFFFFF',
      cardBorder: '#E5E7EB',
      text: '#111827',
      textMuted: '#6B7280',
      accent: '#2563EB',
      accentSecondary: '#64748B',
    },
    categoryColors: { ...DEFAULT_CATEGORY_COLORS },
    cardStyle: 'soft',
    borderRadius: 'curved',
    typography: {
      fontFamily: 'Inter',
      fontSizeScale: 'normal',
      spacingDensity: 'comfortable',
    },
    backgroundEffects: {
      gradient: 'none',
      grain: false,
      vignette: false,
    },
  },
};

export const AESTHETIC_WALLPAPER_PRESETS: {
  id: string;
  name: string;
  category: string;
  url: string;
  recommendedTheme: PresetThemeKey;
}[] = [
  {
    id: 'wp-sage-foliage',
    name: 'Misty Eucalyptus',
    category: '🌿 Botanical',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1600&q=80',
    recommendedTheme: 'sage',
  },
  {
    id: 'wp-botanical-fern',
    name: 'Quiet Fern Shadow',
    category: '🌿 Botanical',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=80',
    recommendedTheme: 'sage',
  },
  {
    id: 'wp-soft-morning',
    name: 'Warm Morning Linen',
    category: '🌸 Soft & Cozy',
    url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1600&q=80',
    recommendedTheme: 'soft',
  },
  {
    id: 'wp-lavender-field',
    name: 'Provence Dusk',
    category: '🌸 Soft & Cozy',
    url: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=1600&q=80',
    recommendedTheme: 'lavender',
  },
  {
    id: 'wp-study-books',
    name: 'Antique Library',
    category: '🖤 Dark Academia',
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1600&q=80',
    recommendedTheme: 'dark_academia',
  },
  {
    id: 'wp-midnight-stars',
    name: 'Deep Cosmos',
    category: '🌙 Midnight',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80',
    recommendedTheme: 'midnight',
  },
  {
    id: 'wp-autumn-woods',
    name: 'Golden Pine & Maple',
    category: '🍂 Autumn',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    recommendedTheme: 'autumn',
  },
  {
    id: 'wp-ocean-fog',
    name: 'Pacific Mist & Shore',
    category: '🌊 Ocean',
    url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1600&q=80',
    recommendedTheme: 'ocean',
  },
  {
    id: 'wp-minimal-concrete',
    name: 'Minimalist Architecture',
    category: '🧊 Clean',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
    recommendedTheme: 'clean',
  },
];

// Color Math: Relative Luminance and Contrast Ratio (WCAG AA compliant)
export function getLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return 0.5;

  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export function checkContrastSafety(textColor: string, bgColor: string): {
  ratio: number;
  isSafe: boolean; // >= 4.5:1
  message: string;
} {
  const ratio = Math.round(getContrastRatio(textColor, bgColor) * 10) / 10;
  const isSafe = ratio >= 4.5;
  let message = 'Excellent contrast (WCAG AA)';
  if (ratio < 3.0) {
    message = 'Low contrast. Text may be hard to read.';
  } else if (ratio < 4.5) {
    message = 'Moderate contrast. Legible for larger text.';
  }
  return { ratio, isSafe, message };
}

// Compress uploaded background images via Canvas to prevent exceeding localStorage quota
export function compressImageFile(
  file: File,
  maxWidth = 1600,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

// Map border radius enum to CSS pixel strings
export function getBorderRadiusValue(radius: ThemeSettings['borderRadius']): string {
  switch (radius) {
    case 'sharp':
      return '6px';
    case 'medium':
      return '12px';
    case 'curved':
      return '18px';
    case 'pill':
      return '24px';
    default:
      return '16px';
  }
}

// Apply CSS variables dynamically to the document root
export function applyThemeToDocument(
  theme: ThemeSettings,
  horizonOverride?: {
    accentColor?: string;
    backgroundImage?: string;
  }
): void {
  const root = document.documentElement;

  // Active colors (with horizon override if set)
  const activeAccent = horizonOverride?.accentColor || theme.colors.accent;

  // Core Theme variables
  root.style.setProperty('--theme-bg', theme.colors.background);
  root.style.setProperty('--flow-bg', theme.colors.background);
  root.style.setProperty('--theme-card', theme.colors.card);
  root.style.setProperty('--flow-card', theme.colors.card);
  root.style.setProperty('--theme-card-border', theme.colors.cardBorder);
  root.style.setProperty('--flow-card-border', theme.colors.cardBorder);
  root.style.setProperty('--theme-text', theme.colors.text);
  root.style.setProperty('--flow-text', theme.colors.text);
  root.style.setProperty('--theme-text-muted', theme.colors.textMuted);
  root.style.setProperty('--theme-accent', activeAccent);
  root.style.setProperty('--theme-accent-secondary', theme.colors.accentSecondary);
  root.style.setProperty('--theme-radius', getBorderRadiusValue(theme.borderRadius));

  // Determine if theme is dark
  const bgLuminance = getLuminance(theme.colors.background);
  const isDark = bgLuminance < 0.25 || theme.presetKey === 'midnight' || theme.presetKey === 'dark_academia';
  root.classList.toggle('dark', isDark);
  root.style.colorScheme = isDark ? 'dark' : 'light';
  root.setAttribute('data-theme', theme.presetKey || 'custom');

  // Apply directly to body element as well for guaranteed instant visual update
  if (document.body) {
    document.body.style.backgroundColor = theme.colors.background;
    document.body.style.color = theme.colors.text;
    document.body.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark-theme', isDark);
    document.body.setAttribute('data-theme', theme.presetKey || 'custom');
  }

  // Also apply directly to #flow-app if present
  const appEl = document.getElementById('flow-app');
  if (appEl) {
    appEl.classList.toggle('dark', isDark);
    appEl.classList.toggle('dark-theme', isDark);
    appEl.setAttribute('data-theme', theme.presetKey || 'custom');
  }

  // Category variables
  if (theme.categoryColors) {
    Object.entries(theme.categoryColors).forEach(([cat, col]) => {
      root.style.setProperty(`--theme-cat-${cat}`, col);
    });
  }

  // Typography font family
  let fontFamily = `'DM Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  if (theme.typography.fontFamily === 'Inter') {
    fontFamily = `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;
  } else if (theme.typography.fontFamily === 'Manrope') {
    fontFamily = `'Manrope', -apple-system, BlinkMacSystemFont, sans-serif`;
  } else if (theme.typography.fontFamily === 'Plus Jakarta Sans') {
    fontFamily = `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif`;
  } else if (theme.typography.fontFamily === 'Geist') {
    fontFamily = `Geist, -apple-system, BlinkMacSystemFont, sans-serif`;
  }
  root.style.setProperty('--theme-font', fontFamily);
  if (document.body) {
    document.body.style.fontFamily = fontFamily;
  }
}
