import { useState } from 'react';
import { useStore } from '@/store/StoreContext';
import { AttendantLayout } from '@/layouts/AttendantLayout';
import { ParkingGrid } from '@/components/ParkingGrid';
import { Button } from '@/components/ui';
import { bayStatusConfig, formatTime, getTimeRemaining } from '@/lib/status';
import { X, Wrench, Ban, RotateCcw } from 'lucide-react';
import type { ParkingBay } from '@/types';

export function AttendantParking() {
  const { currentUser, bays, setBayStatus, getReservationById, getUserById, getVehicleById } = useStore();
  const [selected, setSelected] = useState<ParkingBay | null>(null);
  const facilityId = currentUser?.facilityId;

  if (!facilityId) return null;
  const facBays = bays.filter((b) => b.facilityId === facilityId);

  const handleSetMaintenance = () => {
    if (selected) setBayStatus(selected.id, 'MAINTENANCE');
    setSelected(null);
  };
  const handleSetAvailable = () => {
    if (selected) setBayStatus(selected.id, 'AVAILABLE');
    setSelected(null);
  };

  const reservation = selected
    ? getReservationById(
      // Find reservation for this bay
      useStore().reservations.find(
        (r) => r.bayId === selected.id && (r.status === 'CHECKED_IN' || r.status === 'CONFIRMED')
      )?.id || ''
      )
    : null;
  const customer = reservation ? getUserById(reservation.customerId) : null;
  const vehicle = reservation ? getVehicleById(reservation.vehicleId) : null;

  return (
    <AttendantLayout title="Parking Grid">
      <ParkingGrid bays={facBays} onBayClick={(b) => setSelected(b)} />

      {/* Bay detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-gray-700 bg-gray-900 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Bay {selected.bayNumber}</h3>
                <p className="text-sm text-gray-500">Level {selected.level} · Zone {selected.zone}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-300">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Status */}
            <div className={`mb-4 rounded-lg px-4 py-3 ${bayStatusConfig[selected.status].bg.replace('50', '500/10')}`}>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${bayStatusConfig[selected.status].dot}`} />
                <span className={`font-medium ${bayStatusConfig[selected.status].text.replace('700', '300')}`}>
                  {bayStatusConfig[selected.status].label}
                </span>
              </div>
            </div>

            {/* Reservation info if active/reserved */}
            {reservation && customer && vehicle && (
              <div className="mb-4 space-y-2 rounded-lg border border-gray-800 p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Customer</span>
                  <span className="text-white">{customer.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Vehicle</span>
                  <span className="text-white">{vehicle.make} {vehicle.model}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Plate</span>
                  <span className="font-mono text-white">{vehicle.licensePlate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Booking</span>
                  <span className="font-mono text-white">{reservation.bookingNumber}</span>
                </div>
                {reservation.status === 'CHECKED_IN' && (
                  <div className="flex justify-between text-sm border-t border-gray-800 pt-2">
                    <span className="text-gray-500">Remaining</span>
                    <span className="text-emerald-400 font-medium">
                      {getTimeRemaining(reservation.endTime).totalMinutes > 0
                        ? `${getTimeRemaining(reservation.endTime).hours}h ${getTimeRemaining(reservation.endTime).minutes}m`
                        : 'Overstay'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              {selected.status === 'AVAILABLE' && (
                <Button variant="secondary" fullWidth onClick={handleSetMaintenance}>
                  <Wrench className="mr-2 h-4 w-4" />
                  Mark Maintenance
                </Button>
              )}
              {selected.status === 'MAINTENANCE' && (
                <Button variant="success" fullWidth onClick={handleSetAvailable}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Return to Available
                </Button>
              )}
              {selected.status === 'ACTIVE' && (
                <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
                  This bay has an active session. Use Sessions to check out the customer.
                </p>
              )}
              {selected.status === 'RESERVED' && (
                <p className="rounded-lg bg-blue-500/10 px-3 py-2 text-sm text-blue-400">
                  Reserved for upcoming arrival. Use Arrivals to check in the customer.
                </p>
              )}
              {selected.status === 'TURNOVER' && (
                <p className="rounded-lg bg-orange-500/10 px-3 py-2 text-sm text-orange-400">
                  In turnover. Will become available shortly.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </AttendantLayout>
  );
}
