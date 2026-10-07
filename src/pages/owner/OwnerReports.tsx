import { useStore } from '@/store/StoreContext';
import { OwnerLayout } from '@/layouts/OwnerLayout';
import { Card, SectionHeader, KPI } from '@/components/ui';
import { BarChart, LineChart } from '@/components/Charts';
import { formatNaira, formatDuration } from '@/lib/status';
import { generateRevenueData, generateHourlyOccupancy } from '@/data/seed';
import { TrendingUp, Users, Clock, Car } from 'lucide-react';

export function OwnerReports() {
  const {
    currentUser, facilities, getFacilityOccupancy, getFacilityRevenue,
    getReservationsByFacility, getIncidentsByFacility,
  } = useStore();

  const ownedFacilities = facilities.filter((f) => currentUser?.ownedFacilities?.includes(f.id));
  const primaryFacility = ownedFacilities[0];
  if (!primaryFacility) return null;

  const allReservations = ownedFacilities.flatMap((f) => getReservationsByFacility(f.id));
  const completed = allReservations.filter((r) => r.status === 'COMPLETED');
  const avgDuration = completed.length > 0
    ? completed.reduce((sum, r) => sum + (new Date(r.endTime).getTime() - new Date(r.startTime).getTime()), 0) / completed.length / 60000
    : 0;

  const allIncidents = ownedFacilities.flatMap((f) => getIncidentsByFacility(f.id));

  return (
    <OwnerLayout title="Reports">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <KPI label="Total Bookings" value={allReservations.length} icon={<Car className="h-6 w-6" />} />
        <KPI label="Completed" value={completed.length} accent="text-emerald-600" />
        <KPI label="Avg Duration" value={formatDuration(Math.round(avgDuration))} icon={<Clock className="h-6 w-6" />} />
        <KPI label="Incidents" value={allIncidents.length} accent="text-amber-600" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card className="p-5">
          <SectionHeader title="Revenue" subtitle="7-day trend" />
          <div className="mt-4">
            <LineChart data={generateRevenueData(primaryFacility.id)} formatValue={(v) => `₦${(v / 1000).toFixed(0)}k`} />
          </div>
        </Card>
        <Card className="p-5">
          <SectionHeader title="Occupancy Pattern" subtitle="Hourly breakdown" />
          <div className="mt-4">
            <BarChart data={generateHourlyOccupancy(primaryFacility.id).map((d) => ({ label: d.hour, value: d.occupancy }))} formatValue={(v) => `${v}%`} />
          </div>
        </Card>
      </div>

      {/* Facility comparison table */}
      <Card className="p-5">
        <SectionHeader title="Facility Comparison" />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                <th className="pb-2 font-medium">Facility</th>
                <th className="pb-2 font-medium">Spaces</th>
                <th className="pb-2 font-medium">Occupied</th>
                <th className="pb-2 font-medium">Utilization</th>
                <th className="pb-2 font-medium">Bookings</th>
                <th className="pb-2 font-medium">Incidents</th>
                <th className="pb-2 font-medium text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {ownedFacilities.map((f) => {
                const o = getFacilityOccupancy(f.id);
                const u = o.total > 0 ? Math.round((o.occupied / o.total) * 100) : 0;
                const bookings = getReservationsByFacility(f.id).length;
                const incidents = getIncidentsByFacility(f.id).length;
                const revenue = getFacilityRevenue(f.id);
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
                    <td className="py-3 text-gray-600">{bookings}</td>
                    <td className="py-3 text-gray-600">{incidents}</td>
                    <td className="py-3 text-right font-medium text-gray-900">{formatNaira(revenue)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </OwnerLayout>
  );
}
