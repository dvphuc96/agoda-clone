import { useQuery } from '@tanstack/react-query';
import { reviewsApi, type Review } from '../../../shared/api/reviews';
import { useI18n } from '../../../shared/i18n/useI18n';
import StarRating from './StarRating';

interface ReviewListProps {
  hotelSlug: string;
}

export default function ReviewList({ hotelSlug }: ReviewListProps) {
  const { t } = useI18n();
  const page = 1;

  const { data, isLoading } = useQuery({
    queryKey: ['hotel-reviews', hotelSlug, page],
    queryFn: () => reviewsApi.list(hotelSlug, { page }).then(r => r.data),
    enabled: !!hotelSlug,
  });

  const reviews = (data?.data ?? []) as Review[];
  const totalPages = data?.last_page ?? data?.meta?.last_page ?? 1;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl bg-warm-surface p-8 text-center">
        <p className="text-sm text-text-secondary">{t('reviews.noReviews')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-2xl bg-surface p-5 ring-1 ring-black/5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {review.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <div>
                <div className="text-sm font-semibold text-text">{review.user?.name ?? t('reviews.anonymous')}</div>
                <div className="text-xs text-text-secondary">
                      {review.created_at
                        ? new Date(review.created_at).toLocaleDateString()
                        : ''}
                      </div>
              </div>
            </div>
            <StarRating rating={review.rating} size={14} />
          </div>
          {review.title && (
            <h4 className="mt-2 text-sm font-semibold text-text">{review.title}</h4>
          )}
          {review.comment && (
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">{review.comment}</p>
          )}
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center gap-1 py-2">
          <span className="text-xs text-text-secondary">
            {t('common.previous')}
          </span>
          <span className="text-xs text-text-secondary"> / </span>
          <span className="text-xs text-text-secondary">
            {t('common.next')}
          </span>
        </div>
      )}
    </div>
  );
}
