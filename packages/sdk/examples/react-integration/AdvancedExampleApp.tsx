import React, { useState } from 'react';
import { CreLinkProvider, useCreLink } from './CreLinkProvider';
import WalletButton from './WalletButton';
import NetworkSelector from './NetworkSelector';
import SignMessageForm from './SignMessageForm';
import TransactionDetails, { TransactionInfo } from './TransactionDetails';

// 탭 타입 정의
type TabType = 'wallet' | 'sign' | 'send' | 'history';

// 앱 헤더 컴포넌트
const AppHeader: React.FC = () => {
  // CreLink 컨텍스트에서 필요한 상태 가져오기
  const { isConnected } = useCreLink();
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">C</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            CreLink Demo
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {isConnected && (
            <div className="hidden sm:block">
              <NetworkSelector className="w-64" />
            </div>
          )}
          <WalletButton variant="primary" />
        </div>
      </div>
    </header>
  );
};

// 탭 내비게이션 컴포넌트
interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { key: 'wallet', label: '지갑' },
    { key: 'sign', label: '서명' },
    { key: 'send', label: '송금' },
    { key: 'history', label: '내역' }
  ] as const;
  
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="flex -mb-px">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

// 지갑 정보 컴포넌트
const WalletInfo: React.FC = () => {
  // CreLink 컨텍스트에서 필요한 상태 가져오기
  const { accounts, chainId, balance } = useCreLink();
  
  // 잔액 포맷팅
  const formatBalance = (): string => {
    if (!balance) return '0';
    
    // 16진수 문자열에서 10진수로 변환
    if (balance.startsWith('0x')) {
      return (parseInt(balance, 16) / 1e18).toFixed(6);
    }
    
    // 이미 숫자 형태인 경우
    return (parseFloat(balance) / 1e18).toFixed(6);
  };
  
  // 체인 ID 포맷팅
  const formatChainId = (): string => {
    if (!chainId) return 'Unknown';
    
    // 16진수 문자열인 경우
    if (chainId.startsWith('0x')) {
      return `${chainId} (${parseInt(chainId, 16)})`;
    }
    
    return chainId;
  };
  
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        지갑 정보
      </h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            계정 주소
          </h3>
          <div className="mt-1 font-mono text-sm break-all">
            {accounts[0]}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              체인 ID
            </h3>
            <div className="mt-1">
              {formatChainId()}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              잔액
            </h3>
            <div className="mt-1">
              {formatBalance()} ETH
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            네트워크
          </h3>
          <div className="mt-1">
            <NetworkSelector className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

// 송금 폼 컴포넌트
const SendForm: React.FC<{ onTransactionSent: (txInfo: TransactionInfo) => void }> = ({ onTransactionSent }) => {
  // CreLink 컨텍스트에서 필요한 상태 및 함수 가져오기
  const { accounts, sendTransaction } = useCreLink();
  
  // 송금 양식 상태
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [data, setData] = useState<string>('0x');
  
  // 송금 중 상태
  const [sending, setSending] = useState<boolean>(false);
  
  // 오류 메시지
  const [error, setError] = useState<string>('');
  
  // 입력값 유효성 검사
  const isValidForm = (): boolean => {
    return Boolean(
      recipient && 
      recipient.startsWith('0x') && 
      recipient.length === 42 &&
      amount && 
      parseFloat(amount) > 0
    );
  };
  
  // 송금 처리 함수
  const handleSend = async () => {
    if (!isValidForm()) return;
    
    setError('');
    setSending(true);
    
    try {
      // 이더 양을 Wei로 변환
      const valueInWei = String(parseFloat(amount) * 1e18);
      
      // 트랜잭션 데이터 구성
      const txData = {
        to: recipient,
        from: accounts[0],
        value: '0x' + parseInt(valueInWei).toString(16), // 16진수로 변환
        data: data || '0x'
      };
      
      // 트랜잭션 전송
      const txHash = await sendTransaction(txData);
      
      // 트랜잭션 정보 구성
      const txInfo: TransactionInfo = {
        hash: txHash,
        from: accounts[0],
        to: recipient,
        value: txData.value,
        data: txData.data,
        status: 'pending',
        timestamp: Math.floor(Date.now() / 1000)
      };
      
      // 트랜잭션 전송 콜백 호출
      onTransactionSent(txInfo);
      
      // 폼 초기화
      setRecipient('');
      setAmount('');
      setData('0x');
    } catch (err) {
      console.error('Failed to send transaction:', err);
      setError(err instanceof Error ? err.message : '송금에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };
  
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        송금
      </h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            수신자 주소
          </label>
          <input
            id="recipient"
            type="text"
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="0x..."
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            금액 (ETH)
          </label>
          <input
            id="amount"
            type="number"
            step="0.0001"
            min="0"
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="data" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            데이터 (선택 사항)
          </label>
          <input
            id="data"
            type="text"
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="0x..."
            value={data}
            onChange={e => setData(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            일반적인 송금은 데이터 필드를 비워두세요. 스마트 컨트랙트 호출 시에만 필요합니다.
          </p>
        </div>
        
        {/* 오류 메시지 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="pt-2">
          <button
            type="button"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSend}
            disabled={!isValidForm() || sending}
          >
            {sending ? '송금 중...' : '송금하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 트랜잭션 히스토리 컴포넌트
const TransactionHistory: React.FC<{ 
  transactions: TransactionInfo[];
  onViewDetails: (tx: TransactionInfo) => void;
}> = ({ transactions, onViewDetails }) => {
  // 트랜잭션 없을 때 표시할 내용
  if (transactions.length === 0) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          트랜잭션 내역
        </h2>
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          트랜잭션 내역이 없습니다.
        </div>
      </div>
    );
  }
  
  // 지갑 주소 축약 함수
  const shortenAddress = (address: string): string => {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // 상태에 따른 배지 색상
  const getStatusColor = (status?: string): string => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  // 트랜잭션 값을 ETH 단위로 변환
  const formatValue = (value: string): string => {
    if (!value) return '0';
    
    // 16진수 문자열에서 10진수로 변환
    if (value.startsWith('0x')) {
      return (parseInt(value, 16) / 1e18).toString();
    }
    
    // 이미 숫자 형태인 경우
    return (parseFloat(value) / 1e18).toString();
  };
  
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        트랜잭션 내역
      </h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                해시
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                수신자
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                금액
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                상태
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                시간
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">상세보기</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {transactions.map((tx) => (
              <tr key={tx.hash} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">
                  {shortenAddress(tx.hash)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">
                  {shortenAddress(tx.to)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatValue(tx.value)} ETH
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(tx.status)}`}>
                    {tx.status || 'pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleString() : 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    onClick={() => onViewDetails(tx)}
                  >
                    상세보기
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 앱 컨텐츠 컴포넌트
const AppContent: React.FC = () => {
  // CreLink 컨텍스트에서 필요한 상태 가져오기
  const { isConnected, error } = useCreLink();
  
  // 활성 탭 상태
  const [activeTab, setActiveTab] = useState<TabType>('wallet');
  
  // 트랜잭션 내역 상태
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  
  // 선택된 트랜잭션 상태
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionInfo | null>(null);
  
  // 트랜잭션 추가 함수
  const handleTransactionSent = (txInfo: TransactionInfo) => {
    setTransactions(prev => [txInfo, ...prev]);
    setActiveTab('history');
  };
  
  // 연결 안 된 경우 표시할 내용
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            CreLink 고급 예제
          </h2>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Web3 지갑과 블록체인 인터랙션을 위한 완전한 솔루션
          </p>
        </div>
        
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full mx-auto flex items-center justify-center">
              <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">
              지갑 연결 필요
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              CreLink 지갑을 연결하여 고급 기능을 사용해보세요.
            </p>
            <div className="mt-6">
              <WalletButton
                variant="primary"
                className="w-full"
                buttonText={{
                  connect: '지갑 연결하기',
                  connecting: '연결 중...',
                  connected: '연결됨'
                }}
              />
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 max-w-md w-full bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error.message}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // 트랜잭션 상세 보기 모달이 열린 경우
  if (selectedTransaction) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <TransactionDetails
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="py-6">
          {activeTab === 'wallet' && <WalletInfo />}
          {activeTab === 'sign' && <SignMessageForm />}
          {activeTab === 'send' && <SendForm onTransactionSent={handleTransactionSent} />}
          {activeTab === 'history' && (
            <TransactionHistory
              transactions={transactions}
              onViewDetails={setSelectedTransaction}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// 메인 앱 컴포넌트
const AdvancedExampleApp: React.FC = () => {
  return (
    <CreLinkProvider autoConnect={false}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AppHeader />
        <AppContent />
      </div>
    </CreLinkProvider>
  );
};

export default AdvancedExampleApp;
