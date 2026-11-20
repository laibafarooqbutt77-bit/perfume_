import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileEdit,
  Package,
  Users,
  Image as ImageIcon,
  Settings,
  LogOut,
  ExternalLink,
  Sun,
  Moon,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import {
  getActiveAdminSession,
  touchAdminSession,
  clearAdminSession,
  type AdminSessionRecord
} from '../../utils/adminAuth';
import { useSiteContent } from '../../context/SiteContentContext';
import { AdminLogin } from './AdminLogin';
import { AdminDashboardTab, type AdminTabKey } from './AdminDashboardTab';
import { ContentCmsTab } from './ContentCmsTab';
import { CatalogCrudTab } from './CatalogCrudTab';
import { UsersMessagesTab } from './UsersMessagesTab';
import { MediaLibraryTab } from './MediaLibraryTab';
import { SettingsSecurityTab } from './SettingsSecurityTab';

interface AdminPortalProps {
  onExitToStore: () => void;
}

const ADMIN_THEME_KEY = 'maisondor_admin_dark_mode';

export const AdminPortal: React.FC<AdminPortalProps> = ({ onExitToStore }) => {
  const { cms, cmsError, clearCmsError } = useSiteContent();
  const [session, setSession] = useState<AdminSessionRecord | null>(() => getActiveAdminSession());
  const [activeTab, setActiveTab] = useState<AdminTabKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADMIN_THEME_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [adminToast, setAdminToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setAdminToast(msg);
  };

  useEffect(() => {
    if (!adminToast) return;
    const t = setTimeout(() => setAdminToast(null), 3200);
    return () => clearTimeout(t);
  }, [adminToast]);

  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_THEME_KEY, String(darkMode));
    } catch {
      // Ignore
    }
  }, [darkMode]);

  // Enforce automatic inactivity expiration & activity extension ONLY while authenticated
  useEffect(() => {
    if (!session) return;

    let lastTouch = Date.now();
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastTouch > 15000) {
        lastTouch = now;
        const updated = touchAdminSession();
        if (!updated) {
          setSession(null);
        } else {
          setSession(updated);
        }
      }
    };

    const events: Array<keyof WindowEventMap> = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, handleActivity, { passive: true }));

    const expiryInterval = setInterval(() => {
      const current = getActiveAdminSession();
      if (!current) {
        setSession(null);
      }
    }, 10000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
      clearInterval(expiryInterval);
    };
  }, [session]);

  // Sync dashboard route cleanly after authentication and handle logout redirect
  const handleLoginSuccess = () => {
    const active = getActiveAdminSession();
    if (active) {
      setActiveTab('dashboard');
      setSession(active);
      if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
        window.history.replaceState({}, '', '/admin/dashboard');
      }
    }
  };

  // STRICT ROUTE GUARD: Never render Admin Dashboard DOM unless session is valid
  if (!session) {
    return (
      <AdminLogin
        onSuccess={handleLoginSuccess}
        onExitToStore={onExitToStore}
      />
    );
  }

  const handleLogout = () => {
    clearAdminSession('logout');
    setSession(null);
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin/')) {
      window.history.replaceState({}, '', '/admin');
    }
  };

  const navItems: Array<{ key: AdminTabKey; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'content', label: 'Website & Content', icon: FileEdit },
    { key: 'catalog', label: 'Perfumes & Collections', icon: Package },
    { key: 'users', label: 'Users & Messages', icon: Users },
    { key: 'media', label: 'Media Library', icon: ImageIcon },
    { key: 'settings', label: 'Settings & Security', icon: Settings }
  ];

  const activeNavLabel = navItems.find((i) => i.key === activeTab)?.label || 'Dashboard';

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#11100E] text-[#141414] dark:text-[#FAF8F5] flex">
        {/* Mobile Sidebar Backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}

        {/* Fixed Responsive Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#161411] border-r border-[#E5E0D8] dark:border-[#26221D] flex flex-col justify-between transition-transform duration-200 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-serif-luxury text-xl font-semibold tracking-[0.16em] text-[#141414] dark:text-white block">
                  {cms.siteSettings.siteName}
                </span>
                <span className="text-[10px] uppercase tracking-[0.22em] text-[#785E19] dark:text-[#D4AF37] font-semibold">
                  Private Admin CMS
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-md hover:bg-[#FAF8F5] dark:hover:bg-[#23201B]"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.key);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#141414] text-[#FAF8F5] dark:bg-[#D4AF37] dark:text-[#141414] font-semibold'
                        : 'text-[#4A443E] dark:text-[#C7BEB2] hover:bg-[#FAF8F5] dark:hover:bg-[#221F1A]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-[#EAE3D9] dark:border-[#26221D] space-y-2">
            <div className="px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#1D1B17] border border-[#EAE3D9] dark:border-[#2A251F] flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#785E19] dark:text-[#D4AF37] shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold truncate">{session.adminLabel}</p>
                <p className="text-[10px] text-[#6B635B] dark:text-[#A89E92]">Local Vault Active</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-[#DDD6CB] dark:border-[#302B24] hover:border-red-500 text-xs font-medium text-red-700 dark:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Workspace */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Top Header */}
          <header className="sticky top-0 z-30 h-14 px-4 sm:px-6 bg-white/95 dark:bg-[#161411]/95 backdrop-blur-md border-b border-[#E5E0D8] dark:border-[#26221D] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open admin menu"
                className="lg:hidden p-1.5 rounded-md border border-[#DDD6CB] dark:border-[#302B24]"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div className="text-xs flex items-center gap-2 truncate">
                <span className="text-[#6B635B] dark:text-[#A89E92] hidden sm:inline">Admin</span>
                <span className="text-[#A89E92] hidden sm:inline">/</span>
                <span className="font-semibold text-[#141414] dark:text-[#FAF8F5] truncate">
                  {activeNavLabel}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setDarkMode((prev) => !prev)}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                className="p-2 rounded-lg border border-[#E5E0D8] dark:border-[#2C2822] hover:border-[#785E19] text-[#4A443E] dark:text-[#D4C8B8] cursor-pointer"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={onExitToStore}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E0D8] dark:border-[#2C2822] hover:border-[#785E19] text-xs font-medium cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View Storefront</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] dark:bg-[#25221D] text-white text-xs font-medium hover:bg-red-700 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>

          {/* Storage Quota / Error Banner */}
          {cmsError && (
            <div className="mx-4 sm:mx-6 mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cmsError}</span>
              </div>
              <button type="button" onClick={clearCmsError}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Tab Content Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {activeTab === 'dashboard' && <AdminDashboardTab onNavigateTab={setActiveTab} />}
            {activeTab === 'content' && <ContentCmsTab onNotify={notify} />}
            {activeTab === 'catalog' && <CatalogCrudTab onNotify={notify} />}
            {activeTab === 'users' && <UsersMessagesTab onNotify={notify} />}
            {activeTab === 'media' && <MediaLibraryTab onNotify={notify} />}
            {activeTab === 'settings' && (
              <SettingsSecurityTab
                onNotify={notify}
                onSessionTerminated={() => setSession(null)}
              />
            )}
          </main>
        </div>

        {/* Admin Notification Toast */}
        {adminToast && (
          <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg bg-[#141414] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#141414] shadow-xl border border-[#D4AF37]/40 flex items-center gap-2 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37] dark:text-[#785E19] shrink-0" />
            <span>{adminToast}</span>
          </div>
        )}
      </div>
    </div>
  );
};
