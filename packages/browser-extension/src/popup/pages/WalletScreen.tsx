/**
 * 지갑 화면
 * 사용자 계정 정보와 자산 요약을 표시하는 메인 화면
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import NetworkSelector from '../components/NetworkSelector';
import AccountCard from '../components/AccountCard';
import { useWallet } from '../hooks/useWallet';
import { useNetwork } from '../context/NetworkContext';
import { useUI } from '../context/UIContext';
import LoadingScreen from '../components/common/LoadingScreen';

/**
 * 지갑 화면 컴포넌트
 */
const WalletScreen: React.FC = () => {
  const navigate = useNavigate();
  const { accounts, selectedAccount, selectAccount, createAccount } = useWallet();
  const { selectedNetwork } = useNetwork();
  const { showNotification, setIsLoading } = useUI();

  // 상태 관리
  const [isLoading, setIsLocalLoading] = useState(true);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [isAccountSelectorOpen, setIsAccountSelectorOpen] = useState(false);

  // 잔액 조회
  useEffect(() => {
    const fetchBalances = async () => {
      if (!accounts.length || !selectedNetwork) {
        setIsLocalLoading(false);
        return;
      }

      try {
        // 실제 구현에서는 RPC 요청으로 잔액 조회
        // 임시 구현: 더미 데이터
        const dummyBalances: Record<string, string> = {};
        
        for (const account of accounts) {
          // 주소 기반 랜덤 잔액 생성 (개발용)
          const randomBalance = Math.floor(Math.random() * 10000000000000000);
          dummyBalances[account.address] = randomBalance.toString();
        }
        
        setBalances(dummyBalances);
        setIsLocalLoading(false);
      } catch (error) {
        console.error('잔액 조회 중 오류:', error);
        setIsLocalLoading(false);
      }
    };

    fetchBalances();
  }, [accounts, selectedNetwork]);

  // 계정 선택 핸들러
  const handleSelectAccount = async (address: string) => {
    try {
      setIsLoading(true);
      await selectAccount(address);
      setIsAccountSelectorOpen(false);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      showNotification({
        type: 'error',
        message: `계정 선택 실패: ${(error as Error).message}`
      });
    }
  };

  // 새 계정 생성 핸들러
  const handleCreateAccount = async () => {
    try {
      setIsLoading(true);
      await createAccount();
      setIsLoading(false);
      
      showNotification({
        type: 'success',
        message: '새 계정이 생성되었습니다.'
      });
    } catch (error) {
      setIsLoading(false);
      showNotification({
        type: 'error',
        message: `계정 생성 실패: ${(error as Error).message}`
      });
    }
  };

  // 로딩 중 표시
  if (isLoading) {
    return <LoadingScreen message="지갑 정보를 불러오는 중..." />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 영역 */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center">
          {/* 계정 선택기 */}
          <div className="relative">
            <button
              className="flex items-center space-x-2 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsAccountSelectorOpen(!isAccountSelectorOpen)}
            >
              {selectedAccount ? (
                <>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: `hsl(${parseInt(selectedAccount.address.substring(2, 8), 16) % 360}, 90%, 70%)`
                    }}
                  >
                    <span className="text-white font-bold">
                      {selectedAccount.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedAccount.name}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </>
              ) : (
                <span>계정 선택</span>
              )}
            </button>

            {/* 계정 드롭다운 */}
            {isAccountSelectorOpen && (
              <div className="absolute z-10 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="py-2 px-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    계정 선택
                  </h3>
                </div>

                <div className="max-h-72 overflow-y-auto py-2">
                  {accounts.map((account) => (
                    <button
                      key={account.address}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        account.address === selectedAccount?.address
                          ? 'bg-gray-100 dark:bg-gray-700'
                          : ''
                      }`}
                      onClick={() => handleSelectAccount(account.address)}
                    >
                      <div className="flex items-center">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
                          style={{
                            backgroundColor: `hsl(${parseInt(account.address.substring(2, 8), 16) % 360}, 90%, 70%)`
                          }}
                        >
                          <span className="text-white font-bold">
                            {account.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {account.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {account.address.substring(0, 6)}...{account.address.substring(account.address.length - 4)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="py-2 px-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    className="w-full text-left flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    onClick={() => {
                      setIsAccountSelectorOpen(false);
                      handleCreateAccount();
                    }}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    새 계정 생성
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 네트워크 선택기 */}
          <NetworkSelector minimal />
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-grow p-4 overflow-y-auto">
        {/* 계정 카드 */}
        {selectedAccount && (
          <AccountCard
            account={selectedAccount}
            balance={balances[selectedAccount.address] || '0'}
            network={selectedNetwork}
            className="mb-6"
          />
        )}

        {/* 빠른 액션 버튼 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate('/send')}
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
            fullWidth
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

        {/* 자산 개요 섹션 */}
        <Card
          title="자산 개요"
          headerAction={
            <button
              className="text-sm text-blue-600 dark:text-blue-400"
              onClick={() => navigate('/assets')}
            >
              모두 보기
            </button>
          }
          className="mb-6"
        >
          <div className="space-y-2">
            {/* 기본 토큰 */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                  <span className="text-blue-600 dark:text-blue-300 font-bold">
                    {selectedNetwork?.nativeCurrency.symbol.charAt(0) || 'E'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedNetwork?.nativeCurrency.name || 'Ether'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedNetwork?.nativeCurrency.symbol || 'ETH'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedAccount
                    ? parseFloat(
                        (
                          parseInt(balances[selectedAccount.address] || '0') /
                          Math.pow(10, selectedNetwork?.nativeCurrency.decimals || 18)
                        ).toFixed(4)
                      )
                    : '0.0000'}{' '}
                  {selectedNetwork?.nativeCurrency.symbol || 'ETH'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  $0.00 USD
                </p>
              </div>
            </div>

            {/* 토큰 추가 버튼 */}
            <button
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
              onClick={() => navigate('/import-token')}
            >
              <svg
                className="w-4 h-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              토큰 추가
            </button>
          </div>
        </Card>

        {/* 최근 활동 섹션 */}
        <Card
          title="최근 활동"
          headerAction={
            <button
              className="text-sm text-blue-600 dark:text-blue-400"
              onClick={() => navigate('/activity')}
            >
              모두 보기
            </button>
          }
        >
          {/* 활동 내역이 없는 경우 */}
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-gray-400 dark:text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
              활동 내역이 없습니다
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              송금, 스왑, 컨트랙트 호출 등의 활동이 여기에 표시됩니다.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/activity')}
            >
              활동 내역 보기
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WalletScreen;