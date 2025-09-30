import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WindowState {
  id: string;
  title: string;
  icon: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface WindowContextType {
  windows: WindowState[];
  activeWindowId: string | null;
  addWindow: (id: string, title: string, icon: string) => void;
  removeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  setActiveWindow: (id: string) => void;
  getWindow: (id: string) => WindowState | undefined;
}

const WindowContext = createContext<WindowContextType | undefined>(undefined);

export const WindowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(100);

  const addWindow = (id: string, title: string, icon: string) => {
    setWindows((prev) => {
      const exists = prev.find((w) => w.id === id);
      if (exists) {
        return prev.map((w) => 
          w.id === id 
            ? { ...w, isMinimized: false, zIndex: maxZIndex + 1 }
            : w
        );
      }
      return [...prev, { 
        id, 
        title, 
        icon, 
        isMinimized: false, 
        isMaximized: false, 
        zIndex: maxZIndex + 1 
      }];
    });
    setMaxZIndex(maxZIndex + 1);
    setActiveWindowId(id);
  };

  const removeWindow = (id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const minimizeWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
  };

  const maximizeWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
    );
  };

  const restoreWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: false, zIndex: maxZIndex + 1 } : w))
    );
    setMaxZIndex(maxZIndex + 1);
    setActiveWindowId(id);
  };

  const setActiveWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: maxZIndex + 1 } : w))
    );
    setMaxZIndex(maxZIndex + 1);
    setActiveWindowId(id);
  };

  const getWindow = (id: string) => {
    return windows.find((w) => w.id === id);
  };

  return (
    <WindowContext.Provider
      value={{
        windows,
        activeWindowId,
        addWindow,
        removeWindow,
        minimizeWindow,
        maximizeWindow,
        restoreWindow,
        setActiveWindow,
        getWindow,
      }}
    >
      {children}
    </WindowContext.Provider>
  );
};

export const useWindow = () => {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error('useWindow must be used within a WindowProvider');
  }
  return context;
};