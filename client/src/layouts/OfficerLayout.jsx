import React from 'react';
import MainLayout from './MainLayout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChatIcon from '@mui/icons-material/Chat';

const OfficerLayout = () => {
  const menuItems = [
    { label: 'Dashboard', path: '/officer/dashboard', icon: <DashboardIcon /> },
    { label: 'Messages', path: '/messages', icon: <ChatIcon /> },
  ];

  return <MainLayout menuItems={menuItems} title="Officer Portal" />;
};

export default OfficerLayout;
