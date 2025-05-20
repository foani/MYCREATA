import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

/**
 * 헤더 컴포넌트
 */
const Header: React.FC = () => {
  const { themeMode, toggleThemeMode } = useTheme();
  const location = useLocation();
  
  // 현재 경로에 따라 활성화된 탭 결정
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <header className="theme-transition bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/logo.svg" 
                alt="CreLink Logo"
                className="h-8 w-8"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/32';
                }}
              />
              <span className="ml-2 text-xl font-bold text-primary dark:text-primary">
                CreLink Demo
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex space-x-4">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/') 
                    ? 'text-primary dark:text-primary' 
                    : 'text-gray-700 hover:text-primary dark:text-gray-200 dark:hover:text-primary'
                }`}
              >
                홈
              </Link>
              <Link 
                to="/wallet" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/wallet') 
                    ? 'text-primary dark:text-primary' 
                    : 'text-gray-700 hover:text-primary dark:text-gray-200 dark:hover:text-primary'
                }`}
              >
                지갑
              </Link>
              <Link 
                to="/transactions" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/transactions') 
                    ? 'text-primary dark:text-primary' 
                    : 'text-gray-700 hover:text-primary dark:text-gray-200 dark:hover:text-primary'
                }`}
              >
                트랜잭션
              </Link>
              <Link 
                to="/did" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/did') 
                    ? 'text-primary dark:text-primary' 
                    : 'text-gray-700 hover:text-primary dark:text-gray-200 dark:hover:text-primary'
                }`}
              >
                DID
              </Link>
            </nav>
            
            <button
              onClick={toggleThemeMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              aria-label={themeMode === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
              {themeMode === 'dark' ? (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-yellow-300" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="5" strokeWidth="2" />
                  <line x1="12" y1="1" x2="12" y2="3" strokeWidth="2" />
                  <line x1="12" y1="21" x2="12" y2="23" strokeWidth="2" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeWidth="2" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeWidth="2" />
                  <line x1="1" y1="12" x2="3" y2="12" strokeWidth="2" />
                  <line x1="21" y1="12" x2="23" y2="12" strokeWidth="2" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeWidth="2" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeWidth="2" />
                </svg>
              ) : (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-indigo-700" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
            
            <button 
              className="block md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              aria-label="메뉴"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-gray-700 dark:text-gray-200" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;