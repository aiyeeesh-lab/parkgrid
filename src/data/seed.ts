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
} from '@/types';

// Helper to generate IDs
let idCounter = 1000;
export const genId = (prefix: string): string => `${prefix}-${++idCounter}`;

// Helper for dates relative to now
const now = new Date();
const hoursFromNow = (h: number): string =>
  new Date(now.getTime() + h * 3600000).toISOString();
const hoursAgo = (h: number): string =>
  new Date(now.getTime() - h * 3600000).toISOString();
const minutesFromNow = (m: number): string =>
  new Date(now.getTime() + m * 60000).toISOString();
const minutesAgo = (m: number): string =>
  new Date(now.getTime() - m * 60000).toISOString();

// ========== FACILITIES ==========
export const facilities: Facility[] = [
  {
    id: 'fac-vi-business',
    name: 'VI Business Hub',
    location: 'Victoria Island, Lagos',
    address: ' Adeyemo Alakija St, Victoria Island, Lagos',
    latitude: 6.4281,
    longitude: 3.4219,
    capacity: 500,
    status: 'OPERATIONAL',
    supplyModel: 'OWNED',
    openingTime: '05:00',
    closingTime: '23:59',
    turnoverMinutes: 15,
    securityFeatures: ['CCTV', '24/7 Attendant', 'Access Control', 'Floodlit'],
    image: null,
    pricePerHour: 2500,
    description:
      'Premium corporate parking in the heart of Victoria Island. Direct access to business districts.',
  },
  {
    id: 'fac-vi-lifestyle',
    name: 'VI Lifestyle Hub',
    location: 'Victoria Island, Lagos',
    address: 'Akin Adesola St, Victoria Island, Lagos',
    latitude: 6.4389,
    longitude: 3.4265,
    capacity: 350,
    status: 'OPERATIONAL',
    supplyModel: 'OPERATED',
    openingTime: '06:00',
    closingTime: '02:00',
    turnoverMinutes: 15,
    securityFeatures: ['CCTV', 'Attendant', 'Floodlit'],
    image: null,
    pricePerHour: 2000,
    description:
      'Restaurants, nightlife and entertainment parking with extended evening hours.',
  },
  {
    id: 'fac-ikoyi',
    name: 'Ikoyi Hub',
    location: 'Ikoyi, Lagos',
    address: 'Bourdillon Rd, Ikoyi, Lagos',
    latitude: 6.4540,
    longitude: 3.4349,
    capacity: 400,
    status: 'OPERATIONAL',
    supplyModel: 'OWNED',
    openingTime: '05:00',
    closingTime: '23:59',
    turnoverMinutes: 15,
    securityFeatures: ['CCTV', '24/7 Attendant', 'Access Control', 'Floodlit'],
    image: null,
    pricePerHour: 2500,
    description:
      'Premium corporate and residential parking in Ikoyi with secure access control.',
  },
  {
    id: 'fac-lekki',
    name: 'Lekki Phase 1 Hub',
    location: 'Lekki Phase 1, Lagos',
    address: 'Admiralty Way, Lekki Phase 1, Lagos',
    latitude: 6.4474,
    longitude: 3.4742,
    capacity: 400,
    status: 'OPERATIONAL',
    supplyModel: 'PARTNER',
    openingTime: '06:00',
    closingTime: '23:00',
    turnoverMinutes: 15,
    securityFeatures: ['CCTV', 'Attendant', 'Floodlit'],
    image: null,
    pricePerHour: 1800,
    description:
      'Lifestyle and residential parking serving Lekki Phase 1 commercial corridors.',
  },
  {
    id: 'fac-ikeja',
    name: 'Ikeja Hub',
    location: 'Ikeja, Lagos',
    address: 'Obafemi Awolowo Way, Ikeja, Lagos',
    latitude: 6.6018,
    longitude: 3.3515,
    capacity: 450,
    status: 'OPERATIONAL',
    supplyModel: 'OWNED',
    openingTime: '05:00',
    closingTime: '23:59',
    turnoverMinutes: 15,
    securityFeatures: ['CCTV', '24/7 Attendant', 'Access Control', 'Floodlit'],
    image: null,
    pricePerHour: 1500,
    description:
      'Business district parking in Ikeja with excellent connectivity to the mainland.',
  },
  {
    id: 'fac-yaba',
    name: 'Yaba Hub',
    location: 'Yaba, Lagos',
    address: 'Herbert Macaulay Way, Yaba, Lagos',
    latitude: 6.5038,
    longitude: 3.3797,
    capacity: 250,
    status: 'OPERATIONAL',
    supplyModel: 'PARTNER',
    openingTime: '06:00',
    closingTime: '22:00',
    turnoverMinutes: 15,
    securityFeatures: ['CCTV', 'Attendant'],
    image: null,
    pricePerHour: 1000,
    description:
      'Technology and education district parking for Yaba commuters and students.',
  },
];

