/**
 * 메시지 핸들러
 * 확장 프로그램 내부 및 외부 통신을 위한 메시지 핸들러 설정
 */

import { WalletController } from './walletController';

interface MessageRequest {
  type: string;
  method: string;
  params?: any;
  id?: number;
}

interface MessageResponse {
  id?: number;
  result?: any;
  error?: any;
}

/**
 * 메시지 핸들러 설정
 * @param walletController 지갑 컨트롤러 인스턴스
 */
export function setupMessageHandlers(walletController: WalletController): void {
  // 내부 메시지 리스너 (팝업과 백그라운드 사이의 통신)
  chrome.runtime.onMessage.addListener((message: MessageRequest, sender, sendResponse) => {
    if (message.type === 'internal') {
      handleInternalMessage(message, walletController)
        .then(sendResponse)
        .catch((error) => {
          console.error('메시지 처리 중 오류:', error);
          sendResponse({ error: error.message });
        });
      
      // true를 반환하여 비동기 응답을 기다리도록 함
      return true;
    }
  });
  
  // 외부 메시지 리스너 (컨텐츠 스크립트에서 전달되는 메시지)
  chrome.runtime.onMessage.addListener((message: MessageRequest, sender, sendResponse) => {
    if (message.type === 'external') {
      handleExternalMessage(message, sender, walletController)
        .then(sendResponse)
        .catch((error) => {
          console.error('외부 메시지 처리 중 오류:', error);
          sendResponse({ error: error.message });
        });
      
      // true를 반환하여 비동기 응답을 기다리도록 함
      return true;
    }
  });
}

/**
 * 내부 메시지 처리
 * @param message 메시지 객체
 * @param walletController 지갑 컨트롤러 인스턴스
 */
async function handleInternalMessage(
  message: MessageRequest,
  walletController: WalletController
): Promise<MessageResponse> {
  const { method, params, id } = message;
  let result = null;
  let error = null;
  
  try {
    switch (method) {
      case 'isInitialized':
        result = walletController.isWalletInitialized();
        break;
        
      case 'isLocked':
        result = walletController.isWalletLocked();
        break;
        
      case 'hasWallet':
        result = await walletController.hasWallet();
        break;
        
      case 'createWallet':
        result = await walletController.createWallet(params.password);
        break;
        
      case 'recoverWallet':
        await walletController.recoverWallet(params.mnemonic, params.password);
        result = true;
        break;
        
      case 'recoverWalletWithDID':
        await walletController.recoverWalletWithDID(params.didType, params.didCredential, params.pin);
        result = true;
        break;
        
      case 'unlockWallet':
        result = await walletController.unlockWallet(params.password);
        break;
        
      case 'lockWallet':
        walletController.lockWallet();
        result = true;
        break;
        
      case 'getAccounts':
        result = await walletController.getAccounts();
        break;
        
      case 'getSelectedAccount':
        result = await walletController.getSelectedAccount();
        break;
        
      case 'selectAccount':
        await walletController.selectAccount(params.address);
        result = true;
        break;
        
      case 'createAccount':
        result = await walletController.createAccount();
        break;
        
      case 'getSelectedNetwork':
        result = await walletController.getSelectedNetwork();
        break;
        
      case 'selectNetwork':
        await walletController.selectNetwork(params.chainId);
        result = true;
        break;
        
      case 'signAndSendTransaction':
        result = await walletController.signAndSendTransaction(params.txParams);
        break;
        
      case 'signPersonalMessage':
        result = await walletController.signPersonalMessage(params.message);
        break;
        
      case 'signTypedData':
        result = await walletController.signTypedData(params.typedData);
        break;
        
      default:
        throw new Error(`지원하지 않는 메서드: ${method}`);
    }
  } catch (e) {
    error = (e as Error).message;
  }
  
  return { id, result, error };
}

/**
 * 외부 메시지 처리 (웹 페이지에서 전달되는 요청)
 * @param message 메시지 객체
 * @param sender 메시지 발신자 정보
 * @param walletController 지갑 컨트롤러 인스턴스
 */
