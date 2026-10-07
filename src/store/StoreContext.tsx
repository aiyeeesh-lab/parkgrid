import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type {
  User,
  Vehicle,
  Facility,
  ParkingBay,
  Reservation,
  ParkingSession,
  Payment,
  Incident,
  VehicleConditionRecord,
  Notification,
  Organization,
  BayStatus,
  ReservationStatus,
  SessionStatus,
} from '@/types';
import * as seed from '@/data/seed';

export interface AuditEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  userId: string;
}

interface DataState {
  users: User[];
  vehicles: Vehicle[];
  facilities: Facility[];
  bays: ParkingBay[];
  reservations: Reservation[];
  sessions: ParkingSession[];
  payments: Payment[];
  incidents: Incident[];
  vehicleConditions: VehicleConditionRecord[];
  notifications: Notification[];
  organizations: Organization[];
  auditLog: AuditEntry[];
  currentUser: User | null;
}

interface StoreContextValue extends DataState {
  login: (email: string) => boolean;
  logout: () => void;
  switchRole: (email: string) => void;

  createReservation: (data: {
    customerId: string;
    vehicleId: string;
    facilityId: string;
    bayId: string;
    startTime: string;
    endTime: string;
    amount: number;
  }) => Reservation | null;

  checkInCustomer: (reservationId: string) => boolean;
  checkOutCustomer: (reservationId: string) => boolean;
  extendSession: (reservationId: string, additionalMinutes: number) => boolean;

  setBayStatus: (bayId: string, status: BayStatus) => void;
  resolveIncident: (incidentId: string) => void;
  addIncident: (data: Omit<Incident, 'id' | 'createdAt' | 'resolvedAt' | 'status'>) => void;
  markNotificationRead: (notificationId: string) => void;

  getAvailableBayCount: (facilityId: string) => number;
  getFacilityOccupancy: (facilityId: string) => { total: number; occupied: number; available: number };
  getFacilityById: (id: string) => Facility | undefined;
  getBayById: (id: string) => ParkingBay | undefined;
  getReservationById: (id: string) => Reservation | undefined;
  getUserById: (id: string) => User | undefined;
  getVehicleById: (id: string) => Vehicle | undefined;
  getVehicleByUser: (userId: string) => Vehicle | undefined;
  getReservationsByFacility: (facilityId: string) => Reservation[];
  getReservationsByCustomer: (customerId: string) => Reservation[];
  getActiveSessionByReservation: (reservationId: string) => ParkingSession | undefined;
  getIncidentsByFacility: (facilityId: string) => Incident[];
  getIncidentsByNetwork: () => Incident[];
  getPaymentsByFacility: (facilityId: string) => Payment[];
  getNetworkStats: () => {
    facilities: number;
    totalSpaces: number;
    occupiedSpaces: number;
    utilization: number;
    revenue: number;
  };
  getFacilityRevenue: (facilityId: string) => number;
  getUnreadNotifications: (userId: string) => Notification[];
  getNotificationsByUser: (userId: string) => Notification[];
}

const StoreContext = createContext<StoreContextValue | null>(null);

function log(action: string, details: string, userId: string): AuditEntry {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    details,
    timestamp: new Date().toISOString(),
    userId,
  };
}

let bayOverrideTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataState>(() => ({
    users: [...seed.users],
    vehicles: [...seed.vehicles],
    facilities: [...seed.facilities],
    bays: [...seed.allBays],
    reservations: [...seed.reservations],
    sessions: [...seed.sessions],
    payments: [...seed.payments],
    incidents: [...seed.incidents],
    vehicleConditions: [...seed.vehicleConditions],
    notifications: [...seed.notifications],
    organizations: [...seed.organizations],
    auditLog: [],
    currentUser: null,
  }));

  const login = useCallback((email: string): boolean => {
    const user = state.users.find((u) => u.email === email);
    if (user) {
      setState((prev) => ({
        ...prev,
        currentUser: user,
        auditLog: [...prev.auditLog, log('LOGIN', `${user.name} logged in as ${user.role}`, user.id)],
      }));
      return true;
    }
    return false;
  }, [state.users]);

  const logout = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentUser: null,
    }));
  }, []);

  const switchRole = useCallback((email: string) => {
    const user = state.users.find((u) => u.email === email);
    if (user) {
      setState((prev) => ({
        ...prev,
        currentUser: user,
      }));
    }
  }, [state.users]);

  const setBayStatus = useCallback((bayId: string, status: BayStatus) => {
    setState((prev) => ({
      ...prev,
      bays: prev.bays.map((b) => (b.id === bayId ? { ...b, status } : b)),
      auditLog: [...prev.auditLog, log('BAY_STATUS_CHANGE', `Bay ${bayId} → ${status}`, prev.currentUser?.id || 'system')],
    }));

    // Auto-transition TURNOVER → AVAILABLE after 15 minutes (simulated as 15 seconds for demo)
    if (status === 'TURNOVER') {
      const existingTimer = bayOverrideTimers.get(bayId);
      if (existingTimer) clearTimeout(existingTimer);
      const timer = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          bays: prev.bays.map((b) =>
            b.id === bayId && b.status === 'TURNOVER' ? { ...b, status: 'AVAILABLE' as BayStatus } : b
          ),
          auditLog: [...prev.auditLog, log('BAY_STATUS_CHANGE', `Bay ${bayId} → AVAILABLE (turnover complete)`, 'system')],
        }));
        bayOverrideTimers.delete(bayId);
      }, 15000);
      bayOverrideTimers.set(bayId, timer);
    }
  }, []);

  const createReservation = useCallback(
    (data: {
      customerId: string;
      vehicleId: string;
      facilityId: string;
      bayId: string;
      startTime: string;
      endTime: string;
      amount: number;
    }): Reservation | null => {
      let created: Reservation | null = null;

      setState((prev) => {
        // Check bay is available
        const bay = prev.bays.find((b) => b.id === data.bayId);
        if (!bay || (bay.status !== 'AVAILABLE' && bay.status !== 'TURNOVER')) {
          return prev;
        }

        // Check for conflicts
        const hasConflict = prev.reservations.some(
          (r) =>
            r.bayId === data.bayId &&
            r.status !== 'CANCELLED' &&
            r.status !== 'COMPLETED' &&
            r.status !== 'EXPIRED' &&
            new Date(r.startTime) < new Date(data.endTime) &&
            new Date(r.endTime) > new Date(data.startTime)
        );
        if (hasConflict) return prev;

        const bookingNumber = `PG-${Math.floor(Math.random() * 90000) + 10000}`;
        const reservation: Reservation = {
          id: `res-${Date.now()}`,
          bookingNumber,
          customerId: data.customerId,
          vehicleId: data.vehicleId,
          facilityId: data.facilityId,
          bayId: data.bayId,
          startTime: data.startTime,
          endTime: data.endTime,
          status: 'CONFIRMED',
          amount: data.amount,
          paymentStatus: 'PAID',
          createdAt: new Date().toISOString(),
        };

        const payment: Payment = {
          id: `pay-${Date.now()}`,
          reservationId: reservation.id,
          amount: data.amount,
          status: 'SUCCESS',
          providerReference: `PGW-${Math.floor(Math.random() * 9000000) + 1000000}`,
          paidAt: new Date().toISOString(),
        };

        created = reservation;

        return {
          ...prev,
          reservations: [...prev.reservations, reservation],
          payments: [...prev.payments, payment],
          bays: prev.bays.map((b) =>
            b.id === data.bayId ? { ...b, status: 'RESERVED' as BayStatus } : b
          ),
          notifications: [
            {
              id: `ntf-${Date.now()}`,
              userId: data.customerId,
              type: 'reservation_confirmed' as const,
              title: 'Parking Confirmed',
              message: `Your booking ${bookingNumber} has been confirmed.`,
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...prev.notifications,
          ],
          auditLog: [
            ...prev.auditLog,
            log('RESERVATION_CREATED', `Booking ${bookingNumber} created for bay ${bay.bayNumber}`, data.customerId),
          ],
        };
      });

      return created;
    },
    []
  );

  const checkInCustomer = useCallback((reservationId: string): boolean => {
    let success = false;
    setState((prev) => {
      const reservation = prev.reservations.find((r) => r.id === reservationId);
      if (!reservation || reservation.status !== 'CONFIRMED') return prev;

      const bay = prev.bays.find((b) => b.id === reservation.bayId);
      if (!bay || (bay.status !== 'RESERVED' && bay.status !== 'AVAILABLE')) return prev;

      success = true;
      const session: ParkingSession = {
        id: `ses-${Date.now()}`,
        reservationId,
        checkInAt: new Date().toISOString(),
        scheduledEndAt: reservation.endTime,
        actualEndAt: null,
        status: 'ACTIVE',
        extensions: [],
      };

      return {
        ...prev,
        reservations: prev.reservations.map((r) =>
          r.id === reservationId ? { ...r, status: 'CHECKED_IN' as ReservationStatus } : r
        ),
        sessions: [...prev.sessions, session],
        bays: prev.bays.map((b) =>
          b.id === reservation.bayId ? { ...b, status: 'ACTIVE' as BayStatus } : b
        ),
        notifications: [
          {
            id: `ntf-${Date.now()}-ci`,
            userId: reservation.customerId,
            type: 'check_in_complete' as const,
            title: 'Checked In',
            message: `You are parked at ${bay.bayNumber}. Your session is now active.`,
            read: false,
            createdAt: new Date().toISOString(),
          },
          ...prev.notifications,
        ],
        auditLog: [
          ...prev.auditLog,
          log('CHECK_IN', `Customer checked in for ${reservation.bookingNumber}, bay ${bay.bayNumber}`, prev.currentUser?.id || 'system'),
        ],
      };
    });
    return success;
  }, []);

  const checkOutCustomer = useCallback((reservationId: string): boolean => {
    let success = false;
    setState((prev) => {
      const reservation = prev.reservations.find((r) => r.id === reservationId);
      if (!reservation || reservation.status !== 'CHECKED_IN') return prev;

      const session = prev.sessions.find((s) => s.reservationId === reservationId);
      if (!session) return prev;

      success = true;
      const bay = prev.bays.find((b) => b.id === reservation.bayId);

      return {
        ...prev,
        reservations: prev.reservations.map((r) =>
          r.id === reservationId ? { ...r, status: 'COMPLETED' as ReservationStatus } : r
        ),
        sessions: prev.sessions.map((s) =>
          s.reservationId === reservationId
            ? { ...s, status: 'COMPLETED' as SessionStatus, actualEndAt: new Date().toISOString() }
            : s
        ),
        bays: prev.bays.map((b) =>
          b.id === reservation.bayId ? { ...b, status: 'TURNOVER' as BayStatus } : b
        ),
        notifications: [
          {
            id: `ntf-${Date.now()}-co`,
            userId: reservation.customerId,
            type: 'checkout_complete' as const,
            title: 'Parking Complete',
            message: `Your session at ${bay?.bayNumber || 'the facility'} has ended. Thank you for using PARKGRID.`,
            read: false,
            createdAt: new Date().toISOString(),
          },
          ...prev.notifications,
        ],
        auditLog: [
          ...prev.auditLog,
          log('CHECK_OUT', `Customer checked out for ${reservation.bookingNumber}, bay ${bay?.bayNumber}`, prev.currentUser?.id || 'system'),
        ],
      };
    });

    // Trigger turnover timer
    if (success) {
      const reservation = state.reservations.find((r) => r.id === reservationId);
      if (reservation) {
        setBayStatus(reservation.bayId, 'TURNOVER');
      }
    }
    return success;
  }, [state.reservations, setBayStatus]);

  const extendSession = useCallback((reservationId: string, additionalMinutes: number): boolean => {
    let success = false;
    setState((prev) => {
      const reservation = prev.reservations.find((r) => r.id === reservationId);
      if (!reservation || reservation.status !== 'CHECKED_IN') return prev;

      const session = prev.sessions.find((s) => s.reservationId === reservationId);
      if (!session) return prev;

      // Check for future reservation on this bay
      const newEndTime = new Date(reservation.endTime).getTime() + additionalMinutes * 60000;
      const hasConflict = prev.reservations.some(
        (r) =>
          r.bayId === reservation.bayId &&
          r.id !== reservationId &&
          r.status === 'CONFIRMED' &&
          new Date(r.startTime) < new Date(newEndTime)
      );
      if (hasConflict) return prev;

      success = true;
      const newEndISO = new Date(newEndTime).toISOString();

      return {
        ...prev,
        reservations: prev.reservations.map((r) =>
          r.id === reservationId ? { ...r, endTime: newEndISO } : r
        ),
        sessions: prev.sessions.map((s) =>
          s.reservationId === reservationId
            ? {
                ...s,
                scheduledEndAt: newEndISO,
                status: 'EXTENDED' as SessionStatus,
                extensions: [...s.extensions, { amount: additionalMinutes, requestedAt: new Date().toISOString() }],
              }
            : s
        ),
        notifications: [
          {
            id: `ntf-${Date.now()}-ext`,
            userId: reservation.customerId,
            type: 'extension_confirmed' as const,
            title: 'Parking Extended',
            message: `Your session has been extended by ${Math.floor(additionalMinutes / 60)}h ${additionalMinutes % 60}m.`,
            read: false,
            createdAt: new Date().toISOString(),
          },
          ...prev.notifications,
        ],
        auditLog: [
          ...prev.auditLog,
          log('EXTENSION', `Session extended by ${additionalMinutes} minutes for ${reservation.bookingNumber}`, prev.currentUser?.id || 'system'),
        ],
      };
    });
    return success;
  }, []);

  const resolveIncident = useCallback((incidentId: string) => {
    setState((prev) => ({
      ...prev,
      incidents: prev.incidents.map((inc) =>
        inc.id === incidentId ? { ...inc, status: 'resolved', resolvedAt: new Date().toISOString() } : inc
      ),
      auditLog: [...prev.auditLog, log('INCIDENT_RESOLVED', `Incident ${incidentId} resolved`, prev.currentUser?.id || 'system')],
    }));
  }, []);

  const addIncident = useCallback(
    (data: Omit<Incident, 'id' | 'createdAt' | 'resolvedAt' | 'status'>) => {
      setState((prev) => ({
        ...prev,
        incidents: [
          {
            ...data,
            id: `inc-${Date.now()}`,
            status: 'open',
            createdAt: new Date().toISOString(),
            resolvedAt: null,
          },
          ...prev.incidents,
        ],
        auditLog: [...prev.auditLog, log('INCIDENT_REPORTED', `New ${data.type} incident reported`, prev.currentUser?.id || 'system')],
      }));
    },
    []
  );

  const markNotificationRead = useCallback((notificationId: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
    }));
  }, []);

  // ========== SELECTORS ==========
  const getAvailableBayCount = useCallback(
    (facilityId: string): number => state.bays.filter((b) => b.facilityId === facilityId && b.status === 'AVAILABLE').length,
    [state.bays]
  );

  const getFacilityOccupancy = useCallback(
    (facilityId: string) => {
      const facBays = state.bays.filter((b) => b.facilityId === facilityId);
      const total = facBays.length;
      const occupied = facBays.filter((b) => b.status === 'ACTIVE' || b.status === 'RESERVED').length;
      return { total, occupied, available: total - occupied };
    },
    [state.bays]
  );

  const getFacilityById = useCallback((id: string) => state.facilities.find((f) => f.id === id), [state.facilities]);
  const getBayById = useCallback((id: string) => state.bays.find((b) => b.id === id), [state.bays]);
  const getReservationById = useCallback((id: string) => state.reservations.find((r) => r.id === id), [state.reservations]);
  const getUserById = useCallback((id: string) => state.users.find((u) => u.id === id), [state.users]);
  const getVehicleById = useCallback((id: string) => state.vehicles.find((v) => v.id === id), [state.vehicles]);
  const getVehicleByUser = useCallback((userId: string) => state.vehicles.find((v) => v.userId === userId), [state.vehicles]);
  const getReservationsByFacility = useCallback(
    (facilityId: string) => state.reservations.filter((r) => r.facilityId === facilityId),
    [state.reservations]
  );
  const getReservationsByCustomer = useCallback(
    (customerId: string) => state.reservations.filter((r) => r.customerId === customerId),
    [state.reservations]
  );
  const getActiveSessionByReservation = useCallback(
    (reservationId: string) => state.sessions.find((s) => s.reservationId === reservationId),
    [state.sessions]
  );
  const getIncidentsByFacility = useCallback(
    (facilityId: string) => state.incidents.filter((i) => i.facilityId === facilityId),
    [state.incidents]
  );
  const getIncidentsByNetwork = useCallback(() => state.incidents, [state.incidents]);
  const getPaymentsByFacility = useCallback(
    (facilityId: string) =>
      state.payments.filter((p) => {
        const r = state.reservations.find((r) => r.id === p.reservationId);
        return r?.facilityId === facilityId;
      }),
    [state.payments, state.reservations]
  );
  const getFacilityRevenue = useCallback(
    (facilityId: string) =>
      state.payments
        .filter((p) => {
          const r = state.reservations.find((r) => r.id === p.reservationId);
          return r?.facilityId === facilityId;
        })
        .reduce((sum, p) => sum + p.amount, 0),
    [state.payments, state.reservations]
  );
  const getNetworkStats = useCallback(() => {
    const totalSpaces = state.bays.length;
    const occupiedSpaces = state.bays.filter((b) => b.status === 'ACTIVE' || b.status === 'RESERVED').length;
    const revenue = state.payments.reduce((sum, p) => sum + p.amount, 0);
    return {
      facilities: state.facilities.length,
      totalSpaces,
      occupiedSpaces,
      utilization: totalSpaces > 0 ? Math.round((occupiedSpaces / totalSpaces) * 100) : 0,
      revenue,
    };
  }, [state.bays, state.payments, state.facilities]);

  const getUnreadNotifications = useCallback(
    (userId: string) => state.notifications.filter((n) => n.userId === userId && !n.read),
    [state.notifications]
  );
  const getNotificationsByUser = useCallback(
    (userId: string) => state.notifications.filter((n) => n.userId === userId),
    [state.notifications]
  );

  const value: StoreContextValue = {
    ...state,
    login,
    logout,
    switchRole,
    createReservation,
    checkInCustomer,
    checkOutCustomer,
    extendSession,
    setBayStatus,
    resolveIncident,
    addIncident,
    markNotificationRead,
    getAvailableBayCount,
    getFacilityOccupancy,
    getFacilityById,
    getBayById,
    getReservationById,
    getUserById,
    getVehicleById,
    getVehicleByUser,
    getReservationsByFacility,
    getReservationsByCustomer,
    getActiveSessionByReservation,
    getIncidentsByFacility,
    getIncidentsByNetwork,
    getPaymentsByFacility,
    getNetworkStats,
    getFacilityRevenue,
    getUnreadNotifications,
    getNotificationsByUser,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
