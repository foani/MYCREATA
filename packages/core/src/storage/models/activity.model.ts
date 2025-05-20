/**
 * activity.model.ts
 * 
 * 지갑 활동 내역 관련 데이터 모델 정의.
 */

/**
 * 활동 유형
 */
export enum ActivityType {
  TRANSACTION = 'transaction',     // 트랜잭션
  SIGNATURE = 'signature',         // 메시지 서명
  DAPP_CONNECTION = 'connection',  // DApp 연결
  TOKEN_APPROVAL = 'approval',     // 토큰 승인
  ACCOUNT_CHANGE = 'account',      // 계정 변경
  NETWORK_CHANGE = 'network',      // 네트워크 변경
  SETTINGS_CHANGE = 'settings',    // 설정 변경
  BACKUP = 'backup',               // 백업
  RECOVERY = 'recovery'            // 복구
}

/**
 * 트랜잭션 유형
 */
export enum TransactionType {
  SEND = 'send',              // 전송
  RECEIVE = 'receive',        // 수신
  SWAP = 'swap',              // 스왑
  CONTRACT_CALL = 'call',     // 컨트랙트 호출
  CONTRACT_DEPLOY = 'deploy', // 컨트랙트 배포
  NFT_MINT = 'mint',          // NFT 민팅
  NFT_TRANSFER = 'nft_transfer', // NFT 전송
  NFT_APPROVE = 'nft_approve',   // NFT 승인
  TOKEN_APPROVE = 'token_approve', // 토큰 승인
  STAKE = 'stake',            // 스테이킹
  UNSTAKE = 'unstake',        // 언스테이킹
  CLAIM = 'claim',            // 보상 청구
  BRIDGE = 'bridge',          // 브릿지
  CANCEL = 'cancel',          // 취소
  UNKNOWN = 'unknown'         // 알 수 없음
}

/**
 * 트랜잭션 상태
 */
export enum TransactionStatus {
  PENDING = 'pending',        // 대기 중
  CONFIRMED = 'confirmed',    // 확인됨
  FAILED = 'failed',          // 실패
  DROPPED = 'dropped',        // 삭제됨
  REPLACED = 'replaced',      // 대체됨
  REJECTED = 'rejected'       // 거부됨
}

/**
 * 서명 유형
 */
export enum SignatureType {
  PERSONAL = 'personal',      // 개인 메시지
  TYPED_DATA = 'typed_data',  // 타입 데이터 (EIP-712)
  TRANSACTION = 'transaction' // 트랜잭션
}

/**
 * 활동 기본 인터페이스
 */
export interface ActivityBase {
  id: string;               // 고유 ID
  type: ActivityType;       // 활동 유형
  accountId: string;        // 관련 계정 ID
  chainId: string;          // 체인 ID
  timestamp: number;        // 생성 시간
  metadata?: Record<string, any>; // 추가 메타데이터
}

/**
 * 트랜잭션 활동 인터페이스
 */
export interface TransactionActivity extends ActivityBase {
  type: ActivityType.TRANSACTION;
  transactionHash: string;         // 트랜잭션 해시
  transactionType: TransactionType; // 트랜잭션 유형
  status: TransactionStatus;       // 상태
  from: string;                    // 발신 주소
  to: string;                      // 수신 주소
  value: string;                   // 값 (wei/gwei 문자열)
  gasPrice?: string;               // 가스 가격
  gasLimit?: string;               // 가스 한도
  gasUsed?: string;                // 사용된 가스
  nonce?: number;                  // 논스
  data?: string;                   // 트랜잭션 데이터
  contractAddress?: string;        // 컨트랙트 주소 (배포 시)
  tokenSymbol?: string;            // 토큰 심볼
  tokenAmount?: string;            // 토큰 양
  tokenAddress?: string;           // 토큰 주소
  tokenDecimals?: number;          // 토큰 소수점
  tokenId?: string;                // NFT 토큰 ID
  dappName?: string;               // DApp 이름
  dappUrl?: string;                // DApp URL
  receipt?: any;                   // 트랜잭션 영수증
  error?: string;                  // 오류 메시지
}

/**
 * 서명 활동 인터페이스
 */
export interface SignatureActivity extends ActivityBase {
  type: ActivityType.SIGNATURE;
  signatureType: SignatureType;    // 서명 유형
  message: string;                 // 서명된 메시지
  signedData?: any;                // 서명된 데이터
  signature?: string;              // 서명 값
  dappName?: string;               // DApp 이름
  dappUrl?: string;                // DApp URL
  success: boolean;                // 성공 여부
  error?: string;                  // 오류 메시지
}

