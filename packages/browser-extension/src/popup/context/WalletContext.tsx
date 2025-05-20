/**
 * WalletContext
 * 지갑 상태 및 기능을 관리하는 컨텍스트
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 계정 타입 정의
export interface Account {
  address: string;
  name: string;
  index: number;
}

// 지갑 상태 타입 정의
interface WalletState {
  accounts: Account[];
  selectedAccount: Account | null;
  isLocked: boolean;
  hasWallet: boolean;
  isInitialized: boolean;
}

// 지갑 컨텍스트 타입 정의
interface WalletContextType extends WalletState {
  createWallet: (password: string) => Promise<string>;
  importWallet: (mnemonic: string, password: string) => Promise<void>;
  recoverWalletWithDID: (didType: string, didCredential: any, pin: string) => Promise<void>;
  unlockWallet: (password: string) => Promise<boolean>;
  lockWallet: () => Promise<void>;
  createAccount: () => Promise<Account>;
  selectAccount: (address: string) => Promise<void>;
  renameAccount: (address: string, name: string) => Promise<void>;
  refreshAccounts: () => Promise<void>;
}

// 기본 컨텍스트 값
const defaultContextValue: WalletContextType = {
  accounts: [],
  selectedAccount: null,
  isLocked: true,
  hasWallet: false,
  isInitialized: false,
  createWallet: async () => '',
  importWallet: async () => {},
  recoverWalletWithDID: async () => {},
  unlockWallet: async () => false,
  lockWallet: async () => {},
  createAccount: async () => ({
    address: '',
    name: '',
    index: 0,
  }),
  selectAccount: async () => {},
  renameAccount: async () => {},
  refreshAccounts: async () => {},
};

// 컨텍스트 생성
const WalletContext = createContext<WalletContextType>(defaultContextValue);

// Props 타입 정의
interface WalletProviderProps {
  children: ReactNode;
}

/**
 * 지갑 프로바이더 컴포넌트
 * @param children 자식 컴포넌트
 */
