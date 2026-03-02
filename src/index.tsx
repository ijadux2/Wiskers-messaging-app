import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log('Whisker Chat: Starting...');

const container = document.getElementById('root');

if (!container) {
  document.body.innerHTML = '<div style="color:#cdd6f4;padding:40px;font-family:sans-serif;background:#1e1e2e;min-height:100vh;"><h1>Root not found</h1></div>';
  throw new Error('Root element not found');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('Whisker Chat: Rendered');
