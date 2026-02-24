import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

if (!container) {
  document.body.innerHTML = '<div style="color:white;padding:20px;font-family:sans-serif;">Root not found</div>';
  throw new Error('Root element not found');
}

const root = createRoot(container);

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error: any) {
  console.error('Render error:', error);
  container.innerHTML = `
    <div style="color:#cdd6f4;padding:40px;font-family:'Nunito',sans-serif;background:#1e1e2e;min-height:100vh;">
      <h1 style="color:#89b4fa;">Whisker Chat</h1>
      <p>Error: ${error.message}</p>
      <pre style="background:#313244;padding:20px;border-radius:8px;overflow:auto;">${error.stack}</pre>
    </div>
  `;
}
