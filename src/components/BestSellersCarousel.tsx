import React, { useState } from 'react';
import { PERFUMES_DATA } from '../data/perfumes';
import { useShop } from '../context/ShopContext';
import { ChevronLeft, ChevronRight, Star, ShoppingBag, Eye, Sparkles } from 'lucide-react';

export const BestSellersCarousel: React.FC = () => {
  const { addToCart, openQuickView, formatPrice } = useShop();
  const bestSellers = PERFUMES_DATA.filter(p => p.isBestSeller);
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex(prev => (prev === 0 ? bestSellers.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex(prev => (prev === bestSellers.length - 1 ? 0 : prev + 1));
  };

  const current = bestSellers[currentIndex];

  if (!current) return null;

  return (
    <section id="best-sellers" className="py-16 md:py-24 bg-[#F2ECE4] border-b border-[#E5DDD2] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Navigation Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#6E561E] font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#785E19]" />
              <span>Crowning Achievements</span>
            </div>
            <h2 className="font-serif-luxury text-3xl md:text-5xl text-[#141414] font-medium tracking-tight">
              Best Sellers & Reserve
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#554E47] font-mono tabular-nums mr-2">
              0{currentIndex + 1} / 0{bestSellers.length}
            </span>
            <button
              onClick={prevSlide}
              aria-label="Previous best seller"
              className="w-10 h-10 rounded-full border border-[#B8AA96] flex items-center justify-center text-[#141414] hover:bg-[#141414] hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next best seller"
              className="w-10 h-10 rounded-full border border-[#B8AA96] flex items-center justify-center text-[#141414] hover:bg-[#141414] hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Featured Spotlight Card */}
        <div className="bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Column: Big Bottle Image */}
          <div className="lg:col-span-7 relative aspect-[4/3] lg:aspect-auto bg-[#141414] overflow-hidden group">
            <img
              src={current.image}
              alt={current.name}
              width={720}
              height={538}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-center img-zoom transition-transform duration-700"
            />
            <div className="absolute top-4 left-4 bg-[#141414] text-[#E8DCC4] text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-xs">
              Maison Top Pick
            </div>
          </div>

          {/* Right Column: Scent Narrative & Quick Actions */}
          <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#5E564E] uppercase tracking-wider">
                <span>{current.subtitle}</span>
                <div className="flex items-center text-[#9A7B2C]">
                  <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#B89626]" />
                  <span className="font-mono tabular-nums font-semibold ml-1 text-[#141414]">
                    {current.rating.toFixed(1)}
                  </span>
                  <span className="text-[#5E564E] ml-1">({current.reviewCount})</span>
                </div>
              </div>

              <h3 className="font-serif-luxury text-3xl md:text-4xl text-[#141414] font-medium leading-tight">
                {current.name}
              </h3>

              <p className="text-sm text-[#4E4741] leading-relaxed font-normal">
                {current.story}
              </p>

              {/* Olfactory pyramid preview */}
              <div className="p-4 bg-[#F2ECE4] rounded-lg border border-[#E2D8CC] space-y-2">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-[#6E561E]">
                  Olfactory Notes
                </div>
                <div className="text-xs text-[#3F3A35] space-y-1">
                  <p><span className="font-medium text-[#141414]">Top:</span> {current.notes.top.join(', ')}</p>
                  <p><span className="font-medium text-[#141414]">Heart:</span> {current.notes.heart.join(', ')}</p>
                  <p><span className="font-medium text-[#141414]">Base:</span> {current.notes.base.join(', ')}</p>
                </div>
              </div>
            </div>

            {/* Price & Actions */}
            <div className="pt-6 border-t border-[#EAE3D9] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-bold text-[#141414] tabular-nums">
                    {formatPrice(current.price)}
                  </span>
                  {current.originalPrice && (
                    <span className="font-mono text-sm text-[#665E56] line-through tabular-nums">
                      {formatPrice(current.originalPrice)}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#5C544D]">100ml Pure Extrait Flacon</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => openQuickView(current)}
                  aria-label="View fragrance specifications"
                  className="p-3 border border-[#B8AA96] hover:bg-[#EFE9DF] text-[#141414] rounded-xs transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => addToCart(current)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#141414] hover:bg-[#785E19] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tasteful Promotional Banner */}
        <div className="mt-12 bg-gradient-to-r from-[#141414] via-[#2A2621] to-[#141414] text-[#FAF8F5] p-6 md:p-8 rounded-lg border border-[#3E3830] flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#E6CA85] font-semibold">
              Seasonal Collector’s Privilege
            </span>
            <h3 className="font-serif-luxury text-xl md:text-2xl text-white">
              Enjoy 15% Off Your First Purchase with Code: <span className="font-mono text-[#E6CA85]">MAISON15</span>
            </h3>
            <p className="text-xs text-[#C7BEB2]">
              Applies automatically at checkout on all orders above ₨ 20,000. Includes complimentary sample vials.
            </p>
          </div>
          <a
            href="#collection-grid"
            className="px-6 py-3 bg-[#FAF8F5] hover:bg-[#D4AF37] text-[#141414] text-xs font-semibold uppercase tracking-wider transition-colors shrink-0"
          >
            Claim Offer
          </a>
        </div>
      </div>
    </section>
  );
};
