import React, { useEffect } from 'react';
import { useWindow } from '../../contexts/WindowContext';

interface WindowProps {
  id: string;
  title: string;
  icon?: string;
  children: React.ReactNode;
  onClose?: () => void;
  width?: string;
  height?: string;
  className?: string;
}

const Window: React.FC<WindowProps> = ({ 
  id,
  title,
  icon = '📋',
  children, 
  onClose, 
  width = 'auto', 
  height = 'auto',
  className = ''
}) => {
  const { addWindow, removeWindow, minimizeWindow, maximizeWindow, setActiveWindow, getWindow } = useWindow();
  const windowState = getWindow(id);

  useEffect(() => {
    addWindow(id, title, icon);
    return () => {
      if (onClose) {
        removeWindow(id);
      }
    };
  }, [id, title, icon]);

  const handleMinimize = () => {
    minimizeWindow(id);
  };

  const handleMaximize = () => {
    maximizeWindow(id);
  };

  const handleClose = () => {
    removeWindow(id);
    if (onClose) {
      onClose();
    }
  };

  const handleWindowClick = () => {
    setActiveWindow(id);
  };

  if (!windowState || windowState.isMinimized) {
    return null;
  }

  const windowStyle = {
    width: windowState.isMaximized ? '100vw' : width,
    height: windowState.isMaximized ? '100vh' : height,
    position: windowState.isMaximized ? 'fixed' as const : 'relative' as const,
    top: windowState.isMaximized ? 0 : 'auto',
    left: windowState.isMaximized ? 0 : 'auto',
    zIndex: windowState.zIndex,
  };

  return (
    <div 
      className={`window window-xp ${className}`} 
      style={windowStyle}
      onClick={handleWindowClick}
    >
      {/* Title Bar */}
      <div className="title-bar">
        <div className="title-bar-text">
          {icon} {title}
        </div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={handleMinimize}></button>
          <button aria-label="Maximize" onClick={handleMaximize}></button>
          <button aria-label="Close" onClick={handleClose}></button>
        </div>
      </div>
      
      {/* Window Content */}
      <div className="window-body" style={{ 
        height: windowState.isMaximized ? 'calc(100vh - 32px)' : 'auto',
        overflow: 'auto'
      }}>
        {children}
      </div>
    </div>
  );
};

export default Window;