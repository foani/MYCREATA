import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import LoadingScreen from '../components/common/LoadingScreen';

/**
 * BackupScreen - 지갑 백업 페이지
 * 
 * 주요 기능:
 * - 시드 구문 백업
 * - 개인 키 백업
 * - 클라우드 백업 설정
 * - 소셜 복구 설정
 */
const BackupScreen: React.FC = () => {
  const navigate = useNavigate();
  const { exportSeedPhrase, exportPrivateKey, setCloudBackup, getSocialRecovery, setSocialRecovery } = useWallet();
  
  const [isLoading, setIsLoading] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState('');
  const [step, setStep] = useState<'options' | 'pin' | 'seed' | 'social'>('options');
  const [backupType, setBackupType] = useState<'seed' | 'cloud' | 'social' | 'key'>('seed');
  const [cloudBackupEnabled, setCloudBackupEnabled] = useState(false);
  const [socialRecovery, setSocialRecoveryData] = useState({
    enabled: false,
    guardians: ['', '', ''],
    threshold: 2
  });
  
  // 기존 백업 설정 로드
  useEffect(() => {
    const loadBackupSettings = async () => {
      try {
        const socialRecoveryData = await getSocialRecovery();
        if (socialRecoveryData) {
          setSocialRecoveryData({
            enabled: socialRecoveryData.enabled,
            guardians: socialRecoveryData.guardians,
            threshold: socialRecoveryData.threshold
          });
        }
      } catch (error) {
        console.error('소셜 복구 설정 로드 실패:', error);
      }
    };
    
    loadBackupSettings();
  }, [getSocialRecovery]);
  
  // PIN 확인 및 시드 구문 로드
  const handleVerifyPin = async () => {
    if (!pin.trim()) {
      setPinError('PIN을 입력하세요');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (backupType === 'seed') {
        const mnemonic = await exportSeedPhrase(pin);
        setSeedPhrase(mnemonic);
        setShowSeedPhrase(false);
        setStep('seed');
      } else if (backupType === 'social') {
        // 소셜 복구 설정 시 PIN 확인 후 진행
        setStep('social');
      } else if (backupType === 'cloud') {
        // 클라우드 백업 PIN 확인 후 설정
        await setCloudBackup(true, pin);
        setCloudBackupEnabled(true);
        setStep('options');
      }
    } catch (error) {
      console.error('PIN 확인 실패:', error);
      setPinError('PIN이 올바르지 않습니다');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 백업 옵션 선택
  const handleSelectBackupType = (type: 'seed' | 'cloud' | 'social' | 'key') => {
    setBackupType(type);
    setPin('');
    setPinError('');
    
    if (type === 'cloud' && cloudBackupEnabled) {
      // 이미 활성화된 경우 비활성화 처리
      handleToggleCloudBackup();
      return;
    }
    
    setStep('pin');
  };
  
  // 클라우드 백업 토글
  const handleToggleCloudBackup = async () => {
    setIsLoading(true);
    
    try {
      await setCloudBackup(!cloudBackupEnabled, pin);
      setCloudBackupEnabled(!cloudBackupEnabled);
    } catch (error) {
      console.error('클라우드 백업 설정 변경 실패:', error);
      alert('클라우드 백업 설정 변경에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 시드 구문 표시/숨기기 토글
  const handleToggleSeedPhrase = () => {
    setShowSeedPhrase(!showSeedPhrase);
  };
  
  // 시드 구문 복사
  const handleCopySeedPhrase = () => {
    if (seedPhrase) {
      navigator.clipboard.writeText(seedPhrase)
        .then(() => {
          alert('시드 구문이 클립보드에 복사되었습니다.');
        })
        .catch(err => {
          console.error('클립보드 복사 실패:', err);
          alert('시드 구문 복사에 실패했습니다.');
        });
    }
  };
  
  // 소셜 복구 가디언 업데이트
  const handleUpdateGuardian = (index: number, value: string) => {
    const newGuardians = [...socialRecovery.guardians];
    newGuardians[index] = value;
    setSocialRecoveryData({
      ...socialRecovery,
      guardians: newGuardians
    });
  };
  
  // 소셜 복구 설정 저장
  const handleSaveSocialRecovery = async () => {
    const validGuardians = socialRecovery.guardians.filter(g => g.trim() !== '');
    
    if (validGuardians.length < socialRecovery.threshold) {
      alert(`최소 ${socialRecovery.threshold}개의 가디언을 설정해야 합니다.`);
      return;
    }
    
    setIsLoading(true);
    
    try {
      await setSocialRecovery({
        enabled: true,
        guardians: socialRecovery.guardians,
        threshold: socialRecovery.threshold
      });
      
      setSocialRecoveryData({
        ...socialRecovery,
        enabled: true
      });
      
      setStep('options');
    } catch (error) {
      console.error('소셜 복구 설정 저장 실패:', error);
      alert('소셜 복구 설정 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 소셜 복구 비활성화
  const handleDisableSocialRecovery = async () => {
    setIsLoading(true);
    
    try {
      await setSocialRecovery({
        enabled: false,
        guardians: [],
        threshold: 2
      });
      
      setSocialRecoveryData({
        enabled: false,
        guardians: ['', '', ''],
        threshold: 2
      });
      
      setStep('options');
    } catch (error) {
      console.error('소셜 복구 비활성화 실패:', error);
      alert('소셜 복구 비활성화에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return <LoadingScreen message="백업 처리 중..." />;
  }
  
  // PIN 입력 화면
  if (step === 'pin') {
    return (
      <div className="p-4 h-full">
        <h1 className="text-xl font-bold mb-4">보안 확인</h1>
        
        <Card className="mb-4">
          <div className="text-center mb-4">
            <div className="w-16 h-16 rounded-full bg-yellow-100 mx-auto mb-2 flex items-center justify-center">
              <div className="text-yellow-500 text-2xl">🔒</div>
            </div>
            <div className="font-medium">PIN 확인</div>
            <div className="text-sm text-gray-500 mt-1">
              보안을 위해 지갑 PIN을 입력해 주세요.
            </div>
          </div>
          
          <div className="mb-4">
            <Input
              type="password"
              placeholder="PIN 입력"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              error={pinError}
              autoFocus
            />
          </div>
        </Card>
        
        <div className="flex space-x-4">
          <Button
            variant="secondary"
            onClick={() => setStep('options')}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            onClick={handleVerifyPin}
            className="flex-1"
          >
            확인
          </Button>
        </div>
      </div>
    );
  }
  
  // 시드 구문 화면
  if (step === 'seed') {
    return (
      <div className="p-4 h-full overflow-y-auto">
        <h1 className="text-xl font-bold mb-4">시드 구문 백업</h1>
        
        <Card className="mb-4">
          <div className="text-center mb-4">
            <div className="w-16 h-16 rounded-full bg-yellow-100 mx-auto mb-2 flex items-center justify-center">
              <div className="text-yellow-500 text-2xl">⚠️</div>
            </div>
            <div className="font-medium">주의!</div>
            <div className="text-sm text-gray-500 mt-1">
              이 시드 구문은 지갑의 비밀 키입니다. 절대로 다른 사람과 공유하지 마세요.
            </div>
          </div>
          
          <div className="mb-4">
            <div className="bg-gray-100 p-3 rounded-md relative">
              {showSeedPhrase ? (
                <div className="font-mono text-sm break-all whitespace-pre-wrap">
                  {seedPhrase}
                </div>
              ) : (
                <div className="bg-gray-300 h-24 rounded-md flex items-center justify-center">
                  <div className="text-sm text-gray-600">
                    시드 구문은 숨겨져 있습니다
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-2">
              <Button
                variant="secondary"
                onClick={handleToggleSeedPhrase}
                className="text-sm"
              >
                {showSeedPhrase ? '숨기기' : '보기'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleCopySeedPhrase}
                className="text-sm"
                disabled={!showSeedPhrase}
              >
                복사
              </Button>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-100 p-3 rounded-md mb-4">
            <div className="text-sm text-red-600">
              <div className="font-medium mb-1">보안 지침</div>
              <ul className="list-disc list-inside text-xs">
                <li>스크린샷을 찍지 마세요</li>
                <li>종이에 직접 적어서 안전한 곳에 보관하세요</li>
                <li>클라우드나 온라인에 저장하지 마세요</li>
                <li>이 12개 단어로 지갑의 모든 자산에 접근할 수 있습니다</li>
              </ul>
            </div>
          </div>
        </Card>
        
        <Button
          onClick={() => setStep('options')}
          className="w-full"
        >
          확인
        </Button>
      </div>
    );
  }
  
  // 소셜 복구 설정 화면
  if (step === 'social') {
    return (
      <div className="p-4 h-full overflow-y-auto">
        <h1 className="text-xl font-bold mb-4">소셜 복구 설정</h1>
        
        <Card className="mb-4">
          <div className="text-center mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 mx-auto mb-2 flex items-center justify-center">
              <div className="text-blue-500 text-2xl">👥</div>
            </div>
            <div className="font-medium">소셜 복구 설정</div>
            <div className="text-sm text-gray-500 mt-1">
              신뢰할 수 있는 연락처 {socialRecovery.threshold}명 이상의 도움으로 지갑을 복구할 수 있습니다.
            </div>
          </div>
          
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">필요 가디언 수</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                className={`p-2 text-center rounded-md ${socialRecovery.threshold === 1 ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                onClick={() => setSocialRecoveryData({...socialRecovery, threshold: 1})}
              >
                1명
              </button>
              <button
                className={`p-2 text-center rounded-md ${socialRecovery.threshold === 2 ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                onClick={() => setSocialRecoveryData({...socialRecovery, threshold: 2})}
              >
                2명
              </button>
              <button
                className={`p-2 text-center rounded-md ${socialRecovery.threshold === 3 ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                onClick={() => setSocialRecoveryData({...socialRecovery, threshold: 3})}
              >
                3명
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">가디언 1</label>
            <Input
              type="email"
              placeholder="가디언 이메일"
              value={socialRecovery.guardians[0]}
              onChange={(e) => handleUpdateGuardian(0, e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">가디언 2</label>
            <Input
              type="email"
              placeholder="가디언 이메일"
              value={socialRecovery.guardians[1]}
              onChange={(e) => handleUpdateGuardian(1, e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">가디언 3</label>
            <Input
              type="email"
              placeholder="가디언 이메일"
              value={socialRecovery.guardians[2]}
              onChange={(e) => handleUpdateGuardian(2, e.target.value)}
            />
          </div>
          
          <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-md mb-4">
            <div className="text-sm text-yellow-700">
              <div className="font-medium mb-1">소셜 복구 안내</div>
              <ul className="list-disc list-inside text-xs">
                <li>신뢰할 수 있는 사람만 가디언으로 설정하세요</li>
                <li>지갑을 분실하면 가디언의 도움을 받아 복구할 수 있습니다</li>
                <li>각 가디언에게 복구 코드가 이메일로 전송됩니다</li>
              </ul>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button
              variant="secondary"
              onClick={() => {
                if (socialRecovery.enabled) {
                  handleDisableSocialRecovery();
                } else {
                  setStep('options');
                }
              }}
              className="flex-1"
            >
              {socialRecovery.enabled ? '비활성화' : '취소'}
            </Button>
            <Button
              onClick={handleSaveSocialRecovery}
              className="flex-1"
            >
              저장
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  // 백업 옵션 화면 (기본)
  return (
    <div className="p-4 h-full overflow-y-auto">
      <h1 className="text-xl font-bold mb-4">지갑 백업</h1>
      
      <Card className="mb-4">
        <div className="text-center mb-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 mx-auto mb-2 flex items-center justify-center">
            <div className="text-blue-500 text-2xl">🔐</div>
          </div>
          <div className="font-medium">지갑 백업 및 복구 옵션</div>
          <div className="text-sm text-gray-500 mt-1">
            지갑을 백업하여 기기 분실 또는 손상 시 자산을 안전하게 복구하세요.
          </div>
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={() => handleSelectBackupType('seed')}
            className="w-full"
          >
            시드 구문 백업
          </Button>
          
          <Button
            onClick={() => handleSelectBackupType('key')}
            className="w-full"
            variant="secondary"
          >
            개인 키 백업
          </Button>
          
          <Button
            onClick={() => handleSelectBackupType('social')}
            className={`w-full ${socialRecovery.enabled ? 'bg-green-500 hover:bg-green-600' : ''}`}
            variant={socialRecovery.enabled ? 'primary' : 'secondary'}
          >
            소셜 복구 {socialRecovery.enabled ? '(활성화됨)' : '설정'}
          </Button>
          
          <Button
            onClick={() => handleSelectBackupType('cloud')}
            className={`w-full ${cloudBackupEnabled ? 'bg-green-500 hover:bg-green-600' : ''}`}
            variant={cloudBackupEnabled ? 'primary' : 'secondary'}
          >
            클라우드 백업 {cloudBackupEnabled ? '비활성화' : '활성화'}
          </Button>
        </div>
      </Card>
      
      <div className="bg-blue-50 border border-blue-100 p-3 rounded-md mb-4">
        <div className="text-sm text-blue-700">
          <div className="font-medium mb-1">백업 방식 비교</div>
          <ul className="list-disc list-inside text-xs space-y-1">
            <li><span className="font-medium">시드 구문:</span> 가장 안전한 방식. 오프라인 보관 필요</li>
            <li><span className="font-medium">개인 키:</span> 개별 계정 백업. 시드 구문과 동일한 주의 필요</li>
            <li><span className="font-medium">소셜 복구:</span> 지인의 도움으로 복구. 신뢰할 수 있는 사람만 선택</li>
            <li><span className="font-medium">클라우드 백업:</span> 편리하지만 클라우드 계정 보안에 의존</li>
          </ul>
        </div>
      </div>
      
      <Button
        variant="secondary"
        onClick={() => navigate(-1)}
        className="w-full"
      >
        뒤로 가기
      </Button>
    </div>
  );
};

export default BackupScreen;