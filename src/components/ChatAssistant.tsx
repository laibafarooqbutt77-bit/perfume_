import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ShoppingBag,
  Heart,
  Eye,
  Trash2,
  User,
  PackageCheck,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  Star,
  MapPin,
  Phone,
  Mail,
  Check
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useShop } from '../context/ShopContext';
import { useSiteContent } from '../context/SiteContentContext';
import { CmsImage } from './CmsMedia';
import type { ChatMessage, PerfumeProduct } from '../types/perfume';

const CHAT_HISTORY_KEY = 'maisondor_chat_history';
const CHAT_META_KEY = 'maisondor_chat_meta';

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

interface ChatMetaState {
  pendingOrderConfirmation: boolean;
  pendingPaymentMethod: 'cod' | 'card_demo';
  lastDisplayedProductIds: string[];
}

function createWelcomeMessage(customerName?: string): ChatMessage {
  const greeting = customerName
    ? `Welcome back, ${customerName}. I am **Aurèle**, your Maison d’Or Fragrance Concierge.`
    : `Bienvenue. I am **Aurèle**, your personal Fragrance Concierge at Maison d’Or Parfumerie.`;

  return {
    id: 'welcome-msg',
    role: 'assistant',
    text: `${greeting}\n\nAsk me to recommend a scent by mood or notes, compare flacons, manage your shopping bag, update your delivery details, track past orders, or complete your purchase right here.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

function safeLoadChatHistory(customerName?: string): ChatMessage[] {
  if (typeof window === 'undefined') return [createWelcomeMessage(customerName)];
  try {
    const raw = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!raw) return [createWelcomeMessage(customerName)];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [createWelcomeMessage(customerName)];
    }
    return parsed.filter(
      (m): m is ChatMessage =>
        m &&
        typeof m === 'object' &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.text === 'string'
    );
  } catch {
    return [createWelcomeMessage(customerName)];
  }
}

function safeLoadChatMeta(): ChatMetaState {
  if (typeof window === 'undefined') {
    return {
      pendingOrderConfirmation: false,
      pendingPaymentMethod: 'cod',
      lastDisplayedProductIds: []
    };
  }
  try {
    const raw = localStorage.getItem(CHAT_META_KEY);
    if (!raw) {
      return {
        pendingOrderConfirmation: false,
        pendingPaymentMethod: 'cod',
        lastDisplayedProductIds: []
      };
    }
    const parsed = JSON.parse(raw);
    return {
      pendingOrderConfirmation: Boolean(parsed?.pendingOrderConfirmation),
      pendingPaymentMethod: parsed?.pendingPaymentMethod === 'card_demo' ? 'card_demo' : 'cod',
      lastDisplayedProductIds: Array.isArray(parsed?.lastDisplayedProductIds)
        ? parsed.lastDisplayedProductIds
        : []
    };
  } catch {
    return {
      pendingOrderConfirmation: false,
      pendingPaymentMethod: 'cod',
      lastDisplayedProductIds: []
    };
  }
}

// Lightweight safe inline bold & line-break formatter (no raw HTML injection)
function FormattedMessageText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed">
      {lines.map((line, lineIdx) => {
        if (!line.trim()) return <div key={lineIdx} className="h-1" />;
        const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
        return (
          <p key={lineIdx}>
            {parts.map((part, pIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={pIdx} className="font-semibold text-inherit">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              if (part.startsWith('`') && part.endsWith('`')) {
                return (
                  <code
                    key={pIdx}
                    className="px-1 py-0.5 rounded-xs bg-[#EFE9DF] text-[#141414] font-mono text-[11px]"
                  >
                    {part.slice(1, -1)}
                  </code>
                );
              }
              return <React.Fragment key={pIdx}>{part}</React.Fragment>;
            })}
          </p>
        );
      })}
    </div>
  );
}

interface ChatAssistantProps {
  initialOpen?: boolean;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ initialOpen = false }) => {
  const {
    cart,
    cartCount,
    wishlist,
    recentlyViewed,
    customerProfile,
    orderHistory,
    promoCode,
    addToCart,
    toggleWishlist,
    isWishlisted,
    openQuickView,
    setCartOpen,
    setWishlistOpen,
    setCheckoutOpen,
    setSelectedCategory,
    setSearchQuery,
    updateCustomerProfile,
    syncStateFromAssistant,
    formatPrice
  } = useShop();
  const { cms } = useSiteContent();

  const [isOpen, setIsOpen] = useState(initialOpen);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    safeLoadChatHistory(customerProfile.fullName)
  );
  const [chatMeta, setChatMeta] = useState<ChatMetaState>(safeLoadChatMeta);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastFailedInput, setLastFailedInput] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  // Profile editor state
  const [profileForm, setProfileForm] = useState(customerProfile);
  const [profileSavedFlash, setProfileSavedFlash] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setProfileForm(customerProfile);
  }, [customerProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages.slice(-30)));
    } catch (e) {
      console.error('Failed to persist chat history', e);
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_META_KEY, JSON.stringify(chatMeta));
    } catch (e) {
      console.error('Failed to persist chat metadata', e);
    }
  }, [chatMeta]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        if (!showProfilePanel) inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, messages, isLoading, showProfilePanel]);

  const handleQuickAdd = (product: PerfumeProduct, size?: string) => {
    addToCart(product, size, 1);
    setAddedIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [product.id]: false }));
    }, 1200);
  };

  const sendMessage = async (textToSend?: string) => {
    const trimmed = (textToSend ?? inputValue).trim();
    if (!trimmed || isLoading) return;

    setLastFailedInput(null);
    if (!textToSend) setInputValue('');
    if (showProfilePanel) setShowProfilePanel(false);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setIsLoading(true);

    try {
      const apiMessages = nextHistory
        .filter(m => !m.isError && m.id !== 'welcome-msg')
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          clientState: {
            cart,
            wishlist,
            recentlyViewed,
            customerProfile,
            orderHistory,
            promoCode,
            pendingOrderConfirmation: chatMeta.pendingOrderConfirmation,
            pendingPaymentMethod: chatMeta.pendingPaymentMethod,
            lastDisplayedProductIds: chatMeta.lastDisplayedProductIds
          }
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Unable to connect to the Fragrance Concierge.');
      }

      // Sync updated shopping state back to ShopContext & LocalStorage
      if (data.updatedState) {
        syncStateFromAssistant({
          cart: data.updatedState.cart,
          wishlist: data.updatedState.wishlist,
          customerProfile: data.updatedState.customerProfile,
          orderHistory: data.updatedState.orderHistory,
          promoCode: data.updatedState.promoCode
        });

        setChatMeta({
          pendingOrderConfirmation: Boolean(data.updatedState.pendingOrderConfirmation),
          pendingPaymentMethod:
            data.updatedState.pendingPaymentMethod === 'card_demo' ? 'card_demo' : 'cod',
          lastDisplayedProductIds: Array.isArray(data.updatedState.lastDisplayedProductIds)
            ? data.updatedState.lastDisplayedProductIds
            : chatMeta.lastDisplayedProductIds
        });
      }

      // Execute any UI commands requested by the assistant
      if (Array.isArray(data.uiCommands)) {
        for (const cmd of data.uiCommands) {
          if (cmd.type === 'OPEN_PRODUCT' && cmd.productId) {
            const p = cms.products.find(x => x.id === cmd.productId);
            if (p) openQuickView(p);
          } else if (cmd.type === 'OPEN_CART') {
            setCartOpen(true);
          } else if (cmd.type === 'OPEN_WISHLIST') {
            setWishlistOpen(true);
          } else if (cmd.type === 'OPEN_CHECKOUT') {
            setCheckoutOpen(true);
          } else if (cmd.type === 'FILTER_STORE') {
            if (cmd.category) setSelectedCategory(cmd.category as any);
            if (cmd.searchQuery !== undefined) setSearchQuery(cmd.searchQuery);
            const grid = document.getElementById('collection-grid');
            if (grid) grid.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        products: data.displayedProducts,
        comparison: data.comparisonProducts,
        cartSnapshot: data.cartSnapshot,
        orderSummary: data.orderSummary,
        confirmedOrder: data.confirmedOrder,
        orderHistory: data.orderHistory
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errorText =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setLastFailedInput(trimmed);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: errorText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    const fresh = [createWelcomeMessage(customerProfile.fullName)];
    setMessages(fresh);
    setChatMeta({
      pendingOrderConfirmation: false,
      pendingPaymentMethod: 'cod',
      lastDisplayedProductIds: []
    });
    setLastFailedInput(null);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerProfile({
      fullName: profileForm.fullName,
      phone: profileForm.phone,
      email: profileForm.email,
      address: profileForm.address,
      city: profileForm.city
    });
    setProfileSavedFlash(true);
    setTimeout(() => setProfileSavedFlash(false), 1800);
  };

  const quickPrompts = [
    'Show best sellers',
    'Oud under ₨ 30,000',
    'Compare Oud Royale & Golden Oud',
    'Show my cart',
    'Track my orders'
  ];

  return (
    <>
      {/* Floating Concierge Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(true)}
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
                Shop, Compare & Order
              </span>
            </div>
            {cartCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#141414] text-[10px] font-bold flex items-center justify-center font-mono tabular-nums">
                {cartCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Popup Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Maison d'Or AI Shopping Assistant"
            className="fixed inset-3 sm:inset-auto sm:bottom-5 sm:right-5 sm:w-[420px] md:w-[450px] sm:h-[min(660px,86vh)] z-50 flex flex-col bg-[#FAF8F5] text-[#141414] rounded-xl shadow-2xl border border-[#D4AF37]/45 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#141414] text-[#FAF8F5] px-4 py-3.5 flex items-center justify-between border-b border-[#2B261F] shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#24201A] border border-[#D4AF37]/50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-serif-luxury text-lg font-medium tracking-wide text-white leading-tight truncate">
                    Aurèle · Concierge
                  </h2>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#C5B8A5] truncate">
                    {customerProfile.fullName
                      ? `Assisting ${customerProfile.fullName}`
                      : 'Personal Shopping Assistant'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setShowProfilePanel(!showProfilePanel)}
                  title="Customer Profile & Orders"
                  aria-label="Customer Profile & Orders"
                  className={`p-2 rounded-full transition-colors ${
                    showProfilePanel
                      ? 'bg-[#D4AF37] text-[#141414]'
                      : 'text-[#C5B8A5] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <User className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClearChat}
                  title="Clear Conversation"
                  aria-label="Clear conversation history"
                  className="p-2 rounded-full text-[#C5B8A5] hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close assistant"
                  className="p-2 rounded-full text-[#C5B8A5] hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Collapsible Profile & Orders Manager View */}
            {showProfilePanel ? (
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-[#FAF8F5]">
                <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
                  <div>
                    <h3 className="font-serif-luxury text-xl font-medium text-[#141414]">
                      Your Boutique Profile
                    </h3>
                    <p className="text-[11px] text-[#5C544D] font-mono">
                      Customer ID: {customerProfile.customerId}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowProfilePanel(false)}
                    className="text-xs font-medium text-[#6E561E] hover:underline"
                  >
                    Back to Chat
                  </button>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-3 bg-white p-4 rounded-lg border border-[#E8E2D9]">
                  <div>
                    <label
                      htmlFor="profile-fullName"
                      className="text-[10px] uppercase tracking-wider font-semibold text-[#5C544D] block mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      id="profile-fullName"
                      type="text"
                      value={profileForm.fullName}
                      onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      placeholder="e.g. Ayesha Khan"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D1C5] rounded-xs text-xs text-[#141414] focus:outline-hidden focus:border-[#785E19]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label
                        htmlFor="profile-phone"
                        className="text-[10px] uppercase tracking-wider font-semibold text-[#5C544D] block mb-1"
                      >
                        Contact Number
                      </label>
                      <input
                        id="profile-phone"
                        type="text"
                        value={profileForm.phone}
                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="0300 1234567"
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D1C5] rounded-xs text-xs text-[#141414] focus:outline-hidden focus:border-[#785E19]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="profile-city"
                        className="text-[10px] uppercase tracking-wider font-semibold text-[#5C544D] block mb-1"
                      >
                        City
                      </label>
                      <select
                        id="profile-city"
                        value={profileForm.city}
                        onChange={e => setProfileForm({ ...profileForm, city: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D1C5] rounded-xs text-xs text-[#141414] focus:outline-hidden focus:border-[#785E19]"
                      >
                        {PAKISTAN_CITIES.map(c => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="profile-email"
                      className="text-[10px] uppercase tracking-wider font-semibold text-[#5C544D] block mb-1"
                    >
                      Email Address
                    </label>
                    <input
                      id="profile-email"
                      type="email"
                      value={profileForm.email}
                      onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D1C5] rounded-xs text-xs text-[#141414] focus:outline-hidden focus:border-[#785E19]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="profile-address"
                      className="text-[10px] uppercase tracking-wider font-semibold text-[#5C544D] block mb-1"
                    >
                      Delivery Address
                    </label>
                    <input
                      id="profile-address"
                      type="text"
                      value={profileForm.address}
                      onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                      placeholder="House #, Street, Sector / Area"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D1C5] rounded-xs text-xs text-[#141414] focus:outline-hidden focus:border-[#785E19]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#141414] hover:bg-[#B89626] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                  >
                    {profileSavedFlash ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Profile Saved Locally</span>
                      </>
                    ) : (
                      <span>Save Delivery Details</span>
                    )}
                  </button>
                </form>

                {/* Saved Order History */}
                <div className="space-y-2.5">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[#6E561E]">
                    Saved Order History ({orderHistory.length})
                  </h4>
                  {orderHistory.length === 0 ? (
                    <p className="text-xs text-[#736B63] bg-white p-4 rounded-lg border border-[#E8E2D9]">
                      No orders placed in this browser yet. You can ask Aurèle to help you choose and order a fragrance!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {orderHistory.map(ord => (
                        <div
                          key={ord.orderNumber}
                          className="bg-white p-3.5 rounded-lg border border-[#E8E2D9] text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span className="font-mono text-[#141414]">{ord.orderNumber}</span>
                            <span className="text-[10px] uppercase tracking-wider text-[#2E7D32]">
                              {ord.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#736B63]">
                            {ord.date} · {ord.items.map(i => `${i.product.name} (${i.selectedSize} × ${i.quantity})`).join(', ')}
                          </p>
                          <div className="flex justify-between pt-1 border-t border-[#F2ECE4]">
                            <span className="text-[#8C827A]">{ord.customer.city}</span>
                            <span className="font-mono font-semibold text-[#9A7B2C] tabular-nums">
                              {formatPrice(ord.total)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Message Thread */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.role === 'user' ? 'items-end' : 'items-start'
                      } space-y-2`}
                    >
                      {/* Text Bubble */}
                      <div
                        className={`max-w-[88%] rounded-xl px-4 py-3 shadow-xs ${
                          msg.role === 'user'
                            ? 'bg-[#141414] text-[#FAF8F5] rounded-br-xs'
                            : msg.isError
                              ? 'bg-[#FFF5F5] border border-[#E57373] text-[#9B1C1C] rounded-bl-xs'
                              : 'bg-white border border-[#E8E2D9] text-[#1E1B18] rounded-bl-xs'
                        }`}
                      >
                        {msg.isError ? (
                          <div className="space-y-2 text-xs">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C0392B]" />
                              <span>{msg.text}</span>
                            </div>
                            {lastFailedInput && (
                              <button
                                onClick={() => sendMessage(lastFailedInput)}
                                className="px-3 py-1 bg-[#141414] text-white text-[11px] uppercase tracking-wider font-medium rounded-xs hover:bg-[#B89626] transition-colors"
                              >
                                Retry Request
                              </button>
                            )}
                          </div>
                        ) : (
                          <FormattedMessageText text={msg.text} />
                        )}

                        <span
                          className={`block text-[9px] mt-1.5 ${
                            msg.role === 'user' ? 'text-[#A89E92] text-right' : 'text-[#9E958A]'
                          }`}
                        >
                          {msg.timestamp}
                        </span>
                      </div>

                      {/* Rich Product Cards Inside Chat */}
                      {msg.products && msg.products.length > 0 && (
                        <div className="w-full space-y-2">
                          {msg.products.map((prod) => {
                            const saved = isWishlisted(prod.id);
                            const isAdded = addedIds[prod.id];
                            return (
                              <div
                                key={prod.id}
                                className="bg-white border border-[#E8E2D9] rounded-lg p-3 flex gap-3 shadow-xs hover:border-[#D4AF37]/60 transition-colors"
                              >
                                <div
                                  onClick={() => openQuickView(prod)}
                                  className="w-16 h-20 rounded-xs overflow-hidden bg-[#141414] shrink-0 cursor-pointer"
                                >
                                  <CmsImage
                                    src={prod.image}
                                    alt={prod.name}
                                    width={64}
                                    height={80}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between gap-1">
                                      <h3
                                        onClick={() => openQuickView(prod)}
                                        className="font-serif-luxury text-base font-semibold text-[#141414] truncate cursor-pointer hover:text-[#785E19]"
                                      >
                                        {prod.name}
                                      </h3>
                                      <span className="flex items-center text-[11px] font-mono text-[#141414] shrink-0">
                                        <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37] mr-0.5" />
                                        {prod.rating.toFixed(1)}
                                      </span>
                                    </div>
                                    <p className="text-[10px] uppercase tracking-wider text-[#8A8075]">
                                      {prod.fragranceFamily} · {prod.subtitle}
                                    </p>
                                    <p className="text-[11px] text-[#5C554E] line-clamp-1 mt-0.5">
                                      {prod.notes.top.slice(0, 2).join(', ')}, {prod.notes.heart[0]}
                                    </p>
                                  </div>

                                  <div className="flex items-center justify-between gap-2 pt-2">
                                    <div>
                                      <span className="font-mono text-xs font-bold text-[#141414] tabular-nums">
                                        {formatPrice(prod.price)}
                                      </span>
                                      <span className="text-[10px] text-[#8C827A] ml-1">
                                        (from {formatPrice(Math.min(...prod.sizes.map(s => s.price)))})
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => toggleWishlist(prod.id)}
                                        aria-label={`Save ${prod.name}`}
                                        className="p-1.5 border border-[#E0D7CC] rounded-xs hover:bg-[#FAF8F5]"
                                      >
                                        <Heart
                                          className={`w-3.5 h-3.5 ${
                                            saved ? 'fill-[#C0392B] text-[#C0392B]' : 'text-[#5C554E]'
                                          }`}
                                        />
                                      </button>
                                      <button
                                        onClick={() => openQuickView(prod)}
                                        aria-label={`View ${prod.name}`}
                                        className="p-1.5 border border-[#E0D7CC] rounded-xs hover:bg-[#FAF8F5]"
                                      >
                                        <Eye className="w-3.5 h-3.5 text-[#5C554E]" />
                                      </button>
                                      <button
                                        onClick={() => handleQuickAdd(prod)}
                                        className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-xs transition-colors flex items-center gap-1 ${
                                          isAdded
                                            ? 'bg-[#2E7D32] text-white'
                                            : 'bg-[#141414] hover:bg-[#B89626] text-white'
                                        }`}
                                      >
                                        {isAdded ? (
                                          <>
                                            <Check className="w-3 h-3" />
                                            <span>Added</span>
                                          </>
                                        ) : (
                                          <>
                                            <ShoppingBag className="w-3 h-3" />
                                            <span>Add</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Side-by-Side Comparison Card */}
                      {msg.comparison && msg.comparison.length >= 2 && (
                        <div className="w-full bg-white border border-[#E8E2D9] rounded-lg overflow-hidden shadow-xs text-[11px]">
                          <div className="bg-[#F2ECE4] px-3 py-2 border-b border-[#E2D8CC] font-semibold text-[#8C7335] uppercase tracking-wider text-[10px]">
                            Olfactory Comparison
                          </div>
                          <div className="grid grid-cols-2 divide-x divide-[#EAE3D9]">
                            {msg.comparison.slice(0, 2).map((p) => (
                              <div key={p.id} className="p-3 space-y-2">
                                <div className="aspect-[4/3] rounded-xs overflow-hidden bg-[#141414]">
                                  <CmsImage
                                    src={p.image}
                                    alt={p.name}
                                    width={200}
                                    height={150}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <h3 className="font-serif-luxury text-sm font-semibold text-[#141414]">
                                    {p.name}
                                  </h3>
                                  <p className="font-mono font-bold text-[#9A7B2C] tabular-nums">
                                    {formatPrice(p.price)}
                                  </p>
                                </div>
                                <div className="space-y-1 text-[10px] text-[#5C554E]">
                                  <p>
                                    <strong className="text-[#141414]">Family:</strong> {p.fragranceFamily}
                                  </p>
                                  <p>
                                    <strong className="text-[#141414]">Longevity:</strong> {p.longevity}
                                  </p>
                                  <p>
                                    <strong className="text-[#141414]">Sillage:</strong> {p.sillage}
                                  </p>
                                  <p>
                                    <strong className="text-[#141414]">Notes:</strong>{' '}
                                    {p.notes.top[0]}, {p.notes.heart[0]}, {p.notes.base[0]}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleQuickAdd(p)}
                                  className="w-full py-1.5 bg-[#141414] hover:bg-[#B89626] text-white text-[10px] font-semibold uppercase tracking-wider rounded-xs transition-colors"
                                >
                                  Add 100ml
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Live Cart Snapshot Card */}
                      {msg.cartSnapshot && (
                        <div className="w-full bg-white border border-[#E8E2D9] rounded-lg p-3.5 space-y-2.5 shadow-xs text-xs">
                          <div className="flex items-center justify-between border-b border-[#F2ECE4] pb-2">
                            <span className="font-semibold uppercase tracking-wider text-[10px] text-[#8C7335] flex items-center gap-1.5">
                              <ShoppingBag className="w-3.5 h-3.5" /> Shopping Bag Summary
                            </span>
                            <button
                              onClick={() => setCartOpen(true)}
                              className="text-[11px] text-[#141414] hover:text-[#9A7B2C] underline"
                            >
                              Open Drawer
                            </button>
                          </div>

                          {msg.cartSnapshot.items.length === 0 ? (
                            <p className="text-[#736B63] text-[11px]">Your shopping bag is currently empty.</p>
                          ) : (
                            <>
                              <div className="space-y-1.5">
                                {msg.cartSnapshot.items.map((item) => (
                                  <div key={item.id} className="flex justify-between text-[11px]">
                                    <span className="text-[#141414]">
                                      {item.product.name} ({item.selectedSize}) × {item.quantity}
                                    </span>
                                    <span className="font-mono font-medium tabular-nums">
                                      {formatPrice(item.unitPrice * item.quantity)}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              <div className="pt-2 border-t border-[#F2ECE4] space-y-1 text-[11px]">
                                {msg.cartSnapshot.discountAmount > 0 && (
                                  <div className="flex justify-between text-[#2E7D32]">
                                    <span>Discount ({msg.cartSnapshot.discountCode})</span>
                                    <span className="font-mono tabular-nums">
                                      - {formatPrice(msg.cartSnapshot.discountAmount)}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between text-[#736B63]">
                                  <span>Courier</span>
                                  <span className="font-mono tabular-nums">
                                    {msg.cartSnapshot.shippingFee === 0
                                      ? 'Complimentary'
                                      : formatPrice(msg.cartSnapshot.shippingFee)}
                                  </span>
                                </div>
                                <div className="flex justify-between font-semibold text-xs text-[#141414] pt-1">
                                  <span>Total</span>
                                  <span className="font-mono text-[#9A7B2C] tabular-nums">
                                    {formatPrice(msg.cartSnapshot.total)}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => sendMessage('I want to place my order now.')}
                                className="w-full py-2 bg-[#141414] hover:bg-[#B89626] text-white text-[10px] font-semibold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-1.5"
                              >
                                <span>Proceed to Checkout via Chat</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {/* Pending Order Summary Awaiting Explicit Confirmation */}
                      {msg.orderSummary && (
                        <div className="w-full bg-[#FAF8F5] border-2 border-[#D4AF37] rounded-lg p-4 space-y-3 shadow-sm text-xs">
                          <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-2">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C7335]">
                              Order Confirmation Required
                            </span>
                            <span className="text-[10px] font-mono text-[#736B63]">
                              {msg.orderSummary.paymentMethod === 'cod' ? 'COD' : 'Card Demo'}
                            </span>
                          </div>

                          <div className="space-y-1 text-[11px]">
                            {msg.orderSummary.items.map((item) => (
                              <div key={item.id} className="flex justify-between">
                                <span>
                                  {item.product.name} ({item.selectedSize}) × {item.quantity}
                                </span>
                                <span className="font-mono font-medium tabular-nums">
                                  {formatPrice(item.unitPrice * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="bg-white p-2.5 rounded-xs border border-[#EAE3D9] text-[11px] space-y-1 text-[#5C554E]">
                            <p className="font-semibold text-[#141414]">
                              {msg.orderSummary.customer.fullName}
                            </p>
                            <p className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#8C7335]" />
                              {msg.orderSummary.customer.phone}
                            </p>
                            {msg.orderSummary.customer.email && (
                              <p className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-[#8C7335]" />
                                {msg.orderSummary.customer.email}
                              </p>
                            )}
                            <p className="flex items-start gap-1">
                              <MapPin className="w-3 h-3 text-[#8C7335] shrink-0 mt-0.5" />
                              <span>
                                {msg.orderSummary.customer.address}, {msg.orderSummary.customer.city}
                              </span>
                            </p>
                          </div>

                          <div className="flex justify-between items-center font-semibold text-sm pt-1 border-t border-[#E8E2D9]">
                            <span>Payable Total</span>
                            <span className="font-mono text-[#9A7B2C] tabular-nums">
                              {formatPrice(msg.orderSummary.total)}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => sendMessage('I want to change my delivery details.')}
                              disabled={isLoading}
                              className="py-2 px-3 border border-[#C5B8A5] hover:bg-white text-[#141414] text-[10px] font-semibold uppercase tracking-wider rounded-xs transition-colors"
                            >
                              Edit Details
                            </button>
                            <button
                              onClick={() => sendMessage('Yes, confirm and place my order.')}
                              disabled={isLoading}
                              className="py-2 px-3 bg-[#141414] hover:bg-[#2E7D32] text-white text-[10px] font-semibold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-1"
                            >
                              <PackageCheck className="w-3.5 h-3.5" />
                              <span>Confirm Order</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Confirmed Order Receipt */}
                      {msg.confirmedOrder && (
                        <div className="w-full bg-white border border-[#2E7D32]/40 rounded-lg p-4 space-y-2.5 shadow-xs text-xs">
                          <div className="flex items-center gap-2 text-[#2E7D32] font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Order Confirmed · {msg.confirmedOrder.orderNumber}</span>
                          </div>
                          <div className="text-[11px] text-[#5C554E] space-y-1">
                            <p>
                              <strong className="text-[#141414]">Status:</strong> {msg.confirmedOrder.status}
                            </p>
                            <p>
                              <strong className="text-[#141414]">Deliver to:</strong>{' '}
                              {msg.confirmedOrder.customer.fullName} — {msg.confirmedOrder.customer.address},{' '}
                              {msg.confirmedOrder.customer.city}
                            </p>
                            <p>
                              <strong className="text-[#141414]">Total:</strong>{' '}
                              <span className="font-mono font-bold text-[#9A7B2C] tabular-nums">
                                {formatPrice(msg.confirmedOrder.total)}
                              </span>
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Order History Card */}
                      {msg.orderHistory && msg.orderHistory.length > 0 && (
                        <div className="w-full space-y-2">
                          {msg.orderHistory.slice(0, 4).map((ord) => (
                            <div
                              key={ord.orderNumber}
                              className="bg-white border border-[#E8E2D9] rounded-lg p-3 text-[11px] space-y-1 shadow-xs"
                            >
                              <div className="flex justify-between font-semibold">
                                <span className="font-mono text-[#141414]">{ord.orderNumber}</span>
                                <span className="text-[#2E7D32] uppercase tracking-wider text-[10px]">
                                  {ord.status}
                                </span>
                              </div>
                              <p className="text-[#736B63]">
                                {ord.date} · {ord.items.map(i => `${i.product.name} (${i.selectedSize} × ${i.quantity})`).join(', ')}
                              </p>
                              <div className="flex justify-between pt-1 border-t border-[#F2ECE4]">
                                <span className="text-[#8C827A]">{ord.customer.city}</span>
                                <span className="font-mono font-bold text-[#9A7B2C] tabular-nums">
                                  {formatPrice(ord.total)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isLoading && (
                    <div className="flex items-start">
                      <div className="bg-white border border-[#E8E2D9] rounded-xl rounded-bl-xs px-4 py-3 shadow-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Action Prompts */}
                <div className="px-3 py-2 border-t border-[#EAE3D9] bg-[#F5F1EB] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      disabled={isLoading}
                      className="px-2.5 py-1 bg-white hover:bg-[#141414] hover:text-white text-[#4A443E] border border-[#DFD7CA] rounded-full text-[11px] whitespace-nowrap shrink-0 transition-colors disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="p-3 bg-white border-t border-[#E8E2D9] flex items-center gap-2 shrink-0"
                >
                  <label htmlFor="chat-message-input" className="sr-only">
                    Message Aurèle Fragrance Concierge
                  </label>
                  <input
                    id="chat-message-input"
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask for scents, add to bag, or place an order..."
                    disabled={isLoading}
                    className="flex-1 px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D9D1C5] rounded-lg text-xs sm:text-sm text-[#141414] placeholder-[#5E564E] focus:outline-hidden focus:border-[#785E19] disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    aria-label="Send message"
                    className="p-2.5 rounded-lg bg-[#141414] hover:bg-[#B89626] text-[#FAF8F5] transition-colors disabled:opacity-40 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
