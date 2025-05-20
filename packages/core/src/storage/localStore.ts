/**
 * localStore.ts
 * 
 * 로컬 스토리지 관리 모듈.
 * 일반적인 데이터(설정, 캐시 등)를 로컬에 저장하고 접근할 수 있는 기능을 제공합니다.
 */

import { StorageError } from '../utils/errors';

/**
 * 로컬 스토리지 인터페이스
 */
export interface LocalStoreInterface {
  /**
   * 값 저장
   * @param key 키
   * @param value 값
   */
  setItem<T>(key: string, value: T): Promise<void>;

  /**
   * 값 조회
   * @param key 키
   * @param defaultValue 기본값 (값이 없을 경우 반환)
   * @returns 저장된 값
   */
  getItem<T>(key: string, defaultValue?: T): Promise<T>;

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
 * 인메모리 로컬 스토리지 - 개발 및 테스트용
 */
export class InMemoryLocalStore implements LocalStoreInterface {
  private storage: Map<string, any> = new Map();

  /**
   * 값 저장
   * @param key 키
   * @param value 값
   */
  public async setItem<T>(key: string, value: T): Promise<void> {
    this.storage.set(key, value);
  }

  /**
   * 값 조회
   * @param key 키
   * @param defaultValue 기본값 (값이 없을 경우 반환)
   * @returns 저장된 값
   */
  public async getItem<T>(key: string, defaultValue?: T): Promise<T> {
    const value = this.storage.get(key);
    return value !== undefined ? value : defaultValue as T;
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
 * 브라우저용 로컬 스토리지
 */
export class BrowserLocalStore implements LocalStoreInterface {
  private prefix: string;
  private storage: Storage;

  /**
   * BrowserLocalStore 생성자
   * @param prefix 스토리지 키 접두사
   * @param useSessionStorage 세션 스토리지 사용 여부 (기본값: false)
   */
  constructor(prefix: string = 'crelink_', useSessionStorage: boolean = false) {
    this.prefix = prefix;
    this.storage = useSessionStorage ? sessionStorage : localStorage;
  }

  /**
   * 값 저장
   * @param key 키
   * @param value 값
   */
  public async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const prefixedKey = this.getKeyWithPrefix(key);
      const valueString = JSON.stringify(value);
      this.storage.setItem(prefixedKey, valueString);
    } catch (error) {
      throw new StorageError(`Failed to store value for key: ${key}`);
    }
  }

  /**
   * 값 조회
   * @param key 키
   * @param defaultValue 기본값 (값이 없을 경우 반환)
   * @returns 저장된 값
   */
  public async getItem<T>(key: string, defaultValue?: T): Promise<T> {
    try {
      const prefixedKey = this.getKeyWithPrefix(key);
      const valueString = this.storage.getItem(prefixedKey);
      
      if (valueString === null) {
        return defaultValue as T;
      }
      
      return JSON.parse(valueString) as T;
    } catch (error) {
      return defaultValue as T;
    }
  }

  /**
   * 값 삭제
   * @param key 키
   */
  public async removeItem(key: string): Promise<void> {
    try {
      const prefixedKey = this.getKeyWithPrefix(key);
      this.storage.removeItem(prefixedKey);
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
      Object.keys(this.storage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => this.storage.removeItem(key));
    } catch (error) {
      throw new StorageError('Failed to clear local storage');
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
      return this.storage.getItem(prefixedKey) !== null;
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
}

/**
 * 리액트 네이티브용 로컬 스토리지
 */
export class NativeLocalStore implements LocalStoreInterface {
  private nativeModule: any;
  private prefix: string;

  /**
   * NativeLocalStore 생성자
   * @param nativeModule 네이티브 모듈 (AsyncStorage 등)
   * @param prefix 스토리지 키 접두사
   */
  constructor(nativeModule: any, prefix: string = 'crelink_') {
    if (!nativeModule) {
      throw new Error('Native storage module is required');
    }
    
    this.nativeModule = nativeModule;
    this.prefix = prefix;
  }

  /**
   * 값 저장
   * @param key 키
   * @param value 값
   */
  public async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const prefixedKey = this.getKeyWithPrefix(key);
      const valueString = JSON.stringify(value);
      await this.nativeModule.setItem(prefixedKey, valueString);
    } catch (error) {
      throw new StorageError(`Failed to store value for key: ${key}`);
    }
  }

  /**
   * 값 조회
   * @param key 키
   * @param defaultValue 기본값 (값이 없을 경우 반환)
   * @returns 저장된 값
   */
  public async getItem<T>(key: string, defaultValue?: T): Promise<T> {
    try {
      const prefixedKey = this.getKeyWithPrefix(key);
      const valueString = await this.nativeModule.getItem(prefixedKey);
      
      if (valueString === null) {
        return defaultValue as T;
      }
      
      return JSON.parse(valueString) as T;
    } catch (error) {
      return defaultValue as T;
    }
  }

  /**
   * 값 삭제
   * @param key 키
   */
  public async removeItem(key: string): Promise<void> {
    try {
      const prefixedKey = this.getKeyWithPrefix(key);
      await this.nativeModule.removeItem(prefixedKey);
    } catch (error) {
      throw new StorageError(`Failed to remove value for key: ${key}`);
    }
  }

  /**
   * 모든 값 삭제
   */
  public async clear(): Promise<void> {
    try {
      // 일부 네이티브 모듈은 특정 접두사로 시작하는 키만 삭제하는 기능을 제공하지 않을 수 있음
      // 따라서 getAllKeys로 모든 키를 가져와서 필터링 후 삭제
      const allKeys = await this.nativeModule.getAllKeys();
      const keysToRemove = allKeys.filter((key: string) => key.startsWith(this.prefix));
      
      if (keysToRemove.length > 0) {
        await this.nativeModule.multiRemove(keysToRemove);
      }
    } catch (error) {
      throw new StorageError('Failed to clear local storage');
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
      const value = await this.nativeModule.getItem(prefixedKey);
      return value !== null;
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
 * 플랫폼에 적합한 로컬 스토리지 구현체 팩토리
 */
export class LocalStoreFactory {
  /**
   * 현재 환경에 맞는 로컬 스토리지 인스턴스 생성
   * @param options 옵션
   * @returns 로컬 스토리지 인터페이스 구현체
   */
  public static create(options: {
    type?: 'browser' | 'native' | 'memory';
    prefix?: string;
    useSessionStorage?: boolean;
    nativeModule?: any;
  } = {}): LocalStoreInterface {
    const { type = 'memory', prefix, useSessionStorage, nativeModule } = options;
    
    switch (type) {
      case 'browser':
        return new BrowserLocalStore(prefix, useSessionStorage);
        
      case 'native':
        if (!nativeModule) {
          throw new Error('Native module is required for native local storage');
        }
        return new NativeLocalStore(nativeModule, prefix);
        
      case 'memory':
      default:
        return new InMemoryLocalStore();
    }
  }
}
