/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { ShopProvider } from './context/ShopContext';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CollectionSection } from './components/CollectionSection';
import { ProductGrid } from './components/ProductGrid';
import { FragranceDiscovery } from './components/FragranceDiscovery';
import { BestSellersCarousel } from './components/BestSellersCarousel';
import { BrandStory } from './components/BrandStory';
import { CustomerReviews } from './components/CustomerReviews';
import { NewsletterSection } from './components/NewsletterSection';
import { Footer } from './components/Footer';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { Toast } from './components/Toast';
import { ChatAssistant } from './components/ChatAssistant';

function BoutiqueStore() {
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
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#141414] font-sans selection:bg-[#E8DCC4] selection:text-[#141414]">
      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Premium Sticky Navigation */}
      <Navbar onSearchClick={handleSearchFocus} />

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

        {/* G. Customer Testimonials Across Pakistan */}
        <CustomerReviews />

        {/* H. Privileged Newsletter Invitation */}
        <NewsletterSection />
      </main>

      {/* 4. Luxury Footer */}
      <Footer />

      {/* 5. Modals and Slide-Over Drawers */}
      <ProductDetailsModal />
      <CartDrawer />
      <WishlistDrawer />
      <CheckoutModal />
      <Toast />
      <ChatAssistant />
    </div>
  );
}

export default function App() {
  return (
    <ShopProvider>
      <BoutiqueStore />
    </ShopProvider>
  );
}
