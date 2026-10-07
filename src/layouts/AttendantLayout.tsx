import { type ReactNode } from 'react';
import { useStore } from '@/store/StoreContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Car, LayoutDashboard, CalendarCheck, Grid3x3, Clock, ShieldAlert, LogOut } from 'lucide-react';

interface AttendantLayoutProps {
  children: ReactNode;
  title?: string;
}

export function AttendantLayout({ children, title }: AttendantLayoutProps) {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const facilityId = currentUser?.facilityId;

  const navItems = [
    { path: '/attendant', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/attendant/arrivals', label: 'Arrivals', icon: CalendarCheck },
    { path: '/attendant/parking', label: 'Parking', icon: Grid3x3 },
    { path: '/attendant/sessions', label: 'Sessions', icon: Clock },
    { path: '/attendant/incidents', label: 'Incidents', icon: ShieldAlert },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
              <Car className="h-5 w-5" />
            </div>
            <span className="font-semibold">PARKGRID</span>
            <span className="rounded-md bg-gray-800 px-2 py-0.5 text-xs text-gray-400">Attendant</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">{currentUser?.name}</span>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800"
              title="Switch role"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 border-r border-gray-800 p-4 min-h-[calc(100vh-57px)]">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(item.path) ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
          {title && <h1 className="mb-6 text-xl font-semibold text-white">{title}</h1>}
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-800 bg-gray-900 md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 text-xs ${
                  isActive(item.path) ? 'text-emerald-400' : 'text-gray-500'
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
