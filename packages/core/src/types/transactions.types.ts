/**
 * @file transactions.types.ts
 * @description 트랜잭션 관련 타입 정의
 */

/**
 * 트랜잭션 타입
 */
export enum TransactionType {
  LEGACY = 0, // 레거시 트랜잭션
  EIP2930 = 1, // EIP-2930 트랜잭션 (액세스 목록 포함)
  EIP1559 = 2 // EIP-1559 트랜잭션 (수수료 개선)
}

/**
 * 트랜잭션 상태
 */
export enum TransactionStatus {
  PENDING = 'pending', // 대기 중
  CONFIRMED = 'confirmed', // 확인됨
  FAILED = 'failed', // 실패
  DROPPED = 'dropped', // 삭제됨
  REPLACED = 'replaced' // 대체됨
}

/**
 * 트랜잭션 우선순위
 */
export enum TransactionPriority {
  LOW = 'low', // 낮음
  MEDIUM = 'medium', // 중간
  HIGH = 'high' // 높음
}

/**
 * 트랜잭션 인터페이스
 */
export interface Transaction {
  hash?: string; // 트랜잭션 해시
  from: string; // 발신자 주소
  to?: string; // 수신자 주소
  value: string; // 값 (wei 단위)
  data?: string; // 데이터
  nonce?: number; // 논스
  
  // 가스 관련
  gasLimit?: string; // 가스 한도
  gasPrice?: string; // 가스 가격 (레거시)
  maxFeePerGas?: string; // 최대 가스 수수료 (EIP-1559)
  maxPriorityFeePerGas?: string; // 최대 우선순위 수수료 (EIP-1559)
  
  // 체인 관련
  chainId: number; // 체인 ID
  
  // 트랜잭션 타입
  type?: TransactionType; // 트랜잭션 타입
  
  // EIP-2930 필드
  accessList?: Array<{ address: string; storageKeys: string[] }>; // 액세스 목록
  
  // 메타데이터
  meta?: TransactionMeta; // 메타데이터
}

/**
 * 트랜잭션 메타데이터
 */
export interface TransactionMeta {
  status: TransactionStatus; // 상태
  priority?: TransactionPriority; // 우선순위
  submittedAt: number; // 제출 시간
  confirmedAt?: number; // 확인 시간
  failedAt?: number; // 실패 시간
  blockNumber?: number; // 블록 번호
  blockHash?: string; // 블록 해시
  gasUsed?: string; // 사용된 가스
  effectiveGasPrice?: string; // 유효 가스 가격
  replacedBy?: string; // 대체된 트랜잭션 해시
  error?: string; // 에러 메시지
  isCancel?: boolean; // 취소 여부
  dappName?: string; // DApp 이름
  dappIconUrl?: string; // DApp 아이콘 URL
  methodSignature?: string; // 메서드 시그니처
  methodName?: string; // 메서드 이름
  decodedData?: any; // 디코딩된 데이터
  isSpeedUp?: boolean; // 스피드업 여부
  note?: string; // 메모
  tokenTransfers?: Array<{
    token: string; // 토큰 주소
    from: string; // 발신자 주소
    to: string; // 수신자 주소
    value: string; // 값
  }>; // 토큰 전송 정보
}

/**
 * 서명 요청 타입
 */
export enum SignatureRequestType {
  PERSONAL = 'personal_sign', // 개인 메시지 서명
  TYPED_DATA = 'eth_signTypedData', // 타입화된 데이터 서명
  TRANSACTION = 'eth_signTransaction', // 트랜잭션 서명
  RAW_HASH = 'sign_hash' // 해시 서명
}

/**
 * 서명 요청 인터페이스
 */
export interface SignatureRequest {
  id: string; // 요청 ID
  type: SignatureRequestType; // 요청 타입
  data: any; // 서명할 데이터
  account: string; // 서명자 주소
  origin?: string; // 요청 출처
  chainId: number; // 체인 ID
  createdAt: number; // 생성 시간
  deadline?: number; // 만료 시간
  meta?: {
    dappName?: string; // DApp 이름
    dappIconUrl?: string; // DApp 아이콘 URL
    description?: string; // 설명
  };
}

/**
 * 서명 응답 인터페이스
 */
export interface SignatureResponse {
  id: string; // 요청 ID
  signature: string; // 서명
  account: string; // 서명자 주소
  success: boolean; // 성공 여부
  error?: string; // 에러 메시지
  completedAt: number; // 완료 시간
}

/**
 * 트랜잭션 영수증 인터페이스
 */
