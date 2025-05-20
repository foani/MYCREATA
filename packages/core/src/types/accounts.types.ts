/**
 * @file accounts.types.ts
 * @description 계정 관련 타입 정의
 */

import { HDNodeWallet } from 'ethers';

/**
 * 지갑 키링 타입
 */
export enum KeyringType {
  HD = 'HD', // 계층적 결정성 지갑
  PRIVATE_KEY = 'PRIVATE_KEY', // 단일 개인키 지갑
  HARDWARE = 'HARDWARE', // 하드웨어 지갑
  SOCIAL = 'SOCIAL', // 소셜 로그인 지갑
  ZKDID = 'ZKDID' // zkDID 기반 지갑
}

/**
 * 지갑 상태
 */
export enum WalletState {
  LOCKED = 'LOCKED', // 잠김 (암호화된 상태)
  UNLOCKED = 'UNLOCKED', // 잠금 해제됨 (사용 가능)
  UNINITIALIZED = 'UNINITIALIZED' // 초기화되지 않음
}

/**
 * 계정 상태
 */
export enum AccountState {
  ACTIVE = 'ACTIVE', // 활성 계정
  INACTIVE = 'INACTIVE', // 비활성 계정
  HIDDEN = 'HIDDEN' // 숨김 계정
}

/**
 * 니모닉 언어
 */
export type MnemonicLanguage =
  | 'english'
  | 'korean'
  | 'japanese'
  | 'spanish'
  | 'french'
  | 'italian'
  | 'czech'
  | 'portuguese'
  | 'chinese_simplified'
  | 'chinese_traditional';

/**
 * 계정 정보
 */
export interface Account {
  address: string; // 계정 주소
  name?: string; // 계정 이름 (선택 사항)
  type: KeyringType; // 계정 타입
  index?: number; // HD 지갑 인덱스 (HD 지갑인 경우)
  path?: string; // HD 지갑 경로 (HD 지갑인 경우)
  hardware?: HardwareInfo; // 하드웨어 지갑 정보 (하드웨어 지갑인 경우)
  did?: DIDInfo; // DID 정보 (DID 기반 지갑인 경우)
  state: AccountState; // 계정 상태
  icon?: string; // 계정 아이콘 (선택 사항)
  color?: string; // 계정 색상 (선택 사항)
  lastUsed?: number; // 마지막 사용 시간 (타임스탬프)
  createdAt: number; // 생성 시간 (타임스탬프)
  updatedAt: number; // 업데이트 시간 (타임스탬프)
  chainId: number; // 체인 ID
  publicKey?: string; // 공개키 (선택 사항)
  metadata?: Record<string, any>; // 추가 메타데이터 (선택 사항)
}

/**
 * 키링 계정 정보 (개인키 포함)
 */
export interface KeyringAccount {
  address: string; // 계정 주소
  privateKey: string; // 개인키
  publicKey: string; // 공개키
  index: number; // 계정 인덱스
  chainId: number; // 체인 ID
  path: string; // HD 지갑 경로
}

/**
 * 하드웨어 지갑 정보
 */
export interface HardwareInfo {
  type: 'ledger' | 'trezor' | 'keystone' | 'other'; // 하드웨어 지갑 타입
  deviceId?: string; // 디바이스 ID
  model?: string; // 디바이스 모델
  firmwareVersion?: string; // 펌웨어 버전
  path?: string; // 파생 경로
  connected?: boolean; // 연결 상태
  pairedAt?: number; // 페어링 시간 (타임스탬프)
}

/**
 * DID 정보
 */
export interface DIDInfo {
  did: string; // DID 식별자
  type: 'zkdid' | 'other'; // DID 타입
  controller?: string; // DID 컨트롤러 주소
  verificationMethod?: string; // 검증 메서드
  provider?: string; // 제공자 (예: 'telegram', 'google')
  recoverable?: boolean; // 복구 가능 여부
  createdAt: number; // 생성 시간 (타임스탬프)
  expiresAt?: number; // 만료 시간 (타임스탬프)
  metadata?: Record<string, any>; // 추가 메타데이터
}

