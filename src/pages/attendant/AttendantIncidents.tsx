import { useState } from 'react';
import { useStore } from '@/store/StoreContext';
import { AttendantLayout } from '@/layouts/AttendantLayout';
import { Button } from '@/components/ui';
import { timeAgo } from '@/lib/status';
import { incidentSeverityConfig, incidentStatusConfig } from '@/lib/status';
import { Plus, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { IncidentType, IncidentSeverity } from '@/types';

const incidentTypes: { value: IncidentType; label: string }[] = [
  { value: 'vehicle_damage', label: 'Vehicle Damage' },
  { value: 'customer_dispute', label: 'Customer Dispute' },
  { value: 'security_issue', label: 'Security Issue' },
  { value: 'unauthorized_vehicle', label: 'Unauthorized Vehicle' },
  { value: 'blocked_bay', label: 'Blocked Bay' },
  { value: 'facility_damage', label: 'Facility Damage' },
  { value: 'payment_issue', label: 'Payment Issue' },
  { value: 'technical_issue', label: 'Technical Issue' },
];

const severityLevels: { value: IncidentSeverity; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export function AttendantIncidents() {
  const { currentUser, getIncidentsByFacility, getFacilityById, addIncident, resolveIncident, getUserById } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<IncidentType>('vehicle_damage');
  const [severity, setSeverity] = useState<IncidentSeverity>('medium');
  const [description, setDescription] = useState('');

  const facilityId = currentUser?.facilityId;
  if (!facilityId) return null;

  const facility = getFacilityById(facilityId);
  const incidents = getIncidentsByFacility(facilityId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleSubmit = () => {
    if (!currentUser || !description) return;
    addIncident({
      facilityId,
      reservationId: null,
      vehicleId: null,
      reportedBy: currentUser.id,
      type,
      description,
      severity,
    });
    setShowForm(false);
    setDescription('');
    setType('vehicle_damage');
    setSeverity('medium');
  };

  return (
    <AttendantLayout title="Incidents">
      <div className="mb-4">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Report Incident
        </Button>
      </div>

      {/* Incident list */}
      {incidents.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 py-12 text-center">
          <ShieldAlert className="mx-auto h-8 w-8 text-gray-700" />
          <p className="mt-2 text-sm text-gray-500">No incidents reported</p>
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map((inc) => {
            const sevCfg = incidentSeverityConfig[inc.severity];
            const statCfg = incidentStatusConfig[inc.status];
            const reporter = getUserById(inc.reportedBy);

            return (
              <div key={inc.id} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white capitalize">
                        {inc.type.replace(/_/g, ' ')}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sevCfg.bg} ${sevCfg.text}`}>
                        {sevCfg.label}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-400">{inc.description}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                      <span>By {reporter?.name || 'Unknown'}</span>
                      <span>·</span>
                      <span>{timeAgo(inc.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statCfg.bg} ${statCfg.text}`}>
                      {statCfg.label}
                    </span>
                    {inc.status !== 'resolved' && (
                      <button
                        onClick={() => resolveIncident(inc.id)}
                        className="text-xs text-emerald-400 hover:underline"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Report form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Report Incident</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-300">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as IncidentType)}
                  className="mt-1.5 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  {incidentTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Severity</label>
                <div className="mt-1.5 grid grid-cols-4 gap-2">
                  {severityLevels.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSeverity(s.value)}
                      className={`rounded-lg border py-2 text-xs font-medium ${
                        severity === s.value ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-gray-700 text-gray-400'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what happened..."
                  rows={3}
                  className="mt-1.5 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setShowForm(false)}>Cancel</Button>
              <Button fullWidth onClick={handleSubmit} disabled={!description}>Submit</Button>
            </div>
          </div>
        </div>
      )}
    </AttendantLayout>
  );
}
