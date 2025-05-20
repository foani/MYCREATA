import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useWallet, WalletStatus } from '../hooks/useWallet';

/**
 * 지갑 페이지 컴포넌트
 */
const WalletPage: React.FC = () => {
  const { 
    status, 
    accounts, 
    selectedAccountIndex, 
    error, 
    createWallet, 
    lockWallet, 
    unlockWallet, 
    createAccount, 
    selectAccount, 
    getSelectedAccount 
  } = useWallet();
  
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [mnemonic, setMnemonic] = useState<string>('');
  const [showMnemonic, setShowMnemonic] = useState<boolean>(false);
  const [accountName, setAccountName] = useState<string>('');
  const [isCreatingAccount, setIsCreatingAccount] = useState<boolean>(false);
  
  // 새 지갑 생성 핸들러
  const handleCreateWallet = async () => {
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    const result = await createWallet(password);
    
    if (result.success) {
      // 예시용 니모닉
      setMnemonic('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
      setShowMnemonic(true);
    } else {
      alert(`지갑 생성 오류: ${error}`);
    }
  };
  
  // 지갑 잠금 해제 핸들러
  const handleUnlockWallet = async () => {
    const result = await unlockWallet(password);
    
    if (!result.success) {
      alert(`지갑 잠금 해제 오류: ${error}`);
    }
  };
  
  // 지갑 잠금 핸들러
  const handleLockWallet = () => {
    lockWallet();
  };
  
  // 계정 생성 핸들러
  const handleCreateAccount = async () => {
    setIsCreatingAccount(true);
    
    const result = await createAccount(accountName);
    
    if (result.success) {
      setAccountName('');
      setIsCreatingAccount(false);
    } else {
      alert(`계정 생성 오류: ${error}`);
      setIsCreatingAccount(false);
    }
  };
  
  // 니모닉 복사 핸들러
  const handleCopyMnemonic = () => {
    navigator.clipboard.writeText(mnemonic);
    alert('니모닉이 클립보드에 복사되었습니다.');
  };
  
  // 주소 복사 핸들러
  const handleCopyAddress = () => {
    const account = getSelectedAccount();
    
    if (account) {
      navigator.clipboard.writeText(account.address);
      alert('주소가 클립보드에 복사되었습니다.');
    }
  };
  
  // 선택된 계정
  const selectedAccount = getSelectedAccount();
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-text-primary dark:text-text-primary">
            지갑 관리
          </h1>
          
          {/* 지갑 초기화 전 */}
          {status === 'uninitialized' && (
            <Card title="새 지갑 만들기">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary dark:text-text-primary mb-1">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="안전한 비밀번호 입력"
                    className="w-full p-2 border border-border-color rounded-md bg-surface-color text-text-primary dark:bg-surface-color dark:text-text-primary dark:border-border-color"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary dark:text-text-primary mb-1">
                    비밀번호 확인
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호 다시 입력"
                    className="w-full p-2 border border-border-color rounded-md bg-surface-color text-text-primary dark:bg-surface-color dark:text-text-primary dark:border-border-color"
                  />
                </div>
                
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleCreateWallet}
                  disabled={!password || !confirmPassword || password !== confirmPassword}
                >
                  지갑 생성
                </Button>
              </div>
            </Card>
          )}
          
          {/* 니모닉 표시 */}
          {status === 'uninitialized' && showMnemonic && (
            <Card 
              title="시드 구문 (니모닉)"
              className="mt-4"
            >
              <div className="space-y-4">
                <p className="text-sm text-warning dark:text-warning">
                  아래 12개 단어는 지갑을 복구하는 데 필요한 시드 구문입니다. 
                  안전한 곳에 보관하고 절대 타인에게 공유하지 마세요.
                </p>
                
                <div className="p-4 bg-surface-color-light dark:bg-gray-700 rounded-md">
                  <p className="font-mono text-text-primary dark:text-text-primary break-all">
                    {mnemonic}
                  </p>
                </div>
                
                <div className="flex space-x-4">
                  <Button
                    variant="secondary"
                    onClick={handleCopyMnemonic}
                    fullWidth
                  >
                    복사하기
                  </Button>
                  
                  <Button
                    variant="primary"
                    onClick={() => setShowMnemonic(false)}
                    fullWidth
                  >
                    확인 완료
                  </Button>
                </div>
              </div>
            </Card>
          )}
          
          {/* 지갑 잠금 상태 */}
          {status === 'locked' && (
            <Card title="지갑 잠금 해제">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary dark:text-text-primary mb-1">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="지갑 비밀번호 입력"
                    className="w-full p-2 border border-border-color rounded-md bg-surface-color text-text-primary dark:bg-surface-color dark:text-text-primary dark:border-border-color"
                  />
                </div>
                
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleUnlockWallet}
                  disabled={!password}
                >
                  잠금 해제
                </Button>
              </div>
            </Card>
          )}
          
          {/* 지갑 준비 상태 */}
          {status === 'ready' && (
            <>
              {/* 계정 정보 */}
              <Card title="계정 정보">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-text-secondary dark:text-text-secondary">
                        현재 계정
                      </p>
                      <p className="font-medium text-text-primary dark:text-text-primary">
                        {selectedAccount?.name || `계정 ${selectedAccountIndex + 1}`}
                      </p>
                    </div>
                    
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleLockWallet}
                    >
                      지갑 잠금
                    </Button>
                  </div>
                  
                  <div>
                    <p className="text-sm text-text-secondary dark:text-text-secondary">
                      주소
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="font-mono text-sm text-text-primary dark:text-text-primary break-all">
                        {selectedAccount?.address}
                      </p>
                      <button
                        className="text-primary dark:text-primary"
                        onClick={handleCopyAddress}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                          <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-text-secondary dark:text-text-secondary">
                      잔액
                    </p>
                    <p className="text-xl font-bold text-text-primary dark:text-text-primary">
                      {selectedAccount?.balance || '0.0'} CTA
                    </p>
                  </div>
                </div>
              </Card>
              
              {/* 계정 목록 */}
              <Card title="계정 목록" className="mt-4">
                <div className="space-y-4">
                  <div className="max-h-60 overflow-y-auto">
                    {accounts.map((account, index) => (
                      <div 
                        key={account.address}
                        className={`p-3 rounded-md cursor-pointer ${
                          index === selectedAccountIndex 
                            ? 'bg-primary/10 dark:bg-primary/20 border border-primary' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => selectAccount(index)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-text-primary dark:text-text-primary">
                              {account.name || `계정 ${index + 1}`}
                            </p>
                            <p className="text-xs text-text-secondary dark:text-text-secondary">
                              {account.address}
                            </p>
                          </div>
                          <p className="font-medium text-text-primary dark:text-text-primary">
                            {account.balance} CTA
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* 계정 추가 */}
                  {!isCreatingAccount ? (
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={() => setIsCreatingAccount(true)}
                    >
                      계정 추가
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-text-primary dark:text-text-primary mb-1">
                          계정 이름
                        </label>
                        <input
                          type="text"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          placeholder="계정 이름 입력 (선택사항)"
                          className="w-full p-2 border border-border-color rounded-md bg-surface-color text-text-primary dark:bg-surface-color dark:text-text-primary dark:border-border-color"
                        />
                      </div>
                      
                      <div className="flex space-x-3">
                        <Button
                          variant="outline"
                          onClick={() => setIsCreatingAccount(false)}
                          fullWidth
                        >
                          취소
                        </Button>
                        
                        <Button
                          variant="primary"
                          onClick={handleCreateAccount}
                          fullWidth
                        >
                          생성
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </>
          )}
          
          {/* 오류 메시지 */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default WalletPage;