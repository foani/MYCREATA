/**
 * 네트워크 선택기 컴포넌트
 * 사용 가능한 블록체인 네트워크 목록을 표시하고 선택할 수 있는 컴포넌트
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNetwork, Network } from '../context/NetworkContext';

// Props 타입 정의
interface NetworkSelectorProps {
  minimal?: boolean;
  className?: string;
}

/**
 * 네트워크 선택기 컴포넌트
 * @param minimal 최소 모드 (아이콘과 이름만 표시)
 * @param className 추가 CSS 클래스
 */
const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  minimal = false,
  className = '',
}) => {
  const { networks, selectedNetwork, selectNetwork } = useNetwork();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // 네트워크 색상 맵
  const networkColors: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
    1000: { bg: 'bg-blue-100', text: 'text-blue-800', darkBg: 'dark:bg-blue-900', darkText: 'dark:text-blue-200' }, // Catena Mainnet
    9000: { bg: 'bg-purple-100', text: 'text-purple-800', darkBg: 'dark:bg-purple-900', darkText: 'dark:text-purple-200' }, // Catena Testnet
    1: { bg: 'bg-blue-100', text: 'text-blue-800', darkBg: 'dark:bg-blue-900', darkText: 'dark:text-blue-200' }, // Ethereum
    137: { bg: 'bg-purple-100', text: 'text-purple-800', darkBg: 'dark:bg-purple-900', darkText: 'dark:text-purple-200' }, // Polygon
    42161: { bg: 'bg-indigo-100', text: 'text-indigo-800', darkBg: 'dark:bg-indigo-900', darkText: 'dark:text-indigo-200' }, // Arbitrum
    default: { bg: 'bg-gray-100', text: 'text-gray-800', darkBg: 'dark:bg-gray-800', darkText: 'dark:text-gray-200' }, // Default
  };
  
  // 네트워크 색상 가져오기
  const getNetworkColors = (chainId: number) => {
    return networkColors[chainId] || networkColors.default;
  };
  
  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // 네트워크 선택 핸들러
  const handleNetworkSelect = async (chainId: number) => {
    try {
      await selectNetwork(chainId);
      setIsOpen(false);
    } catch (error) {
      console.error('네트워크 변경 중 오류:', error);
    }
  };
  
  // 네트워크 아이콘 (기본 아이콘)
  const renderNetworkIcon = (network: Network) => {
    const colors = getNetworkColors(network.chainId);
    
    // 실제 구현에서는 네트워크별 아이콘 사용
    return (
      <div className={`w-4 h-4 rounded-full ${colors.bg} ${colors.darkBg}`}></div>
    );
  };
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* 선택된 네트워크 표시 */}
      <button
        type="button"
        className={`
          flex items-center
          ${minimal ? 'px-2 py-1 text-sm' : 'px-3 py-2 text-base'}
          border border-gray-200 dark:border-gray-700
          rounded-lg
          bg-white dark:bg-gray-800
          hover:bg-gray-50 dark:hover:bg-gray-700
          transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedNetwork ? (
          <>
            {/* 네트워크 아이콘 */}
            <span className="mr-2">{renderNetworkIcon(selectedNetwork)}</span>
            
            {/* 네트워크 이름 */}
            <span className="font-medium text-gray-900 dark:text-white">
              {minimal && selectedNetwork.name.length > 12
                ? selectedNetwork.name.substring(0, 10) + '...'
                : selectedNetwork.name}
            </span>
            
            {/* 드롭다운 아이콘 */}
            <svg
              className="w-4 h-4 ml-2 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">네트워크 선택</span>
        )}
      </button>
      
      {/* 네트워크 드롭다운 목록 */}
      {isOpen && (
        <div className="absolute z-10 w-56 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1">
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              네트워크 선택
            </h3>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {networks.map((network) => {
              const colors = getNetworkColors(network.chainId);
              const isSelected = selectedNetwork?.chainId === network.chainId;
              
              return (
                <button
                  key={network.chainId}
                  className={`
                    w-full px-3 py-2 text-left flex items-center
                    hover:bg-gray-50 dark:hover:bg-gray-700
                    ${isSelected ? 'bg-gray-50 dark:bg-gray-700' : ''}
                  `}
                  onClick={() => handleNetworkSelect(network.chainId)}
                >
                  {/* 네트워크 아이콘 */}
                  <span className="mr-3">{renderNetworkIcon(network)}</span>
                  
                  {/* 네트워크 정보 */}
                  <div className="flex-grow">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {network.name}
                    </p>
                    {!minimal && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {network.nativeCurrency.symbol} · Chain ID: {network.chainId}
                      </p>
                    )}
                  </div>
                  
                  {/* 선택 표시 */}
                  {isSelected && (
                    <svg
                      className="w-5 h-5 text-blue-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* 네트워크 관리 링크 */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2">
            <button
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              onClick={() => {
                setIsOpen(false);
                // 네트워크 설정 페이지로 이동
                // window.location.href = '/settings/network';
              }}
            >
              네트워크 관리
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkSelector;