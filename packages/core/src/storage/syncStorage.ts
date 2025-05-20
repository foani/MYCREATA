/**
 * syncStorage.ts
 * 
 * 다중 디바이스 간 데이터 동기화를 위한 스토리지 모듈.
 * 클라우드 백업 및 동기화 기능을 제공합니다.
 */

import { StorageError } from '../utils/errors';
import { LocalStoreInterface } from './localStore';
import { SecureStorageInterface } from './secureStorage';

export interface SyncConfig {
  provider: string;      // 'google_drive', 'icloud', 'dropbox' 등
  autoSync: boolean;     // 자동 동기화 여부
  syncInterval: number;  // 동기화 간격 (밀리초)
  encryptBackup: boolean; // 백업 암호화 여부
}

export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SYNCED = 'synced',
  ERROR = 'error'
}

export interface SyncResult {
  status: SyncStatus;
  timestamp: number;
  error?: string;
  details?: {
    uploaded: number;
    downloaded: number;
    conflicts: number;
  };
}

export interface CloudProviderInterface {
  /**
   * 인증 상태 확인
   */
  isAuthenticated(): Promise<boolean>;
  
  /**
   * 인증 (로그인)
   */
  authenticate(): Promise<boolean>;
  
  /**
   * 파일 업로드
   * @param path 경로
   * @param content 내용
   */
  uploadFile(path: string, content: string): Promise<void>;
  
  /**
   * 파일 다운로드
   * @param path 경로
   * @returns 파일 내용
   */
  downloadFile(path: string): Promise<string>;
  
  /**
   * 파일 삭제
   * @param path 경로
   */
  deleteFile(path: string): Promise<void>;
  
  /**
   * 파일 목록 조회
   * @param folder 폴더 경로
   * @returns 파일 목록
   */
  listFiles(folder: string): Promise<string[]>;
  
  /**
   * 파일 정보 조회
   * @param path 경로
   * @returns 파일 정보
   */
  getFileInfo(path: string): Promise<{
    path: string;
    size: number;
    lastModified: number;
  } | null>;
}

/**
 * 동기화 스토리지 클래스
 */
export class SyncStorage {
  private config: SyncConfig;
  private cloudProvider: CloudProviderInterface;
  private localStore: LocalStoreInterface;
  private secureStorage: SecureStorageInterface;
  private status: SyncStatus = SyncStatus.IDLE;
  private lastSyncTimestamp: number = 0;
  private syncTimer: any = null;
  
  /**
   * SyncStorage 생성자
   * @param cloudProvider 클라우드 제공자
   * @param localStore 로컬 스토리지
   * @param secureStorage 보안 스토리지
   * @param config 동기화 설정
   */
  constructor(
    cloudProvider: CloudProviderInterface,
    localStore: LocalStoreInterface,
    secureStorage: SecureStorageInterface,
    config: Partial<SyncConfig> = {}
  ) {
    this.cloudProvider = cloudProvider;
    this.localStore = localStore;
    this.secureStorage = secureStorage;
    this.config = {
      provider: 'google_drive',
      autoSync: false,
      syncInterval: 5 * 60 * 1000, // 5분
      encryptBackup: true,
      ...config
    };
    
    // 자동 동기화 설정
    if (this.config.autoSync) {
      this.startAutoSync();
    }
  }
  
  /**
   * 자동 동기화 시작
   */
  public startAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
    
