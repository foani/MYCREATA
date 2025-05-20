/**
 * @file chain.types.ts
 * @description 블록체인 네트워크 관련 타입 정의
 */

/**
 * 네트워크 타입
 */
export enum NetworkType {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
  DEVNET = 'devnet',
  CUSTOM = 'custom'
}

/**
 * 네트워크 정보 인터페이스
 */
export interface NetworkInfo {
  name: string; // 네트워크 이름
  chainId: number; // 체인 ID
  networkId?: number; // 네트워크 ID (이더리움)
  rpcUrl: string; // RPC URL
  blockExplorerUrl?: string; // 블록 탐색기 URL
  symbol: string; // 기본 통화 심볼
  decimals: number; // 기본 통화 소수점 자릿수
  type: NetworkType; // 네트워크 타입
  logo?: string; // 로고 URL
  nativeCurrency: {
    name: string; // 기본 통화 이름
    symbol: string; // 기본 통화 심볼
    decimals: number; // 기본 통화 소수점 자릿수
  };
  enabled: boolean; // 활성화 여부
  order?: number; // 표시 순서
  gasStationUrl?: string; // 가스 스테이션 URL
  ensAddress?: string; // ENS 레지스트리 주소
  namedChainId?: string; // 체인 ID 이름 (예: 'ethereum', 'catena')
  testnet?: boolean; // 테스트넷 여부
  feature?: ChainFeature[]; // 지원 기능
  metadata?: Record<string, any>; // 추가 메타데이터
}

/**
 * 체인 기능
 */
export enum ChainFeature {
  EIP1559 = 'EIP1559', // EIP-1559 (수수료 개선)
  ENS = 'ENS', // 이더리움 네임 서비스
  NFT = 'NFT', // NFT 지원
  DEFI = 'DEFI', // DeFi 지원
  ERC20 = 'ERC20', // ERC-20 토큰 지원
  DID = 'DID', // DID 지원
  STAKING = 'STAKING', // 스테이킹 지원
  CATENA = 'CATENA', // Catena 체인 기능
  BRIDGE = 'BRIDGE' // 브릿지 지원
}

/**
 * 지원하는 체인
 */
export enum SupportedChainId {
  CATENA_MAINNET = 1000,
  CATENA_TESTNET = 9000,
  ETHEREUM = 1,
  ETHEREUM_GOERLI = 5,
  ETHEREUM_SEPOLIA = 11155111,
  POLYGON = 137,
  POLYGON_MUMBAI = 80001,
  ARBITRUM = 42161,
  ARBITRUM_GOERLI = 421613,
  BSC = 56,
  BSC_TESTNET = 97
}

/**
 * 체인 ID를 이름으로 변환하는 맵
 */
export const CHAIN_ID_TO_NAME: Record<number, string> = {
  [SupportedChainId.CATENA_MAINNET]: 'Catena Mainnet',
  [SupportedChainId.CATENA_TESTNET]: 'Catena Testnet',
  [SupportedChainId.ETHEREUM]: 'Ethereum Mainnet',
  [SupportedChainId.ETHEREUM_GOERLI]: 'Ethereum Goerli Testnet',
  [SupportedChainId.ETHEREUM_SEPOLIA]: 'Ethereum Sepolia Testnet',
  [SupportedChainId.POLYGON]: 'Polygon Mainnet',
  [SupportedChainId.POLYGON_MUMBAI]: 'Polygon Mumbai Testnet',
  [SupportedChainId.ARBITRUM]: 'Arbitrum One',
  [SupportedChainId.ARBITRUM_GOERLI]: 'Arbitrum Goerli Testnet',
  [SupportedChainId.BSC]: 'BNB Smart Chain',
  [SupportedChainId.BSC_TESTNET]: 'BNB Smart Chain Testnet'
};

/**
 * 체인 ID를 심볼로 변환하는 맵
 */
export const CHAIN_ID_TO_SYMBOL: Record<number, string> = {
  [SupportedChainId.CATENA_MAINNET]: 'CTA',
  [SupportedChainId.CATENA_TESTNET]: 'CTA',
  [SupportedChainId.ETHEREUM]: 'ETH',
  [SupportedChainId.ETHEREUM_GOERLI]: 'ETH',
  [SupportedChainId.ETHEREUM_SEPOLIA]: 'ETH',
  [SupportedChainId.POLYGON]: 'MATIC',
  [SupportedChainId.POLYGON_MUMBAI]: 'MATIC',
  [SupportedChainId.ARBITRUM]: 'ETH',
  [SupportedChainId.ARBITRUM_GOERLI]: 'ETH',
  [SupportedChainId.BSC]: 'BNB',
  [SupportedChainId.BSC_TESTNET]: 'BNB'
};

