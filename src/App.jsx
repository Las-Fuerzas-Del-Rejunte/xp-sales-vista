import React, { useState } from 'react';

import WinXP from 'WinXP';
import { useGA } from 'hooks';
import BootScreen from './pages/BootScreen';

const App = () => {
  const [bootDone, setBootDone] = useState(false);
  useGA('UA-135148027-3', 'winXP');
  if (!bootDone) {
    return <BootScreen onFinish={() => setBootDone(true)} />;
  }
  return <WinXP />;
};

export default App;
