/**
 * 지갑 가져오기 화면
 * 기존 니모닉 시드 구문을 사용하여 지갑을 가져오는 화면
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useWallet } from '../hooks/useWallet';
import { useUI } from '../context/UIContext';

/**
 * 지갑 가져오기 화면 컴포넌트
 */
const ImportWalletScreen: React.FC = () => {
  const navigate = useNavigate();
  const { importWallet } = useWallet();
  const { showNotification, setIsLoading } = useUI();

  // 상태 관리
  const [mnemonic, setMnemonic] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mnemonicError, setMnemonicError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 니모닉 유효성 검사
  const validateMnemonic = () => {
    const words = mnemonic.trim().split(/\s+/);
    
    // 일반적인 BIP-39 니모닉은 12, 15, 18, 21, 24 단어로 구성됨
    const validWordCounts = [12, 15, 18, 21, 24];
    
    if (!validWordCounts.includes(words.length)) {
      setMnemonicError(`유효하지 않은 시드 구문입니다. 12, 15, 18, 21 또는 24개의 단어가 필요합니다. (현재: ${words.length}개)`);
      return false;
    }
    
    setMnemonicError('');
    return true;
  };

  // 비밀번호 유효성 검사
  const validatePassword = () => {
    if (password.length < 8) {
      setPasswordError('비밀번호는 최소 8자 이상이어야 합니다.');
      return false;
    }

    if (password !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
      return false;
    }

    setPasswordError('');
    return true;
  };

  // 지갑 가져오기 핸들러
  const handleImportWallet = async () => {
    if (!validateMnemonic() || !validatePassword()) {
      return;
    }

    try {
      setIsLoading(true);
      await importWallet(mnemonic.trim(), password);
      setIsLoading(false);
      
      showNotification({
        type: 'success',
        message: '지갑을 성공적으로 가져왔습니다.'
      });
      
      navigate('/wallet');
    } catch (error) {
      setIsLoading(false);
      showNotification({
        type: 'error',
        message: `지갑 가져오기 실패: ${(error as Error).message}`
      });
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      {/* 헤더 영역 */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          기존 지갑 가져오기
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          시드 구문을 입력하여 기존 지갑을 가져오세요
        </p>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-grow">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="mnemonic"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              시드 구문
            </label>
            <textarea
              id="mnemonic"
              rows={4}
              className={`w-full p-3 rounded-md border ${
                mnemonicError
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600'
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2`}
              placeholder="12, 15, 18, 21 또는 24개의 단어를 공백으로 구분하여 입력하세요"
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              onBlur={validateMnemonic}
            />
            {mnemonicError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{mnemonicError}</p>
            )}
          </div>

          <Input
            label="비밀번호"
            type="password"
            placeholder="최소 8자 이상의 비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />

          <Input
            label="비밀번호 확인"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={passwordError}
            fullWidth
            required
          />

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 mt-4">
            <p className="text-yellow-800 dark:text-yellow-300 text-sm">
              <strong>중요!</strong> 시드 구문을 제공할 때는 주의하세요. 이 구문을 가진 사람은 지갑에 접근할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 푸터 영역 */}
      <div className="flex gap-4 mt-6">
        <Button
          variant="outline"
          fullWidth
          onClick={() => navigate('/onboarding')}
        >
          뒤로
        </Button>
        <Button
          variant="primary"
          fullWidth
          onClick={handleImportWallet}
          disabled={!mnemonic || !password || !confirmPassword}
        >
          지갑 가져오기
        </Button>
      </div>
    </div>
  );
};

export default ImportWalletScreen;