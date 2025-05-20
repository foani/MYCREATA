import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { MMKV } from 'react-native-mmkv';
import * as SInfo from 'react-native-sensitive-info';
import { ethers } from 'ethers';
import { useAuth } from './AuthContext';
import { useNetwork } from './NetworkContext';
import { Token, Transaction, NFT } from '../types/wallet';
import BigNumber from 'bignumber.js';

// 스토리지 인스턴스
const storage = new MMKV();

// 민감한 정보 저장 옵션
const sensitiveInfoOptions = {
  sharedPreferencesName: 'crelink.wallet',
  keychainService: 'crelink.wallet.keychain',
};

// 지갑 컨텍스트 타입
interface WalletContextType {
  isInitializing: boolean;
  accounts: string[];
  selectedAccount: string | null;
  balance: BigNumber;
  tokens: Token[];
  transactions: Transaction[];
  nfts: NFT[];
  
  // 지갑 메서드
  createWallet: (pin: string) => Promise<{ address: string; mnemonic: string }>;
  importWalletFromMnemonic: (mnemonic: string, pin: string) => Promise<string>;
  importWalletFromPrivateKey: (privateKey: string, pin: string) => Promise<string>;
  selectAccount: (address: string) => void;
  refreshBalance: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  refreshNFTs: () => Promise<void>;
  sendTransaction: (to: string, amount: string, gasPrice?: string) => Promise<string>;
  sendToken: (tokenAddress: string, to: string, amount: string, gasPrice?: string) => Promise<string>;
  addCustomToken: (address: string, symbol: string, decimals: number, name: string) => Promise<boolean>;
  removeCustomToken: (address: string) => Promise<boolean>;
  exportPrivateKey: (pin: string) => Promise<string>;
  exportMnemonic: (pin: string) => Promise<string>;
}

// 기본값으로 컨텍스트 생성
const WalletContext = createContext<WalletContextType>({
  isInitializing: true,
  accounts: [],
  selectedAccount: null,
  balance: new BigNumber(0),
  tokens: [],
  transactions: [],
  nfts: [],
  
  createWallet: async () => ({ address: '', mnemonic: '' }),
  importWalletFromMnemonic: async () => '',
  importWalletFromPrivateKey: async () => '',
  selectAccount: () => {},
  refreshBalance: async () => {},
  refreshTokens: async () => {},
  refreshTransactions: async () => {},
  refreshNFTs: async () => {},
  sendTransaction: async () => '',
  sendToken: async () => '',
  addCustomToken: async () => false,
  removeCustomToken: async () => false,
  exportPrivateKey: async () => '',
  exportMnemonic: async () => '',
});

interface WalletProviderProps {
  children: ReactNode;
}

/**
 * 지갑 프로바이더 컴포넌트
 */
