/**
 * 토큰 상세 화면
 * 특정 토큰의 상세 정보와 관련 활동을 표시하는 화면
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LoadingScreen from '../components/common/LoadingScreen';
import EmptyState from '../components/common/EmptyState';
import { useWallet } from '../hooks/useWallet';
import { useNetwork } from '../context/NetworkContext';
import { useUI } from '../context/UIContext';

// 토큰 정보 인터페이스
interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  formattedBalance: string;
  fiatValue: string;
  logoURI?: string;
  isNative?: boolean;
  description?: string;
  website?: string;
  totalSupply?: string;
  marketCap?: string;
  priceChange24h?: string;
}

// 토큰 활동 인터페이스
interface TokenActivity {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'approve';
  date: number; // timestamp
  amount: string;
  formattedAmount: string;
  fiatValue: string;
  from: string;
  to: string;
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
}

/**
 * 토큰 상세 화면 컴포넌트
 */
const TokenDetailScreen: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const { selectedAccount } = useWallet();
  const { selectedNetwork } = useNetwork();
  const { showNotification } = useUI();

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<TokenInfo | null>(null);
  const [activities, setActivities] = useState<TokenActivity[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'activity'>('info');

  // 토큰 및 활동 데이터 로드
  useEffect(() => {
    const loadTokenData = async () => {
      if (!address || !selectedAccount || !selectedNetwork) {
        setIsLoading(false);
        return;
      }

      try {
        // 실제 구현에서는 백그라운드 스크립트를 통해 토큰 정보와 활동 내역을 가져옴
        // 임시 구현: 더미 데이터
        const isNative = address === '0x0000000000000000000000000000000000000000';
        
        // 더미 토큰 정보
        const dummyToken: TokenInfo = isNative
          ? {
              address: '0x0000000000000000000000000000000000000000',
              symbol: selectedNetwork.nativeCurrency.symbol,
              name: selectedNetwork.nativeCurrency.name,
              decimals: selectedNetwork.nativeCurrency.decimals,
              balance: '1000000000000000000', // 1 ETH in wei
              formattedBalance: '1.0',
              fiatValue: '$ 3,000.00',
              isNative: true,
              description: '네이티브 토큰은 블록체인의 기본 화폐 단위로, 트랜잭션 수수료 지불 및 블록체인 상의 기본 거래에 사용됩니다.',
              website: 'https://creatachain.com',
              totalSupply: '100,000,000',
              marketCap: '$ 300,000,000',
              priceChange24h: '+2.5%',
            }
          : {
              address: address,
              symbol: address.includes('1234') ? 'USDT' : address.includes('2345') ? 'USDC' : 'DAI',
              name: address.includes('1234') 
                ? 'Tether USD' 
                : address.includes('2345') 
                ? 'USD Coin' 
                : 'Dai Stablecoin',
              decimals: address.includes('1234') || address.includes('2345') ? 6 : 18,
              balance: address.includes('1234') 
                ? '10000000' 
                : address.includes('2345') 
                ? '20000000' 
                : '5000000000000000000',
              formattedBalance: address.includes('1234') 
                ? '10.0' 
                : address.includes('2345') 
                ? '20.0' 
                : '5.0',
              fiatValue: address.includes('1234') 
                ? '$ 10.00' 
                : address.includes('2345') 
                ? '$ 20.00' 
                : '$ 5.00',
              logoURI: address.includes('1234')
                ? 'https://cryptologos.cc/logos/tether-usdt-logo.png'
                : address.includes('2345')
                ? 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
                : 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
              description: address.includes('1234')
                ? 'Tether (USDT)는 1달러에 고정된 스테이블코인으로, 암호화폐 시장의 변동성을 관리하는 데 도움이 됩니다.'
                : address.includes('2345')
                ? 'USD Coin (USDC)은 미국 달러에 고정된 완전 규제 스테이블코인으로, Circle과 Coinbase에 의해 발행됩니다.'
                : 'Dai는 이더리움 블록체인에서 실행되는 탈중앙화 스테이블코인으로, 다양한 암호화폐 자산으로 담보됩니다.',
              website: address.includes('1234')
                ? 'https://tether.to'
                : address.includes('2345')
                ? 'https://www.circle.com/usdc'
                : 'https://makerdao.com',
              totalSupply: address.includes('1234')
                ? '83,016,711,624'
                : address.includes('2345')
                ? '45,426,781,455'
                : '5,415,122,985',
              marketCap: address.includes('1234')
                ? '$ 83,016,711,624'
                : address.includes('2345')
                ? '$ 45,426,781,455'
                : '$ 5,415,122,985',
              priceChange24h: address.includes('1234')
                ? '+0.02%'
                : address.includes('2345')
                ? '+0.01%'
                : '-0.05%',
            };
        
        // 더미 활동 내역
        const dummyActivities: TokenActivity[] = [
          {
            id: '1',
            type: 'receive',
            date: Date.now() - 86400000, // 1일 전
            amount: '500000000000000000', // 0.5 ETH
            formattedAmount: '0.5',
            fiatValue: '$ 1,500.00',
            from: '0xabcdef1234567890abcdef1234567890abcdef12',
            to: selectedAccount.address,
            hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            status: 'confirmed',
          },
          {
            id: '2',
            type: 'send',
            date: Date.now() - 172800000, // 2일 전
            amount: '200000000000000000', // 0.2 ETH
            formattedAmount: '0.2',
            fiatValue: '$ 600.00',
            from: selectedAccount.address,
            to: '0xfedcba0987654321fedcba0987654321fedcba09',
            hash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
            status: 'confirmed',
          },
          {
            id: '3',
            type: 'swap',
            date: Date.now() - 259200000, // 3일 전
            amount: '100000000000000000', // 0.1 ETH
            formattedAmount: '0.1',
            fiatValue: '$ 300.00',
            from: selectedAccount.address,
            to: '0x1234567890abcdef1234567890abcdef12345678',
            hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            status: 'confirmed',
          },
        ];

        setToken(dummyToken);
        setActivities(dummyActivities);
        setIsLoading(false);
      } catch (error) {
        console.error('토큰 정보 로드 중 오류:', error);
        showNotification({
          type: 'error',
          message: '토큰 정보를 불러오는 데 실패했습니다.',
        });
        setIsLoading(false);
      }
    };

    loadTokenData();
  }, [address, selectedAccount, selectedNetwork, showNotification]);

  // 형식화된 날짜 생성
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 주소 축약
  const shortenAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // 활동 타입에 따른 아이콘 및 배지 색상
  const getActivityTypeInfo = (type: 'send' | 'receive' | 'swap' | 'approve') => {
    switch (type) {
      case 'send':
        return {
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          ),
          badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          label: '전송',
        };
      case 'receive':
        return {
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          ),
          badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          label: '수신',
        };
      case 'swap':
        return {
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          ),
          badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
          label: '스왑',
        };
      case 'approve':
        return {
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ),
          badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
          label: '승인',
        };
    }
  };

  // 로딩 중 표시
  if (isLoading) {
    return <LoadingScreen message="토큰 정보를 불러오는 중..." />;
  }

  // 토큰을 찾을 수 없는 경우
  if (!token) {
    return (
      <EmptyState
        title="토큰을 찾을 수 없습니다"
        description="요청한 토큰이 존재하지 않거나 접근할 수 없습니다."
        actionLabel="자산 목록으로 돌아가기"
        onAction={() => navigate('/assets')}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 영역 */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center">
          <button
            className="mr-2 text-gray-500 dark:text-gray-400"
            onClick={() => navigate('/assets')}
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            {token.name}
          </h1>
        </div>
      </div>

      {/* 토큰 요약 정보 */}
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          {/* 토큰 아이콘 */}
          <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center mr-4 bg-gray-100 dark:bg-gray-700">
            {token.logoURI ? (
              <img
                src={token.logoURI}
                alt={token.symbol}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500 dark:text-gray-400 font-bold text-2xl">
                {token.symbol.charAt(0)}
              </span>
            )}
          </div>

          {/* 토큰 정보 */}
          <div>
            <div className="flex items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {token.name}
              </h2>
              {token.isNative && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                  네이티브
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {token.symbol} • {shortenAddress(token.address)}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">보유량</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {token.formattedBalance} {token.symbol}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {token.fiatValue}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="primary"
            onClick={() => navigate(`/send?token=${token.address}`)}
            leftIcon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            }
          >
            보내기
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/receive')}
            leftIcon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            }
          >
            받기
          </Button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <button
            className={`flex-1 py-3 text-center text-sm font-medium ${
              activeTab === 'info'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('info')}
          >
            정보
          </button>
          <button
            className={`flex-1 py-3 text-center text-sm font-medium ${
              activeTab === 'activity'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('activity')}
          >
            활동 내역
          </button>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex-grow overflow-y-auto">
        {activeTab === 'info' ? (
          <div className="p-4">
            <Card className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                토큰 정보
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">심볼</p>
                  <p className="text-base text-gray-900 dark:text-white">
                    {token.symbol}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">소수점</p>
                  <p className="text-base text-gray-900 dark:text-white">
                    {token.decimals}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">컨트랙트 주소</p>
                  <p className="text-base text-gray-900 dark:text-white break-all">
                    {token.address}
                  </p>
                </div>
                {token.website && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">웹사이트</p>
                    <a
                      href={token.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {token.website}
                    </a>
                  </div>
                )}
                {token.description && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">설명</p>
                    <p className="text-base text-gray-900 dark:text-white">
                      {token.description}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                시장 정보
              </h3>
              <div className="space-y-3">
                {token.totalSupply && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">총 발행량</p>
                    <p className="text-base text-gray-900 dark:text-white">
                      {token.totalSupply} {token.symbol}
                    </p>
                  </div>
                )}
                {token.marketCap && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">시가총액</p>
                    <p className="text-base text-gray-900 dark:text-white">
                      {token.marketCap}
                    </p>
                  </div>
                )}
                {token.priceChange24h && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">24시간 변동</p>
                    <p className={`text-base ${
                      token.priceChange24h.startsWith('+')
                        ? 'text-green-600 dark:text-green-400'
                        : token.priceChange24h.startsWith('-')
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {token.priceChange24h}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        ) : (
          <div className="p-4">
            {activities.length === 0 ? (
              <EmptyState
                title="활동 내역이 없습니다"
                description="이 토큰과 관련된 활동 내역이 없습니다."
              />
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => {
                  const typeInfo = getActivityTypeInfo(activity.type);
                  
                  return (
                    <Card
                      key={activity.id}
                      hoverable
                      onClick={() => {
                        // 실제 구현에서는 블록 탐색기로 이동
                        window.open(`${selectedNetwork?.blockExplorerUrl}/tx/${activity.hash}`, '_blank');
                      }}
                    >
                      <div className="flex items-center">
                        {/* 활동 타입 아이콘 */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${typeInfo.badge}`}>
                          {typeInfo.icon}
                        </div>
                        
                        {/* 활동 정보 */}
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <div>
                              <div className="flex items-center">
                                <span className={`px-2 py-0.5 text-xs rounded-full ${typeInfo.badge} mr-2`}>
                                  {typeInfo.label}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatDate(activity.date)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-900 dark:text-white mt-1">
                                {activity.type === 'send'
                                  ? `To: ${shortenAddress(activity.to)}`
                                  : activity.type === 'receive'
                                  ? `From: ${shortenAddress(activity.from)}`
                                  : `${shortenAddress(activity.from)} ↔ ${shortenAddress(activity.to)}`}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-medium ${
                                activity.type === 'send'
                                  ? 'text-red-600 dark:text-red-400'
                                  : activity.type === 'receive'
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-gray-900 dark:text-white'
                              }`}>
                                {activity.type === 'send' ? '-' : activity.type === 'receive' ? '+' : ''}
                                {activity.formattedAmount} {token.symbol}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {activity.fiatValue}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenDetailScreen;