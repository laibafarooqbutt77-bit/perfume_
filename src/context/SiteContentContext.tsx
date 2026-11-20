import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type {
  SiteContentSchema,
  SiteSettings,
  AnnouncementItem,
  NavLinkItem,
  HeroContent,
  SectionHeadersContent,
  AtelierContent,
  CustomSectionItem,
  AdminCustomerUser,
  CustomerMessageItem,
  MediaItemMeta,
  MediaFolder,
  AdminActivityLog
} from '../types/cms';
import type { PerfumeProduct, CollectionItem, CustomerReview } from '../types/perfume';
import {
  CMS_STORAGE_KEY,
  MEDIA_META_STORAGE_KEY,
  getDefaultCmsState,
  getDefaultMediaMeta,
  loadCmsState,
  saveCmsState,
  loadMediaMeta,
  saveMediaMeta,
  estimateLocalStorageUsageBytes,
  validateImportedCmsJson
} from '../utils/cmsStorage';
import {
  saveMediaBlob,
  deleteMediaBlob,
  clearAllUploadedMediaBlobs,
  isIdbMediaRef,
  extractIdbMediaId,
  resolveIdbMediaUrl
} from '../utils/mediaDb';
import {
  appendAdminLog,
  getAdminLogs,
  clearAdminLogs,
  getActiveAdminSession
} from '../utils/adminAuth';

interface StorageUsageInfo {
  usedBytes: number;
  percentOf5Mb: number;
}

interface SiteContentContextType {
  cms: SiteContentSchema;
  mediaItems: MediaItemMeta[];
  logs: AdminActivityLog[];
  storageUsage: StorageUsageInfo;
  cmsError: string | null;
  clearCmsError: () => void;

  // Settings & Structural CMS
  updateSiteSettings: (updates: Partial<SiteSettings>) => boolean;
  updateHero: (updates: Partial<HeroContent>) => boolean;
  updateSectionHeaders: (updates: Partial<SectionHeadersContent>) => boolean;
  updateAtelier: (updates: Partial<AtelierContent>) => boolean;

  // Announcements & Nav Links
  saveAnnouncement: (item: AnnouncementItem) => boolean;
  deleteAnnouncement: (id: string) => boolean;
  toggleAnnouncement: (id: string) => boolean;
  saveNavLink: (item: NavLinkItem) => boolean;
  deleteNavLink: (id: string) => boolean;
  reorderNavLink: (id: string, direction: 'up' | 'down') => boolean;

  // Custom Dynamic Sections
  upsertCustomSection: (section: CustomSectionItem) => boolean;
  deleteCustomSection: (id: string) => boolean;
  moveCustomSection: (id: string, direction: 'up' | 'down') => boolean;

  // Catalog, Collections, Reviews
  upsertProduct: (product: PerfumeProduct) => boolean;
  deleteProduct: (id: string) => boolean;
  upsertCollection: (collection: CollectionItem) => boolean;
  deleteCollection: (id: string) => boolean;
  upsertReview: (review: CustomerReview) => boolean;
  deleteReview: (id: string) => boolean;

  // Users & Messages
  upsertUser: (user: AdminCustomerUser) => boolean;
  toggleBlockUser: (id: string) => boolean;
  deleteUser: (id: string) => boolean;
  recordOrderCustomer: (input: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    orderTotal: number;
  }) => void;
  addMessage: (input: {
    senderName: string;
    email: string;
    subject: string;
    message: string;
    source: 'newsletter' | 'concierge' | 'contact';
  }) => void;
  updateMessageStatus: (id: string, status: 'unread' | 'read' | 'resolved', adminNote?: string) => boolean;
  deleteMessage: (id: string) => boolean;

  // Local Media Library (IndexedDB)
  uploadMediaFile: (file: File, folder: MediaFolder) => Promise<{ ok: boolean; item?: MediaItemMeta; error?: string }>;
  replaceMediaFile: (mediaId: string, file: File) => Promise<{ ok: boolean; error?: string }>;
  updateMediaFolder: (mediaId: string, folder: MediaFolder) => boolean;
  renameMediaItem: (mediaId: string, name: string) => boolean;
  deleteMediaItem: (mediaId: string) => Promise<{ ok: boolean; error?: string }>;

  // Logs & Backup
  refreshLogs: () => void;
  clearLogs: () => void;
  exportBackupJson: () => string;
  importBackupJson: (rawJson: string) => { ok: boolean; error?: string };
  resetAllCmsData: (clearUploadedMedia?: boolean) => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

