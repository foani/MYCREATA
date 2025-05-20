/**
 * 계정 카드 컴포넌트
 * 계정 정보와 잔액을 표시하는 카드 컴포넌트
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Account } from '../context/WalletContext';
import { Network } from '../context/NetworkContext';

// Props 타입 정의
interface AccountCardProps {
  account: Account;
  balance: string;
  network: Network | null;
  formattedBalance?: string;
  fiatValue?: string;
  isSelected?: boolean;
  showActions?: boolean;
  onClick?: () => void;
  onSend?: () => void;
  onReceive?: () => void;
  className?: string;
}

/**
 * 계정 카드 컴포넌트
 * @param account 계정 정보
 * @param balance 잔액 (Wei 단위)
 * @param network 네트워크 정보
 * @param formattedBalance 표시용 포맷팅된 잔액
 * @param fiatValue 법정 화폐 가치
 * @param isSelected 선택된 계정 여부
 * @param showActions 작업 버튼 표시 여부
 * @param onClick 클릭 핸들러
 * @param onSend 전송 버튼 클릭 핸들러
 * @param onReceive 수신 버튼 클릭 핸들러
 * @param className 추가 CSS 클래스
 */
const AccountCard: React.FC<AccountCardProps> = ({
  account,
  balance,
  network,
  formattedBalance,
  fiatValue,
  isSelected = false,
  showActions = true,
  onClick,
  onSend,
  onReceive,
  className = '',
}) => {
  const navigate = useNavigate();
  
  // 주소 축약
  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // 기본 잔액 포맷팅 (formattedBalance가 제공되지 않은 경우)
  const getFormattedBalance = () => {
    if (formattedBalance) return formattedBalance;
    
    // 임시 구현: 실제로는 ethers.js의 formatUnits 사용 필요
    try {
      const balanceNum = parseFloat(balance);
      const decimals = network?.nativeCurrency?.decimals || 18;
      const formatted = balanceNum / Math.pow(10, decimals);
      return formatted.toFixed(4);
    } catch (error) {
      return '0';
    }
  };
  
  // 계정 색상 생성 (주소 기반)
  const getAccountColor = (address: string) => {
    const hash = address.toLowerCase().substring(2, 10);
    const hue = parseInt(hash, 16) % 360;
    return `hsl(${hue}, 90%, 70%)`;
  };
  
  // 카드 클래스
  const cardClasses = `
    bg-white dark:bg-gray-800
    border border-gray-200 dark:border-gray-700
    ${isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
    rounded-lg shadow-sm
    hover:shadow-md transition-shadow
    overflow-hidden
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;
  
  return (
    <div className={cardClasses} onClick={onClick}>
      {/* 계정 정보 */}
      <div className="p-4">
        <div className="flex items-center">
          {/* 계정 아이콘 */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
            style={{ backgroundColor: getAccountColor(account.address) }}
          >
            <span className="text-white font-bold">
              {account.name.charAt(0).toUpperCase()}
            </span>
          </div>
          
          {/* 계정 상세 */}
          <div className="flex-grow">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900 dark:text-white">{account.name}</h3>
              
              {isSelected && (
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                  현재 계정
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {shortenAddress(account.address)}
            </p>
          </div>
        </div>
      </div>
      
      {/* 잔액 정보 */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">잔액</p>
            <p className="font-semibold text-lg text-gray-900 dark:text-white">
              {getFormattedBalance()} {network?.nativeCurrency?.symbol || 'ETH'}
            </p>
            {fiatValue && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {fiatValue}
              </p>
            )}
          </div>
          
          {/* 작업 버튼 */}
          {showActions && (
            <div className="flex gap-2">
              <button
                className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
                onClick={(e) => {
                  e.stopPropagation();
                  onSend ? onSend() : navigate('/send');
                }}
                aria-label="전송"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
              
              <button
                className="p-2 bg-green-100 dark:bg-green-900 rounded-full text-green-600 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800"
                onClick={(e) => {
                  e.stopPropagation();
                  onReceive ? onReceive() : navigate('/receive');
                }}
                aria-label="수신"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountCard;