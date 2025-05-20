/**
 * @file bip32.ts
 * @description BIP-32 계층적 결정성 지갑 구현
 */

import { HDNodeWallet, Mnemonic } from 'ethers';
import { normalizeAddress } from '../../utils/address';
import { BIP32Interface, PathIndex } from '../../types/accounts.types';

/**
 * BIP-32 경로 구성 요소
 */
export enum BIP32PathLevels {
  PURPOSE = 0,
  COIN_TYPE = 1,
  ACCOUNT = 2,
  CHANGE = 3,
  ADDRESS_INDEX = 4
}

/**
 * 표준 BIP-32 경로
 */
export const STANDARD_DERIVATION_PATH = "m/44'/60'/0'/0/0";

/**
 * 코인 타입 식별자
 */
export enum CoinType {
  BITCOIN = 0,
  TESTNET = 1,
  LITECOIN = 2,
  DOGECOIN = 3,
  ETHEREUM = 60,
  ETHEREUM_CLASSIC = 61,
  CATENA = 1000
}

/**
 * BIP-32 경로를 생성합니다.
 * 
 * @param purpose 목적 (기본값: 44')
 * @param coinType 코인 타입 (기본값: 60', 이더리움)
 * @param account 계정 (기본값: 0')
 * @param change 변경 플래그 (기본값: 0)
 * @param addressIndex 주소 인덱스 (기본값: 0)
 * @returns BIP-32 경로 문자열
 */
export function createPath(
  purpose: number = 44,
  coinType: number = 60,
  account: number = 0,
  change: number = 0,
  addressIndex: number = 0
): string {
  return `m/${purpose}'/${coinType}'/${account}'/${change}/${addressIndex}`;
}

/**
 * BIP-32 경로에서 인덱스를 분석합니다.
 * 
 * @param path BIP-32 경로
 * @returns 분석된 인덱스 배열
 */
export function parsePath(path: string): PathIndex[] {
  // 경로가 'm/'으로 시작하는지 확인
  if (!path.startsWith('m/')) {
    throw new Error('Invalid path: must start with "m/"');
  }
  
  // 'm/' 이후의 부분 추출
  const indices = path.slice(2).split('/');
  
  // 각 인덱스 분석
  return indices.map(indexStr => {
    const hardened = indexStr.endsWith("'") || indexStr.endsWith("h");
    const value = parseInt(hardened ? indexStr.slice(0, -1) : indexStr, 10);
    
    if (isNaN(value)) {
      throw new Error(`Invalid path index: ${indexStr}`);
    }
    
    return { value, hardened };
  });
}

/**
 * BIP-32 모듈 구현
 */
export class BIP32 implements BIP32Interface {
  private rootNode: HDNodeWallet;
  
  /**
   * BIP-32 인스턴스를 생성합니다.
   * 
   * @param mnemonic 니모닉 문구 또는 Mnemonic 객체
   * @param passphrase 추가 패스프레이즈 (선택 사항)
   */
  constructor(mnemonic: string | Mnemonic, passphrase: string = '') {
    if (typeof mnemonic === 'string') {
      this.rootNode = HDNodeWallet.fromPhrase(mnemonic, passphrase);
    } else {
      this.rootNode = HDNodeWallet.fromMnemonic(mnemonic, passphrase);
    }
  }
  
  /**
   * 주어진 경로로 지갑을 파생합니다.
   * 
   * @param path 파생 경로
   * @returns 파생된 HD 노드 지갑
   */
  derive(path: string): HDNodeWallet {
    return this.rootNode.derivePath(path);
  }
  
  /**
   * 표준 이더리움 경로로 지갑을 파생합니다.
   * 
   * @param index 계정 인덱스
   * @returns 파생된 HD 노드 지갑
   */
  deriveEthereum(index: number = 0): HDNodeWallet {
    const path = `m/44'/60'/0'/0/${index}`;
    return this.derive(path);
  }
  
  /**
   * Catena 체인용 경로로 지갑을 파생합니다.
   * 
   * @param index 계정 인덱스
   * @returns 파생된 HD 노드 지갑
   */
  deriveCatena(index: number = 0): HDNodeWallet {
    const path = `m/44'/1000'/0'/0/${index}`;
    return this.derive(path);
  }
  
  /**
   * 지정된 코인 타입에 해당하는 경로로 지갑을 파생합니다.
   * 
   * @param coinType 코인 타입
   * @param index 계정 인덱스
   * @returns 파생된 HD 노드 지갑
   */
  deriveByCoinType(coinType: CoinType, index: number = 0): HDNodeWallet {
    const path = `m/44'/${coinType}'/0'/0/${index}`;
    return this.derive(path);
  }
  
