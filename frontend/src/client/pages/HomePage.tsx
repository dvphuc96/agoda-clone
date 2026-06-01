import HeroSearch from '../components/home/HeroSearch';
import WhyChooseUs from '../components/home/WhyChooseUs';
import LocationGrid from '../components/home/LocationGrid';
import FeaturedHotels from '../components/home/FeaturedHotels';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function HomePage() {
  const revealRef = useScrollReveal();

  return (
    <div className="bg-bg">
      <HeroSearch />
      <div ref={revealRef}>
        <WhyChooseUs />
        <LocationGrid />
        <FeaturedHotels />
      </div>
    </div>
  );
}
