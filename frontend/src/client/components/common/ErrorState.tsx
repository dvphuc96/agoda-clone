import type { ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

interface ErrorStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  onBack?: () => void;
  backLabel?: string;
  backTo?: string;
}

export default function ErrorState({
  icon,
  title,
  description,
  onRetry,
  retryLabel,
  onBack,
  backLabel,
}: ErrorStateProps) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-destructive/10">
        {icon ?? <AlertTriangle className="size-7 text-destructive" />}
      </div>
      <h2 className="text-lg font-bold text-text">{title}</h2>
      {description && (
        <p className="mt-2 text-sm text-text-secondary">{description}</p>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-spring-fast hover:bg-primary-hover active:scale-[0.97]"
          >
            <RefreshCw className="size-3.5" />
            {retryLabel ?? 'Retry'}
          </button>
        )}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full bg-tab px-6 py-2.5 text-sm font-semibold text-text-secondary transition-spring-fast hover:bg-border active:scale-[0.97]"
          >
            <ArrowLeft className="size-3.5" />
            {backLabel ?? 'Back'}
          </button>
        )}
      </div>
    </div>
  );
}
