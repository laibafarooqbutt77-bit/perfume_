/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { SiteContentProvider } from './context/SiteContentContext';
import { ShopProvider, useShop } from './context/ShopContext';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CollectionSection } from './components/CollectionSection';
import { ProductGrid } from './components/ProductGrid';
import { FragranceDiscovery } from './components/FragranceDiscovery';
import { BestSellersCarousel } from './components/BestSellersCarousel';
import { BrandStory } from './components/BrandStory';
import { CustomSectionsRenderer } from './components/CustomSectionsRenderer';
import { CustomerReviews } from './components/CustomerReviews';
import { NewsletterSection } from './components/NewsletterSection';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';

const loadChatAssistant = () =>
  import('./components/ChatAssistant').then((m) => ({ default: m.ChatAssistant }));

const LazyProductDetailsModal = lazy(() =>
  import('./components/ProductDetailsModal').then((m) => ({ default: m.ProductDetailsModal }))
);
const LazyCartDrawer = lazy(() =>
  import('./components/CartDrawer').then((m) => ({ default: m.CartDrawer }))
);
const LazyWishlistDrawer = lazy(() =>
  import('./components/WishlistDrawer').then((m) => ({ default: m.WishlistDrawer }))
);
const LazyCheckoutModal = lazy(() =>
  import('./components/CheckoutModal').then((m) => ({ default: m.CheckoutModal }))
);
const LazyChatAssistant = lazy(loadChatAssistant);
const LazyAdminPortal = lazy(() =>
  import('./components/admin/AdminPortal').then((m) => ({ default: m.AdminPortal }))
);

function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

function BoutiqueStore({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  const { cartOpen, wishlistOpen, checkoutOpen, quickViewProduct, cartCount } = useShop();
  const [chatMounted, setChatMounted] = useState(false);

  const handleSearchFocus = () => {
    const el = document.getElementById('collection-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const searchInput = el.querySelector('input');
        if (searchInput) searchInput.focus();
      }, 400);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col font-sans selection:bg-[#E8DCC4] selection:text-[#141414]"
      style={{
        backgroundColor: 'var(--cms-bg, #FAF8F5)',
        color: 'var(--cms-text, #141414)'
      }}
    >
      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Premium Sticky Navigation */}
      <Navbar onSearchClick={handleSearchFocus} onOpenAdmin={onOpenAdmin} />

      {/* 3. Main Boutique Content Flow */}
      <main className="flex-1">
        {/* A. Cinematic Hero */}
        <HeroSection />

        {/* B. Shop by Curated Collection */}
        <CollectionSection />

        {/* C. The Complete Fragrance Grid with Filters & Search */}
        <ProductGrid />

        {/* D. Interactive Olfactory Finder (Scent Family & Moods) */}
        <FragranceDiscovery />

        {/* E. Best Sellers Spotlight & Reserve Privileges */}
        <BestSellersCarousel />

        {/* F. Brand Atelier Craftsmanship Story */}
        <BrandStory />

        {/* G. Dynamic Custom Sections authored in Admin CMS */}
        <CustomSectionsRenderer />

        {/* H. Customer Testimonials Across Pakistan */}
        <CustomerReviews />

        {/* I. Privileged Newsletter Invitation */}
        <NewsletterSection />
      </main>

      {/* 4. Luxury Footer */}
      <Footer onOpenAdmin={onOpenAdmin} />

      {/* 5. Lazy-loaded Modals, Drawers & AI Concierge */}
      <Suspense fallback={null}>
        {quickViewProduct && <LazyProductDetailsModal />}
        {cartOpen && <LazyCartDrawer />}
        {wishlistOpen && <LazyWishlistDrawer />}
        {checkoutOpen && <LazyCheckoutModal />}
        {chatMounted && <LazyChatAssistant initialOpen={true} />}
      </Suspense>

      {!chatMounted && (
        <button
          onClick={() => setChatMounted(true)}
          onMouseEnter={() => {
            void loadChatAssistant();
          }}
          onFocus={() => {
            void loadChatAssistant();
          }}
          aria-label="Open Maison d'Or AI Fragrance Concierge"
          className="fixed bottom-5 right-5 z-40 group flex items-center gap-3 px-4 py-3.5 sm:px-5 sm:py-3.5 rounded-full bg-[#141414] text-[#FAF8F5] shadow-2xl border border-[#D4AF37]/50 hover:border-[#D4AF37] hover:bg-[#1E1B17] transition-all cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] block leading-none text-[#FAF8F5]">
              Fragrance Concierge
            </span>
            <span className="text-[10px] text-[#C5B8A5] block mt-0.5 leading-none">
              Shop, Compare &amp; Order
            </span>
          </div>
          {cartCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#141414] text-[10px] font-bold flex items-center justify-center font-mono tabular-nums">
              {cartCount}
            </span>
          )}
        </button>
      )}

      <Toast />
    </div>
  );
}

function AppRouter() {
  const [adminRoute, setAdminRoute] = useState<boolean>(() =>
    typeof window !== 'undefined' ? isAdminPath(window.location.pathname) : false
  );

  useEffect(() => {
    const onPopState = () => {
      setAdminRoute(isAdminPath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateToAdmin = useCallback(() => {
    if (window.location.pathname !== '/admin') {
      window.history.pushState({}, '', '/admin');
    }
    setAdminRoute(true);
    window.scrollTo({ top: 0 });
  }, []);

  const navigateToStore = useCallback(() => {
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    setAdminRoute(false);
    window.scrollTo({ top: 0 });
  }, []);

  if (adminRoute) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#12110F] text-[#E6CA85] flex items-center justify-center text-xs uppercase tracking-[0.2em]">
            Loading Private Admin Portal...
          </div>
        }
      >
        <LazyAdminPortal onExitToStore={navigateToStore} />
      </Suspense>
    );
  }

  return <BoutiqueStore onOpenAdmin={navigateToAdmin} />;
}

export default function App() {
  return (
    <SiteContentProvider>
      <ShopProvider>
        <AppRouter />
      </ShopProvider>
    </SiteContentProvider>
  );
}
