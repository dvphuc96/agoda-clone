import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import SearchFilters from '../components/search/SearchFilters';
import SearchResults from '../components/search/SearchResults';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const destination = searchParams.get('destination') || '';
  const checkIn = searchParams.get('check_in') || '';
  const checkOut = searchParams.get('check_out') || '';
  const guests = searchParams.get('guests') || '';

  return (
    <div>
      {/* Search summary bar */}
      <div className="bg-surface border-b border-border px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <Link to="/" className="text-lg font-bold text-navy tracking-tight mr-2">
              Viet<span className="text-gold-light">Stay</span>
            </Link>
            {destination && (
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                📍 {destination}
              </span>
            )}
            {checkIn && checkOut && (
              <span className="bg-tab text-text-secondary px-3 py-1 rounded-full text-xs font-medium">
                📅 {checkIn} → {checkOut}
              </span>
            )}
            {guests && (
              <span className="bg-tab text-text-secondary px-3 py-1 rounded-full text-xs font-medium">
                👥 {guests} khach
              </span>
            )}
          </div>
          <Link to="/" className="text-primary text-sm font-medium hover:underline">
            Sua tim kiem
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden mb-4 bg-surface border border-border px-4 py-2 rounded-lg text-sm font-medium text-text hover:bg-tab transition-colors w-full"
        >
          {showFilters ? 'An bo loc' : 'Hien bo loc'} 🔽
        </button>

        <div className="flex gap-6">
          {/* Filters sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
            <SearchFilters />
          </div>

          {/* Search results */}
          <SearchResults />
        </div>
      </div>
    </div>
  );
}
