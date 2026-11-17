import React from 'react';
import { FRAGRANCE_NOTES_CATEGORIES, PERFUMES_DATA } from '../data/perfumes';
import { useShop } from '../context/ShopContext';
import { Sparkles, Eye, Plus, Check } from 'lucide-react';

export const FragranceDiscovery: React.FC = () => {
  const {
    selectedFamily,
    setSelectedFamily,
    setSelectedCategory,
    openQuickView,
    addToCart,
    formatPrice
  } = useShop();

  const activeFamily = selectedFamily === 'All' ? 'Woody' : selectedFamily;

  const matchingPerfumes = PERFUMES_DATA.filter(
    p => p.fragranceFamily === activeFamily
  ).slice(0, 3);

  const handleSelectNote = (key: string) => {
    setSelectedFamily(key);
  };

  const handleViewAllOfFamily = () => {
    setSelectedFamily(activeFamily);
    setSelectedCategory('all');
    const el = document.getElementById('collection-grid');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="scent-finder" className="py-16 md:py-24 bg-[#141414] text-[#FAF8F5] relative overflow-hidden">
      {/* Subtle warm glow background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#9A7B2C]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Olfactory Finder</span>
          </div>
          <h2 className="font-serif-luxury text-3xl md:text-5xl text-white font-medium">
            Explore by Scent Family
          </h2>
          <p className="text-sm md:text-base text-[#B0A79E] font-light leading-relaxed">
            Select your preferred olfactory family to uncover fragrances tailored to your skin chemistry and aesthetic mood.
          </p>
        </div>

        {/* Note Family Interactive Tabs (clean functional segmented buttons) */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-12">
          {FRAGRANCE_NOTES_CATEGORIES.filter(c => c.key !== 'All').map((cat) => {
            const isSelected = activeFamily === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => handleSelectNote(cat.key)}
                className={`px-4 md:px-5 py-2.5 text-xs uppercase tracking-[0.15em] font-medium transition-all duration-300 border ${
                  isSelected
                    ? 'bg-[#FAF8F5] text-[#141414] border-[#FAF8F5] shadow-md font-semibold'
                    : 'bg-transparent text-[#D4C8B8] border-[#38332C] hover:border-[#D4AF37] hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Note Description Banner */}
        <div className="bg-[#1C1A17] border border-[#2D2821] p-6 rounded-lg mb-10 max-w-3xl mx-auto text-center">
          <h3 className="font-serif-luxury text-2xl text-[#E8DCC4] mb-1 font-medium">
            {activeFamily} Accord
          </h3>
          <p className="text-xs md:text-sm text-[#C2B9AD] font-normal">
            {FRAGRANCE_NOTES_CATEGORIES.find(c => c.key === activeFamily)?.description}
          </p>
        </div>

        {/* Matching Perfumes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {matchingPerfumes.map((perfume) => (
            <div
              key={perfume.id}
              className="bg-[#191714] border border-[#2B2721] rounded-lg overflow-hidden group flex flex-col justify-between hover:border-[#D4AF37]/50 transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-black/40">
                <img
                  src={perfume.image}
                  alt={perfume.name}
                  width={720}
                  height={538}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center img-zoom group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={() => openQuickView(perfume)}
                  className="absolute bottom-3 right-3 p-2 bg-black/75 hover:bg-[#D4AF37] hover:text-[#141414] text-white rounded-full transition-colors backdrop-blur-xs"
                  aria-label={`Quick view ${perfume.name}`}
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#C2B9AD] uppercase tracking-wider mb-1">
                    <span>{perfume.subtitle}</span>
                    <span className="font-mono tabular-nums text-[#E6CA85]">★ {perfume.rating.toFixed(1)}</span>
                  </div>
                  <h4 className="font-serif-luxury text-xl md:text-2xl text-white font-medium">
                    {perfume.name}
                  </h4>
                  <p className="text-xs text-[#C2B9AD] mt-1 line-clamp-2 font-normal">
                    {perfume.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#2B2721] flex items-center justify-between">
                  <span className="font-mono text-sm md:text-base font-semibold text-[#E6CA85] tabular-nums">
                    {formatPrice(perfume.price)}
                  </span>
                  <button
                    onClick={() => addToCart(perfume)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF8F5] hover:bg-[#D4AF37] text-[#141414] text-[11px] font-semibold uppercase tracking-wider transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Bag</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View all of this family CTA */}
        <div className="mt-10 text-center">
          <button
            onClick={handleViewAllOfFamily}
            className="inline-flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] text-[#D4AF37] hover:text-white font-medium underline underline-offset-8 transition-colors"
          >
            <span>View All {activeFamily} Fragrances in Catalog</span>
          </button>
        </div>
      </div>
    </section>
  );
};