// ========== GENERATE PARKING BAYS ==========
function generateBays(facility: Facility): ParkingBay[] {
  const bays: ParkingBay[] = [];
  const levels = Math.ceil(facility.capacity / 170);
  const perLevel = Math.ceil(facility.capacity / levels);

  let count = 0;
  for (let level = 1; level <= levels && count < facility.capacity; level++) {
    const zoneLetters = ['A', 'B', 'C'];
    const zone = zoneLetters[(level - 1) % zoneLetters.length];
    for (let i = 1; i <= perLevel && count < facility.capacity; i++) {
      const bayNumber = `B${level}-${String(i).padStart(3, '0')}`;
      bays.push({
        id: `bay-${facility.id}-${bayNumber}`,
        facilityId: facility.id,
        bayNumber,
        level,
        zone,
        status: 'AVAILABLE',
      });
      count++;
    }
  }
  return bays;
}

export const allBays: ParkingBay[] = facilities.flatMap(generateBays);

// ========== USERS ==========
export const users: User[] = [
  // Demo accounts
  {
    id: 'user-demo-customer',
    name: 'Aisha Mohammed',
    email: 'customer@parkgrid.demo',
    phone: '+234 803 555 0101',
    role: 'customer',
    avatar: null,
    status: 'active',
    createdAt: hoursAgo(720),
  },
  {
    id: 'user-demo-attendant',
    name: 'Emeka Okafor',
    email: 'attendant@parkgrid.demo',
    phone: '+234 805 555 0202',
    role: 'attendant',
    avatar: null,
    status: 'active',
    createdAt: hoursAgo(720),
    facilityId: 'fac-vi-business',
  },
  {
    id: 'user-demo-owner',
    name: 'Bola Adeyemi',
    email: 'owner@parkgrid.demo',
    phone: '+234 807 555 0303',
    role: 'owner',
    avatar: null,
    status: 'active',
    createdAt: hoursAgo(720),
    ownedFacilities: ['fac-vi-business', 'fac-vi-lifestyle', 'fac-ikoyi'],
  },
  {
    id: 'user-demo-admin',
    name: 'Tunde Salami',
    email: 'admin@parkgrid.demo',
    phone: '+234 809 555 0404',
    role: 'admin',
    avatar: null,
    status: 'active',
    createdAt: hoursAgo(720),
  },
  {
    id: 'user-demo-corporate',
    name: 'Chidi Nwosu',
    email: 'corporate@parkgrid.demo',
    phone: '+234 811 555 0505',
    role: 'corporate',
    avatar: null,
    status: 'active',
    createdAt: hoursAgo(720),
    organizationId: 'org-accessbank',
    organizationName: 'Access Bank',
  },

  // Other customers
  ...[
    ['Chioma Eze', 'chioma.eze@mail.com', '+234 803 111 0001'],
    ['David Okonkwo', 'david.okonkwo@mail.com', '+234 803 111 0002'],
    ['Fatima Bello', 'fatima.bello@mail.com', '+234 803 111 0003'],
    ['Grace Adeleke', 'grace.adeleke@mail.com', '+234 803 111 0004'],
    ['Ibrahim Sani', 'ibrahim.sani@mail.com', '+234 803 111 0005'],
    ['Joy Chukwu', 'joy.chukwu@mail.com', '+234 803 111 0006'],
    ['Kunle Bakare', 'kunle.bakare@mail.com', '+234 803 111 0007'],
    ['Lola Martinez', 'lola.martinez@mail.com', '+234 803 111 0008'],
    ['Musa Abdullahi', 'musa.abdullahi@mail.com', '+234 803 111 0009'],
    ['Ngozi Obi', 'ngozi.obi@mail.com', '+234 803 111 0010'],
    ['Oluwaseun Adebayo', 'oluwaseun.adebayo@mail.com', '+234 803 111 0011'],
    ['Precious Eze', 'precious.eze@mail.com', '+234 803 111 0012'],
    ['Rashida Yusuf', 'rashida.yusuf@mail.com', '+234 803 111 0013'],
    ['Samuel Ojo', 'samuel.ojo@mail.com', '+234 803 111 0014'],
    ['Tara Okafor', 'tara.okafor@mail.com', '+234 803 111 0015'],
    ['Uche Nnamdi', 'uche.nnamdi@mail.com', '+234 803 111 0016'],
    ['Victor Ezea', 'victor.ezea@mail.com', '+234 803 111 0017'],
    ['Wumi Afolayan', 'wumi.afolayan@mail.com', '+234 803 111 0018'],
    ['Yusuf Aliyu', 'yusuf.aliyu@mail.com', '+234 803 111 0019'],
    ['Zainab Ibrahim', 'zainab.ibrahim@mail.com', '+234 803 111 0020'],
  ].map(([name, email, phone], i) => ({
    id: `user-cust-${i + 1}`,
    name,
    email,
    phone,
    role: 'customer' as const,
    avatar: null,
    status: 'active' as const,
    createdAt: hoursAgo(720 - i * 10),
  })),

  // Other attendants
  ...[
    ['Daniel Okeke', 'fac-vi-lifestyle'],
    ['Esther John', 'fac-ikoyi'],
    ['Femi Thomas', 'fac-lekki'],
    ['Hauwa Lawal', 'fac-ikeja'],
    ['Ifeanyi Kalu', 'fac-yaba'],
  ].map(([name, facId], i) => ({
    id: `user-att-${i + 1}`,
    name: name as string,
    email: `attendant${i + 1}@parkgrid.demo`,
    phone: `+234 805 555 ${String(i + 100).padStart(4, '0')}`,
    role: 'attendant' as const,
    avatar: null,
    status: 'active' as const,
    createdAt: hoursAgo(700 - i * 20),
    facilityId: facId as string,
  })),

  // Corporate user employee
  {
    id: 'user-corp-emp-1',
    name: 'Adaeze Okoro',
    email: 'adaeze.okoro@accessbank.com',
    phone: '+234 811 666 0001',
    role: 'customer',
    avatar: null,
    status: 'active',
    createdAt: hoursAgo(500),
  },
];

