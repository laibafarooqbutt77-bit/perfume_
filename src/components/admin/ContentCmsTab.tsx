import React, { useState, useEffect } from 'react';
import {
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Film,
  Edit3,
  X
} from 'lucide-react';
import { useSiteContent } from '../../context/SiteContentContext';
import type {
  CustomSectionItem,
  AnnouncementItem,
  NavLinkItem
} from '../../types/cms';
import type { CustomerReview, FragranceCategory } from '../../types/perfume';
import { CmsMediaRenderer } from '../CmsMedia';
import { ConfirmModal, MediaPickerModal } from './AdminShared';

interface ContentCmsTabProps {
  onNotify: (msg: string) => void;
}

type ContentSubTab = 'hero' | 'custom' | 'navigation' | 'atelier' | 'reviews';

export const ContentCmsTab: React.FC<ContentCmsTabProps> = ({ onNotify }) => {
  const {
    cms,
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
    upsertReview,
    deleteReview,
    updateSiteSettings
  } = useSiteContent();

  const [subTab, setSubTab] = useState<ContentSubTab>('hero');

  // Local Hero & Headers form states
  const [heroForm, setHeroForm] = useState(cms.hero);
  const [headersForm, setHeadersForm] = useState(cms.sectionHeaders);
  const [atelierForm, setAtelierForm] = useState(cms.atelier);

  useEffect(() => {
    setHeroForm(cms.hero);
    setHeadersForm(cms.sectionHeaders);
    setAtelierForm(cms.atelier);
  }, [cms.hero, cms.sectionHeaders, cms.atelier]);

  // Modals state
  const [editingCustom, setEditingCustom] = useState<CustomSectionItem | null>(null);
  const [editingNav, setEditingNav] = useState<NavLinkItem | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementItem | null>(null);
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);

  const [pickerTarget, setPickerTarget] = useState<'hero' | 'atelier' | 'custom' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    kind: 'custom' | 'nav' | 'announcement' | 'review';
    id: string;
    label: string;
  } | null>(null);

  const handleSaveHeroAndHeaders = (e: React.FormEvent) => {
    e.preventDefault();
    updateHero(heroForm);
    updateSectionHeaders(headersForm);
    onNotify('Homepage hero banner & section headers saved.');
  };

  const handleSaveAtelier = (e: React.FormEvent) => {
    e.preventDefault();
    updateAtelier(atelierForm);
    onNotify('Atelier heritage narrative & craftsmanship pillars updated.');
  };

  const openNewCustomSection = () => {
    setEditingCustom({
      id: `sec-${Date.now().toString(36)}`,
      kicker: 'Private Reserve Campaign',
      title: 'The Art of Nocturnal Distillation',
      description: 'Discover limited seasonal flacons hand-blended in Grasse.',
      body: 'Crafted in micro-batches using aged resins, pure saffron threads, and natural woods.',
      layout: 'split-left',
      theme: 'dark',
      mediaUrl: '/images/golden-oud.webp',
      mediaType: 'image',
      ctaLabel: 'Explore Reserve',
      ctaHref: '#collection-grid',
      badgeText: 'Limited Edition',
      visible: true,
      order: cms.customSections.length,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
          Website & Content CMS
        </h1>
        <p className="text-xs sm:text-sm text-[#6B635B] dark:text-[#A89E92]">
          Control every headline, banner, navigation link, custom image/video section, and customer review.
        </p>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#EAE3D9] dark:border-[#2B2620] pb-3">
        {[
          { key: 'hero' as const, label: 'Hero & Page Sections' },
          { key: 'custom' as const, label: `Custom Sections (${cms.customSections.length})` },
          { key: 'navigation' as const, label: 'Navigation & Banners' },
          { key: 'atelier' as const, label: 'Atelier Brand Story' },
          { key: 'reviews' as const, label: `Testimonials (${cms.reviews.length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSubTab(tab.key)}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              subTab === tab.key
                ? 'bg-[#141414] text-white dark:bg-[#D4AF37] dark:text-[#141414]'
                : 'bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] text-[#4A443E] dark:text-[#C7BEB2]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: HERO & SECTION HEADERS */}
      {subTab === 'hero' && (
        <form onSubmit={handleSaveHeroAndHeaders} className="space-y-6 text-xs">
          <div className="p-6 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
                Homepage Hero Section
              </h2>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#785E19] dark:bg-[#D4AF37] dark:text-[#141414] text-white font-semibold"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Hero & Sections</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                  Hero Kicker
                </label>
                <input
                  type="text"
                  value={heroForm.kicker}
                  onChange={(e) => setHeroForm({ ...heroForm, kicker: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                  Atelier Location Tag
                </label>
                <input
                  type="text"
                  value={heroForm.locationLabel}
                  onChange={(e) => setHeroForm({ ...heroForm, locationLabel: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                  Headline Line 1
                </label>
                <input
                  type="text"
                  value={heroForm.headlinePrefix}
                  onChange={(e) => setHeroForm({ ...heroForm, headlinePrefix: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                  Headline Accent Line 2
                </label>
                <input
                  type="text"
                  value={heroForm.headlineAccent}
                  onChange={(e) => setHeroForm({ ...heroForm, headlineAccent: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                Hero Quote & Description
              </label>
              <input
                type="text"
                value={heroForm.quote}
                onChange={(e) => setHeroForm({ ...heroForm, quote: e.target.value })}
                className="w-full px-3 py-2 mb-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
              />
              <textarea
                rows={2}
                value={heroForm.description}
                onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                  Primary Button Label
                </label>
                <input
                  type="text"
                  value={heroForm.primaryCtaLabel}
                  onChange={(e) => setHeroForm({ ...heroForm, primaryCtaLabel: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                  Secondary Button Label
                </label>
                <input
                  type="text"
                  value={heroForm.secondaryCtaLabel}
                  onChange={(e) => setHeroForm({ ...heroForm, secondaryCtaLabel: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                  Featured Overlay Title
                </label>
                <input
                  type="text"
                  value={heroForm.featuredTitle}
                  onChange={(e) => setHeroForm({ ...heroForm, featuredTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                  Featured Price Tag
                </label>
                <input
                  type="text"
                  value={heroForm.featuredPrice}
                  onChange={(e) => setHeroForm({ ...heroForm, featuredPrice: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                Hero Photograph (URL or Media Library)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={heroForm.heroImage}
                  onChange={(e) => setHeroForm({ ...heroForm, heroImage: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
                <button
                  type="button"
                  onClick={() => setPickerTarget('hero')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#785E19] text-[#785E19] dark:text-[#D4AF37] font-semibold"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Choose Image</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section Visibility & Headings */}
          <div className="p-6 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] space-y-4">
            <h2 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
              Storefront Sections & Promo Banner
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['collections', 'catalog', 'scentFinder', 'reviews', 'newsletter'] as const).map(
                (key) => {
                  const block = headersForm[key];
                  return (
                    <div
                      key={key}
                      className="p-4 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#EAE3D9] dark:border-[#2B2620] space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold uppercase tracking-wider text-[11px] text-[#785E19] dark:text-[#D4AF37]">
                          {key} section
                        </span>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={block.visible}
                            onChange={(e) =>
                              setHeadersForm({
                                ...headersForm,
                                [key]: { ...block, visible: e.target.checked }
                              })
                            }
                          />
                          <span>Visible</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        value={block.title}
                        onChange={(e) =>
                          setHeadersForm({
                            ...headersForm,
                            [key]: { ...block, title: e.target.value }
                          })
                        }
                        placeholder="Section title"
                        className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#191714] border border-[#DDD6CB] dark:border-[#302B24]"
                      />
                      <input
                        type="text"
                        value={block.subtitle}
                        onChange={(e) =>
                          setHeadersForm({
                            ...headersForm,
                            [key]: { ...block, subtitle: e.target.value }
                          })
                        }
                        placeholder="Section subtitle"
                        className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#191714] border border-[#DDD6CB] dark:border-[#302B24]"
                      />
                    </div>
                  );
                }
              )}

              {/* Best Sellers Promo Banner */}
              <div className="p-4 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#EAE3D9] dark:border-[#2B2620] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold uppercase tracking-wider text-[11px] text-[#785E19] dark:text-[#D4AF37]">
                    Best Sellers & Promo Code
                  </span>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={headersForm.bestSellers.visible}
                      onChange={(e) =>
                        setHeadersForm({
                          ...headersForm,
                          bestSellers: {
                            ...headersForm.bestSellers,
                            visible: e.target.checked
                          }
                        })
                      }
                    />
                    <span>Visible</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={headersForm.bestSellers.title}
                  onChange={(e) =>
                    setHeadersForm({
                      ...headersForm,
                      bestSellers: { ...headersForm.bestSellers, title: e.target.value }
                    })
                  }
                  placeholder="Section title"
                  className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#191714] border border-[#DDD6CB] dark:border-[#302B24]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={headersForm.bestSellers.promoTitle}
                    onChange={(e) =>
                      setHeadersForm({
                        ...headersForm,
                        bestSellers: { ...headersForm.bestSellers, promoTitle: e.target.value }
                      })
                    }
                    placeholder="Promo headline"
                    className="px-2.5 py-1.5 rounded-md bg-white dark:bg-[#191714] border border-[#DDD6CB] dark:border-[#302B24]"
                  />
                  <input
                    type="text"
                    value={headersForm.bestSellers.promoCode}
                    onChange={(e) =>
                      setHeadersForm({
                        ...headersForm,
                        bestSellers: { ...headersForm.bestSellers, promoCode: e.target.value }
                      })
                    }
                    placeholder="Promo code"
                    className="px-2.5 py-1.5 rounded-md bg-white dark:bg-[#191714] border border-[#DDD6CB] dark:border-[#302B24] font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: CUSTOM DYNAMIC SECTIONS BUILDER */}
      {subTab === 'custom' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
                Custom Storefront Sections
              </h2>
              <p className="text-xs text-[#6B635B] dark:text-[#A89E92]">
                Build custom showcase blocks with uploaded images or videos (`mp4`/`webm`) and reorder them live.
              </p>
            </div>
            <button
              type="button"
              onClick={openNewCustomSection}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#785E19] dark:bg-[#D4AF37] dark:text-[#141414] text-white text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Section</span>
            </button>
          </div>

          {cms.customSections.length === 0 ? (
            <div className="p-12 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] text-center space-y-3">
              <p className="font-serif-luxury text-xl text-[#141414] dark:text-[#FAF8F5]">
                No custom sections created yet
              </p>
              <p className="text-xs text-[#6B635B] dark:text-[#A89E92] max-w-md mx-auto">
                Click "Add Custom Section" to publish seasonal campaigns, lookbooks, or video showcases directly on the homepage.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...cms.customSections]
                .sort((a, b) => a.order - b.order)
                .map((sec, idx, arr) => (
                  <div
                    key={sec.id}
                    className="p-4 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-20 h-14 rounded-lg overflow-hidden bg-[#141414] shrink-0">
                        <CmsMediaRenderer
                          src={sec.mediaUrl}
                          mediaType={sec.mediaType}
                          alt={sec.title}
                          controls={false}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif-luxury text-lg font-semibold text-[#141414] dark:text-[#FAF8F5] truncate">
                            {sec.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded-xs text-[10px] uppercase tracking-wider bg-[#FAF8F5] dark:bg-[#23201B] border border-[#E5E0D8] dark:border-[#302B24] text-[#6B635B] dark:text-[#C7BEB2]">
                            {sec.mediaType} · {sec.layout}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B635B] dark:text-[#A89E92] truncate">
                          {sec.description || sec.body}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveCustomSection(sec.id, 'up')}
                        className="p-1.5 rounded-md border border-[#DDD6CB] dark:border-[#302B24] disabled:opacity-35"
                        aria-label="Move section up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === arr.length - 1}
                        onClick={() => moveCustomSection(sec.id, 'down')}
                        className="p-1.5 rounded-md border border-[#DDD6CB] dark:border-[#302B24] disabled:opacity-35"
                        aria-label="Move section down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          upsertCustomSection({ ...sec, visible: !sec.visible })
                        }
                        className="p-1.5 rounded-md border border-[#DDD6CB] dark:border-[#302B24]"
                        aria-label="Toggle section visibility"
                      >
                        {sec.visible ? (
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-[#8A8075]" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCustom({ ...sec })}
                        className="p-1.5 rounded-md border border-[#DDD6CB] dark:border-[#302B24]"
                        aria-label="Edit custom section"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({ kind: 'custom', id: sec.id, label: sec.title })
                        }
                        className="p-1.5 rounded-md border border-[#DDD6CB] dark:border-[#302B24] text-red-600 dark:text-red-400"
                        aria-label="Delete custom section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: NAVIGATION & ANNOUNCEMENT BARS */}
      {subTab === 'navigation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Top Navigation Links */}
          <div className="p-6 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
                Header Navigation Links
              </h2>
              <button
                type="button"
                onClick={() =>
                  setEditingNav({
                    id: `nav-${Date.now().toString(36)}`,
                    label: 'New Link',
                    href: '#collection-grid',
                    visible: true
                  })
                }
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#141414] dark:bg-[#D4AF37] dark:text-[#141414] text-white font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Link</span>
              </button>
            </div>

            <div className="divide-y divide-[#F0EBE3] dark:divide-[#26231E]">
              {cms.navLinks.map((link, idx) => (
                <div key={link.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[#141414] dark:text-[#FAF8F5]">
                      {link.label}{' '}
                      {!link.visible && (
                        <span className="text-[10px] text-[#8A8075]">(Hidden)</span>
                      )}
                    </p>
                    <p className="text-[11px] font-mono text-[#6B635B] dark:text-[#A89E92]">
                      {link.href} {link.categoryFilter ? `· filter: ${link.categoryFilter}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => reorderNavLink(link.id, 'up')}
                      className="p-1 border border-[#DDD6CB] dark:border-[#302B24] rounded-xs disabled:opacity-35"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === cms.navLinks.length - 1}
                      onClick={() => reorderNavLink(link.id, 'down')}
                      className="p-1 border border-[#DDD6CB] dark:border-[#302B24] rounded-xs disabled:opacity-35"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingNav({ ...link })}
                      className="p-1 border border-[#DDD6CB] dark:border-[#302B24] rounded-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({ kind: 'nav', id: link.id, label: link.label })
                      }
                      className="p-1 border border-[#DDD6CB] dark:border-[#302B24] rounded-xs text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Announcement Bars */}
          <div className="p-6 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
                  Announcement Banners
                </h2>
                <label className="inline-flex items-center gap-1.5 text-[11px] text-[#6B635B] dark:text-[#A89E92] cursor-pointer mt-0.5">
                  <input
                    type="checkbox"
                    checked={cms.siteSettings.announcementBarEnabled}
                    onChange={(e) =>
                      updateSiteSettings({ announcementBarEnabled: e.target.checked })
                    }
                  />
                  <span>Enable top announcement ticker globally</span>
                </label>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEditingAnnouncement({
                    id: `ann-${Date.now().toString(36)}`,
                    text: '',
                    linkLabel: 'Explore',
                    linkHref: '#collection-grid',
                    enabled: true
                  })
                }
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#141414] dark:bg-[#D4AF37] dark:text-[#141414] text-white font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Notice</span>
              </button>
            </div>

            <div className="divide-y divide-[#F0EBE3] dark:divide-[#26231E]">
              {cms.announcements.map((ann) => (
                <div key={ann.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-[#141414] dark:text-[#FAF8F5] font-medium">{ann.text}</p>
                    <p className="text-[11px] text-[#6B635B] dark:text-[#A89E92]">
                      Link: {ann.linkLabel} → {ann.linkHref}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleAnnouncement(ann.id)}
                      className="p-1 border border-[#DDD6CB] dark:border-[#302B24] rounded-xs"
                    >
                      {ann.enabled ? (
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-[#8A8075]" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingAnnouncement({ ...ann })}
                      className="p-1 border border-[#DDD6CB] dark:border-[#302B24] rounded-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          kind: 'announcement',
                          id: ann.id,
                          label: ann.text.slice(0, 35)
                        })
                      }
                      className="p-1 border border-[#DDD6CB] dark:border-[#302B24] rounded-xs text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ATELIER BRAND STORY */}
      {subTab === 'atelier' && (
        <form
          onSubmit={handleSaveAtelier}
          className="p-6 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] space-y-5 text-xs"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
                Brand Atelier & Heritage Section
              </h2>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={atelierForm.visible}
                  onChange={(e) => setAtelierForm({ ...atelierForm, visible: e.target.checked })}
                />
                <span>Visible on Storefront</span>
              </label>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#785E19] dark:bg-[#D4AF37] dark:text-[#141414] text-white font-semibold"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Atelier Story</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                Kicker
              </label>
              <input
                type="text"
                value={atelierForm.kicker}
                onChange={(e) => setAtelierForm({ ...atelierForm, kicker: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                Section Title
              </label>
              <input
                type="text"
                value={atelierForm.title}
                onChange={(e) => setAtelierForm({ ...atelierForm, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
              Atelier Portrait Image
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={atelierForm.image}
                onChange={(e) => setAtelierForm({ ...atelierForm, image: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
              />
              <button
                type="button"
                onClick={() => setPickerTarget('atelier')}
                className="px-3 py-2 rounded-lg border border-[#785E19] text-[#785E19] dark:text-[#D4AF37] font-semibold"
              >
                Choose Image
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                Overlay Quote
              </label>
              <input
                type="text"
                value={atelierForm.quote}
                onChange={(e) => setAtelierForm({ ...atelierForm, quote: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                Quote Author
              </label>
              <input
                type="text"
                value={atelierForm.quoteAuthor}
                onChange={(e) => setAtelierForm({ ...atelierForm, quoteAuthor: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
              Story Paragraphs (one per line break block)
            </label>
            <textarea
              rows={5}
              value={atelierForm.paragraphs.join('\n\n')}
              onChange={(e) =>
                setAtelierForm({
                  ...atelierForm,
                  paragraphs: e.target.value
                    .split(/\n\s*\n/)
                    .map((p) => p.trim())
                    .filter(Boolean)
                })
              }
              className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
            />
          </div>
        </form>
      )}

      {/* TAB 5: TESTIMONIALS / REVIEWS CRUD */}
      {subTab === 'reviews' && (
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] flex items-center justify-between">
            <div>
              <h2 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
                Customer Testimonials & Posts
              </h2>
              <p className="text-[#6B635B] dark:text-[#A89E92]">
                Manage verified reviews displayed in the Patron Reflections section.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setEditingReview({
                  id: `rev-${Date.now().toString(36)}`,
                  author: '',
                  city: 'Lahore',
                  rating: 5,
                  title: '',
                  comment: '',
                  date: new Date().toLocaleDateString('en-PK', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }),
                  perfumeName: cms.products[0]?.name || 'Oud Royale'
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#141414] dark:bg-[#D4AF37] dark:text-[#141414] text-white font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Add Testimonial</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cms.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#785E19] dark:text-[#D4AF37]">
                      ★ {rev.rating}/5 · {rev.perfumeName}
                    </span>
                    <span className="text-[11px] text-[#6B635B] dark:text-[#A89E92]">
                      {rev.author} ({rev.city})
                    </span>
                  </div>
                  <h3 className="font-serif-luxury text-lg font-semibold text-[#141414] dark:text-[#FAF8F5]">
                    “{rev.title}”
                  </h3>
                  <p className="text-[#4A443E] dark:text-[#C7BEB2] leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#F0EBE3] dark:border-[#26231E] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingReview({ ...rev })}
                    className="px-3 py-1.5 rounded-md border border-[#DDD6CB] dark:border-[#302B24]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteTarget({ kind: 'review', id: rev.id, label: rev.author })
                    }
                    className="px-3 py-1.5 rounded-md border border-[#DDD6CB] dark:border-[#302B24] text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Section Editor Modal */}
      {editingCustom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setEditingCustom(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] p-6 space-y-4 text-xs shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
                Configure Custom Section
              </h2>
              <button type="button" onClick={() => setEditingCustom(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                  Kicker
                </label>
                <input
                  type="text"
                  value={editingCustom.kicker}
                  onChange={(e) => setEditingCustom({ ...editingCustom, kicker: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={editingCustom.title}
                  onChange={(e) => setEditingCustom({ ...editingCustom, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                  Layout Style
                </label>
                <select
                  value={editingCustom.layout}
                  onChange={(e) =>
                    setEditingCustom({
                      ...editingCustom,
                      layout: e.target.value as CustomSectionItem['layout']
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                >
                  <option value="split-left">Split Media Left</option>
                  <option value="split-right">Split Media Right</option>
                  <option value="centered-banner">Centered Media Banner</option>
                  <option value="video-showcase">Video Showcase</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                  Theme Contrast
                </label>
                <select
                  value={editingCustom.theme}
                  onChange={(e) =>
                    setEditingCustom({
                      ...editingCustom,
                      theme: e.target.value as 'light' | 'dark'
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                >
                  <option value="light">Warm Ivory (Light)</option>
                  <option value="dark">Onyx Charcoal (Dark)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                Media Asset (Image or Video from Media Library)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editingCustom.mediaUrl}
                  onChange={(e) => setEditingCustom({ ...editingCustom, mediaUrl: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
                <button
                  type="button"
                  onClick={() => setPickerTarget('custom')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#785E19] text-[#785E19] dark:text-[#D4AF37] font-semibold"
                >
                  <Film className="w-4 h-4" />
                  <span>Pick Image / Video</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                Subtitle / Lead Line
              </label>
              <input
                type="text"
                value={editingCustom.description}
                onChange={(e) =>
                  setEditingCustom({ ...editingCustom, description: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                Body Copy
              </label>
              <textarea
                rows={3}
                value={editingCustom.body}
                onChange={(e) => setEditingCustom({ ...editingCustom, body: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                  Button Label
                </label>
                <input
                  type="text"
                  value={editingCustom.ctaLabel}
                  onChange={(e) =>
                    setEditingCustom({ ...editingCustom, ctaLabel: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                  Button Target Link
                </label>
                <input
                  type="text"
                  value={editingCustom.ctaHref}
                  onChange={(e) => setEditingCustom({ ...editingCustom, ctaHref: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE3D9] dark:border-[#2B2620]">
              <button
                type="button"
                onClick={() => setEditingCustom(null)}
                className="px-4 py-2 rounded-lg border border-[#DDD6CB] dark:border-[#302B24]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingCustom.title.trim()) return;
                  upsertCustomSection({
                    ...editingCustom,
                    updatedAt: new Date().toISOString()
                  });
                  onNotify(`Saved custom section "${editingCustom.title}".`);
                  setEditingCustom(null);
                }}
                className="px-5 py-2 rounded-lg bg-[#141414] dark:bg-[#D4AF37] dark:text-[#141414] text-white font-semibold"
              >
                Save Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nav Link Editor Modal */}
      {editingNav && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setEditingNav(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] p-6 space-y-4 text-xs shadow-2xl"
          >
            <h3 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
              Navigation Link
            </h3>
            <div>
              <label className="block font-semibold mb-1">Label *</label>
              <input
                type="text"
                value={editingNav.label}
                onChange={(e) => setEditingNav({ ...editingNav, label: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Target URL / Anchor (#...)</label>
              <input
                type="text"
                value={editingNav.href}
                onChange={(e) => setEditingNav({ ...editingNav, href: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Optional Category Filter</label>
              <select
                value={editingNav.categoryFilter || ''}
                onChange={(e) =>
                  setEditingNav({
                    ...editingNav,
                    categoryFilter: (e.target.value || undefined) as FragranceCategory | undefined
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
              >
                <option value="">None</option>
                <option value="all">All Fragrances</option>
                <option value="men">Men’s</option>
                <option value="women">Women’s</option>
                <option value="oud">Luxury Oud</option>
                <option value="floral">Fresh & Floral</option>
              </select>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editingNav.visible}
                onChange={(e) => setEditingNav({ ...editingNav, visible: e.target.checked })}
              />
              <span>Visible in navbar</span>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingNav(null)}
                className="px-4 py-2 rounded-lg border border-[#DDD6CB] dark:border-[#302B24]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingNav.label.trim()) return;
                  saveNavLink(editingNav);
                  onNotify(`Saved navigation link "${editingNav.label}".`);
                  setEditingNav(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#141414] dark:bg-[#D4AF37] dark:text-[#141414] text-white font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {editingAnnouncement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setEditingAnnouncement(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] p-6 space-y-4 text-xs shadow-2xl"
          >
            <h3 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
              Announcement Notice
            </h3>
            <div>
              <label className="block font-semibold mb-1">Announcement Text *</label>
              <textarea
                rows={2}
                value={editingAnnouncement.text}
                onChange={(e) =>
                  setEditingAnnouncement({ ...editingAnnouncement, text: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Link Label</label>
                <input
                  type="text"
                  value={editingAnnouncement.linkLabel}
                  onChange={(e) =>
                    setEditingAnnouncement({ ...editingAnnouncement, linkLabel: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Link Target</label>
                <input
                  type="text"
                  value={editingAnnouncement.linkHref}
                  onChange={(e) =>
                    setEditingAnnouncement({ ...editingAnnouncement, linkHref: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingAnnouncement(null)}
                className="px-4 py-2 rounded-lg border border-[#DDD6CB] dark:border-[#302B24]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingAnnouncement.text.trim()) return;
                  saveAnnouncement(editingAnnouncement);
                  onNotify('Announcement saved.');
                  setEditingAnnouncement(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#141414] dark:bg-[#D4AF37] dark:text-[#141414] text-white font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {editingReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setEditingReview(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] p-6 space-y-4 text-xs shadow-2xl"
          >
            <h3 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
              Customer Testimonial
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Author Name *</label>
                <input
                  type="text"
                  value={editingReview.author}
                  onChange={(e) => setEditingReview({ ...editingReview, author: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">City</label>
                <input
                  type="text"
                  value={editingReview.city}
                  onChange={(e) => setEditingReview({ ...editingReview, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Perfume Reviewed</label>
                <input
                  type="text"
                  value={editingReview.perfumeName}
                  onChange={(e) =>
                    setEditingReview({ ...editingReview, perfumeName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Rating (1-5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={editingReview.rating}
                  onChange={(e) =>
                    setEditingReview({ ...editingReview, rating: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1">Headline *</label>
              <input
                type="text"
                value={editingReview.title}
                onChange={(e) => setEditingReview({ ...editingReview, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Review Quote *</label>
              <textarea
                rows={3}
                value={editingReview.comment}
                onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="px-4 py-2 rounded-lg border border-[#DDD6CB] dark:border-[#302B24]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingReview.author.trim() || !editingReview.title.trim()) return;
                  upsertReview(editingReview);
                  onNotify(`Saved testimonial by "${editingReview.author}".`);
                  setEditingReview(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#141414] dark:bg-[#D4AF37] dark:text-[#141414] text-white font-semibold"
              >
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}

      <MediaPickerModal
        open={pickerTarget !== null}
        acceptType={pickerTarget === 'custom' ? 'all' : 'image'}
        defaultFolder={pickerTarget === 'custom' ? 'Videos' : 'Hero & Banners'}
        currentValue={
          pickerTarget === 'hero'
            ? heroForm.heroImage
            : pickerTarget === 'atelier'
              ? atelierForm.image
              : editingCustom?.mediaUrl
        }
        onSelect={(src, mediaType) => {
          if (pickerTarget === 'hero') setHeroForm({ ...heroForm, heroImage: src });
          if (pickerTarget === 'atelier') setAtelierForm({ ...atelierForm, image: src });
          if (pickerTarget === 'custom' && editingCustom) {
            setEditingCustom({ ...editingCustom, mediaUrl: src, mediaType });
          }
        }}
        onClose={() => setPickerTarget(null)}
      />

      <ConfirmModal
        open={deleteTarget !== null}
        title="Confirm Removal"
        description={`Remove "${deleteTarget?.label}"? This takes effect immediately on the storefront.`}
        confirmLabel="Remove"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          if (deleteTarget.kind === 'custom') deleteCustomSection(deleteTarget.id);
          if (deleteTarget.kind === 'nav') deleteNavLink(deleteTarget.id);
          if (deleteTarget.kind === 'announcement') deleteAnnouncement(deleteTarget.id);
          if (deleteTarget.kind === 'review') deleteReview(deleteTarget.id);
          onNotify(`Removed "${deleteTarget.label}".`);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
};
