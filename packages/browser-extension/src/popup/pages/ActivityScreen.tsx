/**
 * 활동 화면
 * 사용자 계정의 모든 활동 내역을 표시하는 화면
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import LoadingScreen from '../components/common/LoadingScreen';
import EmptyState from '../components/common/EmptyState';
import { useWallet } from '../hooks/useWallet';
import { useNetwork } from '../context/NetworkContext';
import { useUI } from '../context/UIContext';

// 활동 정보 인터페이스
interface Activity {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'approve' | 'contract';
  date: number; // timestamp
  token: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
  };
  amount: string;
  formattedAmount: string;
  fiatValue: string;
  from: string;
  to: string;
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
}

/**
 * 활동 화면 컴포넌트
 */
const ActivityScreen: React.FC = () => {
  const navigate = useNavigate();
  const { selectedAccount } = useWallet();
  const { selectedNetwork } = useNetwork();
  const { showNotification } = useUI();

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'send' | 'receive' | 'swap' | 'approve' | 'contract'>('all');

  // 활동 데이터 로드
  useEffect(() => {
    const loadActivities = async () => {
      if (!selectedAccount || !selectedNetwork) {
        setIsLoading(false);
        return;
      }

      try {
        // 실제 구현에서는 백그라운드 스크립트를 통해 활동 내역을 가져옴
        // 임시 구현: 더미 데이터
        const dummyActivities: Activity[] = [
          {
            id: '1',
            type: 'receive',
            date: Date.now() - 86400000, // 1일 전
            token: {
              address: '0x0000000000000000000000000000000000000000',
              symbol: selectedNetwork.nativeCurrency.symbol,
              name: selectedNetwork.nativeCurrency.name,
              decimals: selectedNetwork.nativeCurrency.decimals,
            },
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
            token: {
              address: '0x0000000000000000000000000000000000000000',
              symbol: selectedNetwork.nativeCurrency.symbol,
              name: selectedNetwork.nativeCurrency.name,
              decimals: selectedNetwork.nativeCurrency.decimals,
            },
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
            token: {
              address: '0x0000000000000000000000000000000000000000',
              symbol: selectedNetwork.nativeCurrency.symbol,
              name: selectedNetwork.nativeCurrency.name,
              decimals: selectedNetwork.nativeCurrency.decimals,
            },
            amount: '100000000000000000', // 0.1 ETH
            formattedAmount: '0.1',
            fiatValue: '$ 300.00',
            from: selectedAccount.address,
            to: '0x1234567890abcdef1234567890abcdef12345678',
            hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            status: 'confirmed',
          },
          {
            id: '4',
            type: 'approve',
            date: Date.now() - 345600000, // 4일 전
            token: {
              address: '0x1234567890123456789012345678901234567890',
              symbol: 'USDT',
              name: 'Tether USD',
              decimals: 6,
              logoURI: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
            },
            amount: '1000000000', // 1000 USDT
            formattedAmount: '1000',
            fiatValue: '$ 1,000.00',
            from: selectedAccount.address,
            to: '0x2345678901234567890123456789012345678901',
            hash: '0x2345678901234567890123456789012345678901234567890123456789012345',
            status: 'confirmed',
          },
          {
            id: '5',
            type: 'contract',
            date: Date.now() - 432000000, // 5일 전
            token: {
              address: '0x0000000000000000000000000000000000000000',
              symbol: selectedNetwork.nativeCurrency.symbol,
              name: selectedNetwork.nativeCurrency.name,
              decimals: selectedNetwork.nativeCurrency.decimals,
            },
            amount: '50000000000000000', // 0.05 ETH
            formattedAmount: '0.05',
            fiatValue: '$ 150.00',
            from: selectedAccount.address,
            to: '0x3456789012345678901234567890123456789012',
            hash: '0x3456789012345678901234567890123456789012345678901234567890123456',
            status: 'confirmed',
          },
        ];

        setActivities(dummyActivities);
        setIsLoading(false);
      } catch (error) {
        console.error('활동 내역 로드 중 오류:', error);
        showNotification({
          type: 'error',
          message: '활동 내역을 불러오는 데 실패했습니다.',
        });
        setIsLoading(false);
      }
    };

    loadActivities();
  }, [selectedAccount, selectedNetwork, showNotification]);

  // 필터링 및 검색 적용
  const filteredActivities = activities
    .filter((activity) => filter === 'all' || activity.type === filter)
    .filter(
      (activity) =>
        activity.token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.to.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
  const getActivityTypeInfo = (type: 'send' | 'receive' | 'swap' | 'approve' | 'contract') => {
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
      case 'contract':
        return {
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          label: '컨트랙트',
        };
    }
  };

  // 로딩 중 표시
  if (isLoading) {
    return <LoadingScreen message="활동 내역을 불러오는 중..." />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 영역 */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">활동 내역</h1>
      </div>

      {/* 검색 및 필터 */}
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="mb-3">
          <Input
            placeholder="검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={
              <svg
                className="w-5 h-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            }
            fullWidth
          />
        </div>

        <div className="flex overflow-x-auto pb-2 space-x-2">
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}
            onClick={() => setFilter('all')}
          >
            전체
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === 'send'
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}
            onClick={() => setFilter('send')}
          >
            전송
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === 'receive'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}
            onClick={() => setFilter('receive')}
          >
            수신
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === 'swap'
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}
            onClick={() => setFilter('swap')}
          >
            스왑
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === 'approve'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}
            onClick={() => setFilter('approve')}
          >
            승인
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === 'contract'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}
            onClick={() => setFilter('contract')}
          >
            컨트랙트
          </button>
        </div>
      </div>

      {/* 활동 내역 목록 */}
      <div className="flex-grow overflow-y-auto p-4">
        {filteredActivities.length === 0 ? (
          searchQuery || filter !== 'all' ? (
            <EmptyState
              title="검색 결과가 없습니다"
              description="다른 검색어나 필터를 시도해보세요."
              actionLabel="필터 초기화"
              onAction={() => {
                setSearchQuery('');
                setFilter('all');
              }}
            />
          ) : (
            <EmptyState
              title="활동 내역이 없습니다"
              description="아직 활동 내역이 없습니다. 토큰을 전송하거나 받으면 여기에 표시됩니다."
            />
          )
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity) => {
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
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center mb-1">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${typeInfo.badge} mr-2`}>
                              {typeInfo.label}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(activity.date)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {activity.type === 'send'
                              ? `To: ${shortenAddress(activity.to)}`
                              : activity.type === 'receive'
                              ? `From: ${shortenAddress(activity.from)}`
                              : `${shortenAddress(activity.from)} ↔ ${shortenAddress(activity.to)}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center mb-1">
                            {activity.token.logoURI ? (
                              <img
                                src={activity.token.logoURI}
                                alt={activity.token.symbol}
                                className="w-4 h-4 mr-1"
                              />
                            ) : (
                              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full mr-1 flex items-center justify-center">
                                <span className="text-xs font-bold">
                                  {activity.token.symbol.charAt(0)}
                                </span>
                              </div>
                            )}
                            <p className={`font-medium ${
                              activity.type === 'send'
                                ? 'text-red-600 dark:text-red-400'
                                : activity.type === 'receive'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {activity.type === 'send' ? '-' : activity.type === 'receive' ? '+' : ''}
                              {activity.formattedAmount} {activity.token.symbol}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {activity.fiatValue}
                          </p>
                        </div>
                      </div>
                      
                      {/* 상태 표시 */}
                      <div className="mt-1">
                        <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full ${
                          activity.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : activity.status === 'confirmed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                            activity.status === 'pending'
                              ? 'bg-yellow-600 dark:bg-yellow-400'
                              : activity.status === 'confirmed'
                              ? 'bg-green-600 dark:bg-green-400'
                              : 'bg-red-600 dark:bg-red-400'
                          }`}></span>
                          {activity.status === 'pending'
                            ? '처리 중'
                            : activity.status === 'confirmed'
                            ? '완료됨'
                            : '실패'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityScreen;