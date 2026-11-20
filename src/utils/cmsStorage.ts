import {
  IMAGES,
  PERFUMES_DATA,
  COLLECTIONS_DATA,
  CUSTOMER_REVIEWS
} from '../data/perfumes';
import type {
  SiteContentSchema,
  MediaItemMeta,
  MediaFolder
} from '../types/cms';

export const CMS_STORAGE_KEY = 'maisondor_cms_v1';
export const MEDIA_META_STORAGE_KEY = 'maisondor_media_meta_v1';
export const CMS_SCHEMA_VERSION = 1;

export function getDefaultCmsState(): SiteContentSchema {
  return {
    version: CMS_SCHEMA_VERSION,
    updatedAt: '2026-11-19T00:00:00.000Z',
    siteSettings: {
      siteName: 'MAISON D’OR',
      siteTagline: 'Haute Parfumerie · Paris',
      footerTagline: 'Haute Parfumerie · Paris & Lahore',
      logoUrl: '',
      faviconUrl: '',
      seoTitle: "Maison d'Or Parfumerie | Haute Parfumerie & Luxury Fragrances",
      seoDescription:
        "Discover signature luxury perfumes, exquisite oud, handcrafted florals, and bespoke niche fragrances from Maison d'Or. Luxury shopping in PKR with fast delivery.",
      announcementBarEnabled: true,
      colors: {
        background: '#FAF8F5',
        surface: '#FFFFFF',
        text: '#141414',
        accent: '#785E19',
        darkBg: '#141414'
      },
      contact: {
        address: 'Gulberg III, M.M. Alam Road, Lahore, Pakistan',
        phone: '+92 (042) 3571-0899',
        email: 'concierge@maisondorparfum.pk',
        authenticityBadge: '100% Genuine Ingredients Verified'
      },
      socialLinks: {
        instagram: 'https://instagram.com',
        facebook: 'https://facebook.com',
        twitter: 'https://twitter.com'
      },
      footerDescription:
        'Purveyors of bespoke artisanal fragrances, handcrafted extraits, and vintage agarwood flacons. Engineered with supreme concentration to offer lasting presence and intimate sophistication.',
      footerPolicies: [
        'Privacy Policy',
        'Terms of Haute Parfumerie',
        'Security & Authenticity'
      ],
      copyrightText: `© ${new Date().getFullYear()} Maison d’Or Parfumerie. All rights reserved.`
    },
    announcements: [
      {
        id: 'ann-1',
        text: 'Complimentary Express Courier across Pakistan on orders over ₨ 15,000',
        linkLabel: 'Explore',
        linkHref: '#collection-grid',
        enabled: true
      },
      {
        id: 'ann-2',
        text: 'Artisanal Extraits de Parfum distilled with rare Grasse botanicals & natural agarwood',
        linkLabel: 'Explore',
        linkHref: '#collection-grid',
        enabled: true
      },
      {
        id: 'ann-3',
        text: 'Cash on Delivery (COD) & secure card checkout available nationwide',
        linkLabel: 'Explore',
        linkHref: '#collection-grid',
        enabled: true
      }
    ],
    navLinks: [
      { id: 'nav-home', label: 'Home', href: '#hero', categoryFilter: 'all', visible: true },
      { id: 'nav-shop', label: 'Shop All', href: '#collection-grid', categoryFilter: 'all', visible: true },
      { id: 'nav-men', label: 'Men’s', href: '#collection-grid', categoryFilter: 'men', visible: true },
      { id: 'nav-women', label: 'Women’s', href: '#collection-grid', categoryFilter: 'women', visible: true },
      { id: 'nav-oud', label: 'Luxury Oud', href: '#collection-grid', categoryFilter: 'oud', visible: true },
      { id: 'nav-finder', label: 'Scent Finder', href: '#scent-finder', accent: true, visible: true },
      { id: 'nav-atelier', label: 'Our Atelier', href: '#brand-atelier', visible: true }
    ],
    hero: {
      kicker: 'Haute Parfumerie & Botanical Art',
      locationLabel: 'Paris & Lahore',
      headlinePrefix: 'Discover Your',
      headlineAccent: 'Signature Scent',
      quote: '“An unforgettable fragrance. A lasting impression.”',
      description:
        'Immerse yourself in artisanal extraits de parfum, where sustainably sourced Cambodian agarwood, Grasse Damask roses, and warm golden resins are hand-blended into flacons of liquid elegance.',
      primaryCtaLabel: 'Explore Collection',
      primaryCtaHref: '#collection-grid',
      secondaryCtaLabel: 'Shop Best Sellers',
      secondaryCtaHref: '#best-sellers',
      heroImage: IMAGES.hero,
      featuredLabel: 'Featured Reserve',
      featuredTitle: 'Aurélia Grand Cru',
      featuredNotes: 'Warm Amber · Saffron · Cambodian Oud',
      featuredPrice: '₨ 28,500',
      metrics: [
        { id: 'hm-1', value: '30%', label: 'Extrait Concentration' },
        { id: 'hm-2', value: '14+ Hrs', label: 'Lasting Sillage' },
        { id: 'hm-3', value: '₨ 0', label: 'Delivery over ₨ 15k' }
      ]
    },
    sectionHeaders: {
      collections: {
        kicker: 'Curated Olfactory Realms',
        title: 'Shop by Collection',
        subtitle:
          'From smoky woods and nocturnal leathers to sun-warmed Centifolia rose petals and rare aged agarwood flacons.',
        visible: true
      },
      catalog: {
        kicker: 'The Permanent Collection',
        title: 'Artisanal Flacons',
        subtitle:
          'Every bottle is hand-poured in limited runs, numbered, and macerated for optimal sillage and longevity.',
        visible: true
      },
      scentFinder: {
        kicker: 'Interactive Olfactory Finder',
        title: 'Explore by Scent Family',
        subtitle:
          'Select your preferred olfactory family to uncover fragrances tailored to your skin chemistry and aesthetic mood.',
        visible: true
      },
      bestSellers: {
        kicker: 'Crowning Achievements',
        title: 'Best Sellers & Reserve',
        subtitle: '',
        visible: true,
        promoEyebrow: 'Seasonal Collector’s Privilege',
        promoTitle: 'Enjoy 15% Off Your First Purchase with Code:',
        promoCode: 'MAISON15',
        promoDescription:
          'Applies automatically at checkout on all orders above ₨ 20,000. Includes complimentary sample vials.',
        promoCtaLabel: 'Claim Offer',
        promoCtaHref: '#collection-grid'
      },
      reviews: {
        kicker: 'Patron Reflections',
        title: 'Loved Across Pakistan',
        subtitle:
          'Genuine impressions from patrons who discovered their signature scent with Maison d’Or.',
        disclaimer:
          '* Representative customer testimonials collected from recent boutique delivery orders in Pakistan.',
        visible: true
      },
      newsletter: {
        kicker: 'The Maison d’Or Gazette',
        title: 'Privileged Invitations & Private Releases',
        subtitle:
          'Be the first to receive notifications regarding micro-batch harvests, seasonal extrait decants, and private olfactory exhibitions in Pakistan.',
        placeholder: 'Enter your email address...',
        buttonLabel: 'Subscribe',
        disclaimer: '* Saved directly to your local Maison d’Or boutique ledger.',
        visible: true
      }
    },
    atelier: {
      visible: true,
      kicker: 'Haute Parfumerie Heritage',
      title: 'The Sacred Alchemy of Scent & Memory',
      paragraphs: [
        'Founded upon the belief that fragrance is an intimate extension of one’s identity, Maison d’Or bridges the venerated perfumery traditions of Grasse and Paris with the rich, resinous treasures of the East.',
        'We eschew mass-market shortcuts and diluted bases. Each batch is slowly macerated for three lunar cycles in darkened maturation vaults, allowing wild saffron, vintage Cambodian agarwood, and delicate Centifolia rose petals to fuse into velvety, crystalline elixirs.',
        'When you wear Maison d’Or, you do not simply wear a perfume—you wear an aura that reveals distinct notes over eighteen hours of unfolding elegance.'
      ],
      image: IMAGES.atelier,
      archiveLabel: 'Maison d’Or Archives',
      quote: '“Perfume is silence speaking through time and emotion.”',
      quoteAuthor: 'Jean-Luc Mercier, Master Nose & Olfactory Architect',
      pillars: [
        {
          id: 'pil-1',
          title: 'Pure Extracts',
          description: 'Up to 32% essential fragrance concentration for unmatched sillage.',
          icon: 'droplets'
        },
        {
          id: 'pil-2',
          title: 'Hand-Poured',
          description: 'Numbered bottles sealed with weighted metallic caps and gold collars.',
          icon: 'feather'
        },
        {
          id: 'pil-3',
          title: 'Ethical Harvest',
          description: 'Cruelty-free, sustainably harvested woods, and fair-trade florals.',
          icon: 'shield'
        }
      ]
    },
    collections: COLLECTIONS_DATA,
    products: PERFUMES_DATA,
    reviews: CUSTOMER_REVIEWS,
    customSections: [],
    users: [
      {
        id: 'usr-1',
        fullName: 'Hamza Al-Rashid',
        email: 'hamza.rashid@example.pk',
        phone: '0300-4129801',
        city: 'Lahore',
        address: 'Block K, Gulberg III',
        status: 'vip',
        ordersCount: 4,
        totalSpent: 98500,
        notes: 'Prefers aged Cambodian agarwood & smoky resins.',
        joinedAt: '2026-01-12T10:15:00.000Z',
        lastActiveAt: '2026-11-16T14:22:00.000Z'
      },
      {
        id: 'usr-2',
        fullName: 'Ayesha Tariq',
        email: 'ayesha.tariq@example.pk',
        phone: '0321-8841209',
        city: 'Karachi',
        address: 'Phase 6, DHA',
        status: 'active',
        ordersCount: 2,
        totalSpent: 45500,
        notes: 'Loves Grasse Centifolia Rose & vanilla florals.',
        joinedAt: '2026-02-04T09:00:00.000Z',
        lastActiveAt: '2026-11-14T18:05:00.000Z'
      },
      {
        id: 'usr-3',
        fullName: 'Zainab Qureshi',
        email: 'zainab.qureshi@example.pk',
        phone: '0333-5520194',
        city: 'Islamabad',
        address: 'Sector F-7/2',
        status: 'vip',
        ordersCount: 3,
        totalSpent: 71000,
        notes: 'Subscribed to private extrait decant invitations.',
        joinedAt: '2026-02-19T12:30:00.000Z',
        lastActiveAt: '2026-11-10T11:45:00.000Z'
      },
      {
        id: 'usr-4',
        fullName: 'Bilal Farooqi',
        email: 'bilal.farooqi@example.pk',
        phone: '0345-9102344',
        city: 'Rawalpindi',
        address: 'Chaklala Scheme III',
        status: 'active',
        ordersCount: 1,
        totalSpent: 24000,
        notes: 'First order: Midnight Noir 100ml.',
        joinedAt: '2026-03-08T16:20:00.000Z',
        lastActiveAt: '2026-11-05T09:10:00.000Z'
      }
    ],
    messages: [
      {
        id: 'msg-1',
        senderName: 'Zainab Qureshi',
        email: 'zainab.qureshi@example.pk',
        subject: 'Private Decant Tasting Inquiry (Islamabad)',
        message: 'Could you share the dates for your next private oud & amber showcase in Islamabad?',
        source: 'concierge',
        status: 'unread',
        createdAt: '2026-11-18T11:20:00.000Z'
      },
      {
        id: 'msg-2',
        senderName: 'Saad Mahmood',
        email: 'saad.mahmood@example.pk',
        subject: 'Corporate Gift Boxes (15 Flacons)',
        message: 'We would like custom engraved 50ml Oud Royale flacons for our executive year-end gifting.',
        source: 'contact',
        status: 'read',
        createdAt: '2026-11-15T15:40:00.000Z',
        adminNote: 'Quoted bespoke velvet box engraving at 12% volume discount.'
      },
      {
        id: 'msg-3',
        senderName: 'Mariam Khan',
        email: 'mariam.k@example.pk',
        subject: 'Newsletter Subscription',
        message: 'Subscribed via Maison d’Or Gazette form.',
        source: 'newsletter',
        status: 'resolved',
        createdAt: '2026-11-12T08:15:00.000Z'
      }
    ]
  };
}

