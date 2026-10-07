// ========== USER ROLES ==========
export type Role = 'customer' | 'attendant' | 'owner' | 'admin' | 'corporate';

export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatar: string | null;
  status: UserStatus;
  createdAt: string;
  // Attendant-specific
  facilityId?: string;
  // Owner-specific
  ownedFacilities?: string[];
  // Corporate-specific
  organizationId?: string;
  organizationName?: string;
}

// ========== VEHICLE ==========
export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  color: string;
  licensePlate: string;
}

// ========== FACILITY ==========
export type SupplyModel = 'OWNED' | 'OPERATED' | 'PARTNER';
export type FacilityStatus = 'OPERATIONAL' | 'MAINTENANCE' | 'CLOSED';

export interface Facility {
  id: string;
  name: string;
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  status: FacilityStatus;
  supplyModel: SupplyModel;
  openingTime: string;
  closingTime: string;
  turnoverMinutes: number;
  securityFeatures: string[];
  image: string | null;
  pricePerHour: number;
  description: string;
}

// ========== PARKING BAY ==========
export type BayStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'ACTIVE'
  | 'TURNOVER'
  | 'MAINTENANCE';

export interface ParkingBay {
  id: string;
  facilityId: string;
  bayNumber: string;
  level: number;
  zone: string;
  status: BayStatus;
}

// ========== RESERVATION ==========
export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'EXPIRED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface Reservation {
  id: string;
  bookingNumber: string;
  customerId: string;
  vehicleId: string;
  facilityId: string;
  bayId: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  amount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

// ========== PARKING SESSION ==========
export type SessionStatus =
  | 'ACTIVE'
  | 'EXTENSION_PENDING'
  | 'EXTENDED'
  | 'COMPLETED'
  | 'OVERSTAY';

export interface ParkingSession {
  id: string;
  reservationId: string;
  checkInAt: string;
  scheduledEndAt: string;
  actualEndAt: string | null;
  status: SessionStatus;
  extensions: { amount: number; requestedAt: string }[];
}

// ========== PAYMENT ==========
export type PaymentStatusType = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface Payment {
  id: string;
  reservationId: string;
  amount: number;
  status: PaymentStatusType;
  providerReference: string;
  paidAt: string | null;
}

// ========== INCIDENT ==========
export type IncidentType =
  | 'vehicle_damage'
  | 'customer_dispute'
  | 'security_issue'
  | 'unauthorized_vehicle'
  | 'blocked_bay'
  | 'facility_damage'
  | 'payment_issue'
  | 'technical_issue';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'resolved';

export interface Incident {
  id: string;
  facilityId: string;
  reservationId: string | null;
  vehicleId: string | null;
  reportedBy: string;
  type: IncidentType;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdAt: string;
  resolvedAt: string | null;
}

// ========== VEHICLE CONDITION ==========
export interface VehicleConditionRecord {
  id: string;
  sessionId: string;
  type: 'CHECK_IN' | 'CHECK_OUT';
  notes: string;
  createdAt: string;
}

// ========== NOTIFICATION ==========
export type NotificationType =
  | 'reservation_confirmed'
  | 'check_in_complete'
  | 'expiration_warning'
  | 'extension_confirmed'
  | 'checkout_complete'
  | 'incident_update'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ========== ORGANIZATION (Corporate) ==========
export interface Organization {
  id: string;
  name: string;
  employeeCount: number;
  monthlyBudget: number;
  createdAt: string;
}