/**
 * 체인 아이콘 URL
 */
export const CHAIN_ID_TO_ICON: Record<number, string> = {
  [SupportedChainId.CATENA_MAINNET]: 'https://assets.creatachain.com/icons/catena.svg',
  [SupportedChainId.CATENA_TESTNET]: 'https://assets.creatachain.com/icons/catena-testnet.svg',
  [SupportedChainId.ETHEREUM]: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  [SupportedChainId.ETHEREUM_GOERLI]: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  [SupportedChainId.ETHEREUM_SEPOLIA]: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  [SupportedChainId.POLYGON]: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
  [SupportedChainId.POLYGON_MUMBAI]: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
  [SupportedChainId.ARBITRUM]: 'https://assets.coingecko.com/coins/images/16547/small/arbitrum.png',
  [SupportedChainId.ARBITRUM_GOERLI]: 'https://assets.coingecko.com/coins/images/16547/small/arbitrum.png',
  [SupportedChainId.BSC]: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
  [SupportedChainId.BSC_TESTNET]: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png'
};

/**
 * 체인 정보 인터페이스
 */
export interface ChainInfo {
  readonly id: SupportedChainId; // 체인 ID
  readonly name: string; // 체인 이름
  readonly symbol: string; // 기본 통화 심볼
  readonly decimals: number; // 기본 통화 소수점 자릿수
  readonly logoUrl: string; // 로고 URL
  readonly addresses: ChainAddresses; // 체인 주소
  readonly blockExplorerUrl: string; // 블록 탐색기 URL
  readonly isTestnet: boolean; // 테스트넷 여부
}

/**
 * 체인 주소 인터페이스
 */
export interface ChainAddresses {
  readonly ensRegistryAddress?: string; // ENS 레지스트리 주소
  readonly multicallAddress?: string; // Multicall 주소
  readonly wrappedNativeToken?: string; // 래핑된 네이티브 토큰 주소
  readonly usdcToken?: string; // USDC 토큰 주소
  readonly didRegistryAddress?: string; // DID 레지스트리 주소
  readonly wormholeAddress?: string; // Wormhole 브릿지 주소
}

/**
 * RPC 제공자 설정
 */
export interface RpcProviderOptions {
  url: string; // RPC URL
  timeout?: number; // 타임아웃 (밀리초)
  headers?: Record<string, string>; // 헤더
  apiKey?: string; // API 키
  batchSize?: number; // 배치 크기
  pollingInterval?: number; // 폴링 주기 (밀리초)
  reconnectionDelay?: number; // 재연결 지연 (밀리초)
  maxRetries?: number; // 최대 재시도 횟수
  proxyUrl?: string; // 프록시 URL
  projectId?: string; // 프로젝트 ID
}

/**
 * RPC 응답 에러
 */
export interface RpcResponseError {
  code: number; // 에러 코드
  message: string; // 에러 메시지
  data?: any; // 추가 데이터
}

/**
 * RPC 제공자 인터페이스
 */
export interface RpcProvider {
  chainId: number; // 체인 ID
  url: string; // RPC URL
  
  // 메서드
  send(method: string, params: any[]): Promise<any>; // 메서드 호출
  getBalance(address: string): Promise<string>; // 잔액 조회
  getCode(address: string): Promise<string>; // 코드 조회
  getTransactionCount(address: string): Promise<number>; // 트랜잭션 수 조회
  getBlock(blockHashOrNumber: string | number): Promise<any>; // 블록 조회
  getTransaction(transactionHash: string): Promise<any>; // 트랜잭션 조회
  estimateGas(transaction: any): Promise<string>; // 가스 예상
  call(transaction: any): Promise<string>; // 호출
  sendTransaction(signedTransaction: string): Promise<string>; // 트랜잭션 전송
  
  // 이벤트
  on(event: string, listener: (...args: any[]) => void): void; // 이벤트 리스너 등록
  once(event: string, listener: (...args: any[]) => void): void; // 일회성 이벤트 리스너 등록
  removeListener(event: string, listener: (...args: any[]) => void): void; // 이벤트 리스너 제거
}

