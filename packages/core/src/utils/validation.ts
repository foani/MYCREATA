/**
 * validation.ts
 * 
 * 다양한 입력 값에 대한 검증 유틸리티 함수 모음.
 */

import { ValidationError } from './errors';
import { isValidAddress, isValidENS, isValidZkDID } from './address';

/**
 * 니모닉 문구 검증 (BIP39)
 * @param mnemonic 니모닉 문구
 * @returns 유효성 여부
 */
export function isValidMnemonic(mnemonic: string): boolean {
  // 기본적인 형식 검사 (실제 구현에서는 bip39 라이브러리 사용 권장)
  
  if (!mnemonic || typeof mnemonic !== 'string') {
    return false;
  }
  
  // 공백으로 분리된 단어들
  const words = mnemonic.trim().split(/\s+/);
  
  // BIP39는 12, 15, 18, 21, 24 단어를 지원
  const validWordCounts = [12, 15, 18, 21, 24];
  if (!validWordCounts.includes(words.length)) {
    return false;
  }
  
  // 각 단어가 영문 소문자만 포함하는지 확인
  for (const word of words) {
    if (!/^[a-z]+$/.test(word)) {
      return false;
    }
  }
  
  // 실제 검증은 bip39 라이브러리 사용 필요
  // import { validateMnemonic } from 'bip39';
  // return validateMnemonic(mnemonic);
  
  return true;
}

/**
 * 개인키 검증
 * @param privateKey 개인키 (0x 접두사 포함 또는 제외)
 * @returns 유효성 여부
 */
export function isValidPrivateKey(privateKey: string): boolean {
  // 0x 접두사 제거
  const key = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  
  // 64자 16진수 문자열인지 확인
  return /^[0-9a-fA-F]{64}$/.test(key);
}

/**
 * 트랜잭션 해시 검증
 * @param hash 트랜잭션 해시
 * @returns 유효성 여부
 */
export function isValidTxHash(hash: string): boolean {
  // 0x 접두사 포함 66자 16진수 문자열인지 확인
  return /^0x[0-9a-fA-F]{64}$/.test(hash);
}

/**
 * 비밀번호 강도 검사
 * @param password 비밀번호
 * @returns 비밀번호 강도 (0-100)
 */
export function passwordStrength(password: string): number {
  if (!password) {
    return 0;
  }
  
  let score = 0;
  
  // 길이 점수 (최대 30점)
  score += Math.min(password.length * 2, 30);
  
  // 다양성 점수
  if (/[a-z]/.test(password)) score += 10; // 소문자
  if (/[A-Z]/.test(password)) score += 15; // 대문자
  if (/[0-9]/.test(password)) score += 10; // 숫자
  if (/[^a-zA-Z0-9]/.test(password)) score += 15; // 특수문자
  
  // 패턴 점수
  if (/(.)\1\1/.test(password)) score -= 10; // 반복 문자
  if (/^(?:abc|123|qwe|asd|zxc)/i.test(password)) score -= 10; // 흔한 패턴
  
  // 최종 점수 계산 (0-100 범위로 제한)
  return Math.max(0, Math.min(100, score));
}

/**
 * PIN 검증
 * @param pin PIN 코드
 * @param minLength 최소 길이 (기본값: 4)
 * @param maxLength 최대 길이 (기본값: 8)
 * @returns 유효성 여부
 */
export function isValidPin(pin: string, minLength: number = 4, maxLength: number = 8): boolean {
  // 숫자로만 구성된 문자열인지 확인
  if (!/^\d+$/.test(pin)) {
    return false;
  }
  
  // 길이 확인
  if (pin.length < minLength || pin.length > maxLength) {
    return false;
  }
  
  // 연속된 숫자 확인 (예: 1234, 9876)
  if (/^0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210$/.test(pin)) {
    return false;
  }
  
  // 모두 같은 숫자인지 확인 (예: 1111, 9999)
  if (/^(\d)\1+$/.test(pin)) {
    return false;
  }
  
  return true;
}

