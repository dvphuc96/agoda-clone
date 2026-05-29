import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, type HotelPayload, type Paginated } from '../../../shared/api/admin';
import type { Hotel } from '../../../shared/api/hotels';
import AdminModal from '../../components/AdminModal';
import DataTable from '../../components/DataTable';
import ImageUpload from '../../components/ImageUpload';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import { pageTitle } from '../adminUtils';

const blank: HotelPayload = {
  location_id: 0,
  name: '',
  slug: '',
  description: '',
  address: '',
  star_rating: 4,
  latitude: '',
  longitude: '',
  phone: '',
  email: '',
  checkin_time: '14:00',
  checkout_time: '12:00',
  amenities: [],
  status: 'active',
};

const fieldClass = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-950 focus:outline-none';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}

const toPayload = (hotel: Hotel): HotelPayload => ({
  location_id: hotel.location.id,
  name: hotel.name,
  slug: hotel.slug,
  description: hotel.description ?? '',
  address: hotel.address,
  star_rating: hotel.star_rating,
  latitude: hotel.latitude ?? '',
  longitude: hotel.longitude ?? '',
  phone: hotel.phone ?? '',
  email: hotel.email ?? '',
  checkin_time: hotel.checkin_time,
  checkout_time: hotel.checkout_time,
  amenities: hotel.amenities ?? [],
  status: hotel.status === 'inactive' ? 'inactive' : 'active',
});

