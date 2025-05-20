/**
 * @file keyManagement.ts
 * @description 키 생성 및 관리를 위한 유틸리티 모듈
 */

import * as bip39 from 'bip39';
import * as CryptoJS from 'crypto-js';
import { HDNodeWallet, Mnemonic, Wallet } from 'ethers';
import { normalizeAddress } from '../utils/address';
import { IWalletOptions, KeyringAccount, KeyringType } from '../types/accounts.types';

/**
 * 니모닉 시드를 생성합니다.
 * 
 * @param strength 니모닉 강도 (기본값: 128, 12단어)
 * @returns 생성된 니모닉 문구
 */
export function generateMnemonic(strength: number = 128): string {
  return bip39.generateMnemonic(strength);
}

/**
 * 니모닉 문구의 유효성을 검증합니다.
 * 
 * @param mnemonic 검증할 니모닉 문구
 * @returns 유효성 여부 (true/false)
 */
export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic);
}

/**
 * 니모닉에서 HD 지갑을 생성합니다.
 * 
 * @param mnemonic 니모닉 문구
 * @param path 파생 경로
 * @returns HDNodeWallet 인스턴스
 */
export function createHDWalletFromMnemonic(mnemonic: string, path?: string): HDNodeWallet {
  return HDNodeWallet.fromPhrase(mnemonic, undefined, path);
}

/**
 * 개인키에서 지갑을 생성합니다.
 * 
 * @param privateKey 개인키 (hex 문자열)
 * @returns Wallet 인스턴스
 */
export function createWalletFromPrivateKey(privateKey: string): Wallet {
  return new Wallet(privateKey);
}

/**
 * 특정 경로의 계정을 파생합니다.
 * 
 * @param mnemonic 니모닉 문구
 * @param index 계정 인덱스
 * @param chainId 체인 ID
 * @returns 파생된 계정 정보
 */
export function deriveAccount(mnemonic: string, index: number, chainId: number): KeyringAccount {
  // BIP-44 경로 m/44'/60'/0'/0/index 사용
  const path = `m/44'/60'/0'/0/${index}`;
  const wallet = createHDWalletFromMnemonic(mnemonic, path);
  
  return {
    address: normalizeAddress(wallet.address),
    privateKey: wallet.privateKey,
    publicKey: wallet.publicKey,
    index,
    chainId,
    path
  };
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
 * 키링을 생성합니다.
 * @param options 키링 생성 옵션
 * @returns 키링 정보
 */
export function createKeyring(options: IWalletOptions): {
  mnemonic: string;
  accounts: KeyringAccount[];
  type: KeyringType;
} {
  const { type = KeyringType.HD, count = 1, mnemonic: providedMnemonic } = options;
  
  // 키링 타입에 따라 다르게 처리
  if (type === KeyringType.HD) {
    // 니모닉이 제공되지 않았다면 새로 생성
    const mnemonic = providedMnemonic || generateMnemonic();
    
    // 계정 파생
    const accounts: KeyringAccount[] = [];
    for (let i = 0; i < count; i++) {
      // 기본적으로 Catena 메인넷 (ChainID: 1000)으로 계정 생성
      accounts.push(deriveAccount(mnemonic, i, 1000));
    }
    
    return { mnemonic, accounts, type };
  } else if (type === KeyringType.PRIVATE_KEY) {
    if (!options.privateKey) {
      throw new Error('Private key is required for PRIVATE_KEY type keyring');
    }
    
    const wallet = createWalletFromPrivateKey(options.privateKey);
    const account: KeyringAccount = {
      address: normalizeAddress(wallet.address),
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      index: 0,
      chainId: options.chainId || 1000,
      path: ''
    };
    
    return {
      mnemonic: '',
      accounts: [account],
      type
    };
  }
  
  throw new Error('Unsupported keyring type');
}

/**
 * 키스토어 JSON을 생성합니다 (Web3 Secret Storage 형식)
 * 
 * @param privateKey 개인키
 * @param password 암호화에 사용할 비밀번호
 * @returns 키스토어 JSON 문자열
 */
export async function createKeystore(privateKey: string, password: string): Promise<string> {
  const wallet = new Wallet(privateKey);
  const json = await wallet.encrypt(password);
  return json;
}

/**
 * 키스토어 JSON에서 지갑을 복구합니다.
 * 
 * @param keystoreJson 키스토어 JSON 문자열
 * @param password 복호화에 사용할 비밀번호
 * @returns 복구된 지갑 인스턴스
 */
export async function recoverFromKeystore(keystoreJson: string, password: string): Promise<Wallet> {
  try {
    return await Wallet.fromEncryptedJson(keystoreJson, password);
  } catch (error) {
    throw new Error('Invalid password or corrupted keystore');
  }
}