export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const { authState, user } = useAuth();
  const { selectedNetwork, provider } = useNetwork();
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState(new BigNumber(0));
  const [tokens, setTokens] = useState<Token[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [nfts, setNfts] = useState<NFT[]>([]);

  // 인증 상태가 변경될 때 초기화
  useEffect(() => {
    if (authState === 'authenticated' && user) {
      initializeWallet();
    } else if (authState === 'unauthenticated') {
      resetWalletState();
    }
  }, [authState, user]);

  // 선택된 계정이나 네트워크가 변경될 때 데이터 새로고침
  useEffect(() => {
    if (selectedAccount && authState === 'authenticated') {
      refreshWalletData();
    }
  }, [selectedAccount, selectedNetwork]);

  /**
   * 지갑 초기화
   */
  const initializeWallet = async () => {
    setIsInitializing(true);
    try {
      // 저장된 계정 불러오기
      const savedAccountsJson = storage.getString('accounts');
      const savedAccounts = savedAccountsJson ? JSON.parse(savedAccountsJson) : [];
      setAccounts(savedAccounts);
      
      // 선택된 계정 불러오기
      const savedSelectedAccount = storage.getString('selectedAccount');
      if (savedSelectedAccount && savedAccounts.includes(savedSelectedAccount)) {
        setSelectedAccount(savedSelectedAccount);
      } else if (savedAccounts.length > 0) {
        setSelectedAccount(savedAccounts[0]);
      }
      
      // 저장된 토큰 불러오기
      const savedTokensJson = storage.getString('tokens');
      if (savedTokensJson) {
        setTokens(JSON.parse(savedTokensJson));
      }
      
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  /**
   * 지갑 상태 리셋
   */
  const resetWalletState = () => {
    setAccounts([]);
    setSelectedAccount(null);
    setBalance(new BigNumber(0));
    setTokens([]);
    setTransactions([]);
    setNfts([]);
  };

  /**
   * 지갑 데이터 새로고침
   */
  const refreshWalletData = async () => {
    if (!selectedAccount) return;
    
    try {
      await Promise.all([
        refreshBalance(),
        refreshTokens(),
        refreshTransactions(),
        refreshNFTs(),
      ]);
    } catch (error) {
      console.error('Failed to refresh wallet data:', error);
    }
  };

  /**
   * 새 지갑 생성
   */
  const createWallet = async (pin: string): Promise<{ address: string; mnemonic: string }> => {
    try {
      // 새 HD 지갑 생성
      const wallet = ethers.Wallet.createRandom();
      
      // 니모닉과 개인키 보안 저장
      await SInfo.setItem(`mnemonic_${wallet.address}`, wallet.mnemonic?.phrase || '', sensitiveInfoOptions);
      await SInfo.setItem(`privateKey_${wallet.address}`, wallet.privateKey, sensitiveInfoOptions);
      
      // 계정 목록에 추가
      const newAccounts = [...accounts, wallet.address];
      setAccounts(newAccounts);
      storage.set('accounts', JSON.stringify(newAccounts));
      
      // 선택된 계정으로 설정
      setSelectedAccount(wallet.address);
      storage.set('selectedAccount', wallet.address);
      
      return {
        address: wallet.address,
        mnemonic: wallet.mnemonic?.phrase || '',
      };
    } catch (error) {
      console.error('Failed to create wallet:', error);
      throw error;
    }
  };

  /**
   * 니모닉에서 지갑 가져오기
   */
  const importWalletFromMnemonic = async (mnemonic: string, pin: string): Promise<string> => {
    try {
      // 니모닉에서 지갑 생성
      const wallet = ethers.Wallet.fromPhrase(mnemonic);
      
      // 이미 존재하는 계정인지 확인
      if (accounts.includes(wallet.address)) {
        return wallet.address;
      }
      
      // 니모닉과 개인키 보안 저장
      await SInfo.setItem(`mnemonic_${wallet.address}`, mnemonic, sensitiveInfoOptions);
      await SInfo.setItem(`privateKey_${wallet.address}`, wallet.privateKey, sensitiveInfoOptions);
      
      // 계정 목록에 추가
      const newAccounts = [...accounts, wallet.address];
      setAccounts(newAccounts);
      storage.set('accounts', JSON.stringify(newAccounts));
      
      // 선택된 계정으로 설정
      setSelectedAccount(wallet.address);
      storage.set('selectedAccount', wallet.address);
      
      return wallet.address;
    } catch (error) {
      console.error('Failed to import wallet from mnemonic:', error);
      throw error;
    }
  };

  /**
   * 개인키에서 지갑 가져오기
   */
  const importWalletFromPrivateKey = async (privateKey: string, pin: string): Promise<string> => {
    try {
      // 개인키에서 지갑 생성
      const wallet = new ethers.Wallet(privateKey);
      
      // 이미 존재하는 계정인지 확인
      if (accounts.includes(wallet.address)) {
        return wallet.address;
      }
      
      // 개인키 보안 저장
      await SInfo.setItem(`privateKey_${wallet.address}`, privateKey, sensitiveInfoOptions);
      
      // 계정 목록에 추가
      const newAccounts = [...accounts, wallet.address];
      setAccounts(newAccounts);
      storage.set('accounts', JSON.stringify(newAccounts));
      
      // 선택된 계정으로 설정
      setSelectedAccount(wallet.address);
      storage.set('selectedAccount', wallet.address);
      
      return wallet.address;
    } catch (error) {
      console.error('Failed to import wallet from private key:', error);
      throw error;
    }
  };

  /**
   * 계정 선택
   */
  const selectAccount = (address: string) => {
    if (accounts.includes(address)) {
      setSelectedAccount(address);
      storage.set('selectedAccount', address);
    }
  };

  /**
   * 잔액 새로고침
   */
  const refreshBalance = async () => {
    if (!selectedAccount || !provider) return;
    
    try {
      const balance = await provider.getBalance(selectedAccount);
      setBalance(new BigNumber(ethers.formatEther(balance)));
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  };

  /**
   * 토큰 새로고침 (데모용 - 실제로는 API 호출 필요)
   */
  const refreshTokens = async () => {
    if (!selectedAccount) return;
    
    try {
      // 데모 데이터 - 실제로는 API에서 가져와야 함
      const demoTokens: Token[] = [
        {
          address: '0x0000000000000000000000000000000000000000',
          symbol: 'CTA',
          name: 'Catena Token',
          decimals: 18,
          balance: balance.toString(),
          iconUrl: null,
        },
        // 다른 토큰들도 여기에 추가 가능
      ];
      
      // 커스텀 토큰과 병합
      const savedTokensJson = storage.getString('tokens');
      const customTokens = savedTokensJson ? JSON.parse(savedTokensJson) : [];
      
      const mergedTokens = [...demoTokens, ...customTokens.filter(
        (token: Token) => !demoTokens.some(t => t.address === token.address)
      )];
      
      setTokens(mergedTokens);
    } catch (error) {
      console.error('Failed to refresh tokens:', error);
    }
  };

  /**
   * 트랜잭션 새로고침 (데모용 - 실제로는 API 호출 필요)
   */
  const refreshTransactions = async () => {
    if (!selectedAccount) return;
    
    try {
      // 데모 데이터 - 실제로는 API에서 가져와야 함
      const demoTransactions: Transaction[] = [
        {
          hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          from: selectedAccount,
          to: '0x1234567890123456789012345678901234567890',
          value: '1.0',
          tokenAddress: '0x0000000000000000000000000000000000000000',
          timestamp: Date.now() - 3600000, // 1시간 전
          status: 'success',
          gasUsed: '21000',
          gasPrice: '2000000000', // 2 Gwei
        },
        {
          hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          from: '0x0987654321098765432109876543210987654321',
          to: selectedAccount,
          value: '0.5',
          tokenAddress: '0x0000000000000000000000000000000000000000',
          timestamp: Date.now() - 86400000, // 1일 전
          status: 'success',
          gasUsed: '21000',
          gasPrice: '1500000000', // 1.5 Gwei
        },
      ];
      
      setTransactions(demoTransactions);
    } catch (error) {
      console.error('Failed to refresh transactions:', error);
    }
  };

  /**
   * NFT 새로고침 (데모용 - 실제로는 API 호출 필요)
   */
  const refreshNFTs = async () => {
    if (!selectedAccount) return;
    
    try {
      // 데모 데이터 - 실제로는 API에서 가져와야 함
      const demoNFTs: NFT[] = [
        {
          contractAddress: '0x9876543210987654321098765432109876543210',
          tokenId: '1',
          name: 'CreLink Founder',
          description: 'CreLink Wallet Founder NFT',
          imageUrl: 'https://via.placeholder.com/500',
          attributes: [
            { trait_type: 'Rarity', value: 'Legendary' },
            { trait_type: 'Type', value: 'Founder' },
          ],
        },
      ];
      
      setNfts(demoNFTs);
    } catch (error) {
      console.error('Failed to refresh NFTs:', error);
    }
  };

  /**
   * 트랜잭션 전송
   */
  const sendTransaction = async (to: string, amount: string, gasPrice?: string): Promise<string> => {
    if (!selectedAccount || !provider) {
      throw new Error('Wallet or provider not initialized');
    }
    
    try {
      // 개인키 가져오기
      const privateKey = await SInfo.getItem(`privateKey_${selectedAccount}`, sensitiveInfoOptions);
      if (!privateKey) {
        throw new Error('Private key not found');
      }
      
      // 지갑 인스턴스 생성
      const wallet = new ethers.Wallet(privateKey, provider);
      
      // 트랜잭션 생성 및 전송
      const tx = await wallet.sendTransaction({
        to,
        value: ethers.parseEther(amount),
        gasPrice: gasPrice ? ethers.parseUnits(gasPrice, 'gwei') : undefined,
      });
      
      // 트랜잭션이 완료될 때까지 대기
      await tx.wait();
      
      // 지갑 데이터 새로고침
      await refreshBalance();
      await refreshTransactions();
      
      return tx.hash;
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw error;
    }
  };

  /**
   * 토큰 전송
   */
  const sendToken = async (tokenAddress: string, to: string, amount: string, gasPrice?: string): Promise<string> => {
    if (!selectedAccount || !provider) {
      throw new Error('Wallet or provider not initialized');
    }
    
    try {
      // 네이티브 토큰이면 일반 전송 사용
      if (tokenAddress === '0x0000000000000000000000000000000000000000') {
        return sendTransaction(to, amount, gasPrice);
      }
      
      // 개인키 가져오기
      const privateKey = await SInfo.getItem(`privateKey_${selectedAccount}`, sensitiveInfoOptions);
      if (!privateKey) {
        throw new Error('Private key not found');
      }
      
      // 지갑 인스턴스 생성
      const wallet = new ethers.Wallet(privateKey, provider);
      
      // 토큰 계약 ABI
      const erc20Abi = [
        'function transfer(address to, uint256 amount) returns (bool)',
        'function decimals() view returns (uint8)',
      ];
      
      // 토큰 계약 인스턴스 생성
      const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, wallet);
      
      // 토큰 소수점 확인
      const decimals = await tokenContract.decimals();
      
      // 트랜잭션 생성 및 전송
      const tx = await tokenContract.transfer(
        to,
        ethers.parseUnits(amount, decimals),
        {
          gasPrice: gasPrice ? ethers.parseUnits(gasPrice, 'gwei') : undefined,
        }
      );
      
      // 트랜잭션이 완료될 때까지 대기
      await tx.wait();
      
      // 토큰 잔액 및 트랜잭션 새로고침
      await refreshTokens();
      await refreshTransactions();
      
      return tx.hash;
    } catch (error) {
      console.error('Failed to send token:', error);
      throw error;
    }
  };

  /**
   * 커스텀 토큰 추가
   */
  const addCustomToken = async (address: string, symbol: string, decimals: number, name: string): Promise<boolean> => {
    try {
      // 토큰이 이미 존재하는지 확인
      const existingToken = tokens.find(token => token.address.toLowerCase() === address.toLowerCase());
      if (existingToken) {
        return false;
      }
      
      // 새 토큰 생성
      const newToken: Token = {
        address,
        symbol,
        name,
        decimals,
        balance: '0',
        iconUrl: null,
      };
      
      // 토큰 목록에 추가
      const updatedTokens = [...tokens, newToken];
      setTokens(updatedTokens);
      storage.set('tokens', JSON.stringify(updatedTokens));
      
      return true;
    } catch (error) {
      console.error('Failed to add custom token:', error);
      return false;
    }
  };

  /**
   * 커스텀 토큰 제거
   */
  const removeCustomToken = async (address: string): Promise<boolean> => {
    try {
      // 기본 토큰인지 확인
      if (address === '0x0000000000000000000000000000000000000000') {
        return false;
      }
      
      // 토큰 목록에서 제거
      const updatedTokens = tokens.filter(token => token.address.toLowerCase() !== address.toLowerCase());
      setTokens(updatedTokens);
      storage.set('tokens', JSON.stringify(updatedTokens));
      
      return true;
    } catch (error) {
      console.error('Failed to remove custom token:', error);
      return false;
    }
  };

  /**
   * 개인키 내보내기
   */
  const exportPrivateKey = async (pin: string): Promise<string> => {
    if (!selectedAccount) {
      throw new Error('No account selected');
    }
    
    try {
      const privateKey = await SInfo.getItem(`privateKey_${selectedAccount}`, sensitiveInfoOptions);
      if (!privateKey) {
        throw new Error('Private key not found');
      }
      
      return privateKey;
    } catch (error) {
      console.error('Failed to export private key:', error);
      throw error;
    }
  };

  /**
   * 니모닉 내보내기
   */
  const exportMnemonic = async (pin: string): Promise<string> => {
    if (!selectedAccount) {
      throw new Error('No account selected');
    }
    
    try {
      const mnemonic = await SInfo.getItem(`mnemonic_${selectedAccount}`, sensitiveInfoOptions);
      if (!mnemonic) {
        throw new Error('Mnemonic not found');
      }
      
      return mnemonic;
    } catch (error) {
      console.error('Failed to export mnemonic:', error);
      throw error;
    }
  };

  // 컨텍스트 값
  const contextValue: WalletContextType = {
    isInitializing,
    accounts,
    selectedAccount,
    balance,
    tokens,
    transactions,
    nfts,
    
    createWallet,
    importWalletFromMnemonic,
    importWalletFromPrivateKey,
    selectAccount,
    refreshBalance,
    refreshTokens,
    refreshTransactions,
    refreshNFTs,
    sendTransaction,
    sendToken,
    addCustomToken,
    removeCustomToken,
    exportPrivateKey,
    exportMnemonic,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

/**
 * 지갑 컨텍스트 사용 훅
 */
export const useWallet = () => useContext(WalletContext);
