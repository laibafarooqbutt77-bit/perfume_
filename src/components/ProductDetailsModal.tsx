import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, Star, Shield, Truck, Droplets, Clock, Sparkles, Check } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { CmsImage } from './CmsMedia';

export const ProductDetailsModal: React.FC = () => {
  const {
    quickViewProduct,
    closeQuickView,
    addToCart,
    toggleWishlist,
    isWishlisted,
    formatPrice
  } = useShop();

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedSize(quickViewProduct.sizes[quickViewProduct.sizes.length - 1].size);
      setQuantity(1);
      setJustAdded(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const currentSizeConfig = quickViewProduct.sizes.find(s => s.size === selectedSize);
  const activePrice = currentSizeConfig ? currentSizeConfig.price : quickViewProduct.price;
  const isSaved = isWishlisted(quickViewProduct.id);

  const handleAddToCart = () => {
    addToCart(quickViewProduct, selectedSize, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xs animate-fadeIn overflow-y-auto"
      onClick={closeQuickView}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF8F5] text-[#141414] rounded-xl max-w-4xl w-full overflow-hidden shadow-2xl border border-[#D4AF37]/40 relative my-8"
      >
        {/* Close Button */}
        <button
          onClick={closeQuickView}
          aria-label="Close product details"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          {/* Left Column: Big Bottle Image & Badges */}
          <div className="md:col-span-5 bg-[#141414] relative aspect-square md:aspect-auto flex items-center justify-center overflow-hidden">
            <CmsImage
              src={quickViewProduct.image}
              alt={quickViewProduct.name}
              width={720}
              height={538}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute top-4 left-4 bg-[#141414]/80 backdrop-blur-xs text-[#E8DCC4] text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-xs border border-[#3E3830]">
              {quickViewProduct.subtitle}
            </div>
          </div>

          {/* Right Column: Detailed Purchase Module & Olfactory Pyramids */}
          <div className="md:col-span-7 p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs text-[#8A8075] uppercase tracking-wider mb-1">
                <span>{quickViewProduct.brand}</span>
                <div className="flex items-center text-[#D4AF37]">
                  <Star className="w-3.5 h-3.5 fill-[#D4AF37]" />
                  <span className="font-mono tabular-nums font-semibold ml-1 text-[#141414]">
                    {quickViewProduct.rating.toFixed(1)}
                  </span>
                  <span className="text-[#8A8075] ml-1">({quickViewProduct.reviewCount} reviews)</span>
                </div>
              </div>

              <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#141414] font-medium">
                {quickViewProduct.name}
              </h2>

              <p className="font-mono text-2xl font-bold text-[#141414] mt-2 tabular-nums">
                {formatPrice(activePrice)}
              </p>
            </div>

            {/* Description & Narrative */}
            <p className="text-xs sm:text-sm text-[#5C554E] leading-relaxed font-light">
              {quickViewProduct.description}
            </p>

            {/* Available Bottle Sizes Selector */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#141414] block">
                Select Flacon Volume
              </span>
              <div className="grid grid-cols-3 gap-2">
                {quickViewProduct.sizes.map((s) => (
                  <button
                    key={s.size}
                    onClick={() => setSelectedSize(s.size)}
                    className={`py-2 px-3 text-xs rounded-xs border transition-all text-center ${
                      selectedSize === s.size
                        ? 'border-[#141414] bg-[#141414] text-[#FAF8F5] font-semibold'
                        : 'border-[#D9D1C5] bg-[#FFFFFF] text-[#5C554E] hover:border-[#141414]'
                    }`}
                  >
                    <span className="block font-medium">{s.size}</span>
                    <span className="text-[10px] opacity-80 font-mono tabular-nums">
                      {formatPrice(s.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Olfactory Notes Pyramid */}
            <div className="p-4 bg-[#F2ECE4] rounded-lg border border-[#E2D8CC] space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8C7335] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Olfactory Architecture</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs divide-x divide-[#D9D0C3]">
                <div className="pr-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#8C827A] block font-semibold">
                    Top Notes
                  </span>
                  <p className="text-[#141414] font-medium mt-0.5 text-[11px] leading-tight">
                    {quickViewProduct.notes.top.join(', ')}
                  </p>
                </div>
                <div className="px-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#8C827A] block font-semibold">
                    Heart Notes
                  </span>
                  <p className="text-[#141414] font-medium mt-0.5 text-[11px] leading-tight">
                    {quickViewProduct.notes.heart.join(', ')}
                  </p>
                </div>
                <div className="pl-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#8C827A] block font-semibold">
                    Base Notes
                  </span>
                  <p className="text-[#141414] font-medium mt-0.5 text-[11px] leading-tight">
                    {quickViewProduct.notes.base.join(', ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#736B63] pt-2 border-t border-[#DFD6CA]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#8C7335]" /> Longevity: {quickViewProduct.longevity}
                </span>
                <span className="flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-[#8C7335]" /> Sillage: {quickViewProduct.sillage}
                </span>
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-[#D9D1C5] rounded-xs bg-white">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="px-3 py-2 text-sm hover:bg-[#F2ECE4] transition-colors"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-xs font-mono font-semibold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="px-3 py-2 text-sm hover:bg-[#F2ECE4] transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag Button */}
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-6 text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
                    justAdded
                      ? 'bg-[#2E7D32] text-white'
                      : 'bg-[#141414] hover:bg-[#B89626] text-[#FAF8F5]'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag · {formatPrice(activePrice * quantity)}</span>
                    </>
                  )}
                </button>

                {/* Wishlist Toggle Button */}
                <button
                  onClick={() => toggleWishlist(quickViewProduct.id)}
                  aria-label="Save to wishlist"
                  className="p-3 border border-[#D9D1C5] hover:bg-white rounded-xs transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isSaved ? 'fill-[#C0392B] text-[#C0392B]' : 'text-[#4A443E]'
                    }`}
                  />
                </button>
              </div>

              {/* Delivery Assurance */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#736B63] pt-2">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span>Free Express Courier &gt; ₨ 15,000</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span>100% Authentic Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
