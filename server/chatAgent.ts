import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import type { Content } from '@google/genai';
import {
  PERFUMES_DATA,
  COLLECTIONS_DATA,
  FRAGRANCE_NOTES_CATEGORIES
} from '../src/data/perfumes.ts';
import type {
  PerfumeProduct,
  CartItem,
  CustomerProfile,
  OrderRecord,
  CartSnapshot,
  PendingOrderSummary
} from '../src/types/perfume.ts';

const FREE_SHIPPING_THRESHOLD = 15000;
const STANDARD_SHIPPING_FEE = 450;
const PROMO_CODE_MAISON15 = 'MAISON15';
const PROMO_MIN_SUBTOTAL = 20000;

export interface ClientShopState {
  cart: CartItem[];
  wishlist: string[];
  recentlyViewed: string[];
  customerProfile: CustomerProfile;
  orderHistory: OrderRecord[];
  promoCode: string | null;
  pendingOrderConfirmation?: boolean;
  pendingPaymentMethod?: 'cod' | 'card_demo';
  lastDisplayedProductIds?: string[];
}

export interface ChatTurnInput {
  role: 'user' | 'assistant';
  text: string;
}

export interface UiCommand {
  type: 'OPEN_PRODUCT' | 'OPEN_CART' | 'OPEN_WISHLIST' | 'OPEN_CHECKOUT' | 'FILTER_STORE';
  productId?: string;
  category?: string;
  searchQuery?: string;
}

export interface ChatAgentResult {
  reply: string;
  updatedState: ClientShopState;
  displayedProducts?: PerfumeProduct[];
  comparisonProducts?: PerfumeProduct[];
  cartSnapshot?: CartSnapshot;
  orderSummary?: PendingOrderSummary;
  confirmedOrder?: OrderRecord;
  orderHistory?: OrderRecord[];
  uiCommands: UiCommand[];
}

interface PlannedAction {
  type:
    | 'add_to_cart'
    | 'update_cart_item'
    | 'clear_cart'
    | 'apply_promo'
    | 'manage_wishlist'
    | 'update_profile'
    | 'prepare_order'
    | 'confirm_order'
    | 'ui_command';
  productId?: string;
  size?: string;
  quantity?: number;
  target?: string;
  newQuantity?: number;
  delta?: number;
  remove?: boolean;
  code?: string;
  wishlistAction?: 'add' | 'remove';
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  paymentMethod?: 'cod' | 'card_demo';
  uiAction?: 'OPEN_PRODUCT' | 'OPEN_CART' | 'OPEN_WISHLIST' | 'OPEN_CHECKOUT' | 'FILTER_STORE';
  category?: string;
  searchQuery?: string;
}

interface AgentJsonOutput {
  reply: string;
  actions?: PlannedAction[];
  displayProductIds?: string[];
  compareProductIds?: string[];
  showCart?: boolean;
  showWishlist?: boolean;
  showOrderHistory?: boolean;
  trackOrderNumber?: string;
}

let cachedAi: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    const err = new Error('GEMINI_API_KEY is not configured on the server.');
    (err as Error & { statusCode?: number }).statusCode = 500;
    throw err;
  }
  if (!cachedAi) {
    cachedAi = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return cachedAi;
}

