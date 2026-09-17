import React from 'react';
import {
  X,
  LayoutGrid,
  Columns,
  Square,
  Check,
  RotateCcw,
  Sparkles,
  Maximize2,
  Sliders,
  Eye,
} from 'lucide-react';
import { VisionBoardLayoutSettings, VisionLayoutMode } from '../types';

interface VisionLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  layout: VisionBoardLayoutSettings;
  onChangeLayout: (layout: VisionBoardLayoutSettings) => void;
  onResetLayout: () => void;
}

export const VisionLayoutModal: React.FC<VisionLayoutModalProps> = ({
  isOpen,
  onClose,
  layout,
  onChangeLayout,
  onResetLayout,
}) => {
  if (!isOpen) return null;

  const update = (patch: Partial<VisionBoardLayoutSettings>) => {
    onChangeLayout({ ...layout, ...patch });
  };

  return (
    <div
      id="modal-vision-layout-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="modal-vision-layout-content"
        className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-stone-900">
                Vision Board Layout & Style
              </h2>
              <p className="text-[11px] text-stone-500 font-medium">
                Customize column density, card aesthetics, and arrangement flow
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

        <div className="space-y-5">
          {/* Layout Mode */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-stone-700 block mb-2">
              Arrangement Mode
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'masonry', label: 'Masonry', desc: 'Fluid waterfall' },
                { id: 'grid', label: 'Uniform Grid', desc: 'Symmetrical' },
                { id: 'mosaic', label: 'Editorial', desc: 'Hero & accents' },
                { id: 'journal', label: 'Journal', desc: 'Full cards' },
              ].map((m) => {
                const active = layout.mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => update({ mode: m.id as VisionLayoutMode })}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      active
                        ? 'border-stone-900 bg-stone-900 text-white shadow-2xs'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800'
                    }`}
                  >
                    <div className="text-xs font-bold">{m.label}</div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        active ? 'text-stone-300' : 'text-stone-400'
                      }`}
                    >
                      {m.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Columns */}
          {layout.mode !== 'journal' && (
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-stone-700 block mb-2">
                Columns / Density
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { cols: 2, label: '2 Columns', desc: 'Large & Spacious' },
                  { cols: 3, label: '3 Columns', desc: 'Balanced / Standard' },
                  { cols: 4, label: '4 Columns', desc: 'Compact Gallery' },
                ].map((c) => {
                  const active = layout.columns === c.cols;
                  return (
                    <button
                      key={c.cols}
                      type="button"
                      onClick={() => update({ columns: c.cols as 2 | 3 | 4 })}
                      className={`p-2.5 rounded-2xl border text-left transition-all ${
                        active
                          ? 'border-stone-900 bg-stone-900 text-white shadow-2xs'
                          : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800'
                      }`}
                    >
                      <div className="text-xs font-bold">{c.label}</div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          active ? 'text-stone-300' : 'text-stone-400'
                        }`}
                      >
                        {c.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Gap / Spacing */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-stone-700 block mb-2">
              Tile Spacing (Gap)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'compact', label: 'Compact', desc: '12px gap' },
                { id: 'normal', label: 'Standard', desc: '20px gap' },
                { id: 'spacious', label: 'Spacious', desc: '32px gap' },
              ].map((g) => {
                const active = layout.gap === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => update({ gap: g.id as 'compact' | 'normal' | 'spacious' })}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      active
                        ? 'border-stone-900 bg-stone-900 text-white shadow-2xs'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800'
                    }`}
                  >
                    <div className="text-xs font-bold">{g.label}</div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        active ? 'text-stone-300' : 'text-stone-400'
                      }`}
                    >
                      {g.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Shape & Rounding */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-stone-700 block mb-1.5">
                Aspect Ratio
              </label>
              <select
                value={layout.aspectRatioOverride}
                onChange={(e) =>
                  update({
                    aspectRatioOverride: e.target.value as any,
                  })
                }
                className="w-full text-xs font-bold px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:outline-none focus:border-stone-900"
              >
                <option value="original">Adaptive / Per-Tile</option>
                <option value="square">Force Square (1:1)</option>
                <option value="portrait">Force Portrait (3:4)</option>
                <option value="landscape">Force Landscape (16:9)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-stone-700 block mb-1.5">
                Corner Rounding
              </label>
              <select
                value={layout.cardRounding}
                onChange={(e) =>
                  update({
                    cardRounding: e.target.value as any,
                  })
                }
                className="w-full text-xs font-bold px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:outline-none focus:border-stone-900"
              >
                <option value="subtle">Subtle (8px)</option>
                <option value="rounded">Modern Rounded (16px)</option>
                <option value="curved">Smooth Curved (24px)</option>
              </select>
            </div>
          </div>

          {/* Display Toggles */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-600 block">
              Card Content Visibility
            </span>

            <label className="flex items-center justify-between text-xs font-semibold text-stone-800 cursor-pointer">
              <span>Show Affirmations & Mantras</span>
              <input
                type="checkbox"
                checked={layout.showAffirmation}
                onChange={(e) => update({ showAffirmation: e.target.checked })}
                className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
            </label>

            <label className="flex items-center justify-between text-xs font-semibold text-stone-800 cursor-pointer">
              <span>Show Captions & Notes</span>
              <input
                type="checkbox"
                checked={layout.showCaption}
                onChange={(e) => update({ showCaption: e.target.checked })}
                className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
            </label>

            <label className="flex items-center justify-between text-xs font-semibold text-stone-800 cursor-pointer">
              <span>Show Linked Big-Picture Goals</span>
              <input
                type="checkbox"
                checked={layout.showLinkedGoal}
                onChange={(e) => update({ showLinkedGoal: e.target.checked })}
                className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onResetLayout}
              className="text-xs font-bold text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Layout</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-black text-white cursor-pointer shadow-xs"
            >
              Apply Layout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
