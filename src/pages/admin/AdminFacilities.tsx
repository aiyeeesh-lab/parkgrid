import { useState } from 'react';
import { useStore } from '@/store/StoreContext';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, SectionHeader } from '@/components/ui';
import { formatNaira, bayStatusConfig } from '@/lib/status';
import { ChevronRight, X, MapPin, Car, Shield, Clock } from 'lucide-react';
import type { Facility } from '@/types';

export function AdminFacilities() {
  const { facilities, getFacilityOccupancy, getFacilityRevenue, getIncidentsByFacility, getReservationsByFacility, bays } = useStore();
  const [selected, setSelected] = useState<Facility | null>(null);

  return (
    <AdminLayout title="Facilities">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {facilities.map((f) => {
          const occ = getFacilityOccupancy(f.id);
          const u = occ.total > 0 ? Math.round((occ.occupied / occ.total) * 100) : 0;
          const incidents = getIncidentsByFacility(f.id);
          const bookings = getReservationsByFacility(f.id).length;
          const facBays = bays.filter((b) => b.facilityId === f.id);
          const statusCounts = {
            AVAILABLE: facBays.filter((b) => b.status === 'AVAILABLE').length,
            RESERVED: facBays.filter((b) => b.status === 'RESERVED').length,
            ACTIVE: facBays.filter((b) => b.status === 'ACTIVE').length,
            TURNOVER: facBays.filter((b) => b.status === 'TURNOVER').length,
            MAINTENANCE: facBays.filter((b) => b.status === 'MAINTENANCE').length,
          };

          return (
            <Card key={f.id} className="p-5 cursor-pointer hover:shadow-md" onClick={() => setSelected(f)}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{f.name}</h3>
                  <p className="text-sm text-gray-500">{f.location}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${f.status === 'OPERATIONAL' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                  {f.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Capacity</p>
                  <p className="font-medium text-gray-900">{occ.total}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Occupied</p>
                  <p className="font-medium text-gray-900">{occ.occupied} ({u}%)</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Bookings</p>
                  <p className="font-medium text-gray-900">{bookings}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Incidents</p>
                  <p className="font-medium text-gray-900">{incidents.length}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-sm font-medium text-gray-900">{formatNaira(getFacilityRevenue(f.id))}</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selected.name}</h3>
                <p className="text-sm text-gray-500">{selected.address}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">{selected.description}</p>

            <div className="space-y-3 mb-4">
              <Row icon={Car} label="Capacity" value={`${selected.capacity} spaces`} />
              <Row icon={Shield} label="Security" value={selected.securityFeatures.join(', ')} />
              <Row icon={Clock} label="Hours" value={`${selected.openingTime} — ${selected.closingTime}`} />
              <Row icon={MapPin} label="Supply Model" value={selected.supplyModel} />
              <Row icon={MapPin} label="Price" value={`${formatNaira(selected.pricePerHour)}/hr`} />
            </div>

            {/* Bay status breakdown */}
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Bay Status Breakdown</p>
              <div className="space-y-2">
                {Object.entries(bayStatusConfig).map(([status, cfg]) => {
                  const facBays = bays.filter((b) => b.facilityId === selected.id && b.status === status);
                  return (
                    <div key={status} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                        <span className="text-gray-600">{cfg.label}</span>
                      </span>
                      <span className="font-medium text-gray-900">{facBays.length}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-gray-500">
        <Icon className="h-4 w-4 text-gray-400" />
        {label}
      </span>
      <span className="font-medium text-gray-900 text-right max-w-[60%]">{value}</span>
    </div>
  );
}