/**
 * DApp 연결 활동 인터페이스
 */
export interface DappConnectionActivity extends ActivityBase {
  type: ActivityType.DAPP_CONNECTION;
  dappName: string;                // DApp 이름
  dappUrl: string;                 // DApp URL
  connected: boolean;              // 연결 성공 여부
  permissions: string[];           // 승인된 권한
  revoked?: boolean;               // 권한 취소 여부
  revokedAt?: number;              // 권한 취소 시간
}

/**
 * 토큰 승인 활동 인터페이스
 */
export interface TokenApprovalActivity extends ActivityBase {
  type: ActivityType.TOKEN_APPROVAL;
  transactionHash: string;         // 트랜잭션 해시
  tokenAddress: string;            // 토큰 주소
  tokenSymbol: string;             // 토큰 심볼
  spender: string;                 // 토큰을 사용할 수 있는 주소
  amount: string;                  // 승인 금액
  unlimited: boolean;              // 무제한 승인 여부
  status: TransactionStatus;       // 상태
  dappName?: string;               // DApp 이름
  dappUrl?: string;                // DApp URL
  revoked?: boolean;               // 취소 여부
  revokedAt?: number;              // 취소 시간
}

/**
 * 계정 변경 활동 인터페이스
 */
export interface AccountChangeActivity extends ActivityBase {
  type: ActivityType.ACCOUNT_CHANGE;
  action: 'create' | 'import' | 'delete' | 'rename' | 'hide' | 'show';
  accountName: string;             // 계정 이름
  accountAddress: string;          // 계정 주소
}

/**
 * 네트워크 변경 활동 인터페이스
 */
export interface NetworkChangeActivity extends ActivityBase {
  type: ActivityType.NETWORK_CHANGE;
  fromNetworkId: string;           // 이전 네트워크 ID
  toNetworkId: string;             // 새 네트워크 ID
  fromNetworkName: string;         // 이전 네트워크 이름
  toNetworkName: string;           // 새 네트워크 이름
  automatic: boolean;              // 자동 전환 여부
}

/**
 * 활동 내역 타입 유니온
 */
export type Activity =
  | TransactionActivity
  | SignatureActivity
  | DappConnectionActivity
  | TokenApprovalActivity
  | AccountChangeActivity
  | NetworkChangeActivity
  | ActivityBase;

/**
 * 활동 내역 필터
 */
export interface ActivityFilter {
  types?: ActivityType[];
  transactionTypes?: TransactionType[];
  status?: TransactionStatus[];
  accountId?: string;
  chainId?: string;
  fromDate?: number;
  toDate?: number;
  dappName?: string;
  tokenAddress?: string;
  search?: string;
}

/**
 * 활동 내역 정렬 방식
 */
export enum ActivitySortOrder {
  NEWEST_FIRST = 'newest_first',
  OLDEST_FIRST = 'oldest_first'
}

/**
 * 활동 내역 관리 클래스
 */
export class ActivityModel {
  private activities: Activity[];
  private maxItems: number;
  
  /**
   * ActivityModel 생성자
   * @param initialActivities 초기 활동 내역
   * @param maxItems 최대 저장 항목 수
   */
  constructor(initialActivities: Activity[] = [], maxItems: number = 1000) {
    this.activities = initialActivities;
    this.maxItems = maxItems;
  }
  
  /**
   * 활동 추가
   * @param activity 활동 내역
   */
  public addActivity(activity: Activity): void {
    // 앞에 추가하여 최신 활동이 먼저 오도록 함
    this.activities.unshift(activity);
    
    // 최대 항목 수 유지
    if (this.activities.length > this.maxItems) {
      this.activities = this.activities.slice(0, this.maxItems);
    }
  }
  
  /**
   * 활동 업데이트
   * @param id 활동 ID
   * @param updates 업데이트할 필드
   * @returns 업데이트된 활동
   */
  public updateActivity<T extends Activity>(id: string, updates: Partial<T>): Activity | null {
    const index = this.activities.findIndex(a => a.id === id);
    
    if (index === -1) {
      return null;
    }
    
    this.activities[index] = {
      ...this.activities[index],
      ...updates
    };
    
    return this.activities[index];
  }
  
  /**
   * 활동 가져오기
   * @param id 활동 ID
   * @returns 활동 내역
   */
  public getActivity(id: string): Activity | null {
    return this.activities.find(a => a.id === id) || null;
  }
  
