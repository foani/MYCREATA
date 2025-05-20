/**
 * account.model.ts
 * 
 * 계정 관련 데이터 모델 정의.
 */

export enum AccountType {
  NORMAL = 'normal',      // 일반 계정
  HARDWARE = 'hardware',  // 하드웨어 지갑
  WATCH = 'watch',        // 조회 전용
  CONTRACT = 'contract'   // 컨트랙트 계정 (멀티시그 등)
}

export enum AccountSource {
  CREATED = 'created',    // 지갑에서 생성
  IMPORTED = 'imported',  // 가져옴
  CONNECTED = 'connected' // 연결됨 (하드웨어 등)
}

/**
 * 계정 정보 인터페이스
 */
export interface Account {
  id: string;               // 고유 ID (UUID v4)
  name: string;             // 계정 이름
  address: string;          // 지갑 주소
  type: AccountType;        // 계정 유형
  source: AccountSource;    // 계정 출처
  derivationPath?: string;  // 파생 경로 (BIP-44 등)
  index?: number;           // HD 지갑에서의 인덱스
  isDefault?: boolean;      // 기본 계정 여부
  isHidden?: boolean;       // 숨김 여부
  customData?: Record<string, any>; // 커스텀 데이터
  createdAt: number;        // 생성 시간 (타임스탬프)
  updatedAt: number;        // 마지막 업데이트 시간
}

/**
 * 크로스체인 계정 정보 인터페이스
 */
export interface CrossChainAccount {
  id: string;               // 고유 ID (UUID v4)
  name: string;             // 계정 이름
  addresses: {              // 체인별 주소
    [chainId: string]: string;
  };
  derivationPaths: {        // 체인별 파생 경로
    [chainId: string]: string;
  };
  isDefault?: boolean;      // 기본 계정 여부
  isHidden?: boolean;       // 숨김 여부
  customData?: Record<string, any>; // 커스텀 데이터
  createdAt: number;        // 생성 시간 (타임스탬프)
  updatedAt: number;        // 마지막 업데이트 시간
}

/**
 * 계정 컬렉션 인터페이스
 */
export interface AccountCollection {
  accounts: Record<string, Account>;
  crossChainAccounts: Record<string, CrossChainAccount>;
  defaultAccountId?: string;
  defaultCrossChainAccountId?: string;
  lastUsedAccountIds: {
    [chainId: string]: string;
  };
}

/**
 * 계정 목록 관리 클래스
 */
export class AccountModel {
  private data: AccountCollection;
  
  /**
   * AccountModel 생성자
   * @param initialData 초기 데이터
   */
  constructor(initialData?: Partial<AccountCollection>) {
    this.data = {
      accounts: {},
      crossChainAccounts: {},
      lastUsedAccountIds: {},
      ...initialData
    };
  }
  
  /**
   * 계정 추가
   * @param account 계정 정보
   */
  public addAccount(account: Account): void {
    this.data.accounts[account.id] = {
      ...account,
      updatedAt: Date.now()
    };
  }
  
  /**
   * 계정 가져오기
   * @param id 계정 ID
   * @returns 계정 정보
   */
  public getAccount(id: string): Account | undefined {
    return this.data.accounts[id];
  }
  
  /**
   * 계정 업데이트
   * @param id 계정 ID
   * @param updates 업데이트할 필드
   * @returns 업데이트된 계정
   */
  public updateAccount(id: string, updates: Partial<Account>): Account {
    const account = this.data.accounts[id];
    if (!account) {
      throw new Error(`Account not found: ${id}`);
    }
    
    this.data.accounts[id] = {
      ...account,
      ...updates,
      updatedAt: Date.now()
    };
    
    return this.data.accounts[id];
  }
  
  /**
   * 계정 삭제
   * @param id 계정 ID
   * @returns 성공 여부
   */
  public deleteAccount(id: string): boolean {
    if (!this.data.accounts[id]) {
      return false;
    }
    
    delete this.data.accounts[id];
    
    // 기본 계정이였다면 기본 계정 초기화
    if (this.data.defaultAccountId === id) {
      this.data.defaultAccountId = undefined;
    }
    
    return true;
  }
  
  /**
   * 모든 계정 목록 가져오기
   * @param includeHidden 숨김 계정 포함 여부
   * @returns 계정 목록
   */
  public getAllAccounts(includeHidden: boolean = false): Account[] {
    return Object.values(this.data.accounts)
      .filter(account => includeHidden || !account.isHidden);
  }
  
  /**
   * 기본 계정 설정
   * @param id 계정 ID
   */
  public setDefaultAccount(id: string): void {
    if (!this.data.accounts[id]) {
      throw new Error(`Account not found: ${id}`);
    }
    
    this.data.defaultAccountId = id;
  }
  
  /**
   * 기본 계정 가져오기
   * @returns 기본 계정
   */
  public getDefaultAccount(): Account | undefined {
    if (!this.data.defaultAccountId) {
      return undefined;
    }
    
    return this.data.accounts[this.data.defaultAccountId];
  }
  
  /**
   * 특정 체인의 마지막 사용 계정 설정
   * @param chainId 체인 ID
   * @param accountId 계정 ID
   */
  public setLastUsedAccount(chainId: string, accountId: string): void {
    if (!this.data.accounts[accountId]) {
      throw new Error(`Account not found: ${accountId}`);
    }
    
    this.data.lastUsedAccountIds[chainId] = accountId;
  }
  
  /**
   * 특정 체인의 마지막 사용 계정 가져오기
   * @param chainId 체인 ID
   * @returns 계정
   */
  public getLastUsedAccount(chainId: string): Account | undefined {
    const accountId = this.data.lastUsedAccountIds[chainId];
    if (!accountId) {
      return this.getDefaultAccount();
    }
    
    return this.data.accounts[accountId];
  }
  
  /**
   * 크로스체인 계정 추가
   * @param account 크로스체인 계정 정보
   */
  public addCrossChainAccount(account: CrossChainAccount): void {
    this.data.crossChainAccounts[account.id] = {
      ...account,
      updatedAt: Date.now()
    };
  }
  
  /**
   * 크로스체인 계정 가져오기
   * @param id 계정 ID
   * @returns 크로스체인 계정 정보
   */
  public getCrossChainAccount(id: string): CrossChainAccount | undefined {
    return this.data.crossChainAccounts[id];
  }
  
  /**
   * 모든 크로스체인 계정 목록 가져오기
   * @param includeHidden 숨김 계정 포함 여부
   * @returns 크로스체인 계정 목록
   */
  public getAllCrossChainAccounts(includeHidden: boolean = false): CrossChainAccount[] {
    return Object.values(this.data.crossChainAccounts)
      .filter(account => includeHidden || !account.isHidden);
  }
  
  /**
   * 전체 데이터 가져오기
   * @returns 계정 컬렉션 데이터
   */
  public getData(): AccountCollection {
    return this.data;
  }
  
  /**
   * 전체 데이터 설정
   * @param data 계정 컬렉션 데이터
   */
  public setData(data: AccountCollection): void {
    this.data = data;
  }
}
