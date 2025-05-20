import React from 'react';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
`;

const LogoContainer = styled.div`
  width: 120px;
  height: 120px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Logo = styled.img`
  width: 100%;
  height: auto;
`;

const LoadingText = styled.p`
  font-size: 16px;
  margin-top: 16px;
  opacity: 0.8;
`;

const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid var(--button-color, #3E96FF);
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

/**
 * 로딩 페이지 컴포넌트
 * 앱 초기화 중에 표시됩니다.
 */
const LoadingPage: React.FC = () => {
  return (
    <LoadingContainer>
      <LogoContainer>
        <Logo 
          src="/assets/logo.png" 
          alt="CreLink Wallet Logo" 
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = 'https://crelink.io/logo.png';
          }}
        />
      </LogoContainer>
      <Spinner />
      <LoadingText>Loading CreLink Wallet...</LoadingText>
    </LoadingContainer>
  );
};

export default LoadingPage;
