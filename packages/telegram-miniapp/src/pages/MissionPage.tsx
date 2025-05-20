import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTelegram } from '../hooks/useTelegram';
import apiService, { Mission } from '../services/api';

const MissionContainer = styled.div`
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

const MissionsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
`;

const MissionSection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const MissionCard = styled.div<{ status: 'available' | 'completed' | 'expired' }>`
  background-color: ${props => 
    props.status === 'completed' 
      ? 'rgba(52, 199, 89, 0.1)' 
      : props.status === 'expired' 
        ? 'rgba(142, 142, 147, 0.1)' 
        : 'var(--secondary-bg-color, #f5f5f5)'
  };
  border-radius: 12px;
  padding: 16px;
  display: flex;
  position: relative;
  cursor: ${props => props.status === 'available' ? 'pointer' : 'default'};
`;

const MissionIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: var(--button-color, #3E96FF);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
  font-size: 20px;
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
  margin-bottom: 12px;
`;

const MissionReward = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--button-color, #3E96FF);
`;

const MissionStatus = styled.div<{ status: 'available' | 'completed' | 'expired' }>`
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: ${props => 
    props.status === 'completed' 
      ? '#34C759'
      : props.status === 'expired'
        ? '#8E8E93'
        : 'var(--button-color, #3E96FF)'
  };
  background-color: ${props => 
    props.status === 'completed' 
      ? 'rgba(52, 199, 89, 0.1)'
      : props.status === 'expired'
        ? 'rgba(142, 142, 147, 0.1)'
        : 'rgba(62, 150, 255, 0.1)'
  };
`;

const ProgressBar = styled.div`
  height: 6px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  margin-bottom: 8px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ width: number }>`
  height: 100%;
  width: ${props => props.width}%;
  background-color: var(--button-color, #3E96FF);
  border-radius: 3px;
`;

const ProgressText = styled.div`
  font-size: 12px;
  opacity: 0.7;
  margin-bottom: 12px;
`;

const NoMissions = styled.div`
  text-align: center;
  padding: 24px;
  background-color: var(--secondary-bg-color, #f5f5f5);
  border-radius: 12px;
`;

const NoMissionsText = styled.p`
  font-size: 16px;
  opacity: 0.7;
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
`;

const CompletedBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 18px;
`;

const MissionPage: React.FC = () => {
  const navigate = useNavigate();
  const { setupMainButton, setupBackButton, hapticFeedback, showPopup } = useTelegram();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 백버튼 설정
    setupBackButton(true, () => {
      navigate('/');
    });

    // 메인 버튼 숨기기
    setupMainButton('', () => {}, { isVisible: false });

    // 미션 데이터 불러오기
    const fetchMissions = async () => {
      setLoading(true);
      try {
        const response = await apiService.getMissions();
        if (response.success && response.data) {
          setMissions(response.data);
        }
      } catch (error) {
        console.error('Error fetching missions:', error);
        // 테스트용 더미 데이터
        setMissions([
          {
            id: '1',
            title: 'Complete your profile',
            description: 'Set up your CreLink profile',
            reward: {
              amount: '5',
              token: 'CTA'
            },
            status: 'available',
            type: 'onetime',
            iconUrl: ''
          },
          {
            id: '2',
            title: 'Daily check-in',
            description: 'Open the app every day',
            reward: {
              amount: '1',
              token: 'CTA'
            },
            status: 'available',
            type: 'daily',
            iconUrl: ''
          },
          {
            id: '3',
            title: 'Refer a friend',
            description: 'Invite your friends to join CreLink',
            reward: {
              amount: '10',
              token: 'CTA'
            },
            status: 'available',
            type: 'onetime',
            progress: 0,
            totalSteps: 5,
            iconUrl: ''
          },
          {
            id: '4',
            title: 'First transaction',
            description: 'Make your first transaction',
            reward: {
              amount: '10',
              token: 'CTA'
            },
            status: 'completed',
            type: 'onetime',
            iconUrl: ''
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();

    return () => {
      // 페이지 이탈 시 버튼 리셋
      setupBackButton(false);
      setupMainButton('', () => {}, { isVisible: false });
    };
  }, [setupMainButton, setupBackButton, navigate]);

  /**
   * 미션 완료 처리
   */
  const handleCompleteMission = async (mission: Mission) => {
    if (mission.status !== 'available') return;

    hapticFeedback('impact', 'medium');

    try {
      const response = await apiService.completeMission(mission.id);
      
      if (response.success && response.data?.success) {
        // 미션 상태 업데이트
        setMissions(prevMissions => 
          prevMissions.map(m => 
            m.id === mission.id ? { ...m, status: 'completed' } : m
          )
        );
        
        // 성공 메시지 표시
        showPopup({
          title: 'Mission Completed!',
          message: `You've earned ${response.data.reward.amount} ${response.data.reward.token}`,
          buttons: [
            { text: 'Awesome!', type: 'default' }
          ]
        });
        
        hapticFeedback('success');
      } else {
        // 오류 메시지 표시
        showPopup({
          title: 'Mission Failed',
          message: response.error?.message || 'Failed to complete mission',
          buttons: [
            { text: 'OK', type: 'default' }
          ]
        });
        
        hapticFeedback('error');
      }
    } catch (error) {
      console.error('Error completing mission:', error);
      
      // 오류 메시지 표시
      showPopup({
        title: 'Error',
        message: 'An error occurred while completing the mission',
        buttons: [
          { text: 'OK', type: 'default' }
        ]
      });
      
      hapticFeedback('error');
    }
  };

  // 미션을 타입별로 그룹화
  const dailyMissions = missions.filter(mission => mission.type === 'daily');
  const weeklyMissions = missions.filter(mission => mission.type === 'weekly');
  const specialMissions = missions.filter(mission => mission.type === 'special' || mission.type === 'onetime');

  /**
   * 미션 카드 렌더링
   */
  const renderMissionCard = (mission: Mission) => (
    <MissionCard 
      key={mission.id} 
      status={mission.status}
      onClick={() => mission.status === 'available' && handleCompleteMission(mission)}
    >
      <MissionIcon>
        {mission.iconUrl ? (
          <img 
            src={mission.iconUrl} 
            alt={mission.title}
            style={{ width: '24px', height: '24px' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              // 아이콘 텍스트로 대체
              target.style.display = 'none';
              (target.parentNode as HTMLElement).innerText = '🏆';
            }}
          />
        ) : (
          '🏆'
        )}
      </MissionIcon>
      <MissionContent>
        <MissionTitle>{mission.title}</MissionTitle>
        <MissionDescription>{mission.description}</MissionDescription>
        
        {mission.totalSteps && mission.progress !== undefined && (
          <>
            <ProgressBar>
              <ProgressFill width={(mission.progress / mission.totalSteps) * 100} />
            </ProgressBar>
            <ProgressText>
              {mission.progress} / {mission.totalSteps} completed
            </ProgressText>
          </>
        )}
        
        <MissionReward>
          Reward: {mission.reward.amount} {mission.reward.token}
        </MissionReward>
      </MissionContent>
      
      <MissionStatus status={mission.status}>
        {mission.status === 'completed' 
          ? 'Completed' 
          : mission.status === 'expired' 
            ? 'Expired'
            : 'Available'}
      </MissionStatus>
      
      {mission.status === 'completed' && (
        <CompletedBadge>✅</CompletedBadge>
      )}
    </MissionCard>
  );

  return (
    <MissionContainer>
      <Header>
        <BackButton onClick={() => navigate('/')}>←</BackButton>
        <HeaderTitle>Missions</HeaderTitle>
      </Header>

      {loading ? (
        <LoadingIndicator>
          <div className="loader"></div>
        </LoadingIndicator>
      ) : missions.length > 0 ? (
        <MissionsGrid>
          {dailyMissions.length > 0 && (
            <MissionSection>
              <SectionTitle>Daily Missions</SectionTitle>
              {dailyMissions.map(renderMissionCard)}
            </MissionSection>
          )}
          
          {weeklyMissions.length > 0 && (
            <MissionSection>
              <SectionTitle>Weekly Missions</SectionTitle>
              {weeklyMissions.map(renderMissionCard)}
            </MissionSection>
          )}
          
          {specialMissions.length > 0 && (
            <MissionSection>
              <SectionTitle>Special Missions</SectionTitle>
              {specialMissions.map(renderMissionCard)}
            </MissionSection>
          )}
        </MissionsGrid>
      ) : (
        <NoMissions>
          <NoMissionsText>No missions available</NoMissionsText>
        </NoMissions>
      )}
    </MissionContainer>
  );
};

export default MissionPage;
