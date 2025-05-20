/**
 * 네트워크 정보 타입
 */
export interface Network {
  /** 네트워크 식별자 (정수) */
  chainId: number;
  
  /** 16진수 형식의 네트워크 식별자 */
  chainIdHex: string;
  
  /** 네트워크 이름 */
  name: string;
  
  /** 네트워크 기호 */
  symbol: string;
  
  /** 소수점 자릿수 (기본값: 18) */
  decimals: number;
  
  /** RPC URL */
  rpcUrl: string;
  
  /** 블록 탐색기 URL */
  blockExplorerUrl?: string;
  
  /** 네트워크 아이콘 URL */
  iconUrl?: string;
  
  /** 사용자 정의 네트워크 여부 */
  isCustom?: boolean;
}
