import { useState } from 'react';
import { useStore } from '@/store/StoreContext';
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { Button, Card } from '@/components/ui';
import { HelpCircle, ShieldAlert, CreditCard, MapPin, Clock } from 'lucide-react';

const faqs = [
  { q: 'How do I reserve parking?', a: 'Search for a location, select a facility, choose your arrival time and duration, then confirm your booking.' },
  { q: 'Can I extend my parking session?', a: 'Yes, tap "Extend Parking" in your active session. Extensions are possible if the bay has no future reservations.' },
  { q: 'What happens if I\'m late?', a: 'You\'ll receive warnings at 30, 15, and 5 minutes before your session ends. If you overstay, an attendant will assist you.' },
  { q: 'How do I check out?', a: 'Tap "Check Out" in your active session. The bay enters a 15-minute turnover period before becoming available again.' },
];

export function CustomerHelp() {
  const { addIncident, currentUser } = useStore();
  const [showReport, setShowReport] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [description, setDescription] = useState('');

  const handleReport = () => {
    if (!currentUser || !description) return;
    addIncident({
      facilityId: 'fac-vi-business',
      reservationId: null,
      vehicleId: null,
      reportedBy: currentUser.id,
      type: 'customer_dispute',
      description,
      severity: 'medium',
    });
    setReportSent(true);
    setDescription('');
    setTimeout(() => { setShowReport(false); setReportSent(false); }, 2000);
  };

  return (
    <CustomerLayout showBack title="Help & Support">
      {/* Quick actions */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <Card className="p-4 text-center">
          <Clock className="mx-auto h-6 w-6 text-gray-400" />
          <p className="mt-2 text-sm font-medium text-gray-700">Operating Hours</p>
          <p className="text-xs text-gray-500">24/7 support available</p>
        </Card>
        <Card className="p-4 text-center">
          <CreditCard className="mx-auto h-6 w-6 text-gray-400" />
          <p className="mt-2 text-sm font-medium text-gray-700">Payment Issues</p>
          <p className="text-xs text-gray-500">Contact support</p>
        </Card>
      </div>

      {/* Report incident */}
      <Card className="mb-6 p-5">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold text-gray-900">Report an Incident</h3>
        </div>
        {reportSent ? (
          <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Report submitted. Our team will look into it.</p>
        ) : showReport ? (
          <div className="mt-3">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue..."
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            />
            <div className="mt-3 flex gap-2">
              <Button variant="secondary" onClick={() => setShowReport(false)}>Cancel</Button>
              <Button fullWidth onClick={handleReport} disabled={!description}>Submit Report</Button>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-500">Experiencing an issue? Report it and our team will assist.</p>
        )}
        {!showReport && !reportSent && (
          <Button variant="secondary" fullWidth className="mt-3" onClick={() => setShowReport(true)}>
            Report Issue
          </Button>
        )}
      </Card>

      {/* FAQs */}
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Frequently Asked Questions</h3>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start gap-2">
              <HelpCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 text-sm">{faq.q}</p>
                <p className="mt-1 text-sm text-gray-600">{faq.a}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </CustomerLayout>
  );
}