export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  // 상태 정의
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [hasWallet, setHasWallet] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  // 초기화
  useEffect(() => {
    const initialize = async () => {
      try {
        // 초기화 상태 확인
        const initResult = await chrome.runtime.sendMessage({
          type: 'internal',
          method: 'isInitialized',
        });
        setIsInitialized(initResult.result);
        
        // 지갑 존재 여부 확인
        const hasWalletResult = await chrome.runtime.sendMessage({
          type: 'internal',
          method: 'hasWallet',
        });
        setHasWallet(hasWalletResult.result);
        
        // 지갑 잠금 상태 확인
        const isLockedResult = await chrome.runtime.sendMessage({
          type: 'internal',
          method: 'isLocked',
        });
        setIsLocked(isLockedResult.result);
        
        // 잠금 해제된 경우 계정 정보 로드
        if (!isLockedResult.result) {
          await refreshAccountsInternal();
        }
      } catch (error) {
        console.error('지갑 초기화 중 오류:', error);
      }
    };
    
    initialize();
  }, []);
  
  /**
   * 계정 정보 새로고침 (내부 함수)
   */
  const refreshAccountsInternal = async () => {
    try {
      // 계정 목록 조회
      const accountsResult = await chrome.runtime.sendMessage({
        type: 'internal',
        method: 'getAccounts',
      });
      
      const accountsList = accountsResult.result || [];
      const formattedAccounts = accountsList.map((address: string, index: number) => ({
        address,
        name: `계정 ${index + 1}`,
        index,
      }));
      
      setAccounts(formattedAccounts);
      
      // 선택된 계정 조회
      const selectedResult = await chrome.runtime.sendMessage({
        type: 'internal',
        method: 'getSelectedAccount',
      });
      
      const selectedAddress = selectedResult.result;
      if (selectedAddress) {
        const selected = formattedAccounts.find(
          (account: Account) => account.address === selectedAddress
        );
        setSelectedAccount(selected || null);
      }
    } catch (error) {
      console.error('계정 정보 조회 중 오류:', error);
    }
  };
  
  /**
   * 새 지갑 생성
   * @param password 지갑 비밀번호
   * @returns 니모닉 시드 구문
   */
  const createWallet = async (password: string): Promise<string> => {
    try {
      const result = await chrome.runtime.sendMessage({
        type: 'internal',
        method: 'createWallet',
        params: { password },
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setIsLocked(false);
      setHasWallet(true);
      
      // 계정 정보 새로고침
      await refreshAccountsInternal();
      
      return result.result;
    } catch (error) {
      console.error('지갑 생성 중 오류:', error);
      throw error;
    }
  };
  
  /**
   * 지갑 가져오기
   * @param mnemonic 니모닉 시드 구문
   * @param password 지갑 비밀번호
   */
  const importWallet = async (mnemonic: string, password: string): Promise<void> => {
    try {
      const result = await chrome.runtime.sendMessage({
        type: 'internal',
        method: 'recoverWallet',
        params: { mnemonic, password },
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setIsLocked(false);
      setHasWallet(true);
      
      // 계정 정보 새로고침
      await refreshAccountsInternal();
    } catch (error) {
      console.error('지갑 가져오기 중 오류:', error);
      throw error;
    }
  };
  
  /**
   * DID로 지갑 복구
   * @param didType DID 유형 (예: 'telegram', 'google')
   * @param didCredential DID 인증 정보
   * @param pin 개인 PIN 코드
   */
  const recoverWalletWithDID = async (
    didType: string,
    didCredential: any,
    pin: string
  ): Promise<void> => {
    try {
      const result = await chrome.runtime.sendMessage({
        type: 'internal',
        method: 'recoverWalletWithDID',
        params: { didType, didCredential, pin },
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setIsLocked(false);
      setHasWallet(true);
      
      // 계정 정보 새로고침
      await refreshAccountsInternal();
    } catch (error) {
      console.error('DID로 지갑 복구 중 오류:', error);
      throw error;
    }
  };
  
  /**
   * 지갑 잠금 해제
   * @param password 지갑 비밀번호
   * @returns 성공 여부
   */
  const unlockWallet = async (password: string): Promise<boolean> => {
    try {
      const result = await chrome.runtime.sendMessage({
        type: 'internal',
        method: 'unlockWallet',
        params: { password },
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.result) {
        setIsLocked(false);
        
        // 계정 정보 새로고침
        await refreshAccountsInternal();
      }
      
      return result.result;
    } catch (error) {
      console.error('지갑 잠금 해제 중 오류:', error);
      throw error;
    }
  };
  
  /**
   * 지갑 잠금
   */
  const lockWallet = async (): Promise<void> => {
    try {
      const result = await chrome.runtime.sendMessage({
        type: 'internal',
        method: 'lockWallet',
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setIsLocked(true);
      setAccounts([]);
      setSelectedAccount(null);
    } catch (error) {
      console.error('지갑 잠금 중 오류:', error);
      throw error;
    }
  };
  
  /**
   * 새 계정 생성
   * @returns 생성된 계정 정보
   */
  const createAccount = async (): Promise<Account> => {
    try {
      const result = await chrome.runtime.sendMessage({
        type: 'internal',
        method: 'createAccount',
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // 계정 정보 새로고침
      await refreshAccountsInternal();
      
      const newAccount = accounts.find((account) => account.address === result.result);
      if (!newAccount) {
        throw new Error('새 계정을 찾을 수 없습니다.');
      }
      
      return newAccount;
    } catch (error) {
      console.error('계정 생성 중 오류:', error);
      throw error;
    }
  };
  
  /**
   * 계정 선택
   * @param address 계정 주소
   */
  const selectAccount = async (address: string): Promise<void> => {
    try {
      const result = await chrome.runtime.sendMessage({
        type: 'internal',
        method: 'selectAccount',
        params: { address },
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      const selected = accounts.find((account) => account.address === address);
      setSelectedAccount(selected || null);
    } catch (error) {
      console.error('계정 선택 중 오류:', error);
      throw error;
    }
  };
  
  /**
   * 계정 이름 변경
   * @param address 계정 주소
   * @param name 새 계정 이름
   */
  const renameAccount = async (address: string, name: string): Promise<void> => {
    // 로컬 상태 업데이트
    const updatedAccounts = accounts.map((account) => {
      if (account.address === address) {
        return { ...account, name };
      }
      return account;
    });
    
    setAccounts(updatedAccounts);
    
    // 선택된 계정도 업데이트
    if (selectedAccount && selectedAccount.address === address) {
      setSelectedAccount({ ...selectedAccount, name });
    }
    
    // 실제 구현에서는 스토리지에 저장하는 로직 필요
  };
  
  /**
   * 계정 정보 새로고침
   */
  const refreshAccounts = async (): Promise<void> => {
    await refreshAccountsInternal();
  };
  
  // 컨텍스트 값
  const contextValue: WalletContextType = {
    accounts,
    selectedAccount,
    isLocked,
    hasWallet,
    isInitialized,
    createWallet,
    importWallet,
    recoverWalletWithDID,
    unlockWallet,
    lockWallet,
    createAccount,
    selectAccount,
    renameAccount,
    refreshAccounts,
  };
  
  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

/**
 * 지갑 컨텍스트 훅
 * @returns 지갑 컨텍스트 값
 */
export const useWallet = () => {
  return useContext(WalletContext);
};