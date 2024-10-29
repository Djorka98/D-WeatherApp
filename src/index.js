import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import * as serviceWorkerRegistration from './services/serviceWorkerRegistration';
import './i18n';

const root = ReactDOM.createRoot(document.getElementById('root'));
serviceWorkerRegistration.register();
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);