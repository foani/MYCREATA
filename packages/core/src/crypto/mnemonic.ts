/**
 * @file mnemonic.ts
 * @description 니모닉 생성 및 처리 모듈
 */

import * as bip39 from 'bip39';
import * as CryptoJS from 'crypto-js';
import { MnemonicLanguage } from '../types/accounts.types';

/**
 * 지원되는 니모닉 언어 목록
 */
export const SUPPORTED_LANGUAGES = ['english', 'korean', 'japanese', 'spanish', 'french', 'italian', 'czech', 'portuguese', 'chinese_simplified', 'chinese_traditional'];

/**
 * 니모닉 강도에 따른 단어 수
 */
export const ENTROPY_BITS_TO_WORDS = {
  128: 12, // 12 단어
  160: 15, // 15 단어
  192: 18, // 18 단어
  224: 21, // 21 단어
  256: 24  // 24 단어
};

/**
 * 랜덤 니모닉을 생성합니다.
 * 
 * @param strength 니모닉 강도 (기본값: 128 비트, 12단어)
 * @param language 언어 (기본값: 영어)
 * @returns 생성된 니모닉 문구
 */
export function generateMnemonic(
  strength: number = 128,
  language: MnemonicLanguage = 'english'
): string {
  // 지원되는 언어인지 확인
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    throw new Error(`Unsupported language: ${language}`);
  }
  
  // 지원되는 강도인지 확인
  if (![128, 160, 192, 224, 256].includes(strength)) {
    throw new Error(`Invalid strength: ${strength}. Valid values are 128, 160, 192, 224, and 256.`);
  }
  
  // 해당 언어로 니모닉 생성
  bip39.setDefaultWordlist(language);
  return bip39.generateMnemonic(strength);
}

/**
 * 니모닉 문구의 유효성을 검증합니다.
 * 
 * @param mnemonic 검증할 니모닉 문구
 * @param language 언어 (자동 감지 시도)
 * @returns 유효성 여부 (true/false)
 */
export function validateMnemonic(
  mnemonic: string,
  language?: MnemonicLanguage
): boolean {
  // 언어가 지정되었으면 해당 언어로 검증
  if (language) {
    if (!SUPPORTED_LANGUAGES.includes(language)) {
      throw new Error(`Unsupported language: ${language}`);
    }
    
    bip39.setDefaultWordlist(language);
    return bip39.validateMnemonic(mnemonic);
  }
  
  // 언어가 지정되지 않았으면 모든 지원 언어로 검증 시도
  for (const lang of SUPPORTED_LANGUAGES) {
    bip39.setDefaultWordlist(lang as MnemonicLanguage);
    if (bip39.validateMnemonic(mnemonic)) {
      return true;
    }
  }
  
  return false;
}

/**
 * 니모닉에서 시드를 생성합니다.
 * 
 * @param mnemonic 니모닉 문구
 * @param passphrase 추가 패스프레이즈 (선택 사항)
 * @returns 시드 (16진수 문자열)
 */
export function mnemonicToSeed(mnemonic: string, passphrase: string = ''): string {
  return bip39.mnemonicToSeedSync(mnemonic, passphrase).toString('hex');
}

/**
 * 니모닉에서 엔트로피를 추출합니다.
 * 
 * @param mnemonic 니모닉 문구
 * @returns 엔트로피 (16진수 문자열)
 */
export function mnemonicToEntropy(mnemonic: string): string {
  return bip39.mnemonicToEntropy(mnemonic);
}

/**
 * 엔트로피에서 니모닉을 생성합니다.
 * 
 * @param entropy 엔트로피 (16진수 문자열)
 * @param language 언어 (기본값: 영어)
 * @returns 니모닉 문구
 */
export function entropyToMnemonic(
  entropy: string,
  language: MnemonicLanguage = 'english'
): string {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    throw new Error(`Unsupported language: ${language}`);
  }
  
  bip39.setDefaultWordlist(language);
  return bip39.entropyToMnemonic(entropy);
}

/**
 * 니모닉을 암호화합니다.
 * 
 * @param mnemonic 암호화할 니모닉
 * @param password 암호화에 사용할 비밀번호
 * @returns 암호화된 니모닉
 */
export function encryptMnemonic(mnemonic: string, password: string): string {
  return CryptoJS.AES.encrypt(mnemonic, password).toString();
}

/**
 * 암호화된 니모닉을 복호화합니다.
 * 
 * @param encryptedMnemonic 암호화된 니모닉
 * @param password 복호화에 사용할 비밀번호
 * @returns 복호화된 니모닉
 * @throws 비밀번호가 올바르지 않은 경우 에러를 발생시킵니다.
 */
export function decryptMnemonic(encryptedMnemonic: string, password: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedMnemonic, password);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Failed to decrypt mnemonic');
    }
    
    return decrypted;
  } catch (error) {
    throw new Error('Invalid password or corrupted mnemonic');
  }
}

/**
 * 니모닉에서 단어 수를 계산합니다.
 * 
 * @param mnemonic 니모닉 문구
 * @returns 단어 수
 */
export function getWordCount(mnemonic: string): number {
  return mnemonic.trim().split(/\s+/).length;
}

/**
 * 단어 수에 해당하는 니모닉 강도를 반환합니다.
 * 
 * @param wordCount 단어 수
 * @returns 니모닉 강도 (비트)
 */
export function getEntropyBitsByWordCount(wordCount: number): number {
  const entropyBits = Object.entries(ENTROPY_BITS_TO_WORDS)
    .find(([, words]) => words === wordCount);
  
  if (!entropyBits) {
    throw new Error(`Invalid word count: ${wordCount}`);
  }
  
  return parseInt(entropyBits[0], 10);
}
