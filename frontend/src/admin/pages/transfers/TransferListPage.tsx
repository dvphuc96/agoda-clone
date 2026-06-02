import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CarFront, MapPinned, RefreshCw, Route, TicketCheck } from 'lucide-react';
import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  adminApi,
  type TransferRoutePayload,
  type TransferVehicleTypePayload,
} from '../../../shared/api/admin';
import type { TransferBooking, TransferDirection, TransferRoute, TransferStatus, TransferVehicleType } from '../../../shared/api/transfers';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate, pageTitle } from '../adminUtils';

type Tab = 'vehicles' | 'routes' | 'bookings';

const vehicleBlank: TransferVehicleTypePayload = {
  name: '',
  slug: '',
  description: '',
  passenger_capacity: 4,
  luggage_capacity: 2,
  image: '',
  is_active: true,
};

const routeBlank: TransferRoutePayload = {
  hotel_id: 0,
  transfer_vehicle_type_id: 0,
  airport_code: 'SGN',
  airport_name: 'Tan Son Nhat International Airport',
  pickup_latitude: '',
  pickup_longitude: '',
  direction: 'airport_to_hotel',
  price: 350000,
  currency: 'VND',
  duration_minutes: 35,
  distance_meters: null,
  duration_seconds: null,
  base_fee: 50000,
  price_per_km: 14000,
  price_override: null,
  pricing_source: 'manual',
  is_active: true,
};