// ========== VEHICLES ==========
const vehicleMakes: [string, string, string][] = [
  ['Toyota', 'Camry', 'Silver'],
  ['Honda', 'Accord', 'Black'],
  ['Lexus', 'RX 350', 'White'],
  ['Mercedes', 'C-Class', 'Black'],
  ['Toyota', 'Corolla', 'Red'],
  ['Hyundai', 'Sonata', 'Blue'],
  ['Nissan', 'Altima', 'Grey'],
  ['Kia', 'Sportage', 'White'],
  ['Toyota', 'Highlander', 'Black'],
  ['Volkswagen', 'Tiguan', 'Silver'],
];

const platePrefixes = ['KJA', 'LSR', 'FKJ', 'KRD', 'APP', 'BWR'];
function genPlate(): string {
  const prefix = platePrefixes[Math.floor(Math.random() * platePrefixes.length)];
  const num = String(Math.floor(Math.random() * 900) + 100);
  const suffix = String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
    String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `${prefix}-${num}-${suffix}`;
}

export const vehicles: Vehicle[] = users
  .filter((u) => u.role === 'customer')
  .map((u, i) => {
    const [make, model, color] = vehicleMakes[i % vehicleMakes.length];
    return {
      id: `veh-${u.id}`,
      userId: u.id,
      make,
      model,
      color,
      licensePlate: genPlate(),
    };
  });

// ========== RESERVATIONS ==========
// Build realistic reservations with various states
let bookingCounter = 48280;
const genBookingNumber = (): string => `PG-${++bookingCounter}`;

