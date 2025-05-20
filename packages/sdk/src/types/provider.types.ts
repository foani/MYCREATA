/**
 * CreLink 초기화 옵션
 */
export interface CreLinkOptions {
  /**
   * DApp 이름
   */
  appName?: string;
  
  /**
   * DApp 아이콘 URL
   */
  appIcon?: string;
  
  /**
   * 자동 연결 여부 (기본값: false)
   */
  autoConnect?: boolean;
  
  /**
   * 이벤트에 대한 디버그 로그 활성화 여부 (기본값: false)
   */
  debug?: boolean;
  
  /**
   * 지원하는 체인 ID 목록
   */
  supportedChainIds?: string[];
  
  /**
   * 커스텀 RPC URL
   */
  rpcUrl?: string;
}

/**
 * 프로바이더 인터페이스
 * EIP-1193 표준을 확장하여 CreLink 지갑과 통신하는 인터페이스
 */
export interface Provider {
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
   * 연결 상태 확인
   */
  isConnected(): boolean;
}

/**
 * 체인 정보
 */
export interface ChainInfo {
  /**
   * 체인 ID (16진수 문자열)
   */
  chainId: string;
  
  /**
   * 체인 이름
   */
  chainName: string;
  
  /**
   * 네이티브 토큰 정보
   */
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  
  /**
   * RPC URL
   */
  rpcUrls: string[];
  
  /**
   * 블록 탐색기 URL
   */
  blockExplorerUrls?: string[];
  
  /**
   * 아이콘 URL
   */
  iconUrls?: string[];
}

/**
 * 체인 추가 파라미터
 */
export interface AddChainParams extends ChainInfo {
  // ChainInfo 인터페이스 확장
}
