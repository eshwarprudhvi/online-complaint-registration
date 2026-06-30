import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SnackbarProvider } from './context/SnackbarContext';
import { DialogProvider } from './context/DialogContext';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import LodgeComplaint from './pages/LodgeComplaint';
import MyComplaints from './pages/MyComplaints';
import ComplaintDetails from './pages/ComplaintDetails';
import EditComplaint from './pages/EditComplaint';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import OfficerApproval from './pages/admin/OfficerApproval';
import UserManagement from './pages/admin/UserManagement';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminComplaintDetails from './pages/admin/AdminComplaintDetails';
import AssignComplaint from './pages/admin/AssignComplaint';
import AssignmentHistory from './pages/admin/AssignmentHistory';
import OfficerRoute from './components/OfficerRoute';
import OfficerLayout from './layouts/OfficerLayout';
import OfficerDashboard from './pages/officer/OfficerDashboard';
import OfficerComplaintDetails from './pages/officer/OfficerComplaintDetails';
import Conversations from './pages/chat/Conversations';
import ComplaintChat from './pages/chat/ComplaintChat';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import Notifications from './pages/notifications/Notifications';

import RoleBasedLayout from './layouts/RoleBasedLayout';

// Analytics Imports
import LandingPage from './pages/LandingPage';
import AdminAnalytics from './pages/admin/analytics/AdminAnalytics';
import ComplaintAnalytics from './pages/admin/analytics/ComplaintAnalytics';
import OfficerPerformance from './pages/admin/analytics/OfficerPerformance';
import Reports from './pages/admin/analytics/Reports';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const RoleBasedIndex = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <LandingPage />;
  if (user.role === 'Admin') return <Navigate to="/admin/dashboard" />;
  if (user.role === 'Agent') return <Navigate to="/officer/dashboard" />;
  return <Navigate to="/my-complaints" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RoleBasedIndex />} />
      
      {/* Shared Routes (Profile, Messages, Notifications) */}
      <Route element={<ProtectedRoute><RoleBasedLayout /></ProtectedRoute>}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/messages" element={<Conversations />} />
        <Route path="/messages/:id" element={<ComplaintChat />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>

      {/* Ordinary User Routes */}
      <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
        <Route path="/lodge-complaint" element={<LodgeComplaint />} />
        <Route path="/my-complaints" element={<MyComplaints />} />
        <Route path="/complaints/:id" element={<ComplaintDetails />} />
        <Route path="/complaints/edit/:id" element={<EditComplaint />} />
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="officer-approval" element={<OfficerApproval />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="complaints" element={<AdminComplaints />} />
        <Route path="complaints/:id" element={<AdminComplaintDetails />} />
        <Route path="assign-complaint" element={<AssignComplaint />} />
        <Route path="assignments" element={<AssignmentHistory />} />
        
        {/* Analytics Routes */}
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="analytics/complaints" element={<ComplaintAnalytics />} />
        <Route path="analytics/officers" element={<OfficerPerformance />} />
        <Route path="analytics/reports" element={<Reports />} />
      </Route>

      {/* Officer Routes */}
      <Route path="/officer" element={<OfficerRoute><OfficerLayout /></OfficerRoute>}>
        <Route path="dashboard" element={<OfficerDashboard />} />
        <Route path="complaints/:id" element={<OfficerComplaintDetails />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <SnackbarProvider>
        <DialogProvider>
          <AuthProvider>
            <Router>
              <AppRoutes />
            </Router>
          </AuthProvider>
        </DialogProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
