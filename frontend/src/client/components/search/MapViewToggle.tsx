import { LayoutGrid, Map, Columns2 } from 'lucide-react';
import { useI18n } from '../../../shared/i18n/useI18n';

export type ViewMode = 'list' | 'map' | 'split';

interface MapViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export default function MapViewToggle({ value, onChange }: MapViewToggleProps) {
  const { t } = useI18n();

  const modes: { key: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
    { key: 'list', label: t('map.listView'), icon: LayoutGrid },
    { key: 'map', label: t('map.mapView'), icon: Map },
    { key: 'split', label: t('map.splitView'), icon: Columns2 },
  ];

  return (
    <div className="inline-flex rounded-lg border border-border bg-white p-1 shadow-sm">
      {modes.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-all ${
            value === key
              ? 'bg-navy text-white shadow-sm'
              : 'text-text-secondary hover:bg-warm-surface hover:text-text'
          }`}
          aria-pressed={value === key}
        >
          <Icon className="size-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
