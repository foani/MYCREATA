/**
 * DIDService
 * DID(Decentralized Identifier) 관련 기능 제공 서비스
 * DID 인증, 지갑 연동, 복구 등 기능을 담당합니다.
 */

import { StorageService } from './storage.service';

// DID 유형 열거형
export enum DIDType {
  TELEGRAM = 'telegram',
  GOOGLE = 'google',
  EMAIL = 'email'
}

// DID 정보 인터페이스
export interface DIDInfo {
  id: string;
  type: DIDType;
  did: string;
  address: string;
  createdAt: number;
  lastUsed: number;
  alias?: string;
}

export class DIDService {
  private didInfos: DIDInfo[] = [];
  
  constructor(private storageService: StorageService) {
    this.loadDIDInfos();
  }
  
  /**
   * DID 정보 로드
   */
  private async loadDIDInfos(): Promise<void> {
    try {
      const storedDIDs = await this.storageService.getItem<DIDInfo[]>('didInfos');
      if (storedDIDs) {
        this.didInfos = storedDIDs;
      }
    } catch (error) {
      console.error('DID 정보 로드 중 오류:', error);
    }
  }
  
  /**
   * DID 정보 저장
   */
  private async saveDIDInfos(): Promise<void> {
    try {
      await this.storageService.setItem('didInfos', this.didInfos);
    } catch (error) {
      console.error('DID 정보 저장 중 오류:', error);
      throw error;
    }
  }
  
  /**
   * DID 생성
   * @param type DID 유형
   * @param credential 인증 정보
   * @param address 연결할 지갑 주소
   * @returns 생성된 DID
   */
  public async createDID(type: DIDType, credential: any, address: string): Promise<string> {
    try {
      // API 서버로 DID 발급 요청
      // 실제 구현에서는 zkDID 인증 서버에 요청
      // 임시 구현:
      const did = `did:creata:zk${type}:${Math.random().toString(36).substring(2, 10)}`;
      
      // DID 정보 저장
      const didInfo: DIDInfo = {
        id: Math.random().toString(36).substring(2, 10),
        type,
        did,
        address,
        createdAt: Date.now(),
        lastUsed: Date.now()
      };
      
      this.didInfos.push(didInfo);
      await this.saveDIDInfos();
      
      return did;
    } catch (error) {
      console.error('DID 생성 중 오류:', error);
      throw error;
    }
  }
  
  /**
   * DID 확인
   * @param type DID 유형
   * @param credential 인증 정보
   * @returns DID 정보 또는 null
   */
  public async verifyDID(type: DIDType, credential: any): Promise<DIDInfo | null> {
    try {
      // API 서버로 DID 확인 요청
      // 실제 구현에서는 zkDID 인증 서버에 요청
      // 임시 구현:
      
      // 간단한 검증 (실제 구현에서는 서버 측 검증 필요)
      if (!credential) {
        throw new Error('유효하지 않은 인증 정보입니다.');
      }
      
      // 유형에 따른 검증
      switch (type) {
        case DIDType.TELEGRAM:
          // Telegram initData 유효성 검증
          break;
          
        case DIDType.GOOGLE:
          // Google 토큰 유효성 검증
          break;
          
        case DIDType.EMAIL:
          // 이메일 인증 코드 검증
          break;
          
        default:
          throw new Error('지원하지 않는 DID 유형입니다.');
      }
      
      // DID 정보 조회
      let didInfo = this.didInfos.find(info => info.type === type);
      
      // DID 정보가 없으면 null 반환
      if (!didInfo) {
        return null;
      }
      
      // 마지막 사용 시간 업데이트
      didInfo.lastUsed = Date.now();
      await this.saveDIDInfos();
      
      return didInfo;
    } catch (error) {
      console.error('DID 확인 중 오류:', error);
      throw error;
    }
  }
  
