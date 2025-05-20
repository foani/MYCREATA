import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTelegram } from '../hooks/useTelegram';
import { useTelegramContext } from '../contexts/TelegramContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  height: 100%;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  margin-right: 16px;
  font-size: 20px;
  cursor: pointer;
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: 600;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  cursor: pointer;
`;

const SettingLabel = styled.div`
  display: flex;
  align-items: center;
`;

const SettingIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: var(--secondary-bg-color, #f5f5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 16px;
`;

const SettingText = styled.span`
  font-size: 16px;
`;

const SettingAction = styled.div`
  font-size: 18px;
  opacity: 0.5;
`;

const KeyValueItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
`;

const KeyLabel = styled.span`
  font-size: 16px;
  opacity: 0.7;
`;

const ValueText = styled.span`
  font-size: 16px;
  font-weight: 500;
`;

const Divider = styled.div`
  height: 1px;
  background-color: rgba(0, 0, 0, 0.05);
  margin: 8px 0;
`;

const AppVersion = styled.div`
  text-align: center;
  font-size: 14px;
  opacity: 0.5;
  margin-top: 32px;
`;

const UserInfoContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  overflow: hidden;
  margin-right: 16px;
`;

const UserAvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const UserAvatarPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background-color: var(--secondary-bg-color, #f5f5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const UserTelegramId = styled.p`
  font-size: 14px;
  opacity: 0.7;
`;

/**
 * 설정 페이지 컴포넌트
 * 앱 설정과 사용자 정보를 표시합니다.
 */
const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { setupBackButton, hapticFeedback, showAlert, showConfirm, openLink } = useTelegram();
  const { user, colorScheme, isTelegramWebApp } = useTelegramContext();
  const appVersion = '0.1.0'; // 앱 버전

  useEffect(() => {
    // 백버튼 설정
    setupBackButton(true, () => {
      navigate('/');
    });

    return () => {
      // 페이지 이탈 시 버튼 리셋
      setupBackButton(false);
    };
  }, [setupBackButton, navigate]);

  /**
   * 설정 항목 클릭 핸들러
   */
  const handleSettingClick = (action: string) => {
    hapticFeedback('impact', 'light');
    
    switch (action) {
      case 'about':
        showAlert(`CreLink Wallet v${appVersion}\n\nCreLink Wallet is a Web3 wallet for the Catena blockchain. It allows you to manage your assets, earn rewards through missions, and collect NFTs.`);
        break;
      
      case 'telegram_bot':
        if (isTelegramWebApp) {
          openLink('https://t.me/CreLinkBot');
        } else {
          window.open('https://t.me/CreLinkBot', '_blank');
        }
        break;
      
      case 'support':
        if (isTelegramWebApp) {
          openLink('https://t.me/CreLinkSupport');
        } else {
          window.open('https://t.me/CreLinkSupport', '_blank');
        }
        break;
      
      case 'faq':
        if (isTelegramWebApp) {
          openLink('https://crelink.io/faq');
        } else {
          window.open('https://crelink.io/faq', '_blank');
        }
        break;
      
      case 'privacy_policy':
        if (isTelegramWebApp) {
          openLink('https://crelink.io/privacy-policy');
        } else {
          window.open('https://crelink.io/privacy-policy', '_blank');
        }
        break;
      
      case 'terms':
        if (isTelegramWebApp) {
          openLink('https://crelink.io/terms');
        } else {
          window.open('https://crelink.io/terms', '_blank');
        }
        break;
      
      case 'reset_wallet':
        showConfirm(
          'Are you sure you want to reset your wallet? This will delete all your data and cannot be undone.',
          (confirmed) => {
            if (confirmed) {
              // TODO: 지갑 리셋 로직 구현
              hapticFeedback('success');
              showAlert('Wallet has been reset successfully!');
              navigate('/');
            }
          }
        );
        break;
      
      default:
        break;
    }
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/')}>←</BackButton>
        <HeaderTitle>Settings</HeaderTitle>
      </Header>

      {/* 사용자 정보 */}
      {user && (
        <UserInfoContainer>
          <UserAvatar>
            {user.photo_url ? (
              <UserAvatarImage 
                src={user.photo_url} 
                alt={user.first_name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const placeholder = document.createElement('div');
                    placeholder.style.width = '100%';
                    placeholder.style.height = '100%';
                    placeholder.style.display = 'flex';
                    placeholder.style.alignItems = 'center';
                    placeholder.style.justifyContent = 'center';
                    placeholder.style.backgroundColor = 'var(--secondary-bg-color, #f5f5f5)';
                    placeholder.style.fontSize = '20px';
                    placeholder.innerText = user.first_name.charAt(0).toUpperCase();
                    parent.appendChild(placeholder);
                  }
                }}
              />
            ) : (
              <UserAvatarPlaceholder>
                {user.first_name.charAt(0).toUpperCase()}
              </UserAvatarPlaceholder>
            )}
          </UserAvatar>
          <UserInfo>
            <UserName>{`${user.first_name} ${user.last_name || ''}`}</UserName>
            {user.username && (
              <UserTelegramId>@{user.username}</UserTelegramId>
            )}
          </UserInfo>
        </UserInfoContainer>
      )}

      {/* 계정 설정 */}
      <Section>
        <SectionTitle>Account</SectionTitle>
        
        <SettingItem onClick={() => handleSettingClick('telegram_bot')}>
          <SettingLabel>
            <SettingIcon>🤖</SettingIcon>
            <SettingText>Telegram Bot</SettingText>
          </SettingLabel>
          <SettingAction>→</SettingAction>
        </SettingItem>
        
        <SettingItem onClick={() => navigate('/referral')}>
          <SettingLabel>
            <SettingIcon>👥</SettingIcon>
            <SettingText>Referral Program</SettingText>
          </SettingLabel>
          <SettingAction>→</SettingAction>
        </SettingItem>
        
        <SettingItem onClick={() => handleSettingClick('reset_wallet')}>
          <SettingLabel>
            <SettingIcon style={{ color: 'red' }}>🗑️</SettingIcon>
            <SettingText style={{ color: 'red' }}>Reset Wallet</SettingText>
          </SettingLabel>
          <SettingAction>→</SettingAction>
        </SettingItem>
      </Section>

      {/* 지원 및 정보 */}
      <Section>
        <SectionTitle>Support & Info</SectionTitle>
        
        <SettingItem onClick={() => handleSettingClick('support')}>
          <SettingLabel>
            <SettingIcon>💬</SettingIcon>
            <SettingText>Support</SettingText>
          </SettingLabel>
          <SettingAction>→</SettingAction>
        </SettingItem>
        
        <SettingItem onClick={() => handleSettingClick('faq')}>
          <SettingLabel>
            <SettingIcon>❓</SettingIcon>
            <SettingText>FAQ</SettingText>
          </SettingLabel>
          <SettingAction>→</SettingAction>
        </SettingItem>
        
        <SettingItem onClick={() => handleSettingClick('privacy_policy')}>
          <SettingLabel>
            <SettingIcon>🔒</SettingIcon>
            <SettingText>Privacy Policy</SettingText>
          </SettingLabel>
          <SettingAction>→</SettingAction>
        </SettingItem>
        
        <SettingItem onClick={() => handleSettingClick('terms')}>
          <SettingLabel>
            <SettingIcon>📄</SettingIcon>
            <SettingText>Terms of Service</SettingText>
          </SettingLabel>
          <SettingAction>→</SettingAction>
        </SettingItem>
        
        <SettingItem onClick={() => handleSettingClick('about')}>
          <SettingLabel>
            <SettingIcon>ℹ️</SettingIcon>
            <SettingText>About CreLink</SettingText>
          </SettingLabel>
          <SettingAction>→</SettingAction>
        </SettingItem>
      </Section>

      {/* 앱 정보 */}
      <Section>
        <SectionTitle>App Info</SectionTitle>
        
        <KeyValueItem>
          <KeyLabel>Version</KeyLabel>
          <ValueText>{appVersion}</ValueText>
        </KeyValueItem>
        
        <KeyValueItem>
          <KeyLabel>Theme</KeyLabel>
          <ValueText>{colorScheme === 'dark' ? 'Dark' : 'Light'}</ValueText>
        </KeyValueItem>
        
        <KeyValueItem>
          <KeyLabel>Telegram WebApp</KeyLabel>
          <ValueText>{isTelegramWebApp ? 'Yes' : 'No'}</ValueText>
        </KeyValueItem>
      </Section>

      <AppVersion>CreLink Wallet v{appVersion}</AppVersion>
    </Container>
  );
};

export default SettingsPage;
