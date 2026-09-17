import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, Check, Trash2, LayoutTemplate } from 'lucide-react';
import { AestheticCover, CoverDisplayStyle } from '../types';
import { PRESET_COVERS } from '../utils/covers';

interface CoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCover?: AestheticCover;
  onSaveCover: (cover?: AestheticCover) => void;
  title?: string;
}

export const CoverModal: React.FC<CoverModalProps> = ({
  isOpen,
  onClose,
  currentCover,
  onSaveCover,
  title = 'Visual Moodboard / Cover',
}) => {
  const [url, setUrl] = useState(currentCover?.url || PRESET_COVERS[0].url);
  const [displayStyle, setDisplayStyle] = useState<CoverDisplayStyle>(
    currentCover?.displayStyle || 'side'
  );
  const [caption, setCaption] = useState(currentCover?.caption || '');
  const [customInputUrl, setCustomInputUrl] = useState('');
  const [uploadError, setUploadError] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be under 5MB.');
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result as string;
      if (dataUrl) {
        setUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (customInputUrl.trim()) {
      setUrl(customInputUrl.trim());
      setCustomInputUrl('');
    }
  };

  const handleSave = () => {
    if (displayStyle === 'none') {
      onSaveCover(undefined);
    } else {
      onSaveCover({
        url,
        displayStyle,
        caption: caption.trim() || undefined,
      });
    }
    onClose();
  };

  const handleRemove = () => {
    onSaveCover(undefined);
    onClose();
  };

  return (
    <div
      id="modal-cover-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="modal-cover-card"
        className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full p-5 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-500" />
              <span>{title}</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Choose an aesthetic moodboard to anchor your planning horizon.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Live Preview */}
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-400 block mb-2">
              Preview
            </span>
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 h-28 flex items-center justify-center">
              {url ? (
                <img
                  src={url}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-xs text-stone-400 italic">No image selected</span>
              )}
            </div>
          </div>

          {/* Display Style Selector */}
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-400 block mb-2">
              Display Style
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'side', label: 'Side Image', desc: 'Compact Notion-style' },
                { id: 'cover', label: 'Top Banner', desc: 'Sleek header band' },
                { id: 'subtle_bg', label: 'Soft Tint', desc: 'Subtle backdrop' },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setDisplayStyle(style.id as CoverDisplayStyle)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    displayStyle === style.id
                      ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                      : 'bg-stone-50 border-stone-200 hover:border-stone-300 text-stone-800'
                  }`}
                >
                  <div className="text-xs font-bold">{style.label}</div>
                  <div
                    className={`text-[10px] mt-0.5 ${
                      displayStyle === style.id ? 'text-stone-300' : 'text-stone-400'
                    }`}
                  >
                    {style.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preset Covers Grid */}
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-400 block mb-2">
              Curated Moodboard Presets
            </span>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_COVERS.map((preset) => {
                const isSelected = url === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setUrl(preset.url)}
                    className={`relative rounded-xl overflow-hidden aspect-video border cursor-pointer group transition-all ${
                      isSelected
                        ? 'ring-2 ring-stone-900 border-stone-900'
                        : 'border-stone-200 hover:opacity-90'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-end p-1 text-[9px] text-white font-semibold truncate opacity-90 group-hover:opacity-100">
                      {preset.name.split(' ')[0]}
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-stone-900 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload or Custom URL */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-400 block">
              Or Upload / Link Your Own
            </span>

            {/* File Upload */}
            <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-stone-300 hover:border-stone-400 bg-stone-50/50 hover:bg-stone-50 cursor-pointer text-xs font-semibold text-stone-700 transition-colors">
              <Upload className="w-3.5 h-3.5 text-stone-500" />
              <span>Choose photo from device...</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {uploadError && <p className="text-xs text-rose-500">{uploadError}</p>}

            {/* URL Input */}
            <div className="flex gap-2">
              <input
                type="url"
                value={customInputUrl}
                onChange={(e) => setCustomInputUrl(e.target.value)}
                placeholder="Paste image URL (Pinterest, Unsplash...)"
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-stone-900"
              />
              <button
                type="button"
                onClick={handleApplyCustomUrl}
                className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
          {currentCover ? (
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove image</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
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
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold cursor-pointer transition-all shadow-xs"
            >
              Save Cover
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
