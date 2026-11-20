import React from 'react';
import { Feather, Droplets, ShieldCheck, Sparkles } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';
import { CmsImage } from './CmsMedia';

export const BrandStory: React.FC = () => {
  const { cms } = useSiteContent();
  const { atelier } = cms;

  if (!atelier.visible) return null;

  const renderIcon = (icon: 'droplets' | 'feather' | 'shield') => {
    if (icon === 'feather') return <Feather className="w-4 h-4" />;
    if (icon === 'shield') return <ShieldCheck className="w-4 h-4" />;
    return <Droplets className="w-4 h-4" />;
  };

  return (
    <section
      id="brand-atelier"
      className="py-20 md:py-28 border-b border-[#E8E2D9]"
      style={{ backgroundColor: 'var(--cms-bg, #FAF8F5)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-lg overflow-hidden shadow-2xl border border-[#D4AF37]/30 aspect-[16/10] sm:aspect-[4/3] bg-[#141414]">
              <CmsImage
                src={atelier.image}
                fallbackSrc="/images/atelier.webp"
                alt="Master Perfumer composing bespoke formulas in Parisian atelier"
                width={1200}
                height={670}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center img-zoom"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#E6CA85] font-semibold">
                  {atelier.archiveLabel}
                </span>
                <p className="font-serif-luxury text-lg italic text-[#F5EFEB] mt-1">
                  {atelier.quote}
                </p>
                <p className="text-[11px] text-[#D4C8B8] mt-0.5">
                  {atelier.quoteAuthor}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#6E561E] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#785E19]" />
              <span>{atelier.kicker}</span>
            </div>

            <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl text-[#141414] font-medium leading-[1.15]">
              {atelier.title}
            </h2>

            <div className="space-y-4 text-sm md:text-base text-[#4E4741] leading-relaxed font-normal">
              {atelier.paragraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            <div className="pt-6 border-t border-[#EAE3D9] grid grid-cols-1 sm:grid-cols-3 gap-6">
              {atelier.pillars.map((pillar) => (
                <div key={pillar.id} className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-[#EFE9DF] flex items-center justify-center text-[#6E561E]">
                    {renderIcon(pillar.icon)}
                  </div>
                  <h3 className="font-serif-luxury text-lg text-[#141414] font-semibold">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-[#554E47] font-normal leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
