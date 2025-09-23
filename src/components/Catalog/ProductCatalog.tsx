import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import Window from '../Layout/Window';
import ProductDetailModal from './ProductDetailModal';
import { Product } from '../../contexts/AppContext';

const ProductCatalog: React.FC = () => {
  const { products, brands, setCurrentView } = useApp();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const categories = Array.from(new Set(products.map(p => p.category))).sort();
  const availableBrands = brands.filter(b => products.some(p => p.brandId === b.id));

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      const matchesBrand = !selectedBrand || product.brandId === selectedBrand;
      
      return matchesSearch && matchesCategory && matchesBrand;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'category': return a.category.localeCompare(b.category);
        default: return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, selectedBrand, sortBy]);

  const getBrandName = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.name : 'Marca no encontrada';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedBrand('');
    setSortBy('name');
  };

  return (
    <div className="space-y-4">
      <Window title="Catálogo de Productos - Explorar Productos Disponibles">
        {/* Toolbar */}
        <div className="xp-toolbar mb-4">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="xp-button text-sm"
          >
            🏠 Inicio
          </button>
          <div className="text-sm text-gray-600 ml-auto">
            Mostrando {filteredProducts.length} de {products.length} productos
          </div>
        </div>

        {/* Search and Filters */}
        <fieldset style={{ border: '2px groove #c0c0c0', padding: '8px', marginBottom: '16px' }}>
          <legend style={{ fontWeight: 'bold', fontSize: '11px' }}>🔍 Buscar y Filtrar Productos</legend>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '8px' }}>
            {/* Search */}
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', marginBottom: '2px' }}>Buscar:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="xp-input"
                style={{ width: '100%' }}
                placeholder="Nombre o descripción..."
              />
            </div>

            {/* Category Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', marginBottom: '2px' }}>Categoría:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="xp-input"
                style={{ width: '100%' }}
              >
                <option value="">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', marginBottom: '2px' }}>Marca:</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="xp-input"
                style={{ width: '100%' }}
              >
                <option value="">Todas las marcas</option>
                {availableBrands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', marginBottom: '2px' }}>Ordenar por:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="xp-input"
                style={{ width: '100%' }}
              >
                <option value="name">Nombre (A-Z)</option>
                <option value="price-low">Precio (Menor a Mayor)</option>
                <option value="price-high">Precio (Mayor a Menor)</option>
                <option value="category">Categoría</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="xp-button"
          >
            🗑️ Limpiar Filtros
          </button>
        </fieldset>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded border-2 border-gray-300">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-gray-600 mb-2">
              {products.length === 0 ? 'No hay productos disponibles' : 'No se encontraron productos'}
            </h3>
            <p className="text-gray-500">
              {products.length === 0 
                ? 'El catálogo está vacío. Los administradores pueden agregar productos.'
                : 'Intente modificar los filtros de búsqueda.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="bg-white border-2 border-gray-300 rounded p-3 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                {/* Product Image */}
                <div className="bg-gray-100 rounded border border-gray-300 h-32 mb-3 flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="h-full w-full object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling!.textContent = '🖼️';
                      }}
                    />
                  ) : (
                    <span className="text-4xl text-gray-400">🖼️</span>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-blue-800 line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>
                  
                  <div className="text-xs space-y-1">
                    <p className="text-gray-600">
                      <strong>Categoría:</strong> {product.category}
                    </p>
                    <p className="text-gray-600">
                      <strong>Marca:</strong> {getBrandName(product.brandId)}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-center pt-2 border-t">
                    <p className="text-lg font-bold text-green-600">
                      ${product.price.toLocaleString()}
                    </p>
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product);
                    }}
                    className="xp-button w-full text-xs py-2"
                  >
                    👁️ Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Status Bar */}
        <div className="xp-status-bar mt-4">
          Estado: Catálogo activo | Productos: {filteredProducts.length} mostrados de {products.length} total | Última actualización: {new Date().toLocaleString()}
        </div>
      </Window>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          brandName={getBrandName(selectedProduct.brandId)}
        />
      )}
    </div>
  );
};

export default ProductCatalog;