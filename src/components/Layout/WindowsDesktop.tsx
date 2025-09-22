import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface WindowsDesktopProps {
  children: React.ReactNode;
}

const WindowsDesktop: React.FC<WindowsDesktopProps> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Desktop Area */}
      <div className="flex-1 p-4">
        {children}
      </div>
      
      {/* Taskbar */}
      <div className="h-12 bg-gradient-to-r from-blue-600 to-blue-800 border-t-2 border-gray-300 flex items-center px-2 shadow-lg">
        {/* Start Button */}
        <button className="xp-start-button flex items-center gap-2">
          <span className="text-lg">🪟</span>
          <span className="text-sm font-bold">Inicio</span>
        </button>
        
        {/* Spacer */}
        <div className="flex-1"></div>
        
        {/* System Tray */}
        <div className="flex items-center gap-2 text-white text-sm">
          {user && (
            <div className="flex items-center gap-2 bg-blue-700 px-3 py-1 rounded border border-blue-500">
              <span className="text-xs">👤</span>
              <span>{user.name}</span>
              <span className="text-xs">({user.role})</span>
            </div>
          )}
          
          {/* Clock */}
          <div className="bg-blue-700 px-3 py-1 rounded border border-blue-500 text-xs">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          
          {/* Logout */}
          {user && (
            <button 
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs border border-red-500"
              title="Cerrar sesión"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WindowsDesktop;