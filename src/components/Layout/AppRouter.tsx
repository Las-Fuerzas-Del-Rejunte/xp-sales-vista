import React from 'react';
import { useApp } from '../../contexts/SupabaseAppContext';
import Dashboard from '../Dashboard/Dashboard';
import ProductList from '../Products/ProductList';
import BrandList from '../Brands/BrandList';
import ProductCatalog from '../Catalog/ProductCatalog';
import UserProfile from '../Profile/UserProfile';
import SalesList from '../Sales/SalesList';
import UserManagement from '../Users/UserManagement';
import SalesDashboard from '../Dashboard/SalesDashboard';

const AppRouter: React.FC = () => {
  const { currentView } = useApp();

  switch (currentView) {
    case 'products':
      return <ProductList />;
    case 'brands':
      return <BrandList />;
    case 'catalog':
      return <ProductCatalog />;
    case 'profile':
      return <UserProfile />;
    case 'sales':
      return <SalesList />;
    case 'users':
      return <UserManagement />;
    case 'sales-dashboard':
      return <SalesDashboard />;
    default:
      return <Dashboard />;
  }
};

export default AppRouter;