import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TelegramProvider } from './contexts/TelegramContext';
import { useTelegramContext } from './contexts/TelegramContext';

// 페이지 컴포넌트 임포트
import HomePage from './pages/HomePage';
import WalletPage from './pages/WalletPage';
import MissionPage from './pages/MissionPage';
import NFTGalleryPage from './pages/NFTGalleryPage';
import ReferralPage from './pages/ReferralPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import LoadingPage from './pages/LoadingPage';

// 스타일 임포트
import './styles/global.css';

/**
 * 테마 스타일을 동적으로 적용하는 컴포넌트
 */
const ThemeStylesApplier: React.FC = () => {
  const { themeStyles, colorScheme } = useTelegramContext();

  useEffect(() => {
    // CSS 변수를 통해 테마 색상을 적용
    document.documentElement.style.setProperty('--background-color', themeStyles.backgroundColor);
    document.documentElement.style.setProperty('--text-color', themeStyles.textColor);
    document.documentElement.style.setProperty('--button-color', themeStyles.buttonColor);
    document.documentElement.style.setProperty('--button-text-color', themeStyles.buttonTextColor);
    document.documentElement.style.setProperty('--link-color', themeStyles.linkColor);
    document.documentElement.style.setProperty('--hint-color', themeStyles.hintColor);
    document.documentElement.style.setProperty('--secondary-bg-color', themeStyles.secondaryBgColor);

    // body에 다크모드/라이트모드 클래스 적용
    document.body.className = colorScheme === 'dark' ? 'dark-theme' : 'light-theme';
    document.body.style.backgroundColor = themeStyles.backgroundColor;
    document.body.style.color = themeStyles.textColor;
  }, [themeStyles, colorScheme]);

  return null;
};

/**
 * 메인 앱 컴포넌트
 */
const AppContent: React.FC = () => {
  const { isReady } = useTelegramContext();

  if (!isReady) {
    return <LoadingPage />;
  }

  return (
    <div className="app-container" style={{ backgroundColor: 'var(--background-color)', color: 'var(--text-color)' }}>
      <ThemeStylesApplier />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/missions" element={<MissionPage />} />
        <Route path="/nft" element={<NFTGalleryPage />} />
        <Route path="/referral" element={<ReferralPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </div>
  );
};

/**
 * 루트 앱 컴포넌트
 */
const App: React.FC = () => {
  return (
    <Router>
      <TelegramProvider>
        <AppContent />
      </TelegramProvider>
    </Router>
  );
};

export default App;
