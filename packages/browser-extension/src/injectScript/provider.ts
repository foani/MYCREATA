/**
 * CreLink Provider
 * EIP-1193 호환 Provider 구현
 * 웹페이지에서 지갑 기능을 사용할 수 있는 API를 제공합니다.
 */

import { createRPCMethods } from './methods';

// 이벤트 콜백 타입
type EventCallback = (...args: any[]) => void;

// 지원하는 이벤트 타입
type EventType = 'accountsChanged' | 'chainChanged' | 'disconnect' | 'connect';

// Provider 인터페이스
interface CrelinkProvider {
  isCrelink: boolean;
  _state: {
    accounts: string[] | null;
    isConnected: boolean;
    isUnlocked: boolean;
    initialized: boolean;
    chainId: string | null;
  };
  request: (args: { method: string; params?: any }) => Promise<any>;
  on: (eventName: EventType, callback: EventCallback) => void;
  removeListener: (eventName: EventType, callback: EventCallback) => void;
  sendAsync?: (payload: any, callback: (error: Error | null, response: any) => void) => void;
  send?: (payload: any, callback?: (error: Error | null, response: any) => void) => any;
  connect?: () => Promise<void>;
  disconnect?: () => Promise<void>;
}

// 이벤트 콜백 맵
const eventCallbacks: Record<EventType, Set<EventCallback>> = {
  accountsChanged: new Set(),
  chainChanged: new Set(),
  disconnect: new Set(),
  connect: new Set()
};

/**
 * Provider 객체 초기화
 * 웹페이지의 window 객체에 provider 주입
 */
export function initializeProvider(): void {
  // Provider 객체 생성
  const provider: CrelinkProvider = {
    isCrelink: true,
    
    // 초기 상태
    _state: {
      accounts: null,
      isConnected: false,
      isUnlocked: false,
      initialized: false,
      chainId: null
    },
    
    /**
     * JSON-RPC 메서드 요청
     * @param args 메서드 및 파라미터
     * @returns JSON-RPC 응답
     */
    request: async (args) => {
      const { method, params } = args;
      
      if (!method) {
        throw new Error('메서드가 지정되지 않았습니다.');
      }
      
      // RPC 메서드 처리
      const rpcMethods = createRPCMethods(provider);
      
      // 로컬에서 처리 가능한 메서드인지 확인
      if (typeof rpcMethods[method] === 'function') {
        return await rpcMethods[method](params);
      }
      
      // 로컬에서 처리할 수 없는 메서드는 확장 프로그램으로 전달
      return await sendMessageToContentScript(method, params);
    },
    
    /**
     * 이벤트 리스너 등록
     * @param eventName 이벤트 이름
     * @param callback 콜백 함수
     */
    on: (eventName, callback) => {
      if (!eventCallbacks[eventName]) {
        throw new Error(`지원하지 않는 이벤트: ${eventName}`);
      }
      
      eventCallbacks[eventName].add(callback);
    },
    
    /**
     * 이벤트 리스너 제거
     * @param eventName 이벤트 이름
     * @param callback 콜백 함수
     */
    removeListener: (eventName, callback) => {
      if (!eventCallbacks[eventName]) {
        return;
      }
      
      eventCallbacks[eventName].delete(callback);
    },
    
    /**
     * 레거시 sendAsync 메서드 (EIP-1193 이전)
     * @param payload JSON-RPC 요청
     * @param callback 콜백 함수
     */
    sendAsync: (payload, callback) => {
      // JSON-RPC 요청 형식 변환
      const { method, params } = payload;
      
      provider.request({ method, params })
        .then(result => {
          // JSON-RPC 응답 형식
          callback(null, {
            id: payload.id,
            jsonrpc: '2.0',
            result
          });
        })
        .catch(error => {
          callback(error, null);
        });
    },
    
    /**
     * 레거시 send 메서드 (EIP-1193 이전)
     * @param payload JSON-RPC 요청
     * @param callback 콜백 함수 (선택 사항)
     * @returns 콜백 없는 경우 동기적 결과
     */
    send: (payload, callback) => {
      // 콜백이 제공된 경우 sendAsync와 동일하게 처리
      if (callback) {
        provider.sendAsync!(payload, callback);
        return;
      }
      
      // 콜백이 없는 경우 동기적으로 처리 (제한된 메서드만)
      if (typeof payload === 'string') {
        // string 메서드 호출 방식 (예: provider.send('eth_accounts'))
        const method = payload;
        const rpcMethods = createRPCMethods(provider);
        
        // 동기적으로 처리 가능한 메서드 목록
        const synchronousMethods = ['eth_accounts', 'eth_coinbase', 'eth_uninstallFilter', 'net_version'];
        
        if (synchronousMethods.includes(method) && typeof rpcMethods[method] === 'function') {
          try {
            return {
              id: 0,
              jsonrpc: '2.0',
              result: rpcMethods[method](null)
            };
          } catch (error) {
            throw error;
          }
        }
      }
      
      // 지원하지 않는 동기 메서드
      throw new Error('동기적 send 메서드는 제한된 메서드만 지원합니다.');
    }
  };
  
  // window 객체에 crelink 주입
  window.crelink = provider;
  
  // 콘텐츠 스크립트로부터 오는 메시지 처리
  window.addEventListener('message', (event) => {
    // 같은 출처의 메시지만 처리
    if (event.source !== window) {
      return;
    }
    
    const { data } = event;
    
    // CreLink 메시지만 처리
    if (!data || data.target !== 'crelink-injectscript') {
      return;
    }
    
    // 메시지 타입에 따른 처리
    if (data.message.type === 'event') {
      // 이벤트 메시지 처리
      handleEvent(data.message.event, data.message.data);
    } else {
      // RPC 응답 메시지 처리
      handleRPCResponse(data.message);
    }
  });
  
  // 초기 상태 조회
  provider.request({ method: 'eth_chainId' })
    .then(chainId => {
      provider._state.chainId = chainId;
      provider._state.initialized = true;
      
      // connect 이벤트 발생
      triggerEvent('connect', { chainId });
    })
    .catch(error => {
      console.error('체인 ID 조회 중 오류:', error);
    });
  
  // 페이지 로드 시 계정 조회
  provider.request({ method: 'eth_accounts' })
    .then(accounts => {
      provider._state.accounts = accounts;
      provider._state.isConnected = accounts.length > 0;
    })
    .catch(error => {
      console.error('계정 조회 중 오류:', error);
    });
}

