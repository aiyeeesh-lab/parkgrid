import { useStore } from '@/store/StoreContext';
import { CorporateLayout } from '@/layouts/CorporateLayout';
import { Card, EmptyState } from '@/components/ui';
import { formatNaira, timeAgo } from '@/lib/status';
import { Users, Mail, Phone, Car } from 'lucide-react';

export function CorporateEmployees() {
  const { users, vehicles, reservations } = useStore();

  const employees = users.filter((u) => u.role === 'customer');

  return (
    <CorporateLayout title="Employees">
      {employees.length === 0 ? (
        <EmptyState icon={<Users className="h-12 w-12" />} title="No employees" description="Add employees to manage their parking." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {employees.map((emp) => {
            const vehicle = vehicles.find((v) => v.userId === emp.id);
            const empBookings = reservations.filter((r) => r.customerId === emp.id);
            const empSpend = empBookings.reduce((sum, r) => sum + r.amount, 0);

            return (
              <Card key={emp.id} className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                    <span className="font-semibold text-indigo-700">{emp.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{emp.name}</p>
                    <p className="text-xs text-gray-500">{emp.email}</p>
                  </div>
                </div>

                {vehicle && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <Car className="h-4 w-4 text-gray-400" />
                    {vehicle.make} {vehicle.model}
                    <span className="font-mono text-xs text-gray-400">{vehicle.licensePlate}</span>
                  </div>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                  <div>
                    <p className="text-xs text-gray-500">Bookings</p>
                    <p className="text-sm font-medium text-gray-900">{empBookings.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Spending</p>
                    <p className="text-sm font-medium text-gray-900">{formatNaira(empSpend)}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </CorporateLayout>
  );
}
