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

  return (
    <WindowProvider>
      {/* Show loading while checking authentication */}
      {loading && <AuthPage />}
      
      {/* Authentication Flow */}
      {!loading && !isAuthenticated && <AuthPage />}
      
      {/* Main Application */}
      {!loading && isAuthenticated && (
        <WindowsDesktop>
          <AppRouter />
        </WindowsDesktop>
      )}
    </WindowProvider>
  );
};

export default Index;
