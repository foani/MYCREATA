import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import useWallet from './useWallet';
import useNetwork from './useNetwork';
import { getBridgeService } from '../../background/services/bridge.service'; 
import { BRIDGE_STATUS } from '../../constants/bridge';

/**
 * 브릿지 관련 훅
 * 
 * 이 훅은 크로스체인 브릿지 기능을 사용하기 위한 인터페이스를 제공합니다.
 * 사용자가 체인 간 자산을 이동할 수 있도록 필요한 메서드를 제공합니다.
 */
const useBridge = () => {
  const { account } = useWallet();
  const { currentChain, getChainById } = useNetwork();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bridgeTransactions, setBridgeTransactions] = useState<any[]>([]);
  
  /**
   * 브릿지 트랜잭션 목록 가져오기
   */
  const getBridgeTransactions = useCallback(async () => {
    if (!account) return [];
    
    try {
      setLoading(true);
      setError(null);
      
      const bridgeService = await getBridgeService();
      const transactions = await bridgeService.getTransactionsByAccount(account.address);
      
      setBridgeTransactions(transactions);
      return transactions;
    } catch (err: any) {
      console.error('Failed to get bridge transactions:', err);
      setError(err.message || 'Failed to fetch bridge transactions');
      return [];
    } finally {
      setLoading(false);
    }
  }, [account]);
  
  /**
   * 특정 브릿지 트랜잭션 가져오기
   */
  const getBridgeTransaction = useCallback(async (txId: string) => {
    if (!account) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const bridgeService = await getBridgeService();
      const transaction = await bridgeService.getTransactionById(txId);
      
      return transaction;
    } catch (err: any) {
      console.error(`Failed to get bridge transaction ${txId}:`, err);
      setError(err.message || 'Failed to fetch bridge transaction');
      return null;
    } finally {
      setLoading(false);
    }
  }, [account]);
  
  /**
   * 새 브릿지 트랜잭션 생성
   */
  const createBridgeTransaction = useCallback(async (
    sourceChainId: number | string,
    targetChainId: number | string,
    tokenAddress: string,
    amount: string,
    recipient?: string
  ) => {
    if (!account) {
      throw new Error('No active account');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const bridgeService = await getBridgeService();
      
      // 수량을 BigNumber로 변환
      const amountBN = ethers.utils.parseEther(amount);
      
      // 트랜잭션 생성
      const transaction = await bridgeService.createTransaction({
        sourceChainId: String(sourceChainId),
        targetChainId: String(targetChainId),
        tokenAddress,
        amount: amountBN.toString(),
        sender: account.address,
        recipient: recipient || account.address,
      });
      
      // 트랜잭션 목록 갱신
      await getBridgeTransactions();
      
      return transaction;
    } catch (err: any) {
      console.error('Failed to create bridge transaction:', err);
      setError(err.message || 'Failed to create bridge transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [account, getBridgeTransactions]);
  
  /**
   * 브릿지 트랜잭션 실행
   */
  const executeBridgeTransaction = useCallback(async (txId: string) => {
    if (!account) {
      throw new Error('No active account');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const bridgeService = await getBridgeService();
      const result = await bridgeService.executeTransaction(txId);
      
      // 트랜잭션 목록 갱신
      await getBridgeTransactions();
      
      return result;
    } catch (err: any) {
      console.error(`Failed to execute bridge transaction ${txId}:`, err);
      setError(err.message || 'Failed to execute bridge transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [account, getBridgeTransactions]);
  
  /**
   * 브릿지 트랜잭션 확인 (클레임)
   */
  const confirmBridgeTransaction = useCallback(async (txId: string) => {
    if (!account) {
      throw new Error('No active account');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const bridgeService = await getBridgeService();
      const result = await bridgeService.confirmTransaction(txId);
      
      // 트랜잭션 목록 갱신
      await getBridgeTransactions();
      
      return result;
    } catch (err: any) {
      console.error(`Failed to confirm bridge transaction ${txId}:`, err);
      setError(err.message || 'Failed to confirm bridge transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [account, getBridgeTransactions]);
  
  /**
   * 지원되는 체인 및 토큰 목록 가져오기
   */
  const getSupportedChains = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const bridgeService = await getBridgeService();
      const supportedChains = await bridgeService.getSupportedChains();
      
      return supportedChains;
    } catch (err: any) {
      console.error('Failed to get supported chains:', err);
      setError(err.message || 'Failed to fetch supported chains');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * 특정 체인 간 지원되는 토큰 목록 가져오기
   */
  const getSupportedTokens = useCallback(async (
    sourceChainId: number | string,
    targetChainId: number | string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const bridgeService = await getBridgeService();
      const supportedTokens = await bridgeService.getSupportedTokens(
        String(sourceChainId),
        String(targetChainId)
      );
      
      return supportedTokens;
    } catch (err: any) {
      console.error('Failed to get supported tokens:', err);
      setError(err.message || 'Failed to fetch supported tokens');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * 브릿지 수수료 견적 가져오기
   */
  const estimateBridgeFee = useCallback(async (
    sourceChainId: number | string,
    targetChainId: number | string,
    tokenAddress: string,
    amount: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const bridgeService = await getBridgeService();
      
      // 수량을 BigNumber로 변환
      const amountBN = ethers.utils.parseEther(amount);
      
      const feeEstimate = await bridgeService.estimateFee({
        sourceChainId: String(sourceChainId),
        targetChainId: String(targetChainId),
        tokenAddress,
        amount: amountBN.toString(),
      });
      
      return feeEstimate;
    } catch (err: any) {
      console.error('Failed to estimate bridge fee:', err);
      setError(err.message || 'Failed to estimate bridge fee');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * 초기 데이터 로드
   */
  useEffect(() => {
    if (account) {
      getBridgeTransactions().catch(console.error);
    }
  }, [account, getBridgeTransactions]);
  
  return {
    bridgeTransactions,
    loading,
    error,
    getBridgeTransactions,
    getBridgeTransaction,
    createBridgeTransaction,
    executeBridgeTransaction,
    confirmBridgeTransaction,
    getSupportedChains,
    getSupportedTokens,
    estimateBridgeFee,
  };
};

export default useBridge;