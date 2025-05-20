/**
 * 로그인 화면
 * 지갑 잠금 해제를 위한 로그인 화면
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useWallet } from '../hooks/useWallet';
import { useUI } from '../context/UIContext';

/**
 * 로그인 화면 컴포넌트
 */
const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unlockWallet, hasWallet } = useWallet();
  const { showNotification, setIsLoading } = useUI();
  
  // 상태 관리
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // 리디렉션 처리를 위한 from 경로 추출
  const from = location.state?.from || '/wallet';
  
  // 지갑 존재 여부 확인 및 리디렉션
  useEffect(() => {
    const checkWallet = async () => {
      const walletExists = await hasWallet();
      if (!walletExists) {
        navigate('/onboarding');
      }
    };
    
    checkWallet();
  }, [hasWallet, navigate]);
  
  // 잠금 해제 핸들러
  const handleUnlock = async () => {
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    
    try {
      setIsLoading(true);
      const success = await unlockWallet(password);
      
      if (success) {
        setError('');
        showNotification({
          type: 'success',
          message: '지갑이 잠금 해제되었습니다.'
        });
        navigate(from);
      } else {
        setError('잘못된 비밀번호입니다.');
      }
      
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setError(`잠금 해제 실패: ${(error as Error).message}`);
    }
  };
  
  // 키보드 이벤트 처리 (Enter 키 입력 시 로그인)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  };
  
  return (
    <div className="flex flex-col h-full p-6">
      {/* 헤더 영역 */}
      <div className="text-center mb-8">
        <img
          src="../../../common/assets/images/logo.png"
          alt="CreLink Logo"
          className="w-16 h-16 mx-auto mb-4"
        />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          CreLink 지갑 잠금 해제
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          지갑에 접근하려면 비밀번호를 입력하세요
        </p>
      </div>
      
      {/* 콘텐츠 영역 */}
      <div className="flex-grow">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <Input
            label="비밀번호"
            type="password"
            placeholder="지갑 비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            error={error}
            fullWidth
            autoFocus
          />
          
          <div className="flex items-center mt-4">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              로그인 상태 유지 (1시간)
            </label>
          </div>
          
          <div className="mt-6">
            <Button
              variant="primary"
              fullWidth
              onClick={handleUnlock}
              disabled={!password}
            >
              잠금 해제
            </Button>
          </div>
        </div>
      </div>
      
      {/* 푸터 영역 */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          지갑을 복구해야 하나요?{' '}
          <button
            className="text-blue-600 dark:text-blue-400 hover:underline"
            onClick={() => navigate('/recovery')}
          >
            DID로 복구하기
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;