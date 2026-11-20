import React from 'react';
import { Star, CheckCircle, Quote, Sparkles } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';

export const CustomerReviews: React.FC = () => {
  const { cms } = useSiteContent();
  const header = cms.sectionHeaders.reviews;

  if (!header.visible) return null;

  return (
    <section
      className="py-20 md:py-28 border-b border-[#E8E2D9]"
      style={{ backgroundColor: 'var(--cms-bg, #FAF8F5)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-[#6E561E] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#785E19]" />
            <span>{header.kicker}</span>
          </div>
          <h2 className="font-serif-luxury text-3xl md:text-5xl text-[#141414] font-medium tracking-tight">
            {header.title}
          </h2>
          <p className="text-sm md:text-base text-[#554E47] font-normal">
            {header.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {cms.reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#FFFFFF] border border-[#EAE3D9] p-6 rounded-lg shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow relative"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-[#9A7B2C]">
                  {[...Array(Math.max(1, Math.min(5, rev.rating)))].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D4AF37] text-[#B89626]" />
                  ))}
                </div>

                <div className="text-xs uppercase tracking-wider text-[#6E561E] font-medium">
                  Verified Scent: {rev.perfumeName}
                </div>

                <h3 className="font-serif-luxury text-lg text-[#141414] font-semibold leading-snug">
                  “{rev.title}”
                </h3>

                <p className="text-xs text-[#4E4741] leading-relaxed font-normal">
                  {rev.comment}
                </p>
              </div>

              <div className="pt-4 border-t border-[#F2ECE4] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-[#141414]">{rev.author}</span>
                    <CheckCircle className="w-3.5 h-3.5 text-[#2E7D32]" />
                  </div>
                  <span className="text-[11px] text-[#5E564E]">{rev.city}</span>
                </div>
                <Quote className="w-5 h-5 text-[#D8CFC3]" />
              </div>
            </div>
          ))}
        </div>

        {header.disclaimer && (
          <p className="text-center text-[11px] text-[#5E564E] mt-10">{header.disclaimer}</p>
        )}
      </div>
    </section>
  );
};
