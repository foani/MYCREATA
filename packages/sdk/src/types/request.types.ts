/**
 * RPC 메서드 타입
 * CreLink 지갑에서 지원하는 이더리움 RPC 메서드
 */
export enum RPCMethod {
  // 계정 관련
  ETH_ACCOUNTS = 'eth_accounts',
  ETH_REQUEST_ACCOUNTS = 'eth_requestAccounts',
  
  // 체인 관련
  ETH_CHAIN_ID = 'eth_chainId',
  WALLET_SWITCH_ETHEREUM_CHAIN = 'wallet_switchEthereumChain',
  WALLET_ADD_ETHEREUM_CHAIN = 'wallet_addEthereumChain',
  
  // 트랜잭션 관련
  ETH_SEND_TRANSACTION = 'eth_sendTransaction',
  ETH_SIGN_TRANSACTION = 'eth_signTransaction',
  ETH_ESTIMATE_GAS = 'eth_estimateGas',
  ETH_GAS_PRICE = 'eth_gasPrice',
  ETH_GET_TRANSACTION_COUNT = 'eth_getTransactionCount',
  
  // 서명 관련
  PERSONAL_SIGN = 'personal_sign',
  ETH_SIGN = 'eth_sign',
  ETH_SIGN_TYPED_DATA = 'eth_signTypedData',
  ETH_SIGN_TYPED_DATA_V3 = 'eth_signTypedData_v3',
  ETH_SIGN_TYPED_DATA_V4 = 'eth_signTypedData_v4',
  
  // 기타
  ETH_GET_BALANCE = 'eth_getBalance',
  ETH_CALL = 'eth_call',
  WEB3_CLIENT_VERSION = 'web3_clientVersion',
  NET_VERSION = 'net_version',
  WALLET_GET_PERMISSIONS = 'wallet_getPermissions',
  WALLET_REQUEST_PERMISSIONS = 'wallet_requestPermissions',
}

/**
 * 체인 전환 파라미터
 */
export interface SwitchChainParams {
  /**
   * 체인 ID (16진수 문자열)
   */
  chainId: string;
}

/**
 * 트랜잭션 파라미터
 */
export interface TransactionParams {
  /**
   * 발신자 주소 (선택 사항)
   */
  from?: string;
  
  /**
   * 수신자 주소
   */
  to: string;
  
  /**
   * 전송할 값 (wei 단위 16진수 문자열 또는 이더 단위 10진수 문자열)
   */
  value?: string;
  
  /**
   * 호출 데이터 (16진수 문자열)
   */
  data?: string;
  
  /**
   * 가스 한도 (선택 사항)
   */
  gas?: string;
  
  /**
   * 가스 가격 (선택 사항)
   */
  gasPrice?: string;
  
  /**
   * 최대 우선 순위 수수료 (선택 사항, EIP-1559)
   */
  maxPriorityFeePerGas?: string;
  
  /**
   * 최대 수수료 (선택 사항, EIP-1559)
   */
  maxFeePerGas?: string;
  
  /**
   * 트랜잭션 타입 (선택 사항, EIP-2718)
   */
  type?: string;
  
  /**
   * 논스 (선택 사항)
   */
  nonce?: string;
}

/**
 * 가스 추정 파라미터
 */
export interface EstimateGasParams extends TransactionParams {
  // TransactionParams 인터페이스 확장
}

/**
 * 트랜잭션 호출 파라미터
 */
export interface CallParams extends TransactionParams {
  // TransactionParams 인터페이스 확장
}

/**
 * 서명 파라미터
 */
export interface SignParams {
  /**
   * 서명자 주소
   */
  address: string;
  
  /**
   * 서명할 데이터 (16진수 문자열)
   */
  data: string;
}

/**
 * 타입 데이터 서명 파라미터 (EIP-712)
 */
export interface SignTypedDataParams {
  /**
   * 서명자 주소
   */
  from: string;
  
  /**
   * EIP-712 타입 데이터
   */
  data: any;
}

/**
 * 권한 요청 파라미터
 */
export interface RequestPermissionsParams {
  [method: string]: {}; // 빈 객체는 요청할 권한을 나타냄
}
