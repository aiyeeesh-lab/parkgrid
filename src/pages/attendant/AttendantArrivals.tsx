import { useState } from 'react';
import { useStore } from '@/store/StoreContext';
import { AttendantLayout } from '@/layouts/AttendantLayout';
import { Button } from '@/components/ui';
import { QRCodeCard } from '@/components/QRCodeCard';
import { formatTime, formatDate } from '@/lib/status';
import { Search, CheckCircle2, Car, MapPin, Clock, X, QrCode } from 'lucide-react';

export function AttendantArrivals() {
  const {
    currentUser, getFacilityById, getReservationsByFacility, getUserById,
    getVehicleById, getBayById, checkInCustomer,
  } = useStore();
  const facilityId = currentUser?.facilityId;
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checkInResult, setCheckInResult] = useState<'success' | 'error' | null>(null);

  if (!facilityId) return null;
  const facility = getFacilityById(facilityId);
  const reservations = getReservationsByFacility(facilityId);

  const now = Date.now();
  const arrivals = reservations
    .filter((r) => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN')
    .filter((r) => {
      if (!query) return true;
      const customer = getUserById(r.customerId);
      const vehicle = getVehicleById(r.vehicleId);
      return (
        r.bookingNumber.toLowerCase().includes(query.toLowerCase()) ||
        customer?.name.toLowerCase().includes(query.toLowerCase()) ||
        vehicle?.licensePlate.toLowerCase().includes(query.toLowerCase())
      );
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const selected = selectedId ? reservations.find((r) => r.id === selectedId) : null;

  const handleCheckIn = () => {
    if (!selectedId) return;
    const success = checkInCustomer(selectedId);
    setCheckInResult(success ? 'success' : 'error');
    setTimeout(() => {
      setSelectedId(null);
      setCheckInResult(null);
    }, 2000);
  };

  return (
    <AttendantLayout title="Arrivals">
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search booking number, name, or plate..."
            className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3.5 pl-12 pr-4 text-base text-white placeholder:text-gray-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Arrivals list */}
      <div className="space-y-2">
        {arrivals.length === 0 ? (
          <div className="rounded-xl border border-gray-800 bg-gray-900 py-12 text-center">
            <p className="text-sm text-gray-500">No arrivals found</p>
          </div>
        ) : (
          arrivals.map((r) => {
            const customer = getUserById(r.customerId);
            const vehicle = getVehicleById(r.vehicleId);
            const bay = getBayById(r.bayId);
            const isCheckedIn = r.status === 'CHECKED_IN';

            return (
              <div
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  isCheckedIn
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">{formatTime(r.startTime)}</p>
                      <p className="font-mono text-xs text-gray-500">{r.bookingNumber}</p>
                    </div>
                    <div className="h-10 w-px bg-gray-800" />
                    <div>
                      <p className="font-medium text-white">{customer?.name}</p>
                      <p className="text-sm text-gray-400">
                        {vehicle?.make} {vehicle?.model} · <span className="font-mono">{vehicle?.licensePlate}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      {isCheckedIn ? (
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" /> Checked In
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-blue-400">Bay {bay?.bayNumber}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Verification modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedId(null)}>
          <div
            className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {checkInResult === 'success' ? (
              <div className="text-center py-8">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Customer Checked In</h3>
                <p className="mt-1 text-sm text-gray-400">Bay {getBayById(selected.bayId)?.bayNumber} is now ACTIVE</p>
              </div>
            ) : checkInResult === 'error' ? (
              <div className="text-center py-8">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20">
                  <X className="h-8 w-8 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Check-in Failed</h3>
                <p className="mt-1 text-sm text-gray-400">Bay may not be in the correct state.</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Verify Booking</h3>
                  <button onClick={() => setSelectedId(null)} className="text-gray-500 hover:text-gray-300">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* QR */}
                <div className="mb-4 flex justify-center rounded-xl bg-white p-3">
                  <QRCodeCard value={selected.bookingNumber} size={120} />
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <DetailRow icon={MapPin} label="Facility" value={facility?.name || ''} />
                  <DetailRow icon={MapPin} label="Bay" value={getBayById(selected.bayId)?.bayNumber || ''} />
                  <DetailRow icon={Car} label="Vehicle" value={`${getVehicleById(selected.vehicleId)?.make} ${getVehicleById(selected.vehicleId)?.model}`} />
                  <DetailRow icon={Car} label="Plate" value={getVehicleById(selected.vehicleId)?.licensePlate || ''} mono />
                  <DetailRow icon={Clock} label="Time" value={`${formatTime(selected.startTime)} — ${formatTime(selected.endTime)}`} />
                  <DetailRow icon={Clock} label="Date" value={formatDate(selected.startTime)} />
                </div>

                {/* Actions */}
                {selected.status === 'CHECKED_IN' ? (
                  <div className="mt-5 rounded-lg bg-emerald-500/10 px-4 py-3 text-center">
                    <p className="text-sm font-medium text-emerald-400">Already checked in</p>
                  </div>
                ) : (
                  <div className="mt-5 flex gap-3">
                    <Button variant="secondary" fullWidth onClick={() => setSelectedId(null)}>
                      Cancel
                    </Button>
                    <Button variant="success" fullWidth onClick={handleCheckIn}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Check In
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </AttendantLayout>
  );
}

function DetailRow({ icon: Icon, label, value, mono }: { icon: typeof MapPin; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-gray-400">
        <Icon className="h-4 w-4 text-gray-500" />
        {label}
      </span>
      <span className={`text-sm font-medium text-white ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
