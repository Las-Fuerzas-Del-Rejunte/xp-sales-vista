import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import Window from '../Layout/Window';
import ProductForm from './ProductForm';
import { Product } from '../../contexts/AppContext';

const ProductList: React.FC = () => {
  const { products, brands, deleteProduct, setCurrentView } = useApp();
  const { isAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (productId: string) => {
    if (deleteConfirm === productId) {
      deleteProduct(productId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(productId);
      // Auto-cancel after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const getBrandName = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.name : 'Marca no encontrada';
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (showForm) {
    return (
      <ProductForm 
        product={editingProduct} 
        onClose={closeForm}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Window title="Gestión de Productos - Panel de Administración">
        {/* Toolbar */}
        <div className="xp-toolbar mb-4">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="xp-button text-sm"
          >
            🏠 Inicio
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="xp-button text-sm"
          >
            ➕ Nuevo Producto
          </button>
          <div className="text-sm text-gray-600 ml-auto">
            Total: {products.length} productos
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded border-2 border-gray-300">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-bold text-gray-600 mb-2">No hay productos registrados</h3>
            <p className="text-gray-500 mb-4">Comience agregando su primer producto al catálogo</p>
            <button
              onClick={() => setShowForm(true)}
              className="xp-button"
            >
              ➕ Crear Primer Producto
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white border-2 border-gray-300 rounded p-4">
                  {/* Product Image */}
                  <div className="bg-gray-100 rounded border border-gray-300 h-32 mb-3 flex items-center justify-center">
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
                    <h3 className="font-bold text-lg text-blue-800">{product.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                    
                    <div className="text-sm space-y-1">
                      <p><strong>Categoría:</strong> {product.category}</p>
                      <p><strong>Marca:</strong> {getBrandName(product.brandId)}</p>
                      <p className="text-lg font-bold text-green-600">
                        ${product.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Actions */}
                    {isAdmin && (
                      <div className="flex gap-2 pt-2 border-t">
                        <button
                          onClick={() => handleEdit(product)}
                          className="xp-button text-xs flex-1"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className={`xp-button text-xs flex-1 ${
                            deleteConfirm === product.id 
                              ? 'bg-red-500 text-white' 
                              : ''
                          }`}
                        >
                          {deleteConfirm === product.id ? '⚠️ Confirmar' : '🗑️ Eliminar'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Bar */}
        <div className="xp-status-bar mt-4">
          Estado: Sistema operativo | Productos: {products.length} | Última actualización: {new Date().toLocaleString()}
        </div>
      </Window>
    </div>
  );
};

export default ProductList;