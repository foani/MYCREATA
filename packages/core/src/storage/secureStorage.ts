/**
 * secureStorage.ts
 * 
 * 보안 스토리지 인터페이스 및 구현체.
 * 민감한 데이터(키, 비밀번호 등)를 안전하게 저장하고 접근할 수 있는 기능을 제공합니다.
 */

import { StorageError } from '../utils/errors';

/**
 * 보안 스토리지 인터페이스
 */
export interface SecureStorageInterface {
  /**
   * 값 저장
   * @param key 키
   * @param value 값
   */
  setItem(key: string, value: string): Promise<void>;

  /**
   * 값 조회
   * @param key 키
   * @returns 저장된 값
   */
  getItem(key: string): Promise<string>;

  /**
   * 값 삭제
   * @param key 키
   */
  removeItem(key: string): Promise<void>;

  /**
   * 모든 값 삭제
   */
  clear(): Promise<void>;

  /**
   * 키 존재 여부 확인
   * @param key 키
   * @returns 존재 여부
   */
  hasItem(key: string): Promise<boolean>;
}

/**
 * 인메모리 보안 스토리지 - 개발 및 테스트용
 */
export class InMemorySecureStorage implements SecureStorageInterface {
  private storage: Map<string, string> = new Map();

  /**
   * 값 저장
   * @param key 키
   * @param value 값
   */
  public async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  /**
   * 값 조회
   * @param key 키
   * @returns 저장된 값
   */
  public async getItem(key: string): Promise<string> {
    const value = this.storage.get(key);
    if (value === undefined) {
      throw new StorageError(`Key not found: ${key}`);
    }
    return value;
  }

  /**
   * 값 삭제
   * @param key 키
   */
  public async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }

  /**
   * 모든 값 삭제
   */
  public async clear(): Promise<void> {
    this.storage.clear();
  }

  /**
   * 키 존재 여부 확인
   * @param key 키
   * @returns 존재 여부
   */
  public async hasItem(key: string): Promise<boolean> {
    return this.storage.has(key);
  }
}

/**
 * 브라우저용 보안 스토리지
 * LocalStorage에 저장하며 필요 시 암호화
 */
export class BrowserSecureStorage implements SecureStorageInterface {
  private prefix: string;
  private encryptionKey?: string;

  /**
   * BrowserSecureStorage 생성자
   * @param prefix 스토리지 키 접두사
   * @param encryptionKey 암호화 키 (선택 사항)
   */
  constructor(prefix: string = 'crelink_secure_', encryptionKey?: string) {
    this.prefix = prefix;
    this.encryptionKey = encryptionKey;
  }

  /**
   * 값 저장
   * @param key 키
   * @param value 값
   */
  public async setItem(key: string, value: string): Promise<void> {
    try {
      const prefixedKey = this.getKeyWithPrefix(key);
      const processedValue = this.encryptionKey ? this.encrypt(value) : value;
      localStorage.setItem(prefixedKey, processedValue);
    } catch (error) {
      throw new StorageError(`Failed to store value for key: ${key}`);
    }
  }

  /**
   * 값 조회
   * @param key 키
   * @returns 저장된 값
   */
  public async getItem(key: string): Promise<string> {
    try {
      const prefixedKey = this.getKeyWithPrefix(key);
      const value = localStorage.getItem(prefixedKey);
      
      if (value === null) {
        throw new StorageError(`Key not found: ${key}`);
      }
      
      return this.encryptionKey ? this.decrypt(value) : value;
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(`Failed to retrieve value for key: ${key}`);
    }
  }

  /**
   * 값 삭제
   * @param key 키
   */
  public async removeItem(key: string): Promise<void> {
    try {
      const prefixedKey = this.getKeyWithPrefix(key);
      localStorage.removeItem(prefixedKey);
    } catch (error) {
      throw new StorageError(`Failed to remove value for key: ${key}`);
    }
  }

  /**
   * 모든 값 삭제
   */
  public async clear(): Promise<void> {
    try {
      // 해당 접두사를 가진 키만 삭제
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      throw new StorageError('Failed to clear secure storage');
    }
  }

  /**
   * 키 존재 여부 확인
   * @param key 키
   * @returns 존재 여부
   */
  public async hasItem(key: string): Promise<boolean> {
    try {
      const prefixedKey = this.getKeyWithPrefix(key);
      return localStorage.getItem(prefixedKey) !== null;
    } catch (error) {
      throw new StorageError(`Failed to check key existence: ${key}`);
    }
  }

