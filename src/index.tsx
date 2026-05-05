import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './routes/App';

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
