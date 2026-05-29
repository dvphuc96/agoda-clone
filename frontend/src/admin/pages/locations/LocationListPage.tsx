import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { adminApi, type LocationPayload } from '../../../shared/api/admin';
import type { Location } from '../../../shared/api/hotels';
import AdminModal from '../../components/AdminModal';
import DataTable from '../../components/DataTable';
import ImageUpload from '../../components/ImageUpload';
import { pageTitle } from '../adminUtils';

const blank: LocationPayload = { name: '', slug: '', image: '', description: '', region: '' };

const fieldClass = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-950 focus:outline-none';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}

export default function LocationListPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Location | null>(null);
  const [form, setForm] = useState<LocationPayload>(blank);
  const [modalOpen, setModalOpen] = useState(false);
  const locations = useQuery({
    queryKey: ['admin', 'locations', search],
    queryFn: async () => (await adminApi.locations(search ? { search } : undefined)).data,
  });

  const save = useMutation({
    mutationFn: () => (editing ? adminApi.updateLocation(editing.id, form) : adminApi.createLocation(form)),
    onSuccess: () => {
      setEditing(null);
      setForm(blank);
      setModalOpen(false);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'locations'] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => adminApi.deleteLocation(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'locations'] }),
  });

  const upload = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => adminApi.uploadLocationImage(id, file),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'locations'] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(blank);
    setModalOpen(true);
  };

  const openEdit = (location: Location) => {
    setEditing(location);
    setForm({
      name: location.name,
      slug: location.slug,
      image: location.image ?? '',
      description: location.description ?? '',
      region: location.region,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(blank);
  };

  const columns = useMemo<ColumnDef<Location>[]>(() => [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'region', header: 'Region' },
    { accessorKey: 'hotels_count', header: 'Hotels', cell: ({ row }) => row.original.hotels_count ?? 0 },
    {
      id: 'image',
      header: 'Image',
      cell: ({ row }) => row.original.image ? <img src={row.original.image} alt="" className="h-12 w-20 rounded-md object-cover" /> : '-',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button type="button" className="rounded-md border px-3 py-1.5 text-xs font-semibold" onClick={() => openEdit(row.original)}>
            Edit
          </button>
          <button type="button" className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700" onClick={() => remove.mutate(row.original.id)}>
            Delete
          </button>
        </div>
      ),
    },
  ], [remove]);

  return (
    <div>
      {pageTitle('Locations', 'Create destination records and maintain location imagery.')}
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search locations" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm md:max-w-sm" />
        <button type="button" onClick={openCreate} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
          Create location
        </button>
      </div>
      <DataTable data={locations.data?.data ?? []} columns={columns} emptyText={locations.isLoading ? 'Loading...' : 'No locations found.'} />

      <AdminModal open={modalOpen} title={editing ? 'Edit location' : 'Create location'} width="md" onClose={closeModal}>
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
          <Field label="Name">
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Da Nang" className={fieldClass} />
          </Field>
          <Field label="Slug">
            <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="da-nang" className={fieldClass} />
          </Field>
          <Field label="Region">
            <input value={form.region} onChange={(event) => setForm({ ...form, region: event.target.value })} placeholder="Central Vietnam" className={fieldClass} />
          </Field>
          <Field label="Image URL">
            <input value={form.image ?? ''} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="https://..." className={fieldClass} />
          </Field>
          {editing && <ImageUpload label="Upload location image" onChange={(files) => upload.mutate({ id: editing.id, file: files[0] })} />}
          <Field label="Description">
            <textarea value={form.description ?? ''} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Short destination overview" className={`${fieldClass} min-h-28`} />
          </Field>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" className="rounded-md border px-4 py-2 text-sm font-semibold" onClick={closeModal}>Cancel</button>
            <button type="submit" disabled={save.isPending} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {editing ? 'Save changes' : 'Create location'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
