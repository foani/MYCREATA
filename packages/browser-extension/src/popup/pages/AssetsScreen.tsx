/**
 * 자산 화면
 * 사용자의 모든 토큰 및 자산 목록을 표시하는 화면
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import EmptyState from '../components/common/EmptyState';
import LoadingScreen from '../components/common/LoadingScreen';
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
}

/**
 * 자산 화면 컴포넌트
 */
const AssetsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { selectedAccount } = useWallet();
  const { selectedNetwork } = useNetwork();
  const { showNotification } = useUI();

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'name' | 'balance'>('balance');

  // 토큰 데이터 로드
  useEffect(() => {
    const loadTokens = async () => {
      if (!selectedAccount || !selectedNetwork) {
        setIsLoading(false);
        return;
      }

      try {
        // 실제 구현에서는 백그라운드 스크립트를 통해 토큰 목록과 잔액을 가져옴
        // 임시 구현: 더미 데이터

        // 네이티브 토큰 추가
        const nativeToken: TokenInfo = {
          address: '0x0000000000000000000000000000000000000000',
          symbol: selectedNetwork.nativeCurrency.symbol,
          name: selectedNetwork.nativeCurrency.name,
          decimals: selectedNetwork.nativeCurrency.decimals,
          balance: '1000000000000000000', // 1 ETH in wei
          formattedBalance: '1.0',
          fiatValue: '$ 3,000.00',
          isNative: true,
        };

        // 더미 토큰 목록
        const dummyTokens: TokenInfo[] = [
          nativeToken,
          {
            address: '0x1234567890123456789012345678901234567890',
            symbol: 'USDT',
            name: 'Tether USD',
            decimals: 6,
            balance: '10000000', // 10 USDT
            formattedBalance: '10.0',
            fiatValue: '$ 10.00',
            logoURI: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
          },
          {
            address: '0x2345678901234567890123456789012345678901',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            balance: '20000000', // 20 USDC
            formattedBalance: '20.0',
            fiatValue: '$ 20.00',
            logoURI: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
          },
          {
            address: '0x3456789012345678901234567890123456789012',
            symbol: 'DAI',
            name: 'Dai Stablecoin',
            decimals: 18,
            balance: '5000000000000000000', // 5 DAI
            formattedBalance: '5.0',
            fiatValue: '$ 5.00',
            logoURI: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
          },
        ];

        setTokens(dummyTokens);
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

    loadTokens();
  }, [selectedAccount, selectedNetwork, showNotification]);

  // 검색 및 정렬된 토큰 목록
  const filteredTokens = tokens.filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedTokens = [...filteredTokens].sort((a, b) => {
    if (sortOption === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      // balance 기준 정렬
      const aBalanceNum = parseFloat(a.formattedBalance) || 0;
      const bBalanceNum = parseFloat(b.formattedBalance) || 0;
      return bBalanceNum - aBalanceNum; // 내림차순
    }
  });

  // 총 자산 가치 계산
  const totalFiatValue = tokens.reduce((sum, token) => {
    const value = parseFloat(token.fiatValue.replace(/[^0-9.]/g, '')) || 0;
    return sum + value;
  }, 0);

  // 로딩 중 표시
  if (isLoading) {
    return <LoadingScreen message="자산 정보를 불러오는 중..." />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 영역 */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">자산</h1>
          <button
            className="text-blue-600 dark:text-blue-400"
            onClick={() => navigate('/import-token')}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 총 자산 가치 카드 */}
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">총 자산 가치</p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            $ {totalFiatValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>
      </div>

      {/* 검색 및 정렬 */}
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex-grow">
            <Input
              placeholder="토큰 검색..."
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
          <div className="relative">
            <select
              className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 appearance-none pr-8"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as 'name' | 'balance')}
            >
              <option value="balance">잔액순</option>
              <option value="name">이름순</option>
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 토큰 목록 */}
      <div className="flex-grow overflow-y-auto p-4">
        {sortedTokens.length === 0 ? (
          <EmptyState
            title="토큰이 없습니다"
            description={
              searchQuery
                ? "검색 결과가 없습니다. 다른 검색어를 입력해보세요."
                : "토큰을 추가하여 자산을 관리하세요."
            }
            actionLabel="토큰 추가"
            onAction={() => navigate('/import-token')}
          />
        ) : (
          <div className="space-y-3">
            {sortedTokens.map((token) => (
              <Card
                key={token.address}
                hoverable
                onClick={() => navigate(`/token/${token.address}`)}
                className="border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center">
                  {/* 토큰 아이콘 */}
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center mr-3 bg-gray-100 dark:bg-gray-700">
                    {token.logoURI ? (
                      <img
                        src={token.logoURI}
                        alt={token.symbol}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 font-bold text-lg">
                        {token.symbol.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* 토큰 정보 */}
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {token.name}
                          {token.isNative && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                              네이티브
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {token.symbol}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {token.formattedBalance} {token.symbol}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {token.fiatValue}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 하단 작업 버튼 */}
      {tokens.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="primary"
              onClick={() => navigate('/send')}
              leftIcon={
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              }
            >
              토큰 보내기
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
              토큰 받기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsScreen;