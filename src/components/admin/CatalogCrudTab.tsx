import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Image as ImageIcon,
  Star,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useSiteContent } from '../../context/SiteContentContext';
import type { PerfumeProduct, CollectionItem, FragranceCategory } from '../../types/perfume';
import { CmsImage } from '../CmsMedia';
import { ConfirmModal, MediaPickerModal } from './AdminShared';

interface CatalogCrudTabProps {
  onNotify: (msg: string) => void;
}

const ITEMS_PER_PAGE = 6;

export const CatalogCrudTab: React.FC<CatalogCrudTabProps> = ({ onNotify }) => {
  const { cms, upsertProduct, deleteProduct, upsertCollection, deleteCollection } = useSiteContent();
  const [subTab, setSubTab] = useState<'products' | 'collections'>('products');

  // Products filters & pagination
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  // Product modal editor state
  const [editingProduct, setEditingProduct] = useState<PerfumeProduct | null>(null);
  const [notesTopStr, setNotesTopStr] = useState('');
  const [notesHeartStr, setNotesHeartStr] = useState('');
  const [notesBaseStr, setNotesBaseStr] = useState('');
  const [price30, setPrice30] = useState(0);
  const [price50, setPrice50] = useState(0);
  const [price100, setPrice100] = useState(0);

  // Collection editor modal state
  const [editingCollection, setEditingCollection] = useState<CollectionItem | null>(null);

  // Delete & Media modals
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'product' | 'collection';
    id: string;
    name: string;
  } | null>(null);
  const [pickerTarget, setPickerTarget] = useState<'product' | 'collection' | null>(null);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cms.products.filter((p) => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.fragranceFamily.toLowerCase().includes(q)
      );
    });
  }, [cms.products, search, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const openNewProduct = () => {
    const defaultProd: PerfumeProduct = {
      id: `perf-${Date.now().toString(36)}`,
      name: '',
      subtitle: 'Extrait de Parfum',
      brand: cms.siteSettings.siteName || 'Maison d’Or',
      category: 'unisex',
      fragranceFamily: 'Woody',
      price: 22000,
      originalPrice: 25000,
      description: '',
      story: '',
      image: '/images/oud-royale.webp',
      notes: { top: ['Bergamot', 'Saffron'], heart: ['Damask Rose'], base: ['Amberwood', 'Musk'] },
      sizes: [
        { size: '30 ml', price: 9500 },
        { size: '50 ml', price: 14500 },
        { size: '100 ml', price: 22000 }
      ],
      longevity: '12–14 Hours',
      sillage: 'Strong',
      season: 'All Seasons',
      inStock: true,
      rating: 4.9,
      reviewCount: 1,
      isBestSeller: false,
      isNewArrival: true
    };
    openEditProduct(defaultProd);
  };

  const openEditProduct = (prod: PerfumeProduct) => {
    setEditingProduct({ ...prod });
    setNotesTopStr(prod.notes.top.join(', '));
    setNotesHeartStr(prod.notes.heart.join(', '));
    setNotesBaseStr(prod.notes.base.join(', '));
    setPrice30(prod.sizes.find((s) => s.size.includes('30'))?.price ?? Math.round(prod.price * 0.42));
    setPrice50(prod.sizes.find((s) => s.size.includes('50'))?.price ?? Math.round(prod.price * 0.65));
    setPrice100(prod.sizes.find((s) => s.size.includes('100'))?.price ?? prod.price);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name.trim()) return;

    const cleanSplit = (str: string) =>
      str
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    const payload: PerfumeProduct = {
      ...editingProduct,
      name: editingProduct.name.trim(),
      price: Number(price100) || Number(editingProduct.price) || 18000,
      originalPrice: editingProduct.originalPrice ? Number(editingProduct.originalPrice) : undefined,
      notes: {
        top: cleanSplit(notesTopStr).length ? cleanSplit(notesTopStr) : ['Bergamot'],
        heart: cleanSplit(notesHeartStr).length ? cleanSplit(notesHeartStr) : ['Rose'],
        base: cleanSplit(notesBaseStr).length ? cleanSplit(notesBaseStr) : ['Amber']
      },
      sizes: [
        { size: '30 ml', price: Number(price30) || 8500 },
        { size: '50 ml', price: Number(price50) || 14000 },
        { size: '100 ml', price: Number(price100) || 18000 }
      ]
    };

    upsertProduct(payload);
    setEditingProduct(null);
    onNotify(`Saved fragrance "${payload.name}" to catalog.`);
  };

  const handleSaveCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection || !editingCollection.name.trim()) return;
    upsertCollection({
      ...editingCollection,
      itemCount: Number(editingCollection.itemCount) || 1
    });
    setEditingCollection(null);
    onNotify(`Saved collection "${editingCollection.name}".`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
            Fragrances & Collections
          </h1>
          <p className="text-xs sm:text-sm text-[#6B635B] dark:text-[#A89E92]">
            Add, edit, price, and organize every perfume and olfactory collection live on the storefront.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] p-1">
            <button
              type="button"
              onClick={() => setSubTab('products')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                subTab === 'products'
                  ? 'bg-[#141414] text-white dark:bg-[#D4AF37] dark:text-[#141414]'
                  : 'text-[#5C544D] dark:text-[#B5ABA0]'
              }`}
            >
              Perfumes ({cms.products.length})
            </button>
            <button
              type="button"
              onClick={() => setSubTab('collections')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                subTab === 'collections'
                  ? 'bg-[#141414] text-white dark:bg-[#D4AF37] dark:text-[#141414]'
                  : 'text-[#5C544D] dark:text-[#B5ABA0]'
              }`}
            >
              Collections ({cms.collections.length})
            </button>
          </div>
        </div>
      </div>

      {subTab === 'products' ? (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-1 flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-[#736B63] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search perfumes by name or family..."
                  aria-label="Search catalog perfumes"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24] text-xs text-[#141414] dark:text-[#FAF8F5] focus:outline-hidden focus:border-[#785E19]"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by category"
                className="px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24] text-xs text-[#141414] dark:text-[#FAF8F5]"
              >
                <option value="all">All Categories</option>
                <option value="men">Men’s</option>
                <option value="women">Women’s</option>
                <option value="unisex">Unisex</option>
                <option value="oud">Luxury Oud</option>
                <option value="floral">Fresh & Floral</option>
                <option value="signature">Signature</option>
              </select>
            </div>

            <button
              type="button"
              onClick={openNewProduct}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#785E19] dark:bg-[#D4AF37] dark:text-[#141414] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Fragrance</span>
            </button>
          </div>

          {/* Product Table */}
          <div className="rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EAE3D9] dark:border-[#2B2620] bg-[#FAF8F5] dark:bg-[#141311] text-[11px] uppercase tracking-wider text-[#6B635B] dark:text-[#A89E92]">
                    <th className="py-3 px-4 font-semibold">Fragrance</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Family</th>
                    <th className="py-3 px-4 font-semibold">Price (100ml)</th>
                    <th className="py-3 px-4 font-semibold">Rating</th>
                    <th className="py-3 px-4 font-semibold">Tags</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE3] dark:divide-[#26231E] text-xs">
                  {paginatedProducts.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-[#FAF8F5]/70 dark:hover:bg-[#1E1C18] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-md overflow-hidden bg-[#141414] shrink-0">
                            <CmsImage src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#141414] dark:text-[#FAF8F5]">
                              {p.name}
                            </p>
                            <p className="text-[11px] text-[#6B635B] dark:text-[#A89E92]">
                              {p.subtitle}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 uppercase tracking-wider text-[11px] text-[#4A443E] dark:text-[#D4C8B8]">
                        {p.category}
                      </td>
                      <td className="py-3 px-4 text-[#4A443E] dark:text-[#D4C8B8]">
                        {p.fragranceFamily}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums font-semibold text-[#141414] dark:text-[#E6CA85]">
                        ₨ {p.price.toLocaleString('en-PK')}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums">
                        <span className="inline-flex items-center gap-1 text-[#785E19] dark:text-[#D4AF37]">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {p.rating.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {p.isBestSeller && (
                            <span className="px-2 py-0.5 rounded-xs bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] font-semibold">
                              Best Seller
                            </span>
                          )}
                          {p.isNewArrival && (
                            <span className="px-2 py-0.5 rounded-xs bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-semibold">
                              New
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditProduct(p)}
                            className="p-1.5 rounded-md border border-[#E5E0D8] dark:border-[#302B24] hover:border-[#785E19] text-[#4A443E] dark:text-[#D4C8B8]"
                            aria-label={`Edit ${p.name}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({ type: 'product', id: p.id, name: p.name })
                            }
                            className="p-1.5 rounded-md border border-[#E5E0D8] dark:border-[#302B24] hover:border-red-500 text-red-600 dark:text-red-400"
                            aria-label={`Delete ${p.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedProducts.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-10 text-center text-xs text-[#6B635B] dark:text-[#A89E92]"
                      >
                        No fragrances match your current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-[#EAE3D9] dark:border-[#2B2620] flex items-center justify-between text-xs text-[#6B635B] dark:text-[#A89E92]">
              <span className="font-mono tabular-nums">
                Showing {paginatedProducts.length} of {filteredProducts.length} fragrances
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-md border border-[#DDD6CB] dark:border-[#302B24] disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono tabular-nums">
                  {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-md border border-[#DDD6CB] dark:border-[#302B24] disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Collections Management */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cms.collections.map((col) => (
            <div
              key={col.id}
              className="rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] overflow-hidden flex flex-col justify-between"
            >
              <div className="aspect-[16/9] bg-[#141414] relative overflow-hidden">
                <CmsImage src={col.image} alt={col.name} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-xs bg-black/75 text-[#E6CA85] text-[10px] font-semibold uppercase tracking-wider">
                  {col.id}
                </span>
              </div>
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif-luxury text-lg font-semibold text-[#141414] dark:text-[#FAF8F5]">
                      {col.name}
                    </h3>
                    <span className="text-xs font-mono tabular-nums text-[#785E19] dark:text-[#D4AF37]">
                      {col.itemCount} items
                    </span>
                  </div>
                  <p className="text-xs text-[#6B635B] dark:text-[#A89E92] mt-1 line-clamp-2">
                    {col.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#F0EBE3] dark:border-[#26231E] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCollection({ ...col })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-[#DDD6CB] dark:border-[#302B24] text-xs font-medium text-[#141414] dark:text-[#FAF8F5] hover:border-[#785E19]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteTarget({ type: 'collection', id: col.id, name: col.name })
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-[#DDD6CB] dark:border-[#302B24] text-xs font-medium text-red-600 dark:text-red-400 hover:border-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {editingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setEditingProduct(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] shadow-2xl"
          >
            <div className="px-6 py-4 border-b border-[#EAE3D9] dark:border-[#2B2620] flex items-center justify-between sticky top-0 bg-white dark:bg-[#191714] z-10">
              <h2 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
                {cms.products.some((p) => p.id === editingProduct.id)
                  ? `Edit ${editingProduct.name}`
                  : 'Create New Fragrance'}
              </h2>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                aria-label="Close modal"
                className="p-1.5 rounded-full hover:bg-[#F2ECE4] dark:hover:bg-[#26231D]"
              >
                <X className="w-5 h-5 text-[#5C544D] dark:text-[#C7BEB2]" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1 text-[#4A443E] dark:text-[#D4C8B8]">
                    Perfume Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24] text-[#141414] dark:text-[#FAF8F5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1 text-[#4A443E] dark:text-[#D4C8B8]">
                    Subtitle (e.g. Extrait de Parfum)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.subtitle}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, subtitle: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24] text-[#141414] dark:text-[#FAF8F5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1 text-[#4A443E] dark:text-[#D4C8B8]">
                    Category
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category: e.target.value as FragranceCategory
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24] text-[#141414] dark:text-[#FAF8F5]"
                  >
                    <option value="men">Men’s</option>
                    <option value="women">Women’s</option>
                    <option value="unisex">Unisex</option>
                    <option value="oud">Luxury Oud</option>
                    <option value="floral">Fresh & Floral</option>
                    <option value="signature">Signature</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1 text-[#4A443E] dark:text-[#D4C8B8]">
                    Scent Family
                  </label>
                  <select
                    value={editingProduct.fragranceFamily}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        fragranceFamily: e.target.value as PerfumeProduct['fragranceFamily']
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24] text-[#141414] dark:text-[#FAF8F5]"
                  >
                    <option value="Woody">Woody</option>
                    <option value="Floral">Floral</option>
                    <option value="Fresh">Fresh</option>
                    <option value="Spicy">Spicy</option>
                    <option value="Citrus">Citrus</option>
                    <option value="Oud">Oud</option>
                    <option value="Sweet & Vanilla">Sweet &amp; Vanilla</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1 text-[#4A443E] dark:text-[#D4C8B8]">
                    Compare-at Original (PKR)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        originalPrice: e.target.value ? Number(e.target.value) : undefined
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24] text-[#141414] dark:text-[#FAF8F5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1 text-[#4A443E] dark:text-[#D4C8B8]">
                    30ml Price (PKR)
                  </label>
                  <input
                    type="number"
                    value={price30}
                    onChange={(e) => setPrice30(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24] text-[#141414] dark:text-[#FAF8F5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1 text-[#4A443E] dark:text-[#D4C8B8]">
                    50ml Price (PKR)
                  </label>
                  <input
                    type="number"
                    value={price50}
                    onChange={(e) => setPrice50(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24] text-[#141414] dark:text-[#FAF8F5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1 text-[#4A443E] dark:text-[#D4C8B8]">
                    100ml Price (PKR) *
                  </label>
                  <input
                    required
                    type="number"
                    value={price100}
                    onChange={(e) => setPrice100(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24] text-[#141414] dark:text-[#FAF8F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1 text-[#4A443E] dark:text-[#D4C8B8]">
                  Product Image URL / Media Library Reference
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingProduct.image}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, image: e.target.value })
                    }
                    className="flex-1 px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24] text-[#141414] dark:text-[#FAF8F5]"
                  />
                  <button
                    type="button"
                    onClick={() => setPickerTarget('product')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#785E19] text-[#785E19] dark:text-[#D4AF37] font-semibold hover:bg-[#FAF8F5] dark:hover:bg-[#23201B]"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Browse Media</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1 text-[#4A443E] dark:text-[#D4C8B8]">
                    Top Notes (comma-sep)
                  </label>
                  <input
                    type="text"
                    value={notesTopStr}
                    onChange={(e) => setNotesTopStr(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24] text-[#141414] dark:text-[#FAF8F5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1 text-[#4A443E] dark:text-[#D4C8B8]">
                    Heart Notes
                  </label>
                  <input
                    type="text"
                    value={notesHeartStr}
                    onChange={(e) => setNotesHeartStr(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24] text-[#141414] dark:text-[#FAF8F5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1 text-[#4A443E] dark:text-[#D4C8B8]">
                    Base Notes
                  </label>
                  <input
                    type="text"
                    value={notesBaseStr}
                    onChange={(e) => setNotesBaseStr(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24] text-[#141414] dark:text-[#FAF8F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1 text-[#4A443E] dark:text-[#D4C8B8]">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24] text-[#141414] dark:text-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1 text-[#4A443E] dark:text-[#D4C8B8]">
                  Editorial Story (Shown in Best Sellers Spotlight)
                </label>
                <textarea
                  rows={2}
                  value={editingProduct.story}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, story: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24] text-[#141414] dark:text-[#FAF8F5]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer text-[#141414] dark:text-[#FAF8F5]">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.inStock)}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, inStock: e.target.checked })
                    }
                  />
                  <span>In Stock</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer text-[#141414] dark:text-[#FAF8F5]">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.isBestSeller)}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })
                    }
                  />
                  <span>Feature in Best Sellers</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer text-[#141414] dark:text-[#FAF8F5]">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.isNewArrival)}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, isNewArrival: e.target.checked })
                    }
                  />
                  <span>Mark as New Arrival</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAE3D9] dark:border-[#2B2620]">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-lg border border-[#DDD6CB] dark:border-[#302B24] text-[#5C544D] dark:text-[#C7BEB2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#141414] hover:bg-[#785E19] dark:bg-[#D4AF37] dark:text-[#141414] text-white font-semibold"
                >
                  Save Fragrance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collection Editor Modal */}
      {editingCollection && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setEditingCollection(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
                Edit Collection · {editingCollection.name}
              </h2>
              <button type="button" onClick={() => setEditingCollection(null)}>
                <X className="w-5 h-5 text-[#5C544D] dark:text-[#C7BEB2]" />
              </button>
            </div>
            <form onSubmit={handleSaveCollection} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1 text-[#4A443E] dark:text-[#D4C8B8]">
                  Collection Name *
                </label>
                <input
                  required
                  type="text"
                  value={editingCollection.name}
                  onChange={(e) =>
                    setEditingCollection({ ...editingCollection, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24] text-[#141414] dark:text-[#FAF8F5]"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1 text-[#4A443E] dark:text-[#D4C8B8]">
                  Displayed Fragrance Count
                </label>
                <input
                  type="number"
                  value={editingCollection.itemCount}
                  onChange={(e) =>
                    setEditingCollection({
                      ...editingCollection,
                      itemCount: Number(e.target.value)
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24] text-[#141414] dark:text-[#FAF8F5]"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1 text-[#4A443E] dark:text-[#D4C8B8]">
                  Collection Cover Image
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingCollection.image}
                    onChange={(e) =>
                      setEditingCollection({ ...editingCollection, image: e.target.value })
                    }
                    className="flex-1 px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24] text-[#141414] dark:text-[#FAF8F5]"
                  />
                  <button
                    type="button"
                    onClick={() => setPickerTarget('collection')}
                    className="px-3 py-2 rounded-lg border border-[#785E19] text-[#785E19] dark:text-[#D4AF37] font-semibold"
                  >
                    Browse
                  </button>
                </div>
              </div>
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1 text-[#4A443E] dark:text-[#D4C8B8]">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingCollection.description}
                  onChange={(e) =>
                    setEditingCollection({ ...editingCollection, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24] text-[#141414] dark:text-[#FAF8F5]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCollection(null)}
                  className="px-4 py-2 rounded-lg border border-[#DDD6CB] dark:border-[#302B24]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#141414] dark:bg-[#D4AF37] dark:text-[#141414] text-white font-semibold"
                >
                  Save Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MediaPickerModal
        open={pickerTarget !== null}
        acceptType="image"
        defaultFolder={pickerTarget === 'collection' ? 'Collections' : 'Products'}
        currentValue={
          pickerTarget === 'product' ? editingProduct?.image : editingCollection?.image
        }
        onSelect={(src) => {
          if (pickerTarget === 'product' && editingProduct) {
            setEditingProduct({ ...editingProduct, image: src });
          } else if (pickerTarget === 'collection' && editingCollection) {
            setEditingCollection({ ...editingCollection, image: src });
          }
        }}
        onClose={() => setPickerTarget(null)}
      />

      <ConfirmModal
        open={deleteTarget !== null}
        title={`Delete ${deleteTarget?.type === 'collection' ? 'Collection' : 'Fragrance'}?`}
        description={`Are you sure you want to remove "${deleteTarget?.name}" from your live boutique? This updates LocalStorage immediately.`}
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          if (deleteTarget.type === 'product') {
            deleteProduct(deleteTarget.id);
          } else {
            deleteCollection(deleteTarget.id);
          }
          onNotify(`Deleted "${deleteTarget.name}".`);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
};
