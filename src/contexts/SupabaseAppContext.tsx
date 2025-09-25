import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './SupabaseAuthContext';

export interface Product {
  id: string;
  user_id: string;
  brand_id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  line_id?: string;
  stock_quantity?: number;
  min_stock?: number;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  user_id: string;
  name: string;
  description: string;
  logo: string;
  created_at: string;
  updated_at: string;
}

interface AppContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ error: any }>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<{ error: any }>;
  deleteProduct: (id: string) => Promise<{ error: any }>;
  getProductById: (id: string) => Product | undefined;
  
  // Brands
  brands: Brand[];
  addBrand: (brand: Omit<Brand, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ error: any }>;
  updateBrand: (id: string, brand: Partial<Brand>) => Promise<{ error: any }>;
  deleteBrand: (id: string) => Promise<{ error: any; success: boolean }>;
  getBrandById: (id: string) => Brand | undefined;
  
  // UI State
  currentView: string;
  setCurrentView: (view: string) => void;
  
  // Loading states
  loading: boolean;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Fetch data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshData();
    } else {
      setProducts([]);
      setBrands([]);
    }
  }, [isAuthenticated, user]);

  const refreshData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch brands
      const { data: brandsData } = await supabase
        .from('brands')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setBrands(brandsData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Product functions
  const addProduct = async (productData: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('products')
      .insert([{ ...productData, user_id: user.id }])
      .select()
      .single();

    if (!error && data) {
      setProducts(prev => [data, ...prev]);
    }

    return { error };
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    if (!user) return { error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (!error && data) {
      setProducts(prev => prev.map(product => 
        product.id === id ? data : product
      ));
    }

    return { error };
  };

  const deleteProduct = async (id: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setProducts(prev => prev.filter(product => product.id !== id));
    }

    return { error };
  };

  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  // Brand functions
  const addBrand = async (brandData: Omit<Brand, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('brands')
      .insert([{ ...brandData, user_id: user.id }])
      .select()
      .single();

    if (!error && data) {
      setBrands(prev => [data, ...prev]);
    }

    return { error };
  };

  const updateBrand = async (id: string, brandData: Partial<Brand>) => {
    if (!user) return { error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('brands')
      .update(brandData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (!error && data) {
      setBrands(prev => prev.map(brand => 
        brand.id === id ? data : brand
      ));
    }

    return { error };
  };

  const deleteBrand = async (id: string): Promise<{ error: any; success: boolean }> => {
    if (!user) return { error: new Error('User not authenticated'), success: false };

    // Check if brand has products
    const hasProducts = products.some(product => product.brand_id === id);
    if (hasProducts) {
      return { error: new Error('Cannot delete brand with associated products'), success: false };
    }

    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setBrands(prev => prev.filter(brand => brand.id !== id));
      return { error: null, success: true };
    }

    return { error, success: false };
  };

  const getBrandById = (id: string) => {
    return brands.find(brand => brand.id === id);
  };

  const value = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    brands,
    addBrand,
    updateBrand,
    deleteBrand,
    getBrandById,
    currentView,
    setCurrentView,
    loading,
    refreshData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};