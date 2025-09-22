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

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Window title={`Panel Principal - Bienvenido ${user?.name}`} width="100%">
        <div>
          {/* Welcome Message */}
          <fieldset style={{ border: '2px groove #c0c0c0', padding: '16px', marginBottom: '16px' }}>
            <legend style={{ fontWeight: 'bold', color: '#0000aa' }}>🎉 Bienvenido al Sistema</legend>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0000aa', margin: '0 0 8px 0' }}>
                Sistema de Gestión de Ventas - Windows XP
              </h2>
              <p style={{ fontSize: '11px', color: '#666', margin: '0' }}>
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </fieldset>

          {/* Statistics */}
          <fieldset style={{ border: '2px groove #c0c0c0', padding: '16px', marginBottom: '16px' }}>
            <legend style={{ fontWeight: 'bold' }}>📊 Estadísticas del Sistema</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
              <div style={{ border: '1px inset #c0c0c0', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px' }}>📦</div>
                <div style={{ fontSize: '11px', fontWeight: 'bold' }}>Total Productos</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0000aa' }}>{products.length}</div>
              </div>
              <div style={{ border: '1px inset #c0c0c0', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px' }}>🏢</div>
                <div style={{ fontSize: '11px', fontWeight: 'bold' }}>Total Marcas</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0000aa' }}>{brands.length}</div>
              </div>
              <div style={{ border: '1px inset #c0c0c0', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px' }}>👤</div>
                <div style={{ fontSize: '11px', fontWeight: 'bold' }}>Rol Actual</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0000aa' }}>
                  {user?.role === 'admin' ? 'Admin' : 'Cliente'}
                </div>
              </div>
            </div>
          </fieldset>

          {/* Menu */}
          <fieldset style={{ border: '2px groove #c0c0c0', padding: '16px', marginBottom: '16px' }}>
            <legend style={{ fontWeight: 'bold' }}>🗂️ Menú Principal</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  style={{ 
                    padding: '12px', 
                    textAlign: 'left', 
                    cursor: 'pointer',
                    fontSize: '11px',
                    border: '2px outset #c0c0c0',
                    background: '#f0f0f0'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#e0e0e0';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#f0f0f0';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{item.label}</div>
                      <div style={{ fontSize: '10px', color: '#666' }}>{item.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </fieldset>

          {/* System Info */}
          <fieldset style={{ border: '1px groove #c0c0c0', padding: '12px' }}>
            <legend style={{ fontSize: '10px', color: '#666' }}>ℹ️ Información del Sistema</legend>
            <div style={{ fontSize: '10px', color: '#666' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                <div>
                  <strong>Usuario:</strong> {user?.name} ({user?.email})
                </div>
                <div>
                  <strong>Rol:</strong> {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
                </div>
                <div>
                  <strong>Versión:</strong> 1.0.0 - MVP
                </div>
                <div>
                  <strong>Estado:</strong> ✅ Sistema Operativo
                </div>
              </div>
            </div>
          </fieldset>
        </div>
      </Window>
    </div>
  );
};

export default Dashboard;