import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import LoadingScreen from '../components/common/LoadingScreen';

/**
 * AccountDetailsScreen - 계정 상세 정보 페이지
 * 
 * 주요 기능:
 * - 계정 주소 및 상세 정보 표시
 * - 개인 키 표시 (보안 확인 후)
 * - 계정 이름 변경
 * - DID 연결 상태 확인
 * - 계정 삭제 (첫 번째 계정 제외)
 */
const AccountDetailsScreen: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const { accounts, renameAccount, exportPrivateKey, deleteAccount, settings } = useWallet();
  
  const [isLoading, setIsLoading] = useState(false);
  const [account, setAccount] = useState<any | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [nameError, setNameError] = useState('');
  
  const [showingPrivateKey, setShowingPrivateKey] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [privateKeyError, setPrivateKeyError] = useState('');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // 계정 정보 로드
  useEffect(() => {
    if (accountId && accounts) {
      const accountInfo = accounts.find(a => a.id === accountId);
      if (accountInfo) {
        setAccount(accountInfo);
        setNewAccountName(accountInfo.name);
      } else {
        // 계정을 찾을 수 없으면 돌아가기
        navigate('/settings/accounts');
      }
    }
  }, [accountId, accounts, navigate]);
  
  // 계정 이름 변경 시작
  const handleStartEditName = () => {
    setIsEditingName(true);
    setNameError('');
  };
  
  // 계정 이름 변경 취소
  const handleCancelEditName = () => {
    setIsEditingName(false);
    if (account) {
      setNewAccountName(account.name);
    }
  };
  
  // 계정 이름 변경 저장
  const handleSaveAccountName = async () => {
    if (!accountId) return;
    
    if (!newAccountName.trim()) {
      setNameError('계정 이름을 입력하세요');
      return;
    }
    
    setIsLoading(true);
    try {
      await renameAccount(accountId, newAccountName.trim());
      setIsEditingName(false);
      
      // 계정 객체 업데이트
      if (account) {
        setAccount({
          ...account,
          name: newAccountName.trim()
        });
      }
    } catch (error) {
      console.error('계정 이름 변경 실패:', error);
      setNameError('이름 변경 실패');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 개인 키 표시 처리
  const handleShowPrivateKey = async () => {
    if (!accountId || !pin) {
      setPinError('PIN을 입력하세요');
      return;
    }
    
    setIsLoading(true);
    setPrivateKeyError('');
    
    try {
      const key = await exportPrivateKey(accountId, pin);
      setPrivateKey(key);
      setShowingPrivateKey(true);
      setPin(''); // 보안을 위해 PIN 초기화
    } catch (error: any) {
      console.error('개인 키 내보내기 실패:', error);
      setPrivateKeyError(error.message || '개인 키를 가져올 수 없습니다. PIN이 올바른지 확인하세요.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 개인 키 복사
  const handleCopyPrivateKey = () => {
    if (privateKey) {
      navigator.clipboard.writeText(privateKey)
        .then(() => {
          alert('개인 키가 클립보드에 복사되었습니다.');
        })
        .catch(err => {
          console.error('클립보드 복사 실패:', err);
          alert('개인 키 복사에 실패했습니다.');
        });
    }
  };
  
  // 개인 키 표시 취소
  const handleHidePrivateKey = () => {
    setShowingPrivateKey(false);
    setPrivateKey('');
  };
  
  // 주소 복사
  const handleCopyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address)
        .then(() => {
          alert('주소가 클립보드에 복사되었습니다.');
        })
        .catch(err => {
          console.error('클립보드 복사 실패:', err);
          alert('주소 복사에 실패했습니다.');
        });
    }
  };
  
  // 계정 삭제 처리
  const handleDeleteAccount = async () => {
    if (!accountId) return;
    
    setIsLoading(true);
    try {
      await deleteAccount(accountId);
      navigate('/settings/accounts');
    } catch (error) {
      console.error('계정 삭제 실패:', error);
      alert('계정 삭제에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // DID 관리 페이지로 이동
  const handleManageDID = () => {
    navigate(`/settings/did/${accountId}`);
  };
  
  if (isLoading) {
    return <LoadingScreen message="계정 처리 중..." />;
  }
  
  if (!account) {
    return <LoadingScreen message="계정 정보 로드 중..." />;
  }
  
  const isFirstAccount = accounts && accounts.length > 0 && accounts[0].id === accountId;
  
  return (
    <div className="p-4 h-full overflow-y-auto">
      <h1 className="text-xl font-bold mb-4">계정 상세</h1>
      
      <Card className="mb-4">
        {isEditingName ? (
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">계정 이름</label>
            <Input
              type="text"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              error={nameError}
              autoFocus
            />
            <div className="flex space-x-2 mt-2">
              <Button
                variant="secondary"
                onClick={handleCancelEditName}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                onClick={handleSaveAccountName}
                className="flex-1"
              >
                저장
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="font-medium">{account.name}</div>
              <div className="text-sm text-gray-500">계정 이름</div>
            </div>
            <Button
              variant="secondary"
              onClick={handleStartEditName}
              className="text-sm px-3"
            >
              변경
            </Button>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-4 mb-4">
          <label className="text-sm text-gray-600 mb-1 block">계정 주소</label>
          <div className="bg-gray-100 p-3 rounded-md font-mono text-sm break-all">
            {account.address}
          </div>
          <Button
            variant="secondary"
            onClick={handleCopyAddress}
            className="text-sm mt-2"
          >
            주소 복사
          </Button>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">DID 상태</div>
              <div className="text-sm text-gray-500">
                {account.metadata?.didConnected
                  ? `연결됨: @${account.metadata.didNickname || 'unnamed'}.creata`
                  : '연결되지 않음'}
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={handleManageDID}
              className="text-sm px-3"
            >
              {account.metadata?.didConnected ? '관리' : '연결'}
            </Button>
          </div>
        </div>
      </Card>
      
      {!showingPrivateKey ? (
        <Card className="mb-4">
          <h2 className="text-lg font-medium mb-2">개인 키 내보내기</h2>
          <div className="text-sm text-red-500 mb-4">
            경고: 개인 키는 절대로 다른 사람과 공유하지 마세요. 개인 키를 가진 사람은 계정의 모든 자산에 접근할 수 있습니다.
          </div>
          
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">지갑 PIN</label>
            <Input
              type="password"
              placeholder="PIN 입력"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              error={pinError}
            />
          </div>
          
          {privateKeyError && (
            <div className="text-red-500 text-sm mb-4">
              {privateKeyError}
            </div>
          )}
          
          <Button
            onClick={handleShowPrivateKey}
            variant="danger"
            className="w-full"
          >
            개인 키 표시
          </Button>
        </Card>
      ) : (
        <Card className="mb-4">
          <h2 className="text-lg font-medium mb-2">개인 키</h2>
          <div className="text-sm text-red-500 mb-4">
            경고: 이 개인 키를 안전하게 보관하세요. 절대로 스크린샷을 찍거나 온라인에 저장하지 마세요.
          </div>
          
          <div className="bg-gray-100 p-3 rounded-md font-mono text-sm break-all mb-4">
            {privateKey}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={handleCopyPrivateKey}
              className="flex-1"
            >
              복사
            </Button>
            <Button
              onClick={handleHidePrivateKey}
              className="flex-1"
            >
              숨기기
            </Button>
          </div>
        </Card>
      )}
      
      {!isFirstAccount && (
        <Card className="mb-4">
          <h2 className="text-lg font-medium mb-2">계정 삭제</h2>
          
          {!showDeleteConfirm ? (
            <div>
              <div className="text-sm text-gray-600 mb-4">
                이 계정을 지갑에서 삭제합니다. 개인 키가 있으면 나중에 다시 가져올 수 있습니다.
              </div>
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full"
              >
                계정 삭제
              </Button>
            </div>
          ) : (
            <div>
              <div className="text-sm text-red-500 mb-4">
                정말로 이 계정을 삭제하시겠습니까? 개인 키를 저장하지 않았다면 이 계정의 자산에 영원히 접근할 수 없게 됩니다.
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteAccount}
                  className="flex-1"
                >
                  삭제 확인
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
      
      <div className="mt-4">
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          className="w-full"
        >
          뒤로 가기
        </Button>
      </div>
    </div>
  );
};

export default AccountDetailsScreen;