import type { Facility } from '@/types';
import { useStore } from '@/store/StoreContext';
import { formatNaira } from '@/lib/status';
import { Shield, Camera, Users, Clock, MapPin, ChevronRight, Car } from 'lucide-react';

interface FacilityCardProps {
  facility: Facility;
  onClick?: () => void;
  compact?: boolean;
}

export function FacilityCard({ facility, onClick, compact = false }: FacilityCardProps) {
  const { getAvailableBayCount } = useStore();
  const available = getAvailableBayCount(facility.id);

  return (
    <div
      onClick={onClick}
      className={`group rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-gray-300 hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900">{facility.name}</h3>
            {facility.status !== 'OPERATIONAL' && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                {facility.status}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5" />
            {facility.location}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-2xl font-bold ${available > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {available}
          </span>
          <span className="text-xs text-gray-500">available</span>
        </div>
      </div>

      {!compact && (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="font-semibold text-gray-900">{formatNaira(facility.pricePerHour)}/hr</span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-500">{facility.capacity} total spaces</span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {facility.securityFeatures.slice(0, 3).map((feat) => {
              const icon = feat === 'CCTV' ? <Camera className="h-3 w-3" /> :
                           feat.includes('Attendant') ? <Users className="h-3 w-3" /> :
                           feat.includes('Access') ? <Shield className="h-3 w-3" /> :
                           <Shield className="h-3 w-3" />;
              return (
                <span key={feat} className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600">
                  {icon}
                  {feat}
                </span>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              {facility.openingTime} — {facility.closingTime}
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-gray-700 group-hover:text-gray-900">
              Reserve
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
