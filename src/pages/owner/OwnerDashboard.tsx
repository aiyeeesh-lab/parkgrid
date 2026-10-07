import { useStore } from '@/store/StoreContext';
import { OwnerLayout } from '@/layouts/OwnerLayout';
import { KPI, Card, SectionHeader } from '@/components/ui';
import { BarChart, LineChart, DonutChart } from '@/components/Charts';
import { formatNaira, formatDuration, bayStatusConfig } from '@/lib/status';
import { generateRevenueData, generateHourlyOccupancy } from '@/data/seed';
import { TrendingUp, AlertTriangle, Wrench, Clock } from 'lucide-react';

export function OwnerDashboard() {
  const {
    currentUser, facilities, getFacilityOccupancy, getFacilityRevenue,
    getIncidentsByFacility, getReservationsByFacility, bays,
  } = useStore();

  const ownedFacilities = facilities.filter((f) => currentUser?.ownedFacilities?.includes(f.id));
  const primaryFacility = ownedFacilities[0];

  if (!primaryFacility) return null;

  const occ = getFacilityOccupancy(primaryFacility.id);
  const utilization = occ.total > 0 ? Math.round((occ.occupied / occ.total) * 100) : 0;
  const revenue = getFacilityRevenue(primaryFacility.id);

  const allReservations = ownedFacilities.flatMap((f) => getReservationsByFacility(f.id));
  const activeSessions = allReservations.filter((r) => r.status === 'CHECKED_IN');
  const allIncidents = ownedFacilities.flatMap((f) => getIncidentsByFacility(f.id));
  const openIncidents = allIncidents.filter((i) => i.status !== 'resolved');
  const maintenanceBays = bays.filter((b) => ownedFacilities.some((f) => f.id === b.facilityId) && b.status === 'MAINTENANCE');

  // Calculate avg session duration from completed
  const completed = allReservations.filter((r) => r.status === 'COMPLETED');
  const avgDuration = completed.length > 0
    ? completed.reduce((sum, r) => sum + (new Date(r.endTime).getTime() - new Date(r.startTime).getTime()), 0) / completed.length / 60000
    : 0;

  const revenueData = generateRevenueData(primaryFacility.id);
  const occupancyData = generateHourlyOccupancy(primaryFacility.id);

  // Bay status distribution
  const facBays = bays.filter((b) => b.facilityId === primaryFacility.id);
  const statusCounts = {
    AVAILABLE: facBays.filter((b) => b.status === 'AVAILABLE').length,
    RESERVED: facBays.filter((b) => b.status === 'RESERVED').length,
    ACTIVE: facBays.filter((b) => b.status === 'ACTIVE').length,
    TURNOVER: facBays.filter((b) => b.status === 'TURNOVER').length,
    MAINTENANCE: facBays.filter((b) => b.status === 'MAINTENANCE').length,
  };

  return (
    <OwnerLayout title={`${primaryFacility.name} — Overview`}>
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <KPI label="Total Spaces" value={occ.total} />
        <KPI label="Occupied" value={occ.occupied} accent="text-amber-600" />
        <KPI label="Utilization" value={`${utilization}%`} accent="text-teal-600" trend={{ value: '+5% vs yesterday', positive: true }} />
        <KPI label="Revenue Today" value={formatNaira(revenue)} accent="text-emerald-600" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card className="p-5">
          <SectionHeader title="Revenue" subtitle="Last 7 days" />
          <div className="mt-4">
            <LineChart data={revenueData} formatValue={(v) => `₦${(v / 1000).toFixed(0)}k`} />
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeader title="Hourly Occupancy" subtitle="Today" />
          <div className="mt-4">
            <BarChart data={occupancyData.map((d) => ({ label: d.hour, value: d.occupancy }))} formatValue={(v) => `${v}%`} />
          </div>
        </Card>
      </div>

      {/* Bay status distribution + operational health */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card className="p-5">
          <SectionHeader title="Bay Status" subtitle="Current distribution" />
          <div className="mt-6 flex justify-center">
            <DonutChart
              segments={[
                { label: 'Available', value: statusCounts.AVAILABLE, color: '#10b981' },
                { label: 'Reserved', value: statusCounts.RESERVED, color: '#3b82f6' },
                { label: 'Active', value: statusCounts.ACTIVE, color: '#f59e0b' },
                { label: 'Turnover', value: statusCounts.TURNOVER, color: '#f97316' },
                { label: 'Maintenance', value: statusCounts.MAINTENANCE, color: '#ef4444' },
              ]}
              centerValue={`${occ.total}`}
              centerLabel="Total Bays"
            />
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeader title="Operational Health" />
          <div className="mt-4 space-y-3">
            <HealthRow icon={<AlertTriangle className="h-4 w-4 text-amber-500" />} label="Overstay Rate" value={`${activeSessions.length > 0 ? Math.round((activeSessions.filter((r) => new Date(r.endTime).getTime() < Date.now()).length / activeSessions.length * 100) : 0)}%`} />
            <HealthRow icon={<AlertTriangle className="h-4 w-4 text-red-500" />} label="Incident Rate" value={`${openIncidents.length} open`} />
            <HealthRow icon={<Wrench className="h-4 w-4 text-gray-500" />} label="Maintenance" value={`${maintenanceBays.length} bays`} />
            <HealthRow icon={<Clock className="h-4 w-4 text-blue-500" />} label="Avg Session" value={formatDuration(Math.round(avgDuration))} />
          </div>
          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-700">Peak Hours</p>
            <p className="mt-1 text-sm text-gray-500">5:30 PM — 8:00 PM</p>
          </div>
        </Card>
      </div>

      {/* Owned facilities overview */}
      {ownedFacilities.length > 1 && (
        <Card className="p-5">
          <SectionHeader title="All Facilities" subtitle={`${ownedFacilities.length} facilities under management`} />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                  <th className="pb-2 font-medium">Facility</th>
                  <th className="pb-2 font-medium">Capacity</th>
                  <th className="pb-2 font-medium">Occupied</th>
                  <th className="pb-2 font-medium">Utilization</th>
                  <th className="pb-2 font-medium text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {ownedFacilities.map((f) => {
                  const o = getFacilityOccupancy(f.id);
                  const u = o.total > 0 ? Math.round((o.occupied / o.total) * 100) : 0;
                  const r = getFacilityRevenue(f.id);
                  return (
                    <tr key={f.id} className="border-b border-gray-50">
                      <td className="py-3 font-medium text-gray-900">{f.name}</td>
                      <td className="py-3 text-gray-600">{o.total}</td>
                      <td className="py-3 text-gray-600">{o.occupied}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-gray-100">
                            <div className="h-1.5 rounded-full bg-teal-500" style={{ width: `${u}%` }} />
                          </div>
                          <span className="text-gray-600">{u}%</span>
                        </div>
                      </td>
                      <td className="py-3 text-right font-medium text-gray-900">{formatNaira(r)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </OwnerLayout>
  );
}

function HealthRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-gray-600">
        {icon}
        {label}
      </span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}
