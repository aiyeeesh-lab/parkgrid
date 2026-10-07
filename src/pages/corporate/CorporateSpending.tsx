import { useStore } from '@/store/StoreContext';
import { CorporateLayout } from '@/layouts/CorporateLayout';
import { KPI, Card, SectionHeader } from '@/components/ui';
import { LineChart, BarChart } from '@/components/Charts';
import { formatNaira } from '@/lib/status';
import { generateRevenueData } from '@/data/seed';

export function CorporateSpending() {
  const { reservations, facilities, getFacilityRevenue } = useStore();

  const totalSpend = reservations.reduce((sum, r) => sum + r.amount, 0);
  const avgPerBooking = reservations.length > 0 ? Math.round(totalSpend / reservations.length) : 0;

  // Spending by facility
  const byFacility = facilities.map((f) => ({
    label: f.name.split(' ')[0],
    value: getFacilityRevenue(f.id),
  }));

  return (
    <CorporateLayout title="Spending">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <KPI label="Total Spend" value={formatNaira(totalSpend)} accent="text-indigo-600" />
        <KPI label="This Month" value={formatNaira(totalSpend)} accent="text-indigo-600" />
        <KPI label="Avg / Booking" value={formatNaira(avgPerBooking)} />
        <KPI label="Bookings" value={reservations.length} />
      </div>

      {/* Trend */}
      <Card className="p-5 mb-6">
        <SectionHeader title="Spending Trend" subtitle="Last 7 periods" />
        <div className="mt-4">
          <LineChart data={generateRevenueData().map((d) => ({ ...d, value: d.value / 2 }))} color="#4f46e5" formatValue={(v) => `₦${(v / 1000).toFixed(0)}k`} />
        </div>
      </Card>

      {/* By facility */}
      <Card className="p-5">
        <SectionHeader title="Spending by Facility" />
        <div className="mt-4">
          <BarChart data={byFacility} color="#4f46e5" formatValue={(v) => `₦${(v / 1000).toFixed(0)}k`} />
        </div>
      </Card>
    </CorporateLayout>
  );
}
