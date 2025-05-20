import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import LoadingScreen from '../components/common/LoadingScreen';

/**
 * DIDScreen - DID 관리 페이지
 * 
 * 주요 기능:
 * - DID 상태 확인
 * - DID 연결 (Telegram, Google)
 * - DID 닉네임 설정
 * - DID 연결 해제
 * - DID 로그 확인
 */
const DIDScreen: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const { accounts, selectedAccount, connectDID, disconnectDID, setDIDNickname, getDIDLogs } = useWallet();
  
  const [isLoading, setIsLoading] = useState(false);
  const [account, setAccount] = useState<any | null>(null);
  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [didLogs, setDidLogs] = useState<any[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  
  // 계정 정보 로드
  useEffect(() => {
    const loadAccount = () => {
      if (accountId && accounts) {
        const acc = accounts.find(a => a.id === accountId);
        if (acc) {
          setAccount(acc);
          setNickname(acc.metadata?.didNickname || '');
        } else {
          // 계정을 찾을 수 없으면 돌아가기
          navigate('/settings/accounts');
        }
      } else if (selectedAccount) {
        setAccount(selectedAccount);
        setNickname(selectedAccount.metadata?.didNickname || '');
      } else {
        // 계정 정보가 없으면 돌아가기
        navigate('/settings');
      }
    };
    
    loadAccount();
  }, [accountId, accounts, navigate, selectedAccount]);
  
  // DID 로그 로드
  useEffect(() => {
    const loadDIDLogs = async () => {
      if (account?.id && account?.metadata?.didConnected) {
        try {
          const logs = await getDIDLogs(account.id);
          setDidLogs(logs || []);
        } catch (error) {
          console.error('DID 로그 로드 실패:', error);
        }
      }
    };
    
    if (showLogs) {
      loadDIDLogs();
    }
  }, [account, getDIDLogs, showLogs]);
  
  // DID 연결 요청 (Telegram)
  const handleConnectTelegram = async () => {
    if (!account) return;
    
    setIsLoading(true);
    try {
      // Telegram OAuth 팝업 열기
      await connectDID(account.id, 'telegram');
      
      // 연결 성공 시 계정 정보 업데이트
      const updatedAccount = accounts?.find(a => a.id === account.id);
      if (updatedAccount) {
        setAccount(updatedAccount);
      }
      
      setIsEditingNickname(true);
    } catch (error) {
      console.error('Telegram DID 연결 실패:', error);
      alert('Telegram DID 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // DID 연결 요청 (Google)
  const handleConnectGoogle = async () => {
    if (!account) return;
    
    setIsLoading(true);
    try {
      // Google OAuth 팝업 열기
      await connectDID(account.id, 'google');
      
      // 연결 성공 시 계정 정보 업데이트
      const updatedAccount = accounts?.find(a => a.id === account.id);
      if (updatedAccount) {
        setAccount(updatedAccount);
      }
      
      setIsEditingNickname(true);
    } catch (error) {
      console.error('Google DID 연결 실패:', error);
      alert('Google DID 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // DID 연결 해제
  const handleDisconnectDID = async () => {
    if (!account) return;
    
    setIsLoading(true);
    try {
      await disconnectDID(account.id);
      
      // 연결 해제 성공 시 계정 정보 업데이트
      const updatedAccount = accounts?.find(a => a.id === account.id);
      if (updatedAccount) {
        setAccount(updatedAccount);
      }
      
      setConfirmDisconnect(false);
    } catch (error) {
      console.error('DID 연결 해제 실패:', error);
      alert('DID 연결 해제에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // DID 닉네임 저장
  const handleSaveNickname = async () => {
    if (!account) return;
    
    if (!nickname.trim()) {
      setNicknameError('닉네임을 입력하세요');
      return;
    }
    
    if (!/^[a-z0-9_]{3,15}$/.test(nickname)) {
      setNicknameError('닉네임은 3-15자의 소문자, 숫자, 언더스코어만 사용 가능합니다');
      return;
    }
    
    setIsLoading(true);
    try {
      await setDIDNickname(account.id, nickname);
      
      // 닉네임 저장 성공 시 계정 정보 업데이트
      const updatedAccount = accounts?.find(a => a.id === account.id);
      if (updatedAccount) {
        setAccount(updatedAccount);
      }
      
      setIsEditingNickname(false);
    } catch (error: any) {
      console.error('DID 닉네임 설정 실패:', error);
      setNicknameError(error.message || '닉네임 설정에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 닉네임 편집 취소
  const handleCancelEditNickname = () => {
    setIsEditingNickname(false);
    setNickname(account?.metadata?.didNickname || '');
    setNicknameError('');
  };
  
  if (isLoading) {
    return <LoadingScreen message="DID 처리 중..." />;
  }
  
  if (!account) {
    return <LoadingScreen message="계정 정보 로드 중..." />;
  }
  
  const isConnected = account.metadata?.didConnected;
  
  return (
    <div className="p-4 h-full overflow-y-auto">
      <h1 className="text-xl font-bold mb-4">DID 관리</h1>
      
      {isConnected ? (
        <>
          <Card className="mb-4">
            <div className="flex flex-col items-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <div className="text-green-500 text-2xl">✓</div>
              </div>
              <div className="text-lg font-medium text-center">DID 연결됨</div>
              {account.metadata?.didType === 'telegram' && (
                <div className="text-sm text-gray-500 mt-1">Telegram 계정으로 연결됨</div>
              )}
              {account.metadata?.didType === 'google' && (
                <div className="text-sm text-gray-500 mt-1">Google 계정으로 연결됨</div>
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">DID 닉네임</div>
                  {isEditingNickname ? (
                    <div className="mt-2">
                      <Input
                        type="text"
                        placeholder="닉네임 (예: alice_123)"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        error={nicknameError}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        @{nickname || 'your_nickname'}.creata
                      </div>
                      <div className="flex space-x-2 mt-2">
                        <Button
                          variant="secondary"
                          onClick={handleCancelEditNickname}
                          className="flex-1"
                        >
                          취소
                        </Button>
                        <Button
                          onClick={handleSaveNickname}
                          className="flex-1"
                        >
                          저장
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-lg mt-1">
                        @{account.metadata?.didNickname || 'unnamed'}.creata
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => setIsEditingNickname(true)}
                        className="text-sm mt-2"
                      >
                        닉네임 변경
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="text-blue-500 hover:text-blue-700 transition-colors text-sm"
              >
                {showLogs ? '로그 숨기기' : 'DID 활동 로그 보기'}
              </button>
              
              {showLogs && (
                <div className="mt-2">
                  {didLogs.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                      {didLogs.map((log, index) => (
                        <div key={index} className="p-2 text-sm border-b border-gray-200 last:border-b-0">
                          <div className="font-medium">{log.action}</div>
                          <div className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</div>
                          {log.details && (
                            <div className="text-xs mt-1">{log.details}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      로그 정보가 없습니다.
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
          
          {!confirmDisconnect ? (
            <Button
              variant="danger"
              onClick={() => setConfirmDisconnect(true)}
              className="w-full mb-4"
            >
              DID 연결 해제
            </Button>
          ) : (
            <Card className="mb-4">
              <div className="text-sm text-red-500 mb-4">
                DID 연결을 해제하시겠습니까? 이 작업은 취소할 수 없으며, 필요한 경우 다시 연결해야 합니다.
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => setConfirmDisconnect(false)}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDisconnectDID}
                  className="flex-1"
                >
                  연결 해제
                </Button>
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card className="mb-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
              <div className="text-gray-400 text-2xl">?</div>
            </div>
            <div className="text-lg font-medium">DID 연결되지 않음</div>
            <div className="text-sm text-gray-500 mt-1">
              탈중앙 신원(DID)을 연결하여 다양한 크리에이터 활동과 보상을 받아보세요.
            </div>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={handleConnectTelegram}
              className="w-full flex items-center justify-center"
            >
              <span className="mr-2">Telegram으로 연결</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 14.22 15.51 15.99C15.37 16.74 15.09 16.99 14.83 17.02C14.25 17.09 13.81 16.66 13.25 16.29C12.37 15.71 11.87 15.35 11.02 14.79C10.03 14.14 10.67 13.79 11.24 13.2C11.39 13.05 13.95 10.7 14 10.49C14.0069 10.4476 14.0003 10.4043 13.9808 10.3657C13.9614 10.3271 13.9299 10.2946 13.89 10.27C13.83 10.24 13.75 10.25 13.68 10.26C13.61 10.27 12.43 11.05 10.13 12.58C9.72 12.85 9.35 12.99 9.02 12.98C8.65 12.97 7.95 12.75 7.42 12.57C6.76 12.35 6.25 12.23 6.3 11.88C6.33 11.69 6.58 11.5 7.06 11.31C9.53 10.19 11.13 9.47 11.88 9.14C14.01 8.2 14.47 8.04 14.76 8.04C14.83 8.04 14.99 8.06 15.09 8.14C15.16 8.22 15.19 8.32 15.2 8.4C15.19 8.46 15.2 8.62 15.19 8.7L15.19 8.71L16.64 8.8Z" fill="currentColor"/>
              </svg>
            </Button>
            
            <Button
              onClick={handleConnectGoogle}
              className="w-full flex items-center justify-center"
              variant="secondary"
            >
              <span className="mr-2">Google로 연결</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="currentColor"/>
              </svg>
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 mt-4">
            * DID 연결 시 해당 서비스에 계정 연결이 요청되며, 서비스 약관에 동의하게 됩니다.
          </div>
        </Card>
      )}
      
      {isConnected && (
        <div className="bg-blue-50 border border-blue-100 p-3 rounded-md mb-4">
          <div className="text-sm text-blue-700">
            <div className="font-medium mb-1">DID 이점</div>
            <ul className="list-disc list-inside text-xs">
              <li>쉬운 로그인 - PIN 대신 외부 서비스로 로그인 가능</li>
              <li>닉네임 주소 - @nickname.creata 형식의 주소 사용 가능</li>
              <li>크리에이터 미션 - DID로 미션 참여 및 보상 획득 가능</li>
              <li>다중 기기 로그인 - 여러 기기에서 동일한 계정 사용 가능</li>
            </ul>
          </div>
        </div>
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

export default DIDScreen;