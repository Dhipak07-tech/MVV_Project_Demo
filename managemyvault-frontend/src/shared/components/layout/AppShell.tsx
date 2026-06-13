import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Shield, LogOut, Building2, Search, Bell,
  ChevronDown, User, Settings, Menu, LayoutDashboard
} from 'lucide-react';
import { useAuthStore } from '../../../features/organizations/store/organizationStore';
import { authApi } from '../../../features/organizations/api/organizationApi';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../ThemeToggle';
import { useSearchStore } from '../../../features/search/store/searchStore';
import CommandPalette from '../../../features/search/components/CommandPalette';

/**
 * AppShell — Main application layout.
 * Contains the top navigation bar and renders child routes via Outlet.
 */
export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    }
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-vault-base">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-vault-surface/95 backdrop-blur-md border-b border-border-subtle">
        <div className="flex items-center justify-between h-14 px-4 lg:px-6">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-vault-elevated"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu className="w-5 h-5 text-text-secondary" />
            </button>

            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                <Shield className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-lg font-bold text-text-primary hidden sm:block">
                ManageMyVault
              </span>
            </Link>

            <nav className="hidden lg:flex items-center ml-6 gap-2">
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname.startsWith('/dashboard')
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-vault-elevated'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>

              <Link
                to="/organizations"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname.startsWith('/organizations') || location.pathname.startsWith('/org')
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-vault-elevated'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Organizations
              </Link>
            </nav>
          </div>

          {/* Right: Search + Actions + User */}
          <div className="flex items-center gap-3">
            {/* Global search */}
            <div className="relative hidden md:block">
              <button
                onClick={() => useSearchStore.getState().setIsOpen(true)}
                className="flex items-center gap-2 bg-vault-elevated rounded-lg px-3 py-1.5 border border-border-subtle hover:border-brand-primary transition-colors text-left text-sm text-text-muted w-56 cursor-pointer"
              >
                <Search className="w-4 h-4 text-text-muted" />
                <span className="flex-1 text-xs">Search...</span>
                <kbd className="text-[10px] text-text-muted bg-vault-base px-1.5 py-0.5 rounded border border-border-subtle">⌘K</kbd>
              </button>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-vault-elevated text-text-secondary hover:text-text-primary transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-primary rounded-full" />
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-vault-elevated transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-medium text-text-primary leading-none">
                    {user?.fullName || 'Admin'}
                  </p>
                  <p className="text-[10px] text-text-muted leading-none mt-0.5">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-text-muted hidden md:block" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 top-12 w-52 bg-vault-elevated border border-border-default rounded-xl shadow-lg overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-border-subtle">
                      <p className="text-sm font-medium text-text-primary">{user?.fullName}</p>
                      <p className="text-xs text-text-muted">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <button className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-vault-card flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-status-danger hover:bg-vault-card flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* Global Command Palette */}
      <CommandPalette />
    </div>
  );
}
