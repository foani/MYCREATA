import EncryptedStorage from 'react-native-encrypted-storage';
import { SHA256 } from 'crypto-js';
import { Platform } from 'react-native';
import * as Keychain from 'react-native-keychain';

/**
 * 보안 저장소 서비스
 * 민감한 데이터를 암호화하여 저장하고 관리하는 기능 제공
 */
class SecureStorage {
  /**
   * 보안 데이터 저장
   * @param key 키
   * @param value 값
   */
  async saveSecureValue(key: string, value: string): Promise<void> {
    try {
      // iOS와 Android에서 다른 저장 방식 사용
      if (Platform.OS === 'ios') {
        // iOS의 경우 Keychain 사용
        await Keychain.setGenericPassword(key, value, {
          service: `com.crelink.wallet.${key}`,
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
      } else {
        // Android의 경우 EncryptedStorage 사용
        await EncryptedStorage.setItem(
          `com.crelink.wallet.${key}`,
          value
        );
      }
    } catch (error) {
      console.error(`Error saving secure value for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 보안 데이터 조회
   * @param key 키
   * @returns 저장된 값 (없으면 null)
   */
  async getSecureValue(key: string): Promise<string | null> {
    try {
      // iOS와 Android에서 다른 조회 방식 사용
      if (Platform.OS === 'ios') {
        // iOS의 경우 Keychain 사용
        const credentials = await Keychain.getGenericPassword({
          service: `com.crelink.wallet.${key}`,
        });
        
        if (credentials) {
          return credentials.password;
        }
        return null;
      } else {
        // Android의 경우 EncryptedStorage 사용
        const value = await EncryptedStorage.getItem(
          `com.crelink.wallet.${key}`
        );
        return value;
      }
    } catch (error) {
      console.error(`Error retrieving secure value for key ${key}:`, error);
      return null;
    }
  }

  /**
   * 보안 데이터 삭제
   * @param key 키
   */
  async removeSecureValue(key: string): Promise<void> {
    try {
      // iOS와 Android에서 다른 삭제 방식 사용
      if (Platform.OS === 'ios') {
        // iOS의 경우 Keychain 사용
        await Keychain.resetGenericPassword({
          service: `com.crelink.wallet.${key}`,
        });
      } else {
        // Android의 경우 EncryptedStorage 사용
        await EncryptedStorage.removeItem(
          `com.crelink.wallet.${key}`
        );
      }
    } catch (error) {
      console.error(`Error removing secure value for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 모든 보안 데이터 삭제
   */
  async clearAllSecureValues(): Promise<void> {
    try {
      // iOS와 Android에서 다른 삭제 방식 사용
      if (Platform.OS === 'ios') {
        // iOS의 경우 Keychain 사용 (특정 서비스만 삭제는 불가)
        await Keychain.resetGenericPassword();
      } else {
        // Android의 경우 EncryptedStorage 사용
        await EncryptedStorage.clear();
      }
    } catch (error) {
      console.error('Error clearing all secure values:', error);
      throw error;
    }
  }

  /**
   * 문자열 해시화 (SHA-256)
   * @param value 원본 문자열
   * @returns 해시된 문자열
   */
  async secureHash(value: string): Promise<string> {
    try {
      return SHA256(value).toString();
    } catch (error) {
      console.error('Error hashing value:', error);
      throw error;
    }
  }

  /**
   * 민감한 객체 데이터 암호화 저장
   * @param key 키
   * @param object 객체
   */
  async saveSecureObject<T>(key: string, object: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(object);
      await this.saveSecureValue(key, jsonValue);
    } catch (error) {
      console.error(`Error saving secure object for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 암호화된 객체 데이터 조회
   * @param key 키
   * @returns 저장된 객체 (없으면 null)
   */
  async getSecureObject<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await this.getSecureValue(key);
      
      if (jsonValue) {
        return JSON.parse(jsonValue) as T;
      }
      
      return null;
    } catch (error) {
      console.error(`Error retrieving secure object for key ${key}:`, error);
      return null;
    }
  }
}

export default new SecureStorage();
