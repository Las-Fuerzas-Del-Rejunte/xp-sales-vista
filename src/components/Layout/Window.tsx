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
  width = 'w-full max-w-4xl', 
  height = 'h-auto',
  className = ''
}) => {
  return (
    <div className={`xp-window ${width} ${height} ${className} mx-auto`}>
      {/* Title Bar */}
      <div className="xp-titlebar">
        <div className="flex items-center gap-2">
          <span className="text-sm">📋</span>
          <span className="text-sm font-bold">{title}</span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded text-xs font-bold border border-red-400"
          >
            ×
          </button>
        )}
      </div>
      
      {/* Window Content */}
      <div className="p-4 bg-gray-100 rounded-b-lg">
        {children}
      </div>
    </div>
  );
};

export default Window;