function getActorName(): string {
  return getActiveAdminSession()?.adminLabel || 'Administrator';
}

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cms, setCms] = useState<SiteContentSchema>(() => loadCmsState());
  const [mediaItems, setMediaItems] = useState<MediaItemMeta[]>(() => loadMediaMeta());
  const [logs, setLogs] = useState<AdminActivityLog[]>(() => getAdminLogs());
  const [cmsError, setCmsError] = useState<string | null>(null);
  const [storageTick, setStorageTick] = useState(0);

  const clearCmsError = useCallback(() => setCmsError(null), []);

  const refreshLogs = useCallback(() => {
    setLogs(getAdminLogs());
  }, []);

  const persistCms = useCallback(
    (
      updater: (prev: SiteContentSchema) => SiteContentSchema,
      logInfo?: { action: string; target: string; details: string; severity?: 'info' | 'warning' | 'security' }
    ): boolean => {
      let nextState: SiteContentSchema | null = null;
      setCms((prev) => {
        nextState = {
          ...updater(prev),
          updatedAt: new Date().toISOString()
        };
        return nextState;
      });

      // Use functional computation synchronously on current ref via microtask fallback if needed,
      // but safer to compute from localStorage or state directly:
      // Let's compute synchronously cleanly using queue or state reference.
      if (nextState) {
        const res = saveCmsState(nextState);
        setStorageTick((t) => t + 1);
        if (!res.ok) {
          setCmsError(res.error || 'Failed to save changes.');
          return false;
        }
        if (logInfo) {
          setLogs(
            appendAdminLog({
              actor: getActorName(),
              action: logInfo.action,
              target: logInfo.target,
              details: logInfo.details,
              severity: logInfo.severity || 'info'
            })
          );
        }
      }
      return true;
    },
    []
  );

  // Sync CMS updates safely to localStorage whenever cms updates
  useEffect(() => {
    const res = saveCmsState(cms);
    if (!res.ok) {
      setCmsError(res.error || 'Failed to save changes.');
    }
    setStorageTick((t) => t + 1);
  }, [cms]);

  // Apply live CSS variables, document title, meta description & favicon
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const { colors, seoTitle, seoDescription, siteName, faviconUrl } = cms.siteSettings;

    root.style.setProperty('--cms-bg', colors.background || '#FAF8F5');
    root.style.setProperty('--cms-surface', colors.surface || '#FFFFFF');
    root.style.setProperty('--cms-text', colors.text || '#141414');
    root.style.setProperty('--cms-accent', colors.accent || '#785E19');
    root.style.setProperty('--cms-dark-bg', colors.darkBg || '#141414');

    const titleToUse = seoTitle?.trim() || siteName;
    if (titleToUse) {
      document.title = titleToUse;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', titleToUse);
    }

    if (seoDescription?.trim()) {
      const descMeta = document.querySelector('meta[name="description"]');
      if (descMeta) descMeta.setAttribute('content', seoDescription);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', seoDescription);
    }

    let cancelled = false;
    if (faviconUrl?.trim()) {
      const applyFavicon = (href: string) => {
        if (cancelled) return;
        let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = href;
      };
      if (isIdbMediaRef(faviconUrl)) {
        resolveIdbMediaUrl(faviconUrl).then((resolved) => {
          if (resolved) applyFavicon(resolved);
        });
      } else {
        applyFavicon(faviconUrl);
      }
    }
    return () => {
      cancelled = true;
    };
  }, [cms.siteSettings]);

  // Cross-tab synchronization listener
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CMS_STORAGE_KEY) {
        setCms(loadCmsState());
      } else if (e.key === MEDIA_META_STORAGE_KEY) {
        setMediaItems(loadMediaMeta());
      } else if (e.key === 'maisondor_admin_logs_v1') {
        setLogs(getAdminLogs());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const recordLog = useCallback(
    (action: string, target: string, details: string, severity: 'info' | 'warning' | 'security' = 'info') => {
      setLogs(
        appendAdminLog({
          actor: getActorName(),
          action,
          target,
          details,
          severity
        })
      );
    },
    []
  );

  const updateSiteSettings = useCallback(
    (updates: Partial<SiteSettings>): boolean => {
      setCms((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        siteSettings: {
          ...prev.siteSettings,
          ...updates,
          colors: { ...prev.siteSettings.colors, ...(updates.colors || {}) },
          contact: { ...prev.siteSettings.contact, ...(updates.contact || {}) },
          socialLinks: { ...prev.siteSettings.socialLinks, ...(updates.socialLinks || {}) }
        }
      }));
      recordLog('SETTINGS_UPDATED', 'Website Settings', 'Updated site branding, theme, SEO, or contact settings.');
      return true;
    },
    [recordLog]
  );

  const updateHero = useCallback(
    (updates: Partial<HeroContent>): boolean => {
      setCms((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        hero: { ...prev.hero, ...updates }
      }));
      recordLog('HERO_UPDATED', 'Hero Banner', 'Modified hero headline, call-to-action, or showcase image.');
      return true;
    },
    [recordLog]
  );

  const updateSectionHeaders = useCallback(
    (updates: Partial<SectionHeadersContent>): boolean => {
      setCms((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        sectionHeaders: {
          collections: { ...prev.sectionHeaders.collections, ...(updates.collections || {}) },
          catalog: { ...prev.sectionHeaders.catalog, ...(updates.catalog || {}) },
          scentFinder: { ...prev.sectionHeaders.scentFinder, ...(updates.scentFinder || {}) },
          bestSellers: { ...prev.sectionHeaders.bestSellers, ...(updates.bestSellers || {}) },
          reviews: { ...prev.sectionHeaders.reviews, ...(updates.reviews || {}) },
          newsletter: { ...prev.sectionHeaders.newsletter, ...(updates.newsletter || {}) }
        }
      }));
      recordLog('SECTIONS_UPDATED', 'Page Sections', 'Updated section headings or visibility.');
      return true;
    },
    [recordLog]
  );

  const updateAtelier = useCallback(
    (updates: Partial<AtelierContent>): boolean => {
      setCms((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        atelier: { ...prev.atelier, ...updates }
      }));
      recordLog('ATELIER_UPDATED', 'Brand Atelier Story', 'Updated brand narrative, quote, or craftsmanship pillars.');
      return true;
    },
    [recordLog]
  );

  const saveAnnouncement = useCallback(
    (item: AnnouncementItem): boolean => {
      setCms((prev) => {
        const exists = prev.announcements.some((a) => a.id === item.id);
        const announcements = exists
          ? prev.announcements.map((a) => (a.id === item.id ? item : a))
          : [...prev.announcements, item];
        return { ...prev, updatedAt: new Date().toISOString(), announcements };
      });
      recordLog('ANNOUNCEMENT_SAVED', 'Announcements', `Saved announcement: "${item.text.slice(0, 40)}..."`);
      return true;
    },
    [recordLog]
  );

  const deleteAnnouncement = useCallback(
    (id: string): boolean => {
      setCms((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        announcements: prev.announcements.filter((a) => a.id !== id)
      }));
      recordLog('ANNOUNCEMENT_DELETED', 'Announcements', `Removed announcement ${id}.`, 'warning');
      return true;
    },
    [recordLog]
  );

  const toggleAnnouncement = useCallback(
    (id: string): boolean => {
      setCms((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        announcements: prev.announcements.map((a) =>
          a.id === id ? { ...a, enabled: !a.enabled } : a
        )
      }));
      recordLog('ANNOUNCEMENT_TOGGLED', 'Announcements', `Toggled visibility on announcement ${id}.`);
      return true;
    },
    [recordLog]
  );

  const saveNavLink = useCallback(
    (item: NavLinkItem): boolean => {
      setCms((prev) => {
        const exists = prev.navLinks.some((n) => n.id === item.id);
        const navLinks = exists
          ? prev.navLinks.map((n) => (n.id === item.id ? item : n))
          : [...prev.navLinks, item];
        return { ...prev, updatedAt: new Date().toISOString(), navLinks };
      });
      recordLog('NAV_LINK_SAVED', 'Navigation Menu', `Saved navigation link "${item.label}".`);
      return true;
    },
    [recordLog]
  );

  const deleteNavLink = useCallback(
    (id: string): boolean => {
      setCms((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        navLinks: prev.navLinks.filter((n) => n.id !== id)
      }));
      recordLog('NAV_LINK_DELETED', 'Navigation Menu', `Deleted navigation link ${id}.`, 'warning');
      return true;
    },
    [recordLog]
  );

  const reorderNavLink = useCallback(
    (id: string, direction: 'up' | 'down'): boolean => {
      setCms((prev) => {
        const list = [...prev.navLinks];
        const idx = list.findIndex((n) => n.id === id);
        if (idx === -1) return prev;
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= list.length) return prev;
        const temp = list[idx];
        list[idx] = list[targetIdx];
        list[targetIdx] = temp;
        return { ...prev, updatedAt: new Date().toISOString(), navLinks: list };
      });
      recordLog('NAV_REORDERED', 'Navigation Menu', `Reordered navigation item ${id}.`);
      return true;
    },
    [recordLog]
  );

  const upsertCustomSection = useCallback(
    (section: CustomSectionItem): boolean => {
      setCms((prev) => {
        const exists = prev.customSections.some((s) => s.id === section.id);
        const customSections = exists
          ? prev.customSections.map((s) => (s.id === section.id ? section : s))
          : [...prev.customSections, section];
        return { ...prev, updatedAt: new Date().toISOString(), customSections };
      });
      recordLog('CUSTOM_SECTION_SAVED', 'Custom Sections', `Saved custom section "${section.title}".`);
      return true;
    },
    [recordLog]
  );

  const deleteCustomSection = useCallback(
    (id: string): boolean => {
      setCms((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        customSections: prev.customSections.filter((s) => s.id !== id)
      }));
      recordLog('CUSTOM_SECTION_DELETED', 'Custom Sections', `Deleted custom section ${id}.`, 'warning');
      return true;
    },
    [recordLog]
  );

  const moveCustomSection = useCallback(
    (id: string, direction: 'up' | 'down'): boolean => {
      setCms((prev) => {
        const sorted = [...prev.customSections].sort((a, b) => a.order - b.order);
        const idx = sorted.findIndex((s) => s.id === id);
        if (idx === -1) return prev;
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
        const temp = sorted[idx];
        sorted[idx] = sorted[swapIdx];
        sorted[swapIdx] = temp;
        const normalized = sorted.map((s, index) => ({ ...s, order: index }));
        return { ...prev, updatedAt: new Date().toISOString(), customSections: normalized };
      });
      recordLog('CUSTOM_SECTION_REORDERED', 'Custom Sections', `Moved custom section ${id} ${direction}.`);
      return true;
    },
    [recordLog]
  );

  const upsertProduct = useCallback(
    (product: PerfumeProduct): boolean => {
      setCms((prev) => {
        const exists = prev.products.some((p) => p.id === product.id);
        const products = exists
          ? prev.products.map((p) => (p.id === product.id ? product : p))
          : [product, ...prev.products];
        return { ...prev, updatedAt: new Date().toISOString(), products };
      });
      recordLog('PRODUCT_SAVED', 'Fragrance Catalog', `Saved product "${product.name}".`);
      return true;
    },
    [recordLog]
  );

  const deleteProduct = useCallback(
    (id: string): boolean => {
      setCms((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        products: prev.products.filter((p) => p.id !== id)
      }));
      recordLog('PRODUCT_DELETED', 'Fragrance Catalog', `Removed fragrance ${id} from catalog.`, 'warning');
      return true;
    },
    [recordLog]
  );

  const upsertCollection = useCallback(
    (collection: CollectionItem): boolean => {
      setCms((prev) => {
        const exists = prev.collections.some((c) => c.id === collection.id);
        const collections = exists
          ? prev.collections.map((c) => (c.id === collection.id ? collection : c))
          : [...prev.collections, collection];
        return { ...prev, updatedAt: new Date().toISOString(), collections };
      });
      recordLog('COLLECTION_SAVED', 'Collections', `Saved collection "${collection.name}".`);
      return true;
    },
    [recordLog]
  );

  const deleteCollection = useCallback(
    (id: string): boolean => {
      setCms((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        collections: prev.collections.filter((c) => c.id !== id)
      }));
      recordLog('COLLECTION_DELETED', 'Collections', `Deleted collection ${id}.`, 'warning');
      return true;
    },
    [recordLog]
  );

  const upsertReview = useCallback(
    (review: CustomerReview): boolean => {
      setCms((prev) => {
        const exists = prev.reviews.some((r) => r.id === review.id);
        const reviews = exists
          ? prev.reviews.map((r) => (r.id === review.id ? review : r))
          : [review, ...prev.reviews];
        return { ...prev, updatedAt: new Date().toISOString(), reviews };
      });
      recordLog('REVIEW_SAVED', 'Customer Reviews', `Saved testimonial by "${review.author}".`);
      return true;
    },
    [recordLog]
  );

  const deleteReview = useCallback(
    (id: string): boolean => {
      setCms((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        reviews: prev.reviews.filter((r) => r.id !== id)
      }));
      recordLog('REVIEW_DELETED', 'Customer Reviews', `Deleted review ${id}.`, 'warning');
      return true;
    },
    [recordLog]
  );

  const upsertUser = useCallback(
    (user: AdminCustomerUser): boolean => {
      setCms((prev) => {
        const exists = prev.users.some((u) => u.id === user.id);
        const users = exists
          ? prev.users.map((u) => (u.id === user.id ? user : u))
          : [user, ...prev.users];
        return { ...prev, updatedAt: new Date().toISOString(), users };
      });
      recordLog('USER_SAVED', 'Customers', `Updated customer profile "${user.fullName}".`);
      return true;
    },
    [recordLog]
  );

  const toggleBlockUser = useCallback(
    (id: string): boolean => {
      setCms((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        users: prev.users.map((u) =>
          u.id === id
            ? { ...u, status: u.status === 'blocked' ? 'active' : 'blocked' }
            : u
        )
      }));
      recordLog('USER_STATUS_CHANGED', 'Customers', `Toggled block status for user ${id}.`, 'security');
      return true;
    },
    [recordLog]
  );

  const deleteUser = useCallback(
    (id: string): boolean => {
      setCms((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        users: prev.users.filter((u) => u.id !== id)
      }));
      recordLog('USER_DELETED', 'Customers', `Deleted user record ${id}.`, 'warning');
      return true;
    },
    [recordLog]
  );

  const recordOrderCustomer = useCallback(
    (input: {
      fullName: string;
      phone: string;
      email?: string;
      address: string;
      city: string;
      orderTotal: number;
    }) => {
      const now = new Date().toISOString();
      const emailNorm = (input.email || '').trim().toLowerCase();
      const phoneNorm = input.phone.replace(/\D/g, '');
      setCms((prev) => {
        const existingIdx = prev.users.findIndex(
          (u) =>
            (emailNorm && u.email.toLowerCase() === emailNorm) ||
            (phoneNorm && u.phone.replace(/\D/g, '') === phoneNorm)
        );
        if (existingIdx >= 0) {
          const updatedUsers = [...prev.users];
          const existing = updatedUsers[existingIdx];
          const nextOrders = existing.ordersCount + 1;
          const nextSpent = existing.totalSpent + input.orderTotal;
          updatedUsers[existingIdx] = {
            ...existing,
            fullName: input.fullName || existing.fullName,
            email: input.email?.trim() || existing.email,
            address: input.address || existing.address,
            city: input.city || existing.city,
            ordersCount: nextOrders,
            totalSpent: nextSpent,
            status: existing.status === 'blocked' ? 'blocked' : nextSpent >= 60000 ? 'vip' : 'active',
            lastActiveAt: now
          };
          return { ...prev, updatedAt: now, users: updatedUsers };
        }
        const newUser: AdminCustomerUser = {
          id: `usr-${Date.now().toString(36)}`,
          fullName: input.fullName.trim() || 'Boutique Patron',
          email: input.email?.trim() || 'patron@local-boutique.pk',
          phone: input.phone.trim(),
          city: input.city.trim() || 'Lahore',
          address: input.address.trim(),
          status: input.orderTotal >= 60000 ? 'vip' : 'active',
          ordersCount: 1,
          totalSpent: input.orderTotal,
          notes: 'Registered automatically from boutique checkout.',
          joinedAt: now,
          lastActiveAt: now
        };
        return { ...prev, updatedAt: now, users: [newUser, ...prev.users] };
      });
    },
    []
  );

  const addMessage = useCallback(
    (input: {
      senderName: string;
      email: string;
      subject: string;
      message: string;
      source: 'newsletter' | 'concierge' | 'contact';
    }) => {
      const now = new Date().toISOString();
      const newMsg: CustomerMessageItem = {
        id: `msg-${Date.now().toString(36)}`,
        senderName: input.senderName.trim() || 'Boutique Visitor',
        email: input.email.trim(),
        subject: input.subject.trim(),
        message: input.message.trim(),
        source: input.source,
        status: 'unread',
        createdAt: now
      };
      setCms((prev) => ({
        ...prev,
        updatedAt: now,
        messages: [newMsg, ...prev.messages]
      }));
    },
    []
  );

  const updateMessageStatus = useCallback(
    (id: string, status: 'unread' | 'read' | 'resolved', adminNote?: string): boolean => {
      setCms((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        messages: prev.messages.map((m) =>
          m.id === id
            ? { ...m, status, ...(adminNote !== undefined ? { adminNote } : {}) }
            : m
        )
      }));
      recordLog('MESSAGE_UPDATED', 'Inbox Messages', `Updated message ${id} status to ${status}.`);
      return true;
    },
    [recordLog]
  );

  const deleteMessage = useCallback(
    (id: string): boolean => {
      setCms((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        messages: prev.messages.filter((m) => m.id !== id)
      }));
      recordLog('MESSAGE_DELETED', 'Inbox Messages', `Deleted message ${id}.`, 'warning');
      return true;
    },
    [recordLog]
  );

  const uploadMediaFile = useCallback(
    async (
      file: File,
      folder: MediaFolder
    ): Promise<{ ok: boolean; item?: MediaItemMeta; error?: string }> => {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      if (!isVideo && !isImage) {
        return { ok: false, error: 'Unsupported file type. Please select an image or video file.' };
      }

      const id = `med-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      try {
        await saveMediaBlob(id, file);
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : 'Failed to store media in IndexedDB.'
        };
      }

      const now = new Date().toISOString();
      const newItem: MediaItemMeta = {
        id,
        name: file.name,
        mediaType: isVideo ? 'video' : 'image',
        mimeType: file.type || (isVideo ? 'video/mp4' : 'image/png'),
        sizeBytes: file.size,
        folder,
        src: `idb://${id}`,
        isBuiltIn: false,
        createdAt: now,
        updatedAt: now
      };

      const nextList = [newItem, ...mediaItems];
      const metaRes = saveMediaMeta(nextList);
      if (!metaRes.ok) {
        setCmsError(metaRes.error || 'Failed to save media catalog.');
        return { ok: false, error: metaRes.error };
      }
      setMediaItems(nextList);
      setStorageTick((t) => t + 1);
      recordLog(
        'MEDIA_UPLOADED',
        'Media Library',
        `Uploaded ${newItem.mediaType} "${file.name}" (${Math.round(file.size / 1024)} KB) to ${folder}.`
      );
      return { ok: true, item: newItem };
    },
    [mediaItems, recordLog]
  );

  const replaceMediaFile = useCallback(
    async (mediaId: string, file: File): Promise<{ ok: boolean; error?: string }> => {
      const existing = mediaItems.find((m) => m.id === mediaId);
      if (!existing) return { ok: false, error: 'Media item not found.' };

      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      if (!isVideo && !isImage) {
        return { ok: false, error: 'Unsupported file type. Please choose an image or video.' };
      }

      const targetBlobId = isIdbMediaRef(existing.src)
        ? extractIdbMediaId(existing.src)
        : `rep-${existing.id}`;

      try {
        await saveMediaBlob(targetBlobId, file);
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : 'Failed to replace media blob in IndexedDB.'
        };
      }

      const newSrc = `idb://${targetBlobId}`;
      const oldSrc = existing.src;
      const now = new Date().toISOString();

      const nextList = mediaItems.map((m) =>
        m.id === mediaId
          ? {
              ...m,
              name: file.name,
              mediaType: isVideo ? ('video' as const) : ('image' as const),
              mimeType: file.type,
              sizeBytes: file.size,
              src: newSrc,
              updatedAt: now
            }
          : m
      );
      saveMediaMeta(nextList);
      setMediaItems(nextList);

      // Update references if oldSrc was a static path replaced by an IndexedDB file
      if (oldSrc !== newSrc) {
        setCms((prev) => ({
          ...prev,
          updatedAt: now,
          hero: prev.hero.heroImage === oldSrc ? { ...prev.hero, heroImage: newSrc } : prev.hero,
          atelier: prev.atelier.image === oldSrc ? { ...prev.atelier, image: newSrc } : prev.atelier,
          products: prev.products.map((p) => (p.image === oldSrc ? { ...p, image: newSrc } : p)),
          collections: prev.collections.map((c) => (c.image === oldSrc ? { ...c, image: newSrc } : c)),
          customSections: prev.customSections.map((s) =>
            s.mediaUrl === oldSrc ? { ...s, mediaUrl: newSrc } : s
          )
        }));
      }

      recordLog('MEDIA_REPLACED', 'Media Library', `Replaced file for "${existing.name}" cleanly.`);
      return { ok: true };
    },
    [mediaItems, recordLog]
  );

  const updateMediaFolder = useCallback(
    (mediaId: string, folder: MediaFolder): boolean => {
      const nextList = mediaItems.map((m) =>
        m.id === mediaId ? { ...m, folder, updatedAt: new Date().toISOString() } : m
      );
      saveMediaMeta(nextList);
      setMediaItems(nextList);
      recordLog('MEDIA_MOVED', 'Media Library', `Moved media ${mediaId} to ${folder}.`);
      return true;
    },
    [mediaItems, recordLog]
  );

  const renameMediaItem = useCallback(
    (mediaId: string, name: string): boolean => {
      const clean = name.trim();
      if (!clean) return false;
      const nextList = mediaItems.map((m) =>
        m.id === mediaId ? { ...m, name: clean, updatedAt: new Date().toISOString() } : m
      );
      saveMediaMeta(nextList);
      setMediaItems(nextList);
      return true;
    },
    [mediaItems]
  );

  const deleteMediaItem = useCallback(
    async (mediaId: string): Promise<{ ok: boolean; error?: string }> => {
      const existing = mediaItems.find((m) => m.id === mediaId);
      if (!existing) return { ok: false, error: 'Media item not found.' };

      if (isIdbMediaRef(existing.src)) {
        try {
          await deleteMediaBlob(extractIdbMediaId(existing.src));
        } catch (err) {
          return {
            ok: false,
            error: err instanceof Error ? err.message : 'Failed to remove file from IndexedDB.'
          };
        }
      }

      const nextList = mediaItems.filter((m) => m.id !== mediaId);
      saveMediaMeta(nextList);
      setMediaItems(nextList);
      recordLog('MEDIA_DELETED', 'Media Library', `Deleted media asset "${existing.name}".`, 'warning');
      return { ok: true };
    },
    [mediaItems, recordLog]
  );

  const clearLogs = useCallback(() => {
    clearAdminLogs();
    setLogs([]);
  }, []);

  const exportBackupJson = useCallback((): string => {
    recordLog('BACKUP_EXPORTED', 'Data Management', 'Exported complete Maison d’Or CMS JSON backup.');
    return JSON.stringify(cms, null, 2);
  }, [cms, recordLog]);

  const importBackupJson = useCallback(
    (rawJson: string): { ok: boolean; error?: string } => {
      const validation = validateImportedCmsJson(rawJson);
      if (!validation.ok || !validation.data) {
        return { ok: false, error: validation.error || 'Invalid backup file.' };
      }
      const res = saveCmsState(validation.data);
      if (!res.ok) {
        return { ok: false, error: res.error };
      }
      setCms(validation.data);
      recordLog('BACKUP_IMPORTED', 'Data Management', 'Restored website content from JSON backup.', 'warning');
      return { ok: true };
    },
    [recordLog]
  );

  const resetAllCmsData = useCallback(
    async (clearUploadedMedia = false): Promise<void> => {
      const defaults = getDefaultCmsState();
      setCms(defaults);
      saveCmsState(defaults);
      if (clearUploadedMedia) {
        await clearAllUploadedMediaBlobs();
        const defaultMedia = getDefaultMediaMeta();
        setMediaItems(defaultMedia);
        saveMediaMeta(defaultMedia);
      }
      recordLog(
        'FACTORY_RESET',
        'Data Management',
        clearUploadedMedia
          ? 'Reset website content & cleared uploaded IndexedDB media to factory defaults.'
          : 'Reset website text, catalog, and settings to factory defaults.',
        'security'
      );
    },
    [recordLog]
  );

  const storageUsage = useMemo(() => {
    void storageTick;
    return estimateLocalStorageUsageBytes();
  }, [storageTick]);

  // Suppress unused helper warning cleanly
  void persistCms;

  return (
    <SiteContentContext.Provider
      value={{
        cms,
        mediaItems,
        logs,
        storageUsage,
        cmsError,
        clearCmsError,
        updateSiteSettings,
        updateHero,
        updateSectionHeaders,
        updateAtelier,
        saveAnnouncement,
        deleteAnnouncement,
        toggleAnnouncement,
        saveNavLink,
        deleteNavLink,
        reorderNavLink,
        upsertCustomSection,
        deleteCustomSection,
        moveCustomSection,
        upsertProduct,
        deleteProduct,
        upsertCollection,
        deleteCollection,
        upsertReview,
        deleteReview,
        upsertUser,
        toggleBlockUser,
        deleteUser,
        recordOrderCustomer,
        addMessage,
        updateMessageStatus,
        deleteMessage,
        uploadMediaFile,
        replaceMediaFile,
        updateMediaFolder,
        renameMediaItem,
        deleteMediaItem,
        refreshLogs,
        clearLogs,
        exportBackupJson,
        importBackupJson,
        resetAllCmsData
      }}
    >
      {children}
    </SiteContentContext.Provider>
  );
};

export const useSiteContent = () => {
  const ctx = useContext(SiteContentContext);
  if (!ctx) {
    throw new Error('useSiteContent must be used within a SiteContentProvider');
  }
  return ctx;
};
