/**
 * 브릿지 히스토리 페이지
 * 
 * 사용자의 이전 브릿지 트랜잭션 기록을 보여주는 페이지입니다.
 * 
 * @author CreLink Team
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, ArrowPathIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { BridgeTransaction, BridgeTransactionStatus } from '../../../../core/src/chain/bridge/bridge.interface';
import { ChainType } from '../../../../core/src/chain/chains';
import { useWallet } from '../../hooks/useWallet';
import { BridgeService } from '../../../services/bridge.service';
import Header from '../../components/Header';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

const BridgeHistoryPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { account } = useWallet();
  
  // 트랜잭션 이력
  const [transactions, setTransactions] = useState<BridgeTransaction[]>([]);
  
  // 로딩 상태
  const [loading, setLoading] = useState<boolean>(true);
  
  // 오류 상태
  const [error, setError] = useState<string>('');
  
  // 브릿지 서비스
  const [bridgeService, setBridgeService] = useState<BridgeService | null>(null);
  
  // 이전 페이지로 이동
  const handleBack = () => {
    navigate(-1);
  };
  
  // 브릿지 서비스 초기화
  useEffect(() => {
    const initBridgeService = async () => {
      try {
        const service = new BridgeService();
        setBridgeService(service);
      } catch (error) {
        console.error('Bridge service initialization error:', error);
        setError(t('bridge.errors.serviceInitFailed'));
      }
    };
    
    initBridgeService();
  }, [t]);
  
  // 트랜잭션 이력 로드
  useEffect(() => {
    const loadTransactionHistory = async () => {
      if (!bridgeService || !account) {
        return;
      }
      
      try {
        setLoading(true);
        
        // 모든 지원 체인에서 트랜잭션 이력 가져오기
        const catenaEthereumTxs = await bridgeService.getTransactionHistory(
          account.address,
          ChainType.CATENA,
          ChainType.ETHEREUM
        );
        
        const catenaPolygonTxs = await bridgeService.getTransactionHistory(
          account.address,
          ChainType.CATENA,
          ChainType.POLYGON
        );
        
        const catenaArbitrumTxs = await bridgeService.getTransactionHistory(
          account.address,
          ChainType.CATENA,
          ChainType.ARBITRUM
        );
        
        // 청구 가능한 트랜잭션 가져오기 (특화 기능)
        const arbitrumClaimableTxs = await bridgeService.getClaimableTransactions(
          account.address,
          ChainType.ARBITRUM
        );
        
        const polygonClaimableTxs = await bridgeService.getClaimableTransactions(
          account.address,
          ChainType.POLYGON
        );
        
        // 모든 트랜잭션 통합 및 정렬 (최신순)
        const allTransactions = [
          ...catenaEthereumTxs,
          ...catenaPolygonTxs,
          ...catenaArbitrumTxs,
          ...arbitrumClaimableTxs,
          ...polygonClaimableTxs
        ].sort((a, b) => b.timestamp - a.timestamp);
        
        setTransactions(allTransactions);
        setLoading(false);
      } catch (error) {
        console.error('Transaction history loading error:', error);
        setError(t('bridge.history.loadError'));
        setLoading(false);
      }
    };
    
    loadTransactionHistory();
  }, [bridgeService, account, t]);
  
  // 트랜잭션 새로고침
  const handleRefresh = () => {
    if (!account) return;
    setLoading(true);
    setError('');
    
    // 브릿지 서비스가 있으면 트랜잭션 이력 다시 로드
    if (bridgeService) {
      const loadTransactionHistory = async () => {
        try {
          // 모든 지원 체인에서 트랜잭션 이력 가져오기
          const catenaEthereumTxs = await bridgeService.getTransactionHistory(
            account.address,
            ChainType.CATENA,
            ChainType.ETHEREUM
          );
          
          const catenaPolygonTxs = await bridgeService.getTransactionHistory(
            account.address,
            ChainType.CATENA,
            ChainType.POLYGON
          );
          
          const catenaArbitrumTxs = await bridgeService.getTransactionHistory(
            account.address,
            ChainType.CATENA,
            ChainType.ARBITRUM
          );
          
          // 청구 가능한 트랜잭션 가져오기 (특화 기능)
          const arbitrumClaimableTxs = await bridgeService.getClaimableTransactions(
            account.address,
            ChainType.ARBITRUM
          );
          
          const polygonClaimableTxs = await bridgeService.getClaimableTransactions(
            account.address,
            ChainType.POLYGON
          );
          
          // 모든 트랜잭션 통합 및 정렬 (최신순)
          const allTransactions = [
            ...catenaEthereumTxs,
            ...catenaPolygonTxs,
            ...catenaArbitrumTxs,
            ...arbitrumClaimableTxs,
            ...polygonClaimableTxs
          ].sort((a, b) => b.timestamp - a.timestamp);
          
          setTransactions(allTransactions);
          setLoading(false);
        } catch (error) {
          console.error('Transaction history loading error:', error);
          setError(t('bridge.history.loadError'));
          setLoading(false);
        }
      };
      
      loadTransactionHistory();
    }
  };
  
  // 트랜잭션 세부 정보 보기
  const handleViewTransaction = (transaction: BridgeTransaction) => {
    // 트랜잭션 세부 정보 페이지로 이동
    navigate(`/bridge/transaction/${transaction.id}`, { state: { transaction } });
  };
  
  // 체인 정보
  const chainInfo = {
    [ChainType.CATENA]: {
      name: 'Catena',
      icon: '/assets/chains/catena.svg',
      explorer: 'https://catena.explorer.creatachain.com'
    },
    [ChainType.ETHEREUM]: {
      name: 'Ethereum',
      icon: '/assets/chains/ethereum.svg',
      explorer: 'https://etherscan.io'
    },
    [ChainType.POLYGON]: {
      name: 'Polygon',
      icon: '/assets/chains/polygon.svg',
      explorer: 'https://polygonscan.com'
    },
    [ChainType.ARBITRUM]: {
      name: 'Arbitrum',
      icon: '/assets/chains/arbitrum.svg',
      explorer: 'https://arbiscan.io'
    }
  };
  
  // 상태 아이콘 반환
  const getStatusIcon = (status: BridgeTransactionStatus) => {
    switch (status) {
      case BridgeTransactionStatus.COMPLETED:
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case BridgeTransactionStatus.CLAIMABLE:
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case BridgeTransactionStatus.FAILED:
      case BridgeTransactionStatus.CANCELED:
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ArrowPathIcon className="w-5 h-5 text-yellow-500" />;
    }
  };
  
  // 상태 레이블 반환
  const getStatusLabel = (status: BridgeTransactionStatus) => {
    switch (status) {
      case BridgeTransactionStatus.PENDING:
        return t('bridge.status.pending');
      case BridgeTransactionStatus.PROCESSING:
        return t('bridge.status.processing');
      case BridgeTransactionStatus.COMPLETED:
        return t('bridge.status.completed');
      case BridgeTransactionStatus.FAILED:
        return t('bridge.status.failed');
      case BridgeTransactionStatus.CANCELED:
        return t('bridge.status.canceled');
      case BridgeTransactionStatus.CLAIMABLE:
        return t('bridge.status.claimable');
      default:
        return t('bridge.status.unknown');
    }
  };
  
  return (
    <div className="flex flex-col w-full h-full">
      <Header 
        title={t('bridge.history.title')}
        leftIcon={<ArrowLeftIcon className="w-5 h-5" />}
        onLeftIconClick={handleBack}
        rightIcon={<ArrowPathIcon className="w-5 h-5" />}
        onRightIconClick={handleRefresh}
      />
      
      <div className="flex-1 p-4 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
              <p className="text-gray-500">{t('common.loading')}</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-red-500 mb-4">{error}</p>
            <Button variant="secondary" onClick={handleRefresh}>
              {t('common.tryAgain')}
            </Button>
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            }
            title={t('bridge.history.noTransactions')}
            description={t('bridge.history.noTransactionsDescription')}
            action={
              <Button 
                variant="primary" 
                onClick={() => navigate('/bridge')}
              >
                {t('bridge.history.startBridging')}
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleViewTransaction(transaction)}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center mr-2">
                      {getStatusIcon(transaction.status)}
                    </div>
                    <span className="font-medium">{getStatusLabel(transaction.status)}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(transaction.timestamp * 1000).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <img
                      src={chainInfo[transaction.sourceChain].icon}
                      alt={chainInfo[transaction.sourceChain].name}
                      className="w-5 h-5 mr-1"
                    />
                    <span className="text-sm">{chainInfo[transaction.sourceChain].name}</span>
                  </div>
                  
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                  
                  <div className="flex items-center">
                    <img
                      src={chainInfo[transaction.targetChain].icon}
                      alt={chainInfo[transaction.targetChain].name}
                      className="w-5 h-5 mr-1"
                    />
                    <span className="text-sm">{chainInfo[transaction.targetChain].name}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {transaction.amount} {transaction.sourceToken.substring(0, 6)}...
                  </span>
                  <span className="text-xs text-gray-500">
                    ID: {transaction.id.substring(0, 8)}...
                  </span>
                </div>
                
                {transaction.status === BridgeTransactionStatus.CLAIMABLE && (
                  <div className="mt-2 p-1 bg-yellow-100 dark:bg-yellow-900 rounded text-xs text-center text-yellow-800 dark:text-yellow-200">
                    {t('bridge.history.claimableMessage')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BridgeHistoryPage;
