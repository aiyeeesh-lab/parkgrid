import type { ParkingBay } from '@/types';
import { bayStatusConfig } from '@/lib/status';
import { useStore } from '@/store/StoreContext';

interface ParkingBayCellProps {
  bay: ParkingBay;
  onClick?: (bay: ParkingBay) => void;
  compact?: boolean;
}

export function ParkingBayCell({ bay, onClick, compact = false }: ParkingBayCellProps) {
  const cfg = bayStatusConfig[bay.status];
  const { getReservationById, getUserById, getVehicleById } = useStore();

  let detail = '';
  if (bay.status === 'ACTIVE' || bay.status === 'RESERVED') {
    const reservation = useStoreReservationByBay(bay.id);
    if (reservation) {
      const vehicle = getVehicleById(reservation.vehicleId);
      if (vehicle) detail = vehicle.licensePlate;
    }
  }

  if (compact) {
    return (
      <div
        onClick={onClick ? () => onClick(bay) : undefined}
        className={`relative rounded-lg border ${cfg.border} ${cfg.bg} px-2 py-1.5 text-center ${onClick ? 'cursor-pointer hover:shadow-md' : ''} transition-shadow`}
      >
        <p className={`text-xs font-bold ${cfg.text}`}>{bay.bayNumber}</p>
        <div className={`mx-auto mt-0.5 h-1 w-1 rounded-full ${cfg.dot}`} />
      </div>
    );
  }

  return (
    <div
      onClick={onClick ? () => onClick(bay) : undefined}
      className={`relative rounded-lg border ${cfg.border} ${cfg.bg} px-3 py-2.5 ${onClick ? 'cursor-pointer hover:shadow-md' : ''} transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-sm font-bold ${cfg.text}`}>{bay.bayNumber}</span>
        <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className={`text-xs font-medium ${cfg.text} opacity-80`}>{cfg.label}</span>
        {detail && <span className="text-xs text-gray-500 font-mono">{detail}</span>}
      </div>
    </div>
  );
}

// Helper hook to find reservation by bay
function useStoreReservationByBay(bayId: string) {
  const { reservations } = useStore();
  return reservations.find(
    (r) => r.bayId === bayId && (r.status === 'CHECKED_IN' || r.status === 'CONFIRMED')
  );
}