    this.syncTimer = setInterval(async () => {
      await this.sync();
    }, this.config.syncInterval);
  }
  
  /**
   * 자동 동기화 중지
   */
  public stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }
  
  /**
   * 동기화 설정 업데이트
   * @param newConfig 새 설정
   */
  public updateConfig(newConfig: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // 자동 동기화 설정 변경 시 처리
    if (newConfig.hasOwnProperty('autoSync') || newConfig.hasOwnProperty('syncInterval')) {
      if (this.config.autoSync) {
        this.startAutoSync();
      } else {
        this.stopAutoSync();
      }
    }
  }
  
  /**
   * 동기화 실행
   * @returns 동기화 결과
   */
  public async sync(): Promise<SyncResult> {
    if (this.status === SyncStatus.SYNCING) {
      return {
        status: SyncStatus.SYNCING,
        timestamp: this.lastSyncTimestamp,
        details: {
          uploaded: 0,
          downloaded: 0,
          conflicts: 0
        }
      };
    }
    
    this.status = SyncStatus.SYNCING;
    
    try {
      // 인증 상태 확인
      const isAuthenticated = await this.cloudProvider.isAuthenticated();
      if (!isAuthenticated) {
        const authSuccess = await this.cloudProvider.authenticate();
        if (!authSuccess) {
          throw new StorageError('Failed to authenticate with cloud provider');
        }
      }
      
      // 백업 메타데이터 확인
      const localMeta = await this.getLocalMetadata();
      const cloudMeta = await this.getCloudMetadata();
      
      // 업로드 및 다운로드 항목 결정
      const { toUpload, toDownload, conflicts } = this.resolveChanges(localMeta, cloudMeta);
      
      // 충돌 해결
      const resolvedConflicts = await this.resolveConflicts(conflicts);
      
      // 다운로드 진행
      let downloadCount = 0;
      for (const key of toDownload) {
        await this.downloadItem(key);
        downloadCount++;
      }
      
      // 업로드 진행
      let uploadCount = 0;
      for (const key of toUpload) {
        await this.uploadItem(key);
        uploadCount++;
      }
      
      // 해결된 충돌 처리
      for (const { key, resolution } of resolvedConflicts) {
        if (resolution === 'upload') {
          await this.uploadItem(key);
          uploadCount++;
        } else if (resolution === 'download') {
          await this.downloadItem(key);
          downloadCount++;
        }
      }
      
      // 메타데이터 업데이트
      await this.updateSyncMetadata();
      
      // 동기화 완료
      this.status = SyncStatus.SYNCED;
      this.lastSyncTimestamp = Date.now();
      
      return {
        status: SyncStatus.SYNCED,
        timestamp: this.lastSyncTimestamp,
        details: {
          uploaded: uploadCount,
          downloaded: downloadCount,
          conflicts: resolvedConflicts.length
        }
      };
    } catch (error: any) {
      this.status = SyncStatus.ERROR;
      
      return {
        status: SyncStatus.ERROR,
        timestamp: Date.now(),
        error: error.message || 'Sync failed',
        details: {
          uploaded: 0,
          downloaded: 0,
          conflicts: 0
        }
      };
    }
  }
  
  /**
   * 로컬 메타데이터 조회
   * @returns 로컬 메타데이터
   */
  private async getLocalMetadata(): Promise<Record<string, number>> {
    const meta = await this.localStore.getItem<Record<string, number>>('sync.metadata', {});
    return meta;
  }
  
  /**
   * 클라우드 메타데이터 조회
   * @returns 클라우드 메타데이터
   */
  private async getCloudMetadata(): Promise<Record<string, number>> {
    try {
      const metaContent = await this.cloudProvider.downloadFile('sync.metadata.json');
      return JSON.parse(metaContent);
    } catch (error) {
      // 메타데이터 파일이 없거나 다운로드 실패 시 빈 객체 반환
      return {};
    }
  }
  
  /**
   * 변경사항 비교 및 해결
   * @param localMeta 로컬 메타데이터
   * @param cloudMeta 클라우드 메타데이터
   * @returns 업로드/다운로드/충돌 항목
   */
  private resolveChanges(
    localMeta: Record<string, number>,
    cloudMeta: Record<string, number>
  ): {
    toUpload: string[];
    toDownload: string[];
    conflicts: string[];
  } {
    const toUpload: string[] = [];
    const toDownload: string[] = [];
    const conflicts: string[] = [];
    
    // 로컬 항목 검사
    for (const key in localMeta) {
      if (!cloudMeta[key]) {
        // 클라우드에 없는 항목은 업로드
        toUpload.push(key);
      } else if (localMeta[key] > cloudMeta[key]) {
        // 로컬이 더 최신이면 업로드
        toUpload.push(key);
      } else if (localMeta[key] < cloudMeta[key]) {
        // 클라우드가 더 최신이면 다운로드
        toDownload.push(key);
      } else if (localMeta[key] !== cloudMeta[key]) {
        // 타임스탬프가 다르면 충돌
        conflicts.push(key);
      }
    }
    
    // 클라우드 항목 검사 (로컬에 없는 항목)
    for (const key in cloudMeta) {
      if (!localMeta[key]) {
        // 로컬에 없는 항목은 다운로드
        toDownload.push(key);
      }
    }
    
    return { toUpload, toDownload, conflicts };
  }
  
  /**
   * 충돌 해결
   * @param conflicts 충돌 항목
   * @returns 해결된 충돌
   */
  private async resolveConflicts(
    conflicts: string[]
  ): Promise<Array<{ key: string; resolution: 'upload' | 'download' | 'skip' }>> {
    // 실제 구현에서는 충돌 해결 정책에 따라 처리
    // 여기서는 간단히 '최신 파일 우선' 정책 사용
    const resolved: Array<{ key: string; resolution: 'upload' | 'download' | 'skip' }> = [];
    
    for (const key of conflicts) {
      // 충돌 해결 로직 (여기서는 항상 '다운로드' 선택)
      resolved.push({ key, resolution: 'download' });
    }
    
    return resolved;
  }
  
  /**
   * 항목 다운로드
   * @param key 키
   */
  private async downloadItem(key: string): Promise<void> {
    // 보안 설정에 따라 특정 키는 별도 처리
    if (key.startsWith('secure.')) {
      await this.downloadSecureItem(key);
    } else {
      // 일반 항목 다운로드
      const content = await this.cloudProvider.downloadFile(`${key}.json`);
      const data = JSON.parse(content);
      await this.localStore.setItem(key, data);
    }
  }
  
  /**
   * 보안 항목 다운로드
   * @param key 키
   */
  private async downloadSecureItem(key: string): Promise<void> {
    const secureKey = key.substring(7); // 'secure.' 제거
    const content = await this.cloudProvider.downloadFile(`${key}.enc`);
    
    // 암호화된 경우 복호화
    if (this.config.encryptBackup) {
      // 복호화 키 가져오기
      const encryptionKey = await this.secureStorage.getItem('sync.encryptionKey');
      
      // 실제 구현에서는 적절한 복호화 로직 필요
      const decryptedContent = this.mockDecrypt(content, encryptionKey);
      
      await this.secureStorage.setItem(secureKey, decryptedContent);
    } else {
      await this.secureStorage.setItem(secureKey, content);
    }
  }
  
  /**
   * 항목 업로드
   * @param key 키
   */
  private async uploadItem(key: string): Promise<void> {
    // 보안 설정에 따라 특정 키는 별도 처리
    if (key.startsWith('secure.')) {
      await this.uploadSecureItem(key);
    } else {
      // 일반 항목 업로드
      const data = await this.localStore.getItem(key);
      const content = JSON.stringify(data);
      await this.cloudProvider.uploadFile(`${key}.json`, content);
    }
  }
  
  /**
   * 보안 항목 업로드
   * @param key 키
   */
  private async uploadSecureItem(key: string): Promise<void> {
    const secureKey = key.substring(7); // 'secure.' 제거
    const content = await this.secureStorage.getItem(secureKey);
    
    // 암호화 설정이 켜져 있는 경우 암호화
    if (this.config.encryptBackup) {
      // 암호화 키 가져오기 또는 생성
      let encryptionKey: string;
      try {
        encryptionKey = await this.secureStorage.getItem('sync.encryptionKey');
      } catch (error) {
        // 키가 없으면 생성
        encryptionKey = this.generateEncryptionKey();
        await this.secureStorage.setItem('sync.encryptionKey', encryptionKey);
      }
      
      // 실제 구현에서는 적절한 암호화 로직 필요
      const encryptedContent = this.mockEncrypt(content, encryptionKey);
      
      await this.cloudProvider.uploadFile(`${key}.enc`, encryptedContent);
    } else {
      await this.cloudProvider.uploadFile(`${key}.enc`, content);
    }
  }
  
  /**
   * 동기화 메타데이터 업데이트
   */
  private async updateSyncMetadata(): Promise<void> {
    const timestamp = Date.now();
    const localMeta = await this.localStore.getItem<Record<string, number>>('sync.metadata', {});
    
    // 로컬 스토리지의 모든 키 확인
    const allItems = new Set<string>();
    
    // 보안 스토리지 항목 추가 (실제 구현에서는 적절한 방법으로 키 목록 가져와야 함)
    // 현재는 모의 구현으로 기존 메타데이터 활용
    
    // 모든 항목의 타임스탬프 업데이트
    const updatedMeta: Record<string, number> = {};
    for (const key of allItems) {
      updatedMeta[key] = timestamp;
    }
    
    // 메타데이터 저장
    await this.localStore.setItem('sync.metadata', updatedMeta);
    
    // 클라우드에도 메타데이터 업로드
    await this.cloudProvider.uploadFile('sync.metadata.json', JSON.stringify(updatedMeta));
  }
  
  /**
   * 암호화 키 생성 (모의 구현)
   * @returns 암호화 키
   */
  private generateEncryptionKey(): string {
    // 실제 구현에서는 안전한 방식으로 키 생성
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }
  
  /**
   * 모의 암호화 (실제 구현 필요)
   * @param content 원본 내용
   * @param key 암호화 키
   * @returns 암호화된 내용
   */
  private mockEncrypt(content: string, key: string): string {
    // 실제 구현에서는 적절한 암호화 알고리즘 사용
    return content + '.encrypted';
  }
  
  /**
   * 모의 복호화 (실제 구현 필요)
   * @param encryptedContent 암호화된 내용
   * @param key 암호화 키
   * @returns 복호화된 내용
   */
  private mockDecrypt(encryptedContent: string, key: string): string {
    // 실제 구현에서는 적절한 복호화 알고리즘 사용
    return encryptedContent.replace('.encrypted', '');
  }
  
  /**
   * 전체 백업 생성
   * @returns 백업 성공 여부
   */
  public async createFullBackup(): Promise<boolean> {
    try {
      // 인증 상태 확인
      const isAuthenticated = await this.cloudProvider.isAuthenticated();
      if (!isAuthenticated) {
        const authSuccess = await this.cloudProvider.authenticate();
        if (!authSuccess) {
          throw new StorageError('Failed to authenticate with cloud provider');
        }
      }
      
      // 모든 로컬 데이터 수집
      const allData = await this.collectAllData();
      
      // 백업 파일 생성
      const backupData = {
        version: '1.0',
        timestamp: Date.now(),
        data: allData
      };
      
      // 백업 데이터 직렬화
      let backupContent = JSON.stringify(backupData);
      
      // 백업 암호화 (설정에 따라)
      if (this.config.encryptBackup) {
        let encryptionKey: string;
        try {
          encryptionKey = await this.secureStorage.getItem('sync.encryptionKey');
        } catch (error) {
          encryptionKey = this.generateEncryptionKey();
          await this.secureStorage.setItem('sync.encryptionKey', encryptionKey);
        }
        
        backupContent = this.mockEncrypt(backupContent, encryptionKey);
      }
      
      // 백업 파일 업로드
      const backupFileName = `crelink_backup_${Date.now()}.json`;
      await this.cloudProvider.uploadFile(backupFileName, backupContent);
      
      // 성공
      return true;
    } catch (error) {
      console.error('Full backup failed:', error);
      return false;
    }
  }
  
  /**
   * 모든 데이터 수집
   * @returns 수집된 데이터
   */
  private async collectAllData(): Promise<any> {
    // 실제 구현에서는 모든 데이터 수집 로직 필요
    // 여기서는 샘플 데이터 반환
    return {
      settings: {
        theme: 'dark',
        language: 'ko'
      },
      accounts: [
        {
          address: '0x1234567890abcdef1234567890abcdef12345678',
          name: 'Account 1'
        }
      ]
    };
  }
  
  /**
   * 백업 복원
   * @param backupFilePath 백업 파일 경로
   * @param encryptionKey 암호화 키 (암호화된 백업의 경우)
   * @returns 복원 성공 여부
   */
  public async restoreFromBackup(backupFilePath: string, encryptionKey?: string): Promise<boolean> {
    try {
      // 인증 상태 확인
      const isAuthenticated = await this.cloudProvider.isAuthenticated();
      if (!isAuthenticated) {
        const authSuccess = await this.cloudProvider.authenticate();
        if (!authSuccess) {
          throw new StorageError('Failed to authenticate with cloud provider');
        }
      }
      
      // 백업 파일 다운로드
      let backupContent = await this.cloudProvider.downloadFile(backupFilePath);
      
      // 백업 복호화 (필요 시)
      if (backupContent.endsWith('.encrypted')) {
        if (!encryptionKey) {
          // 키가 없으면 저장된 키 사용 시도
          try {
            encryptionKey = await this.secureStorage.getItem('sync.encryptionKey');
          } catch (error) {
            throw new StorageError('Encryption key required for encrypted backup');
          }
        }
        
        backupContent = this.mockDecrypt(backupContent, encryptionKey);
      }
      
      // 백업 데이터 파싱
      const backupData = JSON.parse(backupContent);
      
      // 데이터 복원
      await this.restoreData(backupData.data);
      
      // 성공
      return true;
    } catch (error) {
      console.error('Restore from backup failed:', error);
      return false;
    }
  }
  
  /**
   * 데이터 복원
   * @param data 복원할 데이터
   */
  private async restoreData(data: any): Promise<void> {
    // 실제 구현에서는 적절한 복원 로직 필요
    if (data.settings) {
      await this.localStore.setItem('settings', data.settings);
    }
    
    if (data.accounts) {
      await this.localStore.setItem('accounts', data.accounts);
    }
    
    // 필요한 경우 보안 데이터도 복원
    // ...
  }
  
  /**
   * 현재 동기화 상태 조회
   * @returns 동기화 상태
   */
  public getSyncStatus(): { status: SyncStatus; lastSyncTimestamp: number } {
    return {
      status: this.status,
      lastSyncTimestamp: this.lastSyncTimestamp
    };
  }
}

