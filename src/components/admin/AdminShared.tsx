import React, { useState, useRef } from 'react';
import { AlertTriangle, X, Upload, Image as ImageIcon, Film, Check } from 'lucide-react';
import { useSiteContent } from '../../context/SiteContentContext';
import { CmsImage } from '../CmsMedia';
import type { MediaFolder } from '../../types/cms';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  danger = true,
  onConfirm,
  onCancel
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="w-full max-w-md rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              danger
                ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3
              id="confirm-modal-title"
              className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]"
            >
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-[#5C544D] dark:text-[#B5ABA0] mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-[#DDD6CB] dark:border-[#332E27] text-xs font-medium text-[#4A443E] dark:text-[#D4C8B8] hover:bg-[#FAF8F5] dark:hover:bg-[#23201B] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md text-xs font-semibold text-white transition-colors ${
              danger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#141414] hover:bg-[#785E19] dark:bg-[#D4AF37] dark:text-[#141414]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

interface MediaPickerModalProps {
  open: boolean;
  acceptType?: 'image' | 'video' | 'all';
  defaultFolder?: MediaFolder;
  currentValue?: string;
  onSelect: (src: string, mediaType: 'image' | 'video') => void;
  onClose: () => void;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  open,
  acceptType = 'image',
  defaultFolder = 'General',
  currentValue,
  onSelect,
  onClose
}) => {
  const { mediaItems, uploadMediaFile } = useSiteContent();
  const [filterFolder, setFilterFolder] = useState<string>('All');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!open) return null;

  const filtered = mediaItems.filter((item) => {
    if (acceptType !== 'all' && item.mediaType !== acceptType) return false;
    if (filterFolder !== 'All' && item.folder !== filterFolder) return false;
    return true;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    const res = await uploadMediaFile(file, defaultFolder);
    setUploading(false);
    e.target.value = '';
    if (!res.ok || !res.item) {
      setUploadError(res.error || 'Upload failed.');
      return;
    }
    onSelect(res.item.src, res.item.mediaType);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-[#EAE3D9] dark:border-[#2B2620] flex items-center justify-between">
          <div>
            <h3 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
              Select from Local Media Library
            </h3>
            <p className="text-xs text-[#6B635B] dark:text-[#A89E92]">
              Pick an existing image/video or upload a new file directly to IndexedDB.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close media picker"
            className="p-1.5 rounded-full hover:bg-[#F2ECE4] dark:hover:bg-[#26231D] text-[#5C544D] dark:text-[#C7BEB2]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-3 bg-[#FAF8F5] dark:bg-[#141311] border-b border-[#EAE3D9] dark:border-[#2B2620] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {['All', 'Hero & Banners', 'Products', 'Collections', 'Videos', 'General'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilterFolder(f)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  filterFolder === f
                    ? 'bg-[#141414] text-white dark:bg-[#D4AF37] dark:text-[#141414]'
                    : 'bg-white dark:bg-[#1E1C18] text-[#5C544D] dark:text-[#B5ABA0] border border-[#E5E0D8] dark:border-[#2E2A23]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptType === 'video' ? 'video/*' : acceptType === 'image' ? 'image/*' : 'image/*,video/*'}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#785E19] hover:bg-[#5E4912] text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'Storing...' : 'Upload New File'}</span>
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="px-6 py-2 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs">
            {uploadError}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#6B635B] dark:text-[#A89E92]">
              No matching media files in this folder yet. Upload a new file above.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filtered.map((item) => {
                const isSelected = currentValue === item.src;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item.src, item.mediaType);
                      onClose();
                    }}
                    className={`group text-left rounded-lg overflow-hidden border transition-all bg-[#FAF8F5] dark:bg-[#141311] ${
                      isSelected
                        ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/40'
                        : 'border-[#E5E0D8] dark:border-[#2C2822] hover:border-[#785E19]'
                    }`}
                  >
                    <div className="aspect-square bg-[#141414] relative overflow-hidden">
                      {item.mediaType === 'image' ? (
                        <CmsImage
                          src={item.src}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[#D4AF37] gap-1.5">
                          <Film className="w-7 h-7" />
                          <span className="text-[10px] uppercase tracking-wider">Video Asset</span>
                        </div>
                      )}
                      {isSelected && (
                        <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#D4AF37] text-[#141414] flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium text-[#141414] dark:text-[#FAF8F5] truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-[#736B63] dark:text-[#9E958A] mt-0.5">
                        <span className="inline-flex items-center gap-1">
                          {item.mediaType === 'video' ? (
                            <Film className="w-3 h-3" />
                          ) : (
                            <ImageIcon className="w-3 h-3" />
                          )}
                          {item.folder}
                        </span>
                        <span className="font-mono tabular-nums">
                          {Math.max(1, Math.round(item.sizeBytes / 1024))} KB
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
