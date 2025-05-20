/**
 * 블록체인 트랜잭션 정보
 */
export interface Transaction {
  /**
   * 트랜잭션 해시
   */
  hash: string;
  
  /**
   * 발신자 주소
   */
  from: string;
  
  /**
   * 수신자 주소
   */
  to: string;
  
  /**
   * 전송 값 (wei 단위)
   */
  value: string;
  
  /**
   * 가스 한도
   */
  gas: string;
  
  /**
   * 가스 가격 (wei 단위)
   */
  gasPrice: string;
  
  /**
   * 호출 데이터
   */
  data: string;
  
  /**
   * 논스
   */
  nonce: string;
  
  /**
   * 체인 ID
   */
  chainId: string;
  
  /**
   * 트랜잭션 타입 (EIP-2718)
   */
  type?: string;
  
  /**
   * 최대 우선순위 수수료 (EIP-1559)
   */
  maxPriorityFeePerGas?: string;
  
  /**
   * 최대 수수료 (EIP-1559)
   */
  maxFeePerGas?: string;
  
  /**
   * 접근 목록 (EIP-2930)
   */
  accessList?: Array<{
    address: string;
    storageKeys: string[];
  }>;
}

/**
 * 트랜잭션 영수증
 */
export interface TransactionReceipt {
  /**
   * 트랜잭션 해시
   */
  transactionHash: string;
  
  /**
   * 트랜잭션 인덱스
   */
  transactionIndex: string;
  
  /**
   * 블록 해시
   */
  blockHash: string;
  
  /**
   * 블록 번호
   */
  blockNumber: string;
  
  /**
   * 발신자 주소
   */
  from: string;
  
  /**
   * 수신자 주소
   */
  to: string;
  
  /**
   * 누적 가스 사용량
   */
  cumulativeGasUsed: string;
  
  /**
   * 가스 사용량
   */
  gasUsed: string;
  
  /**
   * 생성된 계약 주소 (계약 생성 트랜잭션인 경우)
   */
  contractAddress: string | null;
  
  /**
   * 로그 배열
   */
  logs: Array<{
    address: string;
    topics: string[];
    data: string;
    blockNumber: string;
    blockHash: string;
    transactionHash: string;
    transactionIndex: string;
    logIndex: string;
    removed: boolean;
  }>;
  
  /**
   * 블룸 필터
   */
  logsBloom: string;
  
  /**
   * 상태 코드 (1=성공, 0=실패)
   */
  status: string;
  
  /**
   * 트랜잭션 유형
   */
  type: string;
  
  /**
   * 실효 가스 가격
   */
  effectiveGasPrice: string;
}

/**
 * 가스 정보
 */
export interface GasInfo {
  /**
   * 가스 가격 (wei 단위)
   */
  gasPrice?: string;
  
  /**
   * 최대 우선순위 수수료 (wei 단위, EIP-1559)
   */
  maxPriorityFeePerGas?: string;
  
  /**
   * 최대 수수료 (wei 단위, EIP-1559)
   */
  maxFeePerGas?: string;
  
  /**
   * 가스 한도
   */
  gasLimit: string;
}

/**
 * 서명된 트랜잭션
 */
export interface SignedTransaction {
  /**
   * 서명된 트랜잭션 데이터 (16진수 문자열)
   */
  rawTransaction: string;
  
  /**
   * 트랜잭션 해시
   */
  hash: string;
  
  /**
   * 서명 데이터
   */
  r: string;
  s: string;
  v: number;
  
  /**
   * 원본 트랜잭션 정보
   */
  from: string;
  to?: string;
  nonce: string;
  gasLimit: string;
  gasPrice?: string;
  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;
  data: string;
  value: string;
  chainId: string;
  type?: number;
}
