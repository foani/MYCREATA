import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import LoadingScreen from '../components/common/LoadingScreen';

/**
 * AccountsScreen - 계정 관리 페이지
 * 
 * 주요 기능:
 * - 보유 계정 목록 표시
 * - 계정 선택
 * - 계정 이름 변경
 * - 새 계정 생성
 * - 개인 키 가져오기
 * - 하드웨어 지갑 연결 (향후 구현)
 */
const AccountsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { accounts, selectedAccount, selectAccount, createAccount, renameAccount } = useWallet();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  
  const [newAccountName, setNewAccountName] = useState('');
  const [accountNameError, setAccountNameError] = useState('');
  
  // 계정 선택 처리
  const handleSelectAccount = async (accountId: string) => {
    setIsLoading(true);
    try {
      await selectAccount(accountId);
    } catch (error) {
      console.error('계정 선택 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 계정 이름 변경 모드 시작
  const handleStartRename = (accountId: string, currentName: string) => {
    setIsRenaming(true);
    setSelectedAccountId(accountId);
    setNewAccountName(currentName);
    setAccountNameError('');
  };
  
  // 계정 이름 변경 취소
  const handleCancelRename = () => {
    setIsRenaming(false);
    setSelectedAccountId(null);
    setNewAccountName('');
  };
  
  // 계정 이름 변경 저장
  const handleSaveRename = async () => {
    if (!selectedAccountId) return;
    
    if (!newAccountName.trim()) {
      setAccountNameError('계정 이름을 입력하세요');
      return;
    }
    
    setIsLoading(true);
    try {
      await renameAccount(selectedAccountId, newAccountName.trim());
      setIsRenaming(false);
      setSelectedAccountId(null);
    } catch (error) {
      console.error('계정 이름 변경 실패:', error);
      setAccountNameError('이름 변경 실패');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 새 계정 생성 처리
  const handleCreateAccount = async () => {
    if (!newAccountName.trim()) {
      setAccountNameError('계정 이름을 입력하세요');
      return;
    }
    
    setIsLoading(true);
    try {
      await createAccount(newAccountName.trim());
      setIsAddingAccount(false);
      setNewAccountName('');
    } catch (error) {
      console.error('계정 생성 실패:', error);
      setAccountNameError('계정 생성 실패');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 개인 키 가져오기 페이지로 이동
  const handleImportAccount = () => {
    navigate('/import-wallet');
  };
  
  // 새 계정 생성 모드 시작
  const handleShowCreateForm = () => {
    setIsAddingAccount(true);
    setIsRenaming(false);
    setSelectedAccountId(null);
    setNewAccountName('');
    setAccountNameError('');
  };
  
  // 새 계정 생성 취소
  const handleCancelCreate = () => {
    setIsAddingAccount(false);
    setNewAccountName('');
  };
  
  // 계정 상세 페이지로 이동
  const handleViewAccountDetails = (accountId: string) => {
    navigate(`/settings/account-details/${accountId}`);
  };
  
  if (isLoading) {
    return <LoadingScreen message="계정 처리 중..." />;
  }
  
  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">계정 관리</h1>
        {!isAddingAccount && !isRenaming && (
          <div className="flex space-x-2">
            <Button
              onClick={handleImportAccount}
              variant="secondary"
              className="text-sm px-3"
            >
              가져오기
            </Button>
            <Button
              onClick={handleShowCreateForm}
              variant="secondary"
              className="text-sm px-3"
            >
              생성
            </Button>
          </div>
        )}
      </div>
      
      {isAddingAccount ? (
        <Card className="mb-4">
          <h2 className="text-lg font-medium mb-4">새 계정 생성</h2>
          
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">계정 이름</label>
            <Input
              type="text"
              placeholder="내 계정 1"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              error={accountNameError}
            />
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={handleCancelCreate}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleCreateAccount}
              className="flex-1"
            >
              생성
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {accounts?.map((account) => (
            <Card 
              key={account.id} 
              className={`mb-2 ${account.id === selectedAccount?.id ? 'border-2 border-blue-500' : ''}`}
            >
              {isRenaming && selectedAccountId === account.id ? (
                <div className="space-y-3">
                  <label className="text-sm text-gray-600 block">계정 이름 변경</label>
                  <Input
                    type="text"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    error={accountNameError}
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      onClick={handleCancelRename}
                      className="flex-1"
                    >
                      취소
                    </Button>
                    <Button
                      onClick={handleSaveRename}
                      className="flex-1"
                    >
                      저장
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{account.name}</div>
                    <div className="text-sm font-mono text-gray-500">
                      {account.address.substring(0, 6)}...{account.address.substring(account.address.length - 4)}
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-between items-end">
                    {account.id === selectedAccount?.id ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        현재 선택됨
                      </span>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => handleSelectAccount(account.id)}
                        className="text-sm px-3 py-1"
                      >
                        선택
                      </Button>
                    )}
                    
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => handleStartRename(account.id, account.name)}
                        className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
                      >
                        이름 변경
                      </button>
                      <button
                        onClick={() => handleViewAccountDetails(account.id)}
                        className="text-blue-500 hover:text-blue-700 transition-colors text-sm"
                      >
                        상세
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
          
          {(!accounts || accounts.length === 0) && (
            <div className="text-center text-gray-500 py-6">
              등록된 계정이 없습니다.
            </div>
          )}
        </div>
      )}
      
      {!isAddingAccount && !isRenaming && (
        <div className="bg-blue-50 border border-blue-100 p-3 rounded-md mt-4 mb-4">
          <div className="text-sm text-blue-700">
            <div className="font-medium mb-1">도움말</div>
            <ul className="list-disc list-inside text-xs">
              <li>동일한 시드 구문에서 여러 개의 계정을 생성할 수 있습니다.</li>
              <li>개인 키를 가져와서 새 계정을 추가할 수도 있습니다.</li>
              <li>각 계정은 독립적인 주소를 가지며 자산을 별도로 관리합니다.</li>
            </ul>
          </div>
        </div>
      )}
      
      {!isAddingAccount && !isRenaming && (
        <div className="space-y-3">
          <Button
            variant="secondary"
            onClick={() => navigate('/settings/connect-hardware')}
            className="w-full"
          >
            하드웨어 지갑 연결
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="w-full"
          >
            뒤로 가기
          </Button>
        </div>
      )}
    </div>
  );
};

export default AccountsScreen;