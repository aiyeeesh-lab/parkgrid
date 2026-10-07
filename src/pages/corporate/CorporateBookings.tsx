import { useState } from 'react';
import { useStore } from '@/store/StoreContext';
import { CorporateLayout } from '@/layouts/CorporateLayout';
import { Card, Button, EmptyState, SectionHeader } from '@/components/ui';
import { BookingCard } from '@/components/BookingCard';
import { formatNaira } from '@/lib/status';
import { Plus, X, Car, Calendar, Clock } from 'lucide-react';

export function CorporateBookings() {
  const { users, facilities, reservations, createReservation, bays, currentUser } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [employeeId, setEmployeeId] = useState<string>('');
  const [facilityId, setFacilityId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState(2);
  const [result, setResult] = useState<string | null>(null);

  const employees = users.filter((u) => u.role === 'customer');
  const allBookings = reservations.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleCreate = () => {
    const vehicle = useStore().vehicles.find((v) => v.userId === employeeId);
    if (!vehicle || !facilityId) return;
    const bay = bays.find((b) => b.facilityId === facilityId && b.status === 'AVAILABLE');
    if (!bay) return;
    const facility = facilities.find((f) => f.id === facilityId);
    if (!facility) return;

    const startISO = new Date(`${date}T${startTime}:00`).toISOString();
    const endISO = new Date(new Date(startISO).getTime() + duration * 3600000).toISOString();
    const amount = facility.pricePerHour * duration;

    const res = createReservation({
      customerId: employeeId,
      vehicleId: vehicle.id,
      facilityId,
      bayId: bay.id,
      startTime: startISO,
      endTime: endISO,
      amount,
    });

    if (res) {
      setResult(res.bookingNumber);
      setShowForm(false);
      setTimeout(() => setResult(null), 3000);
    }
  };

  return (
    <CorporateLayout title="Bookings">
      {result && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-medium text-emerald-800">Booking created: {result}</p>
        </div>
      )}

      <div className="mb-5">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Booking
        </Button>
      </div>

      {allBookings.length === 0 ? (
        <EmptyState icon={<Calendar className="h-12 w-12" />} title="No bookings" description="Create a booking for an employee." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {allBookings.slice(0, 30).map((r) => (
            <BookingCard key={r.id} reservation={r} />
          ))}
        </div>
      )}

      {/* Create booking modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">New Corporate Booking</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Employee</label>
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
                >
                  <option value="">Select employee...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Facility</label>
                <select
                  value={facilityId}
                  onChange={(e) => setFacilityId(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
                >
                  <option value="">Select facility...</option>
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Arrival Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Duration</label>
                <div className="mt-1.5 grid grid-cols-4 gap-2">
                  {[1, 2, 4, 8].map((h) => (
                    <button
                      key={h}
                      onClick={() => setDuration(h)}
                      className={`rounded-lg border py-2 text-sm font-medium ${duration === h ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'}`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>

              {facilityId && (
                <div className="rounded-lg bg-gray-50 p-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Rate</span><span className="font-medium">{formatNaira(facilities.find((f) => f.id === facilityId)?.pricePerHour || 0)}/hr</span></div>
                  <div className="flex justify-between mt-1"><span className="text-gray-500">Total</span><span className="font-bold text-gray-900">{formatNaira((facilities.find((f) => f.id === facilityId)?.pricePerHour || 0) * duration)}</span></div>
                </div>
              )}
            </div>

            <div className="mt-5 flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setShowForm(false)}>Cancel</Button>
              <Button fullWidth onClick={handleCreate} disabled={!employeeId || !facilityId}>Create Booking</Button>
            </div>
          </div>
        </div>
      )}
    </CorporateLayout>
  );
}
