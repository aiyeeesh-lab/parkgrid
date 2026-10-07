import { useStore } from '@/store/StoreContext';
import { OwnerLayout } from '@/layouts/OwnerLayout';
import { EmptyState } from '@/components/ui';
import { incidentSeverityConfig, incidentStatusConfig, timeAgo } from '@/lib/status';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export function OwnerIncidents() {
  const { currentUser, facilities, getIncidentsByFacility, getUserById, resolveIncident } = useStore();

  const ownedFacilities = facilities.filter((f) => currentUser?.ownedFacilities?.includes(f.id));
  const allIncidents = ownedFacilities
    .flatMap((f) => getIncidentsByFacility(f.id))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const open = allIncidents.filter((i) => i.status !== 'resolved');

  return (
    <OwnerLayout title="Incidents">
      {/* Summary */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-2xl font-bold text-red-600">{open.filter((i) => i.status === 'open').length}</p>
          <p className="text-xs text-gray-500">Open</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-2xl font-bold text-amber-600">{open.filter((i) => i.status === 'investigating').length}</p>
          <p className="text-xs text-gray-500">Investigating</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-2xl font-bold text-emerald-600">{allIncidents.filter((i) => i.status === 'resolved').length}</p>
          <p className="text-xs text-gray-500">Resolved</p>
        </div>
      </div>

      {allIncidents.length === 0 ? (
        <EmptyState icon={<ShieldAlert className="h-12 w-12" />} title="No incidents" description="All clear across your facilities." />
      ) : (
        <div className="space-y-3">
          {allIncidents.map((inc) => {
            const sevCfg = incidentSeverityConfig[inc.severity];
            const statCfg = incidentStatusConfig[inc.status];
            const reporter = getUserById(inc.reportedBy);
            const facility = ownedFacilities.find((f) => f.id === inc.facilityId);

            return (
              <div key={inc.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 capitalize">{inc.type.replace(/_/g, ' ')}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sevCfg.bg} ${sevCfg.text}`}>{sevCfg.label}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{inc.description}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                      <span>{facility?.name}</span>
                      <span>·</span>
                      <span>By {reporter?.name}</span>
                      <span>·</span>
                      <span>{timeAgo(inc.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statCfg.bg} ${statCfg.text}`}>{statCfg.label}</span>
                    {inc.status !== 'resolved' && (
                      <button onClick={() => resolveIncident(inc.id)} className="text-xs text-teal-600 hover:underline">
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </OwnerLayout>
  );
}
