import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { MMKV } from 'react-native-mmkv';
import { ethers } from 'ethers';
import { Network } from '../types/network';
import { NETWORKS } from '../constants/networks';

// 스토리지 인스턴스
const storage = new MMKV();

// 네트워크 컨텍스트 타입
interface NetworkContextType {
  networks: Network[];
  selectedNetwork: Network;
  provider: ethers.JsonRpcProvider | null;
  isConnected: boolean;
  
  // 네트워크 메서드
  selectNetwork: (chainId: number) => void;
  addCustomNetwork: (network: Network) => Promise<boolean>;
  editCustomNetwork: (chainId: number, updates: Partial<Network>) => Promise<boolean>;
  removeCustomNetwork: (chainId: number) => Promise<boolean>;
  checkConnection: () => Promise<boolean>;
}

// 기본값으로 컨텍스트 생성
const NetworkContext = createContext<NetworkContextType>({
  networks: NETWORKS,
  selectedNetwork: NETWORKS[0],
  provider: null,
  isConnected: false,
  
  selectNetwork: () => {},
  addCustomNetwork: async () => false,
  editCustomNetwork: async () => false,
  removeCustomNetwork: async () => false,
  checkConnection: async () => false,
});

interface NetworkProviderProps {
  children: ReactNode;
}

/**
 * 네트워크 프로바이더 컴포넌트
 */
export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [networks, setNetworks] = useState<Network[]>(NETWORKS);
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(NETWORKS[0]);
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    initializeNetworks();
  }, []);

  // 선택된 네트워크가 변경될 때 프로바이더 업데이트
  useEffect(() => {
    updateProvider();
  }, [selectedNetwork]);

  /**
   * 네트워크 초기화
   */
  const initializeNetworks = async () => {
    try {
      // 저장된 커스텀 네트워크 불러오기
      const savedNetworksJson = storage.getString('customNetworks');
      const customNetworks = savedNetworksJson ? JSON.parse(savedNetworksJson) : [];
      
      // 기본 네트워크와 커스텀 네트워크 병합
      const mergedNetworks = [...NETWORKS, ...customNetworks];
      setNetworks(mergedNetworks);
      
      // 저장된 선택 네트워크 불러오기
      const savedChainId = storage.getNumber('selectedChainId');
      if (savedChainId) {
        const network = mergedNetworks.find(n => n.chainId === savedChainId);
        if (network) {
          setSelectedNetwork(network);
        }
      }
    } catch (error) {
      console.error('Failed to initialize networks:', error);
    }
  };

  /**
   * 프로바이더 업데이트
   */
  const updateProvider = async () => {
    try {
      // 이전 프로바이더 제거
      if (provider) {
        provider.removeAllListeners();
      }
      
      // 새 프로바이더 생성
      const newProvider = new ethers.JsonRpcProvider(selectedNetwork.rpcUrl);
      setProvider(newProvider);
      
      // 연결 확인
      const connected = await checkConnection();
      setIsConnected(connected);
    } catch (error) {
      console.error('Failed to update provider:', error);
      setProvider(null);
      setIsConnected(false);
    }
  };

  /**
   * 네트워크 선택
   */
  const selectNetwork = (chainId: number) => {
    const network = networks.find(n => n.chainId === chainId);
    if (network) {
      setSelectedNetwork(network);
      storage.set('selectedChainId', chainId);
    }
  };

  /**
   * 커스텀 네트워크 추가
   */
  const addCustomNetwork = async (network: Network): Promise<boolean> => {
    try {
      // 같은 chainId를 가진 네트워크가 이미 존재하는지 확인
      if (networks.some(n => n.chainId === network.chainId)) {
        return false;
      }
      
      // 커스텀 네트워크 가져오기
      const savedNetworksJson = storage.getString('customNetworks');
      const customNetworks = savedNetworksJson ? JSON.parse(savedNetworksJson) : [];
      
      // 새 네트워크 추가
      const updatedCustomNetworks = [...customNetworks, network];
      storage.set('customNetworks', JSON.stringify(updatedCustomNetworks));
      
      // 네트워크 목록 업데이트
      const updatedNetworks = [...NETWORKS, ...updatedCustomNetworks];
      setNetworks(updatedNetworks);
      
      return true;
    } catch (error) {
      console.error('Failed to add custom network:', error);
      return false;
    }
  };

  /**
   * 커스텀 네트워크 수정
   */
  const editCustomNetwork = async (chainId: number, updates: Partial<Network>): Promise<boolean> => {
    try {
      // 기본 네트워크인지 확인
      if (NETWORKS.some(n => n.chainId === chainId)) {
        return false;
      }
      
      // 커스텀 네트워크 가져오기
      const savedNetworksJson = storage.getString('customNetworks');
      const customNetworks = savedNetworksJson ? JSON.parse(savedNetworksJson) : [];
      
      // 네트워크 업데이트
      const updatedCustomNetworks = customNetworks.map((network: Network) => {
        if (network.chainId === chainId) {
          return { ...network, ...updates };
        }
        return network;
      });
      
      storage.set('customNetworks', JSON.stringify(updatedCustomNetworks));
      
      // 네트워크 목록 업데이트
      const updatedNetworks = [...NETWORKS, ...updatedCustomNetworks];
      setNetworks(updatedNetworks);
      
      // 선택된 네트워크가 수정된 경우 업데이트
      if (selectedNetwork.chainId === chainId) {
        const updatedNetwork = updatedNetworks.find(n => n.chainId === chainId);
        if (updatedNetwork) {
          setSelectedNetwork(updatedNetwork);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to edit custom network:', error);
      return false;
    }
  };

  /**
   * 커스텀 네트워크 제거
   */
  const removeCustomNetwork = async (chainId: number): Promise<boolean> => {
    try {
      // 기본 네트워크인지 확인
      if (NETWORKS.some(n => n.chainId === chainId)) {
        return false;
      }
      
      // 커스텀 네트워크 가져오기
      const savedNetworksJson = storage.getString('customNetworks');
      const customNetworks = savedNetworksJson ? JSON.parse(savedNetworksJson) : [];
      
      // 네트워크 제거
      const updatedCustomNetworks = customNetworks.filter((network: Network) => network.chainId !== chainId);
      storage.set('customNetworks', JSON.stringify(updatedCustomNetworks));
      
      // 네트워크 목록 업데이트
      const updatedNetworks = [...NETWORKS, ...updatedCustomNetworks];
      setNetworks(updatedNetworks);
      
      // 선택된 네트워크가 제거된 경우 기본 네트워크로 변경
      if (selectedNetwork.chainId === chainId) {
        setSelectedNetwork(NETWORKS[0]);
        storage.set('selectedChainId', NETWORKS[0].chainId);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to remove custom network:', error);
      return false;
    }
  };

  /**
   * 네트워크 연결 확인
   */
  const checkConnection = async (): Promise<boolean> => {
    if (!provider) {
      return false;
    }
    
    try {
      // 블록 번호를 가져와서 연결 확인
      const blockNumber = await provider.getBlockNumber();
      return blockNumber > 0;
    } catch (error) {
      console.error('Failed to check connection:', error);
      return false;
    }
  };

  // 컨텍스트 값
  const contextValue: NetworkContextType = {
    networks,
    selectedNetwork,
    provider,
    isConnected,
    
    selectNetwork,
    addCustomNetwork,
    editCustomNetwork,
    removeCustomNetwork,
    checkConnection,
  };

  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
    </NetworkContext.Provider>
  );
};

/**
 * 네트워크 컨텍스트 사용 훅
 */
export const useNetwork = () => useContext(NetworkContext);
