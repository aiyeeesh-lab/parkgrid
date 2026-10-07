import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/StoreContext';
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui';
import { MapView } from '@/components/MapView';
import { formatNaira } from '@/lib/status';
import { Clock, MapPin, Shield, Camera, Users, Car, Navigation, ChevronRight } from 'lucide-react';

export function FacilityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getFacilityById, getAvailableBayCount, getFacilityOccupancy } = useStore();
  const facility = id ? getFacilityById(id) : undefined;
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  if (!facility) {
    return (
      <CustomerLayout showBack title="Facility Not Found">
        <p className="text-sm text-gray-500">This facility could not be found.</p>
      </CustomerLayout>
    );
  }

  if (facility.status !== 'OPERATIONAL') {
    return (
      <CustomerLayout showBack title={facility.name}>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-medium text-red-800">Facility Unavailable</p>
          <p className="mt-1 text-sm text-red-600">
            This facility is temporarily {facility.status.toLowerCase()}. Please check back later.
          </p>
        </div>
      </CustomerLayout>
    );
  }

  const available = getAvailableBayCount(facility.id);
  const occupancy = getFacilityOccupancy(facility.id);

  // Generate time slots
  const slots: { time: string; available: boolean }[] = [];
  const now = new Date();
  const startHour = Math.max(now.getHours() + 1, 6);
  for (let h = startHour; h <= 22; h++) {
    slots.push({
      time: `${h % 12 || 12}:00 ${h < 12 ? 'AM' : 'PM'}`,
      available: available > 0,
    });
  }

  const securityIcons: Record<string, typeof Shield> = {
    CCTV: Camera,
    '24/7 Attendant': Users,
    'Access Control': Shield,
    Floodlit: Shield,
    Attendant: Users,
  };

  return (
    <CustomerLayout showBack title={facility.name}>
      {/* Hero */}
      <div className="relative -mx-4 mb-6 h-48 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-600">
        <div className="absolute inset-0 flex items-end p-4">
          <div className="text-white">
            <h1 className="text-xl font-bold">{facility.name}</h1>
            <p className="flex items-center gap-1 text-sm opacity-90">
              <MapPin className="h-3.5 w-3.5" />
              {facility.location}
            </p>
          </div>
        </div>
        <div className="absolute right-4 top-4 rounded-lg bg-white/90 px-3 py-1.5 backdrop-blur">
          <span className={`text-sm font-bold ${available > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {available > 0 ? `${available} spaces` : 'Full'}
          </span>
        </div>
      </div>

      {/* Key info */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="text-2xl font-bold text-gray-900">{formatNaira(facility.pricePerHour)}<span className="text-sm font-normal text-gray-500">/hr</span></p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Capacity</p>
            <p className="text-lg font-semibold text-gray-900">{occupancy.occupied}/{occupancy.total} occupied</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4 text-gray-400" />
          {facility.openingTime} — {facility.closingTime}
        </div>

        <p className="text-sm text-gray-600">{facility.description}</p>
      </div>

      {/* Security */}
      <div className="mb-6">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Security</h3>
        <div className="flex flex-wrap gap-2">
          {facility.securityFeatures.map((feat) => {
            const Icon = securityIcons[feat] || Shield;
            return (
              <span key={feat} className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                <Icon className="h-4 w-4 text-gray-500" />
                {feat}
              </span>
            );
          })}
        </div>
      </div>

      {/* Map */}
      <div className="mb-6">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Location</h3>
        <MapView facilities={[facility]} height="200px" showLabels={false} />
        <p className="mt-2 text-sm text-gray-500">{facility.address}</p>
      </div>

      {/* Time slots */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Available Times Today</h3>
        {available === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-8 text-center">
            <p className="text-sm font-medium text-gray-700">No spaces available</p>
            <p className="mt-1 text-xs text-gray-500">All bays are currently occupied or reserved.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot) => (
              <button
                key={slot.time}
                onClick={() => setSelectedSlot(slot.time)}
                className={`rounded-lg border px-2 py-2.5 text-sm font-medium transition-all ${
                  selectedSlot === slot.time
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      {available > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3">
            <div>
              {selectedSlot ? (
                <p className="text-sm text-gray-600">
                  Starting <span className="font-semibold text-gray-900">{selectedSlot}</span>
                </p>
              ) : (
                <p className="text-sm text-gray-500">Select a time to reserve</p>
              )}
            </div>
            <Button
              size="lg"
              onClick={() => navigate(`/customer/reserve/${facility.id}`)}
              className="flex items-center gap-2"
            >
              Reserve Parking
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}
