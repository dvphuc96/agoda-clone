import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getCollectionData, hotelsApi, type Hotel } from '../../../shared/api/hotels';
import { useI18n } from '../../../shared/i18n';
import HotelCard from './HotelCard';

export default function FeaturedHotels() {
  const { t } = useI18n();
  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ['featured-hotels'],
    queryFn: () => hotelsApi.getFeatured().then(r => getCollectionData<Hotel>(r.data)),
  });

  return (
    <section id="featured" className="px-4 pb-14 md:px-8 md:pb-20">
      <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text md:text-3xl">{t('home.featuredTitle')}</h2>
          <p className="mt-1 text-sm text-text-secondary">{t('home.featuredSubtitle')}</p>
        </div>
        <Link to="/search" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0b5f59]">
          {t('home.exploreHotels')} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {isLoading && <p className="text-sm text-text-secondary">{t('common.loading')}</p>}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {hotels?.slice(0, 6)?.map((hotel, idx) => (
          <HotelCard key={hotel.id} hotel={hotel} index={idx} />
        ))}
      </div>
      </div>
    </section>
  );
}
