/**
 * 토큰 가져오기 화면
 * 사용자 지갑에 새 토큰을 추가하는 화면
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
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
  logoURI?: string;
}

/**
 * 토큰 가져오기 화면 컴포넌트
 */
const ImportTokenScreen: React.FC = () => {
  const navigate = useNavigate();
  const { selectedAccount } = useWallet();
  const { selectedNetwork } = useNetwork();
  const { showNotification, setIsLoading } = useUI();

  // 상태 관리
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenDecimals, setTokenDecimals] = useState('18');
  const [isAddressValid, setIsAddressValid] = useState<boolean | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [popularTokens, setPopularTokens] = useState<TokenInfo[]>([]);
  const [addressError, setAddressError] = useState('');

  // 인기 토큰 목록 로드
  useEffect(() => {
    const loadPopularTokens = async () => {
      try {
        // 실제 구현에서는 백그라운드 스크립트를 통해 인기 토큰 목록을 가져옴
        // 임시 구현: 더미 데이터
        const dummyTokens: TokenInfo[] = [
          {
            address: '0x1234567890123456789012345678901234567890',
            symbol: 'USDT',
            name: 'Tether USD',
            decimals: 6,
            logoURI: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
          },
          {
            address: '0x2345678901234567890123456789012345678901',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            logoURI: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
          },
          {
            address: '0x3456789012345678901234567890123456789012',
            symbol: 'DAI',
            name: 'Dai Stablecoin',
            decimals: 18,
            logoURI: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
          },
          {
            address: '0x4567890123456789012345678901234567890123',
            symbol: 'LINK',
            name: 'Chainlink',
            decimals: 18,
            logoURI: 'https://cryptologos.cc/logos/chainlink-link-logo.png',
          },
        ];

        setPopularTokens(dummyTokens);
      } catch (error) {
        console.error('인기 토큰 목록 로드 중 오류:', error);
      }
    };

    loadPopularTokens();
  }, []);

  // 주소 형식 검증
  const validateAddress = (address: string): boolean => {
    // 기본적인 이더리움 주소 형식 검증 (0x로 시작하는 42자리 16진수)
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // 토큰 주소 조회
  const searchToken = async () => {
    if (!tokenAddress || !validateAddress(tokenAddress)) {
      setAddressError('유효한 토큰 주소를 입력하세요');
      setIsAddressValid(false);
      return;
    }

    setIsSearching(true);
    setAddressError('');

    try {
      // 실제 구현에서는 백그라운드 스크립트를 통해 토큰 정보 조회
      // 임시 구현: 더미 데이터
      
      // 인기 토큰 목록에 있는지 확인
      const existingToken = popularTokens.find(
        (token) => token.address.toLowerCase() === tokenAddress.toLowerCase()
      );

      if (existingToken) {
        setTokenInfo(existingToken);
        setTokenSymbol(existingToken.symbol);
        setTokenName(existingToken.name);
        setTokenDecimals(existingToken.decimals.toString());
        setIsAddressValid(true);
      } else {
        // 실제 구현에서는 네트워크 요청으로 토큰 정보 조회
        // 임시 구현: 랜덤 생성
        const randomToken: TokenInfo = {
          address: tokenAddress,
          symbol: 'TKN',
          name: 'Unknown Token',
          decimals: 18,
        };

        setTokenInfo(randomToken);
        setTokenSymbol(randomToken.symbol);
        setTokenName(randomToken.name);
        setTokenDecimals(randomToken.decimals.toString());
        setIsAddressValid(true);
      }
    } catch (error) {
      console.error('토큰 정보 조회 중 오류:', error);
      setAddressError('토큰 정보를 조회할 수 없습니다');
      setIsAddressValid(false);
    } finally {
      setIsSearching(false);
    }
  };

  // 토큰 추가 핸들러
  const handleAddToken = async () => {
    if (!isAddressValid || !tokenInfo) {
      return;
    }

    try {
      setIsLoading(true);
      
      // 실제 구현에서는 백그라운드 스크립트를 통해 토큰 추가
      // 임시 구현: 성공 응답
      
      // 성공 메시지 표시
      showNotification({
        type: 'success',
        message: `${tokenSymbol} 토큰이 추가되었습니다.`,
      });
      
      // 토큰 목록 페이지로 이동
      navigate('/assets');
    } catch (error) {
      console.error('토큰 추가 중 오류:', error);
      showNotification({
        type: 'error',
        message: `토큰 추가 실패: ${(error as Error).message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 인기 토큰 선택 핸들러
  const handleSelectPopularToken = (token: TokenInfo) => {
    setTokenAddress(token.address);
    setTokenSymbol(token.symbol);
    setTokenName(token.name);
    setTokenDecimals(token.decimals.toString());
    setTokenInfo(token);
    setIsAddressValid(true);
    setAddressError('');
  };

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
            토큰 추가
          </h1>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-grow overflow-y-auto p-4">
        <Card className="mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            토큰 정보 입력
          </h2>

          <div className="space-y-4">
            <Input
              label="토큰 컨트랙트 주소"
              placeholder="0x..."
              value={tokenAddress}
              onChange={(e) => {
                setTokenAddress(e.target.value);
                setIsAddressValid(null);
              }}
              error={addressError}
              fullWidth
              rightIcon={
                isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                ) : (
                  <button
                    className="text-blue-600 dark:text-blue-400 text-sm"
                    onClick={searchToken}
                  >
                    검색
                  </button>
                )
              }
            />

            <Input
              label="토큰 심볼"
              placeholder="예: ETH, USDT"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              fullWidth
              disabled={isSearching}
            />

            <Input
              label="토큰 이름"
              placeholder="예: Ethereum, Tether USD"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              fullWidth
              disabled={isSearching}
            />

            <Input
              label="소수점"
              placeholder="예: 18"
              value={tokenDecimals}
              onChange={(e) => setTokenDecimals(e.target.value)}
              fullWidth
              disabled={isSearching}
              type="number"
            />
          </div>

          <div className="mt-6">
            <Button
              variant="primary"
              fullWidth
              onClick={handleAddToken}
              disabled={!isAddressValid || isSearching || !tokenSymbol || !tokenName || !tokenDecimals}
            >
              토큰 추가
            </Button>
          </div>
        </Card>

        {/* 인기 토큰 목록 */}
        <Card>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            인기 토큰
          </h2>

          <div className="space-y-3">
            {popularTokens.map((token) => (
              <div
                key={token.address}
                className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => handleSelectPopularToken(token)}
              >
                {/* 토큰 아이콘 */}
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center mr-3 bg-gray-100 dark:bg-gray-700">
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
                  <p className="font-medium text-gray-900 dark:text-white">
                    {token.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {token.symbol}
                  </p>
                </div>

                {/* 선택 표시 */}
                {tokenAddress.toLowerCase() === token.address.toLowerCase() && (
                  <svg
                    className="w-5 h-5 text-green-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ImportTokenScreen;