import StarRating from './StarRating';

interface ReviewSummaryProps {
  avgRating: number | null | undefined;
  reviewsCount: number;
}

export default function ReviewSummary({ avgRating, reviewsCount }: ReviewSummaryProps) {
  return (
    <div className="rounded-2xl bg-surface p-6 ring-1 ring-black/5">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        {/* Average score */}
        <div className="flex flex-col items-center gap-1.5 pr-6 sm:border-r sm:border-border/50">
          <span className="text-4xl font-bold text-text">{avgRating ?? '-'}</span>
          <StarRating rating={avgRating ?? 0} size={18} />
          <span className="text-xs text-text-secondary">{reviewsCount} reviews</span>
        </div>

        {/* Distribution bars */}
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-3 text-right text-xs font-medium text-text-secondary">{star}</span>
              <StarRating rating={star} size={12} />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all"
                  style={{ width: `${Math.round((avgRating ?? 0) / 5 * 100 * (star / 5))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
