/**
 * StorageService
 * 브라우저 확장 스토리지 관리 서비스
 * 사용자 설정, 지갑 데이터, 캐시 등을 안전하게 저장하고 관리합니다.
 */

export class StorageService {
  private storageCache: { [key: string]: any } = {};
  private initialized: boolean = false;
  
  constructor() {}
  
  /**
   * 스토리지 초기화
   * 로컬 캐시에 저장된 데이터를 로드합니다.
   */
  public async init(): Promise<void> {
    try {
      // 모든 스토리지 데이터 로드
      const data = await new Promise<{ [key: string]: any }>((resolve) => {
        chrome.storage.local.get(null, (items) => {
          resolve(items || {});
        });
      });
      
      // 로컬 캐시에 저장
      this.storageCache = data;
      this.initialized = true;
      
      console.log('스토리지 서비스가 초기화되었습니다.');
    } catch (error) {
      console.error('스토리지 초기화 중 오류:', error);
      throw error;
    }
  }
  
  /**
   * 아이템 조회
   * @param key 스토리지 키
   * @returns 저장된 값 또는 null
   */
  public async getItem<T>(key: string): Promise<T | null> {
    // 초기화 확인
    if (!this.initialized) {
      await this.init();
    }
    
    // 캐시에서 조회
    if (key in this.storageCache) {
      return this.storageCache[key] as T;
    }
    
    // 캐시에 없으면 스토리지에서 조회
    try {
      const result = await new Promise<{ [key: string]: any }>((resolve) => {
        chrome.storage.local.get(key, (items) => {
          resolve(items || {});
        });
      });
      
      // 결과가 없으면 null 반환
      if (!result || !(key in result)) {
        return null;
      }
      
      // 캐시 업데이트
      this.storageCache[key] = result[key];
      
      return result[key] as T;
    } catch (error) {
      console.error(`"${key}" 아이템 조회 중 오류:`, error);
      return null;
    }
  }
  
  /**
   * 아이템 저장
   * @param key 스토리지 키
   * @param value 저장할 값
   */
  public async setItem<T>(key: string, value: T): Promise<void> {
    // 캐시 업데이트
    this.storageCache[key] = value;
    
    // 스토리지에 저장
    try {
      await new Promise<void>((resolve, reject) => {
        chrome.storage.local.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error(`"${key}" 아이템 저장 중 오류:`, error);
      throw error;
    }
  }
  
  /**
   * 아이템 삭제
   * @param key 스토리지 키
   */
  public async removeItem(key: string): Promise<void> {
    // 캐시에서 삭제
    delete this.storageCache[key];
    
    // 스토리지에서 삭제
    try {
      await new Promise<void>((resolve, reject) => {
        chrome.storage.local.remove(key, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error(`"${key}" 아이템 삭제 중 오류:`, error);
      throw error;
    }
  }
  
  /**
   * 모든 아이템 삭제
   */
  public async clear(): Promise<void> {
    // 캐시 초기화
    this.storageCache = {};
    
    // 스토리지 초기화
    try {
      await new Promise<void>((resolve, reject) => {
        chrome.storage.local.clear(() => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('스토리지 초기화 중 오류:', error);
      throw error;
    }
  }
  
  /**
   * 스토리지 이벤트 리스너 설정
   * 다른 컨텍스트(팝업 등)에서 스토리지 변경 시 캐시 업데이트
   */
  public setupStorageListener(): void {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'local') return;
      
      // 변경된 아이템만 캐시 업데이트
      for (const [key, change] of Object.entries(changes)) {
        if ('newValue' in change) {
          this.storageCache[key] = change.newValue;
        } else {
          delete this.storageCache[key];
        }
      }
    });
  }
  
  /**
   * 암호화된 아이템 저장
   * 민감한 정보를 암호화하여 저장합니다.
   * @param key 스토리지 키
   * @param value 저장할 값
   * @param password 암호화 비밀번호
   */
  public async setEncryptedItem<T>(key: string, value: T, password: string): Promise<void> {
    // 실제 구현에서는 @crelink/core의 암호화 모듈 사용
    // 임시 구현:
    const encryptedValue = `encrypted_${JSON.stringify(value)}_${password}`;
    await this.setItem(`encrypted_${key}`, encryptedValue);
  }
  
  /**
   * 암호화된 아이템 조회
   * 암호화된 정보를 복호화하여 반환합니다.
   * @param key 스토리지 키
   * @param password 복호화 비밀번호
   * @returns 복호화된 값 또는 null
   */
  public async getEncryptedItem<T>(key: string, password: string): Promise<T | null> {
    // 실제 구현에서는 @crelink/core의 암호화 모듈 사용
    // 임시 구현:
    const encryptedValue = await this.getItem<string>(`encrypted_${key}`);
    
    if (!encryptedValue) {
      return null;
    }
    
    // 패스워드 검증 (실제 구현에서는 더 복잡한 검증 필요)
    if (!encryptedValue.includes(password)) {
      throw new Error('잘못된 비밀번호입니다.');
    }
    
    // 더미 복호화 (실제 구현에서는 실제 복호화 로직 필요)
    const jsonStr = encryptedValue.split('_')[1];
    
    try {
      return JSON.parse(jsonStr) as T;
    } catch {
      return null;
    }
  }
  
  /**
   * 일괄 아이템 저장
   * 여러 아이템을 한 번에 저장합니다.
   * @param items 저장할 아이템 객체
   */
  public async setBulkItems(items: Record<string, any>): Promise<void> {
    // 캐시 업데이트
    for (const [key, value] of Object.entries(items)) {
      this.storageCache[key] = value;
    }
    
    // 스토리지에 저장
    try {
      await new Promise<void>((resolve, reject) => {
        chrome.storage.local.set(items, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('일괄 아이템 저장 중 오류:', error);
      throw error;
    }
  }
  
  /**
   * 일괄 아이템 조회
   * 여러 아이템을 한 번에 조회합니다.
   * @param keys 조회할 키 배열
   * @returns 키-값 쌍의 객체
   */
  public async getBulkItems(keys: string[]): Promise<Record<string, any>> {
    try {
      // 초기화 확인
      if (!this.initialized) {
        await this.init();
      }
      
      const result = await new Promise<{ [key: string]: any }>((resolve) => {
        chrome.storage.local.get(keys, (items) => {
          resolve(items || {});
        });
      });
      
      // 캐시 업데이트
      for (const [key, value] of Object.entries(result)) {
        this.storageCache[key] = value;
      }
      
      return result;
    } catch (error) {
      console.error('일괄 아이템 조회 중 오류:', error);
      throw error;
    }
  }
}