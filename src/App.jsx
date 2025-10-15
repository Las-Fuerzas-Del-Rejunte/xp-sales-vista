import React, { useCallback, useState } from 'react';

import WinXP from 'WinXP';
import { useGA } from 'hooks';
import BootScreen from './pages/BootScreen';

const BOOT_COMPLETED_KEY = 'xp-sales.bootCompleted';

function hasBootedOnce() {
  if (typeof window === 'undefined') {
    return true;
  }
  try {
    return window.sessionStorage.getItem(BOOT_COMPLETED_KEY) === '1';
  } catch (_error) {
    return false;
  }
}

const App = () => {
  const [bootDone, setBootDone] = useState(hasBootedOnce);
  useGA('UA-135148027-3', 'winXP');

  const handleBootFinished = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(BOOT_COMPLETED_KEY, '1');
      }
    } catch (_error) {
      // ignored: sessionStorage may be unavailable (private mode / SSR)
    }
    setBootDone(true);
  }, []);

  if (!bootDone) {
    return <BootScreen onFinish={handleBootFinished} />;
  }

  return <WinXP />;
};

export default App;
