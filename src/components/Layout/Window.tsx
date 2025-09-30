import React, { useState } from 'react';

interface WindowProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  width?: string;
  height?: string;
  className?: string;
}

const Window: React.FC<WindowProps> = ({ 
  title, 
  children, 
  onClose, 
  width = 'auto', 
  height = 'auto',
  className = ''
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const windowStyle = {
    width: isMaximized ? '100vw' : width,
    height: isMaximized ? '100vh' : height,
    position: isMaximized ? 'fixed' as const : 'relative' as const,
    top: isMaximized ? 0 : 'auto',
    left: isMaximized ? 0 : 'auto',
    zIndex: isMaximized ? 1000 : 'auto',
    display: isMinimized ? 'none' : 'block'
  };

  return (
    <div className={`window window-xp ${className}`} style={windowStyle}>
      {/* Title Bar */}
      <div className="title-bar">
        <div className="title-bar-text">
          {title}
        </div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={handleMinimize}></button>
          <button aria-label="Maximize" onClick={handleMaximize}></button>
          <button aria-label="Close" onClick={onClose}></button>
        </div>
      </div>
      
      {/* Window Content */}
      <div className="window-body" style={{ 
        height: isMaximized ? 'calc(100vh - 32px)' : 'auto',
        overflow: 'auto'
      }}>
        {children}
      </div>
    </div>
  );
};

export default Window;