export function getDefaultMediaMeta(): MediaItemMeta[] {
  const entries: Array<{ name: string; src: string; folder: MediaFolder; sizeBytes: number }> = [
    { name: 'Aurélia Hero Flacon', src: IMAGES.hero, folder: 'Hero & Banners', sizeBytes: 65512 },
    { name: 'Parisian Atelier Portrait', src: IMAGES.atelier, folder: 'Hero & Banners', sizeBytes: 130048 },
    { name: 'Oud Royale Flacon', src: IMAGES.oudRoyale, folder: 'Products', sizeBytes: 50176 },
    { name: 'Velvet Rose Flacon', src: IMAGES.velvetRose, folder: 'Products', sizeBytes: 39936 },
    { name: 'Midnight Noir Flacon', src: IMAGES.midnightNoir, folder: 'Products', sizeBytes: 41984 },
    { name: 'Amber Essence Flacon', src: IMAGES.amberEssence, folder: 'Products', sizeBytes: 18432 },
    { name: 'White Musk Flacon', src: IMAGES.whiteMusk, folder: 'Products', sizeBytes: 27648 },
    { name: 'Golden Oud Flacon', src: IMAGES.goldenOud, folder: 'Collections', sizeBytes: 44032 },
    { name: 'Rose Élégance Flacon', src: IMAGES.roseElegance, folder: 'Collections', sizeBytes: 30720 },
    { name: 'Ocean Breeze Flacon', src: IMAGES.oceanBreeze, folder: 'Products', sizeBytes: 52224 },
    { name: 'Imperial Woods Flacon', src: IMAGES.imperialWoods, folder: 'Products', sizeBytes: 60416 },
    { name: 'Vanilla Bloom Flacon', src: IMAGES.vanillaBloom, folder: 'Products', sizeBytes: 37888 }
  ];

  return entries.map((item, idx) => ({
    id: `builtin-media-${idx + 1}`,
    name: item.name,
    mediaType: 'image',
    mimeType: 'image/webp',
    sizeBytes: item.sizeBytes,
    folder: item.folder,
    src: item.src,
    isBuiltIn: true,
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z'
  }));
}

