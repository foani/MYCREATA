/**
 * RPC 메서드 구현
 * 웹페이지에서 호출할 수 있는 JSON-RPC 메서드를 구현합니다.
 */

// 로컬에서 처리 가능한 RPC 메서드 맵
type RPCMethodsMap = {
  [method: string]: (params?: any) => Promise<any> | any;
};

/**
 * RPC 메서드 생성
 * @param provider CreLink Provider 객체
 * @returns RPC 메서드 맵
 */
export function createRPCMethods(provider: any): RPCMethodsMap {
  // Provider 상태에 접근하기 위한 래퍼
  const state = provider._state;
  
  // 주요 메서드 구현
  return {
    /**
     * 연결된 계정 목록 조회
     * @returns 계정 목록
     */
    eth_accounts: () => {
      return state.accounts || [];
    },
    
    /**
     * 기본 계정 조회
     * @returns 기본 계정 또는 null
     */
    eth_coinbase: () => {
      const accounts = state.accounts || [];
      return accounts.length > 0 ? accounts[0] : null;
    },
    
    /**
     * 계정 연결 요청
     * @returns 계정 목록
     */
    eth_requestAccounts: async () => {
      // 이미 연결된 계정이 있으면 반환
      if (state.accounts && state.accounts.length > 0) {
        return state.accounts;
      }
      
      // 연결 요청 전송
      // 이 메서드는 항상 백그라운드 스크립트로 전달됨
      throw new Error('eth_requestAccounts는 백그라운드 스크립트에서 처리해야 합니다.');
    },
    
    /**
     * 현재 체인 ID 조회
     * @returns 체인 ID (16진수 문자열)
     */
    eth_chainId: () => {
      return state.chainId || null;
    },
    
    /**
     * 네트워크 ID 조회 (레거시)
     * @returns 네트워크 ID (10진수 문자열)
     */
    net_version: () => {
      // 16진수 체인 ID를 10진수 문자열로 변환
      if (state.chainId) {
        return parseInt(state.chainId, 16).toString();
      }
      return null;
    },
    
    /**
     * 서명 요청 (개인 메시지)
     * @param params 서명 파라미터
     * @returns 서명 결과
     */
    personal_sign: async (params: any) => {
      // 이 메서드는 항상 백그라운드 스크립트로 전달됨
      throw new Error('personal_sign은 백그라운드 스크립트에서 처리해야 합니다.');
    },
    
    /**
     * 타입화된 데이터 서명 요청
     * @param params 서명 파라미터
     * @returns 서명 결과
     */
    eth_signTypedData_v4: async (params: any) => {
      // 이 메서드는 항상 백그라운드 스크립트로 전달됨
      throw new Error('eth_signTypedData_v4는 백그라운드 스크립트에서 처리해야 합니다.');
    },
    
    /**
     * 트랜잭션 전송 요청
     * @param params 트랜잭션 파라미터
     * @returns 트랜잭션 해시
     */
    eth_sendTransaction: async (params: any) => {
      // 이 메서드는 항상 백그라운드 스크립트로 전달됨
      throw new Error('eth_sendTransaction은 백그라운드 스크립트에서 처리해야 합니다.');
    },
    
    /**
     * 체인 전환 요청
     * @param params 체인 파라미터
     * @returns null (성공 시)
     */
    wallet_switchEthereumChain: async (params: any) => {
      // 이 메서드는 항상 백그라운드 스크립트로 전달됨
      throw new Error('wallet_switchEthereumChain은 백그라운드 스크립트에서 처리해야 합니다.');
    },
    
    /**
     * 체인 추가 요청
     * @param params 체인 파라미터
     * @returns null (성공 시)
     */
    wallet_addEthereumChain: async (params: any) => {
      // 이 메서드는 항상 백그라운드 스크립트로 전달됨
      throw new Error('wallet_addEthereumChain은 백그라운드 스크립트에서 처리해야 합니다.');
    },
    
    /**
     * 계정 마지막 활동 시간 갱신
     * @returns true (성공 시)
     */
    wallet_updateLastActive: () => {
      // 현재 시간으로 마지막 활동 시간 갱신
      const timestamp = Date.now();
      return true;
    },
    
    /**
     * 지갑 정보 조회
     * @returns 지갑 정보
     */
    wallet_getInfo: () => {
      return {
        name: 'CreLink Wallet',
        version: '0.1.0',
        isConnected: state.isConnected,
        isUnlocked: state.isUnlocked,
        initialized: state.initialized
      };
    },
    
    /**
     * 지원하는 메서드 목록 조회
     * @returns 지원하는 메서드 목록
     */
    wallet_getSupportedMethods: () => {
      return Object.keys(this);
    },
    
    /**
     * 필터 등록 해제 (더미 구현)
     * @param filterId 필터 ID
     * @returns 성공 여부
     */
    eth_uninstallFilter: (filterId: string) => {
      // 더미 구현 (항상 성공 반환)
      return true;
    }
  };
}