import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Layouts
import { OwnerLayout } from './layouts/OwnerLayout';
import { TenantLayout } from './layouts/TenantLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Owner Pages
import { OwnerDashboard } from './pages/owner/OwnerDashboard';
import { RoomAvailability } from './pages/owner/RoomAvailability';
import { BuildingManagement } from './pages/owner/BuildingManagement';
import { TenantManagement } from './pages/owner/TenantManagement';
import { RentManagement } from './pages/owner/RentManagement';
import { PaymentVerification } from './pages/owner/PaymentVerification';
import { TenantHistory } from './pages/owner/TenantHistory';
import { OccupancyAnalytics } from './pages/owner/OccupancyAnalytics';
import { FinancialDashboard } from './pages/owner/FinancialDashboard';
import { ComplaintsManager } from './pages/owner/ComplaintsManager';
import { AnnouncementsManager } from './pages/owner/AnnouncementsManager';
import { OwnerSettings } from './pages/owner/OwnerSettings';

// Tenant Pages
import { TenantDashboard } from './pages/tenant/TenantDashboard';
import { TenantRoomView } from './pages/tenant/TenantRoomView';
import { TenantRentPayment } from './pages/tenant/TenantRentPayment';
import { TenantPaymentHistory } from './pages/tenant/TenantPaymentHistory';
import { TenantComplaints } from './pages/tenant/TenantComplaints';
import { TenantAnnouncements } from './pages/tenant/TenantAnnouncements';
import { TenantProfile } from './pages/tenant/TenantProfile';

// Route Guards
const OwnerRoute = ({ children }) => {
  const { user, loading, isOwner } = useAuth();
  if (loading) return <LoadingSpinner label="Authenticating session..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isOwner) return <Navigate to="/tenant/dashboard" replace />;
  return children;
};

const TenantRoute = ({ children }) => {
  const { user, loading, isTenant } = useAuth();
  if (loading) return <LoadingSpinner label="Authenticating session..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isTenant) return <Navigate to="/owner/dashboard" replace />;
  return children;
};

export const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Owner Portal Protected Routes */}
      <Route
        path="/owner"
        element={
          <OwnerRoute>
            <OwnerLayout />
          </OwnerRoute>
        }
      >
        <Route index element={<Navigate to="/owner/dashboard" replace />} />
        <Route path="dashboard" element={<OwnerDashboard />} />
        <Route path="rooms-availability" element={<RoomAvailability />} />
        <Route path="building-structure" element={<BuildingManagement />} />
        <Route path="tenants" element={<TenantManagement />} />
        <Route path="rent-management" element={<RentManagement />} />
        <Route path="payment-verification" element={<PaymentVerification />} />
        <Route path="tenant-history" element={<TenantHistory />} />
        <Route path="occupancy-analytics" element={<OccupancyAnalytics />} />
        <Route path="financial-dashboard" element={<FinancialDashboard />} />
        <Route path="complaints" element={<ComplaintsManager />} />
        <Route path="announcements" element={<AnnouncementsManager />} />
        <Route path="settings" element={<OwnerSettings />} />
      </Route>

      {/* Tenant Portal Protected Routes */}
      <Route
        path="/tenant"
        element={
          <TenantRoute>
            <TenantLayout />
          </TenantRoute>
        }
      >
        <Route index element={<Navigate to="/tenant/dashboard" replace />} />
        <Route path="dashboard" element={<TenantDashboard />} />
        <Route path="room" element={<TenantRoomView />} />
        <Route path="payments" element={<TenantRentPayment />} />
        <Route path="payment-history" element={<TenantPaymentHistory />} />
        <Route path="complaints" element={<TenantComplaints />} />
        <Route path="announcements" element={<TenantAnnouncements />} />
        <Route path="profile" element={<TenantProfile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
export default App;
