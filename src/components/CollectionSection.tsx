import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useSiteContent } from '../context/SiteContentContext';
import { FragranceCategory } from '../types/perfume';
import { CmsImage } from './CmsMedia';

export const CollectionSection: React.FC = () => {
  const { setSelectedCategory, setSelectedFamily } = useShop();
  const { cms } = useSiteContent();

  const header = cms.sectionHeaders.collections;
  if (!header.visible) return null;

  const handleSelectCollection = (categoryId: FragranceCategory) => {
    setSelectedCategory(categoryId);
    setSelectedFamily('All');
    const el = document.getElementById('collection-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 md:py-24 bg-[#F5EFEB]/50 border-b border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[#6E561E] font-semibold mb-2">
              {header.kicker}
            </div>
            <h2 className="font-serif-luxury text-3xl md:text-4xl text-[#141414] font-medium tracking-tight">
              {header.title}
            </h2>
          </div>
          <p className="text-sm text-[#554E47] max-w-md font-normal">
            {header.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {cms.collections.map((col) => (
            <div
              key={col.id}
              onClick={() => handleSelectCollection(col.id)}
              className="group cursor-pointer relative overflow-hidden rounded-lg bg-[#141414] aspect-[4/3] flex flex-col justify-end p-6 md:p-7 transition-all duration-300 shadow-sm hover:shadow-xl border border-[#E0D7CC]"
            >
              <CmsImage
                src={col.image}
                alt={col.name}
                width={720}
                height={538}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover object-center img-zoom group-hover:scale-105 transition-transform duration-700 brightness-95 group-hover:brightness-90"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent transition-opacity group-hover:via-black/55" />

              <div className="relative z-10 space-y-1.5">
                <div className="flex items-center justify-between text-[#E6CA85]">
                  <span className="text-[11px] uppercase tracking-[0.2em] font-semibold">
                    {col.itemCount} Fragrances
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-[#D4AF37] group-hover:text-[#141414] transition-all">
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>

                <h3 className="font-serif-luxury text-2xl md:text-3xl text-white font-medium tracking-wide">
                  {col.name}
                </h3>

                <p className="text-xs text-[#E8DCC4] font-light leading-relaxed line-clamp-2">
                  {col.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
