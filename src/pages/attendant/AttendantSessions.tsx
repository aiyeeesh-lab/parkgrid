import { useState } from 'react';
import { useStore } from '@/store/StoreContext';
import { AttendantLayout } from '@/layouts/AttendantLayout';
import { Button } from '@/components/ui';
import { formatTime, formatDuration, getTimeRemaining } from '@/lib/status';
import { CheckCircle2, Clock, AlertTriangle, X, Car } from 'lucide-react';
import type { Reservation } from '@/types';

export function AttendantSessions() {
  const {
    currentUser, getReservationsByFacility, getFacilityById, getBayById,
    getVehicleById, getUserById, getActiveSessionByReservation, checkOutCustomer,
  } = useStore();
  const facilityId = currentUser?.facilityId;
  const [filter, setFilter] = useState<'active' | 'overstay' | 'all'>('active');
  const [checkoutTarget, setCheckoutTarget] = useState<Reservation | null>(null);
  const [checkoutResult, setCheckoutResult] = useState<'success' | 'error' | null>(null);

  if (!facilityId) return null;
  const facility = getFacilityById(facilityId);
  const reservations = getReservationsByFacility(facilityId);
  const now = Date.now();

  const checkedIn = reservations.filter((r) => r.status === 'CHECKED_IN');
  const overstays = checkedIn.filter((r) => new Date(r.endTime).getTime() < now);
  const activeOnly = checkedIn.filter((r) => new Date(r.endTime).getTime() >= now);

  const current = filter === 'active' ? activeOnly : filter === 'overstay' ? overstays : checkedIn;

  const handleCheckout = () => {
    if (!checkoutTarget) return;
    const success = checkOutCustomer(checkoutTarget.id);
    setCheckoutResult(success ? 'success' : 'error');
    setTimeout(() => { setCheckoutTarget(null); setCheckoutResult(null); }, 2000);
  };

  return (
    <AttendantLayout title="Sessions">
      {/* Filter tabs */}
      <div className="mb-5 flex gap-2">
        {[
          { key: 'active', label: 'Active', count: activeOnly.length },
          { key: 'overstay', label: 'Overstays', count: overstays.length },
          { key: 'all', label: 'All', count: checkedIn.length },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key as 'active' | 'overstay' | 'all')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === t.key ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Sessions list */}
      {current.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 py-12 text-center">
          <Clock className="mx-auto h-8 w-8 text-gray-700" />
          <p className="mt-2 text-sm text-gray-500">No {filter === 'overstay' ? 'overstays' : 'active sessions'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {current.map((r) => {
            const bay = getBayById(r.bayId);
            const vehicle = getVehicleById(r.vehicleId);
            const customer = getUserById(r.customerId);
            const session = getActiveSessionByReservation(r.id);
            const remaining = getTimeRemaining(r.endTime);
            const isOverstay = remaining.isPast;

            return (
              <div
                key={r.id}
                className={`rounded-xl border p-4 ${
                  isOverstay ? 'border-red-500/30 bg-red-500/5' : 'border-gray-800 bg-gray-900'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="font-mono text-sm font-bold text-white">{bay?.bayNumber}</p>
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
                      <p className={`text-sm font-bold ${isOverstay ? 'text-red-400' : remaining.totalMinutes < 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {isOverstay ? 'OVERSTAY' : `${remaining.hours}h ${remaining.minutes}m`}
                      </p>
                      <p className="text-xs text-gray-500">Ends {formatTime(r.endTime)}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={isOverstay ? 'danger' : 'success'}
                      onClick={() => setCheckoutTarget(r)}
                    >
                      Check Out
                    </Button>
                  </div>
                </div>
                {isOverstay && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                    <p className="text-xs text-red-400">
                      Overdue by {formatDuration(Math.abs(remaining.totalMinutes))}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Checkout modal */}
      {checkoutTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setCheckoutTarget(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-gray-700 bg-gray-900 p-6" onClick={(e) => e.stopPropagation()}>
            {checkoutResult === 'success' ? (
              <div className="text-center py-8">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Checked Out</h3>
                <p className="mt-1 text-sm text-gray-400">Bay {getBayById(checkoutTarget.bayId)?.bayNumber} → TURNOVER</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Check Out Customer</h3>
                  <button onClick={() => setCheckoutTarget(null)} className="text-gray-500 hover:text-gray-300">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <Row label="Customer" value={getUserById(checkoutTarget.customerId)?.name || ''} />
                  <Row label="Bay" value={getBayById(checkoutTarget.bayId)?.bayNumber || ''} />
                  <Row label="Vehicle" value={`${getVehicleById(checkoutTarget.vehicleId)?.make} ${getVehicleById(checkoutTarget.vehicleId)?.model}`} />
                  <Row label="Plate" value={getVehicleById(checkoutTarget.vehicleId)?.licensePlate || ''} mono />
                  <Row label="Checked In" value={formatTime(getActiveSessionByReservation(checkoutTarget.id)?.checkInAt || '')} />
                  <Row label="Scheduled End" value={formatTime(checkoutTarget.endTime)} />
                </div>
                <div className="mt-5 flex gap-3">
                  <Button variant="secondary" fullWidth onClick={() => setCheckoutTarget(null)}>Cancel</Button>
                  <Button variant="success" fullWidth onClick={handleCheckout}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirm Check Out
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AttendantLayout>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm font-medium text-white ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
