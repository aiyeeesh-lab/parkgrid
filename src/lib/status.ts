import type { BayStatus, ReservationStatus, SessionStatus, IncidentSeverity, IncidentStatus } from '@/types';

// ========== STATUS COLORS ==========

export const bayStatusConfig: Record<BayStatus, {
  label: string;
  bg: string;
  text: string;
  dot: string;
  border: string;
  solidBg: string;
  solidText: string;
}> = {
  AVAILABLE: {
    label: 'Available',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    border: 'border-emerald-200',
    solidBg: 'bg-emerald-500',
    solidText: 'text-white',
  },
  RESERVED: {
    label: 'Reserved',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    border: 'border-blue-200',
    solidBg: 'bg-blue-500',
    solidText: 'text-white',
  },
  ACTIVE: {
    label: 'Active',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    border: 'border-amber-200',
    solidBg: 'bg-amber-500',
    solidText: 'text-white',
  },
  TURNOVER: {
    label: 'Turnover',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
    border: 'border-orange-200',
    solidBg: 'bg-orange-500',
    solidText: 'text-white',
  },
  MAINTENANCE: {
    label: 'Maintenance',
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
    border: 'border-red-200',
    solidBg: 'bg-red-500',
    solidText: 'text-white',
  },
};

export const reservationStatusConfig: Record<ReservationStatus, {
  label: string;
  bg: string;
  text: string;
  dot: string;
}> = {
  PENDING: { label: 'Pending', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  CONFIRMED: { label: 'Confirmed', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  CHECKED_IN: { label: 'Checked In', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  COMPLETED: { label: 'Completed', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  NO_SHOW: { label: 'No Show', bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  EXPIRED: { label: 'Expired', bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
};

export const sessionStatusConfig: Record<SessionStatus, {
  label: string;
  bg: string;
  text: string;
  dot: string;
}> = {
  ACTIVE: { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  EXTENSION_PENDING: { label: 'Extension Pending', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  EXTENDED: { label: 'Extended', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  COMPLETED: { label: 'Completed', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  OVERSTAY: { label: 'Overstay', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

export const incidentSeverityConfig: Record<IncidentSeverity, {
  label: string;
  bg: string;
  text: string;
  dot: string;
}> = {
  low: { label: 'Low', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  medium: { label: 'Medium', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  high: { label: 'High', bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  critical: { label: 'Critical', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

export const incidentStatusConfig: Record<IncidentStatus, {
  label: string;
  bg: string;
  text: string;
  dot: string;
}> = {
  open: { label: 'Open', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  investigating: { label: 'Investigating', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  resolved: { label: 'Resolved', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

// ========== FORMATTERS ==========

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)}, ${formatTime(iso)}`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getTimeRemaining(endTimeISO: string): { minutes: number; hours: number; totalMinutes: number; isPast: boolean } {
  const diff = new Date(endTimeISO).getTime() - Date.now();
  const totalMinutes = Math.floor(diff / 60000);
  return {
    minutes: totalMinutes % 60,
    hours: Math.floor(totalMinutes / 60),
    totalMinutes,
    isPast: totalMinutes < 0,
  };
}
