import { Provider, ChainInfo } from '../types';

/**
 * 프로바이더 인터페이스
 * CreLink 지갑과의 통신을 담당하는 인터페이스
 */
export interface ICreLinkProvider extends Provider {
  /**
   * 이 프로바이더가 CreLink 지갑인지 확인
   */
  isCreLink: boolean;
  
  /**
   * 현재 연결된 계정 주소
   */
  selectedAddress?: string;
  
  /**
   * 현재 체인 ID
   */
  chainId?: string;
  
  /**
   * 네트워크 ID
   */
  networkVersion?: string;
  
  /**
   * 연결 상태 확인
   */
  isConnected(): boolean;
  
  /**
   * 요청 메서드
   * @param args 요청 인자
   */
  request(args: { method: string; params?: any[] }): Promise<any>;
  
  /**
   * 이벤트 리스너 등록
   * @param event 이벤트 이름
   * @param listener 이벤트 리스너
   */
  on(event: string, listener: (...args: any[]) => void): void;
  
  /**
   * 이벤트 리스너 제거
   * @param event 이벤트 이름
   * @param listener 이벤트 리스너
   */
  removeListener(event: string, listener: (...args: any[]) => void): void;
  
  /**
   * 지원하는 체인 목록 조회
   */
  getSupportedChains(): Promise<ChainInfo[]>;
  
  /**
   * CreLink 지갑 버전 조회
   */
  getVersion(): Promise<string>;
}
