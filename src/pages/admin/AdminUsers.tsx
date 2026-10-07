import { useState } from 'react';
import { useStore } from '@/store/StoreContext';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, EmptyState } from '@/components/ui';
import { formatDate, timeAgo } from '@/lib/status';
import { Search, Users } from 'lucide-react';
import type { Role } from '@/types';

const roleLabels: Record<Role, string> = {
  customer: 'Customer',
  attendant: 'Attendant',
  owner: 'Owner',
  admin: 'Admin',
  corporate: 'Corporate',
};

const roleColors: Record<Role, string> = {
  customer: 'bg-emerald-50 text-emerald-700',
  attendant: 'bg-blue-50 text-blue-700',
  owner: 'bg-teal-50 text-teal-700',
  admin: 'bg-gray-100 text-gray-700',
  corporate: 'bg-indigo-50 text-indigo-700',
};

export function AdminUsers() {
  const { users } = useStore();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');

  const filtered = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (query) {
      return u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase());
    }
    return true;
  });

  return (
    <AdminLayout title="Users">
      {/* Stats */}
      <div className="mb-5 grid grid-cols-5 gap-3">
        {(['customer', 'attendant', 'owner', 'admin', 'corporate'] as Role[]).map((role) => (
          <div key={role} className="rounded-xl border border-gray-200 bg-white p-3 text-center">
            <p className="text-xl font-bold text-gray-900">{users.filter((u) => u.role === role).length}</p>
            <p className="text-xs text-gray-500">{roleLabels[role]}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm focus:border-gray-400 focus:outline-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as Role | 'all')}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-gray-400 focus:outline-none"
        >
          <option value="all">All Roles</option>
          <option value="customer">Customer</option>
          <option value="attendant">Attendant</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="corporate">Corporate</option>
        </select>
      </div>

      {/* User table */}
      {filtered.length === 0 ? (
        <EmptyState icon={<Users className="h-12 w-12" />} title="No users found" />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${roleColors[u.role]}`}>
                      {roleLabels[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">{timeAgo(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </AdminLayout>
  );
}
