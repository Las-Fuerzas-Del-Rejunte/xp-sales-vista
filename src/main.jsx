import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import 'assets/clear.css';
import 'assets/font.css';
import App from './App';
import { AppStateProvider } from 'state/AppStateContext';
import * as serviceWorker from './serviceWorker';

const rootElement = document.getElementById('root');

const render = Component => {
  ReactDOM.render(
    <AppStateProvider>
      <Component />
    </AppStateProvider>,
    rootElement,
  );
};

render(App);

serviceWorker.register();

if (import.meta.hot && !window.frameElement) {
  console.log('HMR enabled');
  import.meta.hot.accept('./App', ({ default: NextApp }) => {
    render(NextApp);
  });
}
