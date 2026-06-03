import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="mx-auto max-w-sm py-16 text-center">
      <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-primary/10">
        {icon}
      </div>
      <h2 className="text-lg font-bold text-text">{title}</h2>
      {description && (
        <p className="mt-2 text-sm text-text-secondary">{description}</p>
      )}
      {actionLabel && (actionTo || onAction) && (
        actionTo ? (
          <Link
            to={actionTo}
            className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-spring-fast hover:bg-primary-hover active:scale-[0.97]"
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onAction}
            className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-spring-fast hover:bg-primary-hover active:scale-[0.97]"
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}
