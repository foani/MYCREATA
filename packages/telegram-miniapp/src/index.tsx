import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 웹 성능 측정을 위한 옵션 (필요에 따라 활성화)
reportWebVitals(
  process.env.NODE_ENV === 'development'
    ? (metric) => console.log(metric)
    : null
);
