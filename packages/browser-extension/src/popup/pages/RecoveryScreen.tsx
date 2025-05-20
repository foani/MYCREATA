/**
 * 지갑 복구 화면
 * DID를 사용하여 지갑을 복구하는 화면
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { useWallet } from '../hooks/useWallet';
import { useUI } from '../context/UIContext';

// 복구 방법 타입
type RecoveryMethod = 'telegram' | 'google' | 'email';

/**
 * 지갑 복구 화면 컴포넌트
 */
const RecoveryScreen: React.FC = () => {
  const navigate = useNavigate();
  const { recoverWalletWithDID } = useWallet();
  const { showNotification, setIsLoading } = useUI();

  // 상태 관리
  const [step, setStep] = useState<'method' | 'credential' | 'pin'>('method');
  const [method, setMethod] = useState<RecoveryMethod | null>(null);
  const [credential, setCredential] = useState('');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  // PIN 유효성 검사
  const validatePin = () => {
    if (pin.length < 4) {
      setPinError('PIN은 최소 4자 이상이어야 합니다.');
      return false;
    }

    setPinError('');
    return true;
  };

  // DID 복구 핸들러
  const handleRecoverWithDID = async () => {
    if (!method || !credential || !validatePin()) {
      return;
    }

    try {
      setIsLoading(true);
      // 실제 구현에서는 각 메서드에 맞는 credential 객체 구성 필요
      const didCredential = { id: credential };
      
      await recoverWalletWithDID(method, didCredential, pin);
      setIsLoading(false);
      
      showNotification({
        type: 'success',
        message: '지갑을 성공적으로 복구했습니다.'
      });
      
      navigate('/wallet');
    } catch (error) {
      setIsLoading(false);
      showNotification({
        type: 'error',
        message: `지갑 복구 실패: ${(error as Error).message}`
      });
    }
  };

  // 복구 방법 선택 화면
  const renderMethodSelection = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        복구 방법 선택
      </h2>

      <Card
        hoverable
        onClick={() => {
          setMethod('telegram');
          setStep('credential');
        }}
        className={`${method === 'telegram' ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' : ''}`}
      >
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.21-1.59.15-.15 2.62-2.31 2.68-2.5.01-.03.01-.14-.05-.2-.06-.06-.17-.04-.25-.02-.14.03-2.12 1.29-3.93 2.4-.37.24-.71.36-1.01.35-.33 0-.97-.18-1.45-.33-.58-.19-.99-.29-.95-.61.02-.17.17-.34.49-.52.92-.54 1.89-1.01 2.94-1.44 1.72-.71 3.27-1.42 3.98-1.78.35-.18 1.13-.46 1.97-.52.33-.02.52.12.55.32.02.14-.01.31-.08.49z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">텔레그램으로 복구</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Telegram 계정으로 연결된 DID를 사용하여 복구
            </p>
          </div>
        </div>
      </Card>

      <Card
        hoverable
        onClick={() => {
          setMethod('google');
          setStep('credential');
        }}
        className={`${method === 'google' ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' : ''}`}
      >
        <div className="flex items-center">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-red-600 dark:text-red-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Google로 복구</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Google 계정으로 연결된 DID를 사용하여 복구
            </p>
          </div>
        </div>
      </Card>

      <Card
        hoverable
        onClick={() => {
          setMethod('email');
          setStep('credential');
        }}
        className={`${method === 'email' ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' : ''}`}
      >
        <div className="flex items-center">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-green-600 dark:text-green-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">이메일로 복구</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              이메일 인증을 통해 연결된 DID로 복구
            </p>
          </div>
        </div>
      </Card>
    </div>
  );

  // 인증 정보 입력 화면
  const renderCredentialInput = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {method === 'telegram' ? '텔레그램 계정 입력' : 
         method === 'google' ? 'Google 계정 입력' : 
         '이메일 주소 입력'}
      </h2>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
        <p className="text-blue-800 dark:text-blue-300 text-sm">
          {method === 'telegram' ? 
            '텔레그램 ID 또는 사용자 이름을 입력하세요. 인증 과정이 필요합니다.' : 
           method === 'google' ? 
            'Google 계정 이메일을 입력하세요. Google 인증 페이지로 이동합니다.' : 
            '등록된 이메일 주소를 입력하세요. 인증 코드가 이메일로 전송됩니다.'}
        </p>
      </div>

      <Input
        label={method === 'telegram' ? '텔레그램 ID/사용자 이름' : 
              method === 'google' ? '이메일 주소' : 
              '이메일 주소'}
        type={method === 'telegram' ? 'text' : 'email'}
        placeholder={method === 'telegram' ? '@username 또는 전화번호' : 
                    'your-email@example.com'}
        value={credential}
        onChange={(e) => setCredential(e.target.value)}
        fullWidth
        required
      />
    </div>
  );

  // PIN 입력 화면
  const renderPinInput = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        복구 PIN 입력
      </h2>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
        <p className="text-blue-800 dark:text-blue-300 text-sm">
          지갑 설정 시 지정한 개인 PIN 코드를 입력하세요. 이 코드는 DID 기반 복구에 필요합니다.
        </p>
      </div>

      <Input
        label="PIN 코드"
        type="password"
        placeholder="개인 PIN 코드 입력"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        error={pinError}
        fullWidth
        required
      />
    </div>
  );

  return (
    <div className="flex flex-col h-full p-6">
      {/* 헤더 영역 */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          DID로 지갑 복구
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          이전에 연결한 DID를 사용하여 지갑을 복구합니다
        </p>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-grow">
        {step === 'method' && renderMethodSelection()}
        {step === 'credential' && renderCredentialInput()}
        {step === 'pin' && renderPinInput()}
      </div>

      {/* 푸터 영역 */}
      <div className="flex gap-4 mt-6">
        <Button
          variant="outline"
          fullWidth
          onClick={() => {
            if (step === 'method') {
              navigate('/onboarding');
            } else if (step === 'credential') {
              setStep('method');
              setCredential('');
            } else {
              setStep('credential');
              setPin('');
            }
          }}
        >
          {step === 'method' ? '뒤로' : '이전'}
        </Button>
        <Button
          variant="primary"
          fullWidth
          onClick={() => {
            if (step === 'method') {
              // 단계 전환은 카드 클릭 시 처리됨
            } else if (step === 'credential') {
              if (credential) {
                setStep('pin');
              } else {
                showNotification({
                  type: 'error',
                  message: '필수 정보를 입력해주세요.'
                });
              }
            } else {
              handleRecoverWithDID();
            }
          }}
          disabled={(step === 'credential' && !credential) || (step === 'pin' && !pin)}
        >
          {step === 'method' ? '다음' : step === 'credential' ? '다음' : '복구하기'}
        </Button>
      </div>
    </div>
  );
};

export default RecoveryScreen;