import React from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useApp } from '../contexts/SupabaseAppContext';
import WindowsDesktop from '../components/Layout/WindowsDesktop';
import AuthPage from '../components/Auth/AuthPage';
import Dashboard from '../components/Dashboard/Dashboard';
import ProductList from '../components/Products/ProductList';
import BrandList from '../components/Brands/BrandList';
import ProductCatalog from '../components/Catalog/ProductCatalog';
import UserProfile from '../components/Profile/UserProfile';

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
    switch (currentView) {
      case 'products':
        return <ProductList />;
      case 'brands':
        return <BrandList />;
      case 'catalog':
        return <ProductCatalog />;
      case 'profile':
        return <UserProfile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <WindowsDesktop>
      {renderCurrentView()}
    </WindowsDesktop>
  );
};

export default Index;
