import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTelegram } from '../hooks/useTelegram';
import apiService, { ReferralStats } from '../services/api';

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

const ReferralCard = styled.div`
  background-color: var(--button-color, #3E96FF);
  color: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  text-align: center;
`;

const ReferralTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const ReferralDescription = styled.p`
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 24px;
  line-height: 1.6;
`;

const ReferralCodeContainer = styled.div`
  background-color: rgba(255, 255, 255, 0.2);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const ReferralCode = styled.h3`
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 2px;
`;

const CopyButton = styled.button`
  background-color: white;
  color: var(--button-color, #3E96FF);
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  margin-bottom: 16px;
  cursor: pointer;
  font-size: 14px;
`;

const ShareButton = styled.button`
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ShareIcon = styled.span`
  margin-right: 8px;
  font-size: 16px;
`;

const StatsContainer = styled.div`
  margin-bottom: 24px;
`;

const StatsCard = styled.div`
  background-color: var(--secondary-bg-color, #f5f5f5);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

const StatsTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const StatBox = styled.div`
  background-color: var(--background-color, #ffffff);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
`;

const StatValue = styled.h4`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--button-color, #3E96FF);
`;

const StatLabel = styled.p`
  font-size: 14px;
  opacity: 0.7;
`;

const RewardsCard = styled.div`
  background-color: var(--secondary-bg-color, #f5f5f5);
  border-radius: 12px;
  padding: 16px;
`;

const RewardsList = styled.div`
  margin-top: 16px;
`;

const RewardItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const RewardDate = styled.span`
  font-size: 14px;
  opacity: 0.7;
`;

const RewardAmount = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--button-color, #3E96FF);
`;

const InputContainer = styled.div`
  margin-top: 32px;
  margin-bottom: 24px;
`;

const InputLabel = styled.p`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
`;

const InputGroup = styled.div`
  display: flex;
  margin-bottom: 8px;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px 0 0 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 16px;
  outline: none;
  background-color: var(--background-color, #ffffff);
  color: var(--text-color, #000000);
  
  &::placeholder {
    color: rgba(0, 0, 0, 0.4);
  }
`;

const SubmitButton = styled.button`
  background-color: var(--button-color, #3E96FF);
  color: white;
  padding: 12px 24px;
  border-radius: 0 8px 8px 0;
  font-weight: 600;
  cursor: pointer;
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
`;

const NoRewards = styled.div`
  text-align: center;
  padding: 16px;
  opacity: 0.7;
`;

/**
 * 추천 페이지 컴포넌트
 * 사용자의 추천 코드와 통계를 보여주고 추천 코드를 입력할 수 있는 화면입니다.
 */
const ReferralPage: React.FC = () => {
  const navigate = useNavigate();
  const { setupBackButton, hapticFeedback, showAlert, showPopup } = useTelegram();
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputCode, setInputCode] = useState('');

  useEffect(() => {
    // 백버튼 설정
    setupBackButton(true, () => {
      navigate('/');
    });

    // 추천 데이터 불러오기
    const fetchReferralData = async () => {
      setLoading(true);
      try {
        // 추천 코드 조회
        const codeResponse = await apiService.getReferralCode();
        if (codeResponse.success && codeResponse.data) {
          setReferralCode(codeResponse.data.code);
        }

        // 추천 통계 조회
        const statsResponse = await apiService.getReferralStats();
        if (statsResponse.success && statsResponse.data) {
          setReferralStats(statsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching referral data:', error);
        // 테스트용 더미 데이터
        setReferralCode('ABC123');
        setReferralStats({
          referralCode: 'ABC123',
          totalReferred: 0,
          activeReferred: 0,
          totalEarned: '0',
          tokenSymbol: 'CTA',
          pendingRewards: '0',
          historicalRewards: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();

    return () => {
      // 페이지 이탈 시 버튼 리셋
      setupBackButton(false);
    };
  }, [setupBackButton, navigate]);

  /**
   * 추천 코드 복사
   */
  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode)
      .then(() => {
        hapticFeedback('success');
        showAlert('Referral code copied to clipboard!');
      })
      .catch(() => {
        hapticFeedback('error');
        showAlert('Could not copy the code. Please try again.');
      });
  };

  /**
   * 추천 코드 공유
   */
  const handleShareCode = () => {
    const shareText = `Join CreLink Wallet and get crypto rewards! Use my referral code: ${referralCode}`;
    
    // Telegram 공유 기능 사용
    if (navigator.share) {
      navigator.share({
        title: 'CreLink Wallet Referral',
        text: shareText,
        url: 'https://crelink.io'
      })
        .then(() => {
          hapticFeedback('success');
        })
        .catch((error) => {
          console.error('Error sharing:', error);
          hapticFeedback('error');
        });
    } else {
      // 공유 API가 지원되지 않는 경우 복사
      navigator.clipboard.writeText(shareText)
        .then(() => {
          hapticFeedback('success');
          showAlert('Referral message copied to clipboard!');
        })
        .catch(() => {
          hapticFeedback('error');
          showAlert('Could not copy the message. Please try again.');
        });
    }
  };

  /**
   * 추천 코드 적용
   */
  const handleApplyReferralCode = async () => {
    if (!inputCode) {
      showAlert('Please enter a referral code');
      return;
    }

    hapticFeedback('impact', 'medium');
    
    try {
      const response = await apiService.applyReferralCode(inputCode);
      
      if (response.success && response.data?.success) {
        hapticFeedback('success');
        showPopup({
          title: 'Success!',
          message: 'Referral code applied successfully!',
          buttons: [
            { text: 'Great!', type: 'default' }
          ]
        });
        
        // 입력 필드 초기화
        setInputCode('');
      } else {
        hapticFeedback('error');
        showPopup({
          title: 'Error',
          message: response.error?.message || 'Invalid referral code',
          buttons: [
            { text: 'OK', type: 'default' }
          ]
        });
      }
    } catch (error) {
      console.error('Error applying referral code:', error);
      hapticFeedback('error');
      showAlert('An error occurred. Please try again later.');
    }
  };

  /**
   * 날짜 포맷 함수
   */
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/')}>←</BackButton>
        <HeaderTitle>Refer & Earn</HeaderTitle>
      </Header>

      {loading ? (
        <LoadingIndicator>
          <div className="loader"></div>
        </LoadingIndicator>
      ) : (
        <>
          <ReferralCard>
            <ReferralTitle>Invite Friends & Earn Rewards</ReferralTitle>
            <ReferralDescription>
              Share your referral code with friends. When they join CreLink Wallet and use your code, you both earn rewards!
            </ReferralDescription>
            
            <ReferralCodeContainer>
              <ReferralCode>{referralCode}</ReferralCode>
            </ReferralCodeContainer>
            
            <CopyButton onClick={handleCopyCode}>
              Copy Code
            </CopyButton>
            
            <ShareButton onClick={handleShareCode}>
              <ShareIcon>↗</ShareIcon>
              Share with Friends
            </ShareButton>
          </ReferralCard>

          {referralStats && (
            <StatsContainer>
              <StatsCard>
                <StatsTitle>Your Referral Stats</StatsTitle>
                <StatsGrid>
                  <StatBox>
                    <StatValue>{referralStats.totalReferred}</StatValue>
                    <StatLabel>Total Referred</StatLabel>
                  </StatBox>
                  <StatBox>
                    <StatValue>{referralStats.activeReferred}</StatValue>
                    <StatLabel>Active Users</StatLabel>
                  </StatBox>
                  <StatBox>
                    <StatValue>{referralStats.totalEarned}</StatValue>
                    <StatLabel>Total Earned ({referralStats.tokenSymbol})</StatLabel>
                  </StatBox>
                  <StatBox>
                    <StatValue>{referralStats.pendingRewards}</StatValue>
                    <StatLabel>Pending Rewards</StatLabel>
                  </StatBox>
                </StatsGrid>
              </StatsCard>

              <RewardsCard>
                <StatsTitle>Rewards History</StatsTitle>
                <RewardsList>
                  {referralStats.historicalRewards.length > 0 ? (
                    referralStats.historicalRewards.map((reward, index) => (
                      <RewardItem key={index}>
                        <RewardDate>{formatDate(reward.timestamp)}</RewardDate>
                        <RewardAmount>
                          {reward.amount} {referralStats.tokenSymbol}
                          {reward.status === 'pending' && ' (Pending)'}
                        </RewardAmount>
                      </RewardItem>
                    ))
                  ) : (
                    <NoRewards>No rewards yet</NoRewards>
                  )}
                </RewardsList>
              </RewardsCard>
            </StatsContainer>
          )}

          <InputContainer>
            <InputLabel>Have a referral code?</InputLabel>
            <InputGroup>
              <Input
                type="text"
                placeholder="Enter code here"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
              />
              <SubmitButton onClick={handleApplyReferralCode}>
                Apply
              </SubmitButton>
            </InputGroup>
          </InputContainer>
        </>
      )}
    </Container>
  );
};

export default ReferralPage;
