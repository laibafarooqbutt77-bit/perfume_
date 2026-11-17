import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Truck, Tag } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartOpen,
    setCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    promoCode,
    discountAmount,
    applyPromoCode,
    shippingFee,
    cartTotal,
    setCheckoutOpen,
    formatPrice
  } = useShop();

  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  if (!cartOpen) return null;

  const freeShippingThreshold = 15000;
  const effectiveSubtotal = Math.max(0, cartSubtotal - discountAmount);
  const progressToFreeShipping = Math.min(100, (effectiveSubtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - effectiveSubtotal);

  const handleProceedToCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const res = applyPromoCode(promoInput);
    setPromoFeedback({ ok: res.ok, text: res.message });
    if (res.ok) setPromoInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
      {/* Backdrop */}
      <div className="flex-1" onClick={() => setCartOpen(false)} />

      {/* Drawer Container */}
      <div className="w-full max-w-md bg-[#FAF8F5] text-[#141414] h-full shadow-2xl flex flex-col justify-between border-l border-[#E2D8CC] animate-slideLeft">
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#E8E2D9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#6E561E]" />
            <h2 className="font-serif-luxury text-xl font-medium tracking-wide">
              Your Fragrance Bag
            </h2>
            <span className="text-xs text-[#8A8075] font-mono tabular-nums">
              ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            </span>
          </div>

          <button
            onClick={() => setCartOpen(false)}
            aria-label="Close cart drawer"
            className="p-1.5 rounded-full hover:bg-[#EFE9DF] text-[#4A443E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-[#F2ECE4] px-6 py-3 border-b border-[#E2D8CC]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 font-medium text-[#141414]">
              <Truck className="w-3.5 h-3.5 text-[#2E7D32]" />
              {remainingForFreeShipping === 0
                ? 'Complimentary Express Courier Unlocked'
                : `Add ${formatPrice(remainingForFreeShipping)} for Complimentary Courier`}
            </span>
            <span className="font-mono text-[11px] tabular-nums text-[#736B63]">
              {Math.round(progressToFreeShipping)}%
            </span>
          </div>
          <div className="w-full bg-[#E0D7CC] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#2E7D32] h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressToFreeShipping}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#F2ECE4] flex items-center justify-center mx-auto text-[#8C7335]">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="font-serif-luxury text-2xl text-[#141414]">
                Your bag is empty
              </h3>
              <p className="text-xs text-[#736B63] max-w-xs mx-auto">
                Explore our olfactory collections and find the signature extrait meant for you.
              </p>
              <button
                onClick={() => setCartOpen(false)}
                className="px-6 py-3 bg-[#141414] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider hover:bg-[#B89626] transition-colors"
              >
                Explore Scent Library
              </button>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 bg-white p-3.5 rounded-lg border border-[#EAE3D9] shadow-xs"
                >
                  {/* Thumb */}
                  <div className="w-16 h-20 bg-[#141414] rounded-xs overflow-hidden shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      width={64}
                      height={80}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-serif-luxury text-base font-semibold text-[#141414] truncate">
                        {item.product.name}
                      </h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[#9E958A] hover:text-[#C0392B] p-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-[11px] text-[#8C827A] uppercase tracking-wider">
                      {item.selectedSize} · {item.product.subtitle}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      {/* Stepper */}
                      <div className="flex items-center border border-[#D9D1C5] rounded-xs bg-[#FAF8F5]">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-2 py-0.5 text-xs text-[#5C554E] hover:bg-[#EFE9DF]"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-mono font-medium tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-2 py-0.5 text-xs text-[#5C554E] hover:bg-[#EFE9DF]"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-mono text-xs font-semibold text-[#141414] tabular-nums">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Promo Code Input */}
              <div className="pt-2">
                {promoCode ? (
                  <div className="flex items-center justify-between bg-[#F2ECE4] border border-[#D4AF37]/40 px-3 py-2 rounded-xs text-xs">
                    <span className="flex items-center gap-1.5 text-[#141414] font-medium">
                      <Tag className="w-3.5 h-3.5 text-[#8C7335]" />
                      Code <strong className="font-mono">{promoCode}</strong> active
                    </span>
                    <button
                      onClick={() => {
                        applyPromoCode(null);
                        setPromoFeedback(null);
                      }}
                      className="text-[11px] text-[#8C827A] hover:text-[#C0392B] underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <label htmlFor="cart-promo-input" className="sr-only">
                      Promo code
                    </label>
                    <input
                      id="cart-promo-input"
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Promo code (e.g. MAISON15)"
                      className="flex-1 px-3 py-2 bg-white border border-[#D9D1C5] rounded-xs text-xs text-[#141414] focus:outline-hidden focus:border-[#785E19]"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-[#EFE9DF] hover:bg-[#141414] hover:text-white text-[#141414] text-[11px] font-semibold uppercase tracking-wider rounded-xs transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {promoFeedback && (
                  <p className={`text-[11px] mt-1 ${promoFeedback.ok ? 'text-[#2E7D32]' : 'text-[#C0392B]'}`}>
                    {promoFeedback.text}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer with Totals & Checkout Button */}
        {cart.length > 0 && (
          <div className="p-6 bg-[#FFFFFF] border-t border-[#E8E2D9] space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[#6B635B]">
                <span>Subtotal</span>
                <span className="font-mono font-medium text-[#141414] tabular-nums">
                  {formatPrice(cartSubtotal)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-[#2E7D32]">
                  <span>Discount ({promoCode})</span>
                  <span className="font-mono font-medium tabular-nums">
                    - {formatPrice(discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-[#6B635B]">
                <span>Nationwide Courier</span>
                <span className="font-mono font-medium text-[#141414] tabular-nums">
                  {shippingFee === 0 ? 'Complimentary' : formatPrice(shippingFee)}
                </span>
              </div>
              <div className="pt-2 border-t border-[#EAE3D9] flex items-center justify-between text-base font-semibold text-[#141414]">
                <span className="font-serif-luxury text-lg">Total</span>
                <span className="font-mono tabular-nums text-lg text-[#9A7B2C]">
                  {formatPrice(cartTotal)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 px-6 bg-[#141414] hover:bg-[#B89626] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={clearCart}
                className="w-full py-1 text-[11px] text-[#8C827A] hover:text-[#C0392B] underline transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
