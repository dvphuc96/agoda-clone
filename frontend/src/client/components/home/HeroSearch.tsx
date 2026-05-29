import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, MapPin, Search, Sparkles, UsersRound } from 'lucide-react';
import { getCollectionData, hotelsApi, type Location } from '../../../shared/api/hotels';
import { useI18n } from '../../../shared/i18n';

export default function HeroSearch() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => hotelsApi.getLocations().then(r => getCollectionData<Location>(r.data)),
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (checkIn) params.set('check_in', checkIn);
    if (checkOut) params.set('check_out', checkOut);
    if (guests) params.set('guests', String(guests));
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-[#10201d] px-4 pb-10 pt-8 text-white md:px-8 md:pb-16 md:pt-12">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(16,32,29,.98),rgba(16,32,29,.78)_48%,rgba(97,73,44,.48)),linear-gradient(150deg,#10201d_0%,#21473f_46%,#d6a760_100%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-end">
          <div className="max-w-3xl py-8 md:py-14">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#f6e9d2]">
              <Sparkles className="h-3.5 w-3.5" />
              {t('home.eyebrow')}
            </div>
            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.02] tracking-tight md:text-6xl">
              {t('home.title')}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#efe2ce] md:text-lg">
              {t('home.subtitle')}
            </p>
          </div>

          <div className="hidden rounded-lg border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur lg:block">
            <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-[linear-gradient(135deg,#20352f_0%,#597c70_48%,#d5a65d_100%)]">
              <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(16,32,29,.62))]" />
              <div className="absolute left-6 top-6 h-24 w-36 rounded-md border border-white/20 bg-white/15" />
              <div className="absolute bottom-8 right-6 h-20 w-44 rounded-md border border-white/20 bg-[#f6f1e9]/25" />
              <div className="absolute bottom-6 left-6 text-sm font-semibold text-white">{t('home.featuredTitle')}</div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div>
                <p className="text-[#f6e9d2]">{t('home.eyebrow')}</p>
                <p className="font-semibold">{t('home.destinationTitle')}</p>
              </div>
              <span className="rounded-full bg-[#e4a853] px-3 py-1 text-xs font-bold text-navy">-18%</span>
            </div>
          </div>
        </div>

        <div className="relative -mb-20 mt-4 rounded-lg border border-[#eadfce] bg-[#fffaf2] p-3 text-text shadow-[0_22px_60px_rgba(16,32,29,.24)] md:p-4">
          <div className="grid gap-2 md:grid-cols-[1.35fr_1fr_1fr_.8fr_auto]">
            <label className="rounded-md border border-border bg-white px-4 py-3">
              <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {t('searchForm.destination')}
              </span>
              <select
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="mt-1 block w-full bg-transparent text-sm font-semibold text-text outline-none"
              >
                <option value="">{t('searchForm.destinationPlaceholder')}</option>
                {locations?.map((d: Location) => (
                  <option key={d.id} value={d.slug}>{d.name}</option>
                ))}
              </select>
            </label>
            <label className="rounded-md border border-border bg-white px-4 py-3">
              <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
                <CalendarDays className="h-3.5 w-3.5 text-primary" />
                {t('searchForm.checkIn')}
              </span>
              <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                className="mt-1 block w-full bg-transparent text-sm font-semibold text-text outline-none" />
            </label>
            <label className="rounded-md border border-border bg-white px-4 py-3">
              <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
                <CalendarDays className="h-3.5 w-3.5 text-primary" />
                {t('searchForm.checkOut')}
              </span>
              <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                className="mt-1 block w-full bg-transparent text-sm font-semibold text-text outline-none" />
            </label>
            <label className="rounded-md border border-border bg-white px-4 py-3">
              <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
                <UsersRound className="h-3.5 w-3.5 text-primary" />
                {t('searchForm.guests')}
              </span>
              <select value={guests} onChange={e => setGuests(Number(e.target.value))}
                className="mt-1 block w-full bg-transparent text-sm font-semibold text-text outline-none">
                {[1, 2, 3, 4].map(guestCount => (
                  <option key={guestCount} value={guestCount}>
                    {guestCount === 1
                      ? t('searchForm.guestsSingular')
                      : t('searchForm.guestsPlural', { count: guestCount })}
                  </option>
                ))}
              </select>
            </label>
            <button onClick={handleSearch}
              className="inline-flex min-h-[66px] items-center justify-center gap-2 rounded-md bg-primary px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-[#0b5f59]">
              <Search className="h-4 w-4" />
              {t('common.search')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
