export type FragranceCategory = 'all' | 'men' | 'women' | 'unisex' | 'oud' | 'floral' | 'signature';

export type FragranceFamily = 'Woody' | 'Floral' | 'Fresh' | 'Spicy' | 'Citrus' | 'Oud' | 'Sweet & Vanilla';

export interface PerfumeProduct {
  id: string;
  name: string;
  subtitle: string;
  brand: string;
  category: FragranceCategory;
  fragranceFamily: FragranceFamily;
  price: number; // in PKR
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  image: string;
  description: string;
  story: string;
  sizes: {
    size: string;
    price: number;
  }[];
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  longevity: string;
  sillage: string;
  season: string;
  inStock: boolean;
}

export interface CartItem {
  id: string; // product.id + '-' + size
  product: PerfumeProduct;
  selectedSize: string;
  unitPrice: number;
  quantity: number;
}

export interface CustomerReview {
  id: string;
  author: string;
  city: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  perfumeName: string;
}

export interface CollectionItem {
  id: FragranceCategory;
  name: string;
  tagline: string;
  description: string;
  image: string;
  itemCount: number;
}

export interface CustomerProfile {
  customerId: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  preferredNotes?: string[];
}

export interface OrderRecord {
  orderNumber: string;
  createdAt: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discountCode?: string | null;
  discountAmount: number;
  shippingFee: number;
  total: number;
  paymentMethod: 'cod' | 'card_demo';
  status: 'Confirmed' | 'Preparing Shipment' | 'Dispatched' | 'Delivered';
  customer: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
  };
}

export interface CartSnapshot {
  items: CartItem[];
  subtotal: number;
  discountCode: string | null;
  discountAmount: number;
  shippingFee: number;
  total: number;
}

export interface PendingOrderSummary {
  items: CartItem[];
  subtotal: number;
  discountCode: string | null;
  discountAmount: number;
  shippingFee: number;
  total: number;
  paymentMethod: 'cod' | 'card_demo';
  customer: CustomerProfile;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  products?: PerfumeProduct[];
  comparison?: PerfumeProduct[];
  cartSnapshot?: CartSnapshot;
  orderSummary?: PendingOrderSummary;
  confirmedOrder?: OrderRecord;
  orderHistory?: OrderRecord[];
  isError?: boolean;
}
