/**
 * 토큰 정보 타입
 */
export interface Token {
  /** 토큰 컨트랙트 주소 */
  address: string;
  
  /** 토큰 기호 */
  symbol: string;
  
  /** 토큰 이름 */
  name: string;
  
  /** 소수점 자릿수 */
  decimals: number;
  
  /** 토큰 잔액 (문자열 형태) */
  balance: string;
  
  /** 토큰 아이콘 URL */
  iconUrl: string | null;
}

/**
 * NFT 속성 타입
 */
export interface NFTAttribute {
  /** 속성 이름 */
  trait_type: string;
  
  /** 속성 값 */
  value: string | number;
}

/**
 * NFT 정보 타입
 */
export interface NFT {
  /** NFT 컨트랙트 주소 */
  contractAddress: string;
  
  /** NFT 토큰 ID */
  tokenId: string;
  
  /** NFT 이름 */
  name: string;
  
  /** NFT 설명 */
  description: string;
  
  /** NFT 이미지 URL */
  imageUrl: string;
  
  /** NFT 속성 목록 */
  attributes: NFTAttribute[];
}

/**
 * 트랜잭션 상태 타입
 */
export type TransactionStatus = 'pending' | 'success' | 'failed';

/**
 * 트랜잭션 정보 타입
 */
export interface Transaction {
  /** 트랜잭션 해시 */
  hash: string;
  
  /** 보낸 주소 */
  from: string;
  
  /** 받는 주소 */
  to: string;
  
  /** 전송 금액 (문자열 형태) */
  value: string;
  
  /** 토큰 컨트랙트 주소 (기본 토큰은 0x0) */
  tokenAddress: string;
  
  /** 트랜잭션 타임스탬프 */
  timestamp: number;
  
  /** 트랜잭션 상태 */
  status: TransactionStatus;
  
  /** 사용된 가스 */
  gasUsed: string;
  
  /** 가스 가격 (wei 단위) */
  gasPrice: string;
  
  /** 트랜잭션 데이터 (선택 사항) */
  data?: string;
  
  /** 트랜잭션 nonce (선택 사항) */
  nonce?: number;
}
