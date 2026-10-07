import { useState } from 'react';
import { useStore } from '@/store/StoreContext';
import { OwnerLayout } from '@/layouts/OwnerLayout';
import { BookingCard } from '@/components/BookingCard';
import { EmptyState } from '@/components/ui';
import { reservationStatusConfig, formatNaira } from '@/lib/status';
import { Calendar } from 'lucide-react';

export function OwnerBookings() {
  const { currentUser, facilities, getReservationsByFacility } = useStore();
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'active' | 'completed'>('all');

  const ownedFacilities = facilities.filter((f) => currentUser?.ownedFacilities?.includes(f.id));
  const allReservations = ownedFacilities
    .flatMap((f) => getReservationsByFacility(f.id))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filtered = allReservations.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'confirmed') return r.status === 'CONFIRMED';
    if (filter === 'active') return r.status === 'CHECKED_IN';
    if (filter === 'completed') return r.status === 'COMPLETED';
    return true;
  });

  return (
    <OwnerLayout title="Bookings">
      {/* Summary */}
      <div className="mb-5 grid grid-cols-4 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-2xl font-bold text-gray-900">{allReservations.length}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-2xl font-bold text-blue-600">{allReservations.filter((r) => r.status === 'CONFIRMED').length}</p>
          <p className="text-xs text-gray-500">Confirmed</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-2xl font-bold text-emerald-600">{allReservations.filter((r) => r.status === 'CHECKED_IN').length}</p>
          <p className="text-xs text-gray-500">Active</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-2xl font-bold text-gray-500">{allReservations.filter((r) => r.status === 'COMPLETED').length}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'confirmed', label: 'Confirmed' },
          { key: 'active', label: 'Active' },
          { key: 'completed', label: 'Completed' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key as 'all' | 'confirmed' | 'active' | 'completed')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              filter === t.key ? 'bg-teal-50 text-teal-700' : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Calendar className="h-12 w-12" />} title="No bookings" description="Bookings will appear here." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <BookingCard key={r.id} reservation={r} />
          ))}
        </div>
      )}
    </OwnerLayout>
  );
}
