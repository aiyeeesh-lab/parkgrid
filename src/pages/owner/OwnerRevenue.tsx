import { useStore } from '@/store/StoreContext';
import { OwnerLayout } from '@/layouts/OwnerLayout';
import { KPI, Card, SectionHeader } from '@/components/ui';
import { LineChart, BarChart } from '@/components/Charts';
import { formatNaira } from '@/lib/status';
import { generateRevenueData } from '@/data/seed';
import { TrendingUp } from 'lucide-react';

export function OwnerRevenue() {
  const { currentUser, facilities, getFacilityRevenue, getPaymentsByFacility } = useStore();

  const ownedFacilities = facilities.filter((f) => currentUser?.ownedFacilities?.includes(f.id));
  const totalRevenue = ownedFacilities.reduce((sum, f) => sum + getFacilityRevenue(f.id), 0);
  const primaryFacility = ownedFacilities[0];

  if (!primaryFacility) return null;

  const revenueData = generateRevenueData(primaryFacility.id);
  const payments = getPaymentsByFacility(primaryFacility.id).slice(0, 10);

  return (
    <OwnerLayout title="Revenue">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <KPI label="Total Revenue" value={formatNaira(totalRevenue)} accent="text-emerald-600" />
        <KPI label="Today" value={formatNaira(getFacilityRevenue(primaryFacility.id))} />
        <KPI label="Avg Booking" value={formatNaira(Math.round(totalRevenue / (ownedFacilities.length * 60)))} />
        <KPI label="Facilities" value={ownedFacilities.length} />
      </div>

      {/* Revenue chart */}
      <Card className="p-5 mb-6">
        <SectionHeader title="Revenue Trend" subtitle="Last 7 days" />
        <div className="mt-4">
          <LineChart data={revenueData} formatValue={(v) => `₦${(v / 1000).toFixed(0)}k`} height={250} />
        </div>
      </Card>

      {/* Recent transactions */}
      <Card className="p-5">
        <SectionHeader title="Recent Transactions" subtitle={`${primaryFacility.name}`} />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                <th className="pb-2 font-medium">Reference</th>
                <th className="pb-2 font-medium">Amount</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-gray-50">
                  <td className="py-3 font-mono text-gray-700">{p.providerReference}</td>
                  <td className="py-3 font-medium text-gray-900">{formatNaira(p.amount)}</td>
                  <td className="py-3">
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">Success</span>
                  </td>
                  <td className="py-3 text-right text-gray-500">
                    {new Date(p.paidAt || '').toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </OwnerLayout>
  );
}
