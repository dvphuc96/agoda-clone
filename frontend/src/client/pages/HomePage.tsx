import HeroSearch from '../components/home/HeroSearch';
import WhyChooseUs from '../components/home/WhyChooseUs';
import LocationGrid from '../components/home/LocationGrid';
import FeaturedHotels from '../components/home/FeaturedHotels';
import RecentlyViewedSection from '../components/home/RecentlyViewedSection';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useSeo } from '../../shared/hooks/useSeo';
import { useI18n } from '../../shared/i18n/useI18n';

export default function HomePage() {
  const revealRef = useScrollReveal();
  const { t } = useI18n();

  useSeo({
    title: t('seo.homeTitle'),
    description: t('seo.homeDescription'),
    keywords: ['khách sạn', 'đặt phòng', 'resort', 'villa', 'Việt Nam', 'GoStay', 'hotel booking'],
    ogType: 'website',
    canonicalUrl: window.location.origin,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'GoStay',
      url: window.location.origin,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${window.location.origin}/search?location={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  });

  return (
    <div className="bg-bg">
      <HeroSearch />
      <div ref={revealRef}>
        <WhyChooseUs />
        <LocationGrid />
        <FeaturedHotels />
        <RecentlyViewedSection />
      </div>
    </div>
  );
}
