import HeroSearch from '../components/home/HeroSearch';
import LocationGrid from '../components/home/LocationGrid';
import FeaturedHotels from '../components/home/FeaturedHotels';

export default function HomePage() {
  return (
    <div className="bg-bg">
      <HeroSearch />
      <div className="pt-24">
        <LocationGrid />
        <FeaturedHotels />
      </div>
    </div>
  );
}
