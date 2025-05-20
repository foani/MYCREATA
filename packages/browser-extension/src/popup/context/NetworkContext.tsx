/**
 * NetworkContext
 * 네트워크 상태 및 기능을 관리하는 컨텍스트
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 네트워크 타입 정의
export interface Network {
  chainId: number;
  chainIdHex: string;
  name: string;
  rpcUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrl?: string;
  iconUrl?: string;
}

// 네트워크 컨텍스트 타입 정의
interface NetworkContextType {
  networks: Network[];
  selectedNetwork: Network | null;
  selectNetwork: (chainId: number) => Promise<void>;
  addNetwork: (network: Network) => Promise<void>;
  updateNetwork: (chainId: number, updates: Partial<Network>) => Promise<void>;
  removeNetwork: (chainId: number) => Promise<void>;
  refreshNetworks: () => Promise<void>;
  testRpcConnection: (rpcUrl: string) => Promise<boolean>;
}

// 기본 컨텍스트 값
const defaultContextValue: NetworkContextType = {
  networks: [],
  selectedNetwork: null,
  selectNetwork: async () => {},
  addNetwork: async () => {},
  updateNetwork: async () => {},
  removeNetwork: async () => {},
  refreshNetworks: async () => {},
  testRpcConnection: async () => false,
};

// 컨텍스트 생성
const NetworkContext = createContext<NetworkContextType>(defaultContextValue);

// Props 타입 정의
interface NetworkProviderProps {
  children: ReactNode;
}

/**
 * 네트워크 프로바이더 컴포넌트
 * @param children 자식 컴포넌트
 */
export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  // 상태 정의
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  
  // 초기화
  useEffect(() => {
    const initialize = async () => {
      try {
        await refreshNetworksInternal();
      } catch (error) {
        console.error('네트워크 초기화 중 오류:', error);
      }
    };
    
    initialize();
  }, []);
  
  /**
   * 네트워크 정보 새로고침 (내부 함수)
   */
  const refreshNetworksInternal = async () => {
    try {
      // 네트워크 목록 조회
      const networksResult = await chrome.runtime.sendMessage({
        type: 'internal',
        method: 'getAllNetworks',
      });
      
      const networksList = networksResult.result || [];
      setNetworks(networksList);
      
      // 선택된 네트워크 조회
      const selectedResult = await chrome.runtime.sendMessage({
        type: 'internal',
        method: 'getSelectedNetwork',
      });
      
      setSelectedNetwork(selectedResult.result || null);
    } catch (error) {
      console.error('네트워크 정보 조회 중 오류:', error);
    }
  };
  
  /**
   * 네트워크 선택
   * @param chainId 체인 ID
   */
  const selectNetwork = async (chainId: number): Promise<void> => {
    try {
      const result = await chrome.runtime.sendMessage({
        type: 'internal',
        method: 'selectNetwork',
        params: { chainId },
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // 선택된 네트워크 업데이트
      const network = networks.find((net) => net.chainId === chainId);
      setSelectedNetwork(network || null);
    } catch (error) {
      console.error('네트워크 선택 중 오류:', error);
      throw error;
    }
  };
  
  /**
   * 새 네트워크 추가
   * @param network 네트워크 정보
   */
  const addNetwork = async (network: Network): Promise<void> => {
    try {
      const result = await chrome.runtime.sendMessage({
        type: 'internal',
        method: 'addNetwork',
        params: { chainInfo: network },
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // 네트워크 목록 새로고침
      await refreshNetworksInternal();
    } catch (error) {
      console.error('네트워크 추가 중 오류:', error);
      throw error;
    }
  };
  
  /**
   * 네트워크 정보 업데이트
   * @param chainId 체인 ID
   * @param updates 업데이트할 속성
   */
  const updateNetwork = async (chainId: number, updates: Partial<Network>): Promise<void> => {
    try {
      const result = await chrome.runtime.sendMessage({
        type: 'internal',
        method: 'updateNetwork',
        params: { chainId, updates },
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // 네트워크 목록 새로고침
      await refreshNetworksInternal();
    } catch (error) {
      console.error('네트워크 업데이트 중 오류:', error);
      throw error;
    }
  };
  
  /**
   * 네트워크 삭제
   * @param chainId 체인 ID
   */
  const removeNetwork = async (chainId: number): Promise<void> => {
    try {
      const result = await chrome.runtime.sendMessage({
        type: 'internal',
        method: 'removeNetwork',
        params: { chainId },
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // 네트워크 목록 새로고침
      await refreshNetworksInternal();
    } catch (error) {
      console.error('네트워크 삭제 중 오류:', error);
      throw error;
    }
  };
  
  /**
   * 네트워크 정보 새로고침
   */
  const refreshNetworks = async (): Promise<void> => {
    await refreshNetworksInternal();
  };
  
  /**
   * RPC URL 연결 테스트
   * @param rpcUrl RPC URL
   * @returns 연결 성공 여부
   */
  const testRpcConnection = async (rpcUrl: string): Promise<boolean> => {
    try {
      const result = await chrome.runtime.sendMessage({
        type: 'internal',
        method: 'testRpcConnection',
        params: { rpcUrl },
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result.result;
    } catch (error) {
      console.error('RPC 연결 테스트 중 오류:', error);
      return false;
    }
  };
  
  // 컨텍스트 값
  const contextValue: NetworkContextType = {
    networks,
    selectedNetwork,
    selectNetwork,
    addNetwork,
    updateNetwork,
    removeNetwork,
    refreshNetworks,
    testRpcConnection,
  };
  
  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
    </NetworkContext.Provider>
  );
};

/**
 * 네트워크 컨텍스트 훅
 * @returns 네트워크 컨텍스트 값
 */
export const useNetwork = () => {
  return useContext(NetworkContext);
};