export default function TransferListPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('vehicles');
  const [vehicleForm, setVehicleForm] = useState<TransferVehicleTypePayload>(vehicleBlank);
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [routeForm, setRouteForm] = useState<TransferRoutePayload>(routeBlank);
  const [editingRouteId, setEditingRouteId] = useState<number | null>(null);
  const [bookingFilters, setBookingFilters] = useState({ status: '', search: '' });

  const vehicles = useQuery({
    queryKey: ['admin', 'transfer-vehicle-types'],
    queryFn: async () => (await adminApi.transferVehicleTypes({ per_page: 200 })).data,
  });
  const routes = useQuery({
    queryKey: ['admin', 'transfer-routes'],
    queryFn: async () => (await adminApi.transferRoutes({ per_page: 200 })).data,
  });
  const hotels = useQuery({
    queryKey: ['admin', 'hotels', 'transfer-select'],
    queryFn: async () => (await adminApi.hotels({ per_page: 200 })).data.data,
  });
  const bookings = useQuery({
    queryKey: ['admin', 'transfer-bookings', bookingFilters],
    queryFn: async () => {
      const params = Object.fromEntries(Object.entries(bookingFilters).filter(([, value]) => value));
      return (await adminApi.transferBookings(params)).data;
    },
  });

  const vehicleMutation = useMutation({
    mutationFn: (payload: TransferVehicleTypePayload) =>
      editingVehicleId ? adminApi.updateTransferVehicleType(editingVehicleId, payload) : adminApi.createTransferVehicleType(payload),
    onSuccess: () => {
      setVehicleForm(vehicleBlank);
      setEditingVehicleId(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'transfer-vehicle-types'] });
    },
  });
  const deleteVehicle = useMutation({
    mutationFn: (id: number) => adminApi.deleteTransferVehicleType(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'transfer-vehicle-types'] }),
  });
  const routeMutation = useMutation({
    mutationFn: (payload: TransferRoutePayload) =>
      editingRouteId ? adminApi.updateTransferRoute(editingRouteId, payload) : adminApi.createTransferRoute(payload),
    onSuccess: () => {
      setRouteForm(routeBlank);
      setEditingRouteId(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'transfer-routes'] });
      void queryClient.invalidateQueries({ queryKey: ['transfer-options'] });
    },
  });
  const deleteRoute = useMutation({
    mutationFn: (id: number) => adminApi.deleteTransferRoute(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'transfer-routes'] }),
  });
  const refreshDistance = useMutation({
    mutationFn: (id: number) => adminApi.refreshTransferRouteDistance(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'transfer-routes'] }),
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: TransferStatus }) => adminApi.updateTransferBookingStatus(id, status),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'transfer-bookings'] }),
  });

  const vehicleRows = useMemo(() => vehicles.data?.data ?? [], [vehicles.data]);
  const routeRows = routes.data?.data ?? [];
  const bookingRows = bookings.data?.data ?? [];

  const activeVehicles = useMemo(() => vehicleRows.filter((vehicle) => vehicle.is_active), [vehicleRows]);

  const submitVehicle = (event: FormEvent) => {
    event.preventDefault();
    vehicleMutation.mutate(vehicleForm);
  };

  const submitRoute = (event: FormEvent) => {
    event.preventDefault();
    routeMutation.mutate(routeForm);
  };

  const editVehicle = (vehicle: TransferVehicleType) => {
    setEditingVehicleId(vehicle.id);
    setVehicleForm({
      name: vehicle.name,
      slug: vehicle.slug,
      description: vehicle.description ?? '',
      passenger_capacity: vehicle.passenger_capacity,
      luggage_capacity: vehicle.luggage_capacity,
      image: vehicle.image ?? '',
      is_active: vehicle.is_active,
    });
    setTab('vehicles');
  };

  const editRoute = (route: TransferRoute) => {
    setEditingRouteId(route.id);
    setRouteForm({
      hotel_id: route.hotel?.id ?? 0,
      transfer_vehicle_type_id: route.vehicle_type?.id ?? 0,
      airport_code: route.airport_code,
      airport_name: route.airport_name,
      pickup_latitude: route.pickup_latitude ?? '',
      pickup_longitude: route.pickup_longitude ?? '',
      direction: route.direction,
      price: route.price,
      currency: route.currency,
      duration_minutes: route.duration_minutes,
      distance_meters: route.distance_meters,
      duration_seconds: route.duration_seconds,
      base_fee: route.base_fee,
      price_per_km: route.price_per_km,
      price_override: route.price_override,
      pricing_source: route.pricing_source,
      is_active: route.is_active,
    });
    setTab('routes');
  };

  return (
    <div>
      {pageTitle('Transfers', 'Manage airport transfer vehicles, fixed route pricing, and customer requests.')}

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <Metric icon={CarFront} label="Vehicle types" value={String(vehicleRows.length)} />
        <Metric icon={Route} label="Route prices" value={String(routeRows.length)} />
        <Metric icon={TicketCheck} label="Transfer bookings" value={String(bookings.data?.total ?? bookingRows.length)} />
      </div>

      <div className="mb-5 flex flex-wrap gap-2 border-b border-slate-200">
        <TabButton active={tab === 'vehicles'} onClick={() => setTab('vehicles')} icon={CarFront} label="Vehicle types" />
        <TabButton active={tab === 'routes'} onClick={() => setTab('routes')} icon={MapPinned} label="Route pricing" />
        <TabButton active={tab === 'bookings'} onClick={() => setTab('bookings')} icon={TicketCheck} label="Bookings" />
      </div>

      {tab === 'vehicles' && (
        <section className="grid gap-5 xl:grid-cols-[24rem_1fr]">
          <form onSubmit={submitVehicle} className="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-slate-950">{editingVehicleId ? 'Edit vehicle type' : 'Create vehicle type'}</h2>
            <div className="space-y-3">
              <Field label="Name"><input required value={vehicleForm.name} onChange={(event) => setVehicleForm((form) => ({ ...form, name: event.target.value }))} className={fieldClass} /></Field>
              <Field label="Slug"><input value={vehicleForm.slug ?? ''} onChange={(event) => setVehicleForm((form) => ({ ...form, slug: event.target.value }))} className={fieldClass} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Passengers"><input required type="number" min={1} value={vehicleForm.passenger_capacity} onChange={(event) => setVehicleForm((form) => ({ ...form, passenger_capacity: Number(event.target.value) }))} className={fieldClass} /></Field>
                <Field label="Luggage"><input required type="number" min={0} value={vehicleForm.luggage_capacity} onChange={(event) => setVehicleForm((form) => ({ ...form, luggage_capacity: Number(event.target.value) }))} className={fieldClass} /></Field>
              </div>
              <Field label="Description"><textarea value={vehicleForm.description ?? ''} onChange={(event) => setVehicleForm((form) => ({ ...form, description: event.target.value }))} className={`${fieldClass} min-h-20`} /></Field>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={vehicleForm.is_active} onChange={(event) => setVehicleForm((form) => ({ ...form, is_active: event.target.checked }))} />
                Active
              </label>
              <div className="flex gap-2">
                <button type="submit" disabled={vehicleMutation.isPending} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {editingVehicleId ? 'Save vehicle' : 'Create vehicle'}
                </button>
                {editingVehicleId && <button type="button" onClick={() => { setEditingVehicleId(null); setVehicleForm(vehicleBlank); }} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold">Cancel</button>}
              </div>
            </div>
          </form>

          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Capacity</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicleRows.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td className="px-4 py-3 font-medium text-slate-950">{vehicle.name}</td>
                    <td className="px-4 py-3">{vehicle.passenger_capacity} pax / {vehicle.luggage_capacity} bags</td>
                    <td className="px-4 py-3">{vehicle.is_active ? 'Active' : 'Inactive'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => editVehicle(vehicle)} className="rounded-md border px-3 py-1.5 text-xs font-semibold">Edit</button>
                        <button type="button" onClick={() => deleteVehicle.mutate(vehicle.id)} className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'routes' && (
        <section className="grid gap-5 xl:grid-cols-[26rem_1fr]">
          <form onSubmit={submitRoute} className="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-slate-950">{editingRouteId ? 'Edit route price' : 'Create route price'}</h2>
            <div className="space-y-3">
              <Field label="Hotel">
                <select required value={routeForm.hotel_id || ''} onChange={(event) => setRouteForm((form) => ({ ...form, hotel_id: Number(event.target.value) }))} className={fieldClass}>
                  <option value="">Select hotel</option>
                  {(hotels.data ?? []).map((hotel) => <option key={hotel.id} value={hotel.id}>{hotel.name}</option>)}
                </select>
              </Field>
              <Field label="Vehicle type">
                <select required value={routeForm.transfer_vehicle_type_id || ''} onChange={(event) => setRouteForm((form) => ({ ...form, transfer_vehicle_type_id: Number(event.target.value) }))} className={fieldClass}>
                  <option value="">Select vehicle</option>
                  {activeVehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Airport code"><input required value={routeForm.airport_code} onChange={(event) => setRouteForm((form) => ({ ...form, airport_code: event.target.value.toUpperCase() }))} className={fieldClass} /></Field>
                <Field label="Currency"><input required value={routeForm.currency} onChange={(event) => setRouteForm((form) => ({ ...form, currency: event.target.value.toUpperCase() }))} className={fieldClass} /></Field>
              </div>
              <Field label="Airport name"><input required value={routeForm.airport_name} onChange={(event) => setRouteForm((form) => ({ ...form, airport_name: event.target.value }))} className={fieldClass} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Pickup latitude"><input type="number" step="0.0000001" value={routeForm.pickup_latitude ?? ''} onChange={(event) => setRouteForm((form) => ({ ...form, pickup_latitude: event.target.value }))} className={fieldClass} /></Field>
                <Field label="Pickup longitude"><input type="number" step="0.0000001" value={routeForm.pickup_longitude ?? ''} onChange={(event) => setRouteForm((form) => ({ ...form, pickup_longitude: event.target.value }))} className={fieldClass} /></Field>
              </div>
              <Field label="Direction">
                <select value={routeForm.direction} onChange={(event) => setRouteForm((form) => ({ ...form, direction: event.target.value as TransferDirection }))} className={fieldClass}>
                  <option value="airport_to_hotel">Airport to hotel</option>
                  <option value="hotel_to_airport">Hotel to airport</option>
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price"><input required type="number" min={0} value={routeForm.price} onChange={(event) => setRouteForm((form) => ({ ...form, price: Number(event.target.value) }))} className={fieldClass} /></Field>
                <Field label="Duration"><input type="number" min={1} value={routeForm.duration_minutes ?? ''} onChange={(event) => setRouteForm((form) => ({ ...form, duration_minutes: event.target.value ? Number(event.target.value) : null }))} className={fieldClass} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Base fee"><input required type="number" min={0} value={routeForm.base_fee} onChange={(event) => setRouteForm((form) => ({ ...form, base_fee: Number(event.target.value) }))} className={fieldClass} /></Field>
                <Field label="Price / km"><input required type="number" min={0} value={routeForm.price_per_km} onChange={(event) => setRouteForm((form) => ({ ...form, price_per_km: Number(event.target.value) }))} className={fieldClass} /></Field>
              </div>
              <Field label="Override price">
                <input type="number" min={0} value={routeForm.price_override ?? ''} onChange={(event) => setRouteForm((form) => ({ ...form, price_override: event.target.value ? Number(event.target.value) : null }))} className={fieldClass} />
              </Field>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={routeForm.is_active} onChange={(event) => setRouteForm((form) => ({ ...form, is_active: event.target.checked }))} />
                Active
              </label>
              <div className="flex gap-2">
                <button type="submit" disabled={routeMutation.isPending} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {editingRouteId ? 'Save route' : 'Create route'}
                </button>
                {editingRouteId && <button type="button" onClick={() => { setEditingRouteId(null); setRouteForm(routeBlank); }} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold">Cancel</button>}
              </div>
            </div>
          </form>

          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-3">Route</th><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Distance</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {routeRows.map((route) => (
                  <tr key={route.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-950">{route.airport_code} · {route.direction === 'airport_to_hotel' ? 'Airport to hotel' : 'Hotel to airport'}</div>
                      <div className="text-xs text-slate-500">{route.hotel?.name}</div>
                    </td>
                    <td className="px-4 py-3">{route.vehicle_type?.name ?? '-'}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-950">{route.distance_km ? `${route.distance_km} km` : '-'}</div>
                      <div className="text-xs text-slate-500">{route.duration_minutes ? `${route.duration_minutes} min` : 'No map data'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-950">{formatCurrency(route.price)}</div>
                      <div className="text-xs text-slate-500">{route.pricing_source}</div>
                    </td>
                    <td className="px-4 py-3">{route.is_active ? 'Active' : 'Inactive'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => refreshDistance.mutate(route.id)} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-semibold" disabled={refreshDistance.isPending}>
                          <RefreshCw className="size-3" /> Refresh km
                        </button>
                        <button type="button" onClick={() => editRoute(route)} className="rounded-md border px-3 py-1.5 text-xs font-semibold">Edit</button>
                        <button type="button" onClick={() => deleteRoute.mutate(route.id)} className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'bookings' && (
        <section>
          <div className="mb-3 flex flex-wrap gap-2">
            <input aria-label="Search transfer bookings" value={bookingFilters.search} onChange={(event) => setBookingFilters((filters) => ({ ...filters, search: event.target.value }))} placeholder="Search code, contact, phone" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm md:max-w-sm" />
            <select aria-label="Filter transfer booking status" value={bookingFilters.status} onChange={(event) => setBookingFilters((filters) => ({ ...filters, status: event.target.value }))} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">All status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Route</th><th className="px-4 py-3">Pickup</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Update</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookingRows.map((booking) => (
                  <BookingRow key={booking.id} booking={booking} onStatus={(status) => statusMutation.mutate({ id: booking.id, status })} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

const fieldClass = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof CarFront; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-md bg-slate-100 text-slate-700"><Icon className="size-5" /></span>
        <div>
          <div className="text-2xl font-bold text-slate-950">{value}</div>
          <div className="text-sm text-slate-500">{label}</div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof CarFront; label: string }) {
  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-semibold ${active ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-950'}`}>
      <Icon className="size-4" />
      {label}
    </button>
  );
}

function BookingRow({ booking, onStatus }: { booking: TransferBooking; onStatus: (status: TransferStatus) => void }) {
  return (
    <tr>
      <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-950">{booking.booking_code}</td>
      <td className="px-4 py-3">
        <div className="font-medium text-slate-950">{booking.contact_name}</div>
        <div className="text-xs text-slate-500">{booking.contact_phone}</div>
      </td>
      <td className="px-4 py-3">
        <div className="font-medium text-slate-950">{booking.airport_code} · {booking.hotel?.name ?? '-'}</div>
        <div className="text-xs text-slate-500">{booking.vehicle_type?.name ?? '-'} · {booking.passengers} pax</div>
      </td>
      <td className="px-4 py-3">{formatDate(booking.pickup_datetime)}</td>
      <td className="px-4 py-3 font-semibold">{formatCurrency(booking.total_price)}</td>
      <td className="px-4 py-3"><StatusBadge value={booking.status} /></td>
      <td className="px-4 py-3">
        <select aria-label="Update transfer booking status" value={booking.status} onChange={(event) => onStatus(event.target.value as TransferStatus)} className="rounded-md border border-slate-300 px-2 py-1 text-xs">
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </td>
    </tr>
  );
}
