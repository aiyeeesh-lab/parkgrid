import { useStore } from '@/store/StoreContext';
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { Card, EmptyState } from '@/components/ui';
import { Car, Plus } from 'lucide-react';

export function CustomerVehicles() {
  const { currentUser, vehicles } = useStore();
  if (!currentUser) return null;

  const userVehicles = vehicles.filter((v) => v.userId === currentUser.id);

  return (
    <CustomerLayout showBack title="My Vehicles">
      <div className="mb-4">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">
          <Plus className="h-4 w-4" />
          Add Vehicle
        </button>
      </div>

      {userVehicles.length === 0 ? (
        <EmptyState icon={<Car className="h-12 w-12" />} title="No vehicles" description="Add a vehicle to start booking parking." />
      ) : (
        <div className="space-y-3">
          {userVehicles.map((v) => (
            <Card key={v.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                  <Car className="h-6 w-6 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{v.make} {v.model}</p>
                  <p className="text-sm text-gray-500">{v.color}</p>
                </div>
                <div className="rounded-lg bg-gray-100 px-3 py-1.5">
                  <span className="font-mono text-sm font-medium text-gray-700">{v.licensePlate}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </CustomerLayout>
  );
}
