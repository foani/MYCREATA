import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

// CreLink Provider 타입 정의
interface CreLinkProviderState {
  isConnected: boolean;
  accounts: string[];
  chainId: string | null;
  balance: string | null;
  connecting: boolean;
  error: Error | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchChain: (chainId: string) => Promise<void>;
  sendTransaction: (txData: any) => Promise<string>;
  signMessage: (message: string) => Promise<string>;
  addChain: (chainData: any) => Promise<void>;
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
  sendTransaction: async () => '',
  signMessage: async () => '',
  addChain: async () => {},
};

// CreLink Context 생성
const CreLinkContext = createContext<CreLinkProviderState>(defaultContextValue);

// CreLinkProvider Props 인터페이스
interface CreLinkProviderProps {
  children: ReactNode;
  onError?: (error: Error) => void;
  autoConnect?: boolean;
}

/**
 * CreLinkProvider는 React 애플리케이션에서 CreLink 지갑을 쉽게 연동할 수 있는 컨텍스트 프로바이더입니다.
 * 지갑 연결 상태, 계정, 체인 등의 정보를 관리하고, 지갑 기능을 제공합니다.
 * 
 * @param children React 컴포넌트 자식 요소
 * @param onError 에러 처리 콜백 함수
 * @param autoConnect 자동 연결 여부 (기본값: false)
 */
