import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({ rating, size = 16, interactive = false, onChange }: StarRatingProps) {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    const filled = i <= Math.floor(rating);
    const half = !filled && i - 0.5 <= rating;

    stars.push(
      <button
        key={i}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && onChange?.(i)}
        className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        aria-label={`${i} star${i > 1 ? 's' : ''}`}
      >
        <Star
          size={size}
          className={
            filled
              ? 'fill-amber-400 text-amber-400'
              : half
                ? 'fill-amber-400/50 text-amber-400'
                : 'fill-transparent text-slate-300'
          }
        />
      </button>,
    );
  }

  return <div className="inline-flex items-center gap-0.5">{stars}</div>;
}