export interface TransactionReceipt {
  to: string; // 수신자 주소
  from: string; // 발신자 주소
  contractAddress: string | null; // 계약 주소 (계약 생성 시)
  transactionIndex: number; // 트랜잭션 인덱스
  root?: string; // 상태 루트 (옛 블록)
  gasUsed: string; // 사용된 가스
  logsBloom: string; // 로그 블룸 필터
  blockHash: string; // 블록 해시
  transactionHash: string; // 트랜잭션 해시
  logs: Array<{
    transactionIndex: number; // 트랜잭션 인덱스
    blockNumber: number; // 블록 번호
    transactionHash: string; // 트랜잭션 해시
    address: string; // 주소
    topics: string[]; // 토픽
    data: string; // 데이터
    logIndex: number; // 로그 인덱스
    blockHash: string; // 블록 해시
  }>; // 이벤트 로그
  blockNumber: number; // 블록 번호
  confirmations: number; // 확인 수
  cumulativeGasUsed: string; // 누적 사용 가스
  effectiveGasPrice: string; // 유효 가스 가격
  status: number; // 상태 (1: 성공, 0: 실패)
  type: number; // 트랜잭션 타입
}

/**
 * 트랜잭션 요청 인터페이스
 */
export interface TransactionRequest {
  id: string; // 요청 ID
  transaction: Transaction; // 트랜잭션
  origin?: string; // 요청 출처
  createdAt: number; // 생성 시간
  deadline?: number; // 만료 시간
  meta?: {
    dappName?: string; // DApp 이름
    dappIconUrl?: string; // DApp 아이콘 URL
    description?: string; // 설명
  };
}

/**
 * 트랜잭션 응답 인터페이스
 */
export interface TransactionResponse {
  id: string; // 요청 ID
  hash?: string; // 트랜잭션 해시
  success: boolean; // 성공 여부
  error?: string; // 에러 메시지
  completedAt: number; // 완료 시간
}

/**
 * 가스 견적 인터페이스
 */
export interface GasEstimate {
  gasLimit: string; // 가스 한도
  gasPrice?: string; // 가스 가격 (레거시)
  maxFeePerGas?: string; // 최대 가스 수수료 (EIP-1559)
  maxPriorityFeePerGas?: string; // 최대 우선순위 수수료 (EIP-1559)
  estimatedBaseFee?: string; // 예상 기본 수수료 (EIP-1559)
  estimatedGasCost?: string; // 예상 가스 비용 (wei)
  type: TransactionType; // 트랜잭션 타입
}

/**
 * 트랜잭션 가속 옵션
 */
export interface SpeedUpOptions {
  gasPrice?: string; // 가스 가격 (레거시)
  maxFeePerGas?: string; // 최대 가스 수수료 (EIP-1559)
  maxPriorityFeePerGas?: string; // 최대 우선순위 수수료 (EIP-1559)
  type?: TransactionType; // 트랜잭션 타입
  multiplier?: number; // 승수 (기본 가스 가격 대비)
}

/**
 * 트랜잭션 취소 옵션
 */
export interface CancelOptions {
  gasPrice?: string; // 가스 가격 (레거시)
  maxFeePerGas?: string; // 최대 가스 수수료 (EIP-1559)
  maxPriorityFeePerGas?: string; // 최대 우선순위 수수료 (EIP-1559)
  type?: TransactionType; // 트랜잭션 타입
  multiplier?: number; // 승수 (기본 가스 가격 대비)
}

/**
 * 트랜잭션 이력 필터
 */
export interface TransactionHistoryFilter {
  address?: string; // 주소 (from 또는 to)
  from?: string; // 발신자 주소
  to?: string; // 수신자 주소
  status?: TransactionStatus; // 트랜잭션 상태
  startBlock?: number; // 시작 블록
  endBlock?: number; // 종료 블록
  startDate?: number; // 시작 날짜 (타임스탬프)
  endDate?: number; // 종료 날짜 (타임스탬프)
  chainId?: number; // 체인 ID
  limit?: number; // 결과 제한
  offset?: number; // 결과 오프셋
  token?: string; // 토큰 주소 (토큰 전송)
}

/**
 * 트랜잭션 모니터링 서비스 인터페이스
 */
export interface TransactionMonitoringService {
  addTransaction(transaction: Transaction): Promise<void>; // 트랜잭션 추가
  removeTransaction(hash: string): Promise<boolean>; // 트랜잭션 제거
  getTransaction(hash: string): Promise<Transaction | null>; // 트랜잭션 조회
  updateTransaction(hash: string, update: Partial<Transaction>): Promise<Transaction>; // 트랜잭션 업데이트
  getPendingTransactions(): Promise<Transaction[]>; // 대기 중인 트랜잭션 조회
  getTransactionsByAddress(address: string): Promise<Transaction[]>; // 주소별 트랜잭션 조회
  speedUpTransaction(hash: string, options: SpeedUpOptions): Promise<Transaction>; // 트랜잭션 가속
  cancelTransaction(hash: string, options: CancelOptions): Promise<Transaction>; // 트랜잭션 취소
  waitForTransaction(hash: string, confirmations?: number): Promise<TransactionReceipt>; // 트랜잭션 대기
}

