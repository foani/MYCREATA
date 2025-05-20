/**
 * 크로스체인 브릿지 확인 컴포넌트
 * 
 * 브릿지 과정의 두 번째 단계로, 사용자가 브릿지 요청을 확인하는 화면을 제공합니다.
 * 
 * @author CreLink Team
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { ChainType } from '../../../../core/src/chain/chains';
import { convertFromWei } from '../../../../core/src/utils/conversion';
import Button from '../common/Button';

interface BridgeConfirmationProps {
  bridgeData: {
    sourceChain: ChainType;
    targetChain: ChainType;
    sourceToken: string;
    targetToken: string;
    amount: string;
    recipient: string;
    fee: {
      bridgeFee: string;
      relayerFee: string;
      gasEstimate: string;
      totalFee: string;
    };
  };
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
  error: string;
  setError: (error: string) => void;
}

const BridgeConfirmation: React.FC<BridgeConfirmationProps> = ({
  bridgeData,
  onConfirm,
  onBack,
  loading,
  error,
  setError
}) => {
  const { t } = useTranslation();
  
  // 체인 정보
  const chainInfo = {
    [ChainType.CATENA]: {
      name: 'Catena',
      icon: '/assets/chains/catena.svg'
    },
    [ChainType.ETHEREUM]: {
      name: 'Ethereum',
      icon: '/assets/chains/ethereum.svg'
    },
    [ChainType.POLYGON]: {
      name: 'Polygon',
      icon: '/assets/chains/polygon.svg'
    },
    [ChainType.ARBITRUM]: {
      name: 'Arbitrum',
      icon: '/assets/chains/arbitrum.svg'
    }
  };
  
  // 토큰 정보 가져오기
  const getTokenInfo = (tokenAddress: string) => {
    // 여기서는 간단히 처리, 실제로는 토큰 정보를 가져오는 로직 필요
    return {
      symbol: tokenAddress ? tokenAddress.substring(0, 6) + '...' : '',
      icon: '/assets/icons/token.svg'
    };
  };
  
  const sourceTokenInfo = getTokenInfo(bridgeData.sourceToken);
  const targetTokenInfo = getTokenInfo(bridgeData.targetToken);
  
  // 확인 팝업
  const confirmationContent = (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg">
      <h2 className="text-lg font-bold mb-4 text-center">
        {t('bridge.confirmation.title')}
      </h2>
      
      {/* 소스 체인과 대상 체인 표시 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
            <img
              src={chainInfo[bridgeData.sourceChain].icon}
              alt={chainInfo[bridgeData.sourceChain].name}
              className="w-8 h-8"
            />
          </div>
          <span className="text-sm font-medium">
            {chainInfo[bridgeData.sourceChain].name}
          </span>
        </div>
        
        <ArrowRightIcon className="w-6 h-6 text-gray-500" />
        
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
            <img
              src={chainInfo[bridgeData.targetChain].icon}
              alt={chainInfo[bridgeData.targetChain].name}
              className="w-8 h-8"
            />
          </div>
          <span className="text-sm font-medium">
            {chainInfo[bridgeData.targetChain].name}
          </span>
        </div>
      </div>
      
      {/* 토큰 정보 */}
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">
            {t('bridge.confirmation.sending')}
          </span>
          <span className="text-sm font-medium">
            {bridgeData.amount} {sourceTokenInfo.symbol}
          </span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">
            {t('bridge.confirmation.receiving')}
          </span>
          <span className="text-sm font-medium">
            {bridgeData.amount} {targetTokenInfo.symbol}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">
            {t('bridge.confirmation.recipient')}
          </span>
          <span className="text-sm font-medium">
            {bridgeData.recipient.substring(0, 6)}...{bridgeData.recipient.substring(bridgeData.recipient.length - 4)}
          </span>
        </div>
      </div>
      
      {/* 수수료 정보 */}
      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md mb-4">
        <h3 className="text-sm font-medium mb-2">
          {t('bridge.confirmation.feeDetails')}
        </h3>
        
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-500">
            {t('bridge.confirmation.bridgeFee')}
          </span>
          <span className="text-xs">
            {convertFromWei(bridgeData.fee.bridgeFee)}
          </span>
        </div>
        
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-500">
            {t('bridge.confirmation.relayerFee')}
          </span>
          <span className="text-xs">
            {convertFromWei(bridgeData.fee.relayerFee)}
          </span>
        </div>
        
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-500">
            {t('bridge.confirmation.gasEstimate')}
          </span>
          <span className="text-xs">
            {convertFromWei(bridgeData.fee.gasEstimate)}
          </span>
        </div>
        
        <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs font-medium">
            {t('bridge.confirmation.totalFee')}
          </span>
          <span className="text-xs font-medium">
            {convertFromWei(bridgeData.fee.totalFee)}
          </span>
        </div>
      </div>
      
      {/* 경고 */}
      <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-md mb-4">
        <p className="text-xs text-yellow-800 dark:text-yellow-200">
          {t('bridge.confirmation.warning')}
        </p>
      </div>
      
      {/* 오류 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
          {error}
        </div>
      )}
      
      {/* 버튼 */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={onBack}
          disabled={loading}
          className="flex-1"
        >
          {t('common.back')}
        </Button>
        
        <Button
          variant="primary"
          onClick={onConfirm}
          loading={loading}
          className="flex-1"
        >
          {t('bridge.confirmation.confirmBridge')}
        </Button>
      </div>
    </div>
  );
  
  return confirmationContent;
};

export default BridgeConfirmation;
