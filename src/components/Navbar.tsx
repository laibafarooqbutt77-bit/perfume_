import React, { useState, useEffect } from 'react';
import { Search, Heart, ShoppingBag, Menu, X, Lock } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useSiteContent } from '../context/SiteContentContext';
import { FragranceCategory } from '../types/perfume';
import { CmsImage } from './CmsMedia';

interface NavbarProps {
  onSearchClick: () => void;
  onOpenAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearchClick, onOpenAdmin }) => {
  const {
    cartCount,
    wishlist,
    setCartOpen,
    setWishlistOpen,
    setSelectedCategory,
    setSelectedFamily
  } = useShop();
  const { cms } = useSiteContent();

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

  const visibleLinks = cms.navLinks.filter((l) => l.visible);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FAF8F5]/95 backdrop-blur-md shadow-xs border-b border-[#E8E2D9] py-3.5'
          : 'bg-[#FAF8F5] border-b border-[#EFE9DF] py-4 md:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 xl:gap-8">
        {/* Zone 1: Brand wordmark / custom logo */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="group flex items-center gap-3 whitespace-nowrap shrink-0"
        >
          {cms.siteSettings.logoUrl ? (
            <CmsImage
              src={cms.siteSettings.logoUrl}
              alt={cms.siteSettings.siteName}
              className="h-9 w-9 object-contain rounded-xs"
            />
          ) : null}
          <div className="flex flex-col items-start">
            <span className="font-serif-luxury text-2xl md:text-3xl font-medium tracking-[0.2em] text-[#141414] group-hover:text-[#B89626] transition-colors">
              {cms.siteSettings.siteName}
            </span>
            <span className="text-[9px] uppercase tracking-[0.35em] text-[#5E564E] -mt-1 font-sans">
              {cms.siteSettings.siteTagline}
            </span>
          </div>
        </a>

        {/* Zone 2: CMS-managed navigation links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-[13px] tracking-wider uppercase font-medium text-[#4A443E]">
          {visibleLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={() => handleNavClick(link.categoryFilter)}
              className={`hover:text-[#141414] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0 ${
                link.accent ? 'text-[#6E561E]' : ''
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Functional affordances */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search Trigger */}
          <button
            onClick={onSearchClick}
            aria-label="Search Fragrances"
            className="p-2 text-[#4A443E] hover:text-[#141414] hover:bg-[#EFE9DF]/50 rounded-full transition-colors relative cursor-pointer"
          >
            <Search className="w-5 h-5 stroke-[1.75]" />
          </button>

          {/* Wishlist Button with counter */}
          <button
            onClick={() => setWishlistOpen(true)}
            aria-label={`Wishlist contains ${wishlist.length} fragrances`}
            className="p-2 text-[#4A443E] hover:text-[#141414] hover:bg-[#EFE9DF]/50 rounded-full transition-colors relative cursor-pointer"
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
            className="flex items-center gap-2 px-3 py-2 bg-[#141414] text-[#FAF8F5] hover:bg-[#2A2621] rounded-full transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2]" />
            <span className="text-xs font-medium tracking-wider uppercase hidden sm:inline">Bag</span>
            <span className="w-4 h-4 bg-[#D4AF37] text-[#141414] text-[10px] font-bold flex items-center justify-center rounded-full tabular-nums">
              {cartCount}
            </span>
          </button>

          {/* Admin Panel Trigger (Always visible across desktop, tablet, and mobile) */}
          {onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              aria-label="Admin Panel"
              title="Open Private Admin Panel"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full border border-[#D4C7B4] bg-[#FAF8F5] text-[#2D2721] hover:border-[#B89626] hover:bg-[#EFE9DF]/60 hover:text-[#141414] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-[#785E19]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] hidden sm:inline">
                Admin Panel
              </span>
            </button>
          )}

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="lg:hidden p-2 text-[#4A443E] hover:text-[#141414] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-full bg-[#FAF8F5] border-b border-[#E8E2D9] px-6 py-6 shadow-xl animate-fadeIn">
          <nav className="flex flex-col gap-4 text-sm tracking-wider uppercase font-medium text-[#4A443E]">
            {visibleLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => handleNavClick(link.categoryFilter)}
                className={`py-2 border-b border-[#EFE9DF] hover:text-[#B89626] ${
                  link.accent ? 'text-[#6E561E]' : ''
                }`}
              >
                {link.label}
              </a>
            ))}
            {onOpenAdmin && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="py-2 flex items-center gap-2 text-left text-xs uppercase tracking-wider text-[#6E561E] hover:text-[#141414]"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
