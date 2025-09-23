import React from 'react';

interface DesktopIconProps {
  icon: string;
  label: string;
  onClick: () => void;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ icon, label, onClick }) => {
  return (
    <div 
      className="desktop-icon"
      onClick={onClick}
      onDoubleClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px',
        margin: '8px',
        cursor: 'pointer',
        borderRadius: '4px',
        minWidth: '80px',
        maxWidth: '80px',
        textAlign: 'center',
        userSelect: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
      }}
    >
      <div style={{ 
        fontSize: '32px', 
        marginBottom: '4px',
        filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.5))'
      }}>
        {icon}
      </div>
      <span style={{ 
        fontSize: '11px', 
        color: 'white',
        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
        fontWeight: 'bold',
        lineHeight: '1.2'
      }}>
        {label}
      </span>
    </div>
  );
};

export default DesktopIcon;