// DOM 요소
const connectButton = document.getElementById('connect-button');
const switchChainButton = document.getElementById('switch-chain-button');
const chainSelect = document.getElementById('chain-select');
const sendTxButton = document.getElementById('send-tx-button');
const signButton = document.getElementById('sign-button');
const txForm = document.getElementById('tx-form');
const signForm = document.getElementById('sign-form');
const resultBox = document.getElementById('result-box');
const connectionText = document.getElementById('connection-text');
const accountBadge = document.getElementById('account-badge');
const accountContainer = document.getElementById('account-container');
const chainBadge = document.getElementById('chain-badge');
const chainContainer = document.getElementById('chain-container');
const installAlert = document.getElementById('install-alert');

// CreLink SDK 인스턴스
let crelink;

// 로그 함수
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  let logPrefix = '';
  
  switch (type) {
    case 'success':
      logPrefix = `[${timestamp}] ✅ `;
      break;
    case 'error':
      logPrefix = `[${timestamp}] ❌ `;
      break;
    case 'event':
      logPrefix = `[${timestamp}] 🔔 `;
      break;
    default:
      logPrefix = `[${timestamp}] ℹ️ `;
  }
  
  resultBox.innerHTML = logPrefix + message + '\n' + resultBox.innerHTML;
}

// 주소 줄임 함수
function shortenAddress(address) {
  return address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '';
}

// 체인 ID를 이름으로 변환하는 함수
function getChainName(chainId) {
  const chains = {
    '0x3E8': 'Catena (CIP-20) Mainnet',
    '0x2328': 'Catena (CIP-20) Testnet',
    '0x89': 'Polygon Mainnet',
    '0x13881': 'Polygon Mumbai',
    '0xA4B1': 'Arbitrum One',
    '0x1': 'Ethereum Mainnet'
  };
  
  return chains[chainId] || `Chain ${chainId}`;
}

// UI 업데이트 함수
async function updateUI() {
  try {
    // 연결 상태 확인
    const isConnected = crelink.isConnected();
    
    if (isConnected) {
      // 계정 정보 가져오기
      const accounts = await crelink.getAccounts();
      const account = accounts[0];
      
      // 체인 ID 가져오기
      const chainId = await crelink.getChainId();
      
      // UI 업데이트
      connectionText.innerText = '연결됨';
      accountBadge.innerText = shortenAddress(account);
      accountContainer.classList.remove('d-none');
      
      chainBadge.innerText = getChainName(chainId);
      chainContainer.classList.remove('d-none');
      
      // 버튼 활성화
      switchChainButton.disabled = false;
      chainSelect.disabled = false;
      sendTxButton.disabled = false;
      signButton.disabled = false;
      
      // 연결 버튼 텍스트 변경
      connectButton.innerText = '지갑 연결됨';
    } else {
      // 연결되지 않은 상태 UI
      connectionText.innerText = '연결되지 않음';
      accountContainer.classList.add('d-none');
      chainContainer.classList.add('d-none');
      
      // 버튼 비활성화
      switchChainButton.disabled = true;
      chainSelect.disabled = true;
      sendTxButton.disabled = true;
      signButton.disabled = true;
      
      // 연결 버튼 텍스트 변경
      connectButton.innerText = '지갑 연결';
    }
  } catch (error) {
    log(`UI 업데이트 중 오류 발생: ${error.message}`, 'error');
  }
}

// 초기화 함수
async function init() {
  try {
    // CreLink SDK 인스턴스 생성
    crelink = new CreLink.CreLink({
      appName: 'CreLink SDK Example',
      appIcon: 'https://crelink.io/logo.png'
    });
    
    // CreLink 지갑이 설치되어 있는지 확인
    if (crelink.isInstalled()) {
      installAlert.classList.add('d-none');
      connectButton.disabled = false;
      
      // 이벤트 리스너 등록
      crelink.on('accountsChanged', (accounts) => {
        log(`계정 변경됨: ${shortenAddress(accounts[0])}`, 'event');
        updateUI();
      });
      
      crelink.on('chainChanged', (chainId) => {
        log(`체인 변경됨: ${getChainName(chainId)}`, 'event');
        updateUI();
      });
      
      crelink.on('disconnect', (error) => {
        log(`지갑 연결 해제됨: ${error.message}`, 'event');
        updateUI();
      });
      
      crelink.on('connect', (connectInfo) => {
        log(`지갑 연결됨: ${getChainName(connectInfo.chainId)}`, 'event');
        updateUI();
      });
      
      // UI 초기화
      await updateUI();
      
      log('CreLink SDK가 초기화되었습니다.', 'success');
    } else {
      log('CreLink 지갑이 설치되어 있지 않습니다.', 'error');
    }
  } catch (error) {
    log(`초기화 중 오류 발생: ${error.message}`, 'error');
  }
}

// 이벤트 핸들러
// 연결 버튼 클릭
connectButton.addEventListener('click', async () => {
  try {
    if (!crelink.isConnected()) {
      log('지갑 연결 시도 중...');
      const accounts = await crelink.connect();
      log(`지갑 연결 성공: ${shortenAddress(accounts[0])}`, 'success');
    } else {
      log('이미 지갑에 연결되어 있습니다.');
    }
  } catch (error) {
    log(`지갑 연결 중 오류 발생: ${error.message}`, 'error');
  }
});

// 체인 전환 버튼 클릭
switchChainButton.addEventListener('click', async () => {
  try {
    const chainId = chainSelect.value;
    
    if (!chainId) {
      log('체인을 선택하세요.', 'error');
      return;
    }
    
    log(`체인 전환 시도 중: ${getChainName(chainId)}...`);
    await crelink.switchChain(chainId);
    log(`체인 전환 성공: ${getChainName(chainId)}`, 'success');
  } catch (error) {
    log(`체인 전환 중 오류 발생: ${error.message}`, 'error');
  }
});

// 트랜잭션 전송 폼 제출
txForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  try {
    const to = document.getElementById('tx-to').value;
    const value = document.getElementById('tx-value').value;
    const data = document.getElementById('tx-data').value || '0x';
    
    // 값을 wei 단위로 변환
    const valueInWei = ethers.parseEther(value).toString();
    
    const txParams = {
      to,
      value: valueInWei,
      data
    };
    
    log(`트랜잭션 전송 시도 중: ${to}에게 ${value} CTA 전송...`);
    const txHash = await crelink.sendTransaction(txParams);
    log(`트랜잭션 전송 성공: ${txHash}`, 'success');
  } catch (error) {
    log(`트랜잭션 전송 중 오류 발생: ${error.message}`, 'error');
  }
});

// 메시지 서명 폼 제출
signForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  try {
    const message = document.getElementById('sign-message').value;
    
    log(`메시지 서명 시도 중: "${message}"...`);
    const signature = await crelink.signMessage(message);
    log(`메시지 서명 성공: ${signature}`, 'success');
  } catch (error) {
    log(`메시지 서명 중 오류 발생: ${error.message}`, 'error');
  }
});

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', init);
