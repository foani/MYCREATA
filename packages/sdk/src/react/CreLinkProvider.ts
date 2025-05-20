import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { CreLink } from '../index';
import { EventType, TransactionParams } from '../types';

// CreLink Provider 상태 타입 정의
export interface CreLinkProviderState {
  isConnected: boolean;
  accounts: string[];
  chainId: string | null;
  balance: string | null;
  connecting: boolean;
  error: Error | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchChain: (chainId: string) => Promise<void>;
  addChain: (chainParams: any) => Promise<void>;
  sendTransaction: (txParams: TransactionParams) => Promise<string>;
  signMessage: (message: string, address?: string) => Promise<string>;
  signTypedData: (typedData: any, address?: string) => Promise<string>;
  getBalance: (address?: string) => Promise<string>;
}

// 기본 Context 값 설정
const defaultContextValue: CreLinkProviderState = {
  isConnected: false,
  accounts: [],
  chainId: null,
  balance: null,
  connecting: false,
  error: null,
  connect: async () => {},
  disconnect: () => {},
  switchChain: async () => {},
  addChain: async () => {},
  sendTransaction: async () => '',
  signMessage: async () => '',
  signTypedData: async () => '',
  getBalance: async () => '',
};

// CreLink Context 생성
export const CreLinkContext = createContext<CreLinkProviderState>(defaultContextValue);

// CreLinkProvider Props 인터페이스
export interface CreLinkProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
  onError?: (error: Error) => void;
  options?: any;
}

/**
 * CreLink 지갑 상태 및 기능에 접근하기 위한 React Context Provider
 * 
 * @param props CreLinkProvider 속성
 * @returns React Context Provider
 */
