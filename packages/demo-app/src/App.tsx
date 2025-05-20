import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import HomePage from './pages/HomePage';
import WalletPage from './pages/WalletPage';
import TransactionsPage from './pages/TransactionsPage';
import DIDPage from './pages/DIDPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/wallet" element={<WalletPage />} />
      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/did" element={<DIDPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

// 404 페이지 컴포넌트
const NotFoundPage: React.FC = () => {
  return (
    <Layout>
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-500">404</h1>
            <p className="mt-2 text-lg text-gray-600">페이지를 찾을 수 없습니다.</p>
            <div className="mt-6">
              <a href="/" className="text-blue-500 hover:text-blue-700">
                홈으로 돌아가기
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default App;