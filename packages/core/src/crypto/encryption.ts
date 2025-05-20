/**
 * @file encryption.ts
 * @description 데이터 암호화 및 복호화를 위한 유틸리티 모듈
 */

import * as CryptoJS from 'crypto-js';
import { randomBytes } from 'crypto';

/**
 * 암호화 알고리즘 옵션
 */
export enum EncryptionAlgorithm {
  AES = 'aes',
  TRIPLE_DES = '3des'
}

/**
 * 암호화 모드 옵션
 */
export enum EncryptionMode {
  CBC = 'cbc',
  CFB = 'cfb',
  CTR = 'ctr',
  OFB = 'ofb',
  ECB = 'ecb'
}

/**
 * 패딩 옵션
 */
export enum PaddingMode {
  PKCS7 = 'pkcs7',
  ISO10126 = 'iso10126',
  ISO97971 = 'iso97971',
  ZERO = 'zero',
  NO_PADDING = 'nopadding'
}

/**
 * 암호화 옵션 인터페이스
 */
export interface EncryptionOptions {
  algorithm?: EncryptionAlgorithm;
  mode?: EncryptionMode;
  padding?: PaddingMode;
  iv?: string;
  salt?: string;
  iterations?: number;
  keySize?: number;
}

/**
 * 데이터를 암호화합니다.
 * 
 * @param data 암호화할 데이터
 * @param password 암호화에 사용할 비밀번호
 * @param options 암호화 옵션
 * @returns 암호화된 데이터 (Base64 인코딩)
 */
export function encrypt(
  data: string,
  password: string,
  options: EncryptionOptions = {}
): string {
  const {
    algorithm = EncryptionAlgorithm.AES,
    mode = EncryptionMode.CBC,
    padding = PaddingMode.PKCS7,
    iterations = 1000,
    keySize = 256 / 32
  } = options;
  
  // 솔트 생성 또는 사용
  const salt = options.salt ? 
    CryptoJS.enc.Hex.parse(options.salt) : 
    CryptoJS.lib.WordArray.random(128 / 8);
  
  // 초기화 벡터 생성 또는 사용
  const iv = options.iv ? 
    CryptoJS.enc.Hex.parse(options.iv) : 
    CryptoJS.lib.WordArray.random(128 / 8);
  
  // 키 도출
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize,
    iterations
  });
  
  // 암호화 설정
  const encryptConfig = {
    iv,
    mode: getCryptoMode(mode),
    padding: getCryptoPadding(padding)
  };
  
  // 알고리즘에 따라 암호화
  let encrypted;
  if (algorithm === EncryptionAlgorithm.AES) {
    encrypted = CryptoJS.AES.encrypt(data, key, encryptConfig);
  } else if (algorithm === EncryptionAlgorithm.TRIPLE_DES) {
    encrypted = CryptoJS.TripleDES.encrypt(data, key, encryptConfig);
  } else {
    throw new Error(`Unsupported algorithm: ${algorithm}`);
  }
  
  // 메타데이터와 함께 반환
  const result = {
    ciphertext: encrypted.toString(),
    iv: iv.toString(),
    salt: salt.toString(),
    algorithm,
    mode,
    padding,
    iterations,
    keySize
  };
  
  return JSON.stringify(result);
}

/**
 * 암호화된 데이터를 복호화합니다.
 * 
 * @param encryptedData 암호화된 데이터 (JSON 문자열)
 * @param password 복호화에 사용할 비밀번호
 * @returns 복호화된 데이터
 */
export function decrypt(encryptedData: string, password: string): string {
  try {
    const {
      ciphertext,
      iv,
      salt,
      algorithm,
      mode,
      padding,
      iterations,
      keySize
    } = JSON.parse(encryptedData);
    
    // 키 도출
    const key = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), {
      keySize,
      iterations
    });
    
    // 복호화 설정
    const decryptConfig = {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: getCryptoMode(mode),
      padding: getCryptoPadding(padding)
    };
    
    // 알고리즘에 따라 복호화
    let decrypted;
    if (algorithm === EncryptionAlgorithm.AES) {
      decrypted = CryptoJS.AES.decrypt(ciphertext, key, decryptConfig);
    } else if (algorithm === EncryptionAlgorithm.TRIPLE_DES) {
      decrypted = CryptoJS.TripleDES.decrypt(ciphertext, key, decryptConfig);
    } else {
      throw new Error(`Unsupported algorithm: ${algorithm}`);
    }
    
    // UTF-8로 변환
    const result = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!result) {
      throw new Error('Failed to decrypt data');
    }
    
    return result;
  } catch (error) {
    throw new Error('Invalid password or corrupted data');
  }
}

/**
 * 간단한 대칭 암호화를 수행합니다. (메타데이터 없이 단순 암호화)
 * 
 * @param data 암호화할 데이터
 * @param password 암호화에 사용할 비밀번호
 * @returns 암호화된 데이터 (Base64 인코딩)
 */
export function simpleEncrypt(data: string, password: string): string {
  return CryptoJS.AES.encrypt(data, password).toString();
}

/**
 * 간단한 대칭 복호화를 수행합니다. (메타데이터 없이 단순 복호화)
 * 
 * @param encryptedData 암호화된 데이터 (Base64 인코딩)
 * @param password 복호화에 사용할 비밀번호
 * @returns 복호화된 데이터
 */
