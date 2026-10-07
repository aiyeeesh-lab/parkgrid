import { useStore } from '@/store/StoreContext';
import { CorporateLayout } from '@/layouts/CorporateLayout';
import { KPI, Card, SectionHeader } from '@/components/ui';
import { LineChart, BarChart } from '@/components/Charts';
import { formatNaira, formatDuration } from '@/lib/status';
import { generateRevenueData, generateHourlyOccupancy } from '@/data/seed';
import { Briefcase, Car, TrendingUp, MapPin } from 'lucide-react';

export function CorporateDashboard() {
  const { currentUser, organizations, users, reservations, facilities } = useStore();

  const org = organizations.find((o) => o.id === currentUser?.organizationId);
  const employees = users.filter((u) => u.role === 'customer');
  // Use all reservations as "corporate bookings" for the demo
  const allBookings = reservations;
  const activeBookings = allBookings.filter((r) => r.status === 'CHECKED_IN');
  const completed = allBookings.filter((r) => r.status === 'COMPLETED');
  const monthlySpend = allBookings.reduce((sum, r) => sum + r.amount, 0);

  return (
    <CorporateLayout title="Corporate Parking">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <KPI label="Bookings" value={allBookings.length} icon={<Car className="h-6 w-6" />} />
        <KPI label="Active" value={activeBookings.length} accent="text-emerald-600" />
        <KPI label="Monthly Spend" value={formatNaira(monthlySpend)} accent="text-indigo-600" />
        <KPI label="Locations" value={facilities.length} icon={<MapPin className="h-6 w-6" />} />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card className="p-5">
          <SectionHeader title="Monthly Spend" subtitle="Last 7 periods" />
          <div className="mt-4">
            <LineChart data={generateRevenueData().map((d) => ({ ...d, value: d.value / 2 }))} color="#4f46e5" formatValue={(v) => `₦${(v / 1000).toFixed(0)}k`} />
          </div>
        </Card>
        <Card className="p-5">
          <SectionHeader title="Usage by Day" subtitle="Bookings per day" />
          <div className="mt-4">
            <BarChart data={generateHourlyOccupancy().map((d) => ({ label: d.hour, value: Math.round(d.occupancy / 10) }))} color="#4f46e5" />
          </div>
        </Card>
      </div>

      {/* Employee table */}
      <Card className="p-5">
        <SectionHeader title="Employee Activity" subtitle={`${employees.length} employees`} />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                <th className="pb-2 font-medium">Employee</th>
                <th className="pb-2 font-medium">Bookings</th>
                <th className="pb-2 font-medium">Active</th>
                <th className="pb-2 font-medium text-right">Spending</th>
              </tr>
            </thead>
            <tbody>
              {employees.slice(0, 10).map((emp) => {
                const empBookings = allBookings.filter((r) => r.customerId === emp.id);
                const empActive = empBookings.filter((r) => r.status === 'CHECKED_IN').length;
                const empSpend = empBookings.reduce((sum, r) => sum + r.amount, 0);
                return (
                  <tr key={emp.id} className="border-b border-gray-50">
                    <td className="py-3 font-medium text-gray-900">{emp.name}</td>
                    <td className="py-3 text-gray-600">{empBookings.length}</td>
                    <td className="py-3 text-gray-600">{empActive}</td>
                    <td className="py-3 text-right font-medium text-gray-900">{formatNaira(empSpend)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </CorporateLayout>
  );
}
