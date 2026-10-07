import { useState } from 'react';
import { useStore } from '@/store/StoreContext';
import { AdminLayout } from '@/layouts/AdminLayout';
import { KPI, Card, SectionHeader } from '@/components/ui';
import { MapView } from '@/components/MapView';
import { formatNaira, bayStatusConfig } from '@/lib/status';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, X, MapPin, Car, Shield, Clock } from 'lucide-react';
import type { Facility } from '@/types';

export function AdminNetwork() {
  const { facilities, getFacilityOccupancy, getFacilityRevenue, getIncidentsByFacility, bays } = useStore();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Facility | null>(null);

  const sortedByUtil = [...facilities].map((f) => {
    const o = getFacilityOccupancy(f.id);
    return { facility: f, occ: o, util: o.total > 0 ? Math.round((o.occupied / o.total) * 100) : 0 };
  }).sort((a, b) => b.util - a.util);

  return (
    <AdminLayout title="Network Performance">
      {/* Map */}
      <Card className="p-5 mb-6">
        <SectionHeader title="Network Map" subtitle="Click a facility to inspect" />
        <div className="mt-4">
          <MapView onSelect={(f) => setSelected(f)} height="350px" />
        </div>
      </Card>

      {/* Comparison table */}
      <Card className="p-5">
        <SectionHeader title="Facility Comparison" subtitle="Sortable network overview" />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                <th className="pb-3 font-medium">Facility</th>
                <th className="pb-3 font-medium">Spaces</th>
                <th className="pb-3 font-medium">Occupancy</th>
                <th className="pb-3 font-medium">Utilization</th>
                <th className="pb-3 font-medium text-right">Revenue</th>
                <th className="pb-3 font-medium">Incidents</th>
                <th className="pb-3 font-medium">Overstay</th>
              </tr>
            </thead>
            <tbody>
              {sortedByUtil.map(({ facility: f, occ, util }) => {
                const incidents = getIncidentsByFacility(f.id);
                const facBays = bays.filter((b) => b.facilityId === f.id);
                const activeRes = facBays.filter((b) => b.status === 'ACTIVE');
                return (
                  <tr
                    key={f.id}
                    className="border-b border-gray-50 cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelected(f)}
                  >
                    <td className="py-3 font-medium text-gray-900">{f.name}</td>
                    <td className="py-3 text-gray-600">{occ.total}</td>
                    <td className="py-3 text-gray-600">{occ.occupied}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-gray-100">
                          <div className={`h-1.5 rounded-full ${util > 80 ? 'bg-red-500' : util > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${util}%` }} />
                        </div>
                        <span className="text-gray-600">{util}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-medium text-gray-900">{formatNaira(getFacilityRevenue(f.id))}</td>
                    <td className="py-3 text-gray-600">{incidents.length}</td>
                    <td className="py-3 text-gray-600">0</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Facility detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selected.name}</h3>
                <p className="text-sm text-gray-500">{selected.location}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 rounded-lg bg-gray-50 p-3">
              <MapView facilities={[selected]} height="150px" showLabels={false} />
            </div>

            <div className="space-y-3">
              <Row icon={Car} label="Capacity" value={`${selected.capacity} spaces`} />
              <Row icon={Shield} label="Security" value={selected.securityFeatures.join(', ')} />
              <Row icon={Clock} label="Hours" value={`${selected.openingTime} — ${selected.closingTime}`} />
              <Row icon={MapPin} label="Address" value={selected.address} />
              <Row icon={Car} label="Supply Model" value={selected.supplyModel} />
              <Row icon={MapPin} label="Price" value={formatNaira(selected.pricePerHour) + '/hr'} />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{getFacilityOccupancy(selected.id).total}</p>
                <p className="text-xs text-gray-500">Spaces</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-lg font-bold text-amber-600">{getFacilityOccupancy(selected.id).occupied}</p>
                <p className="text-xs text-gray-500">Occupied</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-lg font-bold text-emerald-600">{formatNaira(getFacilityRevenue(selected.id))}</p>
                <p className="text-xs text-gray-500">Revenue</p>
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
