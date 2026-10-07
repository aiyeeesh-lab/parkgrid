import { useStore } from '@/store/StoreContext';
import { CorporateLayout } from '@/layouts/CorporateLayout';
import { KPI, Card, SectionHeader } from '@/components/ui';
import { formatNaira, formatDuration } from '@/lib/status';
import { generateRevenueData, generateHourlyOccupancy } from '@/data/seed';
import { BarChart, LineChart } from '@/components/Charts';

export function CorporateReports() {
  const { reservations, users } = useStore();
  const employees = users.filter((u) => u.role === 'customer');
  const completed = reservations.filter((r) => r.status === 'COMPLETED');
  const avgDuration = completed.length > 0
    ? completed.reduce((sum, r) => sum + (new Date(r.endTime).getTime() - new Date(r.startTime).getTime()), 0) / completed.length / 60000
    : 0;

  const totalSpend = reservations.reduce((sum, r) => sum + r.amount, 0);

  return (
    <CorporateLayout title="Reports">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <KPI label="Total Bookings" value={reservations.length} />
        <KPI label="Employees" value={employees.length} />
        <KPI label="Avg Duration" value={formatDuration(Math.round(avgDuration))} />
        <KPI label="Total Spend" value={formatNaira(totalSpend)} accent="text-indigo-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card className="p-5">
          <SectionHeader title="Spending Trend" />
          <div className="mt-4">
            <LineChart data={generateRevenueData().map((d) => ({ ...d, value: d.value / 2 }))} color="#4f46e5" formatValue={(v) => `₦${(v / 1000).toFixed(0)}k`} />
          </div>
        </Card>
        <Card className="p-5">
          <SectionHeader title="Usage Pattern" />
          <div className="mt-4">
            <BarChart data={generateHourlyOccupancy().map((d) => ({ label: d.hour, value: Math.round(d.occupancy / 10) }))} color="#4f46e5" />
          </div>
        </Card>
      </div>

      {/* Employee summary */}
      <Card className="p-5">
        <SectionHeader title="Employee Summary" />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                <th className="pb-2 font-medium">Employee</th>
                <th className="pb-2 font-medium">Bookings</th>
                <th className="pb-2 font-medium">Completed</th>
                <th className="pb-2 font-medium text-right">Spending</th>
              </tr>
            </thead>
            <tbody>
              {employees.slice(0, 15).map((emp) => {
                const empBookings = reservations.filter((r) => r.customerId === emp.id);
                const empCompleted = empBookings.filter((r) => r.status === 'COMPLETED').length;
                const empSpend = empBookings.reduce((sum, r) => sum + r.amount, 0);
                return (
                  <tr key={emp.id} className="border-b border-gray-50">
                    <td className="py-3 font-medium text-gray-900">{emp.name}</td>
                    <td className="py-3 text-gray-600">{empBookings.length}</td>
                    <td className="py-3 text-gray-600">{empCompleted}</td>
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
