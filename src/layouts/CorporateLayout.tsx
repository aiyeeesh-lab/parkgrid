import { type ReactNode } from 'react';
import { useStore } from '@/store/StoreContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Car, LayoutDashboard, Calendar, Users, MapPin, TrendingDown, FileBarChart, LogOut } from 'lucide-react';

interface CorporateLayoutProps {
  children: ReactNode;
  title?: string;
}

export function CorporateLayout({ children, title }: CorporateLayoutProps) {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/corporate', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/corporate/bookings', label: 'Bookings', icon: Calendar },
    { path: '/corporate/employees', label: 'Employees', icon: Users },
    { path: '/corporate/locations', label: 'Locations', icon: MapPin },
    { path: '/corporate/spending', label: 'Spending', icon: TrendingDown },
    { path: '/corporate/reports', label: 'Reports', icon: FileBarChart },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Car className="h-5 w-5" />
            </div>
            <span className="font-semibold text-gray-900">PARKGRID</span>
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">Corporate</span>
            {currentUser?.organizationName && (
              <span className="ml-2 hidden text-sm text-gray-500 sm:inline">{currentUser.organizationName}</span>
            )}
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
                    isActive(item.path) ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
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
                  isActive(item.path) ? 'text-indigo-600' : 'text-gray-400'
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
