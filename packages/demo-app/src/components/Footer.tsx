import React from 'react';
import { Link } from 'react-router-dom';

/**
 * 푸터 컴포넌트
 */
const Footer: React.FC = () => {
  return (
    <footer className="theme-transition bg-gray-100 dark:bg-gray-800 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
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
                CreLink
              </span>
            </Link>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Catena 메인넷 기반 상용화 지갑
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
                라이브러리
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/wallet" className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary">
                    지갑 관리
                  </Link>
                </li>
                <li>
                  <Link to="/transactions" className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary">
                    트랜잭션 처리
                  </Link>
                </li>
                <li>
                  <Link to="/did" className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary">
                    DID 시스템
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
                리소스
              </h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="https://github.com/CreataChain/CreLink" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a 
                    href="/docs"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                  >
                    문서
                  </a>
                </li>
                <li>
                  <a 
                    href="/api"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                  >
                    API 참조
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
                연락처
              </h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="mailto:info@creatachain.com"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                  >
                    info@creatachain.com
                  </a>
                </li>
                <li>
                  <a 
                    href="https://twitter.com/creatachain"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a 
                    href="https://t.me/creatachain"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                  >
                    Telegram
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} CreataChain. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;