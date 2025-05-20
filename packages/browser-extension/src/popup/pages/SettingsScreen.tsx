import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../hooks/useWallet';
import { useUI } from '../context/UIContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LanguageSelector from '../components/common/LanguageSelector';

/**
 * SettingsScreen - 지갑 설정 페이지
 * 
 * 주요 기능:
 * - 보안 설정 (PIN 변경, 생체 인증 활성화/비활성화)
 * - 네트워크 관리 (체인 추가/편집)
 * - 계정 관리 (계정 추가, 가져오기, 내보내기)
 * - DID 관리 (DID 연결, 닉네임 설정)
 * - 백업 및 복구 옵션
 * - 언어 및 테마 설정
 * - 지갑 초기화 및 로그아웃
 */
const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { logout, resetWallet, selectedAccount, settings, updateSettings } = useWallet();
  const { themeMode, setThemeMode } = useUI();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // 설정 변경 핸들러
  const handleToggleBiometrics = () => {
    updateSettings({ useBiometrics: !settings?.useBiometrics });
  };
  
  const handleToggleAutoLock = () => {
    updateSettings({ autoLock: !settings?.autoLock });
  };
  
  const handleToggleChainSwitch = () => {
    updateSettings({ autoChainSwitch: !settings?.autoChainSwitch });
  };
  
  // 테마 모드 토글
  const handleToggleDarkMode = () => {
    const newThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newThemeMode);
    updateSettings({ darkMode: newThemeMode === 'dark' });
  };
  
  // 언어 변경 핸들러
  const handleLanguageChange = (language: string) => {
    updateSettings({ language });
  };
  
  // 로그아웃 처리
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  // 지갑 초기화 처리
  const handleResetWallet = async () => {
    if (showResetConfirm) {
      await resetWallet();
      navigate('/onboarding');
    } else {
      setShowResetConfirm(true);
    }
  };
  
  // 지갑 초기화 취소
  const handleCancelReset = () => {
    setShowResetConfirm(false);
  };
  
  return (
    <div className="p-4 h-full overflow-y-auto theme-transition">
      <h1 className="text-xl font-bold mb-4 text-text-primary dark:text-text-primary">{t('settings.general')}</h1>
      
      {/* 보안 설정 */}
      <Card className="mb-4">
        <h2 className="text-lg font-medium mb-2 text-text-primary dark:text-text-primary">{t('settings.security')}</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-text-primary dark:text-text-primary">{t('settings.changePin')}</div>
              <div className="text-sm text-text-secondary dark:text-text-secondary">{t('auth.enterPin')}</div>
            </div>
            <Button 
              variant="secondary"
              onClick={() => navigate('/settings/change-pin')}
            >
              {t('actions.edit')}
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-text-primary dark:text-text-primary">{t('settings.biometricAuth')}</div>
              <div className="text-sm text-text-secondary dark:text-text-secondary">{t('settings.biometricDescription')}</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={settings?.useBiometrics || false}
                onChange={handleToggleBiometrics}
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-text-primary dark:text-text-primary">{t('settings.autoLock')}</div>
              <div className="text-sm text-text-secondary dark:text-text-secondary">{t('settings.autoLockDescription')}</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={settings?.autoLock || false}
                onChange={handleToggleAutoLock}
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
        </div>
      </Card>
      
      {/* 계정 관리 */}
      <Card className="mb-4">
        <h2 className="text-lg font-medium mb-2 text-text-primary dark:text-text-primary">{t('settings.accountManagement')}</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-text-primary dark:text-text-primary">{t('wallet.accounts')}</div>
              <div className="text-sm text-text-secondary dark:text-text-secondary">{t('settings.accountManagementDescription')}</div>
            </div>
            <Button 
              variant="secondary"
              onClick={() => navigate('/settings/accounts')}
            >
              {t('actions.edit')}
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-text-primary dark:text-text-primary">{t('settings.seedPhraseBackup')}</div>
              <div className="text-sm text-text-secondary dark:text-text-secondary">{t('settings.seedPhraseBackupDescription')}</div>
            </div>
            <Button 
              variant="secondary"
              onClick={() => navigate('/settings/backup')}
            >
              {t('actions.export')}
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-text-primary dark:text-text-primary">{t('settings.exportPrivateKey')}</div>
              <div className="text-sm text-text-secondary dark:text-text-secondary">{t('settings.exportPrivateKeyDescription')}</div>
            </div>
            <Button 
              variant="secondary"
              onClick={() => navigate('/settings/export-key')}
            >
              {t('actions.export')}
            </Button>
          </div>
        </div>
      </Card>
      
      {/* 네트워크 설정 */}
      <Card className="mb-4">
        <h2 className="text-lg font-medium mb-2 text-text-primary dark:text-text-primary">{t('settings.networks')}</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-text-primary dark:text-text-primary">{t('settings.networkManagement')}</div>
              <div className="text-sm text-text-secondary dark:text-text-secondary">{t('settings.networkManagementDescription')}</div>
            </div>
            <Button 
              variant="secondary"
              onClick={() => navigate('/settings/networks')}
            >
              {t('actions.edit')}
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-text-primary dark:text-text-primary">{t('settings.autoChainSwitch')}</div>
              <div className="text-sm text-text-secondary dark:text-text-secondary">{t('settings.autoChainSwitchDescription')}</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={settings?.autoChainSwitch || false}
                onChange={handleToggleChainSwitch}
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
        </div>
      </Card>
      
      {/* DID 설정 */}
      <Card className="mb-4">
        <h2 className="text-lg font-medium mb-2 text-text-primary dark:text-text-primary">{t('settings.didManagement')}</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-text-primary dark:text-text-primary">DID {t('settings.didManagement')}</div>
              <div className="text-sm text-text-secondary dark:text-text-secondary">
                {selectedAccount?.metadata?.didConnected 
                  ? 'DID 연결됨' 
                  : t('settings.didManagementDescription')}
              </div>
            </div>
            <Button 
              variant="secondary"
              onClick={() => navigate('/settings/did')}
            >
              {selectedAccount?.metadata?.didConnected ? t('actions.edit') : t('dapp.connect')}
            </Button>
          </div>
        </div>
      </Card>
      
      {/* 일반 설정 */}
      <Card className="mb-4">
        <h2 className="text-lg font-medium mb-2 text-text-primary dark:text-text-primary">{t('settings.general')}</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-text-primary dark:text-text-primary">{t('settings.darkMode')}</div>
              <div className="text-sm text-text-secondary dark:text-text-secondary">{t('settings.darkModeDescription')}</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={themeMode === 'dark'}
                onChange={handleToggleDarkMode}
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
          
          <div>
            <div className="font-medium mb-1 text-text-primary dark:text-text-primary">{t('settings.language')}</div>
            <LanguageSelector />
          </div>
        </div>
      </Card>
      
      {/* 로그아웃 및 초기화 */}
      <div className="space-y-3 mb-4">
        <Button
          variant="secondary"
          onClick={handleLogout}
          className="w-full"
        >
          {t('auth.logout')}
        </Button>
        
        {showResetConfirm ? (
          <div>
            <div className="text-red-500 dark:text-red-400 text-sm font-medium mb-2">
              {t('settings.resetWarning')}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                onClick={handleCancelReset}
                className="flex-1"
              >
                {t('actions.cancel')}
              </Button>
              <Button
                variant="danger"
                onClick={handleResetWallet}
                className="flex-1"
              >
                {t('actions.confirm')}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="danger"
            onClick={handleResetWallet}
            className="w-full"
          >
            {t('settings.resetWallet')}
          </Button>
        )}
      </div>
      
      <div className="text-center text-xs text-text-secondary dark:text-text-secondary mb-6">
        <div>CreLink {t('settings.version')} v1.0.0</div>
        <div className="mt-1">&copy; 2025 CreataChain</div>
      </div>
    </div>
  );
};

export default SettingsScreen;