export const CreLinkProvider: React.FC<CreLinkProviderProps> = ({
  children,
  autoConnect = false,
  onError,
  options = {}
}) => {
  // 상태 관리
  const [crelink, setCrelink] = useState<CreLink | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [chainId, setChainId] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // 에러 처리 함수
  const handleError = useCallback((err: Error) => {
    setError(err);
    if (onError) {
      onError(err);
    }
    console.error('CreLink error:', err);
  }, [onError]);

  // CreLink SDK 초기화
  useEffect(() => {
    try {
      const crelinkInstance = new CreLink({
        ...options,
        autoConnect: false // 수동으로 처리
      });
      
      setCrelink(crelinkInstance);
      
      // 이벤트 리스너 등록
      crelinkInstance.on(EventType.ACCOUNTS_CHANGED, (newAccounts: string[]) => {
        setAccounts(newAccounts);
        setIsConnected(newAccounts.length > 0);
        
        if (newAccounts.length > 0) {
          crelinkInstance.getBalance(newAccounts[0])
            .then(newBalance => setBalance(newBalance))
            .catch(err => console.error('Failed to get balance:', err));
        } else {
          setBalance(null);
        }
      });
      
      crelinkInstance.on(EventType.CHAIN_CHANGED, (newChainId: string) => {
        setChainId(newChainId);
        
        if (accounts.length > 0) {
          crelinkInstance.getBalance(accounts[0])
            .then(newBalance => setBalance(newBalance))
            .catch(err => console.error('Failed to get balance:', err));
        }
      });
      
      crelinkInstance.on(EventType.DISCONNECT, () => {
        setIsConnected(false);
        setAccounts([]);
        setBalance(null);
      });
      
      // 이미 연결된 경우 상태 업데이트
      if (crelinkInstance.isConnected()) {
        crelinkInstance.getAccounts()
          .then(currentAccounts => {
            setAccounts(currentAccounts);
            setIsConnected(currentAccounts.length > 0);
            
            if (currentAccounts.length > 0) {
              return crelinkInstance.getBalance(currentAccounts[0])
                .then(currentBalance => setBalance(currentBalance));
            }
          })
          .catch(err => console.error('Failed to get accounts:', err));
        
        crelinkInstance.getChainId()
          .then(currentChainId => setChainId(currentChainId))
          .catch(err => console.error('Failed to get chain ID:', err));
      }
      
      // 자동 연결
      if (autoConnect && crelinkInstance.isInstalled()) {
        connect();
      }
    } catch (err) {
      handleError(err instanceof Error ? err : new Error(String(err)));
    }
    
    // 클린업 함수
    return () => {
      if (crelink) {
        crelink.removeListener(EventType.ACCOUNTS_CHANGED, () => {});
        crelink.removeListener(EventType.CHAIN_CHANGED, () => {});
        crelink.removeListener(EventType.DISCONNECT, () => {});
      }
    };
  }, [handleError, options, autoConnect]);

  // 연결 함수
  const connect = useCallback(async () => {
    if (!crelink) {
      handleError(new Error('CreLink SDK is not initialized'));
      return;
    }
    
    if (!crelink.isInstalled()) {
      handleError(new Error('CreLink wallet is not installed'));
      return;
    }
    
    try {
      setConnecting(true);
      setError(null);
      
      const newAccounts = await crelink.connect();
      setAccounts(newAccounts);
      setIsConnected(true);
      
      const newChainId = await crelink.getChainId();
      setChainId(newChainId);
      
      if (newAccounts.length > 0) {
        const newBalance = await crelink.getBalance(newAccounts[0]);
        setBalance(newBalance);
      }
    } catch (err) {
      handleError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setConnecting(false);
    }
  }, [crelink, handleError]);

  // 연결 해제 함수
  const disconnect = useCallback(() => {
    setIsConnected(false);
    setAccounts([]);
    setBalance(null);
  }, []);

  // 체인 전환 함수
  const switchChain = useCallback(async (newChainId: string) => {
    if (!crelink) {
      handleError(new Error('CreLink SDK is not initialized'));
      return;
    }
    
    try {
      await crelink.switchChain(newChainId);
    } catch (err) {
      handleError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [crelink, handleError]);

  // 체인 추가 함수
  const addChain = useCallback(async (chainParams: any) => {
    if (!crelink) {
      handleError(new Error('CreLink SDK is not initialized'));
      return;
    }
    
    try {
      await crelink.addChain(chainParams);
    } catch (err) {
      handleError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [crelink, handleError]);

  // 트랜잭션 전송 함수
  const sendTransaction = useCallback(async (txParams: TransactionParams) => {
    if (!crelink) {
      handleError(new Error('CreLink SDK is not initialized'));
      return '';
    }
    
    try {
      return await crelink.sendTransaction(txParams);
    } catch (err) {
      handleError(err instanceof Error ? err : new Error(String(err)));
      return '';
    }
  }, [crelink, handleError]);

  // 메시지 서명 함수
  const signMessage = useCallback(async (message: string, address?: string) => {
    if (!crelink) {
      handleError(new Error('CreLink SDK is not initialized'));
      return '';
    }
    
    try {
      return await crelink.signMessage(message, address);
    } catch (err) {
      handleError(err instanceof Error ? err : new Error(String(err)));
      return '';
    }
  }, [crelink, handleError]);

  // 타입 데이터 서명 함수
  const signTypedData = useCallback(async (typedData: any, address?: string) => {
    if (!crelink) {
      handleError(new Error('CreLink SDK is not initialized'));
      return '';
    }
    
    try {
      return await crelink.signTypedData(typedData, address);
    } catch (err) {
      handleError(err instanceof Error ? err : new Error(String(err)));
      return '';
    }
  }, [crelink, handleError]);

  // 잔액 조회 함수
  const getBalance = useCallback(async (address?: string) => {
    if (!crelink) {
      handleError(new Error('CreLink SDK is not initialized'));
      return '';
    }
    
    try {
      return await crelink.getBalance(address);
    } catch (err) {
      handleError(err instanceof Error ? err : new Error(String(err)));
      return '';
    }
  }, [crelink, handleError]);

  // Context 값 구성
  const value: CreLinkProviderState = {
    isConnected,
    accounts,
    chainId,
    balance,
    connecting,
    error,
    connect,
    disconnect,
    switchChain,
    addChain,
    sendTransaction,
    signMessage,
    signTypedData,
    getBalance,
  };

  return (
    <CreLinkContext.Provider value={value}>
      {children}
    </CreLinkContext.Provider>
  );
};

/**
 * CreLink 지갑 상태 및 기능에 접근하기 위한 React Hook
 * 
 * @returns CreLinkProviderState
 */
export const useCreLink = (): CreLinkProviderState => {
  const context = useContext(CreLinkContext);
  
  if (context === undefined) {
    throw new Error('useCreLink must be used within a CreLinkProvider');
  }
  
  return context;
};
