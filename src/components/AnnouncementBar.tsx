import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, X } from 'lucide-react';

const MESSAGES = [
  'Complimentary Express Courier across Pakistan on orders over ₨ 15,000',
  'Artisanal Extraits de Parfum distilled with rare Grasse botanicals & natural agarwood',
  'Cash on Delivery (COD) & secure card checkout available nationwide'
];

export const AnnouncementBar: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % MESSAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="bg-[#141414] text-[#E8DCC4] text-[12px] py-2 px-4 transition-all border-b border-[#2A2621]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2 text-[#D4AF37]">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="tracking-widest uppercase text-[10px] font-semibold">Haute Parfumerie</span>
        </div>

        <div className="flex-1 text-center font-normal tracking-wide flex items-center justify-center gap-2 overflow-hidden px-2">
          <span className="transition-opacity duration-500 ease-in-out truncate max-w-xl">
            {MESSAGES[index]}
          </span>
          <a
            href="#collection-grid"
            className="hidden md:inline-flex items-center text-[#D4AF37] hover:underline underline-offset-4 text-[11px] font-medium shrink-0 ml-1"
          >
            Explore <ChevronRight className="w-3 h-3 ml-0.5" />
          </a>
        </div>

        <button
          onClick={() => setVisible(false)}
          aria-label="Dismiss banner"
          className="text-[#999] hover:text-[#FAF8F5] p-1 transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
