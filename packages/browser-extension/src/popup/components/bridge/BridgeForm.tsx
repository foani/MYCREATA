/**
 * 크로스체인 브릿지 폼 컴포넌트
 * 
 * 브릿지 과정의 첫 단계로, 사용자가 체인과 토큰, 금액 등을 선택할 수 있는 폼을 제공합니다.
 * 
 * @author CreLink Team
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TokenSelector from '../TokenSelector';
import ChainSelector from './ChainSelector';
import { useWallet } from '../../hooks/useWallet';
import { useNetwork } from '../../hooks/useNetwork';
import { useAssets } from '../../hooks/useAssets';
import { BridgeService } from '../../../services/bridge.service';
import { ChainType } from '../../../../core/src/chain/chains';
import { convertToWei, convertFromWei } from '../../../../core/src/utils/conversion';
import Button from '../common/Button';
import Input from '../common/Input';
import { BridgeAsset } from '../../../../core/src/chain/bridge/bridge.interface';

interface BridgeFormProps {
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
  onDataChange: (data: any) => void;
  onTargetChainChange: (chain: ChainType) => void;
  onContinue: () => void;
  loading: boolean;
  error: string;
  setError: (error: string) => void;
}

const BridgeForm: React.FC<BridgeFormProps> = ({
  bridgeData,
  onDataChange,
  onTargetChainChange,
  onContinue,
  loading,
  error,
  setError
}) => {
  const { t } = useTranslation();
  const { account } = useWallet();
  const { currentChain, availableChains } = useNetwork();
  const { balances, getTokenInfo } = useAssets();
  
  // 지원되는 브릿지 자산 목록
  const [supportedAssets, setSupportedAssets] = useState<BridgeAsset[]>([]);
  
  // 브릿지 서비스 인스턴스
  const [bridgeService, setBridgeService] = useState<BridgeService | null>(null);
  
  // 로딩 상태
  const [assetsLoading, setAssetsLoading] = useState<boolean>(false);
  
  // 최대 금액 (전체 잔액 선택)
  const [maxAmount, setMaxAmount] = useState<string>('0');
  
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
  }, [t, setError]);
  
  // 지원되는 자산 목록 로드
  useEffect(() => {
    const loadSupportedAssets = async () => {
      if (!bridgeService) return;
      
      try {
        setAssetsLoading(true);
        const assets = await bridgeService.getSupportedAssets(bridgeData.sourceChain);
        setSupportedAssets(assets);
        setAssetsLoading(false);
      } catch (error) {
        console.error('Supported assets loading error:', error);
        setError(t('bridge.errors.assetsLoadFailed'));
        setAssetsLoading(false);
      }
    };
    
    loadSupportedAssets();
  }, [bridgeService, bridgeData.sourceChain, setError, t]);
  
  // 대상 체인이 변경될 때 지원 자산 목록 갱신
  useEffect(() => {
    const updateTargetChainAssets = async () => {
      if (!bridgeService) return;
      
      try {
        setAssetsLoading(true);
        const assets = await bridgeService.getSupportedAssets(bridgeData.sourceChain);
        setSupportedAssets(assets);
        setAssetsLoading(false);
      } catch (error) {
        console.error('Supported assets loading error:', error);
        setError(t('bridge.errors.assetsLoadFailed'));
        setAssetsLoading(false);
      }
    };
    
    updateTargetChainAssets();
  }, [bridgeData.targetChain, bridgeService, bridgeData.sourceChain, setError, t]);
  
  // 토큰 잔액 업데이트
  useEffect(() => {
    const updateMaxAmount = async () => {
      if (!bridgeData.sourceToken || !account) return;
      
      const balance = balances[bridgeData.sourceToken] || '0';
      setMaxAmount(balance);
    };
    
    updateMaxAmount();
  }, [bridgeData.sourceToken, account, balances]);
  
  // 소스 토큰 변경 핸들러
  const handleSourceTokenChange = async (token: string) => {
    if (!bridgeService) return;
    
    try {
      // 해당 토큰에 대한 대상 체인의 매핑 토큰 가져오기
      const targetToken = await bridgeService.getMappedToken(token, bridgeData.sourceChain);
      
      onDataChange({
        sourceToken: token,
        targetToken
      });
    } catch (error) {
      console.error('Token mapping error:', error);
      setError(t('bridge.errors.tokenMappingFailed'));
    }
  };
  
  // 금액 변경 핸들러
  const handleAmountChange = (amount: string) => {
    // 유효한 숫자 입력만 허용
    if (amount && !/^\d*\.?\d*$/.test(amount)) {
      return;
    }
    
    onDataChange({ amount });
  };
  
  // 최대 금액 선택 핸들러
  const handleMaxAmount = () => {
    onDataChange({ amount: convertFromWei(maxAmount) });
  };
  
  // 수신자 주소 변경 핸들러
  const handleRecipientChange = (recipient: string) => {
    onDataChange({ recipient });
  };
  
  // 계속 버튼 핸들러
  const handleContinue = () => {
    // 필수 값 검증
    if (!bridgeData.sourceToken) {
      setError(t('bridge.errors.selectToken'));
      return;
    }
    
    if (!bridgeData.amount || parseFloat(bridgeData.amount) <= 0) {
      setError(t('bridge.errors.invalidAmount'));
      return;
    }
    
    if (!bridgeData.recipient) {
      setError(t('bridge.errors.invalidRecipient'));
      return;
    }
    
    // 금액 검증
    const amountInWei = convertToWei(bridgeData.amount);
    if (BigInt(amountInWei) > BigInt(maxAmount)) {
      setError(t('bridge.errors.insufficientBalance'));
      return;
    }
    
    onContinue();
  };
  
  return (
    <div className="flex flex-col w-full">
      {/* 소스 체인 섹션 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          {t('bridge.sourceChain')}
        </label>
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
          <div className="flex items-center">
            <img
              src={`/assets/chains/${bridgeData.sourceChain.toLowerCase()}.svg`}
              alt={bridgeData.sourceChain}
              className="w-6 h-6 mr-2"
            />
            <span>{bridgeData.sourceChain}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {t('bridge.sourceChainDescription')}
        </p>
      </div>
      
      {/* 대상 체인 섹션 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          {t('bridge.targetChain')}
        </label>
        <ChainSelector
          currentChain={bridgeData.targetChain}
          availableChains={availableChains.filter(chain => chain !== bridgeData.sourceChain)}
          onChange={onTargetChainChange}
        />
        <p className="text-xs text-gray-500 mt-1">
          {t('bridge.targetChainDescription')}
        </p>
      </div>
      
      {/* 토큰 선택 섹션 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          {t('bridge.selectToken')}
        </label>
        {assetsLoading ? (
          <div className="py-3 text-center">
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-2">{t('common.loading')}</span>
          </div>
        ) : (
          <TokenSelector
            tokens={supportedAssets.map(asset => ({
              address: asset.sourceToken.address,
              symbol: asset.sourceToken.symbol,
              name: asset.sourceToken.name,
              decimals: asset.sourceToken.decimals,
              balance: balances[asset.sourceToken.address] || '0'
            }))}
            selectedToken={bridgeData.sourceToken}
            onSelectToken={handleSourceTokenChange}
          />
        )}
      </div>
      
      {/* 금액 입력 섹션 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium">
            {t('bridge.amount')}
          </label>
          <div className="text-xs text-gray-500">
            {t('common.balance')}: {convertFromWei(maxAmount)}
          </div>
        </div>
        <div className="relative">
          <Input
            type="text"
            value={bridgeData.amount}
            onChange={e => handleAmountChange(e.target.value)}
            placeholder="0.0"
            className="pr-16"
          />
          <button
            type="button"
            onClick={handleMaxAmount}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded"
          >
            {t('common.max')}
          </button>
        </div>
      </div>
      
      {/* 수신자 주소 입력 섹션 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          {t('bridge.recipient')}
        </label>
        <Input
          type="text"
          value={bridgeData.recipient}
          onChange={e => handleRecipientChange(e.target.value)}
          placeholder={t('bridge.recipientPlaceholder')}
        />
        <p className="text-xs text-gray-500 mt-1">
          {t('bridge.recipientDescription')}
        </p>
      </div>
      
      {/* 오류 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
          {error}
        </div>
      )}
      
      {/* 계속 버튼 */}
      <Button
        variant="primary"
        onClick={handleContinue}
        loading={loading}
        disabled={!bridgeData.sourceToken || !bridgeData.amount || !bridgeData.recipient || loading}
        className="mt-4"
      >
        {t('common.continue')}
      </Button>
    </div>
  );
};

export default BridgeForm;