async function handleExternalMessage(
  message: MessageRequest,
  sender: chrome.runtime.MessageSender,
  walletController: WalletController
): Promise<MessageResponse> {
  const { method, params, id } = message;
  let result = null;
  let error = null;
  
  // 발신자의 출처 확인 (보안 검사)
  const origin = sender.origin || (sender.url ? new URL(sender.url).origin : null);
  if (!origin) {
    return { id, error: '알 수 없는 출처에서 요청이 왔습니다.' };
  }
  
  try {
    // 지갑이 잠겨있는지 확인
    if (walletController.isWalletLocked() && method !== 'eth_chainId') {
      // 지갑이 잠겨있으면 팝업 창을 열어 사용자 인증 요청
      await openPopupForAuthorization();
      
      // 사용자가 인증을 완료할 때까지 기다림
      // 실제 구현에서는 더 복잡한 로직이 필요할 수 있음
      if (walletController.isWalletLocked()) {
        throw new Error('지갑이 잠겨 있습니다. 먼저 잠금을 해제하세요.');
      }
    }
    
    switch (method) {
      case 'eth_requestAccounts':
        // 사용자에게 계정 접근 권한 요청
        result = await requestAccountAccess(origin, walletController);
        break;
        
      case 'eth_accounts':
        // 이미 접근 권한이 있는 계정 목록 반환
        result = await getAuthorizedAccounts(origin, walletController);
        break;
        
      case 'eth_chainId':
        // 현재 체인 ID 반환
        const network = await walletController.getSelectedNetwork();
        result = '0x' + network.chainId.toString(16);
        break;
        
      case 'eth_sendTransaction':
        // 트랜잭션 서명 및 전송
        // 사용자 확인을 위해 팝업 열기
        result = await requestTransactionApproval(origin, params[0], walletController);
        break;
        
      case 'eth_signTypedData_v4':
      case 'eth_signTypedData':
        // 타입화된 데이터 서명
        // 사용자 확인을 위해 팝업 열기
        result = await requestSignatureApproval(origin, 'typedData', params, walletController);
        break;
        
      case 'personal_sign':
        // 개인 메시지 서명
        // 사용자 확인을 위해 팝업 열기
        result = await requestSignatureApproval(origin, 'personalSign', params, walletController);
        break;
        
      case 'wallet_switchEthereumChain':
        // 체인 변경 요청
        // 사용자 확인을 위해 팝업 열기
        result = await requestChainSwitch(origin, params[0].chainId, walletController);
        break;
        
      case 'wallet_addEthereumChain':
        // 새 체인 추가 요청
        // 사용자 확인을 위해 팝업 열기
        result = await requestAddChain(origin, params[0], walletController);
        break;
        
      default:
        throw new Error(`지원하지 않는 메서드: ${method}`);
    }
  } catch (e) {
    error = (e as Error).message;
  }
  
  return { id, result, error };
}

/**
 * 사용자 인증을 위한 팝업 열기
 */
async function openPopupForAuthorization(): Promise<void> {
  return new Promise((resolve) => {
    chrome.windows.create({
      url: chrome.runtime.getURL('popup.html?action=unlock'),
      type: 'popup',
      width: 360,
      height: 600
    }, () => {
      // 실제 구현에서는 사용자가 인증을 완료할 때까지 기다리는 로직 필요
      resolve();
    });
  });
}

/**
 * 계정 접근 권한 요청
 * @param origin 요청 출처
 * @param walletController 지갑 컨트롤러 인스턴스
 */
async function requestAccountAccess(
  origin: string,
  walletController: WalletController
): Promise<string[]> {
  // 실제 구현에서는 사용자에게 접근 권한 요청 팝업 표시
  // 여기서는 간단한 구현으로 현재 계정 반환
  return walletController.getAccounts();
}

/**
 * 이미 권한이 있는 계정 목록 조회
 * @param origin 요청 출처
 * @param walletController 지갑 컨트롤러 인스턴스
 */
async function getAuthorizedAccounts(
  origin: string,
  walletController: WalletController
): Promise<string[]> {
  // 실제 구현에서는 특정 출처에 대해 권한이 있는 계정만 필터링
  // 여기서는 간단한 구현으로 모든 계정 반환
  return walletController.getAccounts();
}

/**
 * 트랜잭션 승인 요청
 * @param origin 요청 출처
 * @param txParams 트랜잭션 파라미터
 * @param walletController 지갑 컨트롤러 인스턴스
 */
async function requestTransactionApproval(
  origin: string,
  txParams: any,
  walletController: WalletController
): Promise<string> {
  // 실제 구현에서는 사용자에게 트랜잭션 승인 팝업 표시
  // 여기서는 간단한 구현으로 바로 서명 및 전송
  return walletController.signAndSendTransaction(txParams);
}

/**
 * 서명 승인 요청
 * @param origin 요청 출처
 * @param type 서명 유형 ('personalSign' | 'typedData')
 * @param params 서명 파라미터
 * @param walletController 지갑 컨트롤러 인스턴스
 */
async function requestSignatureApproval(
  origin: string,
  type: 'personalSign' | 'typedData',
  params: any[],
  walletController: WalletController
): Promise<string> {
  // 실제 구현에서는 사용자에게 서명 승인 팝업 표시
  // 여기서는 간단한 구현으로 바로 서명
  if (type === 'personalSign') {
    return walletController.signPersonalMessage(params[0]);
  } else {
    return walletController.signTypedData(JSON.parse(params[1]));
  }
}

/**
 * 체인 변경 요청
 * @param origin 요청 출처
 * @param chainId 체인 ID
 * @param walletController 지갑 컨트롤러 인스턴스
 */
async function requestChainSwitch(
  origin: string,
  chainId: string,
  walletController: WalletController
): Promise<null> {
  // 16진수 문자열을 숫자로 변환
  const chainIdNum = parseInt(chainId, 16);
  
  // 실제 구현에서는 사용자에게 체인 변경 승인 팝업 표시
  // 여기서는 간단한 구현으로 바로 체인 변경
  await walletController.selectNetwork(chainIdNum);
  
  return null;
}

/**
 * 새 체인 추가 요청
 * @param origin 요청 출처
 * @param chainParams 체인 파라미터
 * @param walletController 지갑 컨트롤러 인스턴스
 */
async function requestAddChain(
  origin: string,
  chainParams: any,
  walletController: WalletController
): Promise<null> {
  // 실제 구현에서는 사용자에게 체인 추가 승인 팝업 표시 및 네트워크 서비스에 체인 추가
  // 여기서는 간단한 구현으로 아무 작업도 하지 않음
  
  return null;
}