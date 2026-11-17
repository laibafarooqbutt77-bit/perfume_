import React from 'react';
import { X, Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { PERFUMES_DATA } from '../data/perfumes';

export const WishlistDrawer: React.FC = () => {
  const {
    wishlist,
    wishlistOpen,
    setWishlistOpen,
    toggleWishlist,
    addToCart,
    openQuickView,
    formatPrice
  } = useShop();

  if (!wishlistOpen) return null;

  const savedProducts = PERFUMES_DATA.filter(p => wishlist.includes(p.id));

  const handleMoveToCart = (product: any) => {
    addToCart(product);
    toggleWishlist(product.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
      {/* Backdrop */}
      <div className="flex-1" onClick={() => setWishlistOpen(false)} />

      {/* Drawer Container */}
      <div className="w-full max-w-md bg-[#FAF8F5] text-[#141414] h-full shadow-2xl flex flex-col justify-between border-l border-[#E2D8CC] animate-slideLeft">
        {/* Header */}
        <div className="p-6 border-b border-[#E8E2D9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-[#C0392B] text-[#C0392B]" />
            <h3 className="font-serif-luxury text-xl font-medium tracking-wide">
              Saved Fragrances
            </h3>
            <span className="text-xs text-[#8A8075] font-mono tabular-nums">
              ({savedProducts.length})
            </span>
          </div>

          <button
            onClick={() => setWishlistOpen(false)}
            aria-label="Close wishlist drawer"
            className="p-1.5 rounded-full hover:bg-[#EFE9DF] text-[#4A443E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {savedProducts.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#F2ECE4] flex items-center justify-center mx-auto text-[#8C7335]">
                <Heart className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h4 className="font-serif-luxury text-2xl text-[#141414]">
                Your wishlist is empty
              </h4>
              <p className="text-xs text-[#736B63] max-w-xs mx-auto">
                Save your favourite flacons while browsing our collections for quick access anytime.
              </p>
              <button
                onClick={() => setWishlistOpen(false)}
                className="px-6 py-3 bg-[#141414] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider hover:bg-[#B89626] transition-colors"
              >
                Browse Scent Catalog
              </button>
            </div>
          ) : (
            savedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 bg-white p-3.5 rounded-lg border border-[#EAE3D9] shadow-xs"
              >
                {/* Thumb */}
                <div
                  onClick={() => {
                    setWishlistOpen(false);
                    openQuickView(product);
                  }}
                  className="w-16 h-20 bg-[#141414] rounded-xs overflow-hidden shrink-0 cursor-pointer"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h5
                      onClick={() => {
                        setWishlistOpen(false);
                        openQuickView(product);
                      }}
                      className="font-serif-luxury text-base font-semibold text-[#141414] truncate cursor-pointer hover:text-[#9A7B2C]"
                    >
                      {product.name}
                    </h5>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="text-[#9E958A] hover:text-[#C0392B] p-1 transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-[#8C827A] uppercase tracking-wider">
                    {product.subtitle}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#141414] tabular-nums">
                      {formatPrice(product.price)}
                    </span>

                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#141414] hover:bg-[#B89626] text-[#FAF8F5] text-[11px] font-semibold uppercase tracking-wider rounded-xs transition-colors"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Move to Bag</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedProducts.length > 0 && (
          <div className="p-6 bg-[#FFFFFF] border-t border-[#E8E2D9]">
            <button
              onClick={() => {
                savedProducts.forEach(p => addToCart(p));
                setWishlistOpen(false);
              }}
              className="w-full py-3.5 px-6 bg-[#141414] hover:bg-[#B89626] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <span>Add All to Bag</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
