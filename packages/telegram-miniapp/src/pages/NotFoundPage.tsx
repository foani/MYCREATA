import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTelegram } from '../hooks/useTelegram';

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 24px;
  text-align: center;
`;

const ErrorCode = styled.h1`
  font-size: 72px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--button-color, #3E96FF);
`;

const ErrorTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const ErrorMessage = styled.p`
  font-size: 16px;
  opacity: 0.8;
  margin-bottom: 32px;
  max-width: 300px;
`;

const HomeButton = styled.button`
  background-color: var(--button-color, #3E96FF);
  color: var(--button-text-color, #FFFFFF);
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
`;

/**
 * 404 페이지 컴포넌트
 * 존재하지 않는 페이지에 접근했을 때 표시됩니다.
 */
const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { setupMainButton, hapticFeedback, setupBackButton } = useTelegram();

  // 백버튼 설정
  useEffect(() => {
    setupBackButton(true, () => {
      navigate('/');
    });

    // 메인 버튼 설정
    setupMainButton('Go to Home', () => {
      hapticFeedback('impact', 'medium');
      navigate('/');
    });

    return () => {
      // 페이지 이탈 시 버튼 리셋
      setupBackButton(false);
      setupMainButton('', () => {}, { isVisible: false });
    };
  }, [setupMainButton, setupBackButton, hapticFeedback, navigate]);

  return (
    <NotFoundContainer>
      <ErrorCode>404</ErrorCode>
      <ErrorTitle>Page Not Found</ErrorTitle>
      <ErrorMessage>
        Sorry, we couldn't find the page you're looking for.
      </ErrorMessage>
      <HomeButton onClick={() => navigate('/')}>
        Back to Home
      </HomeButton>
    </NotFoundContainer>
  );
};

export default NotFoundPage;
