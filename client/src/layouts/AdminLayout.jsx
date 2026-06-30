import React from 'react';
import MainLayout from './MainLayout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HistoryIcon from '@mui/icons-material/History';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import TimelineIcon from '@mui/icons-material/Timeline';

const AdminLayout = () => {
  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
    { label: 'Officer Approval', path: '/admin/officer-approval', icon: <SecurityIcon /> },
    { label: 'Users', path: '/admin/users', icon: <PeopleIcon /> },
    { label: 'All Complaints', path: '/admin/complaints', icon: <ReportProblemIcon /> },
    { label: 'Assign Complaint', path: '/admin/assign-complaint', icon: <AssignmentIcon /> },
    { label: 'Assignment History', path: '/admin/assignments', icon: <HistoryIcon /> },
    { isDivider: true, label: 'Analytics & Reports' },
    { label: 'Overview Dashboard', path: '/admin/analytics', icon: <AnalyticsIcon /> },
    { label: 'Complaint Trends', path: '/admin/analytics/complaints', icon: <TimelineIcon /> },
    { label: 'Officer Performance', path: '/admin/analytics/officers', icon: <SupervisorAccountIcon /> },
    { label: 'Generate Reports', path: '/admin/analytics/reports', icon: <AssessmentIcon /> },
  ];

  return <MainLayout menuItems={menuItems} title="Admin Portal" />;
};

export default AdminLayout;
