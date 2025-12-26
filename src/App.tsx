import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboardNew from './pages/EmployeeDashboardNew';
import ClientDashboard from './pages/ClientDashboard';
import UserManagement from './pages/UserManagement';
import Layout from './components/Layout';
import { useState } from 'react';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const DashboardRouter = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!user) return <Navigate to="/login" />;

  // Employee uses different layout
  if (user.role === 'employee') {
    return <EmployeeDashboardNew />;
  }

  // Admin and Client use Layout with navigation
  const renderContent = () => {
    if (user.role === 'admin') {
      if (currentPage === 'users') {
        return <UserManagement />;
      }
      return <AdminDashboard />;
    }
    
    if (user.role === 'client') {
      return <ClientDashboard />;
    }

    return <div>Unknown role</div>;
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderContent()}
    </Layout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;