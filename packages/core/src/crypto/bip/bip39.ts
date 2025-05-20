/**
 * @file bip39.ts
 * @description BIP-39 니모닉 코드 구현
 */

import * as bip39 from 'bip39';
import { Mnemonic } from 'ethers';
import { MnemonicLanguage } from '../../types/accounts.types';

/**
 * 지원되는 니모닉 언어 목록
 */
export const SUPPORTED_LANGUAGES: MnemonicLanguage[] = [
  'english',
  'korean',
  'japanese',
  'spanish',
  'french',
  'italian',
  'czech',
  'portuguese',
  'chinese_simplified',
  'chinese_traditional'
];

/**
 * 니모닉 단어 수에 따른 엔트로피 비트 맵핑
 */
export const WORD_COUNT_TO_ENTROPY_BITS: { [key: number]: number } = {
  12: 128,
  15: 160,
  18: 192,
  21: 224,
  24: 256
};

/**
 * 니모닉 문구를 생성합니다.
 * 
 * @param wordCount 단어 수 (12, 15, 18, 21, 24)
 * @param language 니모닉 언어
 * @returns 생성된 니모닉 문구
 */
export function generateMnemonic(
  wordCount: number = 12,
  language: MnemonicLanguage = 'english'
): string {
  // 지원되는 단어 수인지 확인
  if (![12, 15, 18, 21, 24].includes(wordCount)) {
    throw new Error(`Invalid word count: ${wordCount}. Supported values are 12, 15, 18, 21, and 24.`);
  }
  
  // 지원되는 언어인지 확인
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    throw new Error(`Unsupported language: ${language}`);
  }
  
  // 단어 수에 해당하는 엔트로피 비트 계산
  const strength = WORD_COUNT_TO_ENTROPY_BITS[wordCount];
  
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
    bip39.setDefaultWordlist(lang);
    if (bip39.validateMnemonic(mnemonic)) {
      return true;
    }
  }
  
  return false;
}

/**
 * 니모닉의 언어를 감지합니다.
 * 
 * @param mnemonic 니모닉 문구
 * @returns 감지된 언어 또는 null
 */
export function detectMnemonicLanguage(mnemonic: string): MnemonicLanguage | null {
  for (const language of SUPPORTED_LANGUAGES) {
    bip39.setDefaultWordlist(language);
    if (bip39.validateMnemonic(mnemonic)) {
      return language;
    }
  }
  
  return null;
}

/**
 * 니모닉에서 시드를 생성합니다.
 * 
 * @param mnemonic 니모닉 문구
 * @param passphrase 추가 패스프레이즈 (선택 사항)
 * @returns 시드 (Uint8Array)
 */
export function mnemonicToSeed(mnemonic: string, passphrase: string = ''): Uint8Array {
  return bip39.mnemonicToSeedSync(mnemonic, passphrase);
}

/**
 * 니모닉에서 엔트로피를 추출합니다.
 * 
 * @param mnemonic 니모닉 문구
 * @returns 엔트로피 (Uint8Array)
 */
export function mnemonicToEntropy(mnemonic: string): Uint8Array {
  // 언어 감지
  const language = detectMnemonicLanguage(mnemonic);
  if (!language) {
    throw new Error('Invalid mnemonic or unsupported language');
  }
  
  bip39.setDefaultWordlist(language);
  return Buffer.from(bip39.mnemonicToEntropy(mnemonic), 'hex');
}

/**
 * 엔트로피에서 니모닉을 생성합니다.
 * 
 * @param entropy 엔트로피 (Uint8Array 또는 16진수 문자열)
 * @param language 언어 (기본값: 영어)
 * @returns 니모닉 문구
 */
export function entropyToMnemonic(
  entropy: Uint8Array | string,
  language: MnemonicLanguage = 'english'
): string {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    throw new Error(`Unsupported language: ${language}`);
  }
  
  bip39.setDefaultWordlist(language);
  
  // Uint8Array를 16진수 문자열로 변환
  let entropyHex: string;
  if (typeof entropy === 'string') {
    entropyHex = entropy.startsWith('0x') ? entropy.slice(2) : entropy;
  } else {
    entropyHex = Buffer.from(entropy).toString('hex');
  }
  
  return bip39.entropyToMnemonic(entropyHex);
}

/**
 * 니모닉 문구에서 단어 수를 계산합니다.
 * 
 * @param mnemonic 니모닉 문구
 * @returns 단어 수
 */
export function getWordCount(mnemonic: string): number {
  return mnemonic.trim().split(/\s+/).length;
}

/**
 * 특정 언어의 전체 니모닉 단어 목록을 반환합니다.
 * 
 * @param language 언어 (기본값: 영어)
 * @returns 단어 목록
 */
export function getWordlist(language: MnemonicLanguage = 'english'): string[] {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    throw new Error(`Unsupported language: ${language}`);
  }
  
  return bip39.wordlists[language];
}

/**
 * 니모닉 문구에서 ethers.js Mnemonic 객체를 생성합니다.
 * 
 * @param mnemonic 니모닉 문구
 * @returns Mnemonic 객체
 */
export function createMnemonic(mnemonic: string): Mnemonic {
  // 유효성 검증
  if (!validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic');
  }
  
  return Mnemonic.fromPhrase(mnemonic);
}

/**
 * 랜덤 니모닉 문구를 ethers.js Mnemonic 객체로 생성합니다.
 * 
 * @param wordCount 단어 수 (기본값: 12)
 * @returns Mnemonic 객체
 */
export function createRandomMnemonic(wordCount: number = 12): Mnemonic {
  // 유효한 단어 수인지 확인
  if (![12, 15, 18, 21, 24].includes(wordCount)) {
    throw new Error(`Invalid word count: ${wordCount}. Supported values are 12, 15, 18, 21, and 24.`);
  }
  
  // ethers.js는 자체적으로 단어 수를 설정하는 메서드가 없으므로
  // 먼저 bip39로 생성 후 ethers.js Mnemonic 객체로 변환
  const mnemonicPhrase = generateMnemonic(wordCount);
  return Mnemonic.fromPhrase(mnemonicPhrase);
}

/**
 * 니모닉 문구를 표준화합니다. (공백 정규화 등)
 * 
 * @param mnemonic 정규화할 니모닉 문구
 * @returns 정규화된 니모닉 문구
 */
export function normalizeMnemonic(mnemonic: string): string {
  // 여러 공백을 단일 공백으로 치환
  return mnemonic.trim().replace(/\s+/g, ' ');
}
