/**
 * 지갑 생성 화면
 * 새 지갑을 생성하고 니모닉을 백업하는 화면
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useWallet } from '../hooks/useWallet';
import { useUI } from '../context/UIContext';

/**
 * 지갑 생성 화면 컴포넌트
 */
const CreateWalletScreen: React.FC = () => {
  const navigate = useNavigate();
  const { createWallet } = useWallet();
  const { showNotification, setIsLoading } = useUI();

  // 상태 관리
  const [step, setStep] = useState<'password' | 'backup' | 'confirm'>('password');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mnemonic, setMnemonic] = useState<string>('');
  const [mnemonicConfirmed, setMnemonicConfirmed] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);

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

  // 지갑 생성 핸들러
  const handleCreateWallet = async () => {
    if (!validatePassword()) {
      return;
    }

    try {
      setIsLoading(true);
      const generatedMnemonic = await createWallet(password);
      setMnemonic(generatedMnemonic);
      
      // 니모닉 단어를 섞어 확인 단계 준비
      const words = generatedMnemonic.split(' ');
      setShuffledWords([...words].sort(() => Math.random() - 0.5));
      
      setStep('backup');
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      showNotification({
        type: 'error',
        message: `지갑 생성 실패: ${(error as Error).message}`
      });
    }
  };

  // 니모닉 확인 핸들러
  const handleConfirmMnemonic = () => {
    // 선택된 단어들이 올바른 니모닉을 구성하는지 확인
    const selectedMnemonic = selectedWords.join(' ');
    if (selectedMnemonic === mnemonic) {
      setMnemonicConfirmed(true);
      showNotification({
        type: 'success',
        message: '니모닉이 확인되었습니다. 안전하게 보관하세요!'
      });
      navigate('/wallet');
    } else {
      showNotification({
        type: 'error',
        message: '니모닉이 일치하지 않습니다. 다시 확인해주세요.'
      });
      setSelectedWords([]);
    }
  };

  // 단어 선택 핸들러
  const handleSelectWord = (word: string, index: number) => {
    // 이미 선택된 단어는 무시
    if (selectedWords.includes(word)) return;

    // 새 단어 추가
    setSelectedWords([...selectedWords, word]);
    
    // 섞인 단어 목록에서 제거 (UI 업데이트 용)
    const newShuffledWords = [...shuffledWords];
    newShuffledWords.splice(index, 1);
    setShuffledWords(newShuffledWords);
  };

  // 선택된 단어 제거 핸들러
  const handleRemoveWord = (word: string, index: number) => {
    // 선택된 단어 목록에서 제거
    const newSelectedWords = [...selectedWords];
    newSelectedWords.splice(index, 1);
    setSelectedWords(newSelectedWords);
    
    // 섞인 단어 목록에 다시 추가
    setShuffledWords([...shuffledWords, word].sort(() => Math.random() - 0.5));
  };

  return (
    <div className="flex flex-col h-full p-6">
      {/* 헤더 영역 */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {step === 'password' ? '새 지갑 생성' : 
           step === 'backup' ? '시드 구문 백업' : 
           '시드 구문 확인'}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {step === 'password' ? '안전한 비밀번호를 설정하세요' : 
           step === 'backup' ? '이 구문을 안전하게 보관하세요' :
           '순서대로 단어를 선택하세요'}
        </p>
      </div>

      {/* 비밀번호 설정 단계 */}
      {step === 'password' && (
        <div className="flex-grow">
          <div className="space-y-4">
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

            <div className="pt-4">
              <Button
                variant="primary"
                fullWidth
                onClick={handleCreateWallet}
                disabled={!password || !confirmPassword}
              >
                지갑 생성
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 니모닉 백업 단계 */}
      {step === 'backup' && (
        <div className="flex-grow">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4 border border-yellow-200 dark:border-yellow-800">
            <p className="text-yellow-800 dark:text-yellow-300 text-sm">
              <strong>중요!</strong> 이 구문을 적어두고 안전하게 보관하세요. 지갑 복구에 필요합니다.
              절대로 스크린샷을 찍거나 온라인에 저장하지 마세요.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-2">
              {mnemonic.split(' ').map((word, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600 flex items-center"
                >
                  <span className="text-gray-500 dark:text-gray-400 text-xs mr-2">{index + 1}.</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{word}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setStep('password')}
            >
              이전
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => setStep('confirm')}
            >
              다음
            </Button>
          </div>
        </div>
      )}

      {/* 니모닉 확인 단계 */}
      {step === 'confirm' && (
        <div className="flex-grow">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              시드 구문을 올바른 순서대로 선택하세요:
            </p>
            
            <div className="min-h-[80px] bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600 mb-4 flex flex-wrap gap-2">
              {selectedWords.map((word, index) => (
                <div 
                  key={`selected-${index}`}
                  className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded text-blue-800 dark:text-blue-200 text-sm flex items-center"
                  onClick={() => handleRemoveWord(word, index)}
                >
                  <span>{word}</span>
                  <span className="ml-1 text-blue-600 dark:text-blue-400">&times;</span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {shuffledWords.map((word, index) => (
                <button 
                  key={`shuffled-${index}`}
                  className="bg-gray-200 dark:bg-gray-600 px-3 py-1 rounded text-gray-800 dark:text-gray-200 text-sm"
                  onClick={() => handleSelectWord(word, index)}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setStep('backup')}
            >
              이전
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleConfirmMnemonic}
              disabled={selectedWords.length !== mnemonic.split(' ').length}
            >
              확인
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateWalletScreen;