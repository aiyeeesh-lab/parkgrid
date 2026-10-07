import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/StoreContext';
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { Button, Card, EmptyState } from '@/components/ui';
import { QRCodeCard } from '@/components/QRCodeCard';
import {
  formatNaira, formatTime, formatDate, formatDuration, getTimeRemaining,
} from '@/lib/status';
import { MapPin, Clock, Car, Plus, HelpCircle, Check, Navigation, FileText, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

export function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getReservationById, getFacilityById, getBayById, getVehicleById, getActiveSessionByReservation } = useStore();
  const reservation = id ? getReservationById(id) : undefined;

  if (!reservation) {
    return (
      <CustomerLayout showBack title="Booking">
        <EmptyState title="Booking not found" />
      </CustomerLayout>
    );
  }

  const facility = getFacilityById(reservation.facilityId);
  const bay = getBayById(reservation.bayId);
  const vehicle = getVehicleById(reservation.vehicleId);
  const session = getActiveSessionByReservation(reservation.id);

  const isCheckedIn = reservation.status === 'CHECKED_IN';

  return (
    <CustomerLayout showBack title={reservation.bookingNumber}>
      <div className="mb-6 text-center">
        <p className="text-sm text-gray-500">{facility?.name}</p>
        <p className="mt-1 text-xs text-gray-400">{formatDate(reservation.createdAt)}</p>
      </div>

      <Card className="mb-4 p-5">
        <div className="flex justify-center">
          <QRCodeCard value={reservation.bookingNumber} size={140} />
        </div>

        <div className="mt-5 space-y-3">
          <DetailRow icon={MapPin} label="Facility" value={facility?.name || ''} />
          <DetailRow icon={MapPin} label="Bay" value={bay?.bayNumber || ''} />
          <DetailRow icon={Clock} label="Time" value={`${formatTime(reservation.startTime)} — ${formatTime(reservation.endTime)}`} />
          <DetailRow icon={Car} label="Vehicle" value={`${vehicle?.make} ${vehicle?.model} · ${vehicle?.licensePlate}`} />
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="text-sm text-gray-500">Amount</span>
            <span className="font-bold text-gray-900">{formatNaira(reservation.amount)}</span>
          </div>
        </div>
      </Card>

      {/* Active session info */}
      {session && isCheckedIn && (
        <Card className="mb-4 border-amber-200 p-5">
          <p className="text-sm font-medium text-amber-700">Active Session</p>
          <p className="mt-1 text-xs text-gray-500">Checked in at {formatTime(session.checkInAt)}</p>
          <Button fullWidth className="mt-4" onClick={() => navigate(`/customer/session/${reservation.id}`)}>
            View Active Session
          </Button>
        </Card>
      )}

      {/* Actions for confirmed reservation */}
      {reservation.status === 'CONFIRMED' && (
        <div className="space-y-3">
          <Button fullWidth size="lg" onClick={() => navigate(`/customer/navigation/${reservation.id}`)}>
            <Navigation className="mr-2 h-4 w-4" />
            Navigate to Parking
          </Button>
        </div>
      )}

      {/* Completed */}
      {reservation.status === 'COMPLETED' && (
        <Card className="p-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-6 w-6 text-emerald-600" />
          </div>
          <p className="font-medium text-gray-900">Parking Completed</p>
          <p className="mt-1 text-sm text-gray-500">
            {formatDuration(Math.round((new Date(reservation.endTime).getTime() - new Date(reservation.startTime).getTime()) / 60000))} at {facility?.name}
          </p>
          <Button variant="secondary" fullWidth className="mt-4">
            <FileText className="mr-2 h-4 w-4" />
            View Receipt
          </Button>
        </Card>
      )}
    </CustomerLayout>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-gray-500">
        <Icon className="h-4 w-4 text-gray-400" />
        {label}
      </span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}
