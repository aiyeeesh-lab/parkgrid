import type { Reservation, SessionStatus } from '@/types';
import { useStore } from '@/store/StoreContext';
import { StatusBadge } from './ui';
import {
  reservationStatusConfig,
  sessionStatusConfig,
  formatTime,
  formatDate,
  formatNaira,
  formatDuration,
} from '@/lib/status';
import { Clock, MapPin, Car, Hash } from 'lucide-react';

interface BookingCardProps {
  reservation: Reservation;
  onClick?: () => void;
  showVehicle?: boolean;
}

export function BookingCard({ reservation, onClick, showVehicle = true }: BookingCardProps) {
  const { getFacilityById, getBayById, getVehicleById, getActiveSessionByReservation } = useStore();
  const facility = getFacilityById(reservation.facilityId);
  const bay = getBayById(reservation.bayId);
  const vehicle = getVehicleById(reservation.vehicleId);
  const session = getActiveSessionByReservation(reservation.id);

  const cfg = reservationStatusConfig[reservation.status];
  const sessionCfg = session ? sessionStatusConfig[session.status] : null;

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-sm ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-gray-900">{reservation.bookingNumber}</span>
            <StatusBadge label={cfg.label} bg={cfg.bg} text={cfg.text} dot={cfg.dot} />
          </div>
          {sessionCfg && (
            <div className="mt-1">
              <StatusBadge label={sessionCfg.label} bg={sessionCfg.bg} text={sessionCfg.text} dot={sessionCfg.dot} />
            </div>
          )}
        </div>
        <span className="text-sm font-bold text-gray-900">{formatNaira(reservation.amount)}</span>
      </div>

      <div className="mt-3 space-y-1.5 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="h-3.5 w-3.5 text-gray-400" />
          {facility?.name || 'Unknown facility'}
          {bay && <span className="text-gray-400">· Bay {bay.bayNumber}</span>}
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="h-3.5 w-3.5 text-gray-400" />
          {formatDate(reservation.startTime)}, {formatTime(reservation.startTime)} — {formatTime(reservation.endTime)}
        </div>
        {showVehicle && vehicle && (
          <div className="flex items-center gap-2 text-gray-600">
            <Car className="h-3.5 w-3.5 text-gray-400" />
            {vehicle.make} {vehicle.model}
            <span className="font-mono text-xs text-gray-400">{vehicle.licensePlate}</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface SessionCardProps {
  reservation: Reservation;
  onClick?: () => void;
}

export function SessionCard({ reservation, onClick }: SessionCardProps) {
  const { getFacilityById, getBayById, getVehicleById, getActiveSessionByReservation } = useStore();
  const facility = getFacilityById(reservation.facilityId);
  const bay = getBayById(reservation.bayId);
  const vehicle = getVehicleById(reservation.vehicleId);
  const session = getActiveSessionByReservation(reservation.id);

  if (!session) return null;

  const cfg = sessionStatusConfig[session.status];

  const endTime = new Date(reservation.endTime).getTime();
  const remaining = Math.floor((endTime - Date.now()) / 60000);
  const isOver = remaining < 0;
  const absRemain = Math.abs(remaining);

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border-2 bg-white p-5 transition-all ${onClick ? 'cursor-pointer' : ''} ${
        isOver ? 'border-red-200' : remaining < 30 ? 'border-amber-200' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <StatusBadge label={cfg.label} bg={cfg.bg} text={cfg.text} dot={cfg.dot} size="md" />
        <span className="font-mono text-sm text-gray-500">{reservation.bookingNumber}</span>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">{facility?.name}</p>
        <p className="mt-1 text-lg font-semibold text-gray-900">Bay {bay?.bayNumber}</p>
        {vehicle && (
          <p className="mt-1 text-sm text-gray-600">
            {vehicle.make} {vehicle.model} · {vehicle.licensePlate}
          </p>
        )}
      </div>

      <div className={`mt-4 rounded-lg py-3 text-center ${isOver ? 'bg-red-50' : remaining < 30 ? 'bg-amber-50' : 'bg-emerald-50'}`}>
        <p className={`text-xs font-medium uppercase tracking-wide ${isOver ? 'text-red-600' : remaining < 30 ? 'text-amber-700' : 'text-emerald-700'}`}>
          {isOver ? 'Overdue by' : 'Time remaining'}
        </p>
        <p className={`mt-1 text-3xl font-bold ${isOver ? 'text-red-700' : remaining < 30 ? 'text-amber-700' : 'text-emerald-700'}`}>
          {formatDuration(absRemain)}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
        <span>Ends at {formatTime(reservation.endTime)}</span>
        {!isOver && remaining < 30 && (
          <span className="font-medium text-amber-600">Expiring soon</span>
        )}
      </div>
    </div>
  );
}

interface IncidentCardProps {
  incident: Reservation & { type?: string }; // placeholder - actually takes Incident
  onClick?: () => void;
}

// Re-export for incidents
export function IncidentCardBase({ incident, onClick }: { incident: import('@/types').Incident; onClick?: () => void }) {
  const { getFacilityById, getUserById } = useStore();
  const facility = getFacilityById(incident.facilityId);
  const reporter = getUserById(incident.reportedBy);

  // Import inline to avoid circular issues
  const { incidentSeverityConfig, incidentStatusConfig, timeAgo } = require('@/lib/status');
  const sevCfg = incidentSeverityConfig[incident.severity];
  const statCfg = incidentStatusConfig[incident.status];

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-sm ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 capitalize">
              {incident.type.replace(/_/g, ' ')}
            </span>
            <StatusBadge label={sevCfg.label} bg={sevCfg.bg} text={sevCfg.text} dot={sevCfg.dot} />
          </div>
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{incident.description}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Hash className="h-3 w-3" />
          {facility?.name}
          <span>·</span>
          {timeAgo(incident.createdAt)}
        </div>
        <StatusBadge label={statCfg.label} bg={statCfg.bg} text={statCfg.text} dot={statCfg.dot} />
      </div>
    </div>
  );
}
