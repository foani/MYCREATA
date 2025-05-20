/**
 * @file bip44.ts
 * @description BIP-44 계층적 결정성 지갑 구현
 */

import { HDNodeWallet } from 'ethers';
import { normalizeAddress } from '../../utils/address';
import { BIP32 } from './bip32';
import { CoinType } from './bip32';
import { BIP44Interface, DerivationPath } from '../../types/accounts.types';

/**
 * BIP-44 경로 레벨 정의
 */
export enum BIP44Levels {
  PURPOSE = 0,    // 항상 44'
  COIN_TYPE = 1,  // 코인 타입 (예: 60' = 이더리움)
  ACCOUNT = 2,    // 계정 (0' 부터 시작)
  CHANGE = 3,     // 외부(0) 또는 내부(1) 체인
  ADDRESS = 4     // 주소 인덱스
}

/**
 * BIP-44 경로 구성 요소
 */
export interface BIP44Path {
  purpose: number;
  coinType: number;
  account: number;
  change: number;
  addressIndex: number;
}

/**
 * BIP-44 기본 목적 값 (항상 44')
 */
export const BIP44_PURPOSE = 44;

/**
 * BIP-44 구현 클래스
 */
export class BIP44 implements BIP44Interface {
  private bip32: BIP32;
  
  /**
   * BIP-44 인스턴스를 생성합니다.
   * 
   * @param mnemonic 니모닉 문구
   * @param passphrase 추가 패스프레이즈 (선택 사항)
   */
  constructor(mnemonic: string, passphrase: string = '') {
    this.bip32 = new BIP32(mnemonic, passphrase);
  }
  
  /**
   * BIP-44 경로를 생성합니다.
   * 
   * @param coinType 코인 타입
   * @param account 계정 인덱스
   * @param change 변경 플래그 (0: 외부, 1: 내부)
   * @param addressIndex 주소 인덱스
   * @returns BIP-44 경로 문자열
   */
  getPath(
    coinType: number,
    account: number = 0,
    change: number = 0,
    addressIndex: number = 0
  ): string {
    return `m/${BIP44_PURPOSE}'/${coinType}'/${account}'/${change}/${addressIndex}`;
  }
  
  /**
   * 경로 문자열에서 경로 구성 요소를 파싱합니다.
   * 
   * @param path BIP-44 경로
   * @returns 파싱된 경로 구성 요소
   */
  parsePath(path: string): BIP44Path {
    // 경로 검증
    if (!path.startsWith('m/')) {
      throw new Error('Invalid path: must start with "m/"');
    }
    
    // 'm/' 이후의 부분 추출
    const segments = path.slice(2).split('/');
    
    // BIP-44 경로는 5개 세그먼트가 필요
    if (segments.length !== 5) {
      throw new Error(`Invalid BIP-44 path: expected 5 segments, got ${segments.length}`);
    }
    
    // 각 세그먼트 파싱
    const purpose = parseInt(segments[0].replace("'", ''), 10);
    const coinType = parseInt(segments[1].replace("'", ''), 10);
    const account = parseInt(segments[2].replace("'", ''), 10);
    const change = parseInt(segments[3], 10);
    const addressIndex = parseInt(segments[4], 10);
    
    // 목적 검증
    if (purpose !== BIP44_PURPOSE) {
      throw new Error(`Invalid BIP-44 purpose: ${purpose}`);
    }
    
    return {
      purpose,
      coinType,
      account,
      change,
      addressIndex
    };
  }
  
  /**
   * 이더리움 경로를 생성합니다.
   * 
   * @param account 계정 인덱스
   * @param change 변경 플래그 (0: 외부, 1: 내부)
   * @param addressIndex 주소 인덱스
   * @returns 이더리움 BIP-44 경로
   */
  getEthereumPath(
    account: number = 0,
    change: number = 0,
    addressIndex: number = 0
  ): string {
    return this.getPath(CoinType.ETHEREUM, account, change, addressIndex);
  }
  
  /**
   * Catena 경로를 생성합니다.
   * 
   * @param account 계정 인덱스
   * @param change 변경 플래그 (0: 외부, 1: 내부)
   * @param addressIndex 주소 인덱스
   * @returns Catena BIP-44 경로
   */
  getCatenaPath(
    account: number = 0,
    change: number = 0,
    addressIndex: number = 0
  ): string {
    return this.getPath(CoinType.CATENA, account, change, addressIndex);
  }
  
  /**
   * 이더리움 계정을 파생합니다.
   * 
   * @param account 계정 인덱스
   * @param change 변경 플래그 (0: 외부, 1: 내부)
   * @param addressIndex 주소 인덱스
   * @returns 파생된 지갑 및 경로 정보
   */
  deriveEthereumAccount(
    account: number = 0,
    change: number = 0,
    addressIndex: number = 0
  ): DerivationPath {
    const path = this.getEthereumPath(account, change, addressIndex);
    const wallet = this.bip32.derive(path);
    
    return {
      path,
      address: normalizeAddress(wallet.address),
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      coinType: CoinType.ETHEREUM,
      account,
      change,
      addressIndex
    };
  }
  
  /**
   * Catena 계정을 파생합니다.
   * 
   * @param account 계정 인덱스
   * @param change 변경 플래그 (0: 외부, 1: 내부)
   * @param addressIndex 주소 인덱스
   * @returns 파생된 지갑 및 경로 정보
   */
  deriveCatenaAccount(
    account: number = 0,
    change: number = 0,
    addressIndex: number = 0
  ): DerivationPath {
    const path = this.getCatenaPath(account, change, addressIndex);
    const wallet = this.bip32.derive(path);
    
    return {
      path,
      address: normalizeAddress(wallet.address),
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      coinType: CoinType.CATENA,
      account,
      change,
      addressIndex
    };
  }
  
