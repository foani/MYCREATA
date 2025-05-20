import crypto from 'crypto';
import { ethers } from 'ethers';
import { Types } from 'mongoose';
import { IDID } from '../models/did.model';
import { config } from '../config/app';
import { logger } from '../utils/logging';

/**
 * DID 생성 매개변수 인터페이스
 */
interface GenerateDIDParams {
  method: 'zktg' | 'zkgg' | 'zkem';
  telegramId?: string;
  googleId?: string;
  userId: Types.ObjectId;
}

/**
 * DID 생성 결과 인터페이스
 */
interface GenerateDIDResult {
  did: string;
  publicKey: string;
  privateKey?: string;
  proofValue?: string;
}

/**
 * 서명 검증 결과 인터페이스
 */
interface VerificationResult {
  isValid: boolean;
  method?: string;
  error?: string;
}

/**
 * zkDID 서비스 클래스
 * zkSNARK 기반 DID 관리를 담당합니다.
 */
class ZkDIDService {
  /**
   * DID 생성
   * 
   * @param params 생성 매개변수
   * @returns 생성된 DID 정보
   */
  async generateDID(params: GenerateDIDParams): Promise<GenerateDIDResult> {
    try {
      // 메서드에 따라 다른 생성 로직 적용
      switch (params.method) {
        case 'zktg':
          return this.generateTelegramDID(params);
        case 'zkgg':
          return this.generateGoogleDID(params);
        case 'zkem':
          return this.generateEmailDID(params);
        default:
          throw new Error(`Unsupported DID method: ${params.method}`);
      }
    } catch (error) {
      logger.error('Error generating DID:', error);
      throw new Error('Failed to generate DID');
    }
  }
  
  /**
   * Telegram 기반 DID 생성
   * 
   * @param params 생성 매개변수
   * @returns 생성된 DID 정보
   */
  private async generateTelegramDID(params: GenerateDIDParams): Promise<GenerateDIDResult> {
    try {
      if (!params.telegramId) {
        throw new Error('Telegram ID is required for zktg method');
      }
      
      // 랜덤 키페어 생성
      const wallet = ethers.Wallet.createRandom();
      
      // DID 식별자 생성
      const idFragment = crypto
        .createHash('sha256')
        .update(`tg:${params.telegramId}:${params.userId.toString()}:${Date.now()}`)
        .digest('hex')
        .substring(0, 16);
      
      // proof value 생성 (실제로는 zkSNARK 증명이 필요)
      const proofValue = crypto
        .createHash('sha256')
        .update(`${params.telegramId}:${wallet.privateKey}`)
        .digest('hex');
      
      return {
        did: `${config.zkdid.prefix}:zktg:${idFragment}`,
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey,
        proofValue,
      };
    } catch (error) {
      logger.error('Error generating Telegram DID:', error);
      throw new Error('Failed to generate Telegram DID');
    }
  }
  
  /**
   * Google 기반 DID 생성
   * 
   * @param params 생성 매개변수
   * @returns 생성된 DID 정보
   */
  private async generateGoogleDID(params: GenerateDIDParams): Promise<GenerateDIDResult> {
    try {
      if (!params.googleId) {
        throw new Error('Google ID is required for zkgg method');
      }
      
      // 랜덤 키페어 생성
      const wallet = ethers.Wallet.createRandom();
      
      // DID 식별자 생성
      const idFragment = crypto
        .createHash('sha256')
        .update(`gg:${params.googleId}:${params.userId.toString()}:${Date.now()}`)
        .digest('hex')
        .substring(0, 16);
      
      // proof value 생성 (실제로는 zkSNARK 증명이 필요)
      const proofValue = crypto
        .createHash('sha256')
        .update(`${params.googleId}:${wallet.privateKey}`)
        .digest('hex');
      
      return {
        did: `${config.zkdid.prefix}:zkgg:${idFragment}`,
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey,
        proofValue,
      };
    } catch (error) {
      logger.error('Error generating Google DID:', error);
      throw new Error('Failed to generate Google DID');
    }
  }
  