export function loadCmsState(): SiteContentSchema {
  const defaults = getDefaultCmsState();
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(CMS_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<SiteContentSchema>;
    if (!parsed || typeof parsed !== 'object') return defaults;

    return {
      version: CMS_SCHEMA_VERSION,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : defaults.updatedAt,
      siteSettings: {
        ...defaults.siteSettings,
        ...(parsed.siteSettings || {}),
        colors: {
          ...defaults.siteSettings.colors,
          ...(parsed.siteSettings?.colors || {})
        },
        contact: {
          ...defaults.siteSettings.contact,
          ...(parsed.siteSettings?.contact || {})
        },
        socialLinks: {
          ...defaults.siteSettings.socialLinks,
          ...(parsed.siteSettings?.socialLinks || {})
        },
        footerPolicies: Array.isArray(parsed.siteSettings?.footerPolicies)
          ? parsed.siteSettings.footerPolicies
          : defaults.siteSettings.footerPolicies
      },
      announcements: Array.isArray(parsed.announcements)
        ? parsed.announcements
        : defaults.announcements,
      navLinks: Array.isArray(parsed.navLinks) ? parsed.navLinks : defaults.navLinks,
      hero: {
        ...defaults.hero,
        ...(parsed.hero || {}),
        metrics: Array.isArray(parsed.hero?.metrics) ? parsed.hero.metrics : defaults.hero.metrics
      },
      sectionHeaders: {
        collections: {
          ...defaults.sectionHeaders.collections,
          ...(parsed.sectionHeaders?.collections || {})
        },
        catalog: {
          ...defaults.sectionHeaders.catalog,
          ...(parsed.sectionHeaders?.catalog || {})
        },
        scentFinder: {
          ...defaults.sectionHeaders.scentFinder,
          ...(parsed.sectionHeaders?.scentFinder || {})
        },
        bestSellers: {
          ...defaults.sectionHeaders.bestSellers,
          ...(parsed.sectionHeaders?.bestSellers || {})
        },
        reviews: {
          ...defaults.sectionHeaders.reviews,
          ...(parsed.sectionHeaders?.reviews || {})
        },
        newsletter: {
          ...defaults.sectionHeaders.newsletter,
          ...(parsed.sectionHeaders?.newsletter || {})
        }
      },
      atelier: {
        ...defaults.atelier,
        ...(parsed.atelier || {}),
        paragraphs: Array.isArray(parsed.atelier?.paragraphs)
          ? parsed.atelier.paragraphs
          : defaults.atelier.paragraphs,
        pillars: Array.isArray(parsed.atelier?.pillars)
          ? parsed.atelier.pillars
          : defaults.atelier.pillars
      },
      collections: Array.isArray(parsed.collections) ? parsed.collections : defaults.collections,
      products: Array.isArray(parsed.products) ? parsed.products : defaults.products,
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : defaults.reviews,
      customSections: Array.isArray(parsed.customSections)
        ? parsed.customSections
        : defaults.customSections,
      users: Array.isArray(parsed.users) ? parsed.users : defaults.users,
      messages: Array.isArray(parsed.messages) ? parsed.messages : defaults.messages
    };
  } catch {
    return defaults;
  }
}

