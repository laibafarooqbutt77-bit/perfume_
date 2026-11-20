import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, X } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';

export const AnnouncementBar: React.FC = () => {
  const { cms } = useSiteContent();
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const activeItems = cms.announcements.filter((a) => a.enabled);

  useEffect(() => {
    if (activeItems.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % activeItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeItems.length]);

  useEffect(() => {
    if (index >= activeItems.length) {
      setIndex(0);
    }
  }, [index, activeItems.length]);

  if (!cms.siteSettings.announcementBarEnabled || dismissed || activeItems.length === 0) {
    return null;
  }

  const current = activeItems[index % activeItems.length];

  return (
    <div
      className="text-[#E8DCC4] text-[12px] py-2 px-4 transition-all border-b border-[#2A2621]"
      style={{ backgroundColor: cms.siteSettings.colors.darkBg || '#141414' }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2 text-[#D4AF37]">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="tracking-widest uppercase text-[10px] font-semibold">
            {cms.siteSettings.siteName}
          </span>
        </div>

        <div className="flex-1 text-center font-normal tracking-wide flex items-center justify-center gap-2 overflow-hidden px-2">
          <span className="transition-opacity duration-500 ease-in-out truncate max-w-xl">
            {current.text}
          </span>
          {current.linkLabel && (
            <a
              href={current.linkHref || '#collection-grid'}
              className="hidden md:inline-flex items-center text-[#D4AF37] hover:underline underline-offset-4 text-[11px] font-medium shrink-0 ml-1"
            >
              {current.linkLabel} <ChevronRight className="w-3 h-3 ml-0.5" />
            </a>
          )}
        </div>

        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss banner"
          className="text-[#C7BEB2] hover:text-[#FAF8F5] p-1 transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
