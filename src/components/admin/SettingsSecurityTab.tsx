import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  ShieldAlert,
  KeyRound,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Image as ImageIcon,
  Clock,
  Info
} from 'lucide-react';
import { useSiteContent } from '../../context/SiteContentContext';
import {
  getAdminVault,
  updateAdminCredentials,
  updateSessionTimeoutMinutes,
  resetAdminVaultToDefaults
} from '../../utils/adminAuth';
import { ConfirmModal, MediaPickerModal } from './AdminShared';

interface SettingsSecurityTabProps {
  onNotify: (msg: string) => void;
  onSessionTerminated: () => void;
}

export const SettingsSecurityTab: React.FC<SettingsSecurityTabProps> = ({
  onNotify,
  onSessionTerminated
}) => {
  const {
    cms,
    mediaItems,
    logs,
    storageUsage,
    updateSiteSettings,
    refreshLogs,
    clearLogs,
    exportBackupJson,
    importBackupJson,
    resetAllCmsData
  } = useSiteContent();

  const [subTab, setSubTab] = useState<'website' | 'security' | 'backup'>('website');
  const [settingsForm, setSettingsForm] = useState(cms.siteSettings);

  useEffect(() => {
    setSettingsForm(cms.siteSettings);
  }, [cms.siteSettings]);

  // Security / Credentials state
  const [vault, setVault] = useState(() => getAdminVault());
  const [currentPassword, setCurrentPassword] = useState('');
  const [newAdminId, setNewAdminId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [credStatus, setCredStatus] = useState<{ ok: boolean; text: string } | null>(null);

  // Media picker & confirm dialogs
  const [pickerField, setPickerField] = useState<'logoUrl' | 'faviconUrl' | null>(null);
  const [confirmKind, setConfirmKind] = useState<
    'reset-content' | 'reset-all-media' | 'reset-vault' | null
  >(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const handleSaveWebsiteSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings(settingsForm);
    onNotify('Website branding, theme colors, SEO metadata, and contact info updated.');
  };

  const handleResetThemeColors = () => {
    const defaultColors = {
      background: '#FAF8F5',
      surface: '#FFFFFF',
      text: '#141414',
      accent: '#785E19',
      darkBg: '#141414'
    };
    setSettingsForm((prev) => ({ ...prev, colors: defaultColors }));
    updateSiteSettings({ colors: defaultColors });
    onNotify('Theme color palette restored to Atelier defaults.');
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredStatus(null);
    if (newPassword && newPassword !== confirmNewPassword) {
      setCredStatus({ ok: false, text: 'New password and confirmation do not match.' });
      return;
    }

    const res = await updateAdminCredentials({
      currentPassword,
      newAdminId: newAdminId.trim() || undefined,
      newPassword: newPassword || undefined
    });
    refreshLogs();
    setVault(getAdminVault());
    setCredStatus({ ok: res.ok, text: res.message });
    if (res.ok) {
      setCurrentPassword('');
      setNewAdminId('');
      setNewPassword('');
      setConfirmNewPassword('');
      onNotify('Admin security credentials updated.');
    }
  };

  const handleExportJson = () => {
    const json = exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maisondor-cms-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Downloaded full Maison d’Or JSON backup.');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = importBackupJson(String(reader.result || ''));
      e.target.value = '';
      if (res.ok) {
        onNotify('Restored storefront data successfully from JSON backup.');
      } else {
        onNotify(res.error || 'Import failed.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
          Website Settings, Security & Local Data
        </h1>
        <p className="text-xs sm:text-sm text-[#6B635B] dark:text-[#A89E92]">
          Configure brand identity, live color tokens, SEO tags, Admin credentials, and JSON backups.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#EAE3D9] dark:border-[#2B2620] pb-3">
        {[
          { key: 'website' as const, label: 'Website & SEO Settings' },
          { key: 'security' as const, label: 'Admin Security & Logs' },
          { key: 'backup' as const, label: 'LocalStorage Backup & Reset' }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSubTab(tab.key)}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium cursor-pointer ${
              subTab === tab.key
                ? 'bg-[#141414] text-white dark:bg-[#D4AF37] dark:text-[#141414]'
                : 'bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] text-[#4A443E] dark:text-[#C7BEB2]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: WEBSITE SETTINGS */}
      {subTab === 'website' && (
        <form onSubmit={handleSaveWebsiteSettings} className="space-y-6 text-xs">
          <div className="p-6 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
                Brand Identity & Visual Tokens
              </h2>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#785E19] dark:bg-[#D4AF37] dark:text-[#141414] text-white font-semibold"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Settings</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                  Website Brand Name
                </label>
                <input
                  type="text"
                  value={settingsForm.siteName}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, siteName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                  Header Tagline
                </label>
                <input
                  type="text"
                  value={settingsForm.siteTagline}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, siteTagline: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                  Footer Tagline
                </label>
                <input
                  type="text"
                  value={settingsForm.footerTagline}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, footerTagline: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                  Custom Logo Asset (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={settingsForm.logoUrl}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, logoUrl: e.target.value })
                    }
                    placeholder="Leave blank for classic typography lockup"
                    className="flex-1 px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                  />
                  <button
                    type="button"
                    onClick={() => setPickerField('logoUrl')}
                    className="px-3 py-2 rounded-lg border border-[#785E19] text-[#785E19] dark:text-[#D4AF37] font-semibold inline-flex items-center gap-1"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Pick</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[11px] mb-1">
                  Browser Favicon Asset
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={settingsForm.faviconUrl}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, faviconUrl: e.target.value })
                    }
                    placeholder="Pick from Media Library or enter URL"
                    className="flex-1 px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                  />
                  <button
                    type="button"
                    onClick={() => setPickerField('faviconUrl')}
                    className="px-3 py-2 rounded-lg border border-[#785E19] text-[#785E19] dark:text-[#D4AF37] font-semibold inline-flex items-center gap-1"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Pick</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Theme Color Palette */}
            <div className="pt-2 border-t border-[#F0EBE3] dark:border-[#26231E] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold uppercase tracking-wider text-[11px]">
                  Storefront Color Tokens
                </span>
                <button
                  type="button"
                  onClick={handleResetThemeColors}
                  className="text-[11px] text-[#785E19] dark:text-[#D4AF37] hover:underline"
                >
                  Reset Default Colors
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {(
                  [
                    { key: 'background', label: 'Warm Ivory' },
                    { key: 'surface', label: 'Card Surface' },
                    { key: 'text', label: 'Primary Ink' },
                    { key: 'accent', label: 'Champagne Accent' },
                    { key: 'darkBg', label: 'Dark Canvas' }
                  ] as const
                ).map((c) => (
                  <label
                    key={c.key}
                    className="p-2.5 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24] flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="color"
                      value={settingsForm.colors[c.key]}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          colors: { ...settingsForm.colors, [c.key]: e.target.value }
                        })
                      }
                      className="w-7 h-7 rounded-xs border-0 bg-transparent cursor-pointer"
                    />
                    <div className="min-w-0">
                      <span className="block font-medium text-[11px] truncate">{c.label}</span>
                      <span className="font-mono text-[10px] text-[#736B63]">
                        {settingsForm.colors[c.key]}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Contact, Socials, Footer & SEO */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] space-y-4">
              <h2 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
                Contact, Social Links & Footer
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={settingsForm.contact.phone}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        contact: { ...settingsForm.contact, phone: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Concierge Email</label>
                  <input
                    type="email"
                    value={settingsForm.contact.email}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        contact: { ...settingsForm.contact, email: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Boutique Street Address</label>
                <input
                  type="text"
                  value={settingsForm.contact.address}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      contact: { ...settingsForm.contact, address: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="url"
                  value={settingsForm.socialLinks.instagram}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      socialLinks: { ...settingsForm.socialLinks, instagram: e.target.value }
                    })
                  }
                  placeholder="Instagram URL"
                  className="px-2.5 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
                <input
                  type="url"
                  value={settingsForm.socialLinks.facebook}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      socialLinks: { ...settingsForm.socialLinks, facebook: e.target.value }
                    })
                  }
                  placeholder="Facebook URL"
                  className="px-2.5 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
                <input
                  type="url"
                  value={settingsForm.socialLinks.twitter}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      socialLinks: { ...settingsForm.socialLinks, twitter: e.target.value }
                    })
                  }
                  placeholder="Twitter/X URL"
                  className="px-2.5 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Footer Description</label>
                <textarea
                  rows={2}
                  value={settingsForm.footerDescription}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, footerDescription: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Copyright Notice</label>
                <input
                  type="text"
                  value={settingsForm.copyrightText}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, copyrightText: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] space-y-4">
              <h2 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
                SEO Metadata
              </h2>
              <div>
                <label className="block font-semibold mb-1">Meta Document Title</label>
                <input
                  type="text"
                  value={settingsForm.seoTitle}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, seoTitle: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Meta Description</label>
                <textarea
                  rows={4}
                  value={settingsForm.seoDescription}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, seoDescription: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Footer Policy Labels (comma separated)
                </label>
                <input
                  type="text"
                  value={settingsForm.footerPolicies.join(', ')}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      footerPolicies: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean)
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: ADMIN SECURITY & ACTIVITY LOGS */}
      {subTab === 'security' && (
        <div className="space-y-6 text-xs">
          {/* Honest LocalStorage Security Scope Banner */}
          <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-[#4A443E] dark:text-[#D4C8B8]">
              <p className="font-semibold text-[#141414] dark:text-[#FAF8F5]">
                Local-Only Browser Storage Mode Active
              </p>
              <p className="leading-relaxed">
                Admin credentials are hashed with a cryptographic salt (SHA-256) and stored locally in browser{' '}
                <code className="font-mono">localStorage</code> with rate-limiting and idle timeout. Because there is no remote cloud database or HTTP-only cookie server, this protects against casual unauthorized visitors on this browser profile rather than adversarial DevTools inspection on a shared machine.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Update Admin ID / Password */}
            <form
              onSubmit={handleUpdateCredentials}
              className="p-6 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] space-y-4"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#785E19] dark:text-[#D4AF37]" />
                <h2 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
                  Rotate Admin Email & Password
                </h2>
              </div>

              {credStatus && (
                <div
                  className={`p-3 rounded-lg text-xs border ${
                    credStatus.ok
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                      : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300'
                  }`}
                >
                  {credStatus.text}
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1">Current Password *</label>
                <input
                  required
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Required to authorize changes"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  New Admin Email (leave blank to keep current)
                </label>
                <input
                  type="text"
                  value={newAdminId}
                  onChange={(e) => setNewAdminId(e.target.value)}
                  placeholder="Min 3 characters"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#141414] hover:bg-[#785E19] dark:bg-[#D4AF37] dark:text-[#141414] text-white font-semibold cursor-pointer"
              >
                Update Security Credentials
              </button>
            </form>

            {/* Session Timeout & Vault Actions */}
            <div className="p-6 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#785E19] dark:text-[#D4AF37]" />
                  <h2 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
                    Session Auto-Logout Policy
                  </h2>
                </div>

                <div>
                  <label className="block font-semibold mb-1.5">
                    Inactive Session Expiry Timeout
                  </label>
                  <select
                    value={vault.sessionTimeoutMinutes}
                    onChange={(e) => {
                      const updated = updateSessionTimeoutMinutes(Number(e.target.value));
                      setVault(updated);
                      refreshLogs();
                      onNotify(`Auto-logout timeout set to ${updated.sessionTimeoutMinutes} minutes.`);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                  >
                    <option value={5}>5 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes (Recommended)</option>
                    <option value={60}>60 minutes</option>
                    <option value={120}>120 minutes</option>
                  </select>
                </div>

                <p className="text-[#6B635B] dark:text-[#A89E92]">
                  Active session expires automatically after {vault.sessionTimeoutMinutes} minutes of inactivity or immediately on logout.
                </p>
              </div>

              <div className="pt-4 border-t border-[#F0EBE3] dark:border-[#26231E] flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmKind('reset-vault')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 font-semibold hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Reset Security Vault</span>
                </button>
              </div>
            </div>
          </div>

          {/* Security & Activity Audit Log */}
          <div className="p-6 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
                Security & CMS Audit Log ({logs.length})
              </h2>
              {logs.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    clearLogs();
                    onNotify('Cleared activity logs.');
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-[#DDD6CB] dark:border-[#302B24] text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Logs</span>
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-[#F0EBE3] dark:divide-[#26231E]">
              {logs.map((log) => (
                <div key={log.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-semibold text-[#785E19] dark:text-[#D4AF37]">
                      {log.action}
                    </span>{' '}
                    <span className="text-[#6B635B] dark:text-[#A89E92]">({log.target})</span> —{' '}
                    <span className="text-[#141414] dark:text-[#FAF8F5]">{log.details}</span>
                  </div>
                  <span className="font-mono tabular-nums text-[11px] text-[#736B63] shrink-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="py-6 text-center text-[#6B635B] dark:text-[#A89E92]">
                  No activity entries recorded yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOCALSTORAGE BACKUP & FACTORY RESET */}
      {subTab === 'backup' && (
        <div className="space-y-6 text-xs">
          <div className="p-6 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] space-y-5">
            <div>
              <h2 className="font-serif-luxury text-xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
                Browser Storage Health & Backups
              </h2>
              <p className="text-[#6B635B] dark:text-[#A89E92] mt-1">
                Lightweight structured CMS data lives in LocalStorage, while large images & videos live in IndexedDB.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#EAE3D9] dark:border-[#2B2620] space-y-2">
              <div className="flex items-center justify-between font-medium">
                <span>LocalStorage Allocation</span>
                <span className="font-mono tabular-nums">
                  {Math.round(storageUsage.usedBytes / 1024)} KB / 5,120 KB ({storageUsage.percentOf5Mb}%)
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#E5E0D8] dark:bg-[#2B2620] overflow-hidden">
                <div
                  className="h-full bg-[#785E19] dark:bg-[#D4AF37]"
                  style={{ width: `${Math.max(2, storageUsage.percentOf5Mb)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#6B635B] dark:text-[#A89E92]">
                Media catalog entries: {mediaItems.length} total ({mediaItems.filter((m) => m.src.startsWith('idb://')).length} stored inside IndexedDB).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#141414] hover:bg-[#785E19] dark:bg-[#D4AF37] dark:text-[#141414] text-white font-semibold cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Website Data (.json)</span>
              </button>

              <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleImportJson}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#DDD6CB] dark:border-[#302B24] font-semibold hover:border-[#785E19] cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Import Backup (.json)</span>
              </button>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-[#191714] border border-red-200 dark:border-red-900/50 space-y-4">
            <h2 className="font-serif-luxury text-xl font-semibold text-red-700 dark:text-red-400">
              Factory Reset Zone
            </h2>
            <p className="text-[#5C544D] dark:text-[#B5ABA0] leading-relaxed">
              Restore Maison d’Or’s catalog, headlines, sections, and settings back to factory defaults. Choose whether to preserve or wipe your uploaded IndexedDB images and videos.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setConfirmKind('reset-content')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 font-semibold"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Website Content Only</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmKind('reset-all-media')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset Content + Wipe Uploaded Media</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <MediaPickerModal
        open={pickerField !== null}
        acceptType="image"
        defaultFolder="Hero & Banners"
        currentValue={pickerField ? settingsForm[pickerField] : ''}
        onSelect={(src) => {
          if (pickerField) {
            setSettingsForm({ ...settingsForm, [pickerField]: src });
          }
        }}
        onClose={() => setPickerField(null)}
      />

      <ConfirmModal
        open={confirmKind !== null}
        title={
          confirmKind === 'reset-vault'
            ? 'Reset Admin Security Vault?'
            : confirmKind === 'reset-all-media'
              ? 'Reset Content & Delete All Uploaded Media?'
              : 'Reset Storefront Content to Defaults?'
        }
        description={
          confirmKind === 'reset-vault'
            ? 'This restores default admin login credentials and ends your current session immediately.'
            : confirmKind === 'reset-all-media'
              ? 'This overwrites your LocalStorage storefront edits AND deletes uploaded images/videos from IndexedDB.'
              : 'This restores products, hero copy, sections, and settings back to Maison d’Or factory defaults.'
        }
        confirmLabel="Confirm Reset"
        onCancel={() => setConfirmKind(null)}
        onConfirm={async () => {
          if (confirmKind === 'reset-vault') {
            resetAdminVaultToDefaults();
            setConfirmKind(null);
            onSessionTerminated();
            return;
          }
          await resetAllCmsData(confirmKind === 'reset-all-media');
          onNotify('Website restored to factory defaults.');
          setConfirmKind(null);
        }}
      />
    </div>
  );
};
