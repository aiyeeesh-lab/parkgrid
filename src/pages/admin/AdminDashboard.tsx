import { useStore } from '@/store/StoreContext';
import { AdminLayout } from '@/layouts/AdminLayout';
import { KPI, Card, SectionHeader } from '@/components/ui';
import { MapView } from '@/components/MapView';
import { formatNaira, bayStatusConfig } from '@/lib/status';
import { useNavigate } from 'react-router-dom';
import { Building2, Car, TrendingUp, AlertTriangle } from 'lucide-react';

export function AdminDashboard() {
  const { facilities, getNetworkStats, getIncidentsByNetwork, getFacilityOccupancy, getFacilityRevenue } = useStore();
  const navigate = useNavigate();

  const stats = getNetworkStats();
  const incidents = getIncidentsByNetwork();
  const openIncidents = incidents.filter((i) => i.status !== 'resolved');

  return (
    <AdminLayout title="PARKGRID Network">
      {/* Network KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 mb-6">
        <KPI label="Facilities" value={stats.facilities} icon={<Building2 className="h-6 w-6" />} />
        <KPI label="Total Spaces" value={stats.totalSpaces.toLocaleString()} icon={<Car className="h-6 w-6" />} />
        <KPI label="Occupied" value={stats.occupiedSpaces.toLocaleString()} accent="text-amber-600" />
        <KPI label="Utilization" value={`${stats.utilization}%`} accent="text-teal-600" />
        <KPI label="Revenue" value={formatNaira(stats.revenue)} accent="text-emerald-600" />
      </div>

      {/* Map */}
      <Card className="p-5 mb-6">
        <SectionHeader title="Lagos Network Map" subtitle="6 facilities across Lagos" />
        <div className="mt-4">
          <MapView
            onSelect={(f) => navigate(`/admin/facilities`)}
            height="350px"
          />
        </div>
      </Card>

      {/* Alerts + facility snapshot */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Open incidents */}
        <Card className="p-5">
          <SectionHeader title="Operational Alerts" />
          <div className="mt-4 space-y-2">
            {openIncidents.length === 0 ? (
              <p className="text-sm text-gray-500">No active alerts.</p>
            ) : (
              openIncidents.slice(0, 5).map((inc) => (
                <div key={inc.id} className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">{inc.type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">{facilities.find((f) => f.id === inc.facilityId)?.name}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Top facilities by utilization */}
        <Card className="p-5 lg:col-span-2">
          <SectionHeader title="Facility Snapshot" />
          <div className="mt-4 space-y-3">
            {facilities.map((f) => {
              const o = getFacilityOccupancy(f.id);
              const u = o.total > 0 ? Math.round((o.occupied / o.total) * 100) : 0;
              const r = getFacilityRevenue(f.id);
              return (
                <div
                  key={f.id}
                  className="flex items-center gap-4 rounded-lg border border-gray-100 p-3 cursor-pointer hover:border-gray-200"
                  onClick={() => navigate('/admin/facilities')}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{f.name}</p>
                    <p className="text-xs text-gray-500">{f.location}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-gray-100">
                        <div className={`h-1.5 rounded-full ${u > 80 ? 'bg-red-500' : u > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${u}%` }} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{u}%</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{formatNaira(r)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
