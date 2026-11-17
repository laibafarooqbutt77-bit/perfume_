import React, { useState, useEffect } from 'react';
import { Search, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { FragranceCategory } from '../types/perfume';

interface NavbarProps {
  onSearchClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearchClick }) => {
  const {
    cartCount,
    wishlist,
    setCartOpen,
    setWishlistOpen,
    setSelectedCategory,
    setSelectedFamily
  } = useShop();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (category?: FragranceCategory) => {
    if (category) {
      setSelectedCategory(category);
      setSelectedFamily('All');
    }
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FAF8F5]/95 backdrop-blur-md shadow-xs border-b border-[#E8E2D9] py-3.5'
          : 'bg-[#FAF8F5] border-b border-[#EFE9DF] py-4 md:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single text element) */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="group flex flex-col items-start whitespace-nowrap shrink-0"
        >
          <span className="font-serif-luxury text-2xl md:text-3xl font-medium tracking-[0.2em] text-[#141414] group-hover:text-[#B89626] transition-colors">
            MAISON D’OR
          </span>
          <span className="text-[9px] uppercase tracking-[0.35em] text-[#5E564E] -mt-1 font-sans">
            Haute Parfumerie · Paris
          </span>
        </a>

        {/* Zone 2: 4-5 single-line clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-[13px] tracking-wider uppercase font-medium text-[#4A443E]">
          <a
            href="#hero"
            onClick={() => handleNavClick('all')}
            className="hover:text-[#141414] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
          >
            Home
          </a>
          <a
            href="#collection-grid"
            onClick={() => handleNavClick('all')}
            className="hover:text-[#141414] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
          >
            Shop All
          </a>
          <a
            href="#collection-grid"
            onClick={() => handleNavClick('men')}
            className="hover:text-[#141414] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
          >
            Men’s
          </a>
          <a
            href="#collection-grid"
            onClick={() => handleNavClick('women')}
            className="hover:text-[#141414] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
          >
            Women’s
          </a>
          <a
            href="#collection-grid"
            onClick={() => handleNavClick('oud')}
            className="hover:text-[#141414] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
          >
            Luxury Oud
          </a>
          <a
            href="#scent-finder"
            className="hover:text-[#141414] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0 text-[#6E561E]"
          >
            Scent Finder
          </a>
          <a
            href="#brand-atelier"
            className="hover:text-[#141414] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
          >
            Our Atelier
          </a>
        </nav>

        {/* Zone 3: Functional affordances */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Search Trigger */}
          <button
            onClick={onSearchClick}
            aria-label="Search Fragrances"
            className="p-2 text-[#4A443E] hover:text-[#141414] hover:bg-[#EFE9DF]/50 rounded-full transition-colors relative"
          >
            <Search className="w-5 h-5 stroke-[1.75]" />
          </button>

          {/* Wishlist Button with counter */}
          <button
            onClick={() => setWishlistOpen(true)}
            aria-label={`Wishlist contains ${wishlist.length} fragrances`}
            className="p-2 text-[#4A443E] hover:text-[#141414] hover:bg-[#EFE9DF]/50 rounded-full transition-colors relative"
          >
            <Heart className="w-5 h-5 stroke-[1.75]" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#D4AF37] text-[#141414] text-[10px] font-bold flex items-center justify-center rounded-full tabular-nums">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Shopping Cart Button with counter */}
          <button
            onClick={() => setCartOpen(true)}
            aria-label={`Shopping Bag contains ${cartCount} items`}
            className="flex items-center gap-2 px-3 py-2 bg-[#141414] text-[#FAF8F5] hover:bg-[#2A2621] rounded-full transition-colors"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2]" />
            <span className="text-xs font-medium tracking-wider uppercase hidden sm:inline">Bag</span>
            <span className="w-4 h-4 bg-[#D4AF37] text-[#141414] text-[10px] font-bold flex items-center justify-center rounded-full tabular-nums">
              {cartCount}
            </span>
          </button>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="lg:hidden p-2 text-[#4A443E] hover:text-[#141414] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-full bg-[#FAF8F5] border-b border-[#E8E2D9] px-6 py-6 shadow-xl animate-fadeIn">
          <nav className="flex flex-col gap-4 text-sm tracking-wider uppercase font-medium text-[#4A443E]">
            <a
              href="#hero"
              onClick={() => handleNavClick('all')}
              className="py-2 border-b border-[#EFE9DF] hover:text-[#B89626]"
            >
              Home
            </a>
            <a
              href="#collection-grid"
              onClick={() => handleNavClick('all')}
              className="py-2 border-b border-[#EFE9DF] hover:text-[#B89626]"
            >
              All Fragrances
            </a>
            <a
              href="#collection-grid"
              onClick={() => handleNavClick('men')}
              className="py-2 border-b border-[#EFE9DF] hover:text-[#B89626]"
            >
              Men’s Fragrances
            </a>
            <a
              href="#collection-grid"
              onClick={() => handleNavClick('women')}
              className="py-2 border-b border-[#EFE9DF] hover:text-[#B89626]"
            >
              Women’s Fragrances
            </a>
            <a
              href="#collection-grid"
              onClick={() => handleNavClick('oud')}
              className="py-2 border-b border-[#EFE9DF] hover:text-[#B89626]"
            >
              Luxury Oud Collection
            </a>
            <a
              href="#scent-finder"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#EFE9DF] hover:text-[#6E561E] text-[#6E561E]"
            >
              Interactive Scent Finder
            </a>
            <a
              href="#brand-atelier"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-[#B89626]"
            >
              The Atelier Story
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};
