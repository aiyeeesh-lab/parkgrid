import { useStore } from '@/store/StoreContext';
import { CorporateLayout } from '@/layouts/CorporateLayout';
import { FacilityCard } from '@/components/FacilityCard';
import { KPI, Card, SectionHeader } from '@/components/ui';
import { formatNaira } from '@/lib/status';
import { MapPin } from 'lucide-react';

export function CorporateLocations() {
  const { facilities, getAvailableBayCount, reservations } = useStore();

  // Count bookings per facility
  const facilityStats = facilities.map((f) => {
    const bookings = reservations.filter((r) => r.facilityId === f.id).length;
    const spend = reservations.filter((r) => r.facilityId === f.id).reduce((sum, r) => sum + r.amount, 0);
    return { facility: f, bookings, spend };
  });

  return (
    <CorporateLayout title="Locations">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {facilities.map((f) => (
          <FacilityCard key={f.id} facility={f} compact />
        ))}
      </div>

      <Card className="p-5">
        <SectionHeader title="Usage by Location" />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                <th className="pb-2 font-medium">Facility</th>
                <th className="pb-2 font-medium">Location</th>
                <th className="pb-2 font-medium">Bookings</th>
                <th className="pb-2 font-medium text-right">Spending</th>
              </tr>
            </thead>
            <tbody>
              {facilityStats.map(({ facility: f, bookings, spend }) => (
                <tr key={f.id} className="border-b border-gray-50">
                  <td className="py-3 font-medium text-gray-900">{f.name}</td>
                  <td className="py-3 text-gray-600">{f.location}</td>
                  <td className="py-3 text-gray-600">{bookings}</td>
                  <td className="py-3 text-right font-medium text-gray-900">{formatNaira(spend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </CorporateLayout>
  );
}
