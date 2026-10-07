import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { StoreProvider, useStore } from '@/store/StoreContext';
import { Login } from '@/components/Login';

// Customer
import { CustomerHome } from '@/pages/customer/CustomerHome';
import { FacilityDetail } from '@/pages/customer/FacilityDetail';
import { ReserveFlow } from '@/pages/customer/ReserveFlow';
import { BookingDetail } from '@/pages/customer/BookingDetail';
import { CustomerBookings } from '@/pages/customer/CustomerBookings';
import { ActiveSession } from '@/pages/customer/ActiveSession';
import { NavigationPage } from '@/pages/customer/NavigationPage';
import { CustomerProfile } from '@/pages/customer/CustomerProfile';
import { CustomerVehicles } from '@/pages/customer/CustomerVehicles';
import { CustomerNotifications } from '@/pages/customer/CustomerNotifications';
import { CustomerHelp } from '@/pages/customer/CustomerHelp';

// Attendant
import { AttendantDashboard } from '@/pages/attendant/AttendantDashboard';
import { AttendantArrivals } from '@/pages/attendant/AttendantArrivals';
import { AttendantParking } from '@/pages/attendant/AttendantParking';
import { AttendantSessions } from '@/pages/attendant/AttendantSessions';
import { AttendantIncidents } from '@/pages/attendant/AttendantIncidents';

// Owner
import { OwnerDashboard } from '@/pages/owner/OwnerDashboard';
import { OwnerSpaces } from '@/pages/owner/OwnerSpaces';
import { OwnerBookings } from '@/pages/owner/OwnerBookings';
import { OwnerRevenue } from '@/pages/owner/OwnerRevenue';
import { OwnerIncidents } from '@/pages/owner/OwnerIncidents';
import { OwnerReports } from '@/pages/owner/OwnerReports';

// Admin
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminNetwork } from '@/pages/admin/AdminNetwork';
import { AdminFacilities } from '@/pages/admin/AdminFacilities';
import { AdminUsers } from '@/pages/admin/AdminUsers';
import { AdminTransactions } from '@/pages/admin/AdminTransactions';
import { AdminIncidents } from '@/pages/admin/AdminIncidents';

// Corporate
import { CorporateDashboard } from '@/pages/corporate/CorporateDashboard';
import { CorporateBookings } from '@/pages/corporate/CorporateBookings';
import { CorporateEmployees } from '@/pages/corporate/CorporateEmployees';
import { CorporateLocations } from '@/pages/corporate/CorporateLocations';
import { CorporateSpending } from '@/pages/corporate/CorporateSpending';
import { CorporateReports } from '@/pages/corporate/CorporateReports';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles: string[] }) {
  const { currentUser } = useStore();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  if (!roles.includes(currentUser.role)) {
    // Redirect to the user's home dashboard
    const homeMap: Record<string, string> = {
      customer: '/customer',
      attendant: '/attendant',
      owner: '/owner',
      admin: '/admin',
      corporate: '/corporate',
    };
    return <Navigate to={homeMap[currentUser.role] || '/'} replace />;
  }
  return <>{children}</>;
}

