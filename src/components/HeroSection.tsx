import React from 'react';
import { ArrowRight, Compass, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useSiteContent } from '../context/SiteContentContext';
import { CmsImage } from './CmsMedia';

export const HeroSection: React.FC = () => {
  const { setSelectedCategory, setSelectedFamily } = useShop();
  const { cms } = useSiteContent();
  const { hero } = cms;

  const handleCtaScroll = (href: string, resetFilters: boolean) => {
    if (resetFilters) {
      setSelectedCategory('all');
      setSelectedFamily('All');
    }
    if (href.startsWith('#')) {
      const el = document.getElementById(href.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (href) {
      window.location.href = href;
    }
  };

  return (
    <section
      id="hero"
      className="relative overflow-hidden border-b border-[#EAE3D9]"
      style={{ backgroundColor: 'var(--cms-bg, #FAF8F5)' }}
    >
      {/* Subtle luxury ambient pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#141414_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 md:space-y-8">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#6E561E] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#785E19]" />
              <span>{hero.kicker}</span>
              {hero.locationLabel && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{hero.locationLabel}</span>
                </>
              )}
            </div>

            <div className="space-y-4">
              <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#141414] leading-[1.08] [text-wrap:balance]">
                {hero.headlinePrefix} <br />
                <span
                  className="italic font-normal"
                  style={{ color: 'var(--cms-accent, #785E19)' }}
                >
                  {hero.headlineAccent}
                </span>
              </h1>
              {hero.quote && (
                <p className="text-lg md:text-xl text-[#4E4741] font-serif italic max-w-lg">
                  {hero.quote}
                </p>
              )}
            </div>

            <p className="text-sm md:text-base text-[#554E47] leading-relaxed max-w-xl font-normal">
              {hero.description}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={() => handleCtaScroll(hero.primaryCtaHref || '#collection-grid', true)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#141414] hover:bg-[#2A2621] text-[#FAF8F5] text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300 shadow-md group"
              >
                <span>{hero.primaryCtaLabel}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleCtaScroll(hero.secondaryCtaHref || '#best-sellers', false)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent hover:bg-[#EFE9DF]/60 text-[#141414] border border-[#B8AA96] text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300"
              >
                <Compass className="w-4 h-4 text-[#6E561E]" />
                <span>{hero.secondaryCtaLabel}</span>
              </button>
            </div>

            {/* Trust Markers */}
            {hero.metrics.length > 0 && (
              <div className="pt-6 border-t border-[#EAE3D9] grid grid-cols-3 gap-4 text-left">
                {hero.metrics.map((metric) => (
                  <div key={metric.id}>
                    <p className="font-serif-luxury text-xl md:text-2xl font-semibold text-[#141414] tabular-nums">
                      {metric.value}
                    </p>
                    <p className="text-[11px] uppercase tracking-wider text-[#5C544D] mt-0.5">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Large Realistic Perfume Bottle Photograph */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none group">
              <div className="absolute -inset-3 bg-gradient-to-tr from-[#E6CA85]/20 via-[#FAF8F5] to-transparent rounded-2xl -z-10 blur-xl" />

              <div className="relative overflow-hidden rounded-lg bg-[#141414] shadow-2xl border border-[#D4AF37]/30 aspect-[16/10] sm:aspect-[16/11] lg:aspect-[4/3]">
                <CmsImage
                  src={hero.heroImage}
                  fallbackSrc="/images/hero.webp"
                  alt={hero.featuredTitle || "Maison d'Or Signature Flacon"}
                  width={1200}
                  height={670}
                  fetchPriority="high"
                  loading="eager"
                  decoding="sync"
                  className="w-full h-full object-cover object-center img-zoom"
                />

                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#E6CA85] font-semibold">
                      {hero.featuredLabel}
                    </span>
                    <p className="font-serif-luxury text-xl md:text-2xl text-white font-medium">
                      {hero.featuredTitle}
                    </p>
                    <p className="text-xs text-[#E8E2D9] mt-0.5">
                      {hero.featuredNotes}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] uppercase tracking-wider text-[#D4C8B8] block">Price</span>
                    <span className="text-sm font-semibold text-[#E6CA85] font-mono tabular-nums">
                      {hero.featuredPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