export function saveCmsState(state: SiteContentSchema): { ok: boolean; error?: string } {
  if (typeof window === 'undefined') return { ok: true };
  try {
    const payload: SiteContentSchema = {
      ...state,
      version: CMS_SCHEMA_VERSION,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(payload));
    return { ok: true };
  } catch (err) {
    const isQuota =
      err instanceof DOMException &&
      (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    return {
      ok: false,
      error: isQuota
        ? 'Browser LocalStorage quota exceeded. Please remove unused data or store large media files inside the Media Library (IndexedDB).'
        : 'Failed to save website changes to LocalStorage.'
    };
  }
}

export function loadMediaMeta(): MediaItemMeta[] {
  const defaults = getDefaultMediaMeta();
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(MEDIA_META_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MEDIA_META_STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MediaItemMeta[]) : defaults;
  } catch {
    return defaults;
  }
}

export function saveMediaMeta(items: MediaItemMeta[]): { ok: boolean; error?: string } {
  if (typeof window === 'undefined') return { ok: true };
  try {
    localStorage.setItem(MEDIA_META_STORAGE_KEY, JSON.stringify(items));
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: 'Unable to save media metadata to LocalStorage (storage quota reached).'
    };
  }
}

export function estimateLocalStorageUsageBytes(): { usedBytes: number; percentOf5Mb: number } {
  if (typeof window === 'undefined') return { usedBytes: 0, percentOf5Mb: 0 };
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('maisondor_')) {
        const v = localStorage.getItem(k) || '';
        total += (k.length + v.length) * 2;
      }
    }
  } catch {
    // Ignore
  }
  const approxLimit = 5 * 1024 * 1024;
  return {
    usedBytes: total,
    percentOf5Mb: Math.min(100, Math.round((total / approxLimit) * 1000) / 10)
  };
}

