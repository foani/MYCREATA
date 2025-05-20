/**
 * 크로스체인 브릿지 진행 컴포넌트
 * 
 * 브릿지 과정의 세 번째 단계로, 브릿지 트랜잭션의 진행 상태를 보여줍니다.
 * 
 * @author CreLink Team
 */

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import { BridgeTransaction, BridgeTransactionStatus } from '../../../../core/src/chain/bridge/bridge.interface';
import { ChainType } from '../../../../core/src/chain/chains';
import Button from '../common/Button';

interface BridgeProgressProps {
  bridgeData: {
    sourceChain: ChainType;
    targetChain: ChainType;
    sourceToken: string;
    targetToken: string;
    amount: string;
    recipient: string;
    transaction?: BridgeTransaction;
  };
  onUpdateStatus: () => void;
  onBack: () => void;
  onNext: () => void;
  error: string;
  setError: (error: string) => void;
}

const BridgeProgress: React.FC<BridgeProgressProps> = ({
  bridgeData,
  onUpdateStatus,
  onBack,
  onNext,
  error,
  setError
}) => {
  const { t } = useTranslation();
  
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
  
  // 트랜잭션 상태 정보
  const statusInfo = {
    [BridgeTransactionStatus.PENDING]: {
      icon: <ArrowPathIcon className="w-6 h-6 text-yellow-500 animate-spin" />,
      label: t('bridge.progress.statusPending'),
      description: t('bridge.progress.pendingDescription')
    },
    [BridgeTransactionStatus.PROCESSING]: {
      icon: <ArrowPathIcon className="w-6 h-6 text-yellow-500 animate-spin" />,
      label: t('bridge.progress.statusProcessing'),
      description: t('bridge.progress.processingDescription')
    },
    [BridgeTransactionStatus.COMPLETED]: {
      icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
      label: t('bridge.progress.statusCompleted'),
      description: t('bridge.progress.completedDescription')
    },
    [BridgeTransactionStatus.FAILED]: {
      icon: <XCircleIcon className="w-6 h-6 text-red-500" />,
      label: t('bridge.progress.statusFailed'),
      description: t('bridge.progress.failedDescription')
    },
    [BridgeTransactionStatus.CANCELED]: {
      icon: <XCircleIcon className="w-6 h-6 text-red-500" />,
      label: t('bridge.progress.statusCanceled'),
      description: t('bridge.progress.canceledDescription')
    },
    [BridgeTransactionStatus.UNKNOWN]: {
      icon: <ArrowPathIcon className="w-6 h-6 text-gray-500" />,
      label: t('bridge.progress.statusUnknown'),
      description: t('bridge.progress.unknownDescription')
    },
    [BridgeTransactionStatus.CLAIMABLE]: {
      icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
      label: t('bridge.progress.statusClaimable'),
      description: t('bridge.progress.claimableDescription')
    }
  };
  
  // 소스 체인 탐색기 URL
  const getSourceExplorerUrl = () => {
    if (!bridgeData.transaction?.txHash) {
      return '#';
    }
    
    return `${chainInfo[bridgeData.sourceChain].explorer}/tx/${bridgeData.transaction.txHash}`;
  };
  
  // 대상 체인 탐색기 URL (있는 경우)
  const getTargetExplorerUrl = () => {
    if (
      !bridgeData.transaction?.txHash ||
      bridgeData.transaction.status !== BridgeTransactionStatus.COMPLETED
    ) {
      return null;
    }
    
    // 완료된 트랜잭션의 대상 체인 트랜잭션 해시는 다를 수 있음
    // 실제로는 이 정보를 API나 서비스에서 가져와야 함
    return `${chainInfo[bridgeData.targetChain].explorer}/tx/${bridgeData.transaction.txHash}`;
  };
  
  // 트랜잭션 상태
  const currentStatus = bridgeData.transaction?.status || BridgeTransactionStatus.UNKNOWN;
  
  // 트랜잭션 ID 축약
  const shortenedTxId = bridgeData.transaction?.id
    ? `${bridgeData.transaction.id.substring(0, 6)}...${bridgeData.transaction.id.substring(bridgeData.transaction.id.length - 4)}`
    : '';
  
  // 상태 업데이트 주기적 실행
  useEffect(() => {
    if (
      currentStatus === BridgeTransactionStatus.PENDING ||
      currentStatus === BridgeTransactionStatus.PROCESSING
    ) {
      const interval = setInterval(onUpdateStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [currentStatus, onUpdateStatus]);
  
  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg">
      <h2 className="text-lg font-bold mb-4 text-center">
        {t('bridge.progress.title')}
      </h2>
      
      {/* 트랜잭션 상태 표시 */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            {statusInfo[currentStatus].icon}
          </div>
          <span className="font-medium text-center mb-1">
            {statusInfo[currentStatus].label}
          </span>
          <p className="text-xs text-gray-500 text-center max-w-xs">
            {statusInfo[currentStatus].description}
          </p>
        </div>
      </div>
      
      {/* 트랜잭션 정보 */}
      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">
            {t('bridge.progress.txId')}
          </span>
          <span className="text-sm font-medium">
            {shortenedTxId}
          </span>
        </div>
        
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">
            {t('bridge.progress.sourceChain')}
          </span>
          <span className="text-sm font-medium">
            {chainInfo[bridgeData.sourceChain].name}
          </span>
        </div>
        
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">
            {t('bridge.progress.targetChain')}
          </span>
          <span className="text-sm font-medium">
            {chainInfo[bridgeData.targetChain].name}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">
            {t('bridge.progress.amount')}
          </span>
          <span className="text-sm font-medium">
            {bridgeData.amount} {bridgeData.sourceToken ? bridgeData.sourceToken.substring(0, 6) : ''}
          </span>
        </div>
      </div>
      
      {/* 트랜잭션 링크 */}
      <div className="mb-4">
        <a
          href={getSourceExplorerUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline block mb-2"
        >
          {t('bridge.progress.viewSourceTx')}
        </a>
        
        {getTargetExplorerUrl() && (
          <a
            href={getTargetExplorerUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline block"
          >
            {t('bridge.progress.viewTargetTx')}
          </a>
        )}
      </div>
      
      {/* 특정 체인에서만 표시되는 안내 */}
      {bridgeData.targetChain === ChainType.ARBITRUM && currentStatus === BridgeTransactionStatus.CLAIMABLE && (
        <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md">
          <p className="text-xs">
            {t('bridge.progress.arbitrumClaimableNote')}
          </p>
        </div>
      )}
      
      {/* 오류 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
          {error}
        </div>
      )}
      
      {/* 버튼 */}
      <div className="flex gap-2">
        {currentStatus === BridgeTransactionStatus.COMPLETED || 
         currentStatus === BridgeTransactionStatus.FAILED || 
         currentStatus === BridgeTransactionStatus.CANCELED ? (
          <Button
            variant="primary"
            onClick={onNext}
            className="w-full"
          >
            {currentStatus === BridgeTransactionStatus.COMPLETED
              ? t('bridge.progress.viewReceipt')
              : t('bridge.progress.done')}
          </Button>
        ) : (
          <>
            <Button
              variant="secondary"
              onClick={onBack}
              className="flex-1"
              disabled={
                currentStatus === BridgeTransactionStatus.PENDING ||
                currentStatus === BridgeTransactionStatus.PROCESSING
              }
            >
              {t('common.back')}
            </Button>
            
            <Button
              variant="primary"
              onClick={onUpdateStatus}
              className="flex-1"
            >
              {t('bridge.progress.refresh')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default BridgeProgress;
