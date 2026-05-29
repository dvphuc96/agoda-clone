import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminApi, type RoomTypePayload } from '../../../shared/api/admin';
import type { RoomType } from '../../../shared/api/hotels';
import DataTable from '../../components/DataTable';
import ImageUpload from '../../components/ImageUpload';
import { formatCurrency, pageTitle } from '../adminUtils';

const blank: RoomTypePayload = { name: '', description: '', max_guests: 2, bed_type: '', size_sqm: null, price_per_night: '', amenities: [], total_rooms: 1 };

export default function RoomTypeListPage() {
  const hotelId = Number(useParams().hotelId);
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<RoomType | null>(null);
  const [form, setForm] = useState<RoomTypePayload>(blank);
  const [amenities, setAmenities] = useState('');
  const rooms = useQuery({ queryKey: ['admin', 'room-types', hotelId], queryFn: async () => (await adminApi.roomTypes(hotelId)).data, enabled: Boolean(hotelId) });
  const save = useMutation({
    mutationFn: () => {
      const payload = { ...form, amenities: amenities.split(',').flatMap((item) => { const r = item.trim(); return r ? [r] : []; }) };
      return editing ? adminApi.updateRoomType(editing.id, payload) : adminApi.createRoomType(hotelId, payload);
    },
    onSuccess: () => { setEditing(null); setForm(blank); setAmenities(''); void queryClient.invalidateQueries({ queryKey: ['admin', 'room-types', hotelId] }); },
  });
  const remove = useMutation({ mutationFn: (id: number) => adminApi.deleteRoomType(id), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'room-types', hotelId] }) });
  const upload = useMutation({ mutationFn: ({ id, files }: { id: number; files: FileList }) => adminApi.uploadRoomTypeImages(id, files), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'room-types', hotelId] }) });

  const columns = useMemo<ColumnDef<RoomType>[]>(() => [
    { accessorKey: 'name', header: 'Room type' },
    { accessorKey: 'max_guests', header: 'Guests' },
    { accessorKey: 'bed_type', header: 'Bed' },
    { header: 'Price', cell: ({ row }) => formatCurrency(row.original.price_per_night) },
    { accessorKey: 'total_rooms', header: 'Inventory' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button type="button" className="rounded-md border px-3 py-1.5 text-xs font-semibold" onClick={() => { setEditing(row.original); setForm({ ...row.original, price_per_night: row.original.price_per_night }); setAmenities((row.original.amenities ?? []).join(', ')); }}>Edit</button>
          <button type="button" className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700" onClick={() => remove.mutate(row.original.id)}>Delete</button>
        </div>
      ),
    },
  ], [remove]);

  return (
    <div>
      {pageTitle('Room Types', 'Configure room inventory and pricing for this hotel.')}
      <Link to="/admin/hotels" className="mb-4 inline-flex rounded-md border px-3 py-2 text-sm font-semibold">Back to hotels</Link>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <DataTable data={rooms.data?.data ?? []} columns={columns} emptyText={rooms.isLoading ? 'Loading...' : 'No room types found.'} />
        <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">{editing ? 'Edit room type' : 'New room type'}</h2>
          <form className="mt-4 space-y-3" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
            {(['name', 'bed_type'] as const).map((field) => <input key={field} aria-label={field === 'name' ? 'Tên loại phòng' : 'Loại giường'} value={String(form[field] ?? '')} onChange={(event) => setForm({ ...form, [field]: event.target.value })} placeholder={field} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />)}
            <div className="grid grid-cols-3 gap-2">
              <input aria-label="Số khách tối đa" type="number" value={form.max_guests} onChange={(event) => setForm({ ...form, max_guests: Number(event.target.value) })} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input aria-label="Giá mỗi đêm" type="number" value={String(form.price_per_night)} onChange={(event) => setForm({ ...form, price_per_night: event.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input aria-label="Tổng số phòng" type="number" value={form.total_rooms} onChange={(event) => setForm({ ...form, total_rooms: Number(event.target.value) })} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <textarea aria-label="Mô tả" value={form.description ?? ''} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input aria-label="Tiện ích" value={amenities} onChange={(event) => setAmenities(event.target.value)} placeholder="Amenities, comma separated" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            {editing && <ImageUpload label="Upload room images" multiple onChange={(files) => upload.mutate({ id: editing.id, files })} />}
            <button type="submit" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">{editing ? 'Save changes' : 'Create room type'}</button>
          </form>
        </aside>
      </div>
    </div>
  );
}
