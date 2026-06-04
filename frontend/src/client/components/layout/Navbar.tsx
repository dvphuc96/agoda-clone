import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Globe2, Heart, Menu, UserRound, X, Bell, Search, ChevronDown, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import NotificationDropdown from '../common/NotificationDropdown';
import type { Locale } from '../../../shared/i18n/types';
import { useI18n } from '../../../shared/i18n/useI18n';

const localeItems: Locale[] = ['vi', 'en'];

const localeLabels: Record<Locale, { label: string; flag: string }> = {
  vi: { label: 'Tiếng Việt', flag: '🇻🇳' },
  en: { label: 'English', flag: '🇬🇧' },
};

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const switchLocale = (nextLocale: Locale) => {
    setLocale(nextLocale);
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    setProfileOpen(false);
    await logout();
    navigate('/');
  };

  const isHome = location.pathname === '/';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || !isHome
            ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(16,32,29,0.06)]'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-[72px]">
            {/* Logo */}
            <Link to="/" className="group flex items-center gap-2.5">
              <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-deep shadow-md shadow-primary/20 transition-transform duration-300 group-hover:scale-105">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M3 21V7l9-4 9 4v14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 21V13h6v8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 7l9 4 9-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
                </svg>
              </div>
              <div className="flex flex-col -space-y-0.5">
                <span className={`text-[1.15rem] font-bold tracking-tight transition-colors duration-300 ${scrolled || !isHome ? 'text-navy' : 'text-navy'}`}>
                  Go<span className="text-primary">Stay</span>
                </span>
                <span className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-text-secondary/60">
                  Travel & Stay
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {[
                { to: '/search', label: t('nav.hotels') },
                { href: '#destinations', label: t('nav.destinations') },
                { href: '#featured', label: t('nav.deals') },
              ].map((item) =>
                item.to ? (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`relative px-4 py-2 text-[0.82rem] font-semibold tracking-wide uppercase transition-colors duration-200 ${
                      scrolled || !isHome
                        ? 'text-text-secondary hover:text-primary'
                        : 'text-text-secondary hover:text-primary'
                    } after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-primary after:transition-all after:duration-300 hover:after:w-5`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`relative px-4 py-2 text-[0.82rem] font-semibold tracking-wide uppercase transition-colors duration-200 ${
                      scrolled || !isHome
                        ? 'text-text-secondary hover:text-primary'
                        : 'text-text-secondary hover:text-primary'
                    } after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-primary after:transition-all after:duration-300 hover:after:w-5`}
                  >
                    {item.label}
                  </a>
                )
              )}
            </nav>

            {/* Desktop Right Section */}
            <div className="hidden lg:flex items-center gap-2.5">
              {/* Language Switcher */}
              <div className="relative">
                <select
                  value={locale}
                  onChange={(e) => switchLocale(e.target.value as Locale)}
                  aria-label={t('common.language')}
                  className="appearance-none cursor-pointer rounded-lg border border-border/50 bg-white py-1.5 pl-3 pr-8 text-[0.78rem] font-medium text-text-secondary shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10"
                >
                  {localeItems.map((item) => (
                    <option key={item} value={item}>
                      {localeLabels[item].flag} {localeLabels[item].label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-text-secondary/50" />
              </div>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/wishlist"
                    className="relative grid size-9 place-items-center rounded-full text-text-secondary transition-all duration-200 hover:bg-tab/60 hover:text-primary"
                    aria-label={t('nav.wishlist')}
                  >
                    <Heart className="size-[18px]" />
                  </Link>

                  <NotificationDropdown />

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-2 rounded-full border border-border/60 bg-white py-1.5 pl-3 pr-2 text-sm font-medium text-text shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md"
                    >
                      <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <UserRound className="size-4" />
                      </div>
                      <span className="max-w-[8rem] truncate text-[0.82rem]">
                        {user?.role === 'admin' ? 'Admin' : user?.name}
                      </span>
                      <ChevronDown className={`size-3.5 text-text-secondary/50 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {profileOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border/50 bg-white shadow-xl shadow-shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="border-b border-border/30 px-4 py-3">
                            <p className="text-sm font-semibold text-navy">
                              {user?.role === 'admin' ? 'GoStay Admin' : user?.name}
                            </p>
                            <p className="text-xs text-text-secondary">{user?.email}</p>
                          </div>
                          <div className="p-1.5">
                            <Link
                              to="/profile"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text transition-colors hover:bg-tab/60"
                            >
                              <UserRound className="size-4 text-text-secondary" />
                              {t('nav.profile') || 'Profile'}
                            </Link>
                            <Link
                              to="/bookings"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text transition-colors hover:bg-tab/60"
                            >
                              <Search className="size-4 text-text-secondary" />
                              {t('nav.myBookings')}
                            </Link>
                            {user?.role === 'admin' && (
                              <Link
                                to="/admin"
                                onClick={() => setProfileOpen(false)}
                                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                              >
                                <ShieldCheck className="size-4 text-primary" />
                                Admin Panel
                              </Link>
                            )}
                          </div>
                          <div className="border-t border-border/30 p-1.5">
                            <button
                              type="button"
                              onClick={handleLogout}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"
                            >
                              {t('nav.logout')}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2 text-[0.82rem] font-semibold text-white shadow-md shadow-navy/15 transition-all duration-200 hover:bg-navy-hover hover:shadow-lg active:scale-[0.97]"
                >
                  {t('nav.login')}
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className={`grid size-10 place-items-center rounded-xl transition-all duration-200 lg:hidden ${
                scrolled || !isHome
                  ? 'text-navy hover:bg-tab/60'
                  : 'text-navy hover:bg-tab/60'
              }`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={t('common.menu')}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden" onClick={() => setMenuOpen(false)} />
      )}

      {/* Mobile Menu Panel */}
      <div
        id="mobile-menu"
        className={`fixed top-0 right-0 z-50 h-full w-[85%] max-w-sm transform bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Mobile Header */}
          <div className="flex items-center justify-between border-b border-border/30 px-5 py-4">
            <Link to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-deep">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M3 21V7l9-4 9 4v14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 21V13h6v8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-navy">
                Go<span className="text-primary">Stay</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="grid size-9 place-items-center rounded-lg text-text-secondary hover:bg-tab/60"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Mobile Nav Items */}
          <div className="flex-1 overflow-y-auto px-4 py-5">
            <div className="space-y-1">
              {[
                { to: '/search', label: t('nav.hotels'), icon: Search },
                { href: '#destinations', label: t('nav.destinations'), icon: Globe2 },
                { href: '#featured', label: t('nav.deals'), icon: Heart },
              ].map((item) => {
                const Icon = item.icon;
                return item.to ? (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-[0.9rem] font-medium text-text transition-colors hover:bg-tab/60"
                  >
                    <Icon className="size-5 text-primary/70" />
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-[0.9rem] font-medium text-text transition-colors hover:bg-tab/60"
                  >
                    <Icon className="size-5 text-primary/70" />
                    {item.label}
                  </a>
                );
              })}
            </div>

            {/* Divider */}
            <div className="my-5 border-t border-border/40" />

            {/* Language */}
            <div className="px-3 pb-4">
              <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-text-secondary">
                <Globe2 className="size-4 text-primary/60" />
                {t('common.language')}
              </label>
              <div className="relative mt-2">
                <select
                  value={locale}
                  onChange={(e) => switchLocale(e.target.value as Locale)}
                  aria-label={t('common.language')}
                  className="w-full appearance-none cursor-pointer rounded-xl border border-border/50 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-text shadow-sm transition-all duration-200 hover:border-primary/30 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10"
                >
                  {localeItems.map((item) => (
                    <option key={item} value={item}>
                      {localeLabels[item].flag} {localeLabels[item].label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary/50" />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border/40" />

            {/* Auth Section */}
            <div className="pt-4">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <div className="mb-3 flex items-center gap-3 px-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                      <UserRound className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy">
                        {user?.role === 'admin' ? 'GoStay Admin' : user?.name}
                      </p>
                      <p className="text-xs text-text-secondary">{user?.email}</p>
                    </div>
                  </div>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-text transition-colors hover:bg-tab/60">
                    <UserRound className="size-5 text-primary/70" />
                    {t('nav.profile') || 'Profile'}
                  </Link>
                  <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-text transition-colors hover:bg-tab/60">
                    <Heart className="size-5 text-primary/70" />
                    {t('nav.wishlist')}
                  </Link>
                  <button type="button" onClick={() => { setMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-text transition-colors hover:bg-tab/60">
                    <Bell className="size-5 text-primary/70" />
                    {t('notifications.title')}
                  </button>
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/5">
                      <ShieldCheck className="size-5 text-primary/70" />
                      Admin Panel
                    </Link>
                  )}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-xl bg-tab/60 px-4 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white transition-all active:scale-[0.97]"
                >
                  {t('nav.login')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