/**
 * 키링 인터페이스
 */
export interface Keyring {
  type: KeyringType; // 키링 타입
  accounts: KeyringAccount[]; // 계정 목록
  addAccount(options?: any): Promise<KeyringAccount>; // 계정 추가
  removeAccount(address: string): Promise<boolean>; // 계정 제거
  getAccounts(): Promise<KeyringAccount[]>; // 계정 목록 조회
  getAccount(address: string): Promise<KeyringAccount | null>; // 특정 계정 조회
  signMessage(address: string, message: string): Promise<string>; // 메시지 서명
  signTransaction(address: string, transaction: any): Promise<string>; // 트랜잭션 서명
  exportAccount(address: string, password: string): Promise<string>; // 계정 내보내기
  exportMnemonic(password: string): Promise<string>; // 니모닉 내보내기 (HD 지갑인 경우)
}

/**
 * 지갑 옵션
 */
export interface IWalletOptions {
  type?: KeyringType; // 키링 타입
  mnemonic?: string; // 니모닉 구문 (HD 지갑인 경우)
  privateKey?: string; // 개인키 (PRIVATE_KEY 지갑인 경우)
  count?: number; // 생성할 계정 수 (HD 지갑인 경우)
  path?: string; // 커스텀 HD 경로 (HD 지갑인 경우)
  password?: string; // 암호화 비밀번호
  chainId?: number; // 체인 ID
  hardwareType?: string; // 하드웨어 지갑 타입
  did?: DIDInfo; // DID 정보
}

/**
 * 지갑 인터페이스
 */
export interface IWallet {
  state: WalletState; // 지갑 상태
  keyrings: Keyring[]; // 키링 목록
  accounts: Account[]; // 계정 목록
  
  // 지갑 관리 메서드
  init(): Promise<void>; // 지갑 초기화
  createNewVault(password: string, options?: IWalletOptions): Promise<string>; // 새 지갑 생성
  unlock(password: string): Promise<boolean>; // 지갑 잠금 해제
  lock(): Promise<void>; // 지갑 잠금
  
  // 계정 관리 메서드
  addAccount(options: IWalletOptions): Promise<Account>; // 계정 추가
  removeAccount(address: string): Promise<boolean>; // 계정 제거
  updateAccount(address: string, data: Partial<Account>): Promise<Account>; // 계정 업데이트
  getAccounts(): Promise<Account[]>; // 계정 목록 조회
  getAccount(address: string): Promise<Account | null>; // 특정 계정 조회
  
  // 서명 메서드
  signMessage(address: string, message: string): Promise<string>; // 메시지 서명
  signTypedData(address: string, typedData: any): Promise<string>; // 타입화된 데이터 서명
  signTransaction(address: string, transaction: any): Promise<string>; // 트랜잭션 서명
  
  // 내보내기/가져오기 메서드
  exportAccount(address: string, password: string): Promise<string>; // 계정 내보내기
  importAccount(options: IWalletOptions): Promise<Account>; // 계정 가져오기
  exportMnemonic(password: string): Promise<string>; // 니모닉 내보내기
  
  // 백업/복구 메서드
  getBackup(password: string): Promise<string>; // 백업 데이터 가져오기
  restoreFromBackup(backupData: string, password: string): Promise<boolean>; // 백업에서 복구
}

/**
 * BIP-32 경로 인덱스
 */
export interface PathIndex {
  value: number; // 인덱스 값
  hardened: boolean; // 하드닝 여부
}

/**
 * BIP-32 인터페이스
 */
export interface BIP32Interface {
  derive(path: string): HDNodeWallet; // 경로 기반 지갑 파생
  getRootNode(): HDNodeWallet; // 루트 노드 가져오기
  getMasterPrivateKey(): string; // 마스터 개인키 가져오기
  getMasterPublicKey(): string; // 마스터 공개키 가져오기
  getExtendedPrivateKey(): string; // 확장 개인키 가져오기
  getExtendedPublicKey(): string; // 확장 공개키 가져오기
  getChildNode(path: string): any; // 자식 노드 가져오기
  findAddressPath(address: string, coinType?: number, limit?: number): Promise<string | null>; // 주소로 경로 찾기
}