  /**
   * 이메일 기반 DID 생성
   * 
   * @param params 생성 매개변수
   * @returns 생성된 DID 정보
   */
  private async generateEmailDID(params: GenerateDIDParams): Promise<GenerateDIDResult> {
    // 이메일 기반 DID 생성 로직 (미구현)
    throw new Error('Email DID generation not implemented yet');
  }
  
  /**
   * DID 기반 서명 검증
   * 
   * @param did DID 문서
   * @param message 원본 메시지
   * @param signature 서명
   * @returns 검증 결과
   */
  async verifySignature(did: IDID, message: string, signature: string): Promise<VerificationResult> {
    try {
      // 월렛 주소 기반 검증
      if (did.walletAddresses.length > 0) {
        try {
          // Ethereum 서명 복구
          const recoveredAddress = ethers.verifyMessage(message, signature);
          
          // 연결된 지갑 주소 확인
          const isValid = did.walletAddresses.includes(recoveredAddress.toLowerCase());
          
          if (isValid) {
            return {
              isValid: true,
              method: 'wallet',
            };
          }
        } catch (error) {
          logger.debug('Wallet signature verification failed:', error);
          // 다음 검증 메서드로 진행
        }
      }
      
      // TODO: zkSNARK 증명 검증
      // 실제 구현에서는 zkSNARK 증명 검증 로직이 필요
      
      // 모든 검증 실패
      return {
        isValid: false,
        error: 'Invalid signature or unsupported verification method',
      };
    } catch (error) {
      logger.error('Error verifying signature:', error);
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * DID 문서 포맷팅
   * W3C DID 표준에 맞게 DID 문서를 생성합니다.
   * 
   * @param did DID 모델
   * @returns DID 문서
   */
  formatDIDDocument(did: IDID): any {
    try {
      // 기본 DID 문서 구조
      const didDocument = {
        '@context': [
          'https://www.w3.org/ns/did/v1',
          'https://w3id.org/security/suites/ed25519-2020/v1',
        ],
        id: did.did,
        controller: did.did,
        verificationMethod: [
          {
            id: `${did.did}#keys-1`,
            type: 'Ed25519VerificationKey2020',
            controller: did.did,
            publicKeyMultibase: did.publicKey,
          },
        ],
        authentication: [`${did.did}#keys-1`],
        assertionMethod: [`${did.did}#keys-1`],
        created: did.createdAt.toISOString(),
        updated: did.updatedAt.toISOString(),
      };
      
      // 메서드 정보 추가
      const methodInfo: any = {
        method: did.method,
      };
      
      // 인증 제공자 정보 추가
      if (did.telegramId) {
        methodInfo.telegramId = did.telegramId;
      }
      
      if (did.googleId) {
        methodInfo.googleId = did.googleId;
      }
      
      // 별칭 추가
      if (did.alias) {
        methodInfo.alias = did.alias;
      }
      
      // 지갑 주소 추가
      if (did.walletAddresses && did.walletAddresses.length > 0) {
        const walletMethods = did.walletAddresses.map((address, index) => ({
          id: `${did.did}#wallet-${index + 1}`,
          type: 'EcdsaSecp256k1RecoveryMethod2020',
          controller: did.did,
          blockchainAccountId: `eip155:1:${address}`,
        }));
        
        // 검증 메서드 추가
        didDocument.verificationMethod = [
          ...didDocument.verificationMethod,
          ...walletMethods,
        ];
        
        // 지갑 인증 추가
        walletMethods.forEach(method => {
          didDocument.authentication.push(method.id);
        });
      }
      
      // 메타데이터 섹션 추가
      didDocument.metadata = methodInfo;
      
      return didDocument;
    } catch (error) {
      logger.error('Error formatting DID document:', error);
      throw new Error('Failed to format DID document');
    }
  }
}

// 싱글톤 인스턴스 생성
export const zkdidService = new ZkDIDService();
