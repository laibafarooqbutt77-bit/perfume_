import React from 'react';
import { ArrowRight, Compass, Sparkles } from 'lucide-react';
import { IMAGES } from '../data/perfumes';
import { useShop } from '../context/ShopContext';

export const HeroSection: React.FC = () => {
  const { setSelectedCategory, setSelectedFamily } = useShop();

  const handleExplore = () => {
    setSelectedCategory('all');
    setSelectedFamily('All');
    const el = document.getElementById('collection-grid');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBestSellers = () => {
    const el = document.getElementById('best-sellers');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative bg-[#FAF8F5] overflow-hidden border-b border-[#EAE3D9]">
      {/* Subtle luxury ambient pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#141414_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 md:space-y-8">
            {/* Zero-Pill Unboxed Clean Kicker */}
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#8C7335] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Haute Parfumerie & Botanical Art</span>
              <span aria-hidden="true">·</span>
              <span>Paris & Lahore</span>
            </div>

            {/* Display Headline with text-wrap: balance */}
            <div className="space-y-4">
              <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#141414] leading-[1.08] [text-wrap:balance]">
                Discover Your <br />
                <span className="italic font-normal text-[#9A7B2C]">Signature Scent</span>
              </h1>
              <p className="text-lg md:text-xl text-[#5C554E] font-serif italic max-w-lg">
                “An unforgettable fragrance. A lasting impression.”
              </p>
            </div>

            <p className="text-sm md:text-base text-[#6B635B] leading-relaxed max-w-xl font-normal">
              Immerse yourself in artisanal extraits de parfum, where sustainably sourced Cambodian agarwood,
              Grasse Damask roses, and warm golden resins are hand-blended into flacons of liquid elegance.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={handleExplore}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#141414] hover:bg-[#2A2621] text-[#FAF8F5] text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300 shadow-md group"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={handleBestSellers}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent hover:bg-[#EFE9DF]/60 text-[#141414] border border-[#C5B8A5] text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300"
              >
                <Compass className="w-4 h-4 text-[#8C7335]" />
                <span>Shop Best Sellers</span>
              </button>
            </div>

            {/* Trust Markers: Clean unboxed metadata */}
            <div className="pt-6 border-t border-[#EAE3D9] grid grid-cols-3 gap-4 text-left">
              <div>
                <p className="font-serif-luxury text-xl md:text-2xl font-semibold text-[#141414] tabular-nums">
                  30%
                </p>
                <p className="text-[11px] uppercase tracking-wider text-[#736B63] mt-0.5">
                  Extrait Concentration
                </p>
              </div>
              <div>
                <p className="font-serif-luxury text-xl md:text-2xl font-semibold text-[#141414] tabular-nums">
                  14+ Hrs
                </p>
                <p className="text-[11px] uppercase tracking-wider text-[#736B63] mt-0.5">
                  Lasting Sillage
                </p>
              </div>
              <div>
                <p className="font-serif-luxury text-xl md:text-2xl font-semibold text-[#141414] tabular-nums">
                  ₨ 0
                </p>
                <p className="text-[11px] uppercase tracking-wider text-[#736B63] mt-0.5">
                  Delivery over ₨ 15k
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Large Realistic Perfume Bottle Photograph */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none group">
              {/* Subtle back decorative frame */}
              <div className="absolute -inset-3 bg-gradient-to-tr from-[#E6CA85]/20 via-[#FAF8F5] to-transparent rounded-2xl -z-10 blur-xl" />

              <div className="relative overflow-hidden rounded-lg bg-[#141414] shadow-2xl border border-[#D4AF37]/30 aspect-[16/10] sm:aspect-[16/11] lg:aspect-[4/3]">
                <img
                  src={IMAGES.hero}
                  alt="Maison d'Or Aurélia Signature Flacon on Dark Emperador Marble"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center img-zoom"
                />

                {/* Subtle scrim overlay with product label */}
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#E6CA85] font-semibold">
                      Featured Reserve
                    </span>
                    <h3 className="font-serif-luxury text-xl md:text-2xl text-white font-medium">
                      Aurélia Grand Cru
                    </h3>
                    <p className="text-xs text-white/75 mt-0.5">
                      Warm Amber · Saffron · Cambodian Oud
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] uppercase tracking-wider text-white/60 block">Price</span>
                    <span className="text-sm font-semibold text-[#E6CA85] font-mono tabular-nums">
                      ₨ 28,500
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
