import HeroSearch from '../components/home/HeroSearch';
import DestinationGrid from '../components/home/DestinationGrid';
import FeaturedHotels from '../components/home/FeaturedHotels';

export default function HomePage() {
  return (
    <>
      <HeroSearch />
      <DestinationGrid />
      <FeaturedHotels />
    </>
  );
}
