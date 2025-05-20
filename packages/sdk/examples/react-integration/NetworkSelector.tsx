import React, { useState, useEffect } from 'react';
import { useCreLink } from './CreLinkProvider';

// 지원하는 네트워크 목록 정의
export interface NetworkInfo {
  chainId: string;
  name: string;
  rpcUrl: string;
  currencySymbol: string;
  explorerUrl?: string;
  iconUrl?: string;
  color?: string;
  testnet?: boolean;
}

// 기본 지원 네트워크
export const SUPPORTED_NETWORKS: NetworkInfo[] = [
  {
    chainId: '0x3E8', // 1000
    name: 'Catena (CIP-20) Chain Mainnet',
    rpcUrl: 'https://cvm.node.creatachain.com',
    currencySymbol: 'CTA',
    explorerUrl: 'https://catena.explorer.creatachain.com',
    color: '#7B3FE4',
    testnet: false
  },
  {
    chainId: '0x2328', // 9000
    name: 'Catena (CIP-20) Chain Testnet',
    rpcUrl: 'https://consensus.testnet.cvm.creatachain.com',
    currencySymbol: 'CTA',
    explorerUrl: 'https://testnet.cvm.creatachain.com',
    color: '#1E88E5',
    testnet: true
  },
  {
    chainId: '0x89', // 137
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    currencySymbol: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
    color: '#8247E5',
    testnet: false
  },
  {
    chainId: '0x13881', // 80001
    name: 'Polygon Mumbai Testnet',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    currencySymbol: 'MATIC',
    explorerUrl: 'https://mumbai.polygonscan.com',
    color: '#7B3FE4',
    testnet: true
  },
  {
    chainId: '0xa4b1', // 42161
    name: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    currencySymbol: 'ETH',
    explorerUrl: 'https://arbiscan.io',
    color: '#28A0F0',
    testnet: false
  }
];

// NetworkSelector 속성 인터페이스
interface NetworkSelectorProps {
  className?: string;
  showTestnets?: boolean;
  onNetworkChange?: (network: NetworkInfo) => void;
}

/**
 * 체인 선택 드롭다운 컴포넌트
 * 
 * @param className 추가 CSS 클래스
 * @param showTestnets 테스트넷 표시 여부 (기본값: true)
 * @param onNetworkChange 네트워크 변경 이벤트 핸들러
 */
const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  className = '',
  showTestnets = true,
  onNetworkChange
}) => {
  // CreLink 컨텍스트에서 필요한 상태 및 함수 가져오기
  const { isConnected, chainId, switchChain, addChain } = useCreLink();
  
  // 현재 선택된 네트워크 상태
  const [currentNetwork, setCurrentNetwork] = useState<NetworkInfo | null>(null);
  
  // 드롭다운 열림/닫힘 상태
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  // 필터링된 네트워크 목록
  const filteredNetworks = showTestnets 
    ? SUPPORTED_NETWORKS 
    : SUPPORTED_NETWORKS.filter(network => !network.testnet);

  // 현재 체인 ID를 기반으로 현재 네트워크 정보 업데이트
  useEffect(() => {
    if (chainId) {
      const network = SUPPORTED_NETWORKS.find(n => n.chainId === chainId) || null;
      setCurrentNetwork(network);
    } else {
      setCurrentNetwork(null);
    }
  }, [chainId]);

  // 네트워크 전환 처리 함수
  const handleNetworkChange = async (network: NetworkInfo) => {
    setIsOpen(false);
    
    if (!isConnected) {
      return;
    }
    
    try {
      // 현재 네트워크와 다른 경우에만 전환
      if (network.chainId !== chainId) {
        // 먼저 switchChain을 시도
        try {
          await switchChain(network.chainId);
        } catch (error: any) {
          // 체인이 지갑에 등록되지 않은 경우 addChain 시도
          if (error.code === 4902) {
            await addChain({
              chainId: network.chainId,
              chainName: network.name,
              rpcUrls: [network.rpcUrl],
              nativeCurrency: {
                name: network.currencySymbol,
                symbol: network.currencySymbol,
                decimals: 18
              },
              blockExplorerUrls: network.explorerUrl ? [network.explorerUrl] : undefined
            });
          } else {
            throw error;
          }
        }
      }
      
      // 네트워크 변경 콜백 호출
      if (onNetworkChange) {
        onNetworkChange(network);
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  // 현재 네트워크 표시 렌더링
  const renderCurrentNetwork = () => {
    if (!isConnected) {
      return (
        <div className="text-gray-400">
          지갑 연결 필요
        </div>
      );
    }
    
    if (!currentNetwork) {
      return (
        <div className="text-gray-600">
          알 수 없는 네트워크
        </div>
      );
    }
    
    return (
      <div className="flex items-center space-x-2">
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: currentNetwork.color || '#6B7280' }}
        />
        <span>{currentNetwork.name}</span>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* 현재 네트워크 표시 버튼 */}
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
        disabled={!isConnected}
      >
        {renderCurrentNetwork()}
        <svg
          className={`w-5 h-5 ml-2 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      
      {/* 네트워크 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg overflow-hidden">
          <ul className="max-h-60 overflow-y-auto">
            {filteredNetworks.map((network) => (
              <li key={network.chainId}>
                <button
                  type="button"
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 ${
                    network.chainId === chainId ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                  onClick={() => handleNetworkChange(network)}
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: network.color || '#6B7280' }}
                  />
                  <span>
                    {network.name}
                    {network.testnet && (
                      <span className="ml-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                        (Testnet)
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NetworkSelector;
