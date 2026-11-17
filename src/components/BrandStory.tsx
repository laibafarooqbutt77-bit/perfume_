import React from 'react';
import { IMAGES } from '../data/perfumes';
import { Feather, Droplets, ShieldCheck, Sparkles } from 'lucide-react';

export const BrandStory: React.FC = () => {
  return (
    <section id="brand-atelier" className="py-20 md:py-28 bg-[#FAF8F5] border-b border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Atelier Photograph */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-lg overflow-hidden shadow-2xl border border-[#D4AF37]/30 aspect-[16/10] sm:aspect-[4/3] bg-[#141414]">
              <img
                src={IMAGES.atelier}
                alt="Master Perfumer composing bespoke formulas in Parisian atelier"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center img-zoom"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#E6CA85] font-semibold">
                  Maison d’Or Archives
                </span>
                <p className="font-serif-luxury text-lg italic text-[#F5EFEB] mt-1">
                  “Perfume is silence speaking through time and emotion.”
                </p>
                <p className="text-[11px] text-[#C5B8A5] mt-0.5">
                  Jean-Luc Mercier, Master Nose & Olfactory Architect
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Craftsmanship Prose */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#8C7335] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Haute Parfumerie Heritage</span>
            </div>

            <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl text-[#141414] font-medium leading-[1.15]">
              The Sacred Alchemy of Scent & Memory
            </h2>

            <div className="space-y-4 text-sm md:text-base text-[#5C554E] leading-relaxed font-light">
              <p>
                Founded upon the belief that fragrance is an intimate extension of one’s identity,
                <strong className="text-[#141414] font-medium"> Maison d’Or</strong> bridges the venerated
                perfumery traditions of Grasse and Paris with the rich, resinous treasures of the East.
              </p>
              <p>
                We eschew mass-market shortcuts and diluted bases. Each batch is slowly macerated for three
                lunar cycles in darkened maturation vaults, allowing wild saffron, vintage Cambodian agarwood,
                and delicate Centifolia rose petals to fuse into velvety, crystalline elixirs.
              </p>
              <p>
                When you wear Maison d’Or, you do not simply wear a perfume—you wear an aura that reveals
                distinct notes over eighteen hours of unfolding elegance.
              </p>
            </div>

            {/* 3 Pillars of Distinction */}
            <div className="pt-6 border-t border-[#EAE3D9] grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#EFE9DF] flex items-center justify-center text-[#8C7335]">
                  <Droplets className="w-4 h-4" />
                </div>
                <h4 className="font-serif-luxury text-lg text-[#141414] font-semibold">
                  Pure Extracts
                </h4>
                <p className="text-xs text-[#736B63] font-light leading-relaxed">
                  Up to 32% essential fragrance concentration for unmatched sillage.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#EFE9DF] flex items-center justify-center text-[#8C7335]">
                  <Feather className="w-4 h-4" />
                </div>
                <h4 className="font-serif-luxury text-lg text-[#141414] font-semibold">
                  Hand-Poured
                </h4>
                <p className="text-xs text-[#736B63] font-light leading-relaxed">
                  Numbered bottles sealed with weighted metallic caps and gold collars.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#EFE9DF] flex items-center justify-center text-[#8C7335]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-serif-luxury text-lg text-[#141414] font-semibold">
                  Ethical Harvest
                </h4>
                <p className="text-xs text-[#736B63] font-light leading-relaxed">
                  Cruelty-free, sustainably harvested woods, and fair-trade florals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