  /**
   * 트랜잭션 활동 가져오기
   * @param hash 트랜잭션 해시
   * @returns 트랜잭션 활동
   */
  public getTransactionByHash(hash: string): TransactionActivity | null {
    const activity = this.activities.find(
      a => a.type === ActivityType.TRANSACTION &&
      (a as TransactionActivity).transactionHash === hash
    );
    
    return activity as TransactionActivity || null;
  }
  
  /**
   * 트랜잭션 상태 업데이트
   * @param hash 트랜잭션 해시
   * @param status 새 상태
   * @param receipt 트랜잭션 영수증 (선택 사항)
   * @param error 오류 메시지 (선택 사항)
   * @returns 업데이트된 트랜잭션 활동
   */
  public updateTransactionStatus(
    hash: string,
    status: TransactionStatus,
    receipt?: any,
    error?: string
  ): TransactionActivity | null {
    const index = this.activities.findIndex(
      a => a.type === ActivityType.TRANSACTION &&
      (a as TransactionActivity).transactionHash === hash
    );
    
    if (index === -1) {
      return null;
    }
    
    const transaction = this.activities[index] as TransactionActivity;
    
    const updates: Partial<TransactionActivity> = {
      status,
      error
    };
    
    if (receipt) {
      updates.receipt = receipt;
      updates.gasUsed = receipt.gasUsed?.toString();
      
      // 다른 영수증 정보 업데이트
      if (receipt.contractAddress) {
        updates.contractAddress = receipt.contractAddress;
      }
    }
    
    this.activities[index] = {
      ...transaction,
      ...updates
    };
    
    return this.activities[index] as TransactionActivity;
  }
  
  /**
   * 필터링된 활동 목록 가져오기
   * @param filter 필터
   * @param sortOrder 정렬 방식
   * @returns 필터링된 활동 목록
   */
  public getActivities(
    filter?: ActivityFilter,
    sortOrder: ActivitySortOrder = ActivitySortOrder.NEWEST_FIRST
  ): Activity[] {
    let result = [...this.activities];
    
    // 필터 적용
    if (filter) {
      if (filter.types && filter.types.length > 0) {
        result = result.filter(a => filter.types!.includes(a.type));
      }
      
      if (filter.transactionTypes && filter.transactionTypes.length > 0) {
        result = result.filter(a => {
          if (a.type !== ActivityType.TRANSACTION) {
            return false;
          }
          return filter.transactionTypes!.includes((a as TransactionActivity).transactionType);
        });
      }
      
      if (filter.status && filter.status.length > 0) {
        result = result.filter(a => {
          if (a.type !== ActivityType.TRANSACTION) {
            return true;
          }
          return filter.status!.includes((a as TransactionActivity).status);
        });
      }
      
      if (filter.accountId) {
        result = result.filter(a => a.accountId === filter.accountId);
      }
      
      if (filter.chainId) {
        result = result.filter(a => a.chainId === filter.chainId);
      }
      
      if (filter.fromDate) {
        result = result.filter(a => a.timestamp >= filter.fromDate!);
      }
      
      if (filter.toDate) {
        result = result.filter(a => a.timestamp <= filter.toDate!);
      }
      
      if (filter.dappName) {
        result = result.filter(a => {
          if (a.type === ActivityType.TRANSACTION) {
            const tx = a as TransactionActivity;
            return tx.dappName?.toLowerCase().includes(filter.dappName!.toLowerCase());
          }
          if (a.type === ActivityType.SIGNATURE) {
            const sig = a as SignatureActivity;
            return sig.dappName?.toLowerCase().includes(filter.dappName!.toLowerCase());
          }
          if (a.type === ActivityType.DAPP_CONNECTION) {
            const conn = a as DappConnectionActivity;
            return conn.dappName.toLowerCase().includes(filter.dappName!.toLowerCase());
          }
          if (a.type === ActivityType.TOKEN_APPROVAL) {
            const approval = a as TokenApprovalActivity;
            return approval.dappName?.toLowerCase().includes(filter.dappName!.toLowerCase());
          }
          return false;
        });
      }
      
      if (filter.tokenAddress) {
        result = result.filter(a => {
          if (a.type === ActivityType.TRANSACTION) {
            const tx = a as TransactionActivity;
            return tx.tokenAddress === filter.tokenAddress;
          }
          if (a.type === ActivityType.TOKEN_APPROVAL) {
            const approval = a as TokenApprovalActivity;
            return approval.tokenAddress === filter.tokenAddress;
          }
          return false;
        });
      }
      
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        result = result.filter(a => {
          // 주소 검색
          if (a.type === ActivityType.TRANSACTION) {
            const tx = a as TransactionActivity;
            return tx.from.toLowerCase().includes(searchLower) ||
                  tx.to.toLowerCase().includes(searchLower) ||
                  tx.transactionHash.toLowerCase().includes(searchLower) ||
                  tx.tokenSymbol?.toLowerCase().includes(searchLower) ||
                  tx.dappName?.toLowerCase().includes(searchLower);
          }
          
          // 서명 검색
          if (a.type === ActivityType.SIGNATURE) {
            const sig = a as SignatureActivity;
            return sig.dappName?.toLowerCase().includes(searchLower) ||
                  sig.message.toLowerCase().includes(searchLower);
          }
          
          // DApp 연결 검색
          if (a.type === ActivityType.DAPP_CONNECTION) {
            const conn = a as DappConnectionActivity;
            return conn.dappName.toLowerCase().includes(searchLower) ||
                  conn.dappUrl.toLowerCase().includes(searchLower);
          }
          
          // 토큰 승인 검색
          if (a.type === ActivityType.TOKEN_APPROVAL) {
            const approval = a as TokenApprovalActivity;
            return approval.tokenSymbol.toLowerCase().includes(searchLower) ||
                  approval.spender.toLowerCase().includes(searchLower) ||
                  approval.dappName?.toLowerCase().includes(searchLower);
          }
          
          return false;
        });
      }
    }
    
