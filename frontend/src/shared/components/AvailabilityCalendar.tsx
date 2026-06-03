import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

interface DayAvailability {
  date: string;
  available: number;
  total: number;
}

interface AvailabilityCalendarProps {
  roomId: number;
  month?: string;
  admin?: boolean;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export default function AvailabilityCalendar({ roomId, month, admin = false }: AvailabilityCalendarProps) {
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(() => {
    if (month) {
      const [y, m] = month.split('-').map(Number);
      return { year: y, month: m - 1 };
    }
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const monthStr = `${currentDate.year}-${String(currentDate.month + 1).padStart(2, '0')}`;

  const { data: availability = [], isLoading } = useQuery({
    queryKey: ['availability-calendar', roomId, monthStr],
    queryFn: async () => {
      const res = await apiClient.get<DayAvailability[]>(
        `/room-types/${roomId}/availability-calendar?month=${monthStr}`
      );
      return res.data;
    },
    enabled: !!roomId,
  });

  const availabilityMap = useMemo(() => {
    const map = new Map<string, DayAvailability>();
    availability.forEach((d) => map.set(d.date, d));
    return map;
  }, [availability]);

  const daysInMonth = getDaysInMonth(currentDate.year, currentDate.month);
  const firstDay = getFirstDayOfMonth(currentDate.year, currentDate.month);

  const handlePrev = () => {
    setCurrentDate((prev) => {
      const m = prev.month - 1;
      if (m < 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: m };
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const m = prev.month + 1;
      if (m > 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: m };
    });
  };

  const monthLabel = new Date(currentDate.year, currentDate.month).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getCellStyle = (dayInfo: DayAvailability | undefined, isPast: boolean) => {
    if (isPast) return 'bg-gray-100 text-text-secondary/40';
    if (!dayInfo) return 'bg-white text-text-secondary';
    const ratio = dayInfo.total > 0 ? dayInfo.available / dayInfo.total : 0;
    if (dayInfo.available === 0) return 'bg-red-100 text-red-700 border-red-200';
    if (ratio <= 0.5) return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    return 'bg-green-50 text-green-800 border-green-200';
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="h-10" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentDate.year}-${String(currentDate.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayInfo = availabilityMap.get(dateStr);
    const cellDate = new Date(currentDate.year, currentDate.month, day);
    const isPast = cellDate < today;

    cells.push(
      <div
        key={day}
        className={`flex h-10 flex-col items-center justify-center rounded-lg border text-xs font-medium transition-colors ${getCellStyle(dayInfo, isPast)}`}
        title={
          dayInfo
            ? `${dayInfo.available}/${dayInfo.total} rooms`
            : undefined
        }
      >
        <span>{day}</span>
        {admin && dayInfo && !isPast && (
          <span className="text-[9px] leading-none opacity-70">
            {dayInfo.available}/{dayInfo.total}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          className="flex size-8 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-warm-surface hover:text-text"
        >
          <ChevronLeft className="size-4" />
        </button>
        <h3 className="text-sm font-bold text-text">{monthLabel}</h3>
        <button
          type="button"
          onClick={handleNext}
          className="flex size-8 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-warm-surface hover:text-text"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {DAYS.map((d) => (
          <div key={d} className="flex h-8 items-center justify-center text-xs font-semibold text-text-secondary">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      {isLoading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-warm-surface" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">{cells}</div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-3">
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-green-50 border border-green-200" />
          <span className="text-xs text-text-secondary">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-yellow-50 border border-yellow-200" />
          <span className="text-xs text-text-secondary">Low stock</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-red-100 border border-red-200" />
          <span className="text-xs text-text-secondary">Sold out</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-gray-100" />
          <span className="text-xs text-text-secondary">Past</span>
        </div>
      </div>
    </div>
  );
}
