import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardResponsable from './pages/DashboardResponsable';
import DashboardFonctionnaire from './pages/DashboardFonctionnaire';
import { Toaster } from 'react-hot-toast';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'responsable' ? '/responsable' : '/fonctionnaire'} />} />
      <Route path="/responsable" element={user?.role === 'responsable' ? <DashboardResponsable /> : <Navigate to="/login" />} />
      <Route path="/fonctionnaire" element={user?.role === 'fonctionnaire' ? <DashboardFonctionnaire /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;