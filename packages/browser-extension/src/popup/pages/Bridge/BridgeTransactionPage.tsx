import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatEther, parseEther } from 'ethers/lib/utils';
import { ArrowsRightLeftIcon, ArrowPathIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

// 컴포넌트 및 훅 임포트
import MainLayout from '../../../layouts/MainLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingScreen from '../../components/common/LoadingScreen';
import useWallet from '../../hooks/useWallet';
import useNetwork from '../../hooks/useNetwork';
import useBridge from '../../hooks/useBridge';
import { BRIDGE_STATUS } from '../../../constants/bridge';
import ChainBadge from '../../components/ChainBadge';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import useTheme from '../../hooks/useTheme';

/**
 * 브릿지 트랜잭션 페이지
 * 
 * 사용자가 체인 간에 자산을 이동하는 트랜잭션 진행 상태와 결과를 보여주는 페이지입니다.
 * 트랜잭션 상태에 따라 다양한 UI와 사용자 액션을 제공합니다.
 */
const BridgeTransactionPage: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { txId } = useParams<{ txId: string }>();
  
  const { account } = useWallet();
  const { getChainById } = useNetwork();
  const { getBridgeTransaction, executeBridgeTransaction, confirmBridgeTransaction } = useBridge();
  
  // 브릿지 트랜잭션 상태 관리
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingTx, setConfirmingTx] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [processingAction, setProcessingAction] = useState<boolean>(false);
  
  // 브릿지 트랜잭션 정보 로드
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        
        if (!txId) {
          throw new Error('Transaction ID is required');
        }
        
        // 로케이션 스테이트에서 트랜잭션 정보를 먼저 확인
        if (location.state?.transaction) {
          setTransaction(location.state.transaction);
        } else {
          // 스테이트가 없으면 브릿지 서비스에서 가져옴
          const tx = await getBridgeTransaction(txId);
          if (!tx) {
            throw new Error('Transaction not found');
          }
          setTransaction(tx);
        }
      } catch (err: any) {
        console.error('Failed to fetch bridge transaction:', err);
        setError(err.message || 'Failed to load transaction details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransaction();
  }, [txId, location.state, getBridgeTransaction]);
  
  // 트랜잭션 상태 주기적으로 업데이트
  useEffect(() => {
    if (!txId || loading) return;
    
    // 완료 상태가 아닌 경우에만 정기적으로 상태 업데이트
    if (transaction && 
        transaction.status !== BRIDGE_STATUS.COMPLETED && 
        transaction.status !== BRIDGE_STATUS.FAILED) {
      
      const intervalId = setInterval(async () => {
        try {
          const updatedTx = await getBridgeTransaction(txId);
          if (updatedTx) {
            setTransaction(updatedTx);
            
            // 완료 상태가 되면 인터벌 클리어
            if (updatedTx.status === BRIDGE_STATUS.COMPLETED || updatedTx.status === BRIDGE_STATUS.FAILED) {
              clearInterval(intervalId);
            }
          }
        } catch (err) {
          console.error('Failed to update transaction status:', err);
        }
      }, 15000); // 15초마다 업데이트
      
      return () => clearInterval(intervalId);
    }
  }, [txId, transaction, loading, getBridgeTransaction]);
  
  // 브릿지 트랜잭션 실행 처리
  const handleExecuteTransaction = async () => {
    if (!transaction || !account) return;
    
    try {
      setProcessingAction(true);
      await executeBridgeTransaction(transaction.id);
      
      // 트랜잭션 정보 다시 로드
      const updatedTx = await getBridgeTransaction(transaction.id);
      if (updatedTx) {
        setTransaction(updatedTx);
      }
    } catch (err: any) {
      console.error('Failed to execute bridge transaction:', err);
      setError(err.message || 'Failed to execute transaction');
    } finally {
      setProcessingAction(false);
    }
  };
  
  // 트랜잭션 확인 처리
  const handleConfirmTransaction = async () => {
    if (!transaction || !account) return;
    
    try {
      setConfirmingTx(true);
      await confirmBridgeTransaction(transaction.id);
      
      // 트랜잭션 정보 다시 로드
      const updatedTx = await getBridgeTransaction(transaction.id);
      if (updatedTx) {
        setTransaction(updatedTx);
      }
    } catch (err: any) {
      console.error('Failed to confirm bridge transaction:', err);
      setError(err.message || 'Failed to confirm transaction');
    } finally {
      setConfirmingTx(false);
      setShowConfirmModal(false);
    }
  };
  
  // 에러 발생 시 표시할 UI
  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full p-4">
          <XCircleIcon className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-xl font-bold mb-2">{t('bridge.error')}</h1>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
            {error}
          </p>
          <Button
            onClick={() => navigate('/bridge')}
            fullWidth
          >
            {t('bridge.backToBridge')}
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  // 로딩 중일 때 표시할 UI
  if (loading || !transaction) {
    return <LoadingScreen text={t('bridge.loadingTransaction')} />;
  }
  
  // 소스 및 대상 체인 정보 가져오기
  const sourceChain = getChainById(transaction.sourceChainId);
  const targetChain = getChainById(transaction.targetChainId);
  
  // 트랜잭션 상태에 따른 상태 메시지 및 아이콘 결정
  const getStatusInfo = () => {
    switch (transaction.status) {
      case BRIDGE_STATUS.PENDING:
        return {
          icon: <ArrowPathIcon className="w-12 h-12 text-yellow-500 animate-spin" />,
          title: t('bridge.pendingTitle'),
          message: t('bridge.pendingMessage'),
          action: (
            <Button
              onClick={handleExecuteTransaction}
              fullWidth
              loading={processingAction}
            >
              {t('bridge.executeTransaction')}
            </Button>
          )
        };
        
      case BRIDGE_STATUS.PROCESSING:
        return {
          icon: <ArrowPathIcon className="w-12 h-12 text-blue-500 animate-spin" />,
          title: t('bridge.processingTitle'),
          message: t('bridge.processingMessage'),
          action: null
        };
        
      case BRIDGE_STATUS.READY_FOR_CLAIM:
        return {
          icon: <ArrowsRightLeftIcon className="w-12 h-12 text-green-500" />,
          title: t('bridge.readyForClaimTitle'),
          message: t('bridge.readyForClaimMessage'),
          action: (
            <Button
              onClick={() => setShowConfirmModal(true)}
              fullWidth
              loading={confirmingTx}
            >
              {t('bridge.claimFunds')}
            </Button>
          )
        };
        
      case BRIDGE_STATUS.COMPLETED:
        return {
          icon: <CheckCircleIcon className="w-12 h-12 text-green-500" />,
          title: t('bridge.completedTitle'),
          message: t('bridge.completedMessage'),
          action: (
            <Button
              onClick={() => navigate('/bridge/history')}
              fullWidth
            >
              {t('bridge.viewHistory')}
            </Button>
          )
        };
        
      case BRIDGE_STATUS.FAILED:
        return {
          icon: <XCircleIcon className="w-12 h-12 text-red-500" />,
          title: t('bridge.failedTitle'),
          message: t('bridge.failedMessage'),
          action: (
            <Button
              onClick={() => navigate('/bridge')}
              fullWidth
            >
              {t('bridge.tryAgain')}
            </Button>
          )
        };
        
      default:
        return {
          icon: <ArrowPathIcon className="w-12 h-12 text-gray-500" />,
          title: t('bridge.unknownStatusTitle'),
          message: t('bridge.unknownStatusMessage'),
          action: (
            <Button
              onClick={() => navigate('/bridge')}
              fullWidth
            >
              {t('bridge.backToBridge')}
            </Button>
          )
        };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        <div className="p-4">
          <h1 className="text-xl font-bold mb-4">{t('bridge.transactionDetails')}</h1>
          
          {/* 트랜잭션 상태 카드 */}
          <Card className="mb-4 p-6">
            <div className="flex flex-col items-center text-center">
              {statusInfo.icon}
              <h2 className="text-lg font-bold mt-4">{statusInfo.title}</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2 mb-4">
                {statusInfo.message}
              </p>
              
              {/* 진행 상태 표시기 */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ 
                    width: transaction.status === BRIDGE_STATUS.COMPLETED 
                      ? '100%' 
                      : transaction.status === BRIDGE_STATUS.READY_FOR_CLAIM 
                        ? '75%' 
                        : transaction.status === BRIDGE_STATUS.PROCESSING 
                          ? '50%' 
                          : transaction.status === BRIDGE_STATUS.PENDING 
                            ? '25%' 
                            : '0%' 
                  }}
                />
              </div>
              
              {/* 체인 정보 */}
              <div className="flex items-center justify-between w-full mb-6">
                <div className="flex flex-col items-center">
                  <ChainBadge chain={sourceChain} size="lg" />
                  <span className="mt-2 text-sm font-medium">{sourceChain?.name || transaction.sourceChainId}</span>
                </div>
                
                <ArrowsRightLeftIcon className="w-6 h-6 text-gray-400" />
                
                <div className="flex flex-col items-center">
                  <ChainBadge chain={targetChain} size="lg" />
                  <span className="mt-2 text-sm font-medium">{targetChain?.name || transaction.targetChainId}</span>
                </div>
              </div>
            </div>
            
            {/* 트랜잭션 상세 정보 */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{t('bridge.amount')}</span>
                  <span className="font-medium">
                    {transaction.amount ? formatEther(transaction.amount) : '0'} {transaction.token}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{t('bridge.fee')}</span>
                  <span className="font-medium">
                    {transaction.fee ? formatEther(transaction.fee) : '0'} {transaction.token}
                  </span>
                </div>
                
                {transaction.sourceTxHash && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('bridge.sourceTxHash')}</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400 truncate ml-2 max-w-[200px]">
                      {transaction.sourceTxHash.substring(0, 6)}...{transaction.sourceTxHash.substring(transaction.sourceTxHash.length - 4)}
                    </span>
                  </div>
                )}
                
                {transaction.targetTxHash && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('bridge.targetTxHash')}</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400 truncate ml-2 max-w-[200px]">
                      {transaction.targetTxHash.substring(0, 6)}...{transaction.targetTxHash.substring(transaction.targetTxHash.length - 4)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{t('bridge.created')}</span>
                  <span className="font-medium">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </span>
                </div>
                
                {transaction.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('bridge.updated')}</span>
                    <span className="font-medium">
                      {new Date(transaction.updatedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
          
          {/* 액션 버튼 */}
          <div className="mt-4">
            {statusInfo.action}
            
            {/* 브릿지 화면으로 돌아가기 버튼 (상태가 완료 또는 실패가 아닌 경우에만 표시) */}
            {transaction.status !== BRIDGE_STATUS.COMPLETED && 
             transaction.status !== BRIDGE_STATUS.FAILED && (
              <Button
                variant="secondary"
                onClick={() => navigate('/bridge')}
                fullWidth
                className="mt-3"
              >
                {t('bridge.backToBridge')}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* 확인 모달 */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={t('bridge.confirmClaimTitle')}
        message={t('bridge.confirmClaimMessage')}
        confirmText={t('bridge.confirm')}
        cancelText={t('common.cancel')}
        onConfirm={handleConfirmTransaction}
        isLoading={confirmingTx}
      />
    </MainLayout>
  );
};

export default BridgeTransactionPage;
