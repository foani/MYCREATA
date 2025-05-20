import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTelegram } from '../hooks/useTelegram';
import { useTelegramContext } from '../contexts/TelegramContext';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  height: 100%;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const WelcomeSection = styled.div`
  margin-bottom: 32px;
`;

const Greeting = styled.h1`
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const SubGreeting = styled.p`
  font-size: 16px;
  opacity: 0.7;
`;

const BalanceCard = styled.div`
  background-color: var(--button-color, #3E96FF);
  color: var(--button-text-color, #FFFFFF);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const BalanceTitle = styled.p`
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
`;

const BalanceAmount = styled.h2`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 16px;
`;

const BalanceFiat = styled.p`
  font-size: 14px;
  opacity: 0.9;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 32px;
`;

const ActionButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: transparent;
  border: none;
  padding: 12px;
`;

const ButtonIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: var(--secondary-bg-color, #f5f5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  color: var(--button-color, #3E96FF);
  font-size: 20px;
`;

const ButtonText = styled.span`
  font-size: 14px;
  color: var(--text-color, #000000);
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const MissionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MissionCard = styled.div`
  background-color: var(--secondary-bg-color, #f5f5f5);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const MissionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: var(--button-color, #3E96FF);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
`;

const MissionContent = styled.div`
  flex: 1;
`;

const MissionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const MissionDescription = styled.p`
  font-size: 14px;
  opacity: 0.7;
`;

const MissionReward = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--button-color, #3E96FF);
`;

/**
 * 홈 페이지 컴포넌트
 * 사용자의 계정 요약 정보와 미션 목록을 표시합니다.
 */
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { setupMainButton, hapticFeedback } = useTelegram();
  const { user } = useTelegramContext();
  
  // 메인 버튼 설정
  useEffect(() => {
    setupMainButton('Open Wallet', () => {
      hapticFeedback('impact', 'medium');
      navigate('/wallet');
    });

    return () => {
      // 페이지 이탈 시 메인 버튼 리셋
      setupMainButton('', () => {}, { isVisible: false });
    };
  }, [setupMainButton, hapticFeedback, navigate]);

  // 사용자 이름 표시
  const displayName = user?.first_name || 'there';

  return (
    <HomeContainer>
      <Header>
        <img 
          src="/assets/logo.png" 
          alt="CreLink" 
          style={{ height: 32 }} 
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = 'https://crelink.io/logo-small.png';
          }}
        />
      </Header>

      <WelcomeSection>
        <Greeting>Hello, {displayName}! 👋</Greeting>
        <SubGreeting>Welcome to CreLink Wallet</SubGreeting>
      </WelcomeSection>

      <BalanceCard>
        <BalanceTitle>Total Balance</BalanceTitle>
        <BalanceAmount>0 CTA</BalanceAmount>
        <BalanceFiat>$0.00 USD</BalanceFiat>
      </BalanceCard>

      <ActionButtonsContainer>
        <ActionButton onClick={() => navigate('/wallet')}>
          <ButtonIcon>💰</ButtonIcon>
          <ButtonText>Wallet</ButtonText>
        </ActionButton>
        <ActionButton onClick={() => navigate('/missions')}>
          <ButtonIcon>🏆</ButtonIcon>
          <ButtonText>Missions</ButtonText>
        </ActionButton>
        <ActionButton onClick={() => navigate('/nft')}>
          <ButtonIcon>🖼️</ButtonIcon>
          <ButtonText>NFTs</ButtonText>
        </ActionButton>
        <ActionButton onClick={() => navigate('/referral')}>
          <ButtonIcon>👥</ButtonIcon>
          <ButtonText>Refer</ButtonText>
        </ActionButton>
      </ActionButtonsContainer>

      <SectionTitle>Today's Missions</SectionTitle>
      <MissionsList>
        <MissionCard onClick={() => navigate('/missions')}>
          <MissionIcon>📝</MissionIcon>
          <MissionContent>
            <MissionTitle>Complete your profile</MissionTitle>
            <MissionDescription>Set up your CreLink profile</MissionDescription>
          </MissionContent>
          <MissionReward>+5 CTA</MissionReward>
        </MissionCard>
        
        <MissionCard onClick={() => navigate('/missions')}>
          <MissionIcon>📱</MissionIcon>
          <MissionContent>
            <MissionTitle>Daily check-in</MissionTitle>
            <MissionDescription>Open the app every day</MissionDescription>
          </MissionContent>
          <MissionReward>+1 CTA</MissionReward>
        </MissionCard>
        
        <MissionCard onClick={() => navigate('/missions')}>
          <MissionIcon>🔄</MissionIcon>
          <MissionContent>
            <MissionTitle>First transaction</MissionTitle>
            <MissionDescription>Make your first transaction</MissionDescription>
          </MissionContent>
          <MissionReward>+10 CTA</MissionReward>
        </MissionCard>
      </MissionsList>
    </HomeContainer>
  );
};

export default HomePage;
