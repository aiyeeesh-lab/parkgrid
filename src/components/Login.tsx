import { useStore } from '@/store/StoreContext';
import { Car, Shield, Building2, Users, Briefcase, ArrowRight } from 'lucide-react';
import type { Role } from '@/types';

const demoAccounts: { email: string; role: Role; name: string; description: string; icon: typeof Car; color: string }[] = [
  {
    email: 'customer@parkgrid.demo',
    role: 'customer',
    name: 'Customer',
    description: 'Find, reserve, and pay for parking across Lagos',
    icon: Car,
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    email: 'attendant@parkgrid.demo',
    role: 'attendant',
    name: 'Attendant',
    description: 'Verify bookings, check in vehicles, manage bays',
    icon: Shield,
    color: 'text-blue-600 bg-blue-50',
  },
  {
    email: 'owner@parkgrid.demo',
    role: 'owner',
    name: 'Owner / Operator',
    description: 'Monitor occupancy, revenue, and facility performance',
    icon: Building2,
    color: 'text-teal-600 bg-teal-50',
  },
  {
    email: 'admin@parkgrid.demo',
    role: 'admin',
    name: 'Admin',
    description: 'Oversee the entire PARKGRID network',
    icon: Users,
    color: 'text-gray-700 bg-gray-100',
  },
  {
    email: 'corporate@parkgrid.demo',
    role: 'corporate',
    name: 'Corporate',
    description: 'Manage employee parking and track spending',
    icon: Briefcase,
    color: 'text-indigo-600 bg-indigo-50',
  },
];

export function Login() {
  const { login } = useStore();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
              <Car className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">PARKGRID</span>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Premium parking infrastructure for Lagos
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Know where you'll park before you leave.
          </p>
        </div>

        {/* Demo Mode Banner */}
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
          <p className="text-sm font-medium text-amber-800">
            Prototype Demo Mode — Select a role to explore PARKGRID
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid gap-3 sm:grid-cols-2">
          {demoAccounts.map((acc) => {
            const Icon = acc.icon;
            return (
              <button
                key={acc.email}
                onClick={() => login(acc.email)}
                className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 text-left transition-all hover:border-gray-300 hover:shadow-md"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${acc.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{acc.name}</h3>
                  <p className="text-sm text-gray-500">{acc.description}</p>
                  <p className="mt-1 font-mono text-xs text-gray-400">{acc.email}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-gray-600" />
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          All data is simulated. Prototype facilities are fictional.
        </p>
      </div>
    </div>
  );
}
