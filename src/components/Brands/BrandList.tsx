import React, { useState } from 'react';
import { useApp } from '../../contexts/SupabaseAppContext';
import Window from '../Layout/Window';
import BrandForm from './BrandForm';
import { Brand } from '../../contexts/SupabaseAppContext';

const BrandList: React.FC = () => {
  const { brands, products, deleteBrand, setCurrentView } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string>('');

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setShowForm(true);
  };

  const handleDelete = (brandId: string) => {
    if (deleteConfirm === brandId) {
      const success = deleteBrand(brandId);
      if (success) {
        setDeleteConfirm(null);
        setDeleteError('');
      } else {
        setDeleteError('No se puede eliminar la marca porque tiene productos asociados');
        setDeleteConfirm(null);
        setTimeout(() => setDeleteError(''), 5000);
      }
    } else {
      setDeleteConfirm(brandId);
      setDeleteError('');
      // Auto-cancel after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const getProductCount = (brandId: string) => {
    return products.filter(p => p.brand_id === brandId).length;
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBrand(null);
  };

  if (showForm) {
    return (
      <BrandForm 
        brand={editingBrand} 
        onClose={closeForm}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Window title="Gestión de Marcas - Panel de Administración">
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
            ➕ Nueva Marca
          </button>
          <div className="text-sm text-gray-600 ml-auto">
            Total: {brands.length} marcas
          </div>
        </div>

        {/* Error Message */}
        {deleteError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <span className="block sm:inline">⚠️ {deleteError}</span>
          </div>
        )}

        {brands.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded border-2 border-gray-300">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-lg font-bold text-gray-600 mb-2">No hay marcas registradas</h3>
            <p className="text-gray-500 mb-4">Comience agregando su primera marca</p>
            <button
              onClick={() => setShowForm(true)}
              className="xp-button"
            >
              ➕ Crear Primera Marca
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Brands Table */}
            <div className="overflow-x-auto">
              <table className="xp-table">
                <thead>
                  <tr>
                    <th className="w-16">Logo</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th className="w-24">Productos</th>
                    <th className="w-32">Fecha Creación</th>
                    <th className="w-32">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand) => (
                    <tr key={brand.id}>
                      <td className="text-center">
                        <div className="bg-gray-100 rounded border border-gray-300 w-12 h-12 mx-auto flex items-center justify-center">
                          {brand.logo ? (
                            typeof brand.logo === 'string' && brand.logo.startsWith('http') ? (
                              <img 
                                src={brand.logo} 
                                alt={brand.name}
                                className="w-full h-full object-cover rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '';
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).nextElementSibling!.textContent = '🏢';
                                }}
                              />
                            ) : (
                              <span className="text-xl">{brand.logo}</span>
                            )
                          ) : (
                            <span className="text-xl text-gray-400">🏢</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <strong className="text-blue-800">{brand.name}</strong>
                      </td>
                      <td className="text-sm text-gray-600">
                        {brand.description}
                      </td>
                      <td className="text-center">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                          {getProductCount(brand.id)}
                        </span>
                      </td>
                      <td className="text-xs text-gray-500">
                        {new Date(brand.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(brand)}
                            className="xp-button text-xs px-2 py-1"
                            title="Editar marca"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(brand.id)}
                            className={`xp-button text-xs px-2 py-1 ${
                              deleteConfirm === brand.id 
                                ? 'bg-red-500 text-white' 
                                : ''
                            }`}
                            title={getProductCount(brand.id) > 0 
                              ? `No se puede eliminar: tiene ${getProductCount(brand.id)} productos` 
                              : 'Eliminar marca'
                            }
                          >
                            {deleteConfirm === brand.id ? '⚠️' : '🗑️'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 p-4 rounded border-2 border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2">📊 Estadísticas</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Total Marcas:</strong> {brands.length}</p>
                  <p><strong>Con Productos:</strong> {brands.filter(b => getProductCount(b.id) > 0).length}</p>
                  <p><strong>Sin Productos:</strong> {brands.filter(b => getProductCount(b.id) === 0).length}</p>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded border-2 border-green-200">
                <h4 className="font-bold text-green-800 mb-2">🏆 Marca Líder</h4>
                {brands.length > 0 ? (
                  (() => {
                    const topBrand = brands.reduce((max, brand) => 
                      getProductCount(brand.id) > getProductCount(max.id) ? brand : max
                    );
                    return (
                      <div className="text-sm">
                        <p><strong>{topBrand.name}</strong></p>
                        <p>{getProductCount(topBrand.id)} productos</p>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-sm text-gray-500">No hay datos</p>
                )}
              </div>

              <div className="bg-yellow-50 p-4 rounded border-2 border-yellow-200">
                <h4 className="font-bold text-yellow-800 mb-2">⚠️ Recordatorio</h4>
                <p className="text-sm text-gray-600">
                  Las marcas con productos asociados no pueden eliminarse. 
                  Elimine primero todos los productos de la marca.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status Bar */}
        <div className="xp-status-bar mt-4">
          Estado: Sistema operativo | Marcas: {brands.length} | Última actualización: {new Date().toLocaleString()}
        </div>
      </Window>
    </div>
  );
};

export default BrandList;