import React from 'react';

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
  return (
    <div className={`window window-xp ${className}`} style={{ width, height }}>
      {/* Title Bar */}
      <div className="title-bar">
        <div className="title-bar-text">
          {title}
        </div>
        <div className="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Maximize"></button>
          {onClose && (
            <button aria-label="Close" onClick={onClose}></button>
          )}
        </div>
      </div>
      
      {/* Window Content */}
      <div className="window-body">
        {children}
      </div>
    </div>
  );
};

export default Window;