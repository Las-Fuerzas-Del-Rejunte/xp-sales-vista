import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import 'assets/clear.css';
import 'assets/font.css';
import App from './App';
import { AppStateProvider } from 'state/AppStateContext';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <AppStateProvider>
    <App />
  </AppStateProvider>,
  document.getElementById('root'),
);

serviceWorker.register();

if (module.hot && !window.frameElement) {
  console.log('HMR enabled');
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;
    ReactDOM.render(
      <AppStateProvider>
        <NextApp />
      </AppStateProvider>,
      document.getElementById('root'),
    );
  });
}
