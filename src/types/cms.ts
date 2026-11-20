import type {
  PerfumeProduct,
  CollectionItem,
  CustomerReview,
  FragranceCategory
} from './perfume';

export type MediaFolder =
  | 'Hero & Banners'
  | 'Products'
  | 'Collections'
  | 'Videos'
  | 'General';

export interface MediaItemMeta {
  id: string;
  name: string;
  mediaType: 'image' | 'video';
  mimeType: string;
  sizeBytes: number;
  folder: MediaFolder;
  src: string; // '/images/...' | 'https://...' | 'idb://<id>'
  isBuiltIn?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementItem {
  id: string;
  text: string;
  linkLabel: string;
  linkHref: string;
  enabled: boolean;
}

export interface NavLinkItem {
  id: string;
  label: string;
  href: string;
  categoryFilter?: FragranceCategory;
  accent?: boolean;
  visible: boolean;
}

export interface HeroMetricItem {
  id: string;
  value: string;
  label: string;
}

export interface HeroContent {
  kicker: string;
  locationLabel: string;
  headlinePrefix: string;
  headlineAccent: string;
  quote: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  heroImage: string;
  featuredLabel: string;
  featuredTitle: string;
  featuredNotes: string;
  featuredPrice: string;
  metrics: HeroMetricItem[];
}

export interface SectionHeaderBlock {
  kicker: string;
  title: string;
  subtitle: string;
  visible: boolean;
}

export interface BestSellersSectionHeader extends SectionHeaderBlock {
  promoEyebrow: string;
  promoTitle: string;
  promoCode: string;
  promoDescription: string;
  promoCtaLabel: string;
  promoCtaHref: string;
}

export interface ReviewsSectionHeader extends SectionHeaderBlock {
  disclaimer: string;
}

export interface NewsletterSectionHeader extends SectionHeaderBlock {
  placeholder: string;
  buttonLabel: string;
  disclaimer: string;
}

export interface SectionHeadersContent {
  collections: SectionHeaderBlock;
  catalog: SectionHeaderBlock;
  scentFinder: SectionHeaderBlock;
  bestSellers: BestSellersSectionHeader;
  reviews: ReviewsSectionHeader;
  newsletter: NewsletterSectionHeader;
}

export interface AtelierPillar {
  id: string;
  title: string;
  description: string;
  icon: 'droplets' | 'feather' | 'shield';
}

export interface AtelierContent {
  visible: boolean;
  kicker: string;
  title: string;
  paragraphs: string[];
  image: string;
  archiveLabel: string;
  quote: string;
  quoteAuthor: string;
  pillars: AtelierPillar[];
}

export interface CustomSectionItem {
  id: string;
  kicker: string;
  title: string;
  description: string;
  body: string;
  layout: 'split-left' | 'split-right' | 'centered-banner' | 'video-showcase';
  theme: 'light' | 'dark';
  mediaUrl: string;
  mediaType: 'image' | 'video';
  ctaLabel: string;
  ctaHref: string;
  badgeText?: string;
  visible: boolean;
  order: number;
  updatedAt: string;
}

export interface SiteThemeColors {
  background: string;
  surface: string;
  text: string;
  accent: string;
  darkBg: string;
}

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  footerTagline: string;
  logoUrl: string;
  faviconUrl: string;
  seoTitle: string;
  seoDescription: string;
  announcementBarEnabled: boolean;
  colors: SiteThemeColors;
  contact: {
    address: string;
    phone: string;
    email: string;
    authenticityBadge: string;
  };
  socialLinks: {
    instagram: string;
    facebook: string;
    twitter: string;
  };
  footerDescription: string;
  footerPolicies: string[];
  copyrightText: string;
}

export interface AdminCustomerUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  status: 'active' | 'blocked' | 'vip';
  ordersCount: number;
  totalSpent: number;
  notes?: string;
  joinedAt: string;
  lastActiveAt: string;
}

export interface CustomerMessageItem {
  id: string;
  senderName: string;
  email: string;
  subject: string;
  message: string;
  source: 'newsletter' | 'concierge' | 'contact';
  status: 'unread' | 'read' | 'resolved';
  createdAt: string;
  adminNote?: string;
}

export interface AdminActivityLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  details: string;
  severity: 'info' | 'warning' | 'security';
}

export interface SiteContentSchema {
  version: number;
  updatedAt: string;
  siteSettings: SiteSettings;
  announcements: AnnouncementItem[];
  navLinks: NavLinkItem[];
  hero: HeroContent;
  sectionHeaders: SectionHeadersContent;
  atelier: AtelierContent;
  collections: CollectionItem[];
  products: PerfumeProduct[];
  reviews: CustomerReview[];
  customSections: CustomSectionItem[];
  users: AdminCustomerUser[];
  messages: CustomerMessageItem[];
}
