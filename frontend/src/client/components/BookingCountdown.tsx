import { useState, useEffect, useCallback } from 'react';
import { Clock, Timer } from 'lucide-react';
import { useI18n } from '../../shared/i18n/useI18n';

interface BookingCountdownProps {
  expiresAt: string | null | undefined;
  onExpire?: () => void;
  compact?: boolean;
}

function getRemainingSeconds(expiresAt: string): number {
  const expiry = new Date(expiresAt).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((expiry - now) / 1000));
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function BookingCountdown({ expiresAt, onExpire, compact = false }: BookingCountdownProps) {
  const { t } = useI18n();
  const [remaining, setRemaining] = useState<number>(() =>
    expiresAt ? getRemainingSeconds(expiresAt) : 0,
  );
  const [hasExpired, setHasExpired] = useState(() =>
    expiresAt ? getRemainingSeconds(expiresAt) <= 0 : false,
  );

  const handleExpire = useCallback(() => {
    setHasExpired(true);
    onExpire?.();
  }, [onExpire]);

  useEffect(() => {
    if (!expiresAt) return;

    const initial = getRemainingSeconds(expiresAt);
    if (initial <= 0) {
      setHasExpired(true);
      return;
    }

    setRemaining(initial);

    const interval = setInterval(() => {
      const current = getRemainingSeconds(expiresAt);
      setRemaining(current);
      if (current <= 0) {
        clearInterval(interval);
        handleExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, handleExpire]);

  if (!expiresAt) return null;

  if (hasExpired) {
    if (compact) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
          <Timer className="size-3" />
          {t('status.cancelled')}
        </span>
      );
    }

    return (
      <div className="overflow-hidden rounded-2xl bg-destructive/5 p-1.5 ring-1 ring-destructive/20">
        <div className="rounded-[calc(1rem-6px)] bg-surface p-5 text-center">
          <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-destructive/10">
            <Timer className="size-5 text-destructive" />
          </div>
          <h3 className="text-base font-bold text-text">{t('booking.expiredTitle')}</h3>
          <p className="mt-1 text-sm text-text-secondary">{t('booking.expiredBody')}</p>
          <a
            href="/search"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-spring-fast hover:bg-primary-hover active:scale-[0.97]"
          >
            {t('booking.searchAgain')}
          </a>
        </div>
      </div>
    );
  }

  const isUrgent = remaining < 120;
  const isWarning = remaining < 300;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 text-xs font-medium ${isUrgent ? 'animate-pulse text-destructive' : isWarning ? 'text-badge-pending-text' : 'text-text-secondary'}`}>
        <Clock className={`size-3 ${isUrgent ? 'text-destructive' : ''}`} />
        <span>{t('booking.remaining')}:</span>
        <span className="tabular-nums font-semibold">{formatTime(remaining)}</span>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-2xl p-1.5 ring-1 ${isUrgent ? 'bg-destructive/5 ring-destructive/30 animate-pulse' : isWarning ? 'bg-amber-500/5 ring-amber-500/20' : 'bg-shadow/5 ring-black/5'}`}>
      <div className="flex items-center gap-3 rounded-[calc(1rem-6px)] bg-surface px-5 py-3.5">
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${isUrgent ? 'bg-destructive/10' : isWarning ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
          <Clock className={`size-4 ${isUrgent ? 'text-destructive' : isWarning ? 'text-amber-600' : 'text-primary'}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-text-secondary">{t('booking.expiresAt')}</div>
          <div className={`mt-0.5 text-lg font-bold tabular-nums tracking-wide ${isUrgent ? 'text-destructive' : isWarning ? 'text-amber-600' : 'text-text'}`}>
            {formatTime(remaining)}
          </div>
        </div>
      </div>
    </div>
  );
}
