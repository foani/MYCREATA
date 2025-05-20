/**
 * 팝업 애플리케이션 시작점
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import '../i18n'; // i18n 초기화

// React 애플리케이션 렌더링
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
