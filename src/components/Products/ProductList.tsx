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
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Window title="Gestión de Productos - Panel de Administración" width="100%">
        <div>
          {/* Toolbar */}
          <fieldset style={{ border: '1px groove #c0c0c0', padding: '8px', marginBottom: '16px' }}>
            <legend style={{ fontSize: '10px', color: '#666' }}>Herramientas</legend>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setCurrentView('dashboard')}
                style={{ fontSize: '11px', padding: '4px 8px' }}
              >
                🏠 Inicio
              </button>
              <button
                onClick={() => setShowForm(true)}
                style={{ fontSize: '11px', padding: '4px 8px' }}
              >
                ➕ Nuevo Producto
              </button>
              <div style={{ marginLeft: 'auto', fontSize: '11px', color: '#666' }}>
                Total: {products.length} productos
              </div>
            </div>
          </fieldset>

          {products.length === 0 ? (
            <fieldset style={{ border: '2px groove #c0c0c0', padding: '32px', textAlign: 'center' }}>
              <legend style={{ fontWeight: 'bold' }}>Estado del Catálogo</legend>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#666', margin: '0 0 8px 0' }}>
                No hay productos registrados
              </h3>
              <p style={{ fontSize: '11px', color: '#666', margin: '0 0 16px 0' }}>
                Comience agregando su primer producto al catálogo
              </p>
              <button
                onClick={() => setShowForm(true)}
                style={{ fontSize: '11px', padding: '8px 16px' }}
              >
                ➕ Crear Primer Producto
              </button>
            </fieldset>
          ) : (
            <fieldset style={{ border: '2px groove #c0c0c0', padding: '16px' }}>
              <legend style={{ fontWeight: 'bold' }}>Catálogo de Productos</legend>
              
              {/* Products Grid */}
              <div className="product-grid">
                {products.map((product) => (
                  <div key={product.id} className="product-item">
                    {/* Product Image */}
                    <div style={{ 
                      background: '#f0f0f0', 
                      border: '1px inset #c0c0c0', 
                      height: '80px', 
                      marginBottom: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}>
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '';
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling!.textContent = '🖼️';
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: '32px', color: '#999' }}>🖼️</span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div style={{ fontSize: '11px' }}>
                      <div style={{ fontWeight: 'bold', color: '#0000aa', marginBottom: '4px' }}>
                        {product.name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>
                        <strong>Categoría:</strong> {product.category}
                      </div>
                      <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>
                        <strong>Marca:</strong> {getBrandName(product.brandId)}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#008000', marginBottom: '8px' }}>
                        ${product.price.toLocaleString()}
                      </div>

                      {/* Actions */}
                      {isAdmin && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleEdit(product)}
                            style={{ 
                              fontSize: '10px', 
                              padding: '2px 6px', 
                              flex: 1,
                              background: deleteConfirm === product.id ? '#f0f0f0' : undefined
                            }}
                            disabled={deleteConfirm === product.id}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            style={{ 
                              fontSize: '10px', 
                              padding: '2px 6px', 
                              flex: 1,
                              background: deleteConfirm === product.id ? '#ff6666' : undefined,
                              color: deleteConfirm === product.id ? 'white' : undefined
                            }}
                          >
                            {deleteConfirm === product.id ? '⚠️ Confirmar' : '🗑️ Eliminar'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </fieldset>
          )}

          {/* Status Bar */}
          <div style={{ 
            background: '#e0e0e0', 
            border: '1px inset #c0c0c0', 
            padding: '4px 8px', 
            fontSize: '10px', 
            color: '#666',
            marginTop: '16px'
          }}>
            Estado: Sistema operativo | Productos: {products.length} | Última actualización: {new Date().toLocaleString()}
          </div>
        </div>
      </Window>
    </div>
  );
};

export default ProductList;