  /**
   * DID로 니모닉 복구
   * @param type DID 유형
   * @param credential 인증 정보
   * @param pin 개인 PIN 코드
   * @returns 복구된 니모닉
   */
  public async getMnemonicFromDID(type: DIDType, credential: any, pin: string): Promise<string> {
    try {
      // DID 확인
      const didInfo = await this.verifyDID(type, credential);
      if (!didInfo) {
        throw new Error('등록된 DID가 없습니다.');
      }
      
      // API 서버로 니모닉 복구 요청
      // 실제 구현에서는 zkDID 인증 서버에 요청
      // 임시 구현:
      
      // PIN 코드 검증 (실제 구현에서는 서버 측 검증 필요)
      if (!pin || pin.length < 4) {
        throw new Error('유효하지 않은 PIN 코드입니다.');
      }
      
      // 복구된 니모닉 반환 (실제 구현에서는 서버에서 반환)
      return 'test test test test test test test test test test test junk';
    } catch (error) {
      console.error('DID로 니모닉 복구 중 오류:', error);
      throw error;
    }
  }
  
  /**
   * DID 목록 조회
   * @returns DID 정보 목록
   */
  public async getDIDs(): Promise<DIDInfo[]> {
    return this.didInfos;
  }
  
  /**
   * DID ID로 DID 정보 조회
   * @param id DID ID
   * @returns DID 정보 또는 undefined
   */
  public async getDIDById(id: string): Promise<DIDInfo | undefined> {
    return this.didInfos.find(info => info.id === id);
  }
  
  /**
   * DID 별칭 설정
   * @param id DID ID
   * @param alias 설정할 별칭
   */
  public async setDIDAlias(id: string, alias: string): Promise<void> {
    const didInfo = this.didInfos.find(info => info.id === id);
    if (!didInfo) {
      throw new Error('존재하지 않는 DID입니다.');
    }
    
    didInfo.alias = alias;
    await this.saveDIDInfos();
  }
  
  /**
   * DID 삭제
   * @param id 삭제할 DID ID
   */
  public async deleteDID(id: string): Promise<void> {
    const index = this.didInfos.findIndex(info => info.id === id);
    if (index === -1) {
      throw new Error('존재하지 않는 DID입니다.');
    }
    
    this.didInfos.splice(index, 1);
    await this.saveDIDInfos();
  }
  
  /**
   * DID 로그 추가
   * @param didId DID ID
   * @param action 수행된 작업
   * @param details 추가 정보
   */
  public async addDIDLog(didId: string, action: string, details?: any): Promise<void> {
    try {
      const didInfo = this.didInfos.find(info => info.id === didId);
      if (!didInfo) {
        throw new Error('존재하지 않는 DID입니다.');
      }
      
      // DID 로그 저장
      const logs = await this.storageService.getItem<any[]>(`didLogs_${didId}`) || [];
      
      logs.push({
        timestamp: Date.now(),
        action,
        details
      });
      
      // 최대 100개까지만 저장
      if (logs.length > 100) {
        logs.shift();
      }
      
      await this.storageService.setItem(`didLogs_${didId}`, logs);
    } catch (error) {
      console.error('DID 로그 추가 중 오류:', error);
      // 로그 추가 실패는 크리티컬한 오류가 아니므로 에러를 던지지 않음
    }
  }
  
  /**
   * DID 로그 조회
   * @param didId DID ID
   * @returns DID 로그 목록
   */
  public async getDIDLogs(didId: string): Promise<any[]> {
    try {
      const logs = await this.storageService.getItem<any[]>(`didLogs_${didId}`);
      return logs || [];
    } catch (error) {
      console.error('DID 로그 조회 중 오류:', error);
      return [];
    }
  }
  
  /**
   * DID 주소로 DID 조회
   * @param address 지갑 주소
   * @returns DID 정보 또는 undefined
   */
  public async getDIDByAddress(address: string): Promise<DIDInfo | undefined> {
    return this.didInfos.find(info => info.address.toLowerCase() === address.toLowerCase());
  }
  
  /**
   * DID 계정 주소 업데이트
   * @param id DID ID
   * @param address 새 지갑 주소
   */
  public async updateDIDAddress(id: string, address: string): Promise<void> {
    const didInfo = this.didInfos.find(info => info.id === id);
    if (!didInfo) {
      throw new Error('존재하지 않는 DID입니다.');
    }
    
    didInfo.address = address;
    await this.saveDIDInfos();
  }
}