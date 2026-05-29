import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe2, Menu, UserRound, X } from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useI18n, type Locale } from '../../../shared/i18n';

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
    <nav className="sticky top-0 z-50 border-b border-border/70 bg-[#fffaf2]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-xl font-semibold tracking-tight text-navy">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-navy text-sm font-bold text-white">GS</span>
          <span>Go<span className="text-primary">Stay</span></span>
        </Link>
        <div className="hidden min-w-0 items-center gap-7 text-sm font-medium text-text-secondary lg:flex">
          <Link to="/search" className="transition-colors hover:text-primary">{t('nav.hotels')}</Link>
          <a href="#destinations" className="transition-colors hover:text-primary">{t('nav.destinations')}</a>
          <a href="#featured" className="transition-colors hover:text-primary">{t('nav.deals')}</a>
        </div>
        <div className="hidden min-w-0 items-center gap-3 lg:flex">
          <div className="flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-xs font-semibold text-text-secondary">
            <Globe2 className="h-4 w-4 text-primary" />
            {localeItems.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => switchLocale(item)}
                aria-label={`${t('common.language')}: ${item.toUpperCase()}`}
                aria-pressed={locale === item}
                className={`rounded px-2 py-1 transition-colors ${
                  locale === item ? 'bg-tab text-navy' : 'hover:bg-tab hover:text-navy'
                }`}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
          {isAuthenticated ? (
            <>
              <Link to="/bookings" className="text-sm font-medium text-text-secondary transition-colors hover:text-primary">{t('nav.myBookings')}</Link>
              <Link
                to={user?.role === 'admin' ? '/admin/dashboard' : '/bookings'}
                className="inline-flex min-w-0 items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm text-text transition-colors hover:bg-tab"
              >
                <UserRound className="h-4 w-4 shrink-0 text-primary" />
                <span className="max-w-[10rem] truncate">{user?.role === 'admin' ? 'GoStay Admin' : user?.name}</span>
              </Link>
              <button type="button" onClick={handleLogout} className="rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1d332e]">
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <Link to="/login" className="rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1d332e]">
              {t('nav.login')}
            </Link>
          )}
        </div>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-md border border-border bg-white text-navy lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={t('common.menu')}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {menuOpen && (
        <div id="mobile-menu" className="border-t border-border bg-[#fffaf2] px-4 py-4 text-sm shadow-lg lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3">
            <Link to="/search" className="rounded-md px-2 py-2 font-medium text-text hover:bg-tab" onClick={() => setMenuOpen(false)}>{t('nav.hotels')}</Link>
            <a href="#destinations" className="rounded-md px-2 py-2 font-medium text-text hover:bg-tab" onClick={() => setMenuOpen(false)}>{t('nav.destinations')}</a>
            <a href="#featured" className="rounded-md px-2 py-2 font-medium text-text hover:bg-tab" onClick={() => setMenuOpen(false)}>{t('nav.deals')}</a>
            <div className="flex w-fit items-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-xs font-semibold text-text-secondary">
              <Globe2 className="h-4 w-4 shrink-0 text-primary" />
              {localeItems.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => switchLocale(item)}
                  aria-label={`${t('common.language')}: ${item.toUpperCase()}`}
                  aria-pressed={locale === item}
                  className={`rounded px-2 py-1 transition-colors ${
                    locale === item ? 'bg-tab text-navy' : 'hover:bg-tab hover:text-navy'
                  }`}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
            {isAuthenticated ? (
              <>
                <Link to="/bookings" className="rounded-md px-2 py-2 font-medium text-text hover:bg-tab" onClick={() => setMenuOpen(false)}>{t('nav.myBookings')}</Link>
                <Link
                  to={user?.role === 'admin' ? '/admin/dashboard' : '/bookings'}
                  className="w-fit rounded-md border border-border bg-white px-4 py-2 font-semibold text-navy"
                  onClick={() => setMenuOpen(false)}
                >
                  {user?.role === 'admin' ? 'GoStay Admin' : user?.name}
                </Link>
                <button type="button" onClick={handleLogout} className="w-fit rounded-md bg-navy px-4 py-2 font-semibold text-white">
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link to="/login" className="w-fit rounded-md bg-navy px-4 py-2 font-semibold text-white" onClick={() => setMenuOpen(false)}>
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
