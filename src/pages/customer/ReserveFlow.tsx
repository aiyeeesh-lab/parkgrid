import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/StoreContext';
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { Button, Card } from '@/components/ui';
import { formatNaira, formatDuration } from '@/lib/status';
import { Check, ChevronRight, ChevronLeft, CreditCard, Loader2, Car } from 'lucide-react';

const STEPS = ['Date', 'Time', 'Duration', 'Vehicle', 'Summary', 'Payment', 'Confirmation'];

export function ReserveFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getFacilityById, getVehicleByUser, currentUser, createReservation, bays } = useStore();
  const facility = id ? getFacilityById(id) : undefined;
  const vehicle = currentUser ? getVehicleByUser(currentUser.id) : undefined;

  const [step, setStep] = useState(0);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('17:00');
  const [duration, setDuration] = useState(2); // hours
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [bookingNumber, setBookingNumber] = useState<string | null>(null);
  const [reservedBayId, setReservedBayId] = useState<string | null>(null);

  if (!facility || !currentUser || !vehicle) {
    return (
      <CustomerLayout showBack title="Reserve">
        <p className="text-sm text-gray-500">Unable to start reservation. Please try again.</p>
      </CustomerLayout>
    );
  }

  // Find an available bay
  const availableBay = bays.find((b) => b.facilityId === facility.id && b.status === 'AVAILABLE');

  // Calculate end time
  const [sh, sm] = startTime.split(':').map(Number);
  const startISO = new Date(`${date}T${startTime}:00`).toISOString();
  const endISO = new Date(new Date(startISO).getTime() + duration * 3600000).toISOString();
  const amount = facility.pricePerHour * duration;

  const handleSubmit = () => {
    if (!availableBay) return;

    setPaymentProcessing(true);
    setTimeout(() => {
      const reservation = createReservation({
        customerId: currentUser.id,
        vehicleId: vehicle.id,
        facilityId: facility.id,
        bayId: availableBay.id,
        startTime: startISO,
        endTime: endISO,
        amount,
      });

      setPaymentProcessing(false);
      if (reservation) {
        setBookingNumber(reservation.bookingNumber);
        setReservedBayId(availableBay.id);
        setStep(6);
      }
    }, 1800);
  };

  const next = () => setStep((s) => Math.min(s + 1, 6));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <CustomerLayout showBack title="Reserve Parking">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  i < step
                    ? 'bg-emerald-500 text-white'
                    : i === step
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`text-[10px] ${i <= step ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 h-0.5 w-full bg-gray-100">
          <div
            className="h-0.5 bg-gray-900 transition-all duration-300"
            style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="mb-6">
        {step === 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">When are you arriving?</h2>
            <label className="text-sm font-medium text-gray-700">Arrival Date</label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 focus:border-gray-400 focus:outline-none"
            />
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">What time?</h2>
            <label className="text-sm font-medium text-gray-700">Arrival Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 focus:border-gray-400 focus:outline-none"
            />
            <div className="mt-3 grid grid-cols-4 gap-2">
              {['08:00', '10:00', '12:00', '14:00', '16:00', '17:00', '18:00', '20:00'].map((t) => (
                <button
                  key={t}
                  onClick={() => setStartTime(t)}
                  className={`rounded-lg border py-2 text-sm font-medium ${
                    startTime === t ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">How long do you need?</h2>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 6, 8].map((h) => (
                <button
                  key={h}
                  onClick={() => setDuration(h)}
                  className={`rounded-xl border py-4 text-center transition-all ${
                    duration === h ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <p className="text-lg font-bold">{h}h</p>
                  <p className={`text-xs ${duration === h ? 'text-gray-300' : 'text-gray-500'}`}>
                    {formatNaira(facility.pricePerHour * h)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Which vehicle?</h2>
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                  <Car className="h-6 w-6 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{vehicle.make} {vehicle.model}</p>
                  <p className="text-sm text-gray-500">{vehicle.color} · <span className="font-mono">{vehicle.licensePlate}</span></p>
                </div>
                <Check className="h-5 w-5 text-emerald-500" />
              </div>
            </Card>
            <p className="mt-3 text-xs text-gray-400">This is your registered vehicle. Add more in your profile.</p>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Booking Summary</h2>
            <Card className="divide-y divide-gray-100">
              <Row label="Facility" value={facility.name} />
              <Row label="Location" value={facility.location} />
              <Row label="Date" value={new Date(date).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })} />
              <Row label="Arrival" value={startTime} />
              <Row label="Duration" value={formatDuration(duration * 60)} />
              <Row label="Vehicle" value={`${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`} />
              <Row label="Bay" value={availableBay ? availableBay.bayNumber : 'Will be assigned'} />
              <div className="flex items-center justify-between p-4">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">{formatNaira(amount)}</span>
              </div>
            </Card>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Payment</h2>
            <Card className="p-5">
              <div className="mb-4 flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Simulated Payment</p>
                  <p className="text-xs text-gray-500">No real charge — prototype mode</p>
                </div>
              </div>
              <div className="space-y-2 rounded-lg bg-gray-50 p-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-semibold">{formatNaira(amount)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Provider</span><span className="text-gray-700">PARKGRID Pay</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="text-gray-700">Ready</span></div>
              </div>
              <Button
                fullWidth
                size="lg"
                onClick={handleSubmit}
                disabled={paymentProcessing || !availableBay}
                className="mt-4"
              >
                {paymentProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `Pay ${formatNaira(amount)}`
                )}
              </Button>
              {!availableBay && (
                <p className="mt-3 text-center text-xs text-red-500">No bays available at this facility.</p>
              )}
            </Card>
          </div>
        )}

        {step === 6 && bookingNumber && reservedBayId && (
          <Confirmation
            facilityName={facility.name}
            bookingNumber={bookingNumber}
            bayNumber={availableBay?.bayNumber || ''}
            startTime={startISO}
            endTime={endISO}
            vehicle={`${vehicle.make} ${vehicle.model}`}
            plate={vehicle.licensePlate}
            amount={amount}
            onViewBooking={() => navigate('/customer/bookings')}
          />
        )}
      </div>

      {/* Navigation */}
      {step < 5 && step !== 6 && (
        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="secondary" onClick={prev}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          )}
          <Button onClick={next} fullWidth>
            Continue <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </CustomerLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-4">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

function Confirmation({
  facilityName,
  bookingNumber,
  bayNumber,
  startTime,
  endTime,
  vehicle,
  plate,
  amount,
  onViewBooking,
}: {
  facilityName: string;
  bookingNumber: string;
  bayNumber: string;
  startTime: string;
  endTime: string;
  vehicle: string;
  plate: string;
  amount: number;
  onViewBooking: () => void;
}) {
  const { QRCodeCard } = require('@/components/QRCodeCard');
  const { formatTime } = require('@/lib/status');

  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <Check className="h-8 w-8 text-emerald-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900">Parking Confirmed</h2>
      <p className="mt-1 text-sm text-gray-500">{facilityName}</p>

      <Card className="mt-6 p-6 text-left">
        <div className="flex flex-col items-center gap-4">
          <QRCodeCard value={bookingNumber} size={140} />
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="text-sm text-gray-500">Booking</span>
            <span className="font-mono font-semibold text-gray-900">{bookingNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Bay</span>
            <span className="font-semibold text-gray-900">{bayNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Time</span>
            <span className="font-semibold text-gray-900">{formatTime(startTime)} — {formatTime(endTime)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Vehicle</span>
            <span className="font-semibold text-gray-900">{vehicle}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Plate</span>
            <span className="font-mono font-semibold text-gray-900">{plate}</span>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="text-sm text-gray-500">Amount Paid</span>
            <span className="font-bold text-gray-900">{formatNaira(amount)}</span>
          </div>
        </div>
      </Card>

      <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-left">
        <p className="text-sm font-medium text-amber-800">Leave by {formatTime(startTime)}</p>
        <p className="mt-0.5 text-xs text-amber-600">Estimated arrival: 15–30 minutes before your slot</p>
      </div>

      <Button fullWidth size="lg" onClick={onViewBooking} className="mt-6">
        View My Bookings
      </Button>
    </div>
  );
}
