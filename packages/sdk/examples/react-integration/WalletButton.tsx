import React from 'react';
import { useCreLink } from './CreLinkProvider';

// 버튼 스타일 타입 정의
type ButtonVariant = 'primary' | 'secondary' | 'outline';

// 지갑 버튼 속성 인터페이스
interface WalletButtonProps {
  variant?: ButtonVariant;
  className?: string;
  buttonText?: {
    connect: string;
    connecting: string;
    connected: string;
  };
}

/**
 * 지갑 연결 상태를 표시하고 연결/연결해제 기능을 제공하는 버튼 컴포넌트
 * 
 * @param variant 버튼 스타일 변형 (기본값: 'primary')
 * @param className 추가 CSS 클래스
 * @param buttonText 버튼 텍스트 커스터마이징 옵션
 */
const WalletButton: React.FC<WalletButtonProps> = ({
  variant = 'primary',
  className = '',
  buttonText = {
    connect: 'Connect Wallet',
    connecting: 'Connecting...',
    connected: 'Connected'
  }
}) => {
  // CreLink 컨텍스트에서 필요한 상태 및 함수 가져오기
  const { isConnected, connecting, accounts, connect, disconnect } = useCreLink();

  // 버튼 클릭 핸들러
  const handleClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  // 버튼 텍스트 결정
  const getButtonText = () => {
    if (connecting) {
      return buttonText.connecting;
    }
    
    if (isConnected) {
      // 계정 주소를 축약해서 표시 (0x1234...5678 형식)
      const shortenedAddress = accounts[0] 
        ? `${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`
        : buttonText.connected;
      
      return shortenedAddress;
    }
    
    return buttonText.connect;
  };

  // 버튼 스타일 클래스 결정
  const getButtonClasses = () => {
    const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50';
    
    let variantClasses = '';
    
    switch (variant) {
      case 'primary':
        variantClasses = isConnected
          ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
          : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500';
        break;
      case 'secondary':
        variantClasses = isConnected
          ? 'bg-green-100 hover:bg-green-200 text-green-800 focus:ring-green-500'
          : 'bg-blue-100 hover:bg-blue-200 text-blue-800 focus:ring-blue-500';
        break;
      case 'outline':
        variantClasses = isConnected
          ? 'border border-green-500 text-green-600 hover:bg-green-50 focus:ring-green-500'
          : 'border border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-blue-500';
        break;
    }
    
    // 연결 중일 때의 스타일 추가
    if (connecting) {
      variantClasses = 'bg-gray-400 text-white cursor-wait';
    }
    
    return `${baseClasses} ${variantClasses} ${className}`;
  };

  return (
    <button
      className={getButtonClasses()}
      onClick={handleClick}
      disabled={connecting}
      title={isConnected ? 'Click to disconnect' : 'Click to connect CreLink'}
    >
      {getButtonText()}
    </button>
  );
};

export default WalletButton;
