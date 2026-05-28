import { useSearchParams } from 'react-router-dom';

const sortOptions = [
  { value: '', label: 'Pho bien' },
  { value: 'price_asc', label: 'Gia thap nhat' },
  { value: 'price_desc', label: 'Gia cao nhat' },
  { value: 'rating', label: 'Danh gia' },
];

export default function SortBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSort = searchParams.get('sort') || '';

  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm text-text-secondary mr-1">Sap xep:</span>
      {sortOptions.map(opt => (
        <button
          key={opt.value}
          onClick={() => {
            const params = new URLSearchParams(searchParams);
            if (opt.value) params.set('sort', opt.value);
            else params.delete('sort');
            params.set('page', '1');
            setSearchParams(params);
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            currentSort === opt.value
              ? 'bg-primary text-white'
              : 'bg-tab text-text-secondary hover:bg-border'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
