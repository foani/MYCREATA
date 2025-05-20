/**
 * 브릿지 관련 상수 정의
 */

/**
 * 브릿지 트랜잭션 상태
 */
export enum BRIDGE_STATUS {
  PENDING = 'PENDING',           // 대기 중 (사용자 액션 필요)
  PROCESSING = 'PROCESSING',     // 처리 중 (소스 체인에서 트랜잭션 진행 중)
  READY_FOR_CLAIM = 'READY_FOR_CLAIM', // 클레임 준비 완료 (타겟 체인에서 클레임 필요)
  COMPLETED = 'COMPLETED',       // 완료됨
  FAILED = 'FAILED',             // 실패
  CANCELLED = 'CANCELLED'        // 취소됨
}

/**
 * 브릿지 트랜잭션 타입
 */
export enum BRIDGE_TYPE {
  LOCK_AND_MINT = 'LOCK_AND_MINT',   // 잠금 및 발행 (예: 원본 자산을 잠그고 래핑된 자산 발행)
  BURN_AND_RELEASE = 'BURN_AND_RELEASE', // 소각 및 해제 (예: 래핑된 자산을 소각하고 원본 자산 해제)
  ATOMIC_SWAP = 'ATOMIC_SWAP'        // 원자적 스왑 (직접 교환)
}

/**
 * 브릿지 지원 토큰 타입
 */
export enum BRIDGE_TOKEN_TYPE {
  NATIVE = 'NATIVE',            // 네이티브 토큰 (ETH, MATIC, CTA 등)
  ERC20 = 'ERC20',              // ERC20 토큰
  ERC721 = 'ERC721',            // ERC721 (NFT)
  ERC1155 = 'ERC1155'           // ERC1155 (다중 토큰)
}

/**
 * 브릿지 제공자 - 실제 사용할 브릿지 서비스
 */
export enum BRIDGE_PROVIDER {
  CATENA_BRIDGE = 'CATENA_BRIDGE',   // Catena 자체 브릿지
  LAYERZERO = 'LAYERZERO',           // LayerZero 브릿지
  AXELAR = 'AXELAR',                 // Axelar 브릿지
  WORMHOLE = 'WORMHOLE',             // Wormhole 브릿지
  CELER = 'CELER'                    // Celer 브릿지
}

/**
 * 브릿지 수수료 타입
 */
export enum BRIDGE_FEE_TYPE {
  FIXED = 'FIXED',             // 고정 수수료
  PERCENTAGE = 'PERCENTAGE',   // 퍼센트 기반 수수료
  DYNAMIC = 'DYNAMIC'          // 동적 수수료 (가스 비용 등에 따라 변동)
}

/**
 * 기본 브릿지 트랜잭션 타임아웃 (밀리초)
 */
export const DEFAULT_BRIDGE_TIMEOUT = 30 * 60 * 1000; // 30분

/**
 * 브릿지 상태 새로고침 간격 (밀리초)
 */
export const BRIDGE_REFRESH_INTERVAL = 15 * 1000; // 15초

/**
 * 최소 브릿지 수량
 * (토큰별로 다를 수 있지만 기본값)
 */
export const DEFAULT_MIN_BRIDGE_AMOUNT = '0.001';

/**
 * 최대 브릿지 수량
 * (토큰별로 다를 수 있지만 기본값)
 */
export const DEFAULT_MAX_BRIDGE_AMOUNT = '1000000';

/**
 * 체인 간 평균 브릿지 시간 (밀리초)
 * (실제 시간은 네트워크 상황에 따라 다를 수 있음)
 */
export const CHAIN_BRIDGE_TIME = {
  // Catena -> Ethereum
  'CATENA_ETHEREUM': 10 * 60 * 1000, // 10분
  
  // Catena -> Polygon
  'CATENA_POLYGON': 5 * 60 * 1000,  // 5분
  
  // Catena -> Arbitrum
  'CATENA_ARBITRUM': 8 * 60 * 1000, // 8분
  
  // 기본값
  'DEFAULT': 15 * 60 * 1000 // 15분
};