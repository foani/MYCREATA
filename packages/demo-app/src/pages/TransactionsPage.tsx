import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useWallet } from '../hooks/useWallet';
import useTransactions, { Transaction, TransactionStatus } from '../hooks/useTransactions';

/**
 * 트랜잭션 페이지 컴포넌트
 */
const TransactionsPage: React.FC = () => {
  const { status, getSelectedAccount } = useWallet();
  const { 
    transactions, 
    loading, 
    error, 
    createTransaction, 
    getTransactions, 
    estimateGas 
  } = useTransactions();
  
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [data, setData] = useState<string>('');
  const [gasEstimate, setGasEstimate] = useState<string>('21000');
  const [gasPriceEstimate, setGasPriceEstimate] = useState<string>('10000000000');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [isEstimating, setIsEstimating] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  
  // 선택된 계정
  const selectedAccount = getSelectedAccount();
  
  // 트랜잭션 내역 로드
  useEffect(() => {
    if (status === 'ready' && selectedAccount) {
      getTransactions(selectedAccount.address);
    }
  }, [status, selectedAccount, getTransactions]);
  
  // 가스 추정 핸들러
  const handleEstimateGas = async () => {
    if (!recipient || !amount) return;
    
    setIsEstimating(true);
    
    const result = await estimateGas({
      to: recipient,
      value: amount,
      data: data || undefined
    });
    
    if (result.success) {
      setGasEstimate(result.gas);
      setGasPriceEstimate(result.gasPrice);
    }
    
    setIsEstimating(false);
  };
  
  // 트랜잭션 전송 핸들러
  const handleSendTransaction = async () => {
    if (!recipient || !amount || !selectedAccount) return;
    
    setIsSending(true);
    
    const result = await createTransaction(
      {
        to: recipient,
        value: amount,
        data: data || undefined,
        gas: gasEstimate,
        gasPrice: gasPriceEstimate
      },
      selectedAccount.address
    );
    
    if (result.success) {
      setRecipient('');
      setAmount('');
      setData('');
      alert('트랜잭션이 전송되었습니다.');
    } else {
      alert(`트랜잭션 전송 오류: ${error}`);
    }
    
    setIsSending(false);
  };
  
  // 트랜잭션 상태에 따른 배경색 반환
  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'confirmed':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };
  
  // 트랜잭션 상태 텍스트 반환
  const getStatusText = (status: TransactionStatus) => {
    switch (status) {
      case 'pending':
        return '처리 중';
      case 'confirmed':
        return '확인됨';
      case 'failed':
        return '실패';
      default:
        return '알 수 없음';
    }
  };
  
  // 타임스탬프 포맷
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-text-primary dark:text-text-primary">
            트랜잭션
          </h1>
          
          {/* 지갑 준비 상태 */}
          {status === 'ready' && selectedAccount ? (
            <>
              {/* 트랜잭션 생성 */}
              <Card title="트랜잭션 생성">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary dark:text-text-primary mb-1">
                      수신자 주소
                    </label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="0x..."
                      className="w-full p-2 border border-border-color rounded-md bg-surface-color text-text-primary dark:bg-surface-color dark:text-text-primary dark:border-border-color"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary dark:text-text-primary mb-1">
                      금액 (CTA)
                    </label>
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.0"
                      className="w-full p-2 border border-border-color rounded-md bg-surface-color text-text-primary dark:bg-surface-color dark:text-text-primary dark:border-border-color"
                    />
                  </div>
                  
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm text-primary dark:text-primary flex items-center"
                  >
                    {showAdvanced ? '고급 옵션 숨기기' : '고급 옵션 표시'}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 ml-1 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showAdvanced && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="block text-sm font-medium text-text-primary dark:text-text-primary mb-1">
                          데이터 (16진수)
                        </label>
                        <input
                          type="text"
                          value={data}
                          onChange={(e) => setData(e.target.value)}
                          placeholder="0x"
                          className="w-full p-2 border border-border-color rounded-md bg-surface-color text-text-primary dark:bg-surface-color dark:text-text-primary dark:border-border-color"
                        />
                      </div>
                      
                      <div className="flex space-x-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-text-primary dark:text-text-primary mb-1">
                            가스 한도
                          </label>
                          <input
                            type="text"
                            value={gasEstimate}
                            onChange={(e) => setGasEstimate(e.target.value)}
                            className="w-full p-2 border border-border-color rounded-md bg-surface-color text-text-primary dark:bg-surface-color dark:text-text-primary dark:border-border-color"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-text-primary dark:text-text-primary mb-1">
                            가스 가격 (Gwei)
                          </label>
                          <input
                            type="text"
                            value={(parseInt(gasPriceEstimate) / 1e9).toString()}
                            onChange={(e) => setGasPriceEstimate((parseFloat(e.target.value) * 1e9).toString())}
                            className="w-full p-2 border border-border-color rounded-md bg-surface-color text-text-primary dark:bg-surface-color dark:text-text-primary dark:border-border-color"
                          />
                        </div>
                      </div>
                      
                      <Button
                        variant="secondary"
                        onClick={handleEstimateGas}
                        disabled={!recipient || !amount || isEstimating}
                        isLoading={isEstimating}
                      >
                        가스 추정
                      </Button>
                    </div>
                  )}
                  
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleSendTransaction}
                    disabled={!recipient || !amount || isSending}
                    isLoading={isSending}
                  >
                    전송
                  </Button>
                </div>
              </Card>
              
              {/* 트랜잭션 내역 */}
              <Card title="트랜잭션 내역" className="mt-4">
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : transactions.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {transactions.map((tx) => (
                        <div
                          key={tx.hash}
                          className="p-3 border border-border-color rounded-md"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-text-primary dark:text-text-primary break-all">
                                {tx.hash}
                              </p>
                              <p className="text-xs text-text-secondary dark:text-text-secondary">
                                {formatTimestamp(tx.timestamp)}
                              </p>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs ${getStatusColor(tx.status)}`}>
                              {getStatusText(tx.status)}
                            </div>
                          </div>
                          
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs text-text-secondary dark:text-text-secondary">
                                보낸 주소
                              </p>
                              <p className="text-sm text-text-primary dark:text-text-primary break-all">
                                {tx.from}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-xs text-text-secondary dark:text-text-secondary">
                                받는 주소
                              </p>
                              <p className="text-sm text-text-primary dark:text-text-primary break-all">
                                {tx.to}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-xs text-text-secondary dark:text-text-secondary">
                                금액
                              </p>
                              <p className="text-sm font-medium text-text-primary dark:text-text-primary">
                                {tx.value} CTA
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-xs text-text-secondary dark:text-text-secondary">
                                가스 비용
                              </p>
                              <p className="text-sm text-text-primary dark:text-text-primary">
                                {(parseInt(tx.gas) * parseInt(tx.gasPrice) / 1e18).toFixed(8)} CTA
                              </p>
                            </div>
                          </div>
                          
                          {tx.data && tx.data !== '0x' && (
                            <div className="mt-2">
                              <p className="text-xs text-text-secondary dark:text-text-secondary">
                                데이터
                              </p>
                              <p className="text-sm text-text-primary dark:text-text-primary break-all font-mono">
                                {tx.data}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-text-secondary dark:text-text-secondary">
                      트랜잭션 내역이 없습니다.
                    </div>
                  )}
                  
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => selectedAccount && getTransactions(selectedAccount.address)}
                    disabled={loading}
                    isLoading={loading}
                  >
                    새로고침
                  </Button>
                </div>
              </Card>
            </>
          ) : (
            <Card>
              <div className="text-center py-4">
                <p className="text-text-secondary dark:text-text-secondary mb-4">
                  트랜잭션을 생성하려면 지갑을 생성하고 잠금을 해제해야 합니다.
                </p>
                <Button
                  variant="primary"
                  onClick={() => window.location.href = '/wallet'}
                >
                  지갑으로 이동
                </Button>
              </div>
            </Card>
          )}
          
          {/* 오류 메시지 */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TransactionsPage;