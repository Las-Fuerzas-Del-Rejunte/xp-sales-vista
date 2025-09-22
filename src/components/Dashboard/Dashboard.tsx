import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import Window from '../Layout/Window';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { products, brands, setCurrentView } = useApp();

  const menuItems = [
    ...(user?.role === 'admin' ? [
      { id: 'products', label: 'Gestión de Productos', icon: '📦', description: 'Administrar catálogo de productos' },
      { id: 'brands', label: 'Gestión de Marcas', icon: '🏢', description: 'Administrar marcas y fabricantes' },
    ] : []),
    { id: 'catalog', label: 'Catálogo de Productos', icon: '🛍️', description: 'Explorar productos disponibles' },
    { id: 'profile', label: 'Mi Perfil', icon: '👤', description: 'Editar información personal' },
  ];

  const stats = [
    { label: 'Total Productos', value: products.length, icon: '📦', color: 'bg-blue-100' },
    { label: 'Total Marcas', value: brands.length, icon: '🏢', color: 'bg-green-100' },
    { label: 'Rol Actual', value: user?.role === 'admin' ? 'Administrador' : 'Cliente', icon: '👤', color: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-6">
      <Window title={`Panel Principal - Bienvenido ${user?.name}`}>
        <div className="space-y-6">
          {/* Welcome Message */}
          <div className="text-center bg-blue-50 p-4 rounded border-2 border-blue-200">
            <h2 className="text-2xl font-bold text-blue-800 mb-2">
              🎉 ¡Bienvenido al Sistema de Gestión de Ventas!
            </h2>
            <p className="text-gray-600">
              Estilo Windows XP - {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className={`${stat.color} p-4 rounded border-2 border-gray-300`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Menu */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              🗂️ Menú Principal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className="xp-button p-4 text-left hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h4 className="font-bold">{item.label}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* System Info */}
          <div className="bg-gray-50 p-4 rounded border-2 border-gray-300">
            <h4 className="font-bold text-gray-800 mb-2">ℹ️ Información del Sistema</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Usuario:</strong> {user?.name} ({user?.email})</p>
              <p><strong>Rol:</strong> {user?.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
              <p><strong>Versión:</strong> 1.0.0 - MVP</p>
              <p><strong>Estado:</strong> ✅ Sistema Operativo</p>
            </div>
          </div>
        </div>
      </Window>
    </div>
  );
};

export default Dashboard;