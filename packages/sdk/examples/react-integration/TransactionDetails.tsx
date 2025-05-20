import React from 'react';
import { useCreLink } from './CreLinkProvider';
import { SUPPORTED_NETWORKS } from './NetworkSelector';

// 트랜잭션 정보 인터페이스
export interface TransactionInfo {
  hash: string;
  to: string;
  from: string;
  value: string;
  data?: string;
  status?: 'pending' | 'confirmed' | 'failed';
  timestamp?: number;
  gasUsed?: string;
  gasPrice?: string;
}

// 트랜잭션 상세 정보 컴포넌트 속성
interface TransactionDetailsProps {
  transaction: TransactionInfo;
  className?: string;
  onClose?: () => void;
}

/**
 * 트랜잭션 상세 정보를 표시하는 컴포넌트
 * 
 * @param transaction 트랜잭션 정보 객체
 * @param className 추가 CSS 클래스
 * @param onClose 닫기 버튼 클릭 핸들러
 */
const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  transaction,
  className = '',
  onClose
}) => {
  // CreLink 컨텍스트에서 필요한 상태 가져오기
  const { chainId } = useCreLink();
  
  // 현재 체인에 맞는 익스플로러 URL 구하기
  const getExplorerUrl = (): string | undefined => {
    if (!chainId) return undefined;
    
    const network = SUPPORTED_NETWORKS.find(n => n.chainId === chainId);
    return network?.explorerUrl;
  };
  
  // 지갑 주소 축약 함수
  const shortenAddress = (address: string): string => {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
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
  
  // 가스 비용 계산
  const calculateGasCost = (): string => {
    if (!transaction.gasUsed || !transaction.gasPrice) return 'Unknown';
    
    // 16진수 문자열에서 10진수로 변환
    const gasUsed = transaction.gasUsed.startsWith('0x') 
      ? parseInt(transaction.gasUsed, 16) 
      : parseInt(transaction.gasUsed);
    
    const gasPrice = transaction.gasPrice.startsWith('0x') 
      ? parseInt(transaction.gasPrice, 16) 
      : parseInt(transaction.gasPrice);
    
    // 가스 비용 계산 (wei 단위)
    const gasCostWei = gasUsed * gasPrice;
    
    // wei를 ETH로 변환 (1 ETH = 10^18 wei)
    return (gasCostWei / 1e18).toFixed(8);
  };
  
  // 타임스탬프를 날짜 형식으로 변환
  const formatTimestamp = (): string => {
    if (!transaction.timestamp) return 'Pending';
    
    const date = new Date(transaction.timestamp * 1000);
    return date.toLocaleString();
  };
  
  // 트랜잭션 상태에 따른 배지 색상
  const getStatusColor = (): string => {
    switch (transaction.status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  // 익스플로러 링크 생성
  const getExplorerLink = (): string => {
    const explorerUrl = getExplorerUrl();
    if (!explorerUrl || !transaction.hash) return '#';
    return `${explorerUrl}/tx/${transaction.hash}`;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}>
      <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          트랜잭션 상세 정보
        </h3>
        {onClose && (
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={onClose}
          >
            <span className="sr-only">닫기</span>
            <svg 
              className="h-6 w-6" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        )}
      </div>
      
      <div className="p-4 space-y-4">
        {/* 트랜잭션 해시 */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            트랜잭션 해시
          </h4>
          <div className="mt-1 flex items-center">
            <span className="font-mono text-sm break-all">
              {transaction.hash}
            </span>
            <button
              type="button"
              className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => navigator.clipboard.writeText(transaction.hash)}
              title="Copy to clipboard"
            >
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              </svg>
            </button>
          </div>
        </div>
        
        {/* 상태 */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            상태
          </h4>
          <div className="mt-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {transaction.status || 'Pending'}
            </span>
          </div>
        </div>
        
        {/* 송신자 및 수신자 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              송신자
            </h4>
            <div className="mt-1 font-mono text-sm break-all">
              {transaction.from}
              <div className="text-gray-500 dark:text-gray-400 mt-1">
                ({shortenAddress(transaction.from)})
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              수신자
            </h4>
            <div className="mt-1 font-mono text-sm break-all">
              {transaction.to}
              <div className="text-gray-500 dark:text-gray-400 mt-1">
                ({shortenAddress(transaction.to)})
              </div>
            </div>
          </div>
        </div>
        
        {/* 금액 및 가스 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              금액
            </h4>
            <div className="mt-1">
              {formatValue(transaction.value)} ETH
            </div>
          </div>
          
          {(transaction.gasUsed && transaction.gasPrice) && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                가스 비용
              </h4>
              <div className="mt-1">
                {calculateGasCost()} ETH
              </div>
            </div>
          )}
        </div>
        
        {/* 시간 */}
        {transaction.timestamp && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              시간
            </h4>
            <div className="mt-1">
              {formatTimestamp()}
            </div>
          </div>
        )}
        
        {/* 데이터 */}
        {transaction.data && transaction.data !== '0x' && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              데이터
            </h4>
            <div className="mt-1 bg-gray-50 dark:bg-gray-900 p-2 rounded-md overflow-x-auto">
              <pre className="font-mono text-xs break-all whitespace-pre-wrap">
                {transaction.data}
              </pre>
            </div>
          </div>
        )}
        
        {/* 익스플로러 링크 */}
        <div className="pt-2">
          <a
            href={getExplorerLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <span>블록 탐색기에서 보기</span>
            <svg
              className="ml-1 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;
