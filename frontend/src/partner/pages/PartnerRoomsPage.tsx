import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { partnerApi } from '../../shared/api/partner';
import type { RoomType } from '../../shared/api/hotels';
import type { PriceOverride, PriceOverridePayload } from '../../shared/api/price-overrides';
import DataTable from '../../admin/components/DataTable';
import AdminModal from '../../admin/components/AdminModal';
import { formatCurrency, pageTitle } from '../partnerUtils';

const fieldClass = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}

const blankRoom = { name: '', description: '', max_guests: 2, bed_type: '', price_per_night: '', total_rooms: 1, size_sqm: '' };

export default function PartnerRoomsPage() {
  const hotelId = Number(useParams().hotelId);
  const queryClient = useQueryClient();
  const [editingRoom, setEditingRoom] = useState<RoomType | null>(null);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomForm, setRoomForm] = useState(blankRoom);

  const [priceRoomId, setPriceRoomId] = useState<number | null>(null);
  const [editingPrice, setEditingPrice] = useState<PriceOverride | null>(null);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [priceForm, setPriceForm] = useState<PriceOverridePayload>({ start_date: '', end_date: '', price_per_night: '', label: '' });

  const rooms = useQuery({
    queryKey: ['partner', 'room-types', hotelId],
    queryFn: async () => (await partnerApi.roomTypes(hotelId)).data,
    enabled: Boolean(hotelId),
  });

  const roomArray = Array.isArray(rooms.data) ? rooms.data : (rooms.data as unknown as { data: RoomType[] })?.data ?? [];

  const prices = useQuery({
    queryKey: ['partner', 'price-overrides', priceRoomId],
    queryFn: async () => (await partnerApi.priceOverrides(priceRoomId!)).data,
    enabled: priceRoomId !== null,
  });

  const priceArray = Array.isArray(prices.data) ? prices.data : [];

  const saveRoom = useMutation({
    mutationFn: () => {
      if (editingRoom) {
        return partnerApi.updateRoomType(editingRoom.id, roomForm);
      }
      return partnerApi.createRoomType(hotelId, roomForm);
    },
    onSuccess: () => {
      setRoomModalOpen(false);
      setEditingRoom(null);
      setRoomForm(blankRoom);
      void queryClient.invalidateQueries({ queryKey: ['partner', 'room-types', hotelId] });
    },
  });

  const savePrice = useMutation({
    mutationFn: () => {
      if (editingPrice) {
        return partnerApi.updatePriceOverride(editingPrice.id, priceForm);
      }
      return partnerApi.createPriceOverride(priceRoomId!, priceForm);
    },
    onSuccess: () => {
      setPriceModalOpen(false);
      setEditingPrice(null);
      void queryClient.invalidateQueries({ queryKey: ['partner', 'price-overrides', priceRoomId] });
    },
  });

  const togglePrice = useMutation({
    mutationFn: (id: number) => partnerApi.togglePriceOverride(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['partner', 'price-overrides', priceRoomId] }),
  });

  const openCreateRoom = () => {
    setEditingRoom(null);
    setRoomForm(blankRoom);
    setRoomModalOpen(true);
  };

  const openEditRoom = (room: RoomType) => {
    setEditingRoom(room);
    setRoomForm({
      name: room.name,
      description: room.description ?? '',
      max_guests: room.max_guests,
      bed_type: room.bed_type,
      price_per_night: room.price_per_night,
      total_rooms: room.total_rooms,
      size_sqm: String(room.size_sqm ?? ''),
    });
    setRoomModalOpen(true);
  };

  const openPrices = (roomTypeId: number) => {
    setPriceRoomId(roomTypeId);
  };

  const openCreatePrice = () => {
    setEditingPrice(null);
    setPriceForm({ start_date: '', end_date: '', price_per_night: '', label: '' });
    setPriceModalOpen(true);
  };

  const openEditPrice = (price: PriceOverride) => {
    setEditingPrice(price);
    setPriceForm({
      start_date: price.start_date,
      end_date: price.end_date,
      price_per_night: price.price_per_night,
      label: price.label,
    });
    setPriceModalOpen(true);
  };

  const columns = useMemo<ColumnDef<RoomType>[]>(
    () => [
      { accessorKey: 'name', header: 'Room Type' },
      { accessorKey: 'max_guests', header: 'Max Guests' },
      { accessorKey: 'bed_type', header: 'Bed' },
      {
        header: 'Price/Night',
        cell: ({ row }) => formatCurrency(row.original.price_per_night),
      },
      { accessorKey: 'total_rooms', header: 'Inventory' },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-md border px-3 py-1.5 text-xs font-semibold"
              onClick={() => openEditRoom(row.original)}
            >
              Edit
            </button>
            <button
              type="button"
              className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
              onClick={() => openPrices(row.original.id)}
            >
              Pricing
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div>
      {pageTitle('Room Types', 'Manage rooms and pricing for this hotel.')}

      <div className="mb-4 flex items-center justify-between">
        <Link to="/partner/hotels" className="inline-flex rounded-md border px-3 py-2 text-sm font-semibold hover:bg-slate-50">
          Back to hotels
        </Link>
        <button
          type="button"
          onClick={openCreateRoom}
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Create room type
        </button>
      </div>

      <DataTable
        data={roomArray}
        columns={columns}
        emptyText={rooms.isLoading ? 'Loading...' : 'No room types found.'}
      />

      {/* Price Overrides Section */}
      {priceRoomId !== null && (
        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Price Overrides</h2>
              <p className="text-sm text-slate-500">Set custom pricing for specific date ranges.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPriceRoomId(null)}
                className="rounded-md border px-3 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={openCreatePrice}
                className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Add override
              </button>
            </div>
          </div>

          {prices.isLoading ? (
            <p className="py-4 text-center text-sm text-slate-500">Loading pricing...</p>
          ) : priceArray.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">No price overrides configured.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Label</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Start</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">End</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Price/Night</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Active</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {priceArray.map((price) => (
                    <tr key={price.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-700">{price.label || '-'}</td>
                      <td className="px-4 py-3 text-slate-700">{price.start_date}</td>
                      <td className="px-4 py-3 text-slate-700">{price.end_date}</td>
                      <td className="px-4 py-3 font-medium text-slate-950">{formatCurrency(price.price_per_night)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                          price.is_active
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                            : 'bg-slate-100 text-slate-700 ring-slate-200'
                        }`}>
                          {price.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="rounded-md border px-3 py-1.5 text-xs font-semibold"
                            onClick={() => openEditPrice(price)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="rounded-md border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                            onClick={() => togglePrice.mutate(price.id)}
                          >
                            Toggle
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Room Type Modal */}
      <AdminModal open={roomModalOpen} title={editingRoom ? 'Edit Room Type' : 'New Room Type'} width="lg" onClose={() => { setRoomModalOpen(false); setEditingRoom(null); }}>
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); saveRoom.mutate(); }}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Room type name">
              <input aria-label="Room type name" value={roomForm.name} onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} placeholder="Deluxe Ocean View" className={fieldClass} />
            </Field>
            <Field label="Bed type">
              <input aria-label="Bed type" value={roomForm.bed_type} onChange={(e) => setRoomForm({ ...roomForm, bed_type: e.target.value })} placeholder="King" className={fieldClass} />
            </Field>
            <Field label="Max guests">
              <input aria-label="Max guests" type="number" value={roomForm.max_guests} onChange={(e) => setRoomForm({ ...roomForm, max_guests: Number(e.target.value) })} className={fieldClass} />
            </Field>
            <Field label="Price per night">
              <input aria-label="Price per night" type="number" value={roomForm.price_per_night} onChange={(e) => setRoomForm({ ...roomForm, price_per_night: e.target.value })} className={fieldClass} />
            </Field>
            <Field label="Total rooms">
              <input aria-label="Total rooms" type="number" value={roomForm.total_rooms} onChange={(e) => setRoomForm({ ...roomForm, total_rooms: Number(e.target.value) })} className={fieldClass} />
            </Field>
            <Field label="Size (sqm)">
              <input aria-label="Size in square meters" type="number" value={roomForm.size_sqm} onChange={(e) => setRoomForm({ ...roomForm, size_sqm: e.target.value })} placeholder="30" className={fieldClass} />
            </Field>
          </div>
          <Field label="Description">
            <textarea aria-label="Description" value={roomForm.description} onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })} placeholder="Room description" className={`${fieldClass} min-h-20`} />
          </Field>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" className="rounded-md border px-4 py-2 text-sm font-semibold" onClick={() => { setRoomModalOpen(false); setEditingRoom(null); }}>Cancel</button>
            <button type="submit" disabled={saveRoom.isPending} className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
              {editingRoom ? 'Save changes' : 'Create room type'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Price Override Modal */}
      <AdminModal open={priceModalOpen} title={editingPrice ? 'Edit Price Override' : 'New Price Override'} width="md" onClose={() => { setPriceModalOpen(false); setEditingPrice(null); }}>
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); savePrice.mutate(); }}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Start date">
              <input aria-label="Start date" type="date" value={priceForm.start_date} onChange={(e) => setPriceForm({ ...priceForm, start_date: e.target.value })} className={fieldClass} />
            </Field>
            <Field label="End date">
              <input aria-label="End date" type="date" value={priceForm.end_date} onChange={(e) => setPriceForm({ ...priceForm, end_date: e.target.value })} className={fieldClass} />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Price per night">
              <input aria-label="Price per night" type="number" value={String(priceForm.price_per_night)} onChange={(e) => setPriceForm({ ...priceForm, price_per_night: e.target.value })} className={fieldClass} />
            </Field>
            <Field label="Label (optional)">
              <input aria-label="Label" value={priceForm.label ?? ''} onChange={(e) => setPriceForm({ ...priceForm, label: e.target.value })} placeholder="Holiday rate" className={fieldClass} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" className="rounded-md border px-4 py-2 text-sm font-semibold" onClick={() => { setPriceModalOpen(false); setEditingPrice(null); }}>Cancel</button>
            <button type="submit" disabled={savePrice.isPending} className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
              {editingPrice ? 'Save changes' : 'Create override'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
