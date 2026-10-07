import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/StoreContext';
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { Button, Card } from '@/components/ui';
import {
  formatDuration, formatTime, getTimeRemaining, formatNaira,
} from '@/lib/status';
import { MapPin, Clock, Car, Plus, HelpCircle, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

export function ActiveSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getReservationById, getFacilityById, getBayById, getVehicleById,
    getActiveSessionByReservation, extendSession, checkOutCustomer,
  } = useStore();
  const reservation = id ? getReservationById(id) : undefined;
  const [showExtend, setShowExtend] = useState(false);
  const [extendMinutes, setExtendMinutes] = useState(60);
  const [tick, setTick] = useState(0);
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [extendError, setExtendError] = useState(false);

  // Re-render every second for countdown
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!reservation) {
    return (
      <CustomerLayout showBack title="Session">
        <p className="text-sm text-gray-500">Session not found.</p>
      </CustomerLayout>
    );
  }

  const facility = getFacilityById(reservation.facilityId);
  const bay = getBayById(reservation.bayId);
  const vehicle = getVehicleById(reservation.vehicleId);
  const session = getActiveSessionByReservation(reservation.id);

  if (checkoutDone || reservation.status === 'COMPLETED') {
    return (
      <CustomerLayout showBack title="Parking Complete">
        <div className="mt-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Parking Complete</h2>
          <p className="mt-1 text-sm text-gray-500">{facility?.name}</p>

          <Card className="mt-6 p-5 text-left">
            <div className="space-y-3">
              <Row label="Bay" value={bay?.bayNumber || ''} />
              <Row label="Duration" value={formatDuration(Math.round((new Date(reservation.endTime).getTime() - new Date(reservation.startTime).getTime()) / 60000))} />
              <Row label="Vehicle" value={`${vehicle?.make} ${vehicle?.model}`} />
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-sm text-gray-500">Total Paid</span>
                <span className="text-xl font-bold text-gray-900">{formatNaira(reservation.amount)}</span>
              </div>
            </div>
          </Card>

          <Button fullWidth className="mt-6" onClick={() => navigate('/customer/bookings')}>
            View My Bookings
          </Button>
        </div>
      </CustomerLayout>
    );
  }

  if (!session) {
    return (
      <CustomerLayout showBack title="Session">
        <p className="text-sm text-gray-500">No active session found for this booking.</p>
      </CustomerLayout>
    );
  }

  const remaining = getTimeRemaining(reservation.endTime);
  const isOver = remaining.isPast;
  const absMin = Math.abs(remaining.totalMinutes);

  // Warning levels
  const isWarning30 = !isOver && absMin <= 30 && absMin > 15;
  const isWarning15 = !isOver && absMin <= 15 && absMin > 5;
  const isWarning5 = !isOver && absMin <= 5;

  const handleExtend = () => {
    const success = extendSession(reservation.id, extendMinutes);
    if (success) {
      setShowExtend(false);
      setExtendError(false);
    } else {
      setExtendError(true);
    }
  };

  const handleCheckout = () => {
    const success = checkOutCustomer(reservation.id);
    if (success) setCheckoutDone(true);
  };

  const bgClass = isOver ? 'bg-red-50' : isWarning15 || isWarning5 ? 'bg-amber-50' : 'bg-emerald-50';
  const textClass = isOver ? 'text-red-700' : isWarning15 || isWarning5 ? 'text-amber-700' : 'text-emerald-700';

  return (
    <CustomerLayout showBack title="Active Session">
      {/* Status header */}
      <div className="mb-5 text-center">
        <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ${bgClass} ${textClass}`}>
          <span className={`h-2 w-2 rounded-full ${isOver ? 'bg-red-500' : isWarning15 || isWarning5 ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
          {isOver ? 'OVERSTAY' : 'PARKED'}
        </div>
        <h1 className="mt-3 text-xl font-bold text-gray-900">{facility?.name}</h1>
        <p className="text-sm text-gray-500">Bay {bay?.bayNumber}</p>
      </div>

      {/* Countdown */}
      <Card className={`mb-4 border-2 ${isOver ? 'border-red-200' : isWarning15 || isWarning5 ? 'border-amber-200' : 'border-emerald-200'} p-6`}>
        <div className={`rounded-xl ${bgClass} py-4 text-center`}>
          <p className={`text-xs font-medium uppercase tracking-wide ${textClass}`}>
            {isOver ? 'Overdue by' : 'Time Remaining'}
          </p>
          <p className={`mt-2 text-4xl font-bold tabular-nums ${textClass}`}>
            {String(Math.floor(absMin / 60)).padStart(2, '0')}:{String(absMin % 60).padStart(2, '0')}
          </p>
          <p className={`mt-1 text-sm ${textClass} opacity-80`}>
            {isOver ? 'Past scheduled end' : `Ends at ${formatTime(reservation.endTime)}`}
          </p>
        </div>

        {/* Warning banner */}
        {(isWarning30 || isWarning15 || isWarning5) && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600 mt-0.5" />
            <p className="text-xs text-amber-700">
              {isWarning5 ? 'Your parking expires in 5 minutes.' : isWarning15 ? 'Your parking expires in 15 minutes.' : 'Your parking expires in 30 minutes. Consider extending.'}
            </p>
          </div>
        )}
      </Card>

      {/* Session details */}
      <Card className="mb-4 divide-y divide-gray-100">
        <div className="flex items-center justify-between p-4">
          <span className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4 text-gray-400" />
            Checked in
          </span>
          <span className="text-sm font-medium text-gray-900">{formatTime(session.checkInAt)}</span>
        </div>
        <div className="flex items-center justify-between p-4">
          <span className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4 text-gray-400" />
            Scheduled end
          </span>
          <span className="text-sm font-medium text-gray-900">{formatTime(reservation.endTime)}</span>
        </div>
        <div className="flex items-center justify-between p-4">
          <span className="flex items-center gap-2 text-sm text-gray-500">
            <Car className="h-4 w-4 text-gray-400" />
            Vehicle
          </span>
          <span className="text-sm font-medium text-gray-900">{vehicle?.make} {vehicle?.model}</span>
        </div>
        <div className="flex items-center justify-between p-4">
          <span className="flex items-center gap-2 text-sm text-gray-500">
            <Car className="h-4 w-4 text-gray-400" />
            Plate
          </span>
          <span className="font-mono text-sm font-medium text-gray-900">{vehicle?.licensePlate}</span>
        </div>
        {session.extensions.length > 0 && (
          <div className="flex items-center justify-between p-4">
            <span className="flex items-center gap-2 text-sm text-gray-500">
              <Plus className="h-4 w-4 text-gray-400" />
              Extensions
            </span>
            <span className="text-sm font-medium text-gray-900">{session.extensions.length}× extended</span>
          </div>
        )}
      </Card>

      {/* Extend panel */}
      {showExtend && (
        <Card className="mb-4 p-5">
          <h3 className="font-semibold text-gray-900">Extend Parking</h3>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[30, 60, 120].map((mins) => (
              <button
                key={mins}
                onClick={() => setExtendMinutes(mins)}
                className={`rounded-lg border py-3 text-sm font-medium ${
                  extendMinutes === mins ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                {mins < 60 ? `${mins}m` : `${mins / 60}h`}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Additional cost: {formatNaira(Math.round((facility?.pricePerHour || 0) * (extendMinutes / 60)))}
          </p>
          {extendError && (
            <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              This space is reserved for another customer and cannot be extended.
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" onClick={() => setShowExtend(false)}>Cancel</Button>
            <Button fullWidth onClick={handleExtend}>Confirm Extension</Button>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {!showExtend && (
          <Button fullWidth size="lg" onClick={() => setShowExtend(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Extend Parking
          </Button>
        )}
        <Button variant="danger" fullWidth size="lg" onClick={handleCheckout}>
          Check Out
        </Button>
        <Button variant="ghost" fullWidth onClick={() => navigate('/customer/help')}>
          <HelpCircle className="mr-2 h-4 w-4" />
          Get Help
        </Button>
      </div>
    </CustomerLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}
