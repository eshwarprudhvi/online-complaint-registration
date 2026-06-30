import React from 'react';
import MainLayout from './MainLayout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ChatIcon from '@mui/icons-material/Chat';

const UserLayout = () => {
  const menuItems = [
    { label: 'My Complaints', path: '/my-complaints', icon: <ListAltIcon /> },
    { label: 'Lodge Complaint', path: '/lodge-complaint', icon: <AddCircleOutlineIcon /> },
    { label: 'Messages', path: '/messages', icon: <ChatIcon /> },
  ];

  return <MainLayout menuItems={menuItems} title="Citizen Portal" />;
};

export default UserLayout;
