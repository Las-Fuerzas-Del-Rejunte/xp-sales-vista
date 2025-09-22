import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import WindowsDesktop from '../components/Layout/WindowsDesktop';
import LoginForm from '../components/Auth/LoginForm';
import RegisterForm from '../components/Auth/RegisterForm';
import Dashboard from '../components/Dashboard/Dashboard';
import ProductList from '../components/Products/ProductList';
import BrandList from '../components/Brands/BrandList';
import ProductCatalog from '../components/Catalog/ProductCatalog';
import UserProfile from '../components/Profile/UserProfile';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const { currentView } = useApp();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // Authentication Flow
  if (!isAuthenticated) {
    return authView === 'login' ? (
      <LoginForm onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <RegisterForm onSwitchToLogin={() => setAuthView('login')} />
    );
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