function normalizeStr(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function findProductByIdOrName(query: string): PerfumeProduct | undefined {
  const q = normalizeStr(query);
  if (!q) return undefined;

  const exact = PERFUMES_DATA.find(
    p => normalizeStr(p.id) === q || normalizeStr(p.name) === q
  );
  if (exact) return exact;

  const partial = PERFUMES_DATA.find(
    p => normalizeStr(p.name).includes(q) || q.includes(normalizeStr(p.name))
  );
  if (partial) return partial;

  let best: { product: PerfumeProduct; dist: number } | null = null;
  for (const p of PERFUMES_DATA) {
    const nameNorm = normalizeStr(p.name);
    const dist = levenshtein(q, nameNorm);
    const threshold = Math.max(2, Math.floor(nameNorm.length * 0.35));
    if (dist <= threshold && (!best || dist < best.dist)) {
      best = { product: p, dist };
    }
  }
  return best?.product;
}

function computeCartSnapshot(cart: CartItem[], promoCode: string | null): CartSnapshot {
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discountAmount =
    promoCode === PROMO_CODE_MAISON15 && subtotal >= PROMO_MIN_SUBTOTAL
      ? Math.round(subtotal * 0.15)
      : 0;
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const shippingFee =
    subtotal === 0 ? 0 : afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const total = afterDiscount + shippingFee;
  return {
    items: cart,
    subtotal,
    discountCode: discountAmount > 0 ? promoCode : null,
    discountAmount,
    shippingFee,
    total
  };
}

function sanitizeWorkingState(raw: ClientShopState): ClientShopState {
  const validCart: CartItem[] = [];
  const seen = new Map<string, CartItem>();
  for (const item of Array.isArray(raw.cart) ? raw.cart : []) {
    const product = PERFUMES_DATA.find(p => p.id === item?.product?.id);
    if (!product) continue;
    const size =
      typeof item.selectedSize === 'string' &&
      product.sizes.some(s => s.size === item.selectedSize)
        ? item.selectedSize
        : product.sizes[product.sizes.length - 1].size;
    const sizeCfg = product.sizes.find(s => s.size === size);
    const unitPrice = sizeCfg ? sizeCfg.price : product.price;
    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const id = `${product.id}-${size}`;
    const existing = seen.get(id);
    if (existing) {
      existing.quantity += qty;
    } else {
      const cleanItem: CartItem = {
        id,
        product,
        selectedSize: size,
        unitPrice,
        quantity: qty
      };
      seen.set(id, cleanItem);
      validCart.push(cleanItem);
    }
  }

  return {
    cart: validCart,
    wishlist: (Array.isArray(raw.wishlist) ? raw.wishlist : []).filter(id =>
      PERFUMES_DATA.some(p => p.id === id)
    ),
    recentlyViewed: (Array.isArray(raw.recentlyViewed) ? raw.recentlyViewed : []).filter(id =>
      PERFUMES_DATA.some(p => p.id === id)
    ),
    customerProfile: {
      customerId:
        raw.customerProfile?.customerId || `CUS-${Math.floor(100000 + Math.random() * 900000)}`,
      fullName: raw.customerProfile?.fullName || '',
      phone: raw.customerProfile?.phone || '',
      email: raw.customerProfile?.email || '',
      address: raw.customerProfile?.address || '',
      city: raw.customerProfile?.city || 'Lahore',
      preferredNotes: Array.isArray(raw.customerProfile?.preferredNotes)
        ? raw.customerProfile.preferredNotes
        : []
    },
    orderHistory: Array.isArray(raw.orderHistory) ? raw.orderHistory : [],
    promoCode: raw.promoCode === PROMO_CODE_MAISON15 ? PROMO_CODE_MAISON15 : null,
    pendingOrderConfirmation: Boolean(raw.pendingOrderConfirmation),
    pendingPaymentMethod: raw.pendingPaymentMethod === 'card_demo' ? 'card_demo' : 'cod',
    lastDisplayedProductIds: Array.isArray(raw.lastDisplayedProductIds)
      ? raw.lastDisplayedProductIds
      : []
  };
}

// Static catalog summary cached once
const CATALOG_TEXT = PERFUMES_DATA.map(p => {
  const sizes = p.sizes.map(s => `${s.size}=₨${s.price}`).join(', ');
  return `${p.id} | ${p.name} (${p.subtitle}) | cat:${p.category} | fam:${p.fragranceFamily} | sizes:[${sizes}] | ★${p.rating}(${p.reviewCount}) | best:${Boolean(p.isBestSeller)} | new:${Boolean(p.isNewArrival)} | long:${p.longevity} | sill:${p.sillage} | notes:${[...p.notes.top, ...p.notes.heart, ...p.notes.base].join(', ')}`;
}).join('\n');

const COLLECTIONS_TEXT = COLLECTIONS_DATA.map(c => `${c.id}: ${c.name} — ${c.tagline}`).join(' | ');
const FAMILIES_TEXT = FRAGRANCE_NOTES_CATEGORIES.filter(c => c.key !== 'All')
  .map(c => c.key)
  .join(', ');

function buildSystemInstruction(state: ClientShopState): string {
  const snap = computeCartSnapshot(state.cart, state.promoCode);
  const cartText =
    state.cart.length === 0
      ? 'EMPTY'
      : state.cart
          .map(
            (i, idx) =>
              `${idx + 1}. ${i.product.id} (${i.product.name}, ${i.selectedSize}) x${i.quantity} = ₨${(i.unitPrice * i.quantity).toLocaleString('en-PK')}`
          )
          .join(' ; ') +
        ` | Subtotal: ₨${snap.subtotal} | Discount: -₨${snap.discountAmount} (${snap.discountCode || 'none'}) | Shipping: ₨${snap.shippingFee} | Total: ₨${snap.total}`;

  const p = state.customerProfile;
  const missingFields: string[] = [];
  if (!p.fullName.trim()) missingFields.push('fullName');
  if (!p.phone.trim() || p.phone.replace(/\D/g, '').length < 10) missingFields.push('phone');
  if (!p.address.trim()) missingFields.push('address');
  if (!p.city.trim()) missingFields.push('city');

  const profileText = `ID:${p.customerId} | Name:"${p.fullName || 'MISSING'}" | Phone:"${p.phone || 'MISSING'}" | Email:"${p.email || 'optional'}" | Address:"${p.address || 'MISSING'}" | City:"${p.city || 'MISSING'}" | MissingRequired:[${missingFields.join(',') || 'NONE'}]`;

  const lastShown = (state.lastDisplayedProductIds || [])
    .map((id, i) => `${i + 1}:${id}`)
    .join(', ');

  const ordersText =
    state.orderHistory.length === 0
      ? 'NONE'
      : state.orderHistory
          .slice(0, 5)
          .map(
            o =>
              `${o.orderNumber} (${o.date}) Status:${o.status} Total:₨${o.total} Items:[${o.items.map(i => `${i.product.name} ${i.selectedSize}x${i.quantity}`).join(', ')}]`
          )
          .join(' | ');

  return `You are **Aurèle**, the fast, intelligent Fragrance Concierge & Shopping Manager for **Maison d'Or Parfumerie** (Pakistan, prices in PKR ₨).
Respond quickly, concisely, and naturally in the user's language (English, or Roman Urdu/Hindi if the user writes in Roman Urdu).

STRICT RULES:
1. Ground 100% in the REAL catalog and live state below. NEVER invent products, sizes, prices, stock, discounts, or order numbers. All 14 listed perfumes are IN STOCK.
2. Policies: Free courier on orders >= ₨15,000 (after discount), else ₨450. Promo code \`MAISON15\` = 15% off subtotal >= ₨20,000. COD or Prepaid Demo Card. 7-day unopened returns. Delivery: 2–4 business days. Lahore boutique: Gulberg III, M.M. Alam Road (+92-42-3571-0899).
3. If user asks for items we don't sell (e.g. watches, shoes), politely explain we are a luxury perfume boutique and offer matching scents if relevant.
4. Resolve ordinal references ("first one", "second one", "compare first two") using LastDisplayedIDs: [${lastShown || 'none'}].
5. Never re-ask for saved profile fields! Only ask for fields in MissingRequired.
6. CHECKOUT SAFETY:
   - Never emit \`confirm_order\` unless PendingOrderConfirmation is TRUE AND the user explicitly confirmed in this turn (e.g. "yes", "confirm", "place order", "confirm kro").
   - When user wants to buy/checkout and cart has items (or they ask to add+buy in the same turn) and MissingRequired is NONE, emit \`prepare_order\` (and set \`reply\` asking them to confirm the summary shown below). If MissingRequired has items, ask ONLY for those missing fields.
7. Output JSON strictly matching the schema. Always populate \`displayProductIds\` when recommending/searching perfumes so cards render in the chat UI, \`compareProductIds\` when comparing 2-3 perfumes, \`showCart: true\` when cart changes or user asks to view cart/total, and \`showOrderHistory: true\` when user asks for past/tracked orders.

LIVE STATE:
- Cart: ${cartText}
- WishlistIDs: [${state.wishlist.join(',')}]
- RecentlyViewedIDs: [${state.recentlyViewed.join(',')}]
- Profile: ${profileText}
- Orders: ${ordersText}
- PendingOrderConfirmation: ${Boolean(state.pendingOrderConfirmation)}
- Collections: ${COLLECTIONS_TEXT}
- Families: ${FAMILIES_TEXT}

OFFICIAL CATALOG (14 Perfumes):
${CATALOG_TEXT}`;
}


async function generateWithRetry(
  ai: GoogleGenAI,
  params: Parameters<GoogleGenAI['models']['generateContent']>[0]
) {
  let attempt = 0;
  let lastError: unknown;
  while (attempt < 2) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      if (status && status >= 400 && status < 500 && status !== 429) {
        throw err;
      }
      attempt++;
      if (attempt < 2) {
        await new Promise(resolve => setTimeout(resolve, 350));
      }
    }
  }
  throw lastError;
}

