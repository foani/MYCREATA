import EventEmitter from 'eventemitter3';
import { ICreLinkProvider } from './provider.interface';
import {
  RPCMethod,
  EventType,
  EventData,
  ProviderRpcError,
  ErrorCode,
  ChainInfo,
  SwitchChainParams,
  AddChainParams,
  RPCResponse,
} from '../types';

/**
 * CreLink 프로바이더 구현
 * 
 * window.crelink 객체와 통신하여 CreLink 지갑 기능을 제공하는 프로바이더 구현
 */
export class CreLinkProvider extends EventEmitter implements ICreLinkProvider {
  public isCreLink = true;
  public selectedAddress?: string;
  public chainId?: string;
  public networkVersion?: string;
  private _initialized = false;

  /**
   * CreLink 프로바이더 생성자
   */
  constructor() {
    super();
    this._initialize();
  }

  /**
   * 프로바이더 초기화
   */
  private async _initialize(): Promise<void> {
    // window.crelink 객체가 있는지 확인
    if (typeof window === 'undefined' || !window.crelink) {
      const error = this._createError('CreLink wallet not installed', ErrorCode.RESOURCE_UNAVAILABLE);
      this.emit(EventType.DISCONNECT, error);
      throw error;
    }

    // 이벤트 리스너 설정
    this._setupEventListeners();
    
    try {
      // 초기 체인 ID와 계정 정보 가져오기
      const chainId = await this.request({ method: RPCMethod.ETH_CHAIN_ID });
      this.chainId = chainId;
      
      const accounts = await this.request({ method: RPCMethod.ETH_ACCOUNTS });
      if (accounts && accounts.length > 0) {
        this.selectedAddress = accounts[0];
      }
      
      this._initialized = true;
    } catch (error) {
      console.error('Failed to initialize CreLink provider:', error);
    }
  }

  /**
   * 이벤트 리스너 설정
   */
  private _setupEventListeners(): void {
    if (typeof window === 'undefined' || !window.crelink) return;

    window.crelink.on(EventType.ACCOUNTS_CHANGED, (accounts: string[]) => {
      if (accounts.length === 0) {
        // 연결 해제 처리
        const error = this._createError('The user disconnected', ErrorCode.DISCONNECTED);
        this.emit(EventType.DISCONNECT, error);
      } else if (this.selectedAddress !== accounts[0]) {
        this.selectedAddress = accounts[0];
        this.emit(EventType.ACCOUNTS_CHANGED, accounts);
      }
    });

    window.crelink.on(EventType.CHAIN_CHANGED, (chainId: string) => {
      if (this.chainId !== chainId) {
        this.chainId = chainId;
        this.emit(EventType.CHAIN_CHANGED, chainId);
      }
    });

    window.crelink.on(EventType.DISCONNECT, (error: ProviderRpcError) => {
      this.selectedAddress = undefined;
      this.emit(EventType.DISCONNECT, error);
    });

    window.crelink.on(EventType.CONNECT, (connectInfo: { chainId: string }) => {
      this.chainId = connectInfo.chainId;
      this.emit(EventType.CONNECT, connectInfo);
    });

    window.crelink.on(EventType.MESSAGE, (message: any) => {
      this.emit(EventType.MESSAGE, message);
    });
  }

  /**
   * RPC 오류 생성 헬퍼 함수
   */
  private _createError(message: string, code: number = ErrorCode.INTERNAL_ERROR, data?: any): ProviderRpcError {
    const error = new Error(message) as ProviderRpcError;
    error.code = code;
    error.data = data;
    return error;
  }

  /**
   * 연결 상태 확인
   */
  public isConnected(): boolean {
    return this._initialized && !!this.selectedAddress;
  }

  /**
   * RPC 요청 처리
   */
  public async request<T = any>(args: { method: string; params?: any[] }): Promise<T> {
    const { method, params = [] } = args;

    if (typeof window === 'undefined' || !window.crelink) {
      throw this._createError('CreLink wallet not installed', ErrorCode.RESOURCE_UNAVAILABLE);
    }

    try {
      const response = await window.crelink.request({ method, params });
      return response as T;
    } catch (error: any) {
      // CreLink 지갑의 오류를 적절히 변환
      if (error.code) {
        throw this._createError(error.message, error.code, error.data);
      }
      
      throw this._createError(
        error.message || 'Unknown error',
        error.code || ErrorCode.INTERNAL_ERROR,
        error.data
      );
    }
  }

  /**
   * 지원하는 체인 목록 조회
   */
  public async getSupportedChains(): Promise<ChainInfo[]> {
    try {
      // 지원하는 체인 목록을 가져오는 커스텀 메서드
      return await this.request<ChainInfo[]>({ method: 'crelink_getSupportedChains' });
    } catch (error) {
      // 메서드를 지원하지 않는 경우 기본 체인 목록 반환
      return [
        {
          chainId: '0x3E8', // 1000
          chainName: 'Catena (CIP-20) Chain Mainnet',
          nativeCurrency: {
            name: 'Catena',
            symbol: 'CTA',
            decimals: 18
          },
          rpcUrls: ['https://cvm.node.creatachain.com'],
          blockExplorerUrls: ['https://catena.explorer.creatachain.com']
        },
        {
          chainId: '0x89', // 137
          chainName: 'Polygon Mainnet',
          nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18
          },
          rpcUrls: ['https://polygon-rpc.com'],
          blockExplorerUrls: ['https://polygonscan.com']
        },
        {
          chainId: '0xA4B1', // 42161
          chainName: 'Arbitrum One',
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: ['https://arb1.arbitrum.io/rpc'],
          blockExplorerUrls: ['https://arbiscan.io']
        }
      ];
    }
  }

  /**
   * CreLink 지갑 버전 조회
   */
  public async getVersion(): Promise<string> {
    try {
      // 지갑 버전을 가져오는 커스텀 메서드
      return await this.request<string>({ method: 'crelink_getVersion' });
    } catch (error) {
      // 메서드를 지원하지 않는 경우 기본값 반환
      return 'unknown';
    }
  }

  /**
   * 체인 전환
   */
  public async switchChain(chainId: string): Promise<void> {
    const params: SwitchChainParams = { chainId };
    await this.request({
      method: RPCMethod.WALLET_SWITCH_ETHEREUM_CHAIN,
      params: [params]
    });
  }

  /**
   * 체인 추가
   */
  public async addChain(chainParams: AddChainParams): Promise<void> {
    await this.request({
      method: RPCMethod.WALLET_ADD_ETHEREUM_CHAIN,
      params: [chainParams]
    });
  }
}

// window 타입 확장
declare global {
  interface Window {
    crelink?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (eventName: string, callback: (...args: any[]) => void) => void;
      removeListener: (eventName: string, callback: (...args: any[]) => void) => void;
    };
  }
}