function LoginGate() {
  const { currentUser } = useStore();
  if (currentUser) {
    const homeMap: Record<string, string> = {
      customer: '/customer',
      attendant: '/attendant',
      owner: '/owner',
      admin: '/admin',
      corporate: '/corporate',
    };
    return <Navigate to={homeMap[currentUser.role] || '/'} replace />;
  }
  return <Login />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={<LoginGate />} />

      {/* Customer */}
      <Route path="/customer" element={<ProtectedRoute roles={['customer']}><CustomerHome /></ProtectedRoute>} />
      <Route path="/customer/search" element={<ProtectedRoute roles={['customer']}><CustomerHome /></ProtectedRoute>} />
      <Route path="/customer/facilities/:id" element={<ProtectedRoute roles={['customer']}><FacilityDetail /></ProtectedRoute>} />
      <Route path="/customer/reserve/:id" element={<ProtectedRoute roles={['customer']}><ReserveFlow /></ProtectedRoute>} />
      <Route path="/customer/booking/:id" element={<ProtectedRoute roles={['customer']}><BookingDetail /></ProtectedRoute>} />
      <Route path="/customer/navigation/:id" element={<ProtectedRoute roles={['customer']}><NavigationPage /></ProtectedRoute>} />
      <Route path="/customer/session/:id" element={<ProtectedRoute roles={['customer']}><ActiveSession /></ProtectedRoute>} />
      <Route path="/customer/bookings" element={<ProtectedRoute roles={['customer']}><CustomerBookings /></ProtectedRoute>} />
      <Route path="/customer/profile" element={<ProtectedRoute roles={['customer']}><CustomerProfile /></ProtectedRoute>} />
      <Route path="/customer/vehicles" element={<ProtectedRoute roles={['customer']}><CustomerVehicles /></ProtectedRoute>} />
      <Route path="/customer/notifications" element={<ProtectedRoute roles={['customer']}><CustomerNotifications /></ProtectedRoute>} />
      <Route path="/customer/help" element={<ProtectedRoute roles={['customer']}><CustomerHelp /></ProtectedRoute>} />

      {/* Attendant */}
      <Route path="/attendant" element={<ProtectedRoute roles={['attendant']}><AttendantDashboard /></ProtectedRoute>} />
      <Route path="/attendant/arrivals" element={<ProtectedRoute roles={['attendant']}><AttendantArrivals /></ProtectedRoute>} />
      <Route path="/attendant/parking" element={<ProtectedRoute roles={['attendant']}><AttendantParking /></ProtectedRoute>} />
      <Route path="/attendant/sessions" element={<ProtectedRoute roles={['attendant']}><AttendantSessions /></ProtectedRoute>} />
      <Route path="/attendant/incidents" element={<ProtectedRoute roles={['attendant']}><AttendantIncidents /></ProtectedRoute>} />

      {/* Owner */}
      <Route path="/owner" element={<ProtectedRoute roles={['owner']}><OwnerDashboard /></ProtectedRoute>} />
      <Route path="/owner/spaces" element={<ProtectedRoute roles={['owner']}><OwnerSpaces /></ProtectedRoute>} />
      <Route path="/owner/bookings" element={<ProtectedRoute roles={['owner']}><OwnerBookings /></ProtectedRoute>} />
      <Route path="/owner/revenue" element={<ProtectedRoute roles={['owner']}><OwnerRevenue /></ProtectedRoute>} />
      <Route path="/owner/incidents" element={<ProtectedRoute roles={['owner']}><OwnerIncidents /></ProtectedRoute>} />
      <Route path="/owner/reports" element={<ProtectedRoute roles={['owner']}><OwnerReports /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/network" element={<ProtectedRoute roles={['admin']}><AdminNetwork /></ProtectedRoute>} />
      <Route path="/admin/facilities" element={<ProtectedRoute roles={['admin']}><AdminFacilities /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/transactions" element={<ProtectedRoute roles={['admin']}><AdminTransactions /></ProtectedRoute>} />
      <Route path="/admin/incidents" element={<ProtectedRoute roles={['admin']}><AdminIncidents /></ProtectedRoute>} />

      {/* Corporate */}
      <Route path="/corporate" element={<ProtectedRoute roles={['corporate']}><CorporateDashboard /></ProtectedRoute>} />
      <Route path="/corporate/bookings" element={<ProtectedRoute roles={['corporate']}><CorporateBookings /></ProtectedRoute>} />
      <Route path="/corporate/employees" element={<ProtectedRoute roles={['corporate']}><CorporateEmployees /></ProtectedRoute>} />
      <Route path="/corporate/locations" element={<ProtectedRoute roles={['corporate']}><CorporateLocations /></ProtectedRoute>} />
      <Route path="/corporate/spending" element={<ProtectedRoute roles={['corporate']}><CorporateSpending /></ProtectedRoute>} />
      <Route path="/corporate/reports" element={<ProtectedRoute roles={['corporate']}><CorporateReports /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;
