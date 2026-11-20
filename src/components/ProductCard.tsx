import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag, Star, Check } from 'lucide-react';
import { PerfumeProduct } from '../types/perfume';
import { useShop } from '../context/ShopContext';
import { CmsImage } from './CmsMedia';

interface ProductCardProps {
  product: PerfumeProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isWishlisted, openQuickView, formatPrice } = useShop();
  const [imageError, setImageError] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const isSaved = isWishlisted(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={() => openQuickView(product)}
      className="group cursor-pointer bg-[#FFFFFF] border border-[#EBE4DA] rounded-lg overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative"
    >
      {/* Product Image Section */}
      <div className="relative aspect-[4/3] sm:aspect-square bg-[#F7F4EF] overflow-hidden">
        {!imageError ? (
          <CmsImage
            src={product.image}
            alt={product.name}
            width={720}
            height={538}
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center img-zoom group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#EDE7DF] text-[#5E564E]">
            <span className="font-serif-luxury text-xl">{product.name}</span>
            <span className="text-xs uppercase tracking-wider mt-1">{product.subtitle}</span>
          </div>
        )}

        {/* Top Badges: Discrete unboxed discount or bestseller tag */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="bg-[#141414] text-[#E8DCC4] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-xs">
              Save ₨ {(product.originalPrice - product.price).toLocaleString('en-PK')}
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-[#785E19] text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-xs">
              New Arrival
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label={isSaved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/95 hover:bg-white text-[#141414] shadow-sm backdrop-blur-xs transition-colors z-10"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isSaved ? 'fill-[#C0392B] text-[#C0392B]' : 'text-[#4A443E] hover:text-[#C0392B]'
            }`}
          />
        </button>

        {/* Quick View Overlay Button */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openQuickView(product);
            }}
            className="w-full py-2 bg-[#FAF8F5]/95 hover:bg-[#FAF8F5] text-[#141414] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Card Content & Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Metadata clean unboxed */}
          <div className="flex items-center justify-between text-xs text-[#5E564E] uppercase tracking-wider mb-1">
            <span>{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{product.subtitle}</span>
          </div>

          <h3 className="font-serif-luxury text-xl text-[#141414] font-medium group-hover:text-[#785E19] transition-colors leading-snug">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mt-1.5 text-xs text-[#554E47]">
            <div className="flex items-center text-[#9A7B2C]">
              <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#B89626]" />
              <span className="font-mono tabular-nums font-semibold ml-1 text-[#141414]">
                {product.rating.toFixed(1)}
              </span>
            </div>
            <span aria-hidden="true" className="text-[#9E958A]">·</span>
            <span className="text-[#5E564E] font-normal">({product.reviewCount} reviews)</span>
          </div>
        </div>

        {/* Fragrance Note Preview */}
        <p className="text-xs text-[#5C544D] line-clamp-1 italic font-normal">
          Notes: {product.notes.top.slice(0, 2).join(', ')}, {product.notes.heart[0]}
        </p>

        {/* Pricing and Add to Bag */}
        <div className="pt-3 border-t border-[#F0EAE1] flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-base font-semibold text-[#141414] tabular-nums">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="font-mono text-xs text-[#665E56] line-through tabular-nums">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#5E564E]">100ml / Flacon</span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 shrink-0 ${
              addedAnimation
                ? 'bg-[#2E7D32] text-white'
                : 'bg-[#141414] hover:bg-[#785E19] text-[#FAF8F5]'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
