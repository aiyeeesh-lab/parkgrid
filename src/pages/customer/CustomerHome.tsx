import { useState } from 'react';
import { useStore } from '@/store/StoreContext';
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { FacilityCard } from '@/components/FacilityCard';
import { MapView } from '@/components/MapView';
import { Search, MapPin, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Facility } from '@/types';

export function CustomerHome() {
  const { facilities, currentUser, getAvailableBayCount } = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showMap, setShowMap] = useState(false);

  const filtered = facilities.filter(
    (f) =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.location.toLowerCase().includes(query.toLowerCase())
  );

  const nearby = query
    ? filtered
    : [...facilities].sort((a, b) => getAvailableBayCount(b.id) - getAvailableBayCount(a.id));

  return (
    <CustomerLayout title="PARKGRID">
      {/* Hero Search */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Where are you going?</h1>
        <p className="mt-1 text-sm text-gray-500">
          Search Victoria Island, Lekki, Ikeja...
        </p>

        <div className="relative mt-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search location or facility"
            className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/5"
          />
        </div>

        {/* Quick filters */}
        <div className="mt-3 flex flex-wrap gap-2">
          {['Victoria Island', 'Ikoyi', 'Lekki', 'Ikeja', 'Yaba'].map((area) => (
            <button
              key={area}
              onClick={() => setQuery(area)}
              className="rounded-full bg-white border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Map toggle */}
      <div className="mb-6">
        <button
          onClick={() => setShowMap(!showMap)}
          className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <span className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-gray-400" />
            {showMap ? 'Hide map' : 'Show map view'}
          </span>
          <MapPin className="h-4 w-4 text-gray-400" />
        </button>
        {showMap && (
          <div className="mt-3">
            <MapView
              onSelect={(f: Facility) => navigate(`/customer/facilities/${f.id}`)}
              height="300px"
              showLabels={false}
            />
          </div>
        )}
      </div>

      {/* Nearby facilities */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          {query ? 'Results' : 'Nearby Facilities'}
        </h2>
        <div className="space-y-3">
          {nearby.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center">
              <p className="text-sm font-medium text-gray-700">No facilities found</p>
              <p className="mt-1 text-xs text-gray-500">Try a different search term.</p>
            </div>
          ) : (
            nearby.map((facility) => (
              <FacilityCard
                key={facility.id}
                facility={facility}
                onClick={() => navigate(`/customer/facilities/${facility.id}`)}
              />
            ))
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
