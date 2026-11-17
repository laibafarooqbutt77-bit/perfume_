import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  PerfumeProduct,
  CartItem,
  FragranceCategory,
  CustomerProfile,
  OrderRecord
} from '../types/perfume';
import { PERFUMES_DATA } from '../data/perfumes';

interface ToastState {
  show: boolean;
  message: string;
  type: 'cart' | 'wishlist' | 'info';
}

export interface PlaceOrderInput {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  paymentMethod: 'cod' | 'card_demo';
}

interface ShopContextType {
  cart: CartItem[];
  wishlist: string[];
  recentlyViewed: string[];
  customerProfile: CustomerProfile;
  orderHistory: OrderRecord[];
  promoCode: string | null;
  selectedCategory: FragranceCategory;
  selectedFamily: string;
  searchQuery: string;
  sortBy: 'popular' | 'price-low' | 'price-high' | 'rating' | 'newest';
  priceRange: [number, number];
  cartOpen: boolean;
  wishlistOpen: boolean;
  checkoutOpen: boolean;
  quickViewProduct: PerfumeProduct | null;
  toast: ToastState | null;

  // Setters
  setSelectedCategory: (cat: FragranceCategory) => void;
  setSelectedFamily: (family: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'popular' | 'price-low' | 'price-high' | 'rating' | 'newest') => void;
  setPriceRange: (range: [number, number]) => void;
  setCartOpen: (open: boolean) => void;
  setWishlistOpen: (open: boolean) => void;
  setCheckoutOpen: (open: boolean) => void;

  // Actions
  addToCart: (product: PerfumeProduct, size?: string, quantity?: number) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  openQuickView: (product: PerfumeProduct) => void;
  closeQuickView: () => void;
  applyPromoCode: (code: string | null) => { ok: boolean; message: string };
  updateCustomerProfile: (updates: Partial<CustomerProfile>) => void;
  placeOrder: (input: PlaceOrderInput) => OrderRecord;
  syncStateFromAssistant: (synced: {
    cart?: CartItem[];
    wishlist?: string[];
    customerProfile?: CustomerProfile;
    orderHistory?: OrderRecord[];
    promoCode?: string | null;
  }) => void;
  showToast: (message: string, type?: 'cart' | 'wishlist' | 'info') => void;
  hideToast: () => void;
  formatPrice: (amount: number) => string;

  // Computations
  cartCount: number;
  cartSubtotal: number;
  discountAmount: number;
  shippingFee: number;
  cartTotal: number;
  filteredProducts: PerfumeProduct[];
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 15000;
const STANDARD_SHIPPING_FEE = 450;
const PROMO_CODE_MAISON15 = 'MAISON15';
const PROMO_MIN_SUBTOTAL = 20000;

function generateCustomerId(): string {
  return `CUS-${Math.floor(100000 + Math.random() * 900000)}`;
}

function getDefaultCustomerProfile(): CustomerProfile {
  return {
    customerId: generateCustomerId(),
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Lahore',
    preferredNotes: []
  };
}

function safeParseCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('maisondor_cart');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const mergedMap = new Map<string, CartItem>();
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue;
      const productId = item.product?.id;
      const catalogProduct = PERFUMES_DATA.find(p => p.id === productId);
      if (!catalogProduct) continue;
      const selectedSize =
        typeof item.selectedSize === 'string' &&
        catalogProduct.sizes.some(s => s.size === item.selectedSize)
          ? item.selectedSize
          : catalogProduct.sizes[catalogProduct.sizes.length - 1].size;
      const sizeConfig = catalogProduct.sizes.find(s => s.size === selectedSize);
      const unitPrice = sizeConfig ? sizeConfig.price : catalogProduct.price;
      const qty = Number(item.quantity);
      if (!Number.isFinite(qty) || qty <= 0) continue;
      const id = `${catalogProduct.id}-${selectedSize}`;
      const existing = mergedMap.get(id);
      if (existing) {
        existing.quantity += Math.floor(qty);
      } else {
        mergedMap.set(id, {
          id,
          product: catalogProduct,
          selectedSize,
          unitPrice,
          quantity: Math.floor(qty)
        });
      }
    }
    return Array.from(mergedMap.values());
  } catch {
    return [];
  }
}

