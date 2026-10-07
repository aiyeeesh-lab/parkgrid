import { useStore } from '@/store/StoreContext';
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { Button, Card } from '@/components/ui';
import { User, Car, Bell, HelpCircle, LogOut, ChevronRight, Mail, Phone, Calendar, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CustomerProfile() {
  const { currentUser, logout, getVehicleByUser, getReservationsByCustomer } = useStore();
  const navigate = useNavigate();

  if (!currentUser) return null;
  const vehicle = getVehicleByUser(currentUser.id);
  const bookings = getReservationsByCustomer(currentUser.id);
  const completed = bookings.filter((r) => r.status === 'COMPLETED').length;

  return (
    <CustomerLayout title="Profile">
      {/* User card */}
      <Card className="mb-4 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white">
            <User className="h-7 w-7" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{currentUser.name}</h2>
            <p className="text-sm text-gray-500">{currentUser.email}</p>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
          <p className="text-sm text-gray-500">Total Bookings</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-gray-900">{completed}</p>
          <p className="text-sm text-gray-500">Completed Sessions</p>
        </Card>
      </div>

      {/* Vehicle */}
      <Card className="mb-4 divide-y divide-gray-100">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-700">My Vehicle</h3>
        </div>
        {vehicle ? (
          <div className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <Car className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{vehicle.make} {vehicle.model}</p>
              <p className="text-sm text-gray-500">{vehicle.color} · <span className="font-mono">{vehicle.licensePlate}</span></p>
            </div>
          </div>
        ) : (
          <p className="p-4 text-sm text-gray-500">No vehicle registered.</p>
        )}
      </Card>

      {/* Menu */}
      <Card className="divide-y divide-gray-100">
        <MenuItem icon={Car} label="Manage Vehicles" onClick={() => navigate('/customer/vehicles')} />
        <MenuItem icon={Bell} label="Notifications" onClick={() => navigate('/customer/notifications')} />
        <MenuItem icon={HelpCircle} label="Help & Support" onClick={() => navigate('/customer/help')} />
      </Card>

      <Button
        variant="ghost"
        fullWidth
        className="mt-4 text-red-600 hover:bg-red-50"
        onClick={() => { logout(); navigate('/'); }}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Switch Role
      </Button>
    </CustomerLayout>
  );
}

function MenuItem({ icon: Icon, label, onClick }: { icon: typeof User; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between p-4 hover:bg-gray-50">
      <span className="flex items-center gap-3 text-sm font-medium text-gray-700">
        <Icon className="h-5 w-5 text-gray-400" />
        {label}
      </span>
      <ChevronRight className="h-4 w-4 text-gray-300" />
    </button>
  );
}