export function simpleDecrypt(encryptedData: string, password: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, password);
    const result = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!result) {
      throw new Error('Failed to decrypt data');
    }
    
    return result;
  } catch (error) {
    throw new Error('Invalid password or corrupted data');
  }
}

/**
 * 해시 함수를 사용하여 데이터의 해시를 생성합니다.
 * 
 * @param data 해시할 데이터
 * @param algorithm 해시 알고리즘 (기본값: SHA-256)
 * @returns 해시값 (16진수 문자열)
 */
export function hash(
  data: string,
  algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512' | 'sha3' = 'sha256'
): string {
  switch (algorithm) {
    case 'md5':
      return CryptoJS.MD5(data).toString();
    case 'sha1':
      return CryptoJS.SHA1(data).toString();
    case 'sha256':
      return CryptoJS.SHA256(data).toString();
    case 'sha512':
      return CryptoJS.SHA512(data).toString();
    case 'sha3':
      return CryptoJS.SHA3(data).toString();
    default:
      throw new Error(`Unsupported hash algorithm: ${algorithm}`);
  }
}

/**
 * HMAC를 생성합니다.
 * 
 * @param data HMAC를 생성할 데이터
 * @param key HMAC 키
 * @param algorithm 해시 알고리즘 (기본값: SHA-256)
 * @returns HMAC 값 (16진수 문자열)
 */
export function hmac(
  data: string,
  key: string,
  algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512' | 'sha3' = 'sha256'
): string {
  switch (algorithm) {
    case 'md5':
      return CryptoJS.HmacMD5(data, key).toString();
    case 'sha1':
      return CryptoJS.HmacSHA1(data, key).toString();
    case 'sha256':
      return CryptoJS.HmacSHA256(data, key).toString();
    case 'sha512':
      return CryptoJS.HmacSHA512(data, key).toString();
    case 'sha3':
      return CryptoJS.HmacSHA3(data, key).toString();
    default:
      throw new Error(`Unsupported hash algorithm: ${algorithm}`);
  }
}

/**
 * 암호화 모드를 가져옵니다.
 * 
 * @param mode 암호화 모드
 * @returns CryptoJS 암호화 모드
 */
function getCryptoMode(mode: EncryptionMode): any {
  switch (mode) {
    case EncryptionMode.CBC:
      return CryptoJS.mode.CBC;
    case EncryptionMode.CFB:
      return CryptoJS.mode.CFB;
    case EncryptionMode.CTR:
      return CryptoJS.mode.CTR;
    case EncryptionMode.OFB:
      return CryptoJS.mode.OFB;
    case EncryptionMode.ECB:
      return CryptoJS.mode.ECB;
    default:
      throw new Error(`Unsupported mode: ${mode}`);
  }
}

/**
 * 패딩 모드를 가져옵니다.
 * 
 * @param padding 패딩 모드
 * @returns CryptoJS 패딩 모드
 */
function getCryptoPadding(padding: PaddingMode): any {
  switch (padding) {
    case PaddingMode.PKCS7:
      return CryptoJS.pad.Pkcs7;
    case PaddingMode.ISO10126:
      return CryptoJS.pad.Iso10126;
    case PaddingMode.ISO97971:
      return CryptoJS.pad.Iso97971;
    case PaddingMode.ZERO:
      return CryptoJS.pad.ZeroPadding;
    case PaddingMode.NO_PADDING:
      return CryptoJS.pad.NoPadding;
    default:
      throw new Error(`Unsupported padding: ${padding}`);
  }
}

/**
 * 랜덤 솔트를 생성합니다.
 * 
 * @param length 솔트 길이 (바이트)
 * @returns 16진수 문자열로 된 솔트
 */
export function generateSalt(length: number = 16): string {
  return randomBytes(length).toString('hex');
}

/**
 * 비밀번호의 강도를 평가합니다.
 * 
 * @param password 평가할 비밀번호
 * @returns 강도 점수 (0-100)
 */
export function evaluatePasswordStrength(password: string): number {
  let score = 0;
  
  // 길이 점수 (최대 25점)
  const lengthScore = Math.min(25, Math.floor(password.length * 2.5));
  score += lengthScore;
  
  // 복잡성 점수 (최대 75점)
  if (/[a-z]/.test(password)) score += 10; // 소문자
  if (/[A-Z]/.test(password)) score += 15; // 대문자
  if (/[0-9]/.test(password)) score += 10; // 숫자
  if (/[^a-zA-Z0-9]/.test(password)) score += 15; // 특수문자
  
  // 문자 다양성 (최대 10점)
  const unique = new Set(password.split('')).size;
  const uniqueScore = Math.min(10, Math.floor(unique * 0.5));
  score += uniqueScore;
  
  // 패턴 점수 (최대 15점)
  let patternScore = 15;
  
  // 연속된 문자/숫자 감지
  for (let i = 0; i < password.length - 2; i++) {
    const c1 = password.charCodeAt(i);
    const c2 = password.charCodeAt(i + 1);
    const c3 = password.charCodeAt(i + 2);
    
    // 연속된 문자 (abc, 123 등)
    if ((c1 + 1 === c2 && c2 + 1 === c3) || (c1 - 1 === c2 && c2 - 1 === c3)) {
      patternScore -= 5;
    }
    
    // 반복된 문자 (aaa, 111 등)
    if (c1 === c2 && c2 === c3) {
      patternScore -= 5;
    }
  }
  
  score += Math.max(0, patternScore);
  
  return Math.min(100, score);
}
