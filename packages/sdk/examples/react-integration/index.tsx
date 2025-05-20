import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ExampleApp from './ExampleApp';
import AdvancedExampleApp from './AdvancedExampleApp';

/**
 * CreLink React 통합 예제 앱
 * 
 * 이 애플리케이션은 CreLink 지갑 SDK를 React 애플리케이션에 통합하는 두 가지 예제를 제공합니다:
 * 1. 기본 예제: 간단한 연결, 체인 전환, 메시지 서명, 트랜잭션 전송 기능 시연
 * 2. 고급 예제: 탭 네비게이션, 추가 컴포넌트, 트랜잭션 내역 등 더 복잡한 기능 시연
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  CreLink SDK
                </h1>
              </div>
              
              <nav className="flex space-x-4">
                <Link 
                  to="/" 
                  className="px-3 py-2 text-sm font-medium rounded-md text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  기본 예제
                </Link>
                <Link 
                  to="/advanced" 
                  className="px-3 py-2 text-sm font-medium rounded-md text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  고급 예제
                </Link>
                <a 
                  href="https://github.com/creatachain/crelink-wallet" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-3 py-2 text-sm font-medium rounded-md text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  GitHub
                </a>
              </nav>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<ExampleApp />} />
            <Route path="/advanced" element={<AdvancedExampleApp />} />
          </Routes>
        </main>
        
        <footer className="bg-white dark:bg-gray-800 shadow-sm mt-auto">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                &copy; {new Date().getFullYear()} CreLinkWallet. All rights reserved.
              </div>
              <div className="flex space-x-4">
                <a 
                  href="https://creatachain.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  CreataChain
                </a>
                <a 
                  href="https://docs.creatachain.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  Docs
                </a>
                <a 
                  href="https://github.com/creatachain" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

// 루트 엘리먼트에 앱 렌더링
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
