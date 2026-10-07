import { useState } from 'react';
import { useStore } from '@/store/StoreContext';
import { AttendantLayout } from '@/layouts/AttendantLayout';
import { Button } from '@/components/ui';
import { formatTime, formatNaira } from '@/lib/status';
import { useNavigate } from 'react-router-dom';
import { Users, Car, AlertTriangle, ShieldAlert, CheckCircle2, Clock, QrCode, ChevronRight } from 'lucide-react';

export function AttendantDashboard() {
  const {
    currentUser, getFacilityById, getFacilityOccupancy, getReservationsByFacility,
    getIncidentsByFacility, getUserById, getVehicleById, getBayById, checkInCustomer,
  } = useStore();
  const navigate = useNavigate();
  const facilityId = currentUser?.facilityId;
  const [showVerify, setShowVerify] = useState<string | null>(null);

  if (!facilityId) return null;
  const facility = getFacilityById(facilityId);
  const occ = getFacilityOccupancy(facilityId);
  const reservations = getReservationsByFacility(facilityId);

  // Upcoming arrivals (confirmed, starting within next 3 hours or already started)
  const now = Date.now();
  const upcoming = reservations
    .filter((r) => r.status === 'CONFIRMED' && new Date(r.startTime).getTime() < now + 3 * 3600000)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 8);

  const checkedIn = reservations.filter((r) => r.status === 'CHECKED_IN');
  const completed = reservations.filter((r) => r.status === 'COMPLETED');
  const incidents = getIncidentsByFacility(facilityId);
  const openIncidents = incidents.filter((i) => i.status !== 'resolved');
  const overstays = checkedIn.filter((r) => new Date(r.endTime).getTime() < now);

  const handleQuickCheckIn = (reservationId: string) => {
    checkInCustomer(reservationId);
    setShowVerify(null);
  };

  return (
    <AttendantLayout title={facility?.name}>
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-6">
        <StatCard label="Total Spaces" value={occ.total} icon={<Car className="h-5 w-5" />} />
        <StatCard label="Occupied" value={occ.occupied} icon={<Users className="h-5 w-5" />} color="text-amber-400" />
        <StatCard label="Available" value={occ.available} icon={<CheckCircle2 className="h-5 w-5" />} color="text-emerald-400" />
        <StatCard label="Overstays" value={overstays.length} icon={<AlertTriangle className="h-5 w-5" />} color="text-red-400" />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Bookings" value={reservations.length} small />
        <StatCard label="Checked In" value={checkedIn.length} small color="text-emerald-400" />
        <StatCard label="Expected" value={upcoming.length} small color="text-blue-400" />
      </div>

      {/* Alerts */}
      {(overstays.length > 0 || openIncidents.length > 0) && (
        <div className="mb-6 space-y-2">
          {overstays.length > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-300">{overstays.length} Overstay{overstays.length > 1 ? 's' : ''}</p>
                <p className="text-xs text-gray-400">Vehicles past their scheduled end time</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => navigate('/attendant/sessions')}>View</Button>
            </div>
          )}
          {openIncidents.length > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-300">{openIncidents.length} Open Incident{openIncidents.length > 1 ? 's' : ''}</p>
                <p className="text-xs text-gray-400">Requires attention</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => navigate('/attendant/incidents')}>View</Button>
            </div>
          )}
        </div>
      )}

      {/* Upcoming arrivals */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Upcoming Arrivals</h2>
          <button onClick={() => navigate('/attendant/arrivals')} className="text-sm text-emerald-400 hover:underline">
            View all
          </button>
        </div>

        <div className="space-y-2">
          {upcoming.length === 0 ? (
            <div className="rounded-xl border border-gray-800 bg-gray-900 py-8 text-center">
              <p className="text-sm text-gray-500">No upcoming arrivals</p>
            </div>
          ) : (
            upcoming.map((r) => {
              const customer = getUserById(r.customerId);
              const vehicle = getVehicleById(r.vehicleId);
              const bay = getBayById(r.bayId);
              const isVerifying = showVerify === r.id;

              return (
                <div key={r.id} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm font-bold text-white">{formatTime(r.startTime)}</p>
                        <p className="text-xs text-gray-500">{r.bookingNumber}</p>
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
                        <p className="text-sm font-medium text-emerald-400">Bay {bay?.bayNumber}</p>
                      </div>
                      {isVerifying ? (
                        <Button size="sm" variant="success" onClick={() => handleQuickCheckIn(r.id)}>
                          <CheckCircle2 className="mr-1 h-4 w-4" /> Confirm
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => setShowVerify(r.id)}>
                          Verify
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/attendant/parking')}
          className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4 text-left hover:border-gray-700"
        >
          <QrCode className="h-6 w-6 text-emerald-400" />
          <div>
            <p className="font-medium text-white">Scan / Verify</p>
            <p className="text-xs text-gray-500">Check in customers</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/attendant/parking')}
          className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4 text-left hover:border-gray-700"
        >
          <Clock className="h-6 w-6 text-blue-400" />
          <div>
            <p className="font-medium text-white">Active Sessions</p>
            <p className="text-xs text-gray-500">{checkedIn.length} parked now</p>
          </div>
        </button>
      </div>
    </AttendantLayout>
  );
}

function StatCard({ label, value, icon, color = 'text-white', small = false }: {
  label: string; value: number | string; icon?: React.ReactNode; color?: string; small?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className={`font-bold ${small ? 'text-lg' : 'text-2xl'} ${color}`}>{value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        </div>
        {icon && <div className="text-gray-700">{icon}</div>}
      </div>
    </div>
  );
}
