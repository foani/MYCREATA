import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/app';
import { logger } from '../utils/logging';

/**
 * Google 서비스 클래스
 * Google OAuth 토큰 검증을 담당합니다.
 */
class GoogleService {
  private client: OAuth2Client;
  
  constructor() {
    const clientId = config.google.clientId;
    
    if (!clientId) {
      logger.warn('Google client ID not set - Google authentication will not work correctly');
    }
    
    this.client = new OAuth2Client(clientId);
  }
  
  /**
   * Google ID 토큰 검증
   * 
   * @param idToken Google에서 제공하는 ID 토큰
   * @returns 검증된 페이로드 또는 null (검증 실패)
   */
  async verifyIdToken(idToken: string): Promise<any | null> {
    try {
      // 개발 환경에서 검증 우회 (선택 사항)
      if (process.env.NODE_ENV === 'development' && process.env.SKIP_GOOGLE_VERIFY === 'true') {
        logger.warn('Bypassing Google verification in development mode');
        
        // 테스트용 페이로드 반환
        return {
          sub: 'test_google_id',
          email: 'test@example.com',
          email_verified: true,
          name: 'Test User',
          given_name: 'Test',
          family_name: 'User',
          picture: 'https://example.com/profile.jpg',
        };
      }
      
      // Google 클라이언트 ID가 설정되지 않은 경우
      if (!config.google.clientId) {
        logger.error('Google client ID not set - cannot verify token');
        return null;
      }
      
      // 토큰 검증
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: config.google.clientId,
      });
      
      // 페이로드 추출
      const payload = ticket.getPayload();
      
      // 필수 필드 확인
      if (!payload || !payload.sub) {
        logger.warn('Invalid Google ID token payload');
        return null;
      }
      
      return payload;
    } catch (error) {
      logger.error('Error verifying Google ID token:', error);
      return null;
    }
  }
}

// 싱글톤 인스턴스 생성
export const googleService = new GoogleService();
