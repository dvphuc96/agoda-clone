import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe2, Heart, Menu, UserRound, X, Bell } from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import type { Locale } from '../../../shared/i18n/types';
import { useI18n } from '../../../shared/i18n/useI18n';

const localeItems: Locale[] = ['vi', 'en'];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const switchLocale = (nextLocale: Locale) => {
    setLocale(nextLocale);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-3 left-1/2 z-50 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-5xl rounded-2xl border border-border/50 bg-warm-surface/80 shadow-lg backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-2.5 md:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-xl font-semibold tracking-tight text-navy">
          <span className="grid size-8 place-items-center rounded-lg bg-navy text-sm font-bold text-white">GS</span>
          <span>Go<span className="text-primary">Stay</span></span>
        </Link>
        <div className="hidden min-w-0 items-center gap-7 text-sm font-medium text-text-secondary lg:flex">
          <Link to="/search" className="transition-spring-fast hover:-translate-y-0.5 hover:text-primary">{t('nav.hotels')}</Link>
          <a href="#destinations" className="transition-spring-fast hover:-translate-y-0.5 hover:text-primary">{t('nav.destinations')}</a>
          <a href="#featured" className="transition-spring-fast hover:-translate-y-0.5 hover:text-primary">{t('nav.deals')}</a>
        </div>
        <div className="hidden min-w-0 items-center gap-3 lg:flex">
          <div className="flex items-center gap-1 rounded-full border border-border bg-white px-2.5 py-1 text-xs font-semibold text-text-secondary">
            <Globe2 className="size-3.5 text-primary" />
            {localeItems.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => switchLocale(item)}
                aria-label={`${t('common.language')}: ${item.toUpperCase()}`}
                aria-pressed={locale === item}
                className={`rounded-full px-2.5 py-1 transition-spring-fast ${
                  locale === item ? 'bg-tab text-navy' : 'hover:bg-tab hover:text-navy'
                }`}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
          {isAuthenticated ? (
            <>
              <Link to="/bookings" className="text-sm font-medium text-text-secondary transition-spring-fast hover:text-primary">{t('nav.myBookings')}</Link>
              <Link to="/wishlist" className="relative text-text-secondary transition-spring-fast hover:text-primary" aria-label={t('wishlist.title')}>
                <Heart className="size-5" />
              </Link>
              <Link to="/notifications" className="relative text-text-secondary transition-spring-fast hover:text-primary" aria-label={t('notifications.title')}>
                <Bell className="size-5" />
              </Link>
              <Link
                to={user?.role === 'admin' ? '/admin/dashboard' : '/bookings'}
                className="inline-flex min-w-0 items-center gap-2 rounded-full border border-border bg-white px-3.5 py-2 text-sm text-text transition-spring-fast hover:bg-tab"
              >
                <UserRound className="size-4 shrink-0 text-primary" />
                <span className="max-w-[10rem] truncate">{user?.role === 'admin' ? 'GoStay Admin' : user?.name}</span>
              </Link>
              <button type="button" onClick={handleLogout} className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white transition-spring-fast active:scale-[0.97] hover:bg-navy-hover">
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <Link to="/login" className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white transition-spring-fast active:scale-[0.97] hover:bg-navy-hover">
              {t('nav.login')}
            </Link>
          )}
        </div>
        <button
          type="button"
          className="grid size-10 place-items-center rounded-xl border border-border bg-white text-navy transition-spring-fast active:scale-[0.95] lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={t('common.menu')}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {menuOpen && (
        <div id="mobile-menu" className="border-t border-border/50 bg-warm-surface/95 backdrop-blur-xl p-4 text-sm lg:hidden">
          <div className="mx-auto flex max-w-5xl flex-col gap-2">
            <Link to="/search" className="rounded-xl p-2.5 font-medium text-text transition-spring-fast hover:bg-tab" onClick={() => setMenuOpen(false)}>{t('nav.hotels')}</Link>
            <a href="#destinations" className="rounded-xl p-2.5 font-medium text-text transition-spring-fast hover:bg-tab" onClick={() => setMenuOpen(false)}>{t('nav.destinations')}</a>
            <a href="#featured" className="rounded-xl p-2.5 font-medium text-text transition-spring-fast hover:bg-tab" onClick={() => setMenuOpen(false)}>{t('nav.deals')}</a>
            <div className="flex w-fit items-center gap-1 rounded-full border border-border bg-white px-2.5 py-1 text-xs font-semibold text-text-secondary">
              <Globe2 className="size-3.5 shrink-0 text-primary" />
              {localeItems.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => switchLocale(item)}
                  aria-label={`${t('common.language')}: ${item.toUpperCase()}`}
                  aria-pressed={locale === item}
                  className={`rounded-full px-2.5 py-1 transition-spring-fast ${
                    locale === item ? 'bg-tab text-navy' : 'hover:bg-tab hover:text-navy'
                  }`}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
            {isAuthenticated ? (
              <>
                <Link to="/bookings" className="rounded-xl p-2.5 font-medium text-text transition-spring-fast hover:bg-tab" onClick={() => setMenuOpen(false)}>{t('nav.myBookings')}</Link>
                <Link to="/wishlist" className="flex items-center gap-2 rounded-xl p-2.5 font-medium text-text transition-spring-fast hover:bg-tab" onClick={() => setMenuOpen(false)}>
                  <Heart className="size-4" /> {t('wishlist.title')}
                </Link>
                <Link to="/notifications" className="flex items-center gap-2 rounded-xl p-2.5 font-medium text-text transition-spring-fast hover:bg-tab" onClick={() => setMenuOpen(false)}>
                  <Bell className="size-4" /> {t('notifications.title')}
                </Link>
                <Link
                  to={user?.role === 'admin' ? '/admin/dashboard' : '/bookings'}
                  className="w-fit rounded-full border border-border bg-white px-4 py-2 font-semibold text-navy transition-spring-fast"
                  onClick={() => setMenuOpen(false)}
                >
                  {user?.role === 'admin' ? 'GoStay Admin' : user?.name}
                </Link>
                <button type="button" onClick={handleLogout} className="w-fit rounded-full bg-navy px-5 py-2 font-semibold text-white transition-spring-fast active:scale-[0.97]">
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link to="/login" className="w-fit rounded-full bg-navy px-5 py-2 font-semibold text-white transition-spring-fast active:scale-[0.97]" onClick={() => setMenuOpen(false)}>
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
