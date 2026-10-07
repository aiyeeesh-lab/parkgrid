import { useState } from 'react';
import { useStore } from '@/store/StoreContext';
import { OwnerLayout } from '@/layouts/OwnerLayout';
import { ParkingGrid } from '@/components/ParkingGrid';
import { Card, Button, EmptyState } from '@/components/ui';
import { bayStatusConfig, formatTime, getTimeRemaining } from '@/lib/status';
import { X, Wrench, RotateCcw } from 'lucide-react';
import type { ParkingBay } from '@/types';

export function OwnerSpaces() {
  const { currentUser, facilities, bays, setBayStatus, getReservationById, getUserById, getVehicleById } = useStore();
  const [selected, setSelected] = useState<ParkingBay | null>(null);
  const [facilityFilter, setFacilityFilter] = useState<string | null>(null);

  const ownedFacilities = facilities.filter((f) => currentUser?.ownedFacilities?.includes(f.id));
  const activeFacilityId = facilityFilter || ownedFacilities[0]?.id;
  const facBays = bays.filter((b) => b.facilityId === activeFacilityId);

  return (
    <OwnerLayout title="Space Management">
      {/* Facility selector */}
      {ownedFacilities.length > 1 && (
        <div className="mb-5 flex gap-2 overflow-x-auto">
          {ownedFacilities.map((f) => (
            <button
              key={f.id}
              onClick={() => setFacilityFilter(f.id)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ${
                activeFacilityId === f.id ? 'bg-teal-50 text-teal-700' : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}

      <ParkingGrid bays={facBays} onBayClick={(b) => setSelected(b)} />

      {/* Bay detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Bay {selected.bayNumber}</h3>
                <p className="text-sm text-gray-500">Level {selected.level} · Zone {selected.zone}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className={`mb-4 rounded-lg px-4 py-3 ${bayStatusConfig[selected.status].bg}`}>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${bayStatusConfig[selected.status].dot}`} />
                <span className={`font-medium ${bayStatusConfig[selected.status].text}`}>{bayStatusConfig[selected.status].label}</span>
              </div>
            </div>

            {/* Current reservation info */}
            {selected.status === 'ACTIVE' || selected.status === 'RESERVED' ? (() => {
              const reservation = useStore().reservations.find(
                (r) => r.bayId === selected.id && (r.status === 'CHECKED_IN' || r.status === 'CONFIRMED')
              );
              if (!reservation) return null;
              const customer = getUserById(reservation.customerId);
              const vehicle = getVehicleById(reservation.vehicleId);
              return (
                <div className="mb-4 space-y-2 rounded-lg border border-gray-100 p-3">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Customer</span><span className="text-gray-900">{customer?.name}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Vehicle</span><span className="text-gray-900">{vehicle?.make} {vehicle?.model}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Plate</span><span className="font-mono text-gray-900">{vehicle?.licensePlate}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Ends</span><span className="text-gray-900">{formatTime(reservation.endTime)}</span></div>
                </div>
              );
            })() : null}

            <div className="space-y-2">
              {selected.status === 'AVAILABLE' && (
                <Button variant="secondary" fullWidth onClick={() => { setBayStatus(selected.id, 'MAINTENANCE'); setSelected(null); }}>
                  <Wrench className="mr-2 h-4 w-4" /> Mark Maintenance
                </Button>
              )}
              {selected.status === 'MAINTENANCE' && (
                <Button variant="success" fullWidth onClick={() => { setBayStatus(selected.id, 'AVAILABLE'); setSelected(null); }}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Return to Available
                </Button>
              )}
              {(selected.status === 'ACTIVE' || selected.status === 'RESERVED' || selected.status === 'TURNOVER') && (
                <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
                  {selected.status === 'ACTIVE' && 'Active session in progress. Bay status cannot be changed.'}
                  {selected.status === 'RESERVED' && 'Bay is reserved. Bay status cannot be changed.'}
                  {selected.status === 'TURNOVER' && 'Bay is in turnover. Will become available shortly.'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