// 응답 콜백 맵
const responseCallbacks: Map<number, (response: any) => void> = new Map();

// 메시지 ID 카운터
let messageId = 1;

/**
 * 콘텐츠 스크립트로 메시지 전송
 * @param method 메서드 이름
 * @param params 메서드 파라미터
 * @returns 응답 Promise
 */
function sendMessageToContentScript(method: string, params?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const id = messageId++;
    
    // 응답 콜백 등록
    responseCallbacks.set(id, (response) => {
      if (response.error) {
        reject(new Error(response.error));
      } else {
        resolve(response.result);
      }
    });
    
    // 콘텐츠 스크립트로 메시지 전송
    window.postMessage(
      {
        target: 'crelink-contentscript',
        message: {
          id,
          method,
          params
        }
      },
      window.location.origin
    );
  });
}

/**
 * RPC 응답 처리
 * @param response 응답 메시지
 */
function handleRPCResponse(response: any): void {
  const { id, result, error } = response;
  
  // 등록된 콜백 찾기
  const callback = responseCallbacks.get(id);
  if (callback) {
    // 콜백 호출 및 제거
    callback(response);
    responseCallbacks.delete(id);
  }
}

/**
 * 이벤트 처리
 * @param eventName 이벤트 이름
 * @param data 이벤트 데이터
 */
function handleEvent(eventName: string, data: any): void {
  // Provider 업데이트
  const provider = window.crelink;
  
  switch (eventName) {
    case 'accountsChanged':
      provider._state.accounts = data;
      provider._state.isConnected = data.length > 0;
      break;
      
    case 'chainChanged':
      provider._state.chainId = data;
      break;
      
    case 'disconnect':
      provider._state.isConnected = false;
      break;
  }
  
  // 이벤트 트리거
  triggerEvent(eventName as EventType, data);
}

/**
 * 이벤트 트리거
 * @param eventName 이벤트 이름
 * @param data 이벤트 데이터
 */
function triggerEvent(eventName: EventType, data: any): void {
  const callbacks = eventCallbacks[eventName];
  if (!callbacks || callbacks.size === 0) {
    return;
  }
  
  // 등록된 모든 콜백 호출
  for (const callback of callbacks) {
    try {
      callback(data);
    } catch (error) {
      console.error(`이벤트 콜백 실행 중 오류: ${eventName}`, error);
    }
  }
}

// 전역 타입 확장
declare global {
  interface Window {
    crelink: CrelinkProvider;
  }
}