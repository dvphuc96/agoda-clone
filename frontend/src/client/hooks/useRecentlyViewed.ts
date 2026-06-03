import { useState, useCallback, useEffect } from 'react';

export interface RecentlyViewedHotel {
  id: number;
  slug: string;
  name: string;
  thumbnail: string | null;
  minPrice: number;
  viewedAt: string;
}

const STORAGE_KEY = 'gostay_recently_viewed';
const MAX_ITEMS = 20;
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function readStorage(): RecentlyViewedHotel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: RecentlyViewedHotel[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - TTL_MS;
    return parsed.filter((item) => new Date(item.viewedAt).getTime() > cutoff);
  } catch {
    return [];
  }
}

function writeStorage(items: RecentlyViewedHotel[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedHotel[]>(() => readStorage());

  // Prune expired entries on mount
  useEffect(() => {
    const pruned = readStorage();
    if (pruned.length !== items.length) {
      setItems(pruned);
      writeStorage(pruned);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addHotel = useCallback(
    (hotel: { id: number; slug: string; name: string; thumbnail?: string | null; minPrice?: number | string | null }) => {
      if (!hotel.slug || !hotel.name) return;

      setItems((prev) => {
        const filtered = prev.filter((h) => h.id !== hotel.id);
        const entry: RecentlyViewedHotel = {
          id: hotel.id,
          slug: hotel.slug,
          name: hotel.name,
          thumbnail: hotel.thumbnail ?? null,
          minPrice: typeof hotel.minPrice === 'string' ? Number(hotel.minPrice) : (hotel.minPrice ?? 0),
          viewedAt: new Date().toISOString(),
        };
        const updated = [entry, ...filtered].slice(0, MAX_ITEMS);
        writeStorage(updated);
        return updated;
      });
    },
    [],
  );

  const clearAll = useCallback(() => {
    setItems([]);
    writeStorage([]);
  }, []);

  return {
    hotels: items,
    count: items.length,
    addHotel,
    clearAll,
  };
}
