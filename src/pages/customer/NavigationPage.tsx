import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/StoreContext';
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui';
import { MapView } from '@/components/MapView';
import { Navigation, MapPin, Clock, Car, Info } from 'lucide-react';
import { formatTime } from '@/lib/status';

export function NavigationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getReservationById, getFacilityById, getBayById, getVehicleById } = useStore();
  const reservation = id ? getReservationById(id) : undefined;

  if (!reservation) {
    return (
      <CustomerLayout showBack title="Navigation">
        <p className="text-sm text-gray-500">Booking not found.</p>
      </CustomerLayout>
    );
  }

  const facility = getFacilityById(reservation.facilityId);
  const bay = getBayById(reservation.bayId);
  const vehicle = getVehicleById(reservation.vehicleId);

  if (!facility) return null;

  return (
    <CustomerLayout showBack title="Navigate">
      <div className="mb-4">
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
          <Info className="h-4 w-4 flex-shrink-0 text-blue-500" />
          <p className="text-sm text-blue-700">Estimated arrival: 15–30 minutes before your slot</p>
        </div>
      </div>

      <div className="mb-4">
        <MapView facilities={[facility]} height="280px" showLabels={false} />
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-semibold text-gray-900">{facility.name}</p>
              <p className="text-sm text-gray-500">{facility.address}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4 text-gray-400" /> Arrival
            </span>
            <span className="font-medium text-gray-900">{formatTime(reservation.startTime)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4 text-gray-400" /> Bay
            </span>
            <span className="font-medium text-gray-900">{bay?.bayNumber}</span>
          </div>
          {vehicle && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <Car className="h-4 w-4 text-gray-400" /> Vehicle
              </span>
              <span className="font-mono text-sm font-medium text-gray-900">{vehicle.licensePlate}</span>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Leave by {formatTime(reservation.startTime)}</p>
          <p className="mt-1 text-xs text-amber-600">Show your QR code to the attendant upon arrival at the facility entrance.</p>
        </div>

        <Button fullWidth size="lg" onClick={() => navigate(`/customer/session/${reservation.id}`)}>
          <Navigation className="mr-2 h-4 w-4" />
          I've Arrived — View Session
        </Button>
      </div>
    </CustomerLayout>
  );
}
