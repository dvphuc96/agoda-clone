import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, X, Star } from 'lucide-react';
import apiClient from '../../../shared/api/client';
import { useI18n } from '../../../shared/i18n/useI18n';

interface Suggestion {
  id: number;
  name: string;
  slug: string;
  star_rating: number;
  address: string;
  thumbnail: string | null;
}

interface SearchAutocompleteProps {
  value: string;
  onSelect: (slug: string) => void;
}

export default function SearchAutocomplete({ value, onSelect }: SearchAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQ, setDebouncedQ] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const { t } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setDebouncedQ('');
      setIsOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => setDebouncedQ(value.trim()), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value]);

  const { data: suggestions = [] } = useQuery<Suggestion[]>({
    queryKey: ['search-suggest', debouncedQ],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Suggestion[] }>('/search/suggest', { params: { q: debouncedQ } });
      return res.data.data;
    },
    enabled: debouncedQ.length >= 2,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (debouncedQ.length >= 2 && suggestions.length > 0) {
      setIsOpen(true);
    }
  }, [suggestions, debouncedQ]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    onSelect(slug);
    navigate(`/hotel/${slug}`);
  };

  const showDropdown = isOpen && debouncedQ.length >= 2;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={value}
          onChange={e => {
            const fn = (e.target as HTMLInputElement).closest('form')?.onsubmit;
            if (fn) e.stopPropagation();
          }}
          readOnly
          className="hidden"
        />
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-xl border border-border bg-white shadow-lg">
          <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
            {t('search.suggestedHotels')}
          </div>
          {suggestions.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-text-secondary">
              {t('search.noSuggestions')}
            </div>
          ) : (
            <ul>
              {suggestions.map(s => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(s.slug)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-warm-surface"
                  >
                    {s.thumbnail ? (
                      <img
                        src={s.thumbnail}
                        alt={s.name}
                        className="size-10 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-warm-surface">
                        <Search className="size-4 text-text-secondary" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-semibold text-text">{s.name}</span>
                        <span className="inline-flex items-center gap-0.5 text-xs text-primary">
                          <Star className="size-3 fill-current" />
                          {s.star_rating}
                        </span>
                      </div>
                      <p className="truncate text-xs text-text-secondary">{s.address}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
