import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Star, Users, BedDouble, Check, X as XIcon, Loader2 } from 'lucide-react';
import { hotelsApi, type HotelCompareData } from '../../shared/api/hotels';
import { useI18n } from '../../shared/i18n/useI18n';

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useI18n();

  const slugs = searchParams.get('hotels')?.split(',').filter(Boolean) ?? [];

  const { data, isLoading, error } = useQuery({
    queryKey: ['hotels', 'compare', slugs],
    queryFn: async () => {
      const res = await hotelsApi.compare(slugs);
      const raw = res.data;
      if (Array.isArray(raw)) return raw as HotelCompareData[];
      if (raw && typeof raw === 'object' && 'data' in raw) {
        const d = (raw as { data: unknown }).data;
        return (Array.isArray(d) ? d : []) as HotelCompareData[];
      }
      return [] as HotelCompareData[];
    },
    enabled: slugs.length >= 2,
  });

  const hotels = data ?? [];

  useEffect(() => {
    if (slugs.length < 2) navigate('/search', { replace: true });
  }, [slugs.length, navigate]);

  const allAmenities = [...new Set(hotels.flatMap(h => h.amenities ?? []))].sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          {t('common.back')}
        </button>

        <h1 className="mb-6 text-2xl font-bold text-navy">
          {t('compare.title', { count: hotels.length })}
        </h1>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-6 text-center text-red-600">
            {t('common.error')}
          </div>
        )}

        {hotels.length >= 2 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-48 min-w-[12rem] bg-white p-4 text-left text-sm font-medium text-text-secondary sticky left-0 z-10" />
                  {hotels.map(h => (
                    <th key={h.slug} className="min-w-[280px] bg-white p-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        {h.image && (
                          <img
                            src={`/storage/${h.image.image_path}`}
                            alt={h.name}
                            className="h-32 w-full rounded-lg object-cover"
                          />
                        )}
                        <h3 className="text-base font-semibold text-navy">{h.name}</h3>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`size-3.5 ${i < h.star_rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-text-secondary">{h.location?.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Price */}
                <ComparisonRow label={t('compare.priceRange')}>
                  {hotels.map(h => (
                    <td key={h.slug} className="bg-white p-4 text-center">
                      <div className="text-lg font-bold text-primary">
                        {h.pricing.min_price.toLocaleString('vi-VN')}đ
                      </div>
                      {h.pricing.min_price !== h.pricing.max_price && (
                        <div className="text-xs text-text-secondary">
                          — {h.pricing.max_price.toLocaleString('vi-VN')}đ
                        </div>
                      )}
                      <div className="text-xs text-text-secondary">{t('compare.perNight')}</div>
                    </td>
                  ))}
                </ComparisonRow>

                {/* Rating */}
                <ComparisonRow label={t('compare.rating')}>
                  {hotels.map(h => (
                    <td key={h.slug} className="bg-white p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="size-4 fill-amber-400 text-amber-400" />
                        <span className="text-lg font-bold">{h.reviews_summary.avg_rating ?? '—'}</span>
                      </div>
                      <div className="text-xs text-text-secondary">
                        {h.reviews_summary.count} {t('compare.reviews')}
                      </div>
                    </td>
                  ))}
                </ComparisonRow>

                {/* Address */}
                <ComparisonRow label={t('compare.address')}>
                  {hotels.map(h => (
                    <td key={h.slug} className="bg-white p-4 text-center text-sm text-text-secondary">
                      {h.address}
                    </td>
                  ))}
                </ComparisonRow>

                {/* Check-in/out */}
                <ComparisonRow label={t('compare.checkInOut')}>
                  {hotels.map(h => (
                    <td key={h.slug} className="bg-white p-4 text-center text-sm">
                      <div>{t('compare.checkIn')}: <span className="font-medium">{h.checkin_time}</span></div>
                      <div>{t('compare.checkOut')}: <span className="font-medium">{h.checkout_time}</span></div>
                    </td>
                  ))}
                </ComparisonRow>

                {/* Rooms */}
                <ComparisonRow label={t('compare.rooms')}>
                  {hotels.map(h => (
                    <td key={h.slug} className="bg-white p-4 text-center text-sm">
                      <div className="font-medium">{h.rooms_summary.count} {t('compare.roomTypes')}</div>
                      <div className="text-text-secondary">{h.rooms_summary.total_rooms} {t('compare.totalRooms')}</div>
                      <div className="mt-1 flex items-center justify-center gap-1 text-text-secondary">
                        <Users className="size-3" /> {h.rooms_summary.max_guests}
                      </div>
                    </td>
                  ))}
                </ComparisonRow>

                {/* Amenities */}
                <ComparisonRow label={t('compare.amenities')}>
                  {hotels.map(h => (
                    <td key={h.slug} className="bg-white p-4">
                      <div className="flex flex-wrap justify-center gap-1">
                        {allAmenities.map(amenity => {
                          const has = (h.amenities ?? []).includes(amenity);
                          return (
                            <span
                              key={amenity}
                              className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                has
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {has ? <Check className="size-2.5" /> : <XIcon className="size-2.5" />}
                              {amenity}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  ))}
                </ComparisonRow>

                {/* Room types detail */}
                <ComparisonRow label={t('compare.roomDetails')}>
                  {hotels.map(h => (
                    <td key={h.slug} className="bg-white p-4">
                      <div className="space-y-2">
                        {h.rooms_summary.types.map(rt => (
                          <div key={rt.id} className="rounded-lg border border-border/30 p-2 text-left">
                            <div className="flex items-center gap-2">
                              {rt.image && (
                                <img
                                  src={`/storage/${rt.image.image_path}`}
                                  alt={rt.name}
                                  className="size-10 rounded object-cover"
                                />
                              )}
                              <div>
                                <div className="text-xs font-medium text-navy">{rt.name}</div>
                                <div className="text-xs text-primary font-semibold">
                                  {rt.price_per_night.toLocaleString('vi-VN')}đ/{t('compare.night')}
                                </div>
                              </div>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-[10px] text-text-secondary">
                              <span className="flex items-center gap-0.5"><BedDouble className="size-2.5" />{rt.bed_type}</span>
                              <span className="flex items-center gap-0.5"><Users className="size-2.5" />{rt.max_guests}</span>
                              {rt.size_sqm && <span>{rt.size_sqm}m²</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}
                </ComparisonRow>

                {/* Action */}
                <ComparisonRow label="">
                  {hotels.map(h => (
                    <td key={h.slug} className="bg-white p-4 text-center">
                      <button
                        type="button"
                        onClick={() => navigate(`/hotel/${h.slug}`)}
                        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
                      >
                        {t('compare.viewHotel')}
                      </button>
                    </td>
                  ))}
                </ComparisonRow>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ComparisonRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <td className="w-48 min-w-[12rem] bg-gray-50 p-4 text-sm font-medium text-text-secondary sticky left-0 z-10">
        {label}
      </td>
      {children}
    </tr>
  );
}
