import React from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useApp } from '../contexts/SupabaseAppContext';
import { WindowProvider } from '../contexts/WindowContext';
import WindowsDesktop from '../components/Layout/WindowsDesktop';
import AuthPage from '../components/Auth/AuthPage';
import AppRouter from '../components/Layout/AppRouter';

const Index = () => {
  const { isAuthenticated, loading } = useAuth();
  const { currentView } = useApp();

  // Show loading while checking authentication
  if (loading) {
    return <AuthPage />;
  }

  // Authentication Flow
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Main Application
  const renderCurrentView = () => {
    return <AppRouter />;
  };

  return (
    <WindowProvider>
      <WindowsDesktop>
        {renderCurrentView()}
      </WindowsDesktop>
    </WindowProvider>
  );
};

export default Index;