  /**
   * 지정된 코인 타입에 대한 계정을 파생합니다.
   * 
   * @param coinType 코인 타입
   * @param account 계정 인덱스
   * @param change 변경 플래그 (0: 외부, 1: 내부)
   * @param addressIndex 주소 인덱스
   * @returns 파생된 지갑 및 경로 정보
   */
  deriveAccount(
    coinType: number,
    account: number = 0,
    change: number = 0,
    addressIndex: number = 0
  ): DerivationPath {
    const path = this.getPath(coinType, account, change, addressIndex);
    const wallet = this.bip32.derive(path);
    
    return {
      path,
      address: normalizeAddress(wallet.address),
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      coinType,
      account,
      change,
      addressIndex
    };
  }
  
  /**
   * 여러 계정을 파생합니다.
   * 
   * @param count 파생할 계정 수
   * @param coinType 코인 타입
   * @param account 시작 계정 인덱스
   * @param change 변경 플래그
   * @param startIndex 시작 주소 인덱스
   * @returns 파생된 지갑 목록
   */
  deriveAccounts(
    count: number,
    coinType: number = CoinType.ETHEREUM,
    account: number = 0,
    change: number = 0,
    startIndex: number = 0
  ): DerivationPath[] {
    const accounts: DerivationPath[] = [];
    
    for (let i = 0; i < count; i++) {
      const addressIndex = startIndex + i;
      const derivedAccount = this.deriveAccount(coinType, account, change, addressIndex);
      accounts.push(derivedAccount);
    }
    
    return accounts;
  }
  
  /**
   * 주소로 경로를 찾습니다.
   * 
   * @param address 찾을 주소
   * @param coinType 코인 타입
   * @param maxAccount 검색할 최대 계정 수
   * @param maxAddresses 각 계정당 검색할 최대 주소 수
   * @returns 찾은 경로 또는 null
   */
  async findAddressPath(
    address: string,
    coinType: number = CoinType.ETHEREUM,
    maxAccount: number = 5,
    maxAddresses: number = 20
  ): Promise<DerivationPath | null> {
    const normalizedAddress = normalizeAddress(address);
    
    // 계정 인덱스
    for (let account = 0; account < maxAccount; account++) {
      // 변경 플래그 (0: 외부, 1: 내부)
      for (let change = 0; change <= 1; change++) {
        // 주소 인덱스
        for (let addressIndex = 0; addressIndex < maxAddresses; addressIndex++) {
          const derivedAccount = this.deriveAccount(coinType, account, change, addressIndex);
          
          if (normalizeAddress(derivedAccount.address) === normalizedAddress) {
            return derivedAccount;
          }
        }
      }
    }
    
    return null;
  }
  
  /**
   * 특정 파생 경로로 HD 노드 지갑을 반환합니다.
   * 
   * @param path BIP-44 경로
   * @returns HD 노드 지갑
   */
  getWallet(path: string): HDNodeWallet {
    return this.bip32.derive(path);
  }
  
  /**
   * 기본 BIP-32 인스턴스를 반환합니다.
   * 
   * @returns BIP-32 인스턴스
   */
  getBIP32(): BIP32 {
    return this.bip32;
  }
}

/**
 * BIP-44 레벨에 대한 라벨을 반환합니다.
 * 
 * @param level BIP-44 레벨
 * @returns 레벨 라벨
 */
export function getLevelLabel(level: BIP44Levels): string {
  const labels: { [key in BIP44Levels]: string } = {
    [BIP44Levels.PURPOSE]: 'Purpose',
    [BIP44Levels.COIN_TYPE]: 'Coin Type',
    [BIP44Levels.ACCOUNT]: 'Account',
    [BIP44Levels.CHANGE]: 'Change',
    [BIP44Levels.ADDRESS]: 'Address Index'
  };
  
  return labels[level];
}

/**
 * 경로 문자열이 유효한 BIP-44 경로인지 확인합니다.
 * 
 * @param path 검증할 경로
 * @returns 유효성 여부 (true/false)
 */
export function isValidBIP44Path(path: string): boolean {
  try {
    const segments = path.slice(2).split('/');
    
    // BIP-44 경로는 5개 세그먼트가 필요
    if (segments.length !== 5) {
      return false;
    }
    
    // 목적 검증 (44')
    const purpose = segments[0].replace("'", '');
    if (parseInt(purpose, 10) !== BIP44_PURPOSE) {
      return false;
    }
    
    // 하드닝 검증
    if (!segments[0].endsWith("'") || !segments[1].endsWith("'") || !segments[2].endsWith("'")) {
      return false;
    }
    
    // 각 세그먼트가 숫자인지 확인
    for (const segment of segments) {
      const value = parseInt(segment.replace("'", ''), 10);
      if (isNaN(value)) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 니모닉에서 BIP-44 인스턴스를 생성합니다.
 * 
 * @param mnemonic 니모닉 문구
 * @param passphrase 추가 패스프레이즈 (선택 사항)
 * @returns BIP-44 인스턴스
 */
export function fromMnemonic(mnemonic: string, passphrase: string = ''): BIP44 {
  return new BIP44(mnemonic, passphrase);
}