export default function HotelListPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ search: '', status: '', location_id: '', star_rating: '', page: 1 });
  const [editing, setEditing] = useState<Hotel | null>(null);
  const [form, setForm] = useState<HotelPayload>(blank);
  const [amenities, setAmenities] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const hotels = useQuery({
    queryKey: ['admin', 'hotels', filters],
    queryFn: async () => (await adminApi.hotels(Object.fromEntries(Object.entries(filters).filter(([, value]) => value)))).data,
  });
  const locations = useQuery({ queryKey: ['admin', 'locations', 'select'], queryFn: async () => (await adminApi.locations()).data.data });

  const save = useMutation({
    mutationFn: () => {
      const payload = { ...form, amenities: amenities.split(',').flatMap((item) => { const r = item.trim(); return r ? [r] : []; }) };
      return editing ? adminApi.updateHotel(editing.id, payload) : adminApi.createHotel(payload);
    },
    onSuccess: () => {
      setEditing(null);
      setForm(blank);
      setAmenities('');
      setModalOpen(false);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'hotels'] });
    },
  });
  const remove = useMutation({ mutationFn: (id: number) => adminApi.deleteHotel(id), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'hotels'] }) });
  const toggle = useMutation({ mutationFn: (id: number) => adminApi.toggleHotelStatus(id), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'hotels'] }) });
  const upload = useMutation({ mutationFn: ({ id, files }: { id: number; files: FileList }) => adminApi.uploadHotelImages(id, files), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'hotels'] }) });
  const deleteImage = useMutation({
    mutationFn: (imageId: number) => adminApi.deleteHotelImage(imageId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'hotels'] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(blank);
    setAmenities('');
    setModalOpen(true);
  };

  const openEdit = (hotel: Hotel) => {
    setEditing(hotel);
    setForm(toPayload(hotel));
    setAmenities((hotel.amenities ?? []).join(', '));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(blank);
    setAmenities('');
  };

  const setPage = (page: number) => setFilters((f) => ({ ...f, page }));

  const columns = useMemo<ColumnDef<Hotel>[]>(
    () => [
      { accessorKey: 'name', header: 'Hotel' },
      { header: 'Location', cell: ({ row }) => row.original.location?.name ?? '-' },
      { accessorKey: 'star_rating', header: 'Stars' },
      { header: 'Rooms', cell: ({ row }) => row.original.room_types?.length ?? 0 },
      { header: 'Status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Link to={`/admin/hotels/${row.original.id}/rooms`} className="rounded-md border px-3 py-1.5 text-xs font-semibold">Rooms</Link>
            <button type="button" className="rounded-md border px-3 py-1.5 text-xs font-semibold" onClick={() => openEdit(row.original)}>Edit</button>
            <button type="button" className="rounded-md border px-3 py-1.5 text-xs font-semibold" onClick={() => toggle.mutate(row.original.id)}>Toggle</button>
            <button type="button" className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700" onClick={() => remove.mutate(row.original.id)}>Delete</button>
          </div>
        ),
      },
    ],
    [remove, toggle],
  );

  return (
    <div>
      {pageTitle('Hotels', 'Manage bookable properties, profile content, images, and room inventory.')}
      <div className="mb-3 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:flex-wrap">
          <input
            aria-label="Search hotels"
            value={filters.search}
            onChange={(event) => setFilters((f) => ({ ...f, search: event.target.value, page: 1 }))}
            placeholder="Search hotels"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm md:w-64"
          />
          <select
            aria-label="Filter by status"
            value={filters.status}
            onChange={(event) => setFilters((f) => ({ ...f, status: event.target.value, page: 1 }))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            aria-label="Filter by location"
            value={filters.location_id}
            onChange={(event) => setFilters((f) => ({ ...f, location_id: event.target.value, page: 1 }))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All locations</option>
            {(locations.data ?? []).map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
          <select
            aria-label="Filter by star rating"
            value={filters.star_rating}
            onChange={(event) => setFilters((f) => ({ ...f, star_rating: event.target.value, page: 1 }))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All stars</option>
            <option value="1">1 Star</option>
            <option value="2">2 Stars</option>
            <option value="3">3 Stars</option>
            <option value="4">4 Stars</option>
            <option value="5">5 Stars</option>
          </select>
        </div>
        <button type="button" onClick={openCreate} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
          Create hotel
        </button>
      </div>

      <DataTable data={hotels.data?.data ?? []} columns={columns} emptyText={hotels.isLoading ? 'Loading…' : 'No hotels found.'} />
      <Pagination pagination={hotels.data as Paginated<unknown> | undefined} onPageChange={setPage} />

      <AdminModal open={modalOpen} title={editing ? 'Edit hotel' : 'Create hotel'} width="xl" onClose={closeModal}>
        <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Location">
              <select aria-label="Select location" value={form.location_id} onChange={(event) => setForm({ ...form, location_id: Number(event.target.value) })} className={fieldClass}>
                <option value={0}>Select location</option>
                {(locations.data ?? []).map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select aria-label="Select status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as HotelPayload['status'] })} className={fieldClass}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
            <Field label="Hotel name">
              <input aria-label="Hotel name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="GoStay Grand Hotel" className={fieldClass} />
            </Field>
            <Field label="Slug">
              <input aria-label="Slug" value={String(form.slug ?? '')} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="gostay-grand-hotel" className={fieldClass} />
            </Field>
            <Field label="Address">
              <input aria-label="Address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Street, district, city" className={fieldClass} />
            </Field>
            <Field label="Star rating">
              <input aria-label="Star rating" type="number" value={form.star_rating} onChange={(event) => setForm({ ...form, star_rating: Number(event.target.value) })} min={1} max={5} className={fieldClass} />
            </Field>
            <Field label="Phone">
              <input aria-label="Phone" value={String(form.phone ?? '')} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+84..." className={fieldClass} />
            </Field>
            <Field label="Email">
              <input aria-label="Email" value={String(form.email ?? '')} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="hotel@gostay.local" className={fieldClass} />
            </Field>
            <Field label="Check-in time">
              <input aria-label="Check-in time" type="time" value={form.checkin_time} onChange={(event) => setForm({ ...form, checkin_time: event.target.value })} className={fieldClass} />
            </Field>
            <Field label="Check-out time">
              <input aria-label="Check-out time" type="time" value={form.checkout_time} onChange={(event) => setForm({ ...form, checkout_time: event.target.value })} className={fieldClass} />
            </Field>
            <Field label="Latitude">
              <input aria-label="Latitude" value={String(form.latitude ?? '')} onChange={(event) => setForm({ ...form, latitude: event.target.value })} placeholder="10.7769" className={fieldClass} />
            </Field>
            <Field label="Longitude">
              <input aria-label="Longitude" value={String(form.longitude ?? '')} onChange={(event) => setForm({ ...form, longitude: event.target.value })} placeholder="106.7009" className={fieldClass} />
            </Field>
          </div>

          <Field label="Description">
            <textarea aria-label="Description" value={form.description ?? ''} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Property overview" className={`${fieldClass} min-h-24`} />
          </Field>
          <Field label="Amenities">
            <input aria-label="Amenities" value={amenities} onChange={(event) => setAmenities(event.target.value)} placeholder="Pool, Spa, Airport shuttle" className={fieldClass} />
          </Field>

          {editing && (
            <>
              {editing.images && editing.images.length > 0 && (
                <div>
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Images</span>
                  <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
                    {editing.images.map((img) => (
                      <div key={img.id} className="group relative overflow-hidden rounded-lg border border-slate-200">
                        <img src={img.image_path} alt={img.caption ?? 'Hotel image'} className="aspect-[4/3] w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => deleteImage.mutate(img.id)}
                          className="absolute right-1 top-1 rounded-full bg-rose-600 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label="Delete image"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="size-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <ImageUpload label="Upload hotel images" multiple onChange={(files) => upload.mutate({ id: editing.id, files })} />
            </>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" className="rounded-md border px-4 py-2 text-sm font-semibold" onClick={closeModal}>Cancel</button>
            <button type="submit" disabled={save.isPending} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {editing ? 'Save changes' : 'Create hotel'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
