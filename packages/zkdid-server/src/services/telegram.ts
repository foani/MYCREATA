import crypto from 'crypto';
import { config } from '../config/app';
import { logger } from '../utils/logging';

/**
 * Telegram 사용자 인터페이스
 */
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

/**
 * Telegram initData 파싱 결과 인터페이스
 */
interface TelegramInitData {
  query_id?: string;
  user?: TelegramUser;
  auth_date: number;
  hash: string;
  [key: string]: any;
}

/**
 * Telegram 서비스 클래스
 * Telegram WebApp SDK 데이터 검증을 담당합니다.
 */
class TelegramService {
  private botToken: string;
  
  constructor() {
    this.botToken = config.telegram.botToken;
    
    if (!this.botToken) {
      logger.warn('Telegram bot token not set - Telegram authentication will not work correctly');
    }
  }
  
  /**
   * Telegram initData 문자열 파싱
   * 
   * @param initData Telegram WebApp에서 제공하는 initData 문자열
   * @returns 파싱된 데이터 객체
   */
  private parseInitData(initData: string): TelegramInitData {
    try {
      const data: TelegramInitData = {
        auth_date: 0,
        hash: '',
      };
      
      // URL 인코딩된 쿼리 문자열 파싱
      const params = new URLSearchParams(initData);
      
      // 각 파라미터 추출
      for (const [key, value] of params.entries()) {
        if (key === 'user') {
          // user는 JSON 문자열로 전달됨
          data.user = JSON.parse(value);
        } else {
          // 나머지 필드는 그대로 설정
          data[key] = key === 'auth_date' ? parseInt(value, 10) : value;
        }
      }
      
      return data;
    } catch (error) {
      logger.error('Error parsing Telegram initData:', error);
      throw new Error('Failed to parse Telegram initData');
    }
  }
  
  /**
   * 데이터 해시 검증
   * 
   * @param data 검증할 데이터 객체
   * @returns 검증 결과
   */
  private validateHash(data: TelegramInitData): boolean {
    try {
      // 봇 토큰이 설정되지 않은 경우
      if (!this.botToken) {
        logger.error('Telegram bot token not set - cannot validate hash');
        return false;
      }
      
      // 해시 분리
      const { hash, ...dataWithoutHash } = data;
      
      // 데이터 정렬 및 체크 문자열 생성
      const checkString = Object.keys(dataWithoutHash)
        .sort()
        .map(key => `${key}=${dataWithoutHash[key]}`)
        .join('\n');
      
      // 시크릿 키 생성 (SHA-256 해시)
      const secretKey = crypto
        .createHash('sha256')
        .update(this.botToken)
        .digest();
      
      // HMAC-SHA-256 서명 계산
      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(checkString)
        .digest('hex');
      
      // 서명 일치 여부 확인
      return signature === hash;
    } catch (error) {
      logger.error('Error validating Telegram hash:', error);
      return false;
    }
  }
  
  /**
   * 인증 데이터 유효 시간 검증 (최대 24시간)
   * 
   * @param authDate 인증 시간 타임스탬프
   * @returns 유효 여부
   */
  private validateAuthDate(authDate: number): boolean {
    const now = Math.floor(Date.now() / 1000);
    const maxAge = 24 * 60 * 60; // 24시간
    
    return now - authDate < maxAge;
  }
  
  /**
   * initData 검증
   * 
   * @param initData Telegram WebApp에서 제공하는 initData 문자열
   * @returns 검증된 데이터 또는 null (검증 실패)
   */
  async verifyInitData(initData: string): Promise<TelegramInitData | null> {
    try {
      // 개발 환경에서 검증 우회 (선택 사항)
      if (process.env.NODE_ENV === 'development' && process.env.SKIP_TELEGRAM_VERIFY === 'true') {
        logger.warn('Bypassing Telegram verification in development mode');
        
        try {
          return this.parseInitData(initData);
        } catch (e) {
          logger.error('Failed to parse initData in bypass mode:', e);
          return null;
        }
      }
      
      // 데이터 파싱
      const data = this.parseInitData(initData);
      
      // 필수 필드 확인
      if (!data.hash || !data.auth_date) {
        logger.warn('Missing required fields in Telegram initData');
        return null;
      }
      
      // 해시 검증
      if (!this.validateHash(data)) {
        logger.warn('Invalid Telegram data hash');
        return null;
      }
      
      // 인증 시간 검증
      if (!this.validateAuthDate(data.auth_date)) {
        logger.warn('Telegram auth_date expired');
        return null;
      }
      
      return data;
    } catch (error) {
      logger.error('Error verifying Telegram initData:', error);
      return null;
    }
  }
}

// 싱글톤 인스턴스 생성
export const telegramService = new TelegramService();
