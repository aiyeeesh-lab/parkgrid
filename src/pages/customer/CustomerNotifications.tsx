import { useStore } from '@/store/StoreContext';
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { EmptyState } from '@/components/ui';
import { Bell, Check } from 'lucide-react';
import { timeAgo } from '@/lib/status';

export function CustomerNotifications() {
  const { currentUser, getNotificationsByUser, markNotificationRead } = useStore();
  if (!currentUser) return null;

  const notifications = getNotificationsByUser(currentUser.id).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <CustomerLayout showBack title="Notifications">
      {notifications.length === 0 ? (
        <EmptyState icon={<Bell className="h-12 w-12" />} title="No notifications" description="You'll see parking updates here." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl border p-4 transition-all ${
                n.read ? 'border-gray-200 bg-white' : 'border-gray-200 bg-blue-50/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                  <p className="mt-1.5 text-xs text-gray-400">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <button
                    onClick={() => markNotificationRead(n.id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </CustomerLayout>
  );
}
