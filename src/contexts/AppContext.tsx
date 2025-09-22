import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  brandId: string;
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  logo: string;
  createdAt: string;
}

interface AppContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  
  // Brands
  brands: Brand[];
  addBrand: (brand: Omit<Brand, 'id' | 'createdAt'>) => void;
  updateBrand: (id: string, brand: Partial<Brand>) => void;
  deleteBrand: (id: string) => boolean; // Returns false if brand has products
  getBrandById: (id: string) => Brand | undefined;
  
  // UI State
  currentView: string;
  setCurrentView: (view: string) => void;
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
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    // Load data from localStorage
    const storedProducts = localStorage.getItem('products');
    const storedBrands = localStorage.getItem('brands');
    
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }
    
    if (storedBrands) {
      setBrands(JSON.parse(storedBrands));
    } else {
      // Initialize with sample brands
      const sampleBrands: Brand[] = [
        {
          id: 'brand-1',
          name: 'TechCorp',
          description: 'Tecnología de vanguardia',
          logo: '🔧',
          createdAt: new Date().toISOString()
        },
        {
          id: 'brand-2',
          name: 'HomeStyle',
          description: 'Productos para el hogar',
          logo: '🏠',
          createdAt: new Date().toISOString()
        }
      ];
      setBrands(sampleBrands);
      localStorage.setItem('brands', JSON.stringify(sampleBrands));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('brands', JSON.stringify(brands));
  }, [brands]);

  // Product functions
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `product-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(prev => prev.map(product => 
      product.id === id ? { ...product, ...productData } : product
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  // Brand functions
  const addBrand = (brandData: Omit<Brand, 'id' | 'createdAt'>) => {
    const newBrand: Brand = {
      ...brandData,
      id: `brand-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setBrands(prev => [...prev, newBrand]);
  };

  const updateBrand = (id: string, brandData: Partial<Brand>) => {
    setBrands(prev => prev.map(brand => 
      brand.id === id ? { ...brand, ...brandData } : brand
    ));
  };

  const deleteBrand = (id: string): boolean => {
    // Check if brand has products
    const hasProducts = products.some(product => product.brandId === id);
    if (hasProducts) {
      return false;
    }
    
    setBrands(prev => prev.filter(brand => brand.id !== id));
    return true;
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
    setCurrentView
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};