export async function runChatAgent(
  messages: ChatTurnInput[],
  rawClientState: ClientShopState
): Promise<ChatAgentResult> {
  const ai = getAiClient();
  const state = sanitizeWorkingState(rawClientState);

  // Keep last 8 messages for maximum speed and crisp context
  const recentMessages = messages.slice(-8);
  const contents: Content[] = recentMessages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.text }]
  }));

  const t0 = Date.now();
  const response = await generateWithRetry(ai, {
    model: 'gemini-3.1-flash-lite',
    contents,
    config: {
      systemInstruction:
        buildSystemInstruction(state) +
        `\n\nRESPONSE FORMAT (strict JSON object only, no markdown fences):
{
  "reply": "Concise helpful reply in user's language",
  "actions": [
    // optional array of objects with "type" among:
    // "add_to_cart" (productId, size?, quantity?)
    // "update_cart_item" (target: productId|itemId|"last", size?, newQuantity?, delta?, remove?)
    // "clear_cart"
    // "apply_promo" (code)
    // "manage_wishlist" (wishlistAction: "add"|"remove", productId)
    // "update_profile" (fullName?, phone?, email?, address?, city?)
    // "prepare_order" (paymentMethod?: "cod"|"card_demo")
    // "confirm_order" (paymentMethod?: "cod"|"card_demo")
    // "ui_command" (uiAction: "OPEN_PRODUCT"|"OPEN_CART"|"OPEN_WISHLIST"|"OPEN_CHECKOUT"|"FILTER_STORE", productId?, category?, searchQuery?)
  ],
  "displayProductIds": ["product-id"],
  "compareProductIds": ["id1", "id2"],
  "showCart": false,
  "showWishlist": false,
  "showOrderHistory": false,
  "trackOrderNumber": ""
}`,
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL }
    }
  });
  console.log(`[chat] gemini-3.1-flash-lite responded in ${Date.now() - t0}ms`);

  const rawText = (response.text || '{}')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '');
  let parsed: AgentJsonOutput;
  try {
    parsed = JSON.parse(rawText) as AgentJsonOutput;
  } catch {
    parsed = { reply: rawText || 'How may I assist you with our fragrance collection today?' };
  }

  let reply = (parsed.reply || '').trim() || 'How may I assist you today?';
  let displayedProducts: PerfumeProduct[] | undefined;
  let comparisonProducts: PerfumeProduct[] | undefined;
  let cartSnapshot: CartSnapshot | undefined;
  let orderSummary: PendingOrderSummary | undefined;
  let confirmedOrder: OrderRecord | undefined;
  let returnedOrderHistory: OrderRecord[] | undefined;
  const uiCommands: UiCommand[] = [];

  // Execute planned actions deterministically against real state
  const actions = Array.isArray(parsed.actions) ? parsed.actions : [];
  for (const act of actions) {
    switch (act.type) {
      case 'add_to_cart': {
        const product = act.productId ? findProductByIdOrName(act.productId) : undefined;
        if (!product) break;
        const reqSize = typeof act.size === 'string' ? normalizeStr(act.size) : '';
        let chosenSizeObj = product.sizes[product.sizes.length - 1];
        if (reqSize) {
          const matched = product.sizes.find(
            s =>
              normalizeStr(s.size) === reqSize ||
              normalizeStr(s.size).replace(/\s/g, '') === reqSize.replace(/\s/g, '')
          );
          if (matched) chosenSizeObj = matched;
        }
        const qty = Math.max(1, Math.min(20, Math.floor(Number(act.quantity) || 1)));
        const itemId = `${product.id}-${chosenSizeObj.size}`;
        const existingIdx = state.cart.findIndex(i => i.id === itemId);
        if (existingIdx >= 0) {
          state.cart[existingIdx] = {
            ...state.cart[existingIdx],
            quantity: Math.min(20, state.cart[existingIdx].quantity + qty)
          };
        } else {
          state.cart.push({
            id: itemId,
            product,
            selectedSize: chosenSizeObj.size,
            unitPrice: chosenSizeObj.price,
            quantity: qty
          });
        }
        state.pendingOrderConfirmation = false;
        cartSnapshot = computeCartSnapshot(state.cart, state.promoCode);
        break;
      }

      case 'update_cart_item': {
        if (state.cart.length === 0) break;
        const target = typeof act.target === 'string' ? act.target.trim() : '';
        const sizeArg = typeof act.size === 'string' ? normalizeStr(act.size) : '';
        let targetIdx = -1;

        if (normalizeStr(target) === 'last') {
          targetIdx = state.cart.length - 1;
        } else {
          targetIdx = state.cart.findIndex(i => i.id === target);
          if (targetIdx === -1 && target) {
            const matchedProduct = findProductByIdOrName(target);
            if (matchedProduct) {
              targetIdx = state.cart.findIndex(
                i =>
                  i.product.id === matchedProduct.id &&
                  (!sizeArg || normalizeStr(i.selectedSize) === sizeArg)
              );
            }
          }
        }
        if (targetIdx === -1) break;

        const curr = state.cart[targetIdx];
        let nextQty = curr.quantity;
        if (act.remove) {
          nextQty = 0;
        } else if (typeof act.newQuantity === 'number') {
          nextQty = Math.floor(act.newQuantity);
        } else if (typeof act.delta === 'number') {
          nextQty = curr.quantity + Math.floor(act.delta);
        }
        if (nextQty <= 0) {
          state.cart.splice(targetIdx, 1);
        } else {
          state.cart[targetIdx] = { ...curr, quantity: Math.min(20, nextQty) };
        }
        state.pendingOrderConfirmation = false;
        cartSnapshot = computeCartSnapshot(state.cart, state.promoCode);
        break;
      }

      case 'clear_cart': {
        state.cart = [];
        state.promoCode = null;
        state.pendingOrderConfirmation = false;
        cartSnapshot = computeCartSnapshot(state.cart, state.promoCode);
        break;
      }

      case 'apply_promo': {
        const code = typeof act.code === 'string' ? act.code.trim().toUpperCase() : '';
        if (!code) {
          state.promoCode = null;
        } else if (code === PROMO_CODE_MAISON15) {
          state.promoCode = PROMO_CODE_MAISON15;
        }
        cartSnapshot = computeCartSnapshot(state.cart, state.promoCode);
        break;
      }

      case 'manage_wishlist': {
        const product = act.productId ? findProductByIdOrName(act.productId) : undefined;
        if (!product) break;
        if (act.wishlistAction === 'remove') {
          state.wishlist = state.wishlist.filter(id => id !== product.id);
        } else {
          if (!state.wishlist.includes(product.id)) state.wishlist.push(product.id);
        }
        break;
      }

      case 'update_profile': {
        if (typeof act.fullName === 'string' && act.fullName.trim()) {
          state.customerProfile.fullName = act.fullName.trim();
        }
        if (typeof act.phone === 'string' && act.phone.trim()) {
          state.customerProfile.phone = act.phone.trim();
        }
        if (typeof act.email === 'string' && act.email.trim()) {
          state.customerProfile.email = act.email.trim();
        }
        if (typeof act.address === 'string' && act.address.trim()) {
          state.customerProfile.address = act.address.trim();
        }
        if (typeof act.city === 'string' && act.city.trim()) {
          state.customerProfile.city = act.city.trim();
        }
        break;
      }

      case 'prepare_order': {
        if (state.cart.length === 0) break;
        const p = state.customerProfile;
        const missing: string[] = [];
        if (!p.fullName.trim()) missing.push('full name');
        if (!p.phone.trim() || p.phone.replace(/\D/g, '').length < 10) missing.push('contact number');
        if (!p.address.trim()) missing.push('delivery address');
        if (!p.city.trim()) missing.push('city');

        if (missing.length > 0) {
          reply = `Before I prepare your order summary, could you please share your ${missing.join(', ')}?`;
          break;
        }

        const pm = act.paymentMethod === 'card_demo' ? 'card_demo' : 'cod';
        const snap = computeCartSnapshot(state.cart, state.promoCode);
        state.pendingOrderConfirmation = true;
        state.pendingPaymentMethod = pm;
        orderSummary = {
          ...snap,
          paymentMethod: pm,
          customer: { ...p }
        };
        break;
      }

      case 'confirm_order': {
        // Guardrail: must have pending confirmation AND non-empty cart AND valid profile
        const p = state.customerProfile;
        const hasValidProfile =
          Boolean(p.fullName.trim()) &&
          p.phone.replace(/\D/g, '').length >= 10 &&
          Boolean(p.address.trim()) &&
          Boolean(p.city.trim());

        if (!state.pendingOrderConfirmation || state.cart.length === 0 || !hasValidProfile) {
          if (state.cart.length > 0 && hasValidProfile) {
            // Prepare summary instead of placing prematurely
            const pm = act.paymentMethod === 'card_demo' ? 'card_demo' : 'cod';
            const snap = computeCartSnapshot(state.cart, state.promoCode);
            state.pendingOrderConfirmation = true;
            state.pendingPaymentMethod = pm;
            orderSummary = { ...snap, paymentMethod: pm, customer: { ...p } };
            reply = 'Please review your order summary below and confirm to place your order.';
          }
          break;
        }

        const pm =
          act.paymentMethod === 'card_demo' || state.pendingPaymentMethod === 'card_demo'
            ? 'card_demo'
            : 'cod';
        const snap = computeCartSnapshot(state.cart, state.promoCode);
        const now = new Date();
        const orderNumber = `MD-${Math.floor(100000 + Math.random() * 900000)}`;

        const newOrder: OrderRecord = {
          orderNumber,
          createdAt: now.toISOString(),
          date: now.toLocaleDateString('en-PK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          items: [...state.cart],
          subtotal: snap.subtotal,
          discountCode: snap.discountCode,
          discountAmount: snap.discountAmount,
          shippingFee: snap.shippingFee,
          total: snap.total,
          paymentMethod: pm,
          status: 'Preparing Shipment',
          customer: {
            fullName: p.fullName,
            phone: p.phone,
            email: p.email || '',
            address: p.address,
            city: p.city
          }
        };

        state.orderHistory = [newOrder, ...state.orderHistory];
        state.cart = [];
        state.promoCode = null;
        state.pendingOrderConfirmation = false;
        confirmedOrder = newOrder;
        break;
      }

      case 'ui_command': {
        if (!act.uiAction) break;
        if (act.uiAction === 'OPEN_PRODUCT' && act.productId) {
          const prod = findProductByIdOrName(act.productId);
          if (prod) uiCommands.push({ type: 'OPEN_PRODUCT', productId: prod.id });
        } else if (
          act.uiAction === 'OPEN_CART' ||
          act.uiAction === 'OPEN_WISHLIST' ||
          act.uiAction === 'OPEN_CHECKOUT'
        ) {
          uiCommands.push({ type: act.uiAction });
        } else if (act.uiAction === 'FILTER_STORE') {
          uiCommands.push({
            type: 'FILTER_STORE',
            category: act.category,
            searchQuery: act.searchQuery
          });
        }
        break;
      }
    }
  }

  // Hydrate UI cards from validated catalog IDs
  if (Array.isArray(parsed.compareProductIds) && parsed.compareProductIds.length >= 2) {
    const comp = parsed.compareProductIds
      .map(id => findProductByIdOrName(id))
      .filter((p): p is PerfumeProduct => Boolean(p));
    if (comp.length >= 2) {
      comparisonProducts = comp.slice(0, 3);
      state.lastDisplayedProductIds = comparisonProducts.map(p => p.id);
    }
  }

  if (Array.isArray(parsed.displayProductIds) && parsed.displayProductIds.length > 0) {
    const prods = parsed.displayProductIds
      .map(id => findProductByIdOrName(id))
      .filter((p): p is PerfumeProduct => Boolean(p));
    if (prods.length > 0) {
      displayedProducts = prods.slice(0, 6);
      state.lastDisplayedProductIds = displayedProducts.map(p => p.id);
    }
  }

  if (parsed.showWishlist) {
    const wishProds = PERFUMES_DATA.filter(p => state.wishlist.includes(p.id));
    if (wishProds.length > 0) {
      displayedProducts = wishProds;
      state.lastDisplayedProductIds = wishProds.map(p => p.id);
    }
  }

  if (parsed.showCart && !cartSnapshot && !orderSummary && !confirmedOrder) {
    cartSnapshot = computeCartSnapshot(state.cart, state.promoCode);
  }

  if (parsed.showOrderHistory || parsed.trackOrderNumber) {
    if (parsed.trackOrderNumber) {
      const targetOrd = parsed.trackOrderNumber.trim().toUpperCase();
      const matched = state.orderHistory.filter(o => o.orderNumber.toUpperCase() === targetOrd);
      if (matched.length > 0) returnedOrderHistory = matched;
    } else if (state.orderHistory.length > 0) {
      returnedOrderHistory = state.orderHistory;
    }
  }

  return {
    reply,
    updatedState: state,
    displayedProducts,
    comparisonProducts,
    cartSnapshot,
    orderSummary,
    confirmedOrder,
    orderHistory: returnedOrderHistory,
    uiCommands
  };
}