/**
 * 이메일 주소 검증
 * @param email 이메일 주소
 * @returns 유효성 여부
 */
export function isValidEmail(email: string): boolean {
  // 간단한 이메일 형식 검사
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * URL 검증
 * @param url URL 문자열
 * @returns 유효성 여부
 */
export function isValidUrl(url: string): boolean {
  try {
    // URL 객체 생성을 시도하여 검증
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 토큰 금액 검증
 * @param amount 금액 문자열
 * @param decimals 토큰의 소수점 자리수
 * @returns 유효성 여부
 */
export function isValidTokenAmount(amount: string, decimals: number): boolean {
  // 숫자 형식 확인
  if (!/^\d*\.?\d*$/.test(amount)) {
    return false;
  }
  
  // 소수점 자리수 확인
  const parts = amount.split('.');
  if (parts.length > 1 && parts[1].length > decimals) {
    return false;
  }
  
  return true;
}

/**
 * 체인 ID 검증
 * @param chainId 체인 ID
 * @returns 유효성 여부
 */
export function isValidChainId(chainId: string | number): boolean {
  const idStr = chainId.toString();
  
  // 숫자인지 확인
  if (!/^\d+$/.test(idStr)) {
    return false;
  }
  
  // 범위 확인 (0과 2^64-1 사이)
  try {
    const idNum = BigInt(idStr);
    return idNum > BigInt(0) && idNum < BigInt('18446744073709551615'); // 2^64-1
  } catch (error) {
    return false;
  }
}

/**
 * 가스 가격 검증
 * @param gasPrice 가스 가격 (Gwei)
 * @param minGwei 최소 가격 (기본값: 1)
 * @param maxGwei 최대 가격 (기본값: 10000)
 * @returns 유효성 여부
 */
export function isValidGasPrice(
  gasPrice: string | number,
  minGwei: number = 1,
  maxGwei: number = 10000
): boolean {
  const priceStr = gasPrice.toString();
  
  // 숫자 형식 확인
  if (!/^\d*\.?\d*$/.test(priceStr)) {
    return false;
  }
  
  // 범위 확인
  const priceNum = parseFloat(priceStr);
  return priceNum >= minGwei && priceNum <= maxGwei;
}

/**
 * 가스 한도 검증
 * @param gasLimit 가스 한도
 * @param minLimit 최소 한도 (기본값: 21000)
 * @param maxLimit 최대 한도 (기본값: 15000000)
 * @returns 유효성 여부
 */
export function isValidGasLimit(
  gasLimit: string | number,
  minLimit: number = 21000,
  maxLimit: number = 15000000
): boolean {
  const limitStr = gasLimit.toString();
  
  // 숫자 형식 확인
  if (!/^\d+$/.test(limitStr)) {
    return false;
  }
  
  // 범위 확인
  const limitNum = parseInt(limitStr, 10);
  return limitNum >= minLimit && limitNum <= maxLimit;
}

/**
 * 수신자 주소 검증 (이더리움 주소, ENS 이름, zkDID)
 * @param recipient 수신자 주소 또는 이름
 * @returns 유효성 여부
 */
export function isValidRecipient(recipient: string): boolean {
  return isValidAddress(recipient) || isValidENS(recipient) || isValidZkDID(recipient);
}

/**
 * 16진수 데이터 검증
 * @param hex 16진수 데이터 문자열
 * @returns 유효성 여부
 */
export function isValidHex(hex: string): boolean {
  return /^0x[0-9a-fA-F]*$/.test(hex);
}

/**
 * 필수 필드 검증
 * @param obj 검증할 객체
 * @param requiredFields 필수 필드 목록
 * @returns 누락된 필드 목록 (비어있으면 모든 필드가 존재함)
 */
export function validateRequiredFields(obj: any, requiredFields: string[]): string[] {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      missingFields.push(field);
    }
  }
  
  return missingFields;
}

/**
 * 객체 유효성 검증
 * @param obj 검증할 객체
 * @param schema 스키마 객체 (필드 이름과 검증 함수)
 * @returns 검증 오류 목록 (비어있으면 모든 필드가 유효함)
 */
export function validateObject(
  obj: any,
  schema: Record<string, (value: any) => boolean>
): Record<string, boolean> {
  const errors: Record<string, boolean> = {};
  
  for (const [field, validator] of Object.entries(schema)) {
    if (obj[field] !== undefined && !validator(obj[field])) {
      errors[field] = false;
    }
  }
  
  return errors;
}

/**
 * 토큰 심볼 검증
 * @param symbol 토큰 심볼
 * @returns 유효성 여부
 */
export function isValidTokenSymbol(symbol: string): boolean {
  // 1-10자 영문자, 숫자, 일부 특수문자만 허용
  return /^[A-Za-z0-9.\-_]{1,10}$/.test(symbol);
}

/**
 * 토큰 이름 검증
 * @param name 토큰 이름
 * @returns 유효성 여부
 */
export function isValidTokenName(name: string): boolean {
  // 1-50자 허용
  return name.length >= 1 && name.length <= 50;
}

/**
 * 토큰 소수점 자리수 검증
 * @param decimals 소수점 자리수
 * @returns 유효성 여부
 */
export function isValidTokenDecimals(decimals: number | string): boolean {
  const decimalsNum = typeof decimals === 'string' ? parseInt(decimals, 10) : decimals;
  
  // 0-18 범위 확인
  return Number.isInteger(decimalsNum) && decimalsNum >= 0 && decimalsNum <= 18;
}

/**
 * 일반 텍스트 검증 (길이, 허용 문자 등)
 * @param text 검증할 텍스트
 * @param minLength 최소 길이
 * @param maxLength 최대 길이
 * @param pattern 허용 패턴 (정규 표현식)
 * @returns 유효성 여부
 */
export function isValidText(
  text: string,
  minLength: number = 0,
  maxLength: number = 1000,
  pattern?: RegExp
): boolean {
  if (text.length < minLength || text.length > maxLength) {
    return false;
  }
  
  if (pattern && !pattern.test(text)) {
    return false;
  }
  
  return true;
}

/**
 * 이름 검증 (계정 이름, 네트워크 이름 등)
 * @param name 이름
 * @returns 유효성 여부
 */
export function isValidName(name: string): boolean {
  return isValidText(name, 1, 50);
}

/**
 * RPC URL 검증
 * @param url RPC URL
 * @returns 유효성 여부
 */
export function isValidRpcUrl(url: string): boolean {
  // 기본 URL 형식 검사
  if (!isValidUrl(url)) {
    return false;
  }
  
  // 일반적인 RPC URL 패턴 확인
  const rpcUrlRegex = /^https?:\/\/([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(:[0-9]+)?(\/[-a-zA-Z0-9()@:%_\+.~#?&//=]*)?$/;
  return rpcUrlRegex.test(url);
}

/**
 * 계정 로컬 식별자 생성
 * @param address 계정 주소
 * @param type 계정 유형 (선택 사항)
 * @returns 로컬 식별자
 */
export function generateAccountId(address: string, type?: string): string {
  const normalizedAddress = address.toLowerCase();
  const typeStr = type ? `-${type}` : '';
  
  return `account-${normalizedAddress}${typeStr}`;
}

/**
 * 날짜 유효성 검사
 * @param date 날짜 문자열 또는 객체
 * @returns 유효성 여부
 */
export function isValidDate(date: string | Date): boolean {
  if (typeof date === 'string') {
    // ISO 형식 날짜 문자열 확인
    return !isNaN(Date.parse(date));
  } else {
    // Date 객체 확인
    return date instanceof Date && !isNaN(date.getTime());
  }
}

/**
 * 숫자 범위 검사
 * @param value 검사할 숫자
 * @param min 최소값
 * @param max 최대값
 * @returns 유효성 여부
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}
