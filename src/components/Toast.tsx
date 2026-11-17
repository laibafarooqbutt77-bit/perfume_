import React from 'react';
import { useShop } from '../context/ShopContext';
import { ShoppingBag, Heart, CheckCircle2, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, hideToast, setCartOpen, setWishlistOpen } = useShop();

  if (!toast || !toast.show) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-slideUp">
      <div className="bg-[#141414] text-[#FAF8F5] border border-[#D4AF37]/40 px-5 py-3.5 rounded-lg shadow-2xl flex items-center gap-3.5 max-w-md">
        {toast.type === 'cart' && <ShoppingBag className="w-5 h-5 text-[#D4AF37] shrink-0" />}
        {toast.type === 'wishlist' && <Heart className="w-5 h-5 text-[#C0392B] fill-[#C0392B] shrink-0" />}
        {toast.type === 'info' && <CheckCircle2 className="w-5 h-5 text-[#2E7D32] shrink-0" />}

        <div className="flex-1 text-xs">
          <p className="font-medium text-white">{toast.message}</p>
        </div>

        {toast.type === 'cart' && (
          <button
            onClick={() => {
              hideToast();
              setCartOpen(true);
            }}
            className="text-[11px] font-semibold text-[#D4AF37] hover:underline uppercase tracking-wider shrink-0"
          >
            View Bag
          </button>
        )}

        {toast.type === 'wishlist' && (
          <button
            onClick={() => {
              hideToast();
              setWishlistOpen(true);
            }}
            className="text-[11px] font-semibold text-[#D4AF37] hover:underline uppercase tracking-wider shrink-0"
          >
            View Wishlist
          </button>
        )}

        <button
          onClick={hideToast}
          aria-label="Close notification"
          className="text-[#8C827A] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
