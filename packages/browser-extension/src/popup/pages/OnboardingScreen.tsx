/**
 * 온보딩 화면
 * 새 사용자를 위한 시작 화면으로, 지갑 생성 또는 가져오기 옵션을 제공합니다.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

/**
 * 온보딩 화면 컴포넌트
 */
const OnboardingScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full p-6">
      {/* 헤더 영역 */}
      <div className="text-center mb-8">
        <img
          src="../../../common/assets/images/logo.png"
          alt="CreLink Logo"
          className="w-20 h-20 mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          CreLink 지갑에 오신 것을 환영합니다
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Catena 메인넷 기반 다중 플랫폼 EVM 지갑
        </p>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-grow">
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            시작하는 방법을 선택하세요
          </h2>

          <div className="space-y-4">
            {/* 새 지갑 생성 옵션 */}
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                새 지갑 만들기
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                처음 시작하는 경우 새 지갑을 생성합니다. 시드 구문과 비밀번호를 안전하게 보관하세요.
              </p>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => navigate('/create-wallet')}
              >
                새 지갑 생성
              </Button>
            </div>

            {/* 기존 지갑 가져오기 옵션 */}
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                기존 지갑 가져오기
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                이미 시드 구문이 있는 경우 기존 지갑을 가져옵니다.
              </p>
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => navigate('/import-wallet')}
              >
                시드 구문으로 가져오기
              </Button>
            </div>

            {/* 복구 옵션 */}
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                지갑 복구하기
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                DID를 사용하여 이전에 백업한 지갑을 복구합니다.
              </p>
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => navigate('/recovery')}
              >
                DID로 복구하기
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 푸터 영역 */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          이미 계정이 있으신가요?{' '}
          <button
            className="text-blue-600 dark:text-blue-400 hover:underline"
            onClick={() => navigate('/login')}
          >
            로그인
          </button>
        </p>
      </div>
    </div>
  );
};

export default OnboardingScreen;