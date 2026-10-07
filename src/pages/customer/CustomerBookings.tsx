import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/StoreContext';
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { BookingCard, SessionCard } from '@/components/BookingCard';
import { EmptyState } from '@/components/ui';
import { Calendar, Car, Clock } from 'lucide-react';

export function CustomerBookings() {
  const { currentUser, getReservationsByCustomer, getActiveSessionByReservation } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'active' | 'upcoming' | 'past'>('active');

  if (!currentUser) return null;

  const allReservations = getReservationsByCustomer(currentUser.id).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const active = allReservations.filter((r) => r.status === 'CHECKED_IN');
  const upcoming = allReservations.filter((r) => r.status === 'CONFIRMED');
  const past = allReservations.filter((r) => r.status === 'COMPLETED' || r.status === 'CANCELLED' || r.status === 'EXPIRED');

  const current = tab === 'active' ? active : tab === 'upcoming' ? upcoming : past;

  return (
    <CustomerLayout title="My Bookings">
      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl bg-gray-100 p-1">
        {[
          { key: 'active', label: 'Active', count: active.length },
          { key: 'upcoming', label: 'Upcoming', count: upcoming.length },
          { key: 'past', label: 'Past', count: past.length },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as 'active' | 'upcoming' | 'past')}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {current.length === 0 ? (
        <EmptyState
          icon={tab === 'active' ? <Clock className="h-12 w-12" /> : tab === 'upcoming' ? <Calendar className="h-12 w-12" /> : <Car className="h-12 w-12" />}
          title={tab === 'active' ? 'No active sessions' : tab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
          description={tab === 'active' ? 'You are not currently parked anywhere.' : 'Reserve a parking spot to see it here.'}
        />
      ) : (
        <div className="space-y-3">
          {tab === 'active' &&
            current.map((r) => (
              <SessionCard key={r.id} reservation={r} onClick={() => navigate(`/customer/session/${r.id}`)} />
            ))}
          {tab !== 'active' &&
            current.map((r) => (
              <BookingCard
                key={r.id}
                reservation={r}
                onClick={() => {
                  if (r.status === 'CONFIRMED') navigate(`/customer/booking/${r.id}`);
                  else navigate(`/customer/booking/${r.id}`);
                }}
              />
            ))}
        </div>
      )}
    </CustomerLayout>
  );
}
