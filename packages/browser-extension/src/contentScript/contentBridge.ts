/**
 * ContentBridge
 * 웹페이지와 확장 프로그램 간의 통신 브릿지
 * 메시지 교환을 처리합니다.
 */

// 메시지 인터페이스
interface BridgeMessage {
  id: number;
  type: string;
  method: string;
  params?: any;
}

// 메시지 ID 카운터
let messageIdCounter = 1;

// 메시지 핸들러 맵
const pendingMessages: Map<number, (response: any) => void> = new Map();

/**
 * 콘텐츠 브릿지 설정
 */
export function setupContentBridge(): void {
  // 웹페이지에서 오는 메시지 리스너 설정
  window.addEventListener('message', handleWebPageMessage);
  
  // 백그라운드 스크립트에서 오는 메시지 리스너 설정
  chrome.runtime.onMessage.addListener(handleBackgroundMessage);
  
  // "reconnect" 메시지 리스너
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'reconnect') {
      // 백그라운드 스크립트와의 연결 재설정
      setupKeepAliveConnection();
      return true;
    }
  });
}

/**
 * 웹페이지로부터 오는 메시지 처리
 * @param event 메시지 이벤트
 */
function handleWebPageMessage(event: MessageEvent): void {
  // 같은 출처의 메시지만 처리
  if (event.source !== window) {
    return;
  }
  
  const { data } = event;
  
  // CreLink 메시지만 처리
  if (!data || data.target !== 'crelink-contentscript') {
    return;
  }
  
  // 메시지 추출
  const { id, method, params } = data.message || {};
  
  if (!id || !method) {
    console.error('유효하지 않은 메시지 형식:', data);
    return;
  }
  
  // 백그라운드 스크립트로 메시지 전달
  forwardMessageToBackground(id, method, params);
}

/**
 * 백그라운드 스크립트로 메시지 전달
 * @param id 메시지 ID
 * @param method 호출할 메서드
 * @param params 메서드 파라미터
 */
function forwardMessageToBackground(id: number, method: string, params?: any): void {
  // 외부 메시지 형식으로 변환하여 백그라운드 스크립트로 전송
  chrome.runtime.sendMessage({
    type: 'external',
    id,
    method,
    params
  }, (response) => {
    // 응답을 웹페이지로 전달
    window.postMessage(
      {
        target: 'crelink-injectscript',
        message: {
          id,
          result: response.result,
          error: response.error
        }
      },
      window.location.origin
    );
  });
}

/**
 * 백그라운드 스크립트로부터 오는 메시지 처리
 * @param message 메시지 객체
 * @param sender 발신자 정보
 * @param sendResponse 응답 콜백
 */
function handleBackgroundMessage(
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void
): boolean {
  // 콘텐츠 스크립트를 위한 메시지만 처리
  if (message.target !== 'crelink-contentscript') {
    return false;
  }
  
  // 메시지 타입에 따른 처리
  switch (message.type) {
    case 'chainChanged':
      // 체인 변경 이벤트를 웹페이지로 전달
      window.postMessage(
        {
          target: 'crelink-injectscript',
          message: {
            type: 'event',
            event: 'chainChanged',
            data: message.data
          }
        },
        window.location.origin
      );
      break;
      
    case 'accountsChanged':
      // 계정 변경 이벤트를 웹페이지로 전달
      window.postMessage(
        {
          target: 'crelink-injectscript',
          message: {
            type: 'event',
            event: 'accountsChanged',
            data: message.data
          }
        },
        window.location.origin
      );
      break;
      
    case 'disconnect':
      // 연결 해제 이벤트를 웹페이지로 전달
      window.postMessage(
        {
          target: 'crelink-injectscript',
          message: {
            type: 'event',
            event: 'disconnect',
            data: message.data
          }
        },
        window.location.origin
      );
      break;
  }
  
  // 응답 완료
  sendResponse({ success: true });
  return true;
}

/**
 * 백그라운드 스크립트로 메시지 전송
 * @param method 호출할 메서드
 * @param params 메서드 파라미터
 * @returns 응답 Promise
 */
export function sendMessageToBackground(method: string, params?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    // 고유 메시지 ID 생성
    const id = messageIdCounter++;
    
    // 응답 핸들러 등록
    pendingMessages.set(id, (response) => {
      if (response.error) {
        reject(new Error(response.error));
      } else {
        resolve(response.result);
      }
    });
    
    // 백그라운드 스크립트로 메시지 전송
    chrome.runtime.sendMessage({
      type: 'internal',
      id,
      method,
      params
    }, (response) => {
      // 응답 핸들러 호출 및 제거
      const handler = pendingMessages.get(id);
      if (handler) {
        handler(response);
        pendingMessages.delete(id);
      }
    });
  });
}

/**
 * 백그라운드 스크립트와 연결 유지
 */
function setupKeepAliveConnection(): void {
  // 백그라운드 스크립트와 포트 연결
  const port = chrome.runtime.connect({ name: 'keepAlive' });
  
  // 5분마다 핑 메시지 전송
  const pingInterval = setInterval(() => {
    try {
      port.postMessage({ type: 'ping' });
    } catch (error) {
      // 연결이 끊어진 경우 인터벌 정리
      clearInterval(pingInterval);
    }
  }, 300000); // 5분
  
  // 연결이 끊어지면 핑 인터벌 정리
  port.onDisconnect.addListener(() => {
    clearInterval(pingInterval);
  });
}