/**
 * EIP-712 도메인
 */
export interface EIP712Domain {
  name: string; // 도메인 이름
  version: string; // 도메인 버전
  chainId: number; // 체인 ID
  verifyingContract: string; // 검증 계약 주소
  salt?: string; // 솔트 (선택 사항)
}

/**
 * 타입화된 데이터 서명 옵션
 */
export interface SignTypedDataOptions {
  types: Record<string, Array<{ name: string; type: string }>>; // 타입 정의
  primaryType?: string; // 주요 타입
  domain?: EIP712Domain; // 도메인
}

/**
 * 트랜잭션 서명 옵션
 */
export interface SignTransactionOptions {
  chainId?: number; // 체인 ID
  signerAddress?: string; // 서명자 주소
  estimateGas?: boolean; // 가스 추정 여부
  checkApproval?: boolean; // 승인 확인 여부
}

/**
 * 트랜잭션 제출 옵션
 */
export interface SubmitTransactionOptions {
  waitForConfirmation?: boolean; // 확인 대기 여부
  confirmations?: number; // 확인 수
  timeout?: number; // 타임아웃 (밀리초)
  estimateGas?: boolean; // 가스 추정 여부
  dappDetails?: {
    name?: string; // DApp 이름
    iconUrl?: string; // DApp 아이콘 URL
    url?: string; // DApp URL
  }; // DApp 상세 정보
  note?: string; // 메모
}

/**
 * 트랜잭션 히스토리 항목
 */
export interface TransactionHistoryItem {
  hash: string; // 트랜잭션 해시
  from: string; // 발신자 주소
  to: string; // 수신자 주소
  value: string; // 값
  fee?: string; // 수수료
  timestamp: number; // 타임스탬프
  blockNumber?: number; // 블록 번호
  status: TransactionStatus; // 상태
  chainId: number; // 체인 ID
  tokenTransfers?: Array<{
    token: string; // 토큰 주소
    from: string; // 발신자 주소
    to: string; // 수신자 주소
    value: string; // 값
    symbol?: string; // 토큰 심볼
    decimals?: number; // 토큰 소수점 자릿수
  }>; // 토큰 전송 정보
  methodName?: string; // 메서드 이름
  contractInteraction?: boolean; // 계약 상호작용 여부
  dappInfo?: {
    name?: string; // DApp 이름
    iconUrl?: string; // DApp 아이콘 URL
    url?: string; // DApp URL
  }; // DApp 정보
  note?: string; // 메모
}

/**
 * 트랜잭션 그룹화 기준
 */
export enum TransactionGroupBy {
  DATE = 'date', // 날짜별
  DAPP = 'dapp', // DApp별
  TYPE = 'type', // 타입별
  STATUS = 'status', // 상태별
  NONE = 'none' // 그룹화 없음
}

/**
 * 트랜잭션 정렬 기준
 */
export enum TransactionSortBy {
  DATE_ASC = 'date_asc', // 날짜 오름차순
  DATE_DESC = 'date_desc', // 날짜 내림차순
  VALUE_ASC = 'value_asc', // 값 오름차순
  VALUE_DESC = 'value_desc', // 값 내림차순
  FEE_ASC = 'fee_asc', // 수수료 오름차순
  FEE_DESC = 'fee_desc' // 수수료 내림차순
}

/**
 * 트랜잭션 분석 결과
 */
export interface TransactionAnalysis {
  type: 'transfer' | 'tokenTransfer' | 'swap' | 'approve' | 'contractCall' | 'contractCreation' | 'unknown'; // 분석 타입
  methodName?: string; // 메서드 이름
  methodSignature?: string; // 메서드 시그니처
  decodedInputData?: any; // 디코딩된 입력 데이터
  tokenTransfers?: Array<{
    token: string; // 토큰 주소
    from: string; // 발신자 주소
    to: string; // 수신자 주소
    value: string; // 값
    symbol?: string; // 토큰 심볼
    decimals?: number; // 토큰 소수점 자릿수
  }>; // 토큰 전송 정보
  contractAddress?: string; // 계약 주소
  riskLevel?: 'low' | 'medium' | 'high' | 'unknown'; // 위험 수준
  riskFactors?: string[]; // 위험 요소
  simulation?: {
    success: boolean; // 성공 여부
    error?: string; // 에러 메시지
    logs?: any[]; // 로그
    stateChanges?: any[]; // 상태 변경
  }; // 시뮬레이션 결과
}
