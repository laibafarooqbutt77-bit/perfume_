import React, { useState, useRef, useMemo } from 'react';
import {
  Upload,
  Search,
  FolderOpen,
  Film,
  Image as ImageIcon,
  Eye,
  Trash2,
  RefreshCw,
  X,
  Check
} from 'lucide-react';
import { useSiteContent } from '../../context/SiteContentContext';
import type { MediaFolder, MediaItemMeta } from '../../types/cms';
import { CmsImage, CmsMediaRenderer } from '../CmsMedia';
import { ConfirmModal } from './AdminShared';

interface MediaLibraryTabProps {
  onNotify: (msg: string) => void;
}

const FOLDERS: Array<'All' | MediaFolder> = [
  'All',
  'Hero & Banners',
  'Products',
  'Collections',
  'Videos',
  'General'
];

export const MediaLibraryTab: React.FC<MediaLibraryTabProps> = ({ onNotify }) => {
  const {
    mediaItems,
    uploadMediaFile,
    replaceMediaFile,
    updateMediaFolder,
    deleteMediaItem,
    updateHero,
    updateAtelier
  } = useSiteContent();

  const [selectedFolder, setSelectedFolder] = useState<'All' | MediaFolder>('All');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [search, setSearch] = useState('');
  const [uploadFolder, setUploadFolder] = useState<MediaFolder>('General');
  const [uploading, setUploading] = useState(false);

  const [previewItem, setPreviewItem] = useState<MediaItemMeta | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItemMeta | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mediaItems.filter((item) => {
      if (selectedFolder !== 'All' && item.folder !== selectedFolder) return false;
      if (typeFilter !== 'all' && item.mediaType !== typeFilter) return false;
      if (!q) return true;
      return item.name.toLowerCase().includes(q) || item.folder.toLowerCase().includes(q);
    });
  }, [mediaItems, selectedFolder, typeFilter, search]);

  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    let successCount = 0;
    let firstErr = '';
    for (const file of files) {
      const targetFolder = file.type.startsWith('video/') ? 'Videos' : uploadFolder;
      const res = await uploadMediaFile(file, targetFolder);
      if (res.ok) successCount += 1;
      else if (!firstErr) firstErr = res.error || 'Upload error';
    }
    setUploading(false);
    e.target.value = '';
    if (successCount > 0) {
      onNotify(`Stored ${successCount} media file(s) locally in IndexedDB.`);
    } else if (firstErr) {
      onNotify(firstErr);
    }
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replaceTargetId) return;
    const res = await replaceMediaFile(replaceTargetId, file);
    e.target.value = '';
    setReplaceTargetId(null);
    if (res.ok) {
      onNotify('Media file replaced cleanly across linked storefront assets.');
      setPreviewItem(null);
    } else {
      onNotify(res.error || 'Failed to replace media.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
            Local Media Library (IndexedDB)
          </h1>
          <p className="text-xs sm:text-sm text-[#6B635B] dark:text-[#A89E92]">
            Upload, preview, replace, and organize high-resolution photos & videos strictly inside browser IndexedDB.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={uploadFolder}
            onChange={(e) => setUploadFolder(e.target.value as MediaFolder)}
            aria-label="Target upload folder"
            className="px-3 py-2 rounded-lg bg-white dark:bg-[#191714] border border-[#DDD6CB] dark:border-[#302B24] text-xs"
          >
            {FOLDERS.filter((f) => f !== 'All').map((f) => (
              <option key={f} value={f}>
                Folder: {f}
              </option>
            ))}
          </select>

          <input
            ref={uploadInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleUploadFiles}
            className="hidden"
          />
          <input
            ref={replaceInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleReplaceFile}
            className="hidden"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => uploadInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#785E19] dark:bg-[#D4AF37] dark:text-[#141414] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Storing Locally...' : 'Upload Image / Video'}</span>
          </button>
        </div>
      </div>

      {/* Filters & Folders Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#736B63] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search images & videos by filename..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(['all', 'image', 'video'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-md capitalize font-medium cursor-pointer ${
                  typeFilter === t
                    ? 'bg-[#141414] text-white dark:bg-[#D4AF37] dark:text-[#141414]'
                    : 'bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]'
                }`}
              >
                {t === 'all' ? 'All Media' : `${t}s`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#F0EBE3] dark:border-[#26231E]">
          {FOLDERS.map((folder) => (
            <button
              key={folder}
              type="button"
              onClick={() => setSelectedFolder(folder)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium cursor-pointer ${
                selectedFolder === folder
                  ? 'bg-[#785E19] text-white dark:bg-[#D4AF37] dark:text-[#141414]'
                  : 'bg-[#FAF8F5] dark:bg-[#141311] text-[#5C544D] dark:text-[#C7BEB2]'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>{folder}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] text-center text-xs text-[#6B635B] dark:text-[#A89E92]">
          No media assets match your filter. Click "Upload Image / Video" above to add files locally.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] overflow-hidden flex flex-col justify-between"
            >
              <div
                onClick={() => setPreviewItem(item)}
                className="relative aspect-[4/3] bg-[#141414] overflow-hidden cursor-pointer group"
              >
                {item.mediaType === 'image' ? (
                  <CmsImage
                    src={item.src}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#D4AF37] gap-1.5">
                    <Film className="w-8 h-8" />
                    <span className="text-[11px] uppercase tracking-wider">Click to Play Video</span>
                  </div>
                )}
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-xs bg-black/75 text-[#E6CA85] text-[10px] font-semibold uppercase tracking-wider inline-flex items-center gap-1">
                  {item.mediaType === 'video' ? (
                    <Film className="w-3 h-3" />
                  ) : (
                    <ImageIcon className="w-3 h-3" />
                  )}
                  {item.src.startsWith('idb://') ? 'IndexedDB' : 'Built-in'}
                </span>
              </div>

              <div className="p-3.5 space-y-2.5 text-xs">
                <div>
                  <p className="font-semibold text-[#141414] dark:text-[#FAF8F5] truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-[#6B635B] dark:text-[#A89E92] font-mono tabular-nums">
                    {item.mimeType} · {Math.max(1, Math.round(item.sizeBytes / 1024))} KB
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <select
                    value={item.folder}
                    onChange={(e) => {
                      updateMediaFolder(item.id, e.target.value as MediaFolder);
                      onNotify(`Moved "${item.name}" to ${e.target.value}.`);
                    }}
                    aria-label={`Folder for ${item.name}`}
                    className="flex-1 px-2 py-1 rounded-md bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24] text-[11px]"
                  >
                    {FOLDERS.filter((f) => f !== 'All').map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      className="p-1.5 rounded-md border border-[#DDD6CB] dark:border-[#302B24]"
                      aria-label={`Preview ${item.name}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReplaceTargetId(item.id);
                        replaceInputRef.current?.click();
                      }}
                      className="p-1.5 rounded-md border border-[#DDD6CB] dark:border-[#302B24]"
                      aria-label={`Replace ${item.name}`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      className="p-1.5 rounded-md border border-[#DDD6CB] dark:border-[#302B24] text-red-600"
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview & Quick-Assign Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          onClick={() => setPreviewItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-4 border-b border-[#EAE3D9] dark:border-[#2B2620] flex items-center justify-between">
              <h3 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5] truncate">
                {previewItem.name}
              </h3>
              <button type="button" onClick={() => setPreviewItem(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#141414] aspect-video flex items-center justify-center overflow-hidden">
              <CmsMediaRenderer
                src={previewItem.src}
                mediaType={previewItem.mediaType}
                alt={previewItem.name}
                controls={true}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="font-mono text-[11px] text-[#6B635B] dark:text-[#A89E92]">
                Ref: {previewItem.src}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(previewItem.src);
                    setCopiedId(previewItem.id);
                    setTimeout(() => setCopiedId(null), 1500);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-[#DDD6CB] dark:border-[#302B24]"
                >
                  {copiedId === previewItem.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <span>Copy Reference</span>
                  )}
                </button>
                {previewItem.mediaType === 'image' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        updateHero({ heroImage: previewItem.src });
                        onNotify(`Updated Hero Image to "${previewItem.name}".`);
                      }}
                      className="px-3 py-1.5 rounded-md bg-[#141414] dark:bg-[#D4AF37] dark:text-[#141414] text-white font-semibold"
                    >
                      Set as Hero Image
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateAtelier({ image: previewItem.src });
                        onNotify(`Updated Atelier Image to "${previewItem.name}".`);
                      }}
                      className="px-3 py-1.5 rounded-md border border-[#785E19] text-[#785E19] dark:text-[#D4AF37] font-semibold"
                    >
                      Set as Atelier Portrait
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete Media File?"
        description={`Remove "${deleteTarget?.name}" from your local media library? If it was uploaded to IndexedDB, the binary file will also be deleted.`}
        confirmLabel="Delete Asset"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const res = await deleteMediaItem(deleteTarget.id);
          if (res.ok) onNotify(`Deleted "${deleteTarget.name}".`);
          else onNotify(res.error || 'Could not delete asset.');
          setDeleteTarget(null);
        }}
      />
    </div>
  );
};
