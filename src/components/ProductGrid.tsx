import React from 'react';
import { useShop } from '../context/ShopContext';
import { useSiteContent } from '../context/SiteContentContext';
import { ProductCard } from './ProductCard';
import { Search, SlidersHorizontal, RefreshCw, Sparkles } from 'lucide-react';
import { FragranceCategory } from '../types/perfume';

export const ProductGrid: React.FC = () => {
  const {
    filteredProducts,
    selectedCategory,
    setSelectedCategory,
    selectedFamily,
    setSelectedFamily,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy
  } = useShop();
  const { cms } = useSiteContent();

  const header = cms.sectionHeaders.catalog;
  if (!header.visible) return null;

  const categories: { id: FragranceCategory; label: string }[] = [
    { id: 'all', label: 'All Fragrances' },
    { id: 'men', label: 'Men’s' },
    { id: 'women', label: 'Women’s' },
    { id: 'unisex', label: 'Unisex' },
    { id: 'oud', label: 'Luxury Oud' },
    { id: 'floral', label: 'Fresh & Floral' },
    { id: 'signature', label: 'Signature' }
  ];

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedFamily('All');
    setSearchQuery('');
    setSortBy('popular');
  };

  return (
    <section
      id="collection-grid"
      className="py-16 md:py-24"
      style={{ backgroundColor: 'var(--cms-bg, #FAF8F5)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
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

        {/* Search & Filter Bar */}
        <div className="bg-[#FFFFFF] border border-[#E8E2D9] p-4 md:p-6 rounded-lg mb-10 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <label htmlFor="catalog-search" className="sr-only">
                Search fragrances by name or notes
              </label>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5E564E]" />
              <input
                id="catalog-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by scent name, notes (e.g. saffron, rose, oud)..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#D8CFC3] rounded-xs text-xs md:text-sm text-[#141414] placeholder-[#655D55] focus:outline-hidden focus:border-[#785E19] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5E564E] hover:text-[#141414]"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label
                htmlFor="sort-perfumes"
                className="flex items-center gap-2 text-xs text-[#554E47] uppercase tracking-wider font-medium shrink-0 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Sort By:</span>
              </label>
              <select
                id="sort-perfumes"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as 'popular' | 'price-low' | 'price-high' | 'rating' | 'newest'
                  )
                }
                className="bg-[#FAF8F5] border border-[#D8CFC3] px-3 py-2.5 rounded-xs text-xs md:text-sm text-[#141414] focus:outline-hidden focus:border-[#785E19] cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">New Arrivals</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-[#F0EBE3] flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 text-xs uppercase tracking-wider font-medium rounded-xs transition-all ${
                    isSelected
                      ? 'bg-[#141414] text-[#FAF8F5] shadow-xs'
                      : 'bg-[#FAF8F5] text-[#4E4741] hover:bg-[#EFE9DF] hover:text-[#141414]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between mb-8 text-xs text-[#554E47]">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#141414] tabular-nums font-mono">
              {filteredProducts.length}
            </span>
            <span>Fragrances Available</span>
            {(selectedCategory !== 'all' || selectedFamily !== 'All' || searchQuery !== '') && (
              <button
                onClick={handleResetFilters}
                className="ml-3 inline-flex items-center gap-1 text-[#6E561E] hover:underline cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset all filters</span>
              </button>
            )}
          </div>
          <span className="text-[11px] uppercase tracking-wider text-[#5E564E] hidden sm:inline">
            Prices in PKR (₨) · Authentic Ingredients
          </span>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-[#E8E2D9] rounded-lg p-8 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#6E561E]">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-2xl text-[#141414]">No Fragrances Found</h3>
            <p className="text-sm text-[#5C544D] max-w-md mx-auto">
              We couldn’t find any scent matching “{searchQuery}” in this selection. Try adjusting your search keywords or clearing your filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 bg-[#141414] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider hover:bg-[#785E19] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