/**
 * 체인 상태
 */
export interface ChainState {
  chainId: number; // 체인 ID
  latestBlock: number; // 최신 블록 번호
  gasPrice: string; // 가스 가격
  safeGasPrice?: string; // 안전 가스 가격
  proposeGasPrice?: string; // 제안 가스 가격
  fastGasPrice?: string; // 빠른 가스 가격
  currentNetworkId?: number; // 현재 네트워크 ID
  isConnected: boolean; // 연결 여부
  isMainnet: boolean; // 메인넷 여부
  errors?: string[]; // 에러 목록
  lastUpdated: number; // 마지막 업데이트 시간
}

/**
 * 가스 정보
 */
export interface GasInfo {
  gasPrice: string; // 가스 가격
  maxFeePerGas?: string; // 최대 가스 수수료 (EIP-1559)
  maxPriorityFeePerGas?: string; // 최대 우선순위 수수료 (EIP-1559)
  estimatedBaseFee?: string; // 예상 기본 수수료 (EIP-1559)
  gasPriceType?: 'legacy' | 'eip1559'; // 가스 가격 타입
  
  // 추천 가스 가격
  safeLow?: string; // 낮은 가격 (느림)
  standard?: string; // 표준 가격
  fast?: string; // 빠른 가격
  fastest?: string; // 가장 빠른 가격
  
  baseFeePerGas?: string; // 기본 수수료 (EIP-1559)
  suggestedPriorityFee?: string; // 제안된 우선순위 수수료 (EIP-1559)
  networkCongestion?: number; // 네트워크 혼잡도 (0-1)
  latestBlock?: number; // 최신 블록 번호
  baseFeeHistory?: string[]; // 기본 수수료 이력
  lastUpdated: number; // 마지막 업데이트 시간
}

/**
 * 토큰 표준
 */
export enum TokenStandard {
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
  BEP20 = 'BEP20',
  UNKNOWN = 'UNKNOWN'
}

/**
 * 토큰 검증 상태
 */
export enum TokenValidationStatus {
  VERIFIED = 'VERIFIED', // 검증됨
  UNVERIFIED = 'UNVERIFIED', // 검증되지 않음
  SUSPICIOUS = 'SUSPICIOUS', // 의심스러움
  BLOCKED = 'BLOCKED' // 차단됨
}

/**
 * 토큰 인터페이스
 */
export interface Token {
  address: string; // 토큰 계약 주소
  chainId: number; // 체인 ID
  name: string; // 토큰 이름
  symbol: string; // 토큰 심볼
  decimals: number; // 소수점 자릿수
  standard: TokenStandard; // 토큰 표준
  logoURI?: string; // 로고 URL
  validationStatus?: TokenValidationStatus; // 검증 상태
  isNative?: boolean; // 네이티브 토큰 여부
  coingeckoId?: string; // CoinGecko ID
  totalSupply?: string; // 총 공급량
  isImported?: boolean; // 사용자 추가 여부
}

/**
 * 스마트 계약 인터페이스
 */
export interface Contract {
  address: string; // 계약 주소
  chainId: number; // 체인 ID
  name?: string; // 계약 이름
  abi?: any[]; // ABI
  isVerified?: boolean; // 검증 여부
  deployedAt?: number; // 배포 시간
  createdAt: number; // 생성 시간
  lastUsedAt?: number; // 마지막 사용 시간
  bytecode?: string; // 바이트코드
  metadata?: any; // 메타데이터
}

/**
 * 체인 전환 결과
 */
export interface ChainSwitchResult {
  success: boolean; // 성공 여부
  chainId: number; // 체인 ID
  previousChainId?: number; // 이전 체인 ID
  error?: string; // 에러 메시지
  timestamp: number; // 타임스탬프
}

/**
 * 체인 추가 파라미터
 */
export interface AddChainParams {
  chainId: string; // 체인 ID (16진수)
  chainName: string; // 체인 이름
  nativeCurrency: {
    name: string; // 기본 통화 이름
    symbol: string; // 기본 통화 심볼
    decimals: number; // 기본 통화 소수점 자릿수
  };
  rpcUrls: string[]; // RPC URL 목록
  blockExplorerUrls?: string[]; // 블록 탐색기 URL 목록
  iconUrls?: string[]; // 아이콘 URL 목록
}
