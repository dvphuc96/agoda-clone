import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Search, UsersRound, Shield, Star, Clock, ArrowRight } from 'lucide-react';
import { getCollectionData, hotelsApi, type Location } from '../../../shared/api/hotels';
import { useI18n } from '../../../shared/i18n/useI18n';
import DateField, { nextDateString, todayDateString } from '../common/DateField';

const heroImages = [
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1920&q=80',
];

export default function HeroSearch() {
  const navigate = useNavigate();
  const { locale, t } = useI18n();
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [currentImage, setCurrentImage] = useState(0);

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => hotelsApi.getLocations().then(r => getCollectionData<Location>(r.data)),
  });

  const today = todayDateString();
  const minCheckOut = checkIn ? nextDateString(checkIn) : today;

  const handleCheckInChange = (value: string) => {
    setCheckIn(value);
    if (checkOut && checkOut <= value) {
      setCheckOut(nextDateString(value));
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (checkIn) params.set('check_in', checkIn);
    if (checkOut) params.set('check_out', checkOut);
    if (guests) params.set('guests', String(guests));
    navigate(`/search?${params.toString()}`);
  };

  // Auto-rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage(i => (i + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-bg">
      {/* Background image with soft gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-bg/30" />
        {heroImages.map((img, idx) => (
          <img
            key={img}
            src={img}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-[2000ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
              idx === currentImage ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          />
        ))}
        {/* Elegant gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-bg/95 via-bg/70 to-transparent" />
      </div>

      {/* Subtle grain overlay for paper feel */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Content — Editorial Split */}
      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-7xl flex-col justify-center px-4 py-24 md:px-8 md:py-32 lg:px-16 lg:py-40">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          {/* Left: Typography */}
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              <Star className="size-3 fill-gold-light text-gold-light" />
              GoStay
            </div>
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-navy md:text-6xl lg:text-[4rem]">
              {t('home.title')}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-[1.7] text-text-secondary md:text-xl">
              {t('home.subtitle')}
            </p>

            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-full bg-white/80 border border-border/50 px-5 py-2.5 text-sm font-medium text-text shadow-sm backdrop-blur-sm">
                <Shield className="size-4 text-success" />
                {t('home.trustFreeCancel')}
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/80 border border-border/50 px-5 py-2.5 text-sm font-medium text-text shadow-sm backdrop-blur-sm">
                <Star className="size-4 fill-gold-light text-gold-light" />
                {t('home.trustBestPrice')}
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/80 border border-border/50 px-5 py-2.5 text-sm font-medium text-text shadow-sm backdrop-blur-sm">
                <Clock className="size-4 text-primary" />
                {t('home.trustSupport')}
              </div>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex items-center gap-4 border-t border-border/30 pt-6">
              <div className="flex gap-x-2">
                {['A', 'B', 'C', 'D'].map((initial, i) => (
                  <div key={i} className="flex size-10 items-center justify-center rounded-full border-2 border-white shadow-lg bg-gradient-to-br from-primary to-gold text-xs font-bold text-white">
                    {initial}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="size-3 fill-gold-light text-gold-light" />
                  ))}
                  <span className="ml-1.5 text-sm font-semibold text-navy">4.8</span>
                </div>
                <div className="text-xs text-text-secondary mt-0.5">{t('home.reviewCount')}</div>
              </div>
            </div>
          </div>

          {/* Right: Glass Search Card with Double-Bezel */}
          <div className="relative">
            {/* Outer Shell */}
            <div className="relative bg-shadow/5 rounded-[2rem] ring-1 ring-black/5 shadow-[0_32px_64px_rgba(16,32,29,.15)]">
              {/* Inner Core */}
              <div className="overflow-hidden rounded-[calc(2rem-6px)] bg-white/95 backdrop-blur-xl">
                <div className="p-6 md:p-8">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-text-secondary mb-6">
                    {t('search.editSearch')}
                  </h3>

                  <div className="space-y-4">
                    {/* Destination */}
                    <div className="rounded-xl border border-border/50 bg-warm-surface/50 px-5 py-4 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:border-primary/50 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(15,118,110,0.1)]">
                      <label className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary mb-1">
                        <MapPin className="size-3.5 text-primary" />
                        {t('searchForm.destination')}
                      </label>
                      <select
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        className="block w-full bg-transparent text-sm font-semibold text-text outline-none appearance-none cursor-pointer"
                      >
                        <option value="">{t('searchForm.destinationPlaceholder')}</option>
                        {locations?.map((d: Location) => (
                          <option key={d.id} value={d.slug}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Dates Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <DateField id="hero-check-in" label={t('searchForm.checkIn')} value={checkIn} min={today} locale={locale} onChange={handleCheckInChange} />
                      <DateField id="hero-check-out" label={t('searchForm.checkOut')} value={checkOut} min={minCheckOut} locale={locale} onChange={setCheckOut} />
                    </div>

                    {/* Guests */}
                    <div className="rounded-xl border border-border/50 bg-warm-surface/50 px-5 py-4 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:border-primary/50 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(15,118,110,0.1)]">
                      <label className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary mb-1">
                        <UsersRound className="size-3.5 text-primary" />
                        {t('searchForm.guests')}
                      </label>
                      <select value={guests} onChange={e => setGuests(Number(e.target.value))}
                        className="block w-full bg-transparent text-sm font-semibold text-text outline-none appearance-none cursor-pointer">
                        {[1, 2, 3, 4].map(guestCount => (
                          <option key={guestCount} value={guestCount}>
                            {guestCount === 1
                              ? t('searchForm.guestsSingular')
                              : t('searchForm.guestsPlural', { count: guestCount })}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* CTA Button with Button-in-Button */}
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="group relative inline-flex w-full items-center justify-center gap-3 rounded-full bg-primary px-8 py-4 text-sm font-bold text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] hover:bg-primary-hover hover:shadow-[0_8px_24px_rgba(15,118,110,0.25)]"
                    >
                      <Search className="size-4" />
                      <span>{t('common.search')}</span>
                      {/* Trailing icon in its own circle */}
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:scale-110">
                        <ArrowRight className="size-3.5" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}