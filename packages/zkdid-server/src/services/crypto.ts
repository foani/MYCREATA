import crypto from 'crypto';
import { ethers } from 'ethers';
import { logger } from '../utils/logging';

/**
 * 암호화 서비스 클래스
 * 암호화, 복호화, 서명 검증 등의 암호화 관련 기능을 제공합니다.
 */
class CryptoService {
  /**
   * AES-256 암호화
   * 
   * @param text 암호화할 텍스트
   * @param key 암호화 키
   * @returns 암호화된 텍스트 (Base64 형식)
   */
  encrypt(text: string, key: string): string {
    try {
      // 키에서 해시 생성 (32바이트)
      const hash = crypto.createHash('sha256').update(key).digest();
      
      // 초기화 벡터 생성 (16바이트)
      const iv = crypto.randomBytes(16);
      
      // 암호화 객체 생성
      const cipher = crypto.createCipheriv('aes-256-cbc', hash, iv);
      
      // 암호화 수행
      let encrypted = cipher.update(text, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      
      // IV와 암호화된 텍스트 합치기
      return `${iv.toString('base64')}:${encrypted}`;
    } catch (error) {
      logger.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }
  
  /**
   * AES-256 복호화
   * 
   * @param encryptedText 암호화된 텍스트 (Base64 형식)
   * @param key 암호화 키
   * @returns 복호화된 텍스트
   */
  decrypt(encryptedText: string, key: string): string {
    try {
      // IV와 암호화된 텍스트 분리
      const [ivBase64, encrypted] = encryptedText.split(':');
      
      // 키에서 해시 생성 (32바이트)
      const hash = crypto.createHash('sha256').update(key).digest();
      
      // IV 복원
      const iv = Buffer.from(ivBase64, 'base64');
      
      // 복호화 객체 생성
      const decipher = crypto.createDecipheriv('aes-256-cbc', hash, iv);
      
      // 복호화 수행
      let decrypted = decipher.update(encrypted, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      logger.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }
  
  /**
   * SHA-256 해시 생성
   * 
   * @param data 해시할 데이터
   * @returns 해시값 (Hex 형식)
   */
  createHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
  
  /**
   * 지갑 주소의 서명 검증
   * 
   * @param address 이더리움 주소
   * @param message 원본 메시지
   * @param signature 서명
   * @returns 검증 결과
   */
  async verifyWalletSignature(address: string, message: string, signature: string): Promise<boolean> {
    try {
      // 서명을 통해 주소 복구
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      // 대소문자 구분 없이 주소 비교
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      logger.error('Signature verification error:', error);
      return false;
    }
  }
  
  /**
   * 안전한 랜덤 토큰 생성
   * 
   * @param length 토큰 길이 (바이트 단위)
   * @returns 랜덤 토큰 (Hex 형식)
   */
  generateRandomToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}

// 싱글톤 인스턴스 생성
export const cryptoService = new CryptoService();