function safeParseStringArray(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (id): id is string =>
        typeof id === 'string' && PERFUMES_DATA.some(p => p.id === id)
    );
  } catch {
    return [];
  }
}

function safeParseCustomerProfile(): CustomerProfile {
  if (typeof window === 'undefined') return getDefaultCustomerProfile();
  try {
    const raw = localStorage.getItem('maisondor_customer_profile');
    if (!raw) return getDefaultCustomerProfile();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return getDefaultCustomerProfile();
    return {
      customerId:
        typeof parsed.customerId === 'string' && parsed.customerId.trim()
          ? parsed.customerId
          : generateCustomerId(),
      fullName: typeof parsed.fullName === 'string' ? parsed.fullName : '',
      phone: typeof parsed.phone === 'string' ? parsed.phone : '',
      email: typeof parsed.email === 'string' ? parsed.email : '',
      address: typeof parsed.address === 'string' ? parsed.address : '',
      city: typeof parsed.city === 'string' && parsed.city.trim() ? parsed.city : 'Lahore',
      preferredNotes: Array.isArray(parsed.preferredNotes)
        ? parsed.preferredNotes.filter((n: unknown): n is string => typeof n === 'string')
        : []
    };
  } catch {
    return getDefaultCustomerProfile();
  }
}

function safeParseOrderHistory(): OrderRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('maisondor_orders');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (o): o is OrderRecord =>
        o &&
        typeof o === 'object' &&
        typeof o.orderNumber === 'string' &&
        Array.isArray(o.items) &&
        typeof o.total === 'number'
    );
  } catch {
    return [];
  }
}

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(safeParseCart);
  const [wishlist, setWishlist] = useState<string[]>(() => safeParseStringArray('maisondor_wishlist'));
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() =>
    safeParseStringArray('maisondor_recently_viewed')
  );
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>(safeParseCustomerProfile);
  const [orderHistory, setOrderHistory] = useState<OrderRecord[]>(safeParseOrderHistory);
  const [promoCode, setPromoCode] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem('maisondor_promo');
      return saved === PROMO_CODE_MAISON15 ? PROMO_CODE_MAISON15 : null;
    } catch {
      return null;
    }
  });

  // UI state
  const [selectedCategory, setSelectedCategory] = useState<FragranceCategory>('all');
  const [selectedFamily, setSelectedFamily] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'rating' | 'newest'>('popular');
  const [priceRange, setPriceRange] = useState<[number, number]>([5000, 45000]);

  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<PerfumeProduct | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Sync states to Local Storage
  useEffect(() => {
    try {
      localStorage.setItem('maisondor_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('maisondor_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('maisondor_recently_viewed', JSON.stringify(recentlyViewed));
    } catch (e) {
      console.error('Failed to save recently viewed to localStorage', e);
    }
  }, [recentlyViewed]);

  useEffect(() => {
    try {
      localStorage.setItem('maisondor_customer_profile', JSON.stringify(customerProfile));
    } catch (e) {
      console.error('Failed to save customer profile to localStorage', e);
    }
  }, [customerProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('maisondor_orders', JSON.stringify(orderHistory));
    } catch (e) {
      console.error('Failed to save order history to localStorage', e);
    }
  }, [orderHistory]);

  useEffect(() => {
    try {
      if (promoCode) {
        localStorage.setItem('maisondor_promo', promoCode);
      } else {
        localStorage.removeItem('maisondor_promo');
      }
    } catch (e) {
      console.error('Failed to save promo code to localStorage', e);
    }
  }, [promoCode]);

  const showToast = useCallback((message: string, type: 'cart' | 'wishlist' | 'info' = 'info') => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    if (toast?.show) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const addToCart = useCallback(
    (product: PerfumeProduct, size?: string, quantity: number = 1) => {
      const safeQty = Math.max(1, Math.floor(quantity || 1));
      const chosenSize =
        size && product.sizes.some(s => s.size === size)
          ? size
          : product.sizes.length > 0
            ? product.sizes[product.sizes.length - 1].size
            : '100 ml';
      const sizeConfig = product.sizes.find(s => s.size === chosenSize);
      const unitPrice = sizeConfig ? sizeConfig.price : product.price;
      const itemId = `${product.id}-${chosenSize}`;

      setCart(prev => {
        const existing = prev.find(item => item.id === itemId);
        if (existing) {
          return prev.map(item =>
            item.id === itemId ? { ...item, quantity: item.quantity + safeQty } : item
          );
        }
        return [
          ...prev,
          {
            id: itemId,
            product,
            selectedSize: chosenSize,
            unitPrice,
            quantity: safeQty
          }
        ];
      });

      showToast(`Added ${safeQty} × ${product.name} (${chosenSize}) to your cart`, 'cart');
    },
    [showToast]
  );

  const updateQuantity = useCallback((itemId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  }, []);

  const removeFromCart = useCallback(
    (itemId: string) => {
      setCart(prev => {
        const target = prev.find(i => i.id === itemId);
        if (target) {
          showToast(`Removed ${target.product.name} from your cart`, 'info');
        }
        return prev.filter(item => item.id !== itemId);
      });
    },
    [showToast]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setPromoCode(null);
    showToast('Shopping cart has been emptied', 'info');
  }, [showToast]);

  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlist(prev => {
        const isSaved = prev.includes(productId);
        const perfume = PERFUMES_DATA.find(p => p.id === productId);
        const name = perfume ? perfume.name : 'Item';
        if (isSaved) {
          showToast(`Removed ${name} from your wishlist`, 'wishlist');
          return prev.filter(id => id !== productId);
        } else {
          showToast(`Saved ${name} to your wishlist`, 'wishlist');
          return [...prev, productId];
        }
      });
    },
    [showToast]
  );

  const isWishlisted = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  const openQuickView = useCallback((product: PerfumeProduct) => {
    setQuickViewProduct(product);
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== product.id);
      return [product.id, ...filtered].slice(0, 8);
    });
  }, []);

  const closeQuickView = useCallback(() => {
    setQuickViewProduct(null);
  }, []);

  const updateCustomerProfile = useCallback((updates: Partial<CustomerProfile>) => {
    setCustomerProfile(prev => ({
      ...prev,
      ...updates,
      customerId: prev.customerId || generateCustomerId()
    }));
  }, []);

  // Calculations
  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (promoCode === PROMO_CODE_MAISON15 && cartSubtotal >= PROMO_MIN_SUBTOTAL) {
      return Math.round(cartSubtotal * 0.15);
    }
    return 0;
  }, [promoCode, cartSubtotal]);

  const shippingFee = useMemo(() => {
    if (cartSubtotal === 0) return 0;
    const afterDiscount = cartSubtotal - discountAmount;
    return afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  }, [cartSubtotal, discountAmount]);

  const cartTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - discountAmount) + shippingFee;
  }, [cartSubtotal, discountAmount, shippingFee]);

  const applyPromoCode = useCallback(
    (code: string | null): { ok: boolean; message: string } => {
      if (!code || code.trim() === '') {
        setPromoCode(null);
        return { ok: true, message: 'Promo code removed.' };
      }
      const normalized = code.trim().toUpperCase();
      if (normalized !== PROMO_CODE_MAISON15) {
        return {
          ok: false,
          message: `Promo code "${normalized}" is invalid. Active seasonal code: MAISON15 (15% off orders above ₨ 20,000).`
        };
      }
      if (cartSubtotal < PROMO_MIN_SUBTOTAL) {
        setPromoCode(PROMO_CODE_MAISON15);
        return {
          ok: true,
          message: `Code MAISON15 saved! Add ₨ ${(PROMO_MIN_SUBTOTAL - cartSubtotal).toLocaleString('en-PK')} more to unlock the 15% discount.`
        };
      }
      setPromoCode(PROMO_CODE_MAISON15);
      showToast('Promo code MAISON15 applied (15% off)', 'info');
      return {
        ok: true,
        message: 'Promo code MAISON15 applied — 15% discount unlocked!'
      };
    },
    [cartSubtotal, showToast]
  );

  const placeOrder = useCallback(
    (input: PlaceOrderInput): OrderRecord => {
      const orderNumber = `MD-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date();
      const newOrder: OrderRecord = {
        orderNumber,
        createdAt: now.toISOString(),
        date: now.toLocaleDateString('en-PK', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        items: [...cart],
        subtotal: cartSubtotal,
        discountCode: discountAmount > 0 ? promoCode : null,
        discountAmount,
        shippingFee,
        total: cartTotal,
        paymentMethod: input.paymentMethod,
        status: 'Preparing Shipment',
        customer: {
          fullName: input.fullName.trim(),
          phone: input.phone.trim(),
          email: input.email?.trim() || customerProfile.email || '',
          address: input.address.trim(),
          city: input.city.trim()
        }
      };

      setOrderHistory(prev => [newOrder, ...prev]);
      setCustomerProfile(prev => ({
        ...prev,
        fullName: input.fullName.trim() || prev.fullName,
        phone: input.phone.trim() || prev.phone,
        email: input.email?.trim() || prev.email,
        address: input.address.trim() || prev.address,
        city: input.city.trim() || prev.city
      }));
      setCart([]);
      setPromoCode(null);
      showToast(`Order ${orderNumber} confirmed!`, 'info');
      return newOrder;
    },
    [cart, cartSubtotal, discountAmount, promoCode, shippingFee, cartTotal, customerProfile.email, showToast]
  );

  const syncStateFromAssistant = useCallback(
    (synced: {
      cart?: CartItem[];
      wishlist?: string[];
      customerProfile?: CustomerProfile;
      orderHistory?: OrderRecord[];
      promoCode?: string | null;
    }) => {
      if (synced.cart !== undefined) setCart(synced.cart);
      if (synced.wishlist !== undefined) setWishlist(synced.wishlist);
      if (synced.customerProfile !== undefined) setCustomerProfile(synced.customerProfile);
      if (synced.orderHistory !== undefined) setOrderHistory(synced.orderHistory);
      if (synced.promoCode !== undefined) setPromoCode(synced.promoCode);
    },
    []
  );

  const formatPrice = useCallback((amount: number) => {
    return `₨ ${amount.toLocaleString('en-PK')}`;
  }, []);

  // Filtering logic
  const filteredProducts = useMemo(() => {
    return PERFUMES_DATA.filter(product => {
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      if (selectedFamily !== 'All' && product.fragranceFamily !== selectedFamily) {
        return false;
      }
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesBrand = product.brand.toLowerCase().includes(query);
        const matchesSubtitle = product.subtitle.toLowerCase().includes(query);
        const matchesFamily = product.fragranceFamily.toLowerCase().includes(query);
        const matchesTopNotes = product.notes.top.some(n => n.toLowerCase().includes(query));
        const matchesHeartNotes = product.notes.heart.some(n => n.toLowerCase().includes(query));
        const matchesBaseNotes = product.notes.base.some(n => n.toLowerCase().includes(query));

        if (
          !matchesName &&
          !matchesBrand &&
          !matchesSubtitle &&
          !matchesFamily &&
          !matchesTopNotes &&
          !matchesHeartNotes &&
          !matchesBaseNotes
        ) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      return b.reviewCount - a.reviewCount;
    });
  }, [selectedCategory, selectedFamily, priceRange, searchQuery, sortBy]);

  return (
    <ShopContext.Provider
      value={{
        cart,
        wishlist,
        recentlyViewed,
        customerProfile,
        orderHistory,
        promoCode,
        selectedCategory,
        selectedFamily,
        searchQuery,
        sortBy,
        priceRange,
        cartOpen,
        wishlistOpen,
        checkoutOpen,
        quickViewProduct,
        toast,
        setSelectedCategory,
        setSelectedFamily,
        setSearchQuery,
        setSortBy,
        setPriceRange,
        setCartOpen,
        setWishlistOpen,
        setCheckoutOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isWishlisted,
        openQuickView,
        closeQuickView,
        applyPromoCode,
        updateCustomerProfile,
        placeOrder,
        syncStateFromAssistant,
        showToast,
        hideToast,
        formatPrice,
        cartCount,
        cartSubtotal,
        discountAmount,
        shippingFee,
        cartTotal,
        filteredProducts
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
