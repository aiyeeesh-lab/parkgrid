import { type ReactNode, useState } from 'react';
import { useStore } from '@/store/StoreContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Car, Bell, Car as CarIcon, User, HelpCircle, LogOut, Home, Search, Calendar, ChevronLeft } from 'lucide-react';

interface CustomerLayoutProps {
  children: ReactNode;
  showBack?: boolean;
  title?: string;
}

export function CustomerLayout({ children, showBack = false, title }: CustomerLayoutProps) {
  const { currentUser, logout, getUnreadNotifications } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const unread = currentUser ? getUnreadNotifications(currentUser.id) : [];

  const navItems = [
    { path: '/customer', label: 'Home', icon: Home },
    { path: '/customer/search', label: 'Search', icon: Search },
    { path: '/customer/bookings', label: 'Bookings', icon: Calendar },
    { path: '/customer/notifications', label: 'Alerts', icon: Bell, badge: unread.length },
    { path: '/customer/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            {showBack ? (
              <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white">
                <Car className="h-5 w-5" />
              </div>
            )}
            <span className="font-semibold text-gray-900">{title || 'PARKGRID'}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/customer/notifications" className="relative p-1.5 rounded-lg hover:bg-gray-100">
              <Bell className="h-5 w-5 text-gray-600" />
              {unread.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unread.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="p-1.5 rounded-lg hover:bg-gray-100"
              title="Switch role"
            >
              <LogOut className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-4 py-6 pb-24">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-around px-4 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex flex-1 flex-col items-center gap-0.5 py-1.5 text-xs transition-colors ${
                  isActive(item.path) ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
                {item.badge ? (
                  <span className="absolute top-0 right-1/4 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