/**
 * Google Drive 제공자 (모의 구현)
 */
export class GoogleDriveProvider implements CloudProviderInterface {
  private isAuth: boolean = false;
  private mockStorage: Map<string, string> = new Map();
  
  /**
   * 인증 상태 확인
   */
  public async isAuthenticated(): Promise<boolean> {
    return this.isAuth;
  }
  
  /**
   * 인증 (로그인)
   */
  public async authenticate(): Promise<boolean> {
    // 실제 구현에서는 OAuth 인증 진행
    this.isAuth = true;
    return true;
  }
  
  /**
   * 파일 업로드
   * @param path 경로
   * @param content 내용
   */
  public async uploadFile(path: string, content: string): Promise<void> {
    this.mockStorage.set(path, content);
  }
  
  /**
   * 파일 다운로드
   * @param path 경로
   * @returns 파일 내용
   */
  public async downloadFile(path: string): Promise<string> {
    const content = this.mockStorage.get(path);
    if (!content) {
      throw new Error(`File not found: ${path}`);
    }
    return content;
  }
  
  /**
   * 파일 삭제
   * @param path 경로
   */
  public async deleteFile(path: string): Promise<void> {
    this.mockStorage.delete(path);
  }
  
  /**
   * 파일 목록 조회
   * @param folder 폴더 경로
   * @returns 파일 목록
   */
  public async listFiles(folder: string): Promise<string[]> {
    // 실제 구현에서는 API 호출
    return Array.from(this.mockStorage.keys())
      .filter(key => key.startsWith(folder));
  }
  
  /**
   * 파일 정보 조회
   * @param path 경로
   * @returns 파일 정보
   */
  public async getFileInfo(path: string): Promise<{
    path: string;
    size: number;
    lastModified: number;
  } | null> {
    const content = this.mockStorage.get(path);
    if (!content) {
      return null;
    }
    
    return {
      path,
      size: content.length,
      lastModified: Date.now()
    };
  }
}
