import { type ReactNode } from 'react';
import { useStore } from '@/store/StoreContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Car, LayoutDashboard, Network, Building2, Users, CreditCard, ShieldAlert, Settings, LogOut } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/network', label: 'Network', icon: Network },
    { path: '/admin/facilities', label: 'Facilities', icon: Building2 },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/transactions', label: 'Transactions', icon: CreditCard },
    { path: '/admin/incidents', label: 'Incidents', icon: ShieldAlert },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white">
              <Car className="h-5 w-5" />
            </div>
            <span className="font-semibold text-gray-900">PARKGRID</span>
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{currentUser?.name}</span>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
              title="Switch role"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden md:block w-56 border-r border-gray-200 p-4 min-h-[calc(100vh-57px)]">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(item.path) ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
          {title && <h1 className="mb-6 text-xl font-semibold text-gray-900">{title}</h1>}
          {children}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 text-xs ${
                  isActive(item.path) ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
