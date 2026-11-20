import React from 'react';
import {
  Package,
  Users,
  UserCheck,
  Mail,
  Image as ImageIcon,
  Film,
  Plus,
  LayoutTemplate,
  Settings,
  ShoppingBag,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { useSiteContent } from '../../context/SiteContentContext';
import { useShop } from '../../context/ShopContext';
import { CmsImage } from '../CmsMedia';

export type AdminTabKey =
  | 'dashboard'
  | 'content'
  | 'catalog'
  | 'users'
  | 'media'
  | 'settings';

interface AdminDashboardTabProps {
  onNavigateTab: (tab: AdminTabKey) => void;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({ onNavigateTab }) => {
  const { cms, mediaItems, logs, storageUsage } = useSiteContent();
  const { orderHistory } = useShop();

  const totalContentItems =
    cms.products.length +
    cms.collections.length +
    cms.reviews.length +
    cms.customSections.length +
    cms.announcements.length +
    cms.navLinks.length;

  const totalUsers = cms.users.length;
  const activeUsers = cms.users.filter((u) => u.status !== 'blocked').length;
  const unreadMessages = cms.messages.filter((m) => m.status === 'unread').length;
  const uploadedImages = mediaItems.filter((m) => m.mediaType === 'image').length;
  const uploadedVideos = mediaItems.filter((m) => m.mediaType === 'video').length;

  const totalRevenue =
    orderHistory.reduce((sum, o) => sum + o.total, 0) +
    cms.users.reduce((sum, u) => sum + u.totalSpent, 0);

  const kpis = [
    {
      label: 'Total Content Items',
      value: totalContentItems,
      sub: `${cms.products.length} perfumes · ${cms.customSections.length} custom blocks`,
      icon: Package,
      onClick: () => onNavigateTab('content')
    },
    {
      label: 'Registered Users',
      value: totalUsers,
      sub: `${activeUsers} active · ${cms.users.filter((u) => u.status === 'vip').length} VIP`,
      icon: Users,
      onClick: () => onNavigateTab('users')
    },
    {
      label: 'Active Users',
      value: activeUsers,
      sub: `${totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}% account standing`,
      icon: UserCheck,
      onClick: () => onNavigateTab('users')
    },
    {
      label: 'Inbox Messages',
      value: cms.messages.length,
      sub: `${unreadMessages} unread inquiries`,
      icon: Mail,
      onClick: () => onNavigateTab('users')
    },
    {
      label: 'Uploaded Images',
      value: uploadedImages,
      sub: 'Built-in + IndexedDB assets',
      icon: ImageIcon,
      onClick: () => onNavigateTab('media')
    },
    {
      label: 'Uploaded Videos',
      value: uploadedVideos,
      sub: 'Stored locally in IndexedDB',
      icon: Film,
      onClick: () => onNavigateTab('media')
    }
  ];

  // Category distribution chart data
  const categoryStats = [
    { id: 'men', label: 'Men’s' },
    { id: 'women', label: 'Women’s' },
    { id: 'unisex', label: 'Unisex' },
    { id: 'oud', label: 'Luxury Oud' },
    { id: 'floral', label: 'Fresh & Floral' },
    { id: 'signature', label: 'Signature' }
  ].map((cat) => ({
    ...cat,
    count: cms.products.filter((p) => p.category === cat.id).length
  }));
  const maxCatCount = Math.max(1, ...categoryStats.map((c) => c.count));

  // Scent family distribution
  const familyStats = ['Woody', 'Oud', 'Floral', 'Fresh', 'Citrus', 'Spicy'].map((fam) => ({
    family: fam,
    count: cms.products.filter((p) => p.fragranceFamily === fam).length
  }));

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
            Boutique Command Center
          </h1>
          <p className="text-xs sm:text-sm text-[#6B635B] dark:text-[#A89E92]">
            Live overview of local storefront content, catalog inventory, patrons, and media assets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab('catalog')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#141414] hover:bg-[#785E19] dark:bg-[#D4AF37] dark:hover:bg-[#E0BE52] text-white dark:text-[#141414] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Perfume</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('content')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] text-[#141414] dark:text-[#FAF8F5] hover:border-[#785E19] text-xs font-medium transition-colors cursor-pointer"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-[#785E19] dark:text-[#D4AF37]" />
            <span>Edit Homepage</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('media')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] text-[#141414] dark:text-[#FAF8F5] hover:border-[#785E19] text-xs font-medium transition-colors cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#785E19] dark:text-[#D4AF37]" />
            <span>Upload Media</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('settings')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] text-[#141414] dark:text-[#FAF8F5] hover:border-[#785E19] text-xs font-medium transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-[#785E19] dark:text-[#D4AF37]" />
            <span>Site Settings</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (Single-Elevation 1px Bordered Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <button
              key={kpi.label}
              type="button"
              onClick={kpi.onClick}
              className="text-left p-5 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] hover:border-[#D4AF37]/70 transition-colors flex items-start justify-between gap-4 cursor-pointer"
            >
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-[0.14em] font-semibold text-[#6B635B] dark:text-[#A89E92]">
                  {kpi.label}
                </span>
                <p className="text-2xl sm:text-3xl font-semibold text-[#141414] dark:text-[#FAF8F5] font-mono tabular-nums">
                  {kpi.value}
                </p>
                <p className="text-xs text-[#736B63] dark:text-[#9E958A]">{kpi.sub}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] dark:bg-[#23201B] border border-[#EAE3D9] dark:border-[#302B24] flex items-center justify-center text-[#785E19] dark:text-[#D4AF37] shrink-0">
                <Icon className="w-5 h-5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Analytics Visualization Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Catalog Distribution Chart */}
        <div className="lg:col-span-7 p-6 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
                Fragrance Catalog by Category
              </h2>
              <p className="text-xs text-[#6B635B] dark:text-[#A89E92]">
                Live inventory distribution across boutique departments
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-[#785E19] dark:text-[#D4AF37] font-semibold">
              {cms.products.length} SKUs
            </span>
          </div>

          <div className="space-y-3">
            {categoryStats.map((cat) => {
              const widthPct = Math.round((cat.count / maxCatCount) * 100);
              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#141414] dark:text-[#E8DCC4]">
                      {cat.label}
                    </span>
                    <span className="font-mono tabular-nums text-[#5C544D] dark:text-[#A89E92]">
                      {cat.count} fragrances
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[#F2ECE4] dark:bg-[#25221D] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#785E19] dark:bg-[#D4AF37] transition-all duration-500"
                      style={{ width: `${Math.max(4, widthPct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Olfactory Notes + Revenue & Local Storage Summary */}
        <div className="lg:col-span-5 p-6 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
                Commerce & Storage Pulse
              </h2>
              <ShoppingBag className="w-4 h-4 text-[#785E19] dark:text-[#D4AF37]" />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#EAE3D9] dark:border-[#2B2620]">
                <span className="text-[11px] uppercase tracking-wider text-[#6B635B] dark:text-[#A89E92] block">
                  Patron LTV & Orders
                </span>
                <p className="font-mono tabular-nums text-base sm:text-lg font-bold text-[#141414] dark:text-[#E6CA85] mt-1">
                  ₨ {totalRevenue.toLocaleString('en-PK')}
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#EAE3D9] dark:border-[#2B2620]">
                <span className="text-[11px] uppercase tracking-wider text-[#6B635B] dark:text-[#A89E92] block">
                  LocalStorage Used
                </span>
                <p className="font-mono tabular-nums text-base sm:text-lg font-bold text-[#141414] dark:text-[#FAF8F5] mt-1">
                  {Math.round(storageUsage.usedBytes / 1024)} KB ({storageUsage.percentOf5Mb}%)
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B635B] dark:text-[#A89E92] block">
              Scent Family Mix
            </span>
            <div className="grid grid-cols-3 gap-2">
              {familyStats.map((item) => (
                <div
                  key={item.family}
                  className="p-2.5 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#EAE3D9] dark:border-[#2B2620] text-center"
                >
                  <span className="font-mono tabular-nums text-sm font-bold text-[#141414] dark:text-[#FAF8F5] block">
                    {item.count}
                  </span>
                  <span className="text-[11px] text-[#6B635B] dark:text-[#A89E92]">
                    {item.family}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recently Updated Content & Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Catalog / Content Items */}
        <div className="lg:col-span-6 p-6 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
              Featured Storefront Flacons
            </h2>
            <button
              type="button"
              onClick={() => onNavigateTab('catalog')}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#785E19] dark:text-[#D4AF37] hover:underline cursor-pointer"
            >
              <span>Manage Catalog</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#F0EBE3] dark:divide-[#26231E]">
            {cms.products.slice(0, 5).map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-md overflow-hidden bg-[#141414] shrink-0">
                    <CmsImage src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#141414] dark:text-[#FAF8F5] truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-[#6B635B] dark:text-[#A89E92] truncate">
                      {p.category.toUpperCase()} · {p.fragranceFamily}
                    </p>
                  </div>
                </div>
                <span className="font-mono tabular-nums text-xs font-semibold text-[#141414] dark:text-[#E6CA85] shrink-0">
                  ₨ {p.price.toLocaleString('en-PK')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Admin Activity Logs */}
        <div className="lg:col-span-6 p-6 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
              Recent Admin Activities
            </h2>
            <button
              type="button"
              onClick={() => onNavigateTab('settings')}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#785E19] dark:text-[#D4AF37] hover:underline cursor-pointer"
            >
              <span>Security Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {logs.length === 0 ? (
            <p className="text-xs text-[#6B635B] dark:text-[#A89E92] py-8 text-center">
              Activity logs will appear here as you edit website content or manage users.
            </p>
          ) : (
            <div className="divide-y divide-[#F0EBE3] dark:divide-[#26231E]">
              {logs.slice(0, 6).map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-semibold text-[#785E19] dark:text-[#D4AF37]">
                        {log.action}
                      </span>
                      <span className="text-xs text-[#6B635B] dark:text-[#A89E92]">
                        · {log.target}
                      </span>
                    </div>
                    <p className="text-xs text-[#3F3A35] dark:text-[#D4C8B8] truncate">
                      {log.details}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono tabular-nums text-[#736B63] dark:text-[#9E958A] shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
