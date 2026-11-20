import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { OrderRecord } from '../types/perfume';
import { CmsImage } from './CmsMedia';

const PAKISTAN_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Abbottabad',
  'Hyderabad',
  'Other City'
];

export const CheckoutModal: React.FC = () => {
  const {
    checkoutOpen,
    setCheckoutOpen,
    cart,
    customerProfile,
    promoCode,
    discountAmount,
    cartSubtotal,
    shippingFee,
    cartTotal,
    placeOrder,
    formatPrice
  } = useShop();

  const [formData, setFormData] = useState({
    fullName: customerProfile.fullName || '',
    phone: customerProfile.phone || '',
    email: customerProfile.email || '',
    address: customerProfile.address || '',
    city: customerProfile.city || 'Lahore',
    paymentMethod: 'cod' as 'cod' | 'card_demo'
  });

  useEffect(() => {
    if (checkoutOpen) {
      setFormData(prev => ({
        ...prev,
        fullName: customerProfile.fullName || prev.fullName,
        phone: customerProfile.phone || prev.phone,
        email: customerProfile.email || prev.email,
        address: customerProfile.address || prev.address,
        city: customerProfile.city || prev.city || 'Lahore'
      }));
    }
  }, [checkoutOpen, customerProfile]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  if (!checkoutOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Please enter your full name';
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length < 10) {
      errs.phone = 'Please provide a valid contact number (e.g. 0300-1234567)';
    }
    if (!formData.address.trim()) errs.address = 'Please enter your complete delivery street address';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || cart.length === 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const created = placeOrder({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        paymentMethod: formData.paymentMethod
      });
      setConfirmedOrder(created);
      setIsSubmitting(false);
    }, 600);
  };

  const handleClose = () => {
    setCheckoutOpen(false);
    setConfirmedOrder(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xs animate-fadeIn overflow-y-auto"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF8F5] text-[#141414] rounded-xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#D4AF37]/40 relative my-8"
      >
        <button
          onClick={handleClose}
          aria-label="Close checkout"
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-[#141414] flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {confirmedOrder ? (
          <div className="p-8 sm:p-12 text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 bg-[#2E7D32]/10 text-[#2E7D32] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.25em] text-[#8C7335] font-semibold">
                Order Confirmed
              </span>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#141414] font-medium">
                Thank You, {confirmedOrder.customer.fullName}
              </h2>
              <p className="text-sm text-[#736B63] max-w-md mx-auto">
                Your bespoke fragrance order{' '}
                <span className="font-mono font-semibold text-[#141414]">
                  {confirmedOrder.orderNumber}
                </span>{' '}
                has been saved to your order history and scheduled for dispatch.
              </p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg p-6 max-w-lg mx-auto text-left text-xs space-y-3 shadow-xs">
              <div className="flex justify-between border-b border-[#F2ECE4] pb-2 font-medium text-[#736B63]">
                <span>Delivery Address:</span>
                <span className="text-[#141414] text-right">
                  {confirmedOrder.customer.address}, {confirmedOrder.customer.city}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#F2ECE4] pb-2 font-medium text-[#736B63]">
                <span>Contact Number:</span>
                <span className="text-[#141414]">{confirmedOrder.customer.phone}</span>
              </div>
              <div className="flex justify-between border-b border-[#F2ECE4] pb-2 font-medium text-[#736B63]">
                <span>Payment Method:</span>
                <span className="text-[#141414] uppercase tracking-wider font-semibold">
                  {confirmedOrder.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Prepaid Demo Card'}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#F2ECE4] pb-2 font-medium text-[#736B63]">
                <span>Order Total:</span>
                <span className="font-mono text-base font-bold text-[#9A7B2C] tabular-nums">
                  {formatPrice(confirmedOrder.total)}
                </span>
              </div>
              <div className="flex justify-between text-[#736B63]">
                <span>Estimated Arrival:</span>
                <span className="text-[#141414]">2–4 Business Days across Pakistan</span>
              </div>
            </div>

            <p className="text-[11px] text-[#8C827A] max-w-md mx-auto">
              * Frontend demonstration. Your profile and order record are saved locally in your browser so you can view or track them anytime via our Fragrance Concierge.
            </p>

            <button
              onClick={handleClose}
              className="px-8 py-3 bg-[#141414] hover:bg-[#B89626] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider transition-colors shadow-md"
            >
              Continue Exploring
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
            <div className="md:col-span-7 p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-[#8C7335] font-semibold">
                  Haute Parfumerie Concierge
                </span>
                <h2 className="font-serif-luxury text-2xl sm:text-3xl font-medium text-[#141414]">
                  Express Delivery
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="checkout-fullName"
                      className="text-[11px] uppercase tracking-wider font-semibold text-[#141414] block mb-1"
                    >
                      Full Name *
                    </label>
                    <input
                      id="checkout-fullName"
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Tariq Mansoor"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D9D1C5] rounded-xs text-xs md:text-sm text-[#141414] focus:outline-hidden focus:border-[#785E19]"
                    />
                    {errors.fullName && <p className="text-xs text-[#C0392B] mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-email"
                      className="text-[11px] uppercase tracking-wider font-semibold text-[#141414] block mb-1"
                    >
                      Email (Optional)
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D9D1C5] rounded-xs text-xs md:text-sm text-[#141414] focus:outline-hidden focus:border-[#785E19]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="checkout-phone"
                      className="text-[11px] uppercase tracking-wider font-semibold text-[#141414] block mb-1"
                    >
                      Phone Number *
                    </label>
                    <input
                      id="checkout-phone"
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="0300 1234567"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D9D1C5] rounded-xs text-xs md:text-sm text-[#141414] focus:outline-hidden focus:border-[#785E19]"
                    />
                    {errors.phone && <p className="text-xs text-[#C0392B] mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-city"
                      className="text-[11px] uppercase tracking-wider font-semibold text-[#141414] block mb-1"
                    >
                      City *
                    </label>
                    <select
                      id="checkout-city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D9D1C5] rounded-xs text-xs md:text-sm text-[#141414] focus:outline-hidden focus:border-[#785E19]"
                    >
                      {PAKISTAN_CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="checkout-address"
                    className="text-[11px] uppercase tracking-wider font-semibold text-[#141414] block mb-1"
                  >
                    Street & House Address *
                  </label>
                  <input
                    id="checkout-address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="House / Apartment #, Street, Sector or Area"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D9D1C5] rounded-xs text-xs md:text-sm text-[#141414] focus:outline-hidden focus:border-[#785E19]"
                  />
                  {errors.address && <p className="text-xs text-[#C0392B] mt-1">{errors.address}</p>}
                </div>

                <fieldset className="pt-2">
                  <legend className="text-[11px] uppercase tracking-wider font-semibold text-[#141414] block mb-2">
                    Payment Method
                  </legend>
                  <div className="space-y-2">
                    <label
                      className={`flex items-center gap-3 p-3 rounded-xs border cursor-pointer transition-colors ${
                        formData.paymentMethod === 'cod'
                          ? 'border-[#141414] bg-[#FFFFFF]'
                          : 'border-[#E0D7CC] bg-[#FAF8F5]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={handleInputChange}
                        className="text-[#141414] focus:ring-0"
                      />
                      <div className="text-xs">
                        <span className="font-semibold text-[#141414] block">Cash on Delivery (COD)</span>
                        <span className="text-[#5C544D]">Pay upon receiving your sealed fragrance package</span>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-3 rounded-xs border cursor-pointer transition-colors ${
                        formData.paymentMethod === 'card_demo'
                          ? 'border-[#141414] bg-[#FFFFFF]'
                          : 'border-[#E0D7CC] bg-[#FAF8F5]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card_demo"
                        checked={formData.paymentMethod === 'card_demo'}
                        onChange={handleInputChange}
                        className="text-[#141414] focus:ring-0"
                      />
                      <div className="text-xs">
                        <span className="font-semibold text-[#141414] block">Prepaid Card / Visa / Mastercard</span>
                        <span className="text-[#5C544D]">Encrypted simulated payment checkout</span>
                      </div>
                    </label>
                  </div>
                </fieldset>

                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full py-3.5 px-6 bg-[#141414] hover:bg-[#785E19] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-50 mt-4"
                >
                  {isSubmitting ? (
                    <span>Scheduling Dispatch...</span>
                  ) : (
                    <>
                      <span>Place Order · {formatPrice(cartTotal)}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="md:col-span-5 bg-[#F2ECE4] p-6 sm:p-8 border-t md:border-t-0 md:border-l border-[#E2D8CC] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="font-serif-luxury text-xl font-medium text-[#141414]">
                  Order Overview
                </h3>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 text-xs">
                      <div className="w-12 h-14 bg-[#141414] rounded-xs overflow-hidden shrink-0">
                        <CmsImage
                          src={item.product.image}
                          alt={item.product.name}
                          width={48}
                          height={56}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#141414] truncate">{item.product.name}</p>
                        <p className="text-[11px] text-[#736B63]">
                          {item.selectedSize} × {item.quantity}
                        </p>
                      </div>
                      <span className="font-mono font-medium text-[#141414] tabular-nums">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-[#DFD6CA] space-y-2 text-xs">
                  <div className="flex justify-between text-[#736B63]">
                    <span>Items Subtotal</span>
                    <span className="font-mono text-[#141414] tabular-nums">{formatPrice(cartSubtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#2E7D32]">
                      <span>Discount ({promoCode})</span>
                      <span className="font-mono tabular-nums">- {formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#736B63]">
                    <span>Courier Charges</span>
                    <span className="font-mono text-[#141414] tabular-nums">
                      {shippingFee === 0 ? 'Complimentary' : formatPrice(shippingFee)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#DFD6CA] flex justify-between text-base font-semibold text-[#141414]">
                    <span className="font-serif-luxury text-lg">Payable Total</span>
                    <span className="font-mono text-lg text-[#9A7B2C] tabular-nums">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-[#736B63] space-y-2 pt-4 border-t border-[#DFD6CA]">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span>2–4 business days delivery in Pakistan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span>Frontend demo · No real card charges applied</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