export const reservations: Reservation[] = [];
export const sessions: ParkingSession[] = [];
export const payments: Payment[] = [];
export const vehicleConditions: VehicleConditionRecord[] = [];
export const notifications: Notification[] = [];
export const incidents: Incident[] = [];

// Helper: pick a bay for a facility
function pickBay(facilityId: string, status: ParkingBay['status'] = 'AVAILABLE'): ParkingBay | null {
  const facBays = allBays.filter((b) => b.facilityId === facilityId && b.status === status);
  return facBays.length > 0 ? facBays[Math.floor(Math.random() * facBays.length)] : null;
}

const customerUsers = users.filter((u) => u.role === 'customer');

// Generate 50+ reservations across facilities
for (let i = 0; i < 60; i++) {
  const customer = customerUsers[i % customerUsers.length];
  const facility = facilities[i % facilities.length];
  const bay = pickBay(facility.id);
  if (!bay) continue;

  const vehicle = vehicles.find((v) => v.userId === customer.id);
  if (!vehicle) continue;

  // Distribute across time: some completed, some active, some upcoming
  const timeOffset = (i % 10) - 5; // -5 to +4 hours from now
  const durationHours = [1, 2, 2, 3, 1.5, 2, 3, 2.5, 1, 4][i % 10];
  const startTime = hoursFromNow(timeOffset);
  const endTime = hoursFromNow(timeOffset + durationHours);
  const amount = Math.round(facility.pricePerHour * durationHours);
  const bookingNumber = genBookingNumber();

  let status: Reservation['status'];
  let paymentStatus: Reservation['paymentStatus'];
  let session: ParkingSession | null = null;

  if (timeOffset < -durationHours) {
    // Past - completed
    status = 'COMPLETED';
    paymentStatus = 'PAID';
    bay.status = 'AVAILABLE'; // Released after turnover
    sessions.push({
      id: genId('ses'),
      reservationId: `res-${i}`,
      checkInAt: startTime,
      scheduledEndAt: endTime,
      actualEndAt: endTime,
      status: 'COMPLETED',
      extensions: [],
    });
  } else if (timeOffset < 0 && timeOffset >= -durationHours) {
    // Currently active
    status = 'CHECKED_IN';
    paymentStatus = 'PAID';
    bay.status = 'ACTIVE';
    const ses: ParkingSession = {
      id: genId('ses'),
      reservationId: `res-${i}`,
      checkInAt: startTime,
      scheduledEndAt: endTime,
      actualEndAt: null,
      status: 'ACTIVE',
      extensions: [],
    };
    sessions.push(ses);
    session = ses;
  } else if (timeOffset >= 0 && timeOffset < 2) {
    // Upcoming soon - confirmed
    status = 'CONFIRMED';
    paymentStatus = 'PAID';
    bay.status = 'RESERVED';
  } else if (timeOffset >= 2) {
    // Future - confirmed
    status = 'CONFIRMED';
    paymentStatus = 'PAID';
    bay.status = 'RESERVED';
  } else {
    status = 'CONFIRMED';
    paymentStatus = 'PAID';
  }

  const reservation: Reservation = {
    id: `res-${i}`,
    bookingNumber,
    customerId: customer.id,
    vehicleId: vehicle.id,
    facilityId: facility.id,
    bayId: bay.id,
    startTime,
    endTime,
    status,
    amount,
    paymentStatus,
    createdAt: hoursAgo(Math.abs(timeOffset) + 24),
  };

  reservations.push(reservation);

  payments.push({
    id: genId('pay'),
    reservationId: reservation.id,
    amount,
    status: 'SUCCESS',
    providerReference: `PGW-${Math.floor(Math.random() * 9000000) + 1000000}`,
    paidAt: reservation.createdAt,
  });
}

// Set a few bays to TURNOVER and MAINTENANCE
const turnoverBays = allBays.filter((b) => b.facilityId === 'fac-vi-business' && b.status === 'AVAILABLE').slice(0, 5);
turnoverBays.forEach((b) => (b.status = 'TURNOVER'));

const maintenanceBays = allBays.filter((b) => b.facilityId === 'fac-vi-business' && b.status === 'AVAILABLE').slice(0, 8);
maintenanceBays.forEach((b) => (b.status = 'MAINTENANCE'));

