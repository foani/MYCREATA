/**
 * CreLink Wallet 백그라운드 서비스
 * 확장 프로그램의 백그라운드 프로세스로 동작하는 메인 진입점입니다.
 * 백그라운드 서비스는 지갑 상태를 관리하고, 메시지 처리, 서명 요청 처리 등을 담당합니다.
 */

import { WalletController } from './walletController';
import { setupMessageHandlers } from './messageHandlers';

console.log('CreLink Wallet 백그라운드 서비스가 시작되었습니다.');

// 지갑 컨트롤러 인스턴스 생성
const walletController = new WalletController();

// 메시지 핸들러 설정
setupMessageHandlers(walletController);

// 초기화 작업 수행
const initialize = async () => {
  try {
    await walletController.init();
    console.log('지갑 컨트롤러가 성공적으로 초기화되었습니다.');
  } catch (error) {
    console.error('지갑 컨트롤러 초기화 중 오류가 발생했습니다:', error);
  }
};

// 서비스 워커 초기화
initialize();

// 서비스 워커 활성화 상태 유지를 위한 이벤트 리스너
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'keepAlive') {
    port.onDisconnect.addListener(() => {
      // 연결이 끊어졌을 때 다시 연결하도록 컨텐츠 스크립트에 메시지 전송
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0 && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'reconnect' });
        }
      });
    });
  }
});

// 설치 및 업데이트 이벤트 처리
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // 첫 설치 시 온보딩 페이지 열기
    chrome.tabs.create({ url: chrome.runtime.getURL('onboarding.html') });
  } else if (details.reason === 'update') {
    // 업데이트 시 변경 사항 알림
    console.log(`확장 프로그램이 버전 ${chrome.runtime.getManifest().version}로 업데이트되었습니다.`);
  }
});

// 백그라운드에서 전역 상태로 사용할 수 있도록 export
export { walletController };