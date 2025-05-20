/**
 * ContentScript
 * 웹페이지에 주입되는 스크립트
 * 웹페이지와 확장 프로그램 사이의 통신을 중계합니다.
 */

import { setupContentBridge } from './contentBridge';
import { injectScript } from './domHelper';

console.log('CreLink Wallet 콘텐츠 스크립트가 로드되었습니다.');

// DOM 준비 상태 확인
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeContentScript);
} else {
  initializeContentScript();
}

/**
 * 콘텐츠 스크립트 초기화
 */
function initializeContentScript(): void {
  try {
    // 중복 방지
    if (window.crelinkContentScriptInjected) {
      return;
    }
    window.crelinkContentScriptInjected = true;
    
    // Provider 주입 스크립트 삽입
    injectScript(chrome.runtime.getURL('injectScript.js'));
    
    // 콘텐츠 브릿지 설정
    setupContentBridge();
    
    // 백그라운드 스크립트와 연결 유지
    setupKeepAliveConnection();
    
    console.log('CreLink Wallet 콘텐츠 스크립트가 초기화되었습니다.');
  } catch (error) {
    console.error('콘텐츠 스크립트 초기화 중 오류:', error);
  }
}

/**
 * 백그라운드 스크립트 연결 유지
 * 서비스 워커가 비활성화되는 것을 방지
 */
function setupKeepAliveConnection(): void {
  // 백그라운드 스크립트와 포트 연결
  let port = chrome.runtime.connect({ name: 'keepAlive' });
  
  // 연결이 끊어지면 다시 연결
  port.onDisconnect.addListener(() => {
    port = chrome.runtime.connect({ name: 'keepAlive' });
  });
  
  // 5분마다 핑 메시지 전송
  setInterval(() => {
    port.postMessage({ type: 'ping' });
  }, 300000); // 5분
}

// 전역 타입 확장
declare global {
  interface Window {
    crelinkContentScriptInjected?: boolean;
  }
}