  /**
   * 여러 계정을 파생합니다.
   * 
   * @param count 파생할 계정 수
   * @param coinType 코인 타입 (기본값: 이더리움)
   * @param startIndex 시작 인덱스
   * @returns 파생된 계정 정보 배열
   */
  deriveAccounts(
    count: number,
    coinType: CoinType = CoinType.ETHEREUM,
    startIndex: number = 0
  ): Array<{
    address: string;
    privateKey: string;
    publicKey: string;
    path: string;
    index: number;
  }> {
    const accounts = [];
    
    for (let i = 0; i < count; i++) {
      const index = startIndex + i;
      const path = `m/44'/${coinType}'/0'/0/${index}`;
      const wallet = this.derive(path);
      
      accounts.push({
        address: normalizeAddress(wallet.address),
        privateKey: wallet.privateKey,
        publicKey: wallet.publicKey,
        path,
        index
      });
    }
    
    return accounts;
  }
  
  /**
   * 루트 노드를 반환합니다.
   * 
   * @returns 루트 HD 노드 지갑
   */
  getRootNode(): HDNodeWallet {
    return this.rootNode;
  }
  
  /**
   * 마스터 개인키를 반환합니다.
   * 
   * @returns 마스터 개인키
   */
  getMasterPrivateKey(): string {
    return this.rootNode.privateKey;
  }
  
  /**
   * 마스터 공개키를 반환합니다.
   * 
   * @returns 마스터 공개키
   */
  getMasterPublicKey(): string {
    return this.rootNode.publicKey;
  }
  
  /**
   * 확장된 개인키를 반환합니다.
   * 
   * @returns 확장된 개인키
   */
  getExtendedPrivateKey(): string {
    return this.rootNode.extendedKey;
  }
  
  /**
   * 확장된 공개키를 반환합니다.
   * 
   * @returns 확장된 공개키
   */
  getExtendedPublicKey(): string {
    // HDNodeWallet에는 확장된 공개키를 직접 반환하는 메서드가 없으므로
    // 직접 계산 필요 (실제 구현에서는 ethers.js의 적절한 방법을 찾아야 함)
    return this.rootNode.neuter().extendedKey;
  }
  
  /**
   * 지정된 경로의 자식 노드를 찾습니다.
   * 
   * @param path 파생 경로
   * @returns 자식 노드 정보
   */
  getChildNode(path: string): {
    address: string;
    privateKey: string;
    publicKey: string;
    path: string;
  } {
    const childNode = this.derive(path);
    
    return {
      address: normalizeAddress(childNode.address),
      privateKey: childNode.privateKey,
      publicKey: childNode.publicKey,
      path
    };
  }
  
  /**
   * 지갑 주소를 검색합니다.
   * 
   * @param address 검색할 주소
   * @param coinType 코인 타입
   * @param limit 검색 한도
   * @returns 찾은 경우 파생 경로, 찾지 못한 경우 null
   */
  async findAddressPath(
    address: string,
    coinType: CoinType = CoinType.ETHEREUM,
    limit: number = 100
  ): Promise<string | null> {
    const normalizedAddress = normalizeAddress(address);
    
    for (let i = 0; i < limit; i++) {
      const path = `m/44'/${coinType}'/0'/0/${i}`;
      const wallet = this.derive(path);
      
      if (normalizeAddress(wallet.address) === normalizedAddress) {
        return path;
      }
    }
    
    return null;
  }
}

/**
 * 니모닉에서 BIP-32 인스턴스를 생성합니다.
 * 
 * @param mnemonic 니모닉 문구
 * @param passphrase 추가 패스프레이즈 (선택 사항)
 * @returns BIP-32 인스턴스
 */
export function fromMnemonic(mnemonic: string, passphrase: string = ''): BIP32 {
  return new BIP32(mnemonic, passphrase);
}

/**
 * 개인키에서 BIP-32 호환 지갑을 생성합니다.
 * (실제로는 BIP-32 파생이 불가능하지만, 인터페이스 호환성을 위해 제공)
 * 
 * @param privateKey 개인키
 * @returns 유사 BIP-32 인터페이스
 */
export function fromPrivateKey(privateKey: string): {
  derive: (path: string) => HDNodeWallet;
  getChildNode: (path: string) => {
    address: string;
    privateKey: string;
    publicKey: string;
    path: string;
  };
} {
  const wallet = new HDNodeWallet(privateKey);
  
  return {
    derive: () => wallet,
    getChildNode: (path: string) => ({
      address: normalizeAddress(wallet.address),
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      path
    })
  };
}
