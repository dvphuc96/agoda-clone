import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { partnerApi } from '../../shared/api/partner';
import type { Hotel } from '../../shared/api/hotels';
import DataTable from '../../admin/components/DataTable';
import StatusBadge from '../../admin/components/StatusBadge';
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

export default function PartnerHotelsPage() {
  const queryClient = useQueryClient();
  const defaultForm = {
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    checkin_time: '14:00',
    checkout_time: '12:00',
  };

  const [editing, setEditing] = useState<Hotel | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ ...defaultForm });

  const hotels = useQuery({
    queryKey: ['partner', 'hotels'],
    queryFn: async () => (await partnerApi.hotels()).data,
  });

  const hotelArray = Array.isArray(hotels.data) ? hotels.data : (hotels.data as unknown as { data: Hotel[] })?.data ?? [];

  const save = useMutation({
    mutationFn: () => {
      if (editing) {
        return partnerApi.updateHotel(editing.id, form);
      }
      return partnerApi.createHotel(form);
    },
    onSuccess: () => {
      setModalOpen(false);
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ['partner', 'hotels'] });
    },
  });

  const openEdit = (hotel: Hotel) => {
    setEditing(hotel);
    setForm({
      name: hotel.name,
      description: hotel.description ?? '',
      address: hotel.address,
      phone: hotel.phone ?? '',
      email: hotel.email ?? '',
      checkin_time: hotel.checkin_time,
      checkout_time: hotel.checkout_time,
    });
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...defaultForm });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const columns = useMemo<ColumnDef<Hotel>[]>(
    () => [
      { accessorKey: 'name', header: 'Hotel' },
      { accessorKey: 'star_rating', header: 'Stars' },
      {
        header: 'Location',
        cell: ({ row }) => row.original.location?.name ?? '-',
      },
      {
        header: 'Status',
        cell: ({ row }) => <StatusBadge value={row.original.status} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/partner/hotels/${row.original.id}/rooms`}
              className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              Rooms
            </Link>
            <button
              type="button"
              className="rounded-md border px-3 py-1.5 text-xs font-semibold"
              onClick={() => openEdit(row.original)}
            >
              Edit
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div>
      {pageTitle('My Hotels', 'View and manage your hotel properties.')}

      <div className="mb-4">
        <button
          type="button"
          onClick={openCreate}
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          + Request New Hotel
        </button>
      </div>

      <DataTable
        data={hotelArray}
        columns={columns}
        emptyText={hotels.isLoading ? 'Loading...' : 'No hotels found. Contact admin to register your property.'}
      />

      <AdminModal open={modalOpen} title={editing ? `Edit: ${editing.name}` : 'Request New Hotel'} width="lg" onClose={closeModal}>
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Hotel name">
              <input
                aria-label="Hotel name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={fieldClass}
              />
            </Field>
            <Field label="Address">
              <input
                aria-label="Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className={fieldClass}
              />
            </Field>
            <Field label="Phone">
              <input
                aria-label="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={fieldClass}
              />
            </Field>
            <Field label="Email">
              <input
                aria-label="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={fieldClass}
              />
            </Field>
            <Field label="Check-in time">
              <input
                aria-label="Check-in time"
                type="time"
                value={form.checkin_time}
                onChange={(e) => setForm({ ...form, checkin_time: e.target.value })}
                className={fieldClass}
              />
            </Field>
            <Field label="Check-out time">
              <input
                aria-label="Check-out time"
                type="time"
                value={form.checkout_time}
                onChange={(e) => setForm({ ...form, checkout_time: e.target.value })}
                className={fieldClass}
              />
            </Field>
          </div>
          <Field label="Description">
            <textarea
              aria-label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`${fieldClass} min-h-24`}
            />
          </Field>

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" className="rounded-md border px-4 py-2 text-sm font-semibold" onClick={closeModal}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={save.isPending}
              className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              {editing ? 'Save changes' : 'Submit Request'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
