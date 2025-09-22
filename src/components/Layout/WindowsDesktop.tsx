import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface WindowsDesktopProps {
  children: React.ReactNode;
}

const WindowsDesktop: React.FC<WindowsDesktopProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="desktop-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Desktop Area */}
      <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
        {children}
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
          {user && (
            <button className="taskbar-label" style={{ backgroundColor: '#316ac5', color: 'white' }}>
              📋 Sistema de Gestión de Ventas
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