export function validateImportedCmsJson(rawText: string): {
  ok: boolean;
  data?: SiteContentSchema;
  error?: string;
} {
  try {
    const parsed = JSON.parse(rawText) as Partial<SiteContentSchema>;
    if (!parsed || typeof parsed !== 'object') {
      return { ok: false, error: 'JSON file must contain a valid object.' };
    }
    if (
      !parsed.siteSettings ||
      !parsed.hero ||
      !Array.isArray(parsed.products) ||
      !Array.isArray(parsed.collections)
    ) {
      return {
        ok: false,
        error: 'Invalid Maison d’Or CMS backup: missing required siteSettings, hero, products, or collections.'
      };
    }

    const defaults = getDefaultCmsState();
    const merged: SiteContentSchema = {
      ...defaults,
      ...parsed,
      version: CMS_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
      siteSettings: {
        ...defaults.siteSettings,
        ...parsed.siteSettings,
        colors: { ...defaults.siteSettings.colors, ...(parsed.siteSettings.colors || {}) },
        contact: { ...defaults.siteSettings.contact, ...(parsed.siteSettings.contact || {}) },
        socialLinks: {
          ...defaults.siteSettings.socialLinks,
          ...(parsed.siteSettings.socialLinks || {})
        }
      },
      hero: { ...defaults.hero, ...parsed.hero },
      sectionHeaders: { ...defaults.sectionHeaders, ...(parsed.sectionHeaders || {}) },
      atelier: { ...defaults.atelier, ...(parsed.atelier || {}) },
      announcements: Array.isArray(parsed.announcements)
        ? parsed.announcements
        : defaults.announcements,
      navLinks: Array.isArray(parsed.navLinks) ? parsed.navLinks : defaults.navLinks,
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : defaults.reviews,
      customSections: Array.isArray(parsed.customSections)
        ? parsed.customSections
        : defaults.customSections,
      users: Array.isArray(parsed.users) ? parsed.users : defaults.users,
      messages: Array.isArray(parsed.messages) ? parsed.messages : defaults.messages
    };
    return { ok: true, data: merged };
  } catch {
    return { ok: false, error: 'Invalid JSON syntax. Please select a valid .json backup file.' };
  }
}
