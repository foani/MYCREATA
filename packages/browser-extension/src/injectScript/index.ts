/**
 * InjectScript
 * 웹페이지의 window 객체에 직접 주입되는 스크립트
 * window.crelink 객체를 생성하여 웹페이지에서 지갑 기능에 접근할 수 있게 합니다.
 */

import { initializeProvider } from './provider';

console.log('CreLink Wallet Provider가 초기화되고 있습니다.');

// 웹페이지에 provider 객체 주입
try {
  // provider 초기화
  initializeProvider();
  
  console.log('CreLink Wallet Provider가 성공적으로 초기화되었습니다.');
} catch (error) {
  console.error('CreLink Wallet Provider 초기화 중 오류:', error);
}