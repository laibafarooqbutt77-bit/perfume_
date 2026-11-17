import React from 'react';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, Shield } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Footer: React.FC = () => {
  const { setSelectedCategory, setSelectedFamily } = useShop();

  const handleCategoryClick = (cat: any) => {
    setSelectedCategory(cat);
    setSelectedFamily('All');
    const el = document.getElementById('collection-grid');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0F0E0D] text-[#FAF8F5] pt-16 pb-12 border-t border-[#26221D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Col 1 & 2: Brand Lockup & Description */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col items-start">
              <span className="font-serif-luxury text-2xl tracking-[0.2em] font-medium text-white">
                MAISON D’OR
              </span>
              <span className="text-[9px] uppercase tracking-[0.35em] text-[#A69786] -mt-1 font-sans">
                Haute Parfumerie · Paris & Lahore
              </span>
            </div>

            <p className="text-xs md:text-sm text-[#A89E92] leading-relaxed max-w-sm font-light">
              Purveyors of bespoke artisanal fragrances, handcrafted extraits, and vintage agarwood flacons.
              Engineered with supreme concentration to offer lasting presence and intimate sophistication.
            </p>

            <div className="pt-2 flex items-center gap-3 text-[#A89E92]">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full border border-[#2B2721] flex items-center justify-center hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full border border-[#2B2721] flex items-center justify-center hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="w-8 h-8 rounded-full border border-[#2B2721] flex items-center justify-center hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 3: Collections */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#E6CA85] font-semibold">
              Collections
            </h3>
            <ul className="space-y-2 text-xs text-[#A89E92]">
              <li>
                <button
                  onClick={() => handleCategoryClick('men')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Men’s Fragrances
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('women')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Women’s Fragrances
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('unisex')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Unisex Collection
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('oud')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Luxury Pure Oud
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('floral')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Fresh & Floral Reserve
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('signature')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Master Perfumer Signature
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Concierge & Policies */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#E6CA85] font-semibold">
              Client Concierge
            </h3>
            <ul className="space-y-2 text-xs text-[#A89E92]">
              <li>
                <a href="#scent-finder" className="hover:text-white transition-colors">
                  Fragrance Discovery Guide
                </a>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  Complimentary Gift Packaging
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  Cash on Delivery (COD) Nationwide
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  Authenticity Verification Guarantee
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  Returns & Exchange Policy (7 Days)
                </span>
              </li>
            </ul>
          </div>

          {/* Col 5: Boutique Contact */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#E6CA85] font-semibold">
              Boutique Inquiries
            </h3>
            <div className="space-y-2 text-xs text-[#A89E92]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>Gulberg III, M.M. Alam Road, Lahore, Pakistan</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>+92 (042) 3571-0899</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>concierge@maisondorparfum.pk</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#B8AFA5] pt-2">
                <Shield className="w-3.5 h-3.5 text-[#66BB6A]" />
                <span>100% Genuine Ingredients Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#211E1A] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#B8AFA5] gap-4">
          <p>© {new Date().getFullYear()} Maison d’Or Parfumerie. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-default">Privacy Policy</span>
            <span className="hover:text-white cursor-default">Terms of Haute Parfumerie</span>
            <span className="hover:text-white cursor-default">Security & Authenticity</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
