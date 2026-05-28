import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const starOptions = [1, 2, 3, 4, 5];
const propertyTypes = ['Khach san', 'Villa', 'Resort', 'Can ho'];
const amenitiesList = ['WiFi', 'Ho boi', 'Spa', 'Nha hang', 'Bai do xe', 'Gym', 'Dieu hoa', 'Buffet sang'];

export default function SearchFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [priceMin, setPriceMin] = useState(searchParams.get('price_min') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('price_max') || '');
  const [star, setStar] = useState(Number(searchParams.get('star')) || 0);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    if (priceMin) params.set('price_min', priceMin);
    else params.delete('price_min');
    if (priceMax) params.set('price_max', priceMax);
    else params.delete('price_max');
    if (star) params.set('star', String(star));
    else params.delete('star');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setPriceMin('');
    setPriceMax('');
    setStar(0);
    setSelectedTypes([]);
    setSelectedAmenities([]);
    const params = new URLSearchParams(searchParams);
    params.delete('price_min');
    params.delete('price_max');
    params.delete('star');
    setSearchParams(params);
  };

  return (
    <aside className="w-full md:w-[260px] shrink-0 space-y-5">
      {/* Price Range */}
      <div className="bg-surface rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-text text-sm mb-3">Khoang gia</h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Tu"
            value={priceMin}
            onChange={e => setPriceMin(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary"
          />
          <span className="text-text-secondary">-</span>
          <input
            type="number"
            placeholder="Den"
            value={priceMax}
            onChange={e => setPriceMax(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Star Rating */}
      <div className="bg-surface rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-text text-sm mb-3">Hang sao</h3>
        <div className="flex flex-wrap gap-2">
          {starOptions.map(s => (
            <button
              key={s}
              onClick={() => setStar(star === s ? 0 : s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                star === s
                  ? 'bg-primary text-white'
                  : 'bg-tab text-text-secondary hover:bg-border'
              }`}
            >
              {'⭐'.repeat(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Property Type */}
      <div className="bg-surface rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-text text-sm mb-3">Loai hinh</h3>
        <div className="space-y-2">
          {propertyTypes.map(type => (
            <label key={type} className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => toggleType(type)}
                className="accent-primary"
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="bg-surface rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-text text-sm mb-3">Tien ich</h3>
        <div className="flex flex-wrap gap-2">
          {amenitiesList.map(amenity => (
            <button
              key={amenity}
              onClick={() => toggleAmenity(amenity)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedAmenities.includes(amenity)
                  ? 'bg-primary text-white'
                  : 'bg-tab text-text-secondary hover:bg-border'
              }`}
            >
              {amenity}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={applyFilters}
          className="flex-1 bg-primary text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          Ap dung bo loc
        </button>
        <button
          onClick={clearFilters}
          className="px-4 py-2.5 rounded-lg border border-border text-text-secondary text-sm hover:bg-tab transition-colors"
        >
          Xoa
        </button>
      </div>
    </aside>
  );
}