export const CreLinkProvider: React.FC<CreLinkProviderProps> = ({ 
  children, 
  onError,
  autoConnect = false
}) => {
  // 상태 관리
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [chainId, setChainId] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // window.crelink 객체 확인 함수
  const checkCreLink = useCallback((): boolean => {
    return typeof window !== 'undefined' && 'crelink' in window;
  }, []);

  // 에러 처리 함수
  const handleError = useCallback((err: Error) => {
    setError(err);
    onError?.(err);
    setConnecting(false);
  }, [onError]);

  // 계정 변경 이벤트 핸들러
  const handleAccountsChanged = useCallback((newAccounts: string[]) => {
    if (newAccounts.length === 0) {
      // 계정이 없는 경우는 연결 해제된 상태로 간주
      setIsConnected(false);
      setAccounts([]);
      setBalance(null);
    } else {
      setAccounts(newAccounts);
      // 계정 변경 시 잔액 업데이트
      updateBalance(newAccounts[0]);
    }
  }, []);

  // 체인 변경 이벤트 핸들러
  const handleChainChanged = useCallback((newChainId: string) => {
    setChainId(newChainId);
    // 체인 변경 시 현재 계정의 잔액 업데이트
    if (accounts.length > 0) {
      updateBalance(accounts[0]);
    }
  }, [accounts]);

  // 연결 해제 이벤트 핸들러
  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setAccounts([]);
    setChainId(null);
    setBalance(null);
  }, []);

  // 잔액 업데이트 함수
  const updateBalance = useCallback(async (account: string) => {
    if (!account || !checkCreLink()) return;

    try {
      const balance = await window.crelink.request({
        method: 'eth_getBalance',
        params: [account, 'latest']
      });
      setBalance(balance);
    } catch (err) {
      console.error('Failed to get balance:', err);
    }
  }, [checkCreLink]);

  // CreLink 연결 함수
  const connect = useCallback(async () => {
    if (!checkCreLink()) {
      handleError(new Error('CreLink wallet is not installed'));
      return;
    }

    setConnecting(true);
    try {
      const newAccounts = await window.crelink.request({
        method: 'eth_requestAccounts'
      });
      
      const chainId = await window.crelink.request({
        method: 'eth_chainId'
      });

      setIsConnected(true);
      setAccounts(newAccounts);
      setChainId(chainId);
      
      if (newAccounts.length > 0) {
        updateBalance(newAccounts[0]);
      }
      
      setConnecting(false);
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('Failed to connect to CreLink'));
    }
  }, [checkCreLink, handleError, updateBalance]);

  // 연결 해제 함수
  const disconnect = useCallback(() => {
    if (!checkCreLink()) return;
    
    // 이벤트 구독 해제 (실제 이벤트 구독 해제 코드는 useEffect에 있음)
    handleDisconnect();
  }, [checkCreLink, handleDisconnect]);

  // 체인 변경 함수
  const switchChain = useCallback(async (chainId: string) => {
    if (!checkCreLink()) {
      handleError(new Error('CreLink wallet is not installed'));
      return;
    }

    try {
      await window.crelink.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }]
      });
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('Failed to switch chain'));
    }
  }, [checkCreLink, handleError]);

  // 체인 추가 함수
  const addChain = useCallback(async (chainData: any) => {
    if (!checkCreLink()) {
      handleError(new Error('CreLink wallet is not installed'));
      return;
    }

    try {
      await window.crelink.request({
        method: 'wallet_addEthereumChain',
        params: [chainData]
      });
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('Failed to add chain'));
    }
  }, [checkCreLink, handleError]);

  // 트랜잭션 전송 함수
  const sendTransaction = useCallback(async (txData: any) => {
    if (!checkCreLink()) {
      handleError(new Error('CreLink wallet is not installed'));
      return '';
    }

    if (!isConnected) {
      handleError(new Error('Wallet is not connected'));
      return '';
    }

    try {
      const txHash = await window.crelink.request({
        method: 'eth_sendTransaction',
        params: [txData]
      });
      return txHash;
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('Failed to send transaction'));
      return '';
    }
  }, [checkCreLink, handleError, isConnected]);

  // 메시지 서명 함수
  const signMessage = useCallback(async (message: string) => {
    if (!checkCreLink()) {
      handleError(new Error('CreLink wallet is not installed'));
      return '';
    }

    if (!isConnected || accounts.length === 0) {
      handleError(new Error('Wallet is not connected'));
      return '';
    }

    try {
      // 메시지를 16진수로 변환
      const hexMessage = '0x' + Buffer.from(message).toString('hex');
      
      const signature = await window.crelink.request({
        method: 'personal_sign',
        params: [hexMessage, accounts[0]]
      });
      return signature;
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('Failed to sign message'));
      return '';
    }
  }, [checkCreLink, handleError, isConnected, accounts]);

  // CreLink 이벤트 리스너 설정
  useEffect(() => {
    if (!checkCreLink()) return;

    // 이벤트 리스너 추가
    window.crelink.on('accountsChanged', handleAccountsChanged);
    window.crelink.on('chainChanged', handleChainChanged);
    window.crelink.on('disconnect', handleDisconnect);

    // 자동 연결 설정
    if (autoConnect) {
      connect();
    }

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      if (window.crelink) {
        window.crelink.removeListener('accountsChanged', handleAccountsChanged);
        window.crelink.removeListener('chainChanged', handleChainChanged);
        window.crelink.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [
    checkCreLink, 
    autoConnect, 
    connect, 
    handleAccountsChanged, 
    handleChainChanged, 
    handleDisconnect
  ]);

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
    sendTransaction,
    signMessage,
    addChain,
  };

  return (
    <CreLinkContext.Provider value={value}>
      {children}
    </CreLinkContext.Provider>
  );
};

/**
 * useCreLink 훅은 CreLink 지갑 기능을 React 컴포넌트에서 쉽게 사용할 수 있도록 해줍니다.
 * 
 * @returns CreLink 지갑 기능과 상태를 포함한 객체
 * @throws CreLinkContext 내부에서 사용되지 않을 경우 에러를 발생시킵니다.
 */
export const useCreLink = (): CreLinkProviderState => {
  const context = useContext(CreLinkContext);
  
  if (context === undefined) {
    throw new Error('useCreLink must be used within a CreLinkProvider');
  }
  
  return context;
};

// CreLink 훅을 기본 내보내기로 설정
export default useCreLink;

// 타입 확장을 위한 인터페이스 선언
declare global {
  interface Window {
    crelink: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (eventName: string, callback: (...args: any[]) => void) => void;
      removeListener: (eventName: string, callback: (...args: any[]) => void) => void;
    };
  }
}