/**
 * BIP-44 파생 경로 정보
 */
export interface DerivationPath {
  path: string; // 전체 경로
  address: string; // 주소
  privateKey: string; // 개인키
  publicKey: string; // 공개키
  coinType: number; // 코인 타입
  account: number; // 계정 인덱스
  change: number; // 변경 플래그
  addressIndex: number; // 주소 인덱스
}

/**
 * BIP-44 인터페이스
 */
export interface BIP44Interface {
  getPath(coinType: number, account?: number, change?: number, addressIndex?: number): string; // 경로 생성
  parsePath(path: string): any; // 경로 파싱
  deriveAccount(coinType: number, account?: number, change?: number, addressIndex?: number): DerivationPath; // 계정 파생
  deriveAccounts(count: number, coinType?: number, account?: number, change?: number, startIndex?: number): DerivationPath[]; // 다중 계정 파생
  findAddressPath(address: string, coinType?: number, maxAccount?: number, maxAddresses?: number): Promise<DerivationPath | null>; // 주소로 경로 찾기
}

/**
 * 계정 정보 응답
 */
export interface AccountInfoResponse {
  address: string; // 주소
  name?: string; // 이름
  type: KeyringType; // 타입
  balance?: string; // 잔액
  tokens?: TokenInfo[]; // 토큰 목록
  transactions?: TransactionInfo[]; // 트랜잭션 목록
  createdAt: number; // 생성 시간
}

/**
 * 토큰 정보
 */
export interface TokenInfo {
  address: string; // 토큰 계약 주소
  symbol: string; // 토큰 심볼
  name: string; // 토큰 이름
  decimals: number; // 소수점 자릿수
  balance: string; // 잔액
  price?: number; // 가격 (USD)
  value?: number; // 총 가치 (USD)
  logo?: string; // 로고 URL
}

/**
 * 트랜잭션 정보
 */
export interface TransactionInfo {
  hash: string; // 트랜잭션 해시
  from: string; // 발신자 주소
  to: string; // 수신자 주소
  value: string; // 송금액
  gasPrice: string; // 가스 가격
  gasLimit: string; // 가스 한도
  nonce: number; // 논스
  data?: string; // 데이터
  status: 'pending' | 'success' | 'failed'; // 상태
  timestamp: number; // 타임스탬프
  blockNumber?: number; // 블록 번호
  chainId: number; // 체인 ID
}

/**
 * 지갑 상태 정보
 */
export interface WalletStateInfo {
  initialized: boolean; // 초기화 여부
  locked: boolean; // 잠금 여부
  accountsCount: number; // 계정 수
  selectedAccount?: string; // 선택된 계정 주소
  currentNetwork?: number; // 현재 네트워크 ID
}

/**
 * 복구 정보
 */
export interface RecoveryInfo {
  type: 'mnemonic' | 'privateKey' | 'keystore' | 'did'; // 복구 타입
  value: string; // 복구 값
  password?: string; // 비밀번호 (keystore인 경우)
  path?: string; // 경로 (mnemonic인 경우)
}

/**
 * 연결 정보
 */
export interface ConnectionInfo {
  id: string; // 연결 ID
  origin: string; // 출처 (도메인)
  name: string; // 연결 이름
  icon?: string; // 아이콘 URL
  permissions: string[]; // 권한 목록
  connectedAt: number; // 연결 시간
  lastAccessedAt: number; // 마지막 접근 시간
  accounts: string[]; // 연결된 계정 목록
}

/**
 * DID 생성 옵션
 */
export interface DIDOptions {
  type: 'zkdid'; // DID 타입
  provider: string; // 제공자 (예: 'telegram', 'google')
  credentials: any; // 인증 정보
  chainId?: number; // 체인 ID
}