  /**
   * 키에 접두사 추가
   * @param key 원본 키
   * @returns 접두사가 추가된 키
   */
  private getKeyWithPrefix(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * 값 암호화 (샘플 구현)
   * @param value 암호화할 값
   * @returns 암호화된 값
   */
  private encrypt(value: string): string {
    // 실제 구현에서는 crypto-js 등의 라이브러리 사용
    if (!this.encryptionKey) {
      return value;
    }
    
    // 간단한 XOR 암호화 (실제 프로덕션에서는 더 강력한 암호화 필요)
    return Array.from(value)
      .map((char, index) => {
        const keyChar = this.encryptionKey![index % this.encryptionKey!.length];
        return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0));
      })
      .join('');
  }

  /**
   * 암호화된 값 복호화 (샘플 구현)
   * @param encryptedValue 암호화된 값
   * @returns 복호화된 값
   */
  private decrypt(encryptedValue: string): string {
    // XOR 암호화는 암호화와 복호화가 동일
    return this.encrypt(encryptedValue);
  }
}

/**
 * 리액트 네이티브용 보안 스토리지
 * 리액트 네이티브의 Keychain/Keystore를 이용
 */
export class NativeSecureStorage implements SecureStorageInterface {
  private nativeModule: any;
  private prefix: string;

  /**
   * NativeSecureStorage 생성자
   * @param nativeModule 네이티브 모듈 (RN Keychain 등)
   * @param prefix 스토리지 키 접두사
   */
  constructor(nativeModule: any, prefix: string = 'crelink_secure_') {
    if (!nativeModule) {
      throw new Error('Native secure storage module is required');
    }
    
    this.nativeModule = nativeModule;
    this.prefix = prefix;
  }

  /**
   * 값 저장
   * @param key 키
   * @param value 값
   */
  public async setItem(key: string, value: string): Promise<void> {
    try {
      const prefixedKey = this.getKeyWithPrefix(key);
      await this.nativeModule.setGenericPassword(prefixedKey, value, {
        service: prefixedKey
      });
    } catch (error) {
      throw new StorageError(`Failed to store value for key: ${key}`);
    }
  }

  /**
   * 값 조회
   * @param key 키
   * @returns 저장된 값
   */
  public async getItem(key: string): Promise<string> {
    try {
      const prefixedKey = this.getKeyWithPrefix(key);
      const result = await this.nativeModule.getGenericPassword({
        service: prefixedKey
      });
      
      if (!result) {
        throw new StorageError(`Key not found: ${key}`);
      }
      
      return result.password;
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(`Failed to retrieve value for key: ${key}`);
    }
  }

  /**
   * 값 삭제
   * @param key 키
   */
  public async removeItem(key: string): Promise<void> {
    try {
      const prefixedKey = this.getKeyWithPrefix(key);
      await this.nativeModule.resetGenericPassword({
        service: prefixedKey
      });
    } catch (error) {
      throw new StorageError(`Failed to remove value for key: ${key}`);
    }
  }

  /**
   * 모든 값 삭제
   * 참고: 네이티브 모듈에 따라 지원이 제한적일 수 있음
   */
  public async clear(): Promise<void> {
    try {
      // 모든 서비스 목록을 가져와서 삭제해야 하지만,
      // 대부분의 키체인 라이브러리는 이 기능을 지원하지 않음
      // 따라서, 실제 구현에서는 알려진 모든 키를 수동으로 삭제해야 할 수 있음
      await this.nativeModule.resetGenericPassword();
    } catch (error) {
      throw new StorageError('Failed to clear secure storage');
    }
  }

  /**
   * 키 존재 여부 확인
   * @param key 키
   * @returns 존재 여부
   */
  public async hasItem(key: string): Promise<boolean> {
    try {
      const prefixedKey = this.getKeyWithPrefix(key);
      const result = await this.nativeModule.getGenericPassword({
        service: prefixedKey
      });
      
      return !!result;
    } catch (error) {
      return false;
    }
  }

  /**
   * 키에 접두사 추가
   * @param key 원본 키
   * @returns 접두사가 추가된 키
   */
  private getKeyWithPrefix(key: string): string {
    return `${this.prefix}${key}`;
  }
}

/**
 * 플랫폼에 적합한 보안 스토리지 구현체 팩토리
 */
export class SecureStorageFactory {
  /**
   * 현재 환경에 맞는 보안 스토리지 인스턴스 생성
   * @param options 옵션
   * @returns 보안 스토리지 인터페이스 구현체
   */
  public static create(options: {
    type?: 'browser' | 'native' | 'memory';
    prefix?: string;
    encryptionKey?: string;
    nativeModule?: any;
  } = {}): SecureStorageInterface {
    const { type = 'memory', prefix, encryptionKey, nativeModule } = options;
    
    switch (type) {
      case 'browser':
        return new BrowserSecureStorage(prefix, encryptionKey);
        
      case 'native':
        if (!nativeModule) {
          throw new Error('Native module is required for native secure storage');
        }
        return new NativeSecureStorage(nativeModule, prefix);
        
      case 'memory':
      default:
        return new InMemorySecureStorage();
    }
  }
}