const turnoverBays2 = allBays.filter((b) => b.facilityId === 'fac-ikoyi' && b.status === 'AVAILABLE').slice(0, 3);
turnoverBays2.forEach((b) => (b.status = 'TURNOVER'));

const maintenanceBays2 = allBays.filter((b) => b.facilityId === 'fac-lekki' && b.status === 'AVAILABLE').slice(0, 4);
maintenanceBays2.forEach((b) => (b.status = 'MAINTENANCE'));

// ========== INCIDENTS ==========
const incidentData: [string, Incident['type'], string, Incident['severity'], string, string | null, string | null][] = [
  ['fac-vi-business', 'vehicle_damage', 'Customer reported scratch on rear bumper during checkout.', 'low', 'user-demo-attendant', 'res-3', 'veh-user-cust-3'],
  ['fac-vi-lifestyle', 'customer_dispute', 'Disagreement over parking bay assignment between two customers.', 'medium', 'user-att-1', 'res-10', 'veh-user-cust-10'],
  ['fac-ikoyi', 'security_issue', 'Unauthorized vehicle found in reserved bay B2-045.', 'high', 'user-att-2', null, null],
  ['fac-lekki', 'blocked_bay', 'Bay B2-012 blocked by delivery truck.', 'medium', 'user-att-3', null, null],
  ['fac-ikeja', 'facility_damage', 'Barrier arm malfunction at Level 1 exit.', 'high', 'user-att-4', null, null],
  ['fac-yaba', 'technical_issue', 'Payment terminal not processing transactions.', 'medium', 'user-att-5', null, null],
  ['fac-vi-business', 'payment_issue', 'Customer charged twice for same booking.', 'low', 'user-demo-attendant', 'res-7', null],
  ['fac-vi-business', 'unauthorized_vehicle', 'Vehicle without reservation parked in reserved bay for 40 minutes.', 'medium', 'user-demo-attendant', null, null],
];

incidentData.forEach(([facId, type, desc, sev, reportedBy, resId, vehId], i) => {
  incidents.push({
    id: `inc-${i + 1}`,
    facilityId: facId,
    reservationId: resId,
    vehicleId: vehId,
    reportedBy,
    type: type as Incident['type'],
    description: desc,
    severity: sev as Incident['severity'],
    status: i < 3 ? 'open' : i < 5 ? 'investigating' : 'resolved',
    createdAt: hoursAgo(48 - i * 6),
    resolvedAt: i >= 5 ? hoursAgo(12 - i) : null,
  });
});

// ========== NOTIFICATIONS ==========
notifications.push(
  {
    id: genId('ntf'),
    userId: 'user-demo-customer',
    type: 'reservation_confirmed',
    title: 'Parking Confirmed',
    message: 'Your booking PG-48281 has been confirmed at VI Business Hub.',
    read: false,
    createdAt: hoursAgo(2),
  },
  {
    id: genId('ntf'),
    userId: 'user-demo-customer',
    type: 'expiration_warning',
    title: 'Parking Expiring Soon',
    message: 'Your parking session at Ikoyi Hub expires in 30 minutes.',
    read: false,
    createdAt: minutesAgo(15),
  },
  {
    id: genId('ntf'),
    userId: 'user-demo-customer',
    type: 'system',
    title: 'Welcome to PARKGRID',
    message: 'Discover secure parking across Lagos before you leave.',
    read: true,
    createdAt: hoursAgo(168),
  },
);

// ========== ORGANIZATIONS ==========
export const organizations: Organization[] = [
  {
    id: 'org-accessbank',
    name: 'Access Bank',
    employeeCount: 46,
    monthlyBudget: 3000000,
    createdAt: hoursAgo(1440),
  },
];

// ========== REVENUE DATA (for charts) ==========
export function generateRevenueData(facilityId?: string): { label: string; value: number }[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((d) => ({
    label: d,
    value: Math.floor(Math.random() * 500000) + 300000,
  }));
}

export function generateHourlyOccupancy(facilityId?: string): { hour: string; occupancy: number }[] {
  const hours = ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM'];
  return hours.map((h) => ({
    hour: h,
    occupancy: Math.floor(Math.random() * 30) + 60,
  }));
}
