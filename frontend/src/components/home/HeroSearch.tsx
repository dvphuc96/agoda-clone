import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { hotelsApi, type Destination } from '../../api/hotels';

export default function HeroSearch() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  const { data: destinations } = useQuery({
    queryKey: ['destinations'],
    queryFn: () => hotelsApi.getDestinations().then(r => r.data),
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination) params.set('destination', destination);
    if (checkIn) params.set('check_in', checkIn);
    if (checkOut) params.set('check_out', checkOut);
    if (guests) params.set('guests', String(guests));
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="bg-gradient-to-br from-navy via-primary to-blue-400 px-4 md:px-8 py-12 md:py-16 text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Kham pha Viet Nam tuyet dep</h1>
      <p className="text-blue-200 text-base font-light mb-8">Dat phong khach san, villa nghi duong cao cap tai Viet Nam</p>

      <div className="bg-white rounded-xl p-2 max-w-4xl mx-auto flex flex-col md:flex-row gap-1 items-stretch md:items-center shadow-lg shadow-black/10">
        <div className="flex-[2.5] px-4 py-3 text-left">
          <label className="text-[10px] text-text-secondary uppercase font-semibold tracking-wide">Diem den</label>
          <select
            value={destination}
            onChange={e => setDestination(e.target.value)}
            className="block w-full text-text font-medium text-sm mt-0.5 bg-transparent outline-none"
          >
            <option value="">Tat ca diem den</option>
            {destinations?.map((d: Destination) => (
              <option key={d.id} value={d.slug}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-[1.5] px-4 py-3 text-left md:border-l md:border-border">
          <label className="text-[10px] text-text-secondary uppercase font-semibold tracking-wide">Nhan phong</label>
          <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
            className="block w-full text-text font-medium text-sm mt-0.5 outline-none" />
        </div>
        <div className="flex-[1.5] px-4 py-3 text-left md:border-l md:border-border">
          <label className="text-[10px] text-text-secondary uppercase font-semibold tracking-wide">Tra phong</label>
          <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
            className="block w-full text-text font-medium text-sm mt-0.5 outline-none" />
        </div>
        <div className="flex-1 px-4 py-3 text-left md:border-l md:border-border">
          <label className="text-[10px] text-text-secondary uppercase font-semibold tracking-wide">Khach</label>
          <select value={guests} onChange={e => setGuests(Number(e.target.value))}
            className="block w-full text-text font-medium text-sm mt-0.5 bg-transparent outline-none">
            <option value={1}>1 nguoi</option>
            <option value={2}>2 nguoi</option>
            <option value={3}>3 nguoi</option>
            <option value={4}>4 nguoi</option>
          </select>
        </div>
        <button onClick={handleSearch}
          className="bg-primary text-white px-6 py-3.5 rounded-lg font-semibold whitespace-nowrap hover:bg-blue-700 transition-colors">
          Tim kiem
        </button>
      </div>
    </section>
  );
}