    // 정렬
    if (sortOrder === ActivitySortOrder.OLDEST_FIRST) {
      result.sort((a, b) => a.timestamp - b.timestamp);
    } else {
      result.sort((a, b) => b.timestamp - a.timestamp);
    }
    
    return result;
  }
  
  /**
   * 계정 활동 요약 가져오기
   * @param accountId 계정 ID
   * @param days 일 수 (기본값: 30일)
   * @returns 활동 요약
   */
  public getAccountActivitySummary(accountId: string, days: number = 30): {
    totalTransactions: number;
    sentTransactions: number;
    receivedTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    pendingTransactions: number;
    gasSpent: string;
    topDapps: Array<{ name: string; count: number }>;
  } {
    const fromDate = Date.now() - days * 24 * 60 * 60 * 1000;
    
    const activities = this.getActivities({
      accountId,
      fromDate,
      types: [ActivityType.TRANSACTION]
    });
    
    const transactions = activities as TransactionActivity[];
    
    // 트랜잭션 통계
    const totalTransactions = transactions.length;
    const sentTransactions = transactions.filter(tx => tx.from.toLowerCase() === transactions[0]?.from.toLowerCase()).length;
    const receivedTransactions = totalTransactions - sentTransactions;
    const successfulTransactions = transactions.filter(tx => tx.status === TransactionStatus.CONFIRMED).length;
    const failedTransactions = transactions.filter(tx => tx.status === TransactionStatus.FAILED).length;
    const pendingTransactions = transactions.filter(tx => tx.status === TransactionStatus.PENDING).length;
    
    // 가스 사용량 계산
    let totalGasWei = BigInt(0);
    transactions.forEach(tx => {
      if (tx.status === TransactionStatus.CONFIRMED && tx.gasUsed && tx.gasPrice) {
        const gasUsed = BigInt(tx.gasUsed);
        const gasPrice = BigInt(tx.gasPrice);
        totalGasWei += gasUsed * gasPrice;
      }
    });
    
    // DApp 사용 빈도 분석
    const dappCounts: Record<string, number> = {};
    transactions.forEach(tx => {
      if (tx.dappName) {
        dappCounts[tx.dappName] = (dappCounts[tx.dappName] || 0) + 1;
      }
    });
    
    const topDapps = Object.entries(dappCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalTransactions,
      sentTransactions,
      receivedTransactions,
      successfulTransactions,
      failedTransactions,
      pendingTransactions,
      gasSpent: totalGasWei.toString(),
      topDapps
    };
  }
  
  /**
   * 모든 활동 내역 가져오기
   * @returns 활동 내역 목록
   */
  public getAllActivities(): Activity[] {
    return [...this.activities];
  }
  
  /**
   * 활동 내역 삭제
   * @param id 활동 ID
   * @returns 삭제 성공 여부
   */
  public deleteActivity(id: string): boolean {
    const index = this.activities.findIndex(a => a.id === id);
    
    if (index === -1) {
      return false;
    }
    
    this.activities.splice(index, 1);
    return true;
  }
  
  /**
   * 활동 내역 초기화
   */
  public clearActivities(): void {
    this.activities = [];
  }
  
  /**
   * 오래된 활동 내역 정리
   * @param days 유지할 일 수
   */
  public pruneOldActivities(days: number): void {
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    this.activities = this.activities.filter(a => a.timestamp >= cutoffTime);
  }
}
