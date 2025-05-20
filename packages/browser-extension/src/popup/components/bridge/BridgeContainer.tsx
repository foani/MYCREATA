/**
 * 크로스체인 브릿지 컨테이너 컴포넌트
 * 
 * 이 컴포넌트는 다른 체인으로 자산을 이동하는 브릿지 UI의 메인 컨테이너입니다.
 * 여러 단계 과정을 포함한 자산 브릿징 과정을 관리합니다.
 * 
 * @author CreLink Team
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BridgeForm from './BridgeForm';
import BridgeConfirmation from './BridgeConfirmation';
import BridgeProgress from './BridgeProgress';
import BridgeComplete from './BridgeComplete';
import { useWallet } from '../../hooks/useWallet';
import { useNetwork } from '../../hooks/useNetwork';
import { BridgeService } from '../../../services/bridge.service';
import { ChainType } from '../../../../core/src/chain/chains';
import { BridgeTransaction, BridgeTransactionStatus } from '../../../../core/src/chain/bridge/bridge.interface';

// 브릿지 과정의 단계
enum BridgeStep {
  FORM = 'form',
  CONFIRMATION = 'confirmation',
  PROGRESS = 'progress',
  COMPLETE = 'complete'
}

// 브릿지 과정에서 사용되는 데이터
interface BridgeData {
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
  transaction?: BridgeTransaction;
}

const BridgeContainer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { account, signTransaction } = useWallet();
  const { currentChain, availableChains, switchChain } = useNetwork();
  
  // 현재 브릿지 단계
  const [step, setStep] = useState<BridgeStep>(BridgeStep.FORM);
  
  // 브릿지 과정 데이터
  const [bridgeData, setBridgeData] = useState<BridgeData>({
    sourceChain: currentChain as ChainType,
    targetChain: ChainType.ETHEREUM, // 기본 대상 체인
    sourceToken: '',
    targetToken: '',
    amount: '',
    recipient: account?.address || '',
    fee: {
      bridgeFee: '0',
      relayerFee: '0',
      gasEstimate: '0',
      totalFee: '0'
    }
  });
  
  // 브릿지 서비스 인스턴스
  const [bridgeService, setBridgeService] = useState<BridgeService | null>(null);
  
  // 로딩 상태
  const [loading, setLoading] = useState<boolean>(false);
  
  // 오류 메시지
  const [error, setError] = useState<string>('');
  
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
  
  // 데이터 업데이트 핸들러
  const handleDataChange = (newData: Partial<BridgeData>) => {
    setBridgeData(prev => ({ ...prev, ...newData }));
  };
  
  // 브릿지 대상 체인 변경 핸들러
  const handleTargetChainChange = async (chain: ChainType) => {
    // 현재 체인과 동일하면 변경 불가
    if (chain === bridgeData.sourceChain) {
      setError(t('bridge.errors.sameChain'));
      return;
    }
    
    handleDataChange({
      targetChain: chain,
      // 체인 변경 시 토큰 정보 초기화
      sourceToken: '',
      targetToken: '',
      amount: '',
      fee: {
        bridgeFee: '0',
        relayerFee: '0',
        gasEstimate: '0',
        totalFee: '0'
      }
    });
  };
  
  // 수수료 추정 함수
  const estimateFee = async () => {
    if (!bridgeService || !bridgeData.sourceToken || !bridgeData.amount) {
      return;
    }
    
    try {
      setLoading(true);
      const fee = await bridgeService.estimateBridgeFee(
        bridgeData.sourceToken,
        bridgeData.amount,
        bridgeData.sourceChain
      );
      
      handleDataChange({ fee });
    } catch (error) {
      console.error('Fee estimation error:', error);
      setError(t('bridge.errors.feeEstimationFailed'));
    } finally {
      setLoading(false);
    }
  };
  
  // 브릿지 과정 다음 단계로 이동
  const handleNext = async () => {
    try {
      switch (step) {
        case BridgeStep.FORM:
          // 필수 입력값 검증
          if (!bridgeData.sourceToken || !bridgeData.amount || !bridgeData.recipient) {
            setError(t('bridge.errors.incompleteData'));
            return;
          }
          
          // 수수료 추정
          await estimateFee();
          
          // 다음 단계로
          setStep(BridgeStep.CONFIRMATION);
          break;
          
        case BridgeStep.CONFIRMATION:
          // 브릿지 트랜잭션 시작
          if (!bridgeService) {
            setError(t('bridge.errors.serviceNotAvailable'));
            return;
          }
          
          setLoading(true);
          const transaction = await bridgeService.bridgeAsset(
            bridgeData.sourceToken,
            bridgeData.amount,
            bridgeData.recipient,
            bridgeData.sourceChain,
            signTransaction
          );
          
          // 트랜잭션 상태 저장
          handleDataChange({ transaction });
          
          // 진행 단계로 이동
          setStep(BridgeStep.PROGRESS);
          setLoading(false);
          break;
          
        case BridgeStep.PROGRESS:
          // 트랜잭션이 완료된 경우에만 다음 단계로
          if (bridgeData.transaction?.status === BridgeTransactionStatus.COMPLETED) {
            setStep(BridgeStep.COMPLETE);
          }
          break;
          
        case BridgeStep.COMPLETE:
          // 처음으로 돌아가기
          navigate('/wallet');
          break;
      }
    } catch (error) {
      console.error('Bridge process error:', error);
      setError(t('bridge.errors.processFailed'));
      setLoading(false);
    }
  };
  
  // 브릿지 과정 이전 단계로 이동
  const handleBack = () => {
    switch (step) {
      case BridgeStep.CONFIRMATION:
        setStep(BridgeStep.FORM);
        break;
      case BridgeStep.PROGRESS:
        // 진행 중일 때는 뒤로 갈 수 없음
        if (
          bridgeData.transaction?.status === BridgeTransactionStatus.PENDING ||
          bridgeData.transaction?.status === BridgeTransactionStatus.PROCESSING
        ) {
          return;
        }
        setStep(BridgeStep.CONFIRMATION);
        break;
      case BridgeStep.COMPLETE:
        // 완료 상태에서는 처음으로 돌아감
        setStep(BridgeStep.FORM);
        // 브릿지 데이터 초기화
        setBridgeData({
          sourceChain: currentChain as ChainType,
          targetChain: ChainType.ETHEREUM,
          sourceToken: '',
          targetToken: '',
          amount: '',
          recipient: account?.address || '',
          fee: {
            bridgeFee: '0',
            relayerFee: '0',
            gasEstimate: '0',
            totalFee: '0'
          }
        });
        break;
    }
  };
  
  // 트랜잭션 상태 업데이트
  const updateTransactionStatus = async () => {
    if (!bridgeService || !bridgeData.transaction) {
      return;
    }
    
    try {
      const updatedTransaction = await bridgeService.getTransactionStatus(
        bridgeData.transaction.id,
        bridgeData.sourceChain
      );
      
      handleDataChange({ transaction: updatedTransaction });
      
      // 트랜잭션이 완료되면 완료 단계로 이동
      if (updatedTransaction.status === BridgeTransactionStatus.COMPLETED) {
        setStep(BridgeStep.COMPLETE);
      }
    } catch (error) {
      console.error('Transaction status update error:', error);
    }
  };
  
  // 트랜잭션 상태 주기적 업데이트
  useEffect(() => {
    if (step !== BridgeStep.PROGRESS || !bridgeData.transaction) {
      return;
    }
    
    // 완료/실패/취소 상태이면 업데이트 중지
    if (
      bridgeData.transaction.status === BridgeTransactionStatus.COMPLETED ||
      bridgeData.transaction.status === BridgeTransactionStatus.FAILED ||
      bridgeData.transaction.status === BridgeTransactionStatus.CANCELED
    ) {
      return;
    }
    
    // 10초마다 상태 업데이트
    const interval = setInterval(updateTransactionStatus, 10000);
    
    return () => clearInterval(interval);
  }, [step, bridgeData.transaction]);
  
  // 현재 단계에 맞는 UI 렌더링
  const renderStepContent = () => {
    switch (step) {
      case BridgeStep.FORM:
        return (
          <BridgeForm
            bridgeData={bridgeData}
            onDataChange={handleDataChange}
            onTargetChainChange={handleTargetChainChange}
            onContinue={handleNext}
            loading={loading}
            error={error}
            setError={setError}
          />
        );
        
      case BridgeStep.CONFIRMATION:
        return (
          <BridgeConfirmation
            bridgeData={bridgeData}
            onConfirm={handleNext}
            onBack={handleBack}
            loading={loading}
            error={error}
            setError={setError}
          />
        );
        
      case BridgeStep.PROGRESS:
        return (
          <BridgeProgress
            bridgeData={bridgeData}
            onUpdateStatus={updateTransactionStatus}
            onBack={handleBack}
            onNext={handleNext}
            error={error}
            setError={setError}
          />
        );
        
      case BridgeStep.COMPLETE:
        return (
          <BridgeComplete
            bridgeData={bridgeData}
            onDone={handleNext}
            onStartNew={handleBack}
          />
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="flex flex-col w-full h-full">
      <h1 className="text-xl font-bold text-center mb-4">
        {t('bridge.title')}
      </h1>
      
      {renderStepContent()}
    </div>
  );
};

export default BridgeContainer;
