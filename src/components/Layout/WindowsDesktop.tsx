import React, { useState } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useApp } from '../../contexts/SupabaseAppContext';
import { useWindow } from '../../contexts/WindowContext';
import DesktopIcon from './DesktopIcon';

interface WindowsDesktopProps {
  children: React.ReactNode;
}

const WindowsDesktop: React.FC<WindowsDesktopProps> = ({ children }) => {
  const { profile, signOut } = useAuth();
  const { setCurrentView } = useApp();
  const { windows, restoreWindow } = useWindow();
  const [showDesktop, setShowDesktop] = useState(true);
  const [showStartMenu, setShowStartMenu] = useState(false);
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleIconClick = (view: string) => {
    setCurrentView(view);
    setShowDesktop(false);
  };

  const handleTaskbarClick = () => {
    setShowDesktop(!showDesktop);
  };

  const handleStartClick = () => {
    setShowStartMenu(!showStartMenu);
  };

  const handleStartMenuClick = (view: string) => {
    setCurrentView(view);
    setShowDesktop(false);
    setShowStartMenu(false);
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
            {profile?.role === 'admin' && (
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
      
      {/* Start Menu */}
      {showStartMenu && (
        <div className="start-menu">
          {/* User Header */}
          <div className="start-menu-header">
            <div className="start-menu-user-icon">👤</div>
            <div className="start-menu-user-name">{profile?.name || 'Usuario'}</div>
          </div>
          
          {/* Menu Content */}
          <div className="start-menu-content">
            {/* Left Column - Applications */}
            <div className="start-menu-left">
              <div className="start-menu-item" onClick={() => handleStartMenuClick('dashboard')}>
                <div className="start-menu-icon">🏠</div>
                <div className="start-menu-text">
                  <div className="start-menu-title">Panel Principal</div>
                  <div className="start-menu-subtitle">Dashboard del sistema</div>
                </div>
              </div>
              
              <div className="start-menu-item" onClick={() => handleStartMenuClick('catalog')}>
                <div className="start-menu-icon">🛒</div>
                <div className="start-menu-text">
                  <div className="start-menu-title">Catálogo de Productos</div>
                  <div className="start-menu-subtitle">Explorar productos</div>
                </div>
              </div>
              
              <div className="start-menu-item" onClick={() => handleStartMenuClick('profile')}>
                <div className="start-menu-icon">👤</div>
                <div className="start-menu-text">
                  <div className="start-menu-title">Mi Perfil</div>
                  <div className="start-menu-subtitle">Configuración de usuario</div>
                </div>
              </div>
              
              {profile?.role === 'admin' && (
                <>
                  <div className="start-menu-item" onClick={() => handleStartMenuClick('products')}>
                    <div className="start-menu-icon">📦</div>
                    <div className="start-menu-text">
                      <div className="start-menu-title">Gestión de Productos</div>
                      <div className="start-menu-subtitle">Administrar productos</div>
                    </div>
                  </div>
                  
                  <div className="start-menu-item" onClick={() => handleStartMenuClick('brands')}>
                    <div className="start-menu-icon">🏢</div>
                    <div className="start-menu-text">
                      <div className="start-menu-title">Gestión de Marcas</div>
                      <div className="start-menu-subtitle">Administrar marcas</div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Right Column - System Items */}
            <div className="start-menu-right">
              <div className="start-menu-system-item" onClick={() => handleStartMenuClick('profile')}>
                <div className="start-menu-system-icon">📁</div>
                <span>Mi Perfil</span>
              </div>
              
              <div className="start-menu-system-item" onClick={() => handleStartMenuClick('catalog')}>
                <div className="start-menu-system-icon">📄</div>
                <span>Mis Documentos</span>
              </div>
              
              <div className="start-menu-system-item">
                <div className="start-menu-system-icon">🖼️</div>
                <span>Mis Imágenes</span>
              </div>
              
              <div className="start-menu-system-item">
                <div className="start-menu-system-icon">🎵</div>
                <span>Mi Música</span>
              </div>
              
              <div className="start-menu-system-item">
                <div className="start-menu-system-icon">💻</div>
                <span>Mi PC</span>
              </div>
              
              <div className="start-menu-separator"></div>
              
              <div className="start-menu-system-item">
                <div className="start-menu-system-icon">⚙️</div>
                <span>Panel de Control</span>
              </div>
              
              <div className="start-menu-system-item">
                <div className="start-menu-system-icon">🔍</div>
                <span>Buscar</span>
              </div>
              
              <div className="start-menu-system-item">
                <div className="start-menu-system-icon">❓</div>
                <span>Ayuda y Soporte</span>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="start-menu-footer">
            <button className="start-menu-footer-btn" onClick={signOut}>
              <span>🚪</span>
              <span>Cerrar sesión</span>
            </button>
            <button className="start-menu-footer-btn">
              <span>🔌</span>
              <span>Apagar equipo</span>
            </button>
          </div>
        </div>
      )}

      {/* Taskbar */}
      <div className="taskbar">
        {/* Start Button */}
        <button className="start-btn" onClick={handleStartClick}>
          <span style={{ marginRight: '4px' }}>🪟</span>
          <span>inicio</span>
        </button>
        
        {/* Start Menu Separator */}
        <div className="taskbar-separator"></div>
        
        {/* Quick Launch */}
        <div className="quick-launch">
          <button title="Sistema de Ventas" onClick={() => handleStartMenuClick('dashboard')}>💼</button>
        </div>
        
        {/* Application Area */}
        <div className="taskbar-labels" style={{ flex: 1, display: 'flex', gap: '2px' }}>
          {windows.map((window) => (
            <button
              key={window.id}
              className="taskbar-label"
              style={{
                backgroundColor: window.isMinimized ? '#c0c0c0' : '#316ac5',
                color: window.isMinimized ? 'black' : 'white',
              }}
              onClick={() => restoreWindow(window.id)}
            >
              {window.icon} {window.title}
            </button>
          ))}
        </div>
        
        {/* System Tray */}
        <div className="tray">
          {profile && (
            <>
              <div className="tray-item" style={{ fontSize: '11px', color: '#000' }}>
                👤 {profile.name} ({profile.role === 'admin' ? 'Admin' : 'Cliente'})
              </div>
              <button 
                className="tray-item"
                onClick={signOut}
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