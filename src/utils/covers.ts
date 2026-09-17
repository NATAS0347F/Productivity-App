import { AestheticCover, CoverDisplayStyle } from '../types';

export interface PresetCover {
  id: string;
  name: string;
  url: string;
  category: 'minimal' | 'botanical' | 'study' | 'warm';
}

export const PRESET_COVERS: PresetCover[] = [
  {
    id: 'reset-rebuild',
    name: 'Reset & Rebuild (Botanical)',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=80',
    category: 'botanical',
  },
  {
    id: 'coffee-journal',
    name: 'Morning Journal & Coffee',
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    category: 'warm',
  },
  {
    id: 'minimal-desk',
    name: 'Minimalist Architecture & Light',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    category: 'minimal',
  },
  {
    id: 'study-books',
    name: 'Library & Deep Study',
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80',
    category: 'study',
  },
  {
    id: 'creative-canvas',
    name: 'Creative Studio Light',
    url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80',
    category: 'warm',
  },
  {
    id: 'quiet-pine',
    name: 'Misty Forest Morning',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    category: 'botanical',
  },
];

export const DEFAULT_MONTH_COVER: AestheticCover = {
  url: PRESET_COVERS[0].url,
  displayStyle: 'side',
  caption: 'Reset & Rebuild',
};

export const DEFAULT_WEEK_COVER: AestheticCover = {
  url: PRESET_COVERS[1].url,
  displayStyle: 'side',
  caption: 'Get back into learning',
};
