import { CreLinkProvider } from './providers/crelink';
import { AccountMethods, ChainMethods, TransactionMethods, SigningMethods } from './methods';
import { CreLinkEventEmitter } from './events/eventEmitter';
import { EventType, EventData, Provider, CreLinkOptions, ChainInfo, TransactionParams, AddChainParams } from './types';
import { validateChainParams, validateTransactionParams, validateTypedData } from './utils/validation';

/**
 * CreLink SDK 메인 클래스
 */
export class CreLink {
  private provider: CreLinkProvider;
  private events: CreLinkEventEmitter;
  private accounts: AccountMethods;
  private chain: ChainMethods;
  private transaction: TransactionMethods;
  private signing: SigningMethods;
  private options: CreLinkOptions;

  /**
   * CreLink SDK 생성자
   * 
   * @param options SDK 옵션
   */
  constructor(options: CreLinkOptions = {}) {
    this.options = options;
    this.provider = new CreLinkProvider();
    this.events = new CreLinkEventEmitter();
    
    // 메서드 클래스 초기화
    this.accounts = new AccountMethods(this.provider);
    this.chain = new ChainMethods(this.provider);
    this.transaction = new TransactionMethods(this.provider);
    this.signing = new SigningMethods(this.provider);
    
    // 프로바이더 이벤트 핸들러 연결
    this._setupEventListeners();
    
    // 자동 연결 옵션 처리
    if (options.autoConnect) {
      this.connect().catch(error => {
        console.warn('Auto connect failed:', error);
      });
    }
  }

  /**
   * 프로바이더 이벤트 핸들러 연결
   */
  private _setupEventListeners(): void {
    // 계정 변경 이벤트
    this.provider.on(EventType.ACCOUNTS_CHANGED, (accounts: string[]) => {
      this.events.emit(EventType.ACCOUNTS_CHANGED, accounts);
    });
    
    // 체인 변경 이벤트
    this.provider.on(EventType.CHAIN_CHANGED, (chainId: string) => {
      this.events.emit(EventType.CHAIN_CHANGED, chainId);
    });
    
    // 연결 해제 이벤트
    this.provider.on(EventType.DISCONNECT, (error: any) => {
      this.events.emit(EventType.DISCONNECT, error);
    });
    
    // 연결 이벤트
    this.provider.on(EventType.CONNECT, (connectInfo: any) => {
      this.events.emit(EventType.CONNECT, connectInfo);
    });
    
    // 메시지 이벤트
    this.provider.on(EventType.MESSAGE, (message: any) => {
      this.events.emit(EventType.MESSAGE, message);
    });
  }

  /**
   * CreLink 지갑 설치 여부 확인
   * 
   * @returns 설치 여부
   */
  public isInstalled(): boolean {
    return typeof window !== 'undefined' && !!window.crelink;
  }

  /**
   * 연결 상태 확인
   * 
   * @returns 연결 여부
   */
  public isConnected(): boolean {
    return this.provider.isConnected();
  }

  /**
   * 지갑 연결
   * 
   * @returns 연결된 계정 주소 배열
   */
  public async connect(): Promise<string[]> {
    return await this.accounts.requestAccounts();
  }

  /**
   * 현재 계정 조회
   * 
   * @returns 계정 주소 배열
   */
  public async getAccounts(): Promise<string[]> {
    return await this.accounts.getAccounts();
  }

  /**
   * 현재 체인 ID 조회
   * 
   * @returns 체인 ID (16진수 문자열)
   */
  public async getChainId(): Promise<string> {
    return await this.chain.getChainId();
  }

  /**
   * 체인 전환
   * 
   * @param chainId 체인 ID (16진수 문자열)
   */
  public async switchChain(chainId: string): Promise<void> {
    await this.chain.switchChain(chainId);
  }

  /**
   * 체인 추가
   * 
   * @param chainParams 체인 매개변수
   */
  public async addChain(chainParams: AddChainParams): Promise<void> {
    // 체인 매개변수 유효성 검증
    const validation = validateChainParams(chainParams);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    
    await this.chain.addChain(chainParams);
  }

  /**
   * 지원하는 체인 목록 조회
   * 
   * @returns 체인 정보 배열
   */
  public async getSupportedChains(): Promise<ChainInfo[]> {
    return await this.chain.getSupportedChains();
  }

  /**
   * 트랜잭션 전송
   * 
   * @param txParams 트랜잭션 매개변수
   * @returns 트랜잭션 해시
   */
  public async sendTransaction(txParams: TransactionParams): Promise<string> {
    // 트랜잭션 매개변수 유효성 검증
    const validation = validateTransactionParams(txParams);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    
    return await this.transaction.sendTransaction(txParams);
  }

  /**
   * 트랜잭션 서명 (전송하지 않음)
   * 
   * @param txParams 트랜잭션 매개변수
   * @returns 서명된 트랜잭션 데이터
   */
  public async signTransaction(txParams: TransactionParams): Promise<string> {
    // 트랜잭션 매개변수 유효성 검증
    const validation = validateTransactionParams(txParams);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    
    return await this.transaction.signTransaction(txParams);
  }

  /**
   * 가스 추정
   * 
   * @param txParams 트랜잭션 매개변수
   * @returns 가스 추정값 (16진수 문자열)
   */
  public async estimateGas(txParams: TransactionParams): Promise<string> {
    return await this.transaction.estimateGas(txParams);
  }

  /**
   * 메시지 서명
   * 
   * @param message 서명할 메시지
   * @param address 서명자 주소 (기본값: 현재 선택된 계정)
   * @returns 메시지 서명
   */
  public async signMessage(message: string, address?: string): Promise<string> {
    return await this.signing.signMessage(message, address);
  }

  /**
   * EIP-712 타입 데이터 서명
   * 
   * @param typedData EIP-712 타입 데이터
   * @param address 서명자 주소 (기본값: 현재 선택된 계정)
   * @returns 타입 데이터 서명
   */
  public async signTypedData(typedData: any, address?: string): Promise<string> {
    // 타입 데이터 유효성 검증
    const validation = validateTypedData(typedData);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    
    return await this.signing.signTypedData(typedData, address);
  }

  /**
   * 계정 잔액 조회
   * 
   * @param address 계정 주소 (기본값: 현재 선택된 계정)
   * @returns 잔액 (16진수 문자열, wei 단위)
   */
  public async getBalance(address?: string): Promise<string> {
    if (!address && this.provider.selectedAddress) {
      address = this.provider.selectedAddress;
    }
    
    if (!address) {
      throw new Error('No account selected');
    }
    
    return await this.accounts.getBalance(address);
  }

  /**
   * 이벤트 리스너 등록
   * 
   * @param eventType 이벤트 타입
   * @param listener 이벤트 리스너
   */
  public on<K extends EventType>(eventType: K, listener: (data: EventData[K]) => void): void {
    this.events.on(eventType, listener);
  }

  /**
   * 이벤트 리스너 제거
   * 
   * @param eventType 이벤트 타입
   * @param listener 이벤트 리스너
   */
  public removeListener<K extends EventType>(eventType: K, listener: (data: EventData[K]) => void): void {
    this.events.removeListener(eventType, listener);
  }

  /**
   * 프로바이더 객체 반환
   * 
   * @returns 프로바이더
   */
  public getProvider(): Provider {
    return this.provider;
  }

  /**
   * CreLink 지갑 버전 조회
   * 
   * @returns 버전 문자열
   */
  public async getVersion(): Promise<string> {
    return await this.provider.getVersion();
  }
}

// 타입 내보내기
export * from './types';
