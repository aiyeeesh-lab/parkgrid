import { useState } from 'react';
import { useStore } from '@/store/StoreContext';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, KPI, EmptyState } from '@/components/ui';
import { formatNaira, formatDate } from '@/lib/status';
import { Search, CreditCard, TrendingUp } from 'lucide-react';

export function AdminTransactions() {
  const { payments, reservations, getFacilityById } = useStore();
  const [query, setQuery] = useState('');

  const enriched = payments.map((p) => {
    const r = reservations.find((r) => r.id === p.reservationId);
    const facility = r ? getFacilityById(r.facilityId) : null;
    return { ...p, reservation: r, facility };
  }).sort((a, b) => new Date(b.paidAt || '').getTime() - new Date(a.paidAt || '').getTime());

  const filtered = enriched.filter((p) => {
    if (!query) return true;
    return p.providerReference.toLowerCase().includes(query.toLowerCase()) ||
      p.reservation?.bookingNumber.toLowerCase().includes(query.toLowerCase());
  });

  const total = payments.reduce((sum, p) => sum + p.amount, 0);
  const successCount = payments.filter((p) => p.status === 'SUCCESS').length;

  return (
    <AdminLayout title="Transactions">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <KPI label="Total Revenue" value={formatNaira(total)} accent="text-emerald-600" icon={<TrendingUp className="h-6 w-6" />} />
        <KPI label="Transactions" value={payments.length} icon={<CreditCard className="h-6 w-6" />} />
        <KPI label="Successful" value={successCount} accent="text-emerald-600" />
        <KPI label="Avg Transaction" value={formatNaira(Math.round(total / (payments.length || 1)))} />
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by reference or booking number..."
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm focus:border-gray-400 focus:outline-none"
        />
      </div>

      {/* Transactions table */}
      {filtered.length === 0 ? (
        <EmptyState icon={<CreditCard className="h-12 w-12" />} title="No transactions found" />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Booking</th>
                <th className="px-4 py-3 font-medium">Facility</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-700">{p.providerReference}</td>
                  <td className="px-4 py-3 font-mono text-gray-700">{p.reservation?.bookingNumber || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.facility?.name || '—'}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatNaira(p.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {p.paidAt ? formatDate(p.paidAt) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </AdminLayout>
  );
}
