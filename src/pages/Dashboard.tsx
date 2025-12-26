import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import ClientDashboard from './ClientDashboard';
import MentorDashboard from './MentorDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'mentor':
        return <MentorDashboard />;
      case 'employee':
        return <EmployeeDashboard />;
      case 'client':
        return <ClientDashboard />;
      default:
        return <div>Invalid role</div>;
    }
  };

  return renderDashboard();
};

export default Dashboard;