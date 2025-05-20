/**
 * @file keystore.ts
 * @description Web3 Secret Storage 키스토어 구현 모듈
 */

import * as CryptoJS from 'crypto-js';
import { randomBytes } from 'crypto';
import { Wallet } from 'ethers';
import { normalizeAddress } from '../utils/address';

/**
 * 키스토어 인터페이스
 */
export interface KeystoreV3 {
  version: number;
  id: string;
  address: string;
  crypto: {
    ciphertext: string;
    cipherparams: {
      iv: string;
    };
    cipher: string;
    kdf: string;
    kdfparams: {
      dklen: number;
      salt: string;
      n: number;
      r: number;
      p: number;
    };
    mac: string;
  };
}

/**
 * 키스토어 옵션
 */
export interface KeystoreOptions {
  salt?: string;
  iv?: string;
  kdf?: 'pbkdf2' | 'scrypt';
  dklen?: number;
  c?: number; // pbkdf2 반복 횟수
  n?: number; // scrypt 복잡도
  r?: number; // scrypt 블록 크기
  p?: number; // scrypt 병렬화 인자
}

/**
 * 개인키를 키스토어 형식으로 암호화합니다.
 * 
 * @param privateKey 암호화할 개인키
 * @param password 암호화에 사용할 비밀번호
 * @param options 암호화 옵션
 * @returns 키스토어 객체
 */
export async function encryptToKeystore(
  privateKey: string,
  password: string,
  options: KeystoreOptions = {}
): Promise<KeystoreV3> {
  const wallet = new Wallet(privateKey);
  const keystoreJson = await wallet.encrypt(password, options);
  return JSON.parse(keystoreJson);
}

/**
 * 키스토어에서 개인키를 복호화합니다.
 * 
 * @param keystore 키스토어 객체 또는 JSON 문자열
 * @param password 복호화에 사용할 비밀번호
 * @returns 복호화된 개인키
 */
export async function decryptFromKeystore(
  keystore: KeystoreV3 | string,
  password: string
): Promise<string> {
  try {
    const keystoreString = typeof keystore === 'string' ? keystore : JSON.stringify(keystore);
    const wallet = await Wallet.fromEncryptedJson(keystoreString, password);
    return wallet.privateKey;
  } catch (error) {
    throw new Error('Invalid password or corrupted keystore');
  }
}

/**
 * 키스토어의 유효성을 검증합니다.
 * 
 * @param keystore 검증할 키스토어
 * @returns 유효성 여부 (true/false)
 */
export function validateKeystore(keystore: KeystoreV3): boolean {
  // 필수 필드 확인
  const requiredFields = [
    'version',
    'id',
    'address',
    'crypto'
  ];
  
  for (const field of requiredFields) {
    if (!(field in keystore)) {
      return false;
    }
  }
  
  // 암호화 관련 필드 확인
  const cryptoFields = [
    'ciphertext',
    'cipherparams',
    'cipher',
    'kdf',
    'kdfparams',
    'mac'
  ];
  
  for (const field of cryptoFields) {
    if (!(field in keystore.crypto)) {
      return false;
    }
  }
  
  // 키스토어 버전 확인
  if (keystore.version !== 3) {
    return false;
  }
  
  return true;
}

/**
 * KDF (Key Derivation Function) 파라미터를 생성합니다.
 * 
 * @param kdf KDF 알고리즘 ('pbkdf2' 또는 'scrypt')
 * @param options 옵션
 * @returns KDF 파라미터
 */
export function generateKdfParams(
  kdf: 'pbkdf2' | 'scrypt' = 'scrypt',
  options: KeystoreOptions = {}
): any {
  // 솔트 생성
  const salt = options.salt || CryptoJS.lib.WordArray.random(32).toString();
  
  if (kdf === 'pbkdf2') {
    return {
      dklen: options.dklen || 32,
      salt,
      c: options.c || 262144,
      prf: 'hmac-sha256'
    };
  } else if (kdf === 'scrypt') {
    return {
      dklen: options.dklen || 32,
      salt,
      n: options.n || 8192,
      r: options.r || 8,
      p: options.p || 1
    };
  } else {
    throw new Error('Unsupported KDF');
  }
}

/**
 * 초기화 벡터를 생성합니다.
 * 
 * @param length 길이 (바이트)
 * @returns 16진수 문자열로 된 초기화 벡터
 */
export function generateIV(length: number = 16): string {
  return CryptoJS.lib.WordArray.random(length).toString();
}

/**
 * 임의의 UUID를 생성합니다.
 * 
 * @returns UUID 문자열
 */
export function generateUUID(): string {
  return [
    randomBytes(4).toString('hex'),
    randomBytes(2).toString('hex'),
    randomBytes(2).toString('hex'),
    randomBytes(2).toString('hex'),
    randomBytes(6).toString('hex')
  ].join('-');
}
