import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import DesktopIcon from './DesktopIcon';

interface WindowsDesktopProps {
  children: React.ReactNode;
}

const WindowsDesktop: React.FC<WindowsDesktopProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { setCurrentView } = useApp();
  const [showDesktop, setShowDesktop] = useState(true);
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleIconClick = (view: string) => {
    setCurrentView(view);
    setShowDesktop(false);
  };

  const handleTaskbarClick = () => {
    setShowDesktop(!showDesktop);
  };

  return (
    <div className="desktop-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Desktop Area */}
      <div style={{ flex: 1, padding: '16px', overflow: 'auto', position: 'relative' }}>
        {/* Desktop Icons */}
        {showDesktop && (
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: 1
          }}>
            <DesktopIcon
              icon="🏠"
              label="Panel Principal"
              onClick={() => handleIconClick('dashboard')}
            />
            {user?.role === 'admin' && (
              <>
                <DesktopIcon
                  icon="📦"
                  label="Gestión de Productos"
                  onClick={() => handleIconClick('products')}
                />
                <DesktopIcon
                  icon="🏢"
                  label="Gestión de Marcas"
                  onClick={() => handleIconClick('brands')}
                />
              </>
            )}
            <DesktopIcon
              icon="🛒"
              label="Catálogo de Productos"
              onClick={() => handleIconClick('catalog')}
            />
            <DesktopIcon
              icon="👤"
              label="Mi Perfil"
              onClick={() => handleIconClick('profile')}
            />
          </div>
        )}
        
        {/* Window Content */}
        {!showDesktop && (
          <div style={{ position: 'relative', zIndex: 2 }}>
            {children}
          </div>
        )}
      </div>
      
      {/* Taskbar */}
      <div className="taskbar">
        {/* Start Button */}
        <button className="start-btn">
          <span style={{ marginRight: '4px' }}>🪟</span>
          <span>Inicio</span>
        </button>
        
        {/* Start Menu Separator */}
        <div className="taskbar-separator"></div>
        
        {/* Quick Launch */}
        <div className="quick-launch">
          <button title="Sistema de Ventas">💼</button>
        </div>
        
        {/* Application Area */}
        <div className="taskbar-labels" style={{ flex: 1 }}>
          {user && !showDesktop && (
            <button 
              className="taskbar-label" 
              style={{ backgroundColor: '#316ac5', color: 'white' }}
              onClick={handleTaskbarClick}
            >
              📋 Sistema de Gestión de Ventas
            </button>
          )}
          {showDesktop && (
            <button 
              className="taskbar-label" 
              style={{ backgroundColor: '#c0c0c0', color: 'black' }}
              onClick={handleTaskbarClick}
            >
              🖥️ Escritorio
            </button>
          )}
        </div>
        
        {/* System Tray */}
        <div className="tray">
          {user && (
            <>
              <div className="tray-item" style={{ fontSize: '11px', color: '#000' }}>
                👤 {user.name} ({user.role === 'admin' ? 'Admin' : 'Cliente'})
              </div>
              <button 
                className="tray-item"
                onClick={logout}
                title="Cerrar sesión"
                style={{ fontSize: '11px', color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ✕
              </button>
            </>
          )}
          <div className="tray-item">{currentTime}</div>
        </div>
      </div>
    </div>
  );
};

export default WindowsDesktop;