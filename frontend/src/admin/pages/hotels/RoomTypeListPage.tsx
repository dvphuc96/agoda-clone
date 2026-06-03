import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminApi, type RoomTypePayload } from '../../../shared/api/admin';
import type { RoomType } from '../../../shared/api/hotels';
import AdminModal from '../../components/AdminModal';
import DataTable from '../../components/DataTable';
import ImageUpload from '../../components/ImageUpload';
import { formatCurrency, pageTitle } from '../adminUtils';

const blank: RoomTypePayload = { name: '', description: '', max_guests: 2, bed_type: '', size_sqm: null, price_per_night: '', amenities: [], total_rooms: 1 };

const fieldClass = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-950 focus:outline-none';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}

export default function RoomTypeListPage() {
  const hotelId = Number(useParams().hotelId);
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<RoomType | null>(null);
  const [form, setForm] = useState<RoomTypePayload>(blank);
  const [amenities, setAmenities] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingImages, setViewingImages] = useState<RoomType | null>(null);

  const rooms = useQuery({ queryKey: ['admin', 'room-types', hotelId], queryFn: async () => (await adminApi.roomTypes(hotelId)).data, enabled: Boolean(hotelId) });

  const save = useMutation({
    mutationFn: () => {
      const payload = { ...form, amenities: amenities.split(',').flatMap((item) => { const r = item.trim(); return r ? [r] : []; }) };
      return editing ? adminApi.updateRoomType(editing.id, payload) : adminApi.createRoomType(hotelId, payload);
    },
    onSuccess: () => { closeModal(); void queryClient.invalidateQueries({ queryKey: ['admin', 'room-types', hotelId] }); },
  });
  const remove = useMutation({ mutationFn: (id: number) => adminApi.deleteRoomType(id), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'room-types', hotelId] }) });
  const upload = useMutation({ mutationFn: ({ id, files }: { id: number; files: FileList }) => adminApi.uploadRoomTypeImages(id, files), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'room-types', hotelId] }) });
  const deleteImage = useMutation({
    mutationFn: (imageId: number) => adminApi.deleteRoomTypeImage(imageId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'room-types', hotelId] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(blank);
    setAmenities('');
    setModalOpen(true);
  };

  const openEdit = (room: RoomType) => {
    setEditing(room);
    setForm({ ...room, price_per_night: room.price_per_night });
    setAmenities((room.amenities ?? []).join(', '));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(blank);
    setAmenities('');
  };

  const currentEditingWithImages = editing && rooms.data?.data.find((r) => r.id === editing.id);

  const columns = useMemo<ColumnDef<RoomType>[]>(
    () => [
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
            <button type="button" className="rounded-md border px-3 py-1.5 text-xs font-semibold" onClick={() => openEdit(row.original)}>Edit</button>
            <Link to={`/admin/hotels/${hotelId}/rooms/${row.original.id}/price-overrides`} className="rounded-md border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">Rates</Link>
            {(row.original.images?.length ?? 0) > 0 && (
              <button type="button" className="rounded-md border px-3 py-1.5 text-xs font-semibold" onClick={() => setViewingImages(row.original)}>
                Images
              </button>
            )}
            <button type="button" className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700" onClick={() => remove.mutate(row.original.id)}>Delete</button>
          </div>
        ),
      },
    ],
    [remove],
  );

  return (
    <div>
      {pageTitle('Room Types', 'Configure room inventory and pricing for this hotel.')}
      <div className="mb-4 flex items-center justify-between">
        <Link to="/admin/hotels" className="inline-flex rounded-md border px-3 py-2 text-sm font-semibold">Back to hotels</Link>
        <button type="button" onClick={openCreate} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
          Create room type
        </button>
      </div>

      <DataTable data={rooms.data?.data ?? []} columns={columns} emptyText={rooms.isLoading ? 'Loading…' : 'No room types found.'} />

      <AdminModal open={modalOpen} title={editing ? 'Edit room type' : 'New room type'} width="lg" onClose={closeModal}>
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Room type name">
              <input aria-label="Room type name" value={String(form.name ?? '')} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Deluxe Ocean View" className={fieldClass} />
            </Field>
            <Field label="Bed type">
              <input aria-label="Bed type" value={String(form.bed_type ?? '')} onChange={(event) => setForm({ ...form, bed_type: event.target.value })} placeholder="King" className={fieldClass} />
            </Field>
            <Field label="Max guests">
              <input aria-label="Max guests" type="number" value={form.max_guests} onChange={(event) => setForm({ ...form, max_guests: Number(event.target.value) })} className={fieldClass} />
            </Field>
            <Field label="Price per night">
              <input aria-label="Price per night" type="number" value={String(form.price_per_night)} onChange={(event) => setForm({ ...form, price_per_night: event.target.value })} className={fieldClass} />
            </Field>
            <Field label="Total rooms">
              <input aria-label="Total rooms" type="number" value={form.total_rooms} onChange={(event) => setForm({ ...form, total_rooms: Number(event.target.value) })} className={fieldClass} />
            </Field>
            <Field label="Size (sqm)">
              <input aria-label="Size in square meters" type="number" value={String(form.size_sqm ?? '')} onChange={(event) => setForm({ ...form, size_sqm: event.target.value ? Number(event.target.value) : null })} placeholder="30" className={fieldClass} />
            </Field>
          </div>
          <Field label="Description">
            <textarea aria-label="Description" value={form.description ?? ''} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Room description" className={`${fieldClass} min-h-20`} />
          </Field>
          <Field label="Amenities (comma separated)">
            <input aria-label="Amenities" value={amenities} onChange={(event) => setAmenities(event.target.value)} placeholder="WiFi, Mini-bar, Sea view" className={fieldClass} />
          </Field>

          {editing && currentEditingWithImages && (
            <>
              {currentEditingWithImages.images.length > 0 && (
                <div>
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Images</span>
                  <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
                    {currentEditingWithImages.images.map((img) => (
                      <div key={img.id} className="group relative overflow-hidden rounded-lg border border-slate-200">
                        <img src={img.image_path} alt={img.caption ?? 'Room image'} className="aspect-[4/3] w-full object-cover" />
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
              <ImageUpload label="Upload room images" multiple onChange={(files) => upload.mutate({ id: editing.id, files })} />
            </>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" className="rounded-md border px-4 py-2 text-sm font-semibold" onClick={closeModal}>Cancel</button>
            <button type="submit" disabled={save.isPending} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {editing ? 'Save changes' : 'Create room type'}
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminModal open={viewingImages !== null} title="Room Images" width="lg" onClose={() => setViewingImages(null)}>
        {viewingImages && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {viewingImages.images.map((img) => (
              <div key={img.id} className="group relative overflow-hidden rounded-lg border border-slate-200">
                <img src={img.image_path} alt={img.caption ?? 'Room image'} className="aspect-[4/3] w-full object-cover" />
                <button
                  type="button"
                  onClick={() => { deleteImage.mutate(img.id); setViewingImages(null); }}
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
        )}
      </AdminModal>
    </div>
  );
}
