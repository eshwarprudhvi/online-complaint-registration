import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import OfficerLayout from './OfficerLayout';
import UserLayout from './UserLayout';

const RoleBasedLayout = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  if (user.role === 'Admin') return <AdminLayout />;
  if (user.role === 'Agent') return <OfficerLayout />;
  
  return <UserLayout />;
};

export default RoleBasedLayout;
