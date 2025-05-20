# CreLink SDK - 기본 dApp 예제

이 예제는 CreLink SDK를 사용하여 웹 애플리케이션에서 CreLink 지갑과 상호작용하는 방법을 보여줍니다. 이 예제에서는 순수 HTML, JavaScript를 사용하였으며, 프레임워크 없이 구현되었습니다.

## 기능

- 지갑 연결 및 상태 확인
- 체인 전환 
- 토큰 전송
- 메시지 서명
- 이벤트 리스닝 및 로깅

## 시작하기

1. CreLink 지갑 확장 프로그램을 설치합니다.
2. 이 디렉토리에서 다음 명령을 실행합니다:

```bash
# HTTP 서버 실행 (Node.js가 설치되어 있는 경우)
npx http-server
```

또는 간단히 `index.html` 파일을 브라우저에서 직접 열어도 됩니다.

## 코드 설명

### 1. CreLink SDK 초기화

```javascript
// CreLink SDK 인스턴스 생성
crelink = new CreLink.CreLink({
  appName: 'CreLink SDK Example',
  appIcon: 'https://crelink.io/logo.png'
});

// CreLink 지갑이 설치되어 있는지 확인
if (crelink.isInstalled()) {
  // 이벤트 리스너 등록
  crelink.on('accountsChanged', (accounts) => {
    // 계정 변경 감지
  });
  
  crelink.on('chainChanged', (chainId) => {
    // 체인 변경 감지
  });
  
  // UI 초기화
  await updateUI();
}
```

### 2. 지갑 연결

```javascript
// 지갑 연결 버튼 클릭 시
try {
  const accounts = await crelink.connect();
  console.log('Connected accounts:', accounts);
} catch (error) {
  console.error('Connection error:', error);
}
```

### 3. 체인 전환

```javascript
// 체인 전환 버튼 클릭 시
try {
  const chainId = '0x3E8'; // Catena Mainnet
  await crelink.switchChain(chainId);
} catch (error) {
  console.error('Chain switch error:', error);
}
```

### 4. 트랜잭션 전송

```javascript
// 트랜잭션 전송 시
try {
  const txParams = {
    to: '0x...',  // 수신자 주소
    value: '0x...',  // Wei 단위 값 (16진수)
    data: '0x'  // 선택적 데이터
  };
  
  const txHash = await crelink.sendTransaction(txParams);
  console.log('Transaction hash:', txHash);
} catch (error) {
  console.error('Transaction error:', error);
}
```

### 5. 메시지 서명

```javascript
// 메시지 서명 시
try {
  const message = 'Hello CreLink!';
  const signature = await crelink.signMessage(message);
  console.log('Signature:', signature);
} catch (error) {
  console.error('Signing error:', error);
}
```

## CreLink SDK 메서드 참조

| 메서드 | 설명 |
|--------|------|
| `isInstalled()` | CreLink 지갑이 설치되어 있는지 확인합니다. |
| `isConnected()` | 지갑이 연결되어 있는지 확인합니다. |
| `connect()` | 지갑에 연결하고 계정 접근 권한을 요청합니다. |
| `getAccounts()` | 연결된 계정 목록을 가져옵니다. |
| `getChainId()` | 현재 체인 ID를 가져옵니다. |
| `switchChain(chainId)` | 지정된 체인으로 전환합니다. |
| `addChain(chainParams)` | 새 체인을 지갑에 추가합니다. |
| `sendTransaction(txParams)` | 트랜잭션을 전송합니다. |
| `signMessage(message, [address])` | 메시지에 서명합니다. |
| `on(eventName, listener)` | 이벤트 리스너를 등록합니다. |
| `removeListener(eventName, listener)` | 이벤트 리스너를 제거합니다. |

## 이벤트 타입

| 이벤트 | 설명 |
|--------|------|
| `accountsChanged` | 계정이 변경되었을 때 발생합니다. |
| `chainChanged` | 체인이 변경되었을 때 발생합니다. |
| `connect` | 지갑 연결 시 발생합니다. |
| `disconnect` | 지갑 연결 해제 시 발생합니다. |
| `message` | 지갑에서 메시지가 수신되었을 때 발생합니다. |

## 지원하는 체인

| 체인 | 체인 ID (10진수) | 체인 ID (16진수) |
|------|-----------------|-----------------|
| Catena (CIP-20) Mainnet | 1000 | 0x3E8 |
| Catena (CIP-20) Testnet | 9000 | 0x2328 |
| Polygon Mainnet | 137 | 0x89 |
| Polygon Mumbai Testnet | 80001 | 0x13881 |
| Arbitrum One | 42161 | 0xA4B1 |

## 참고 사항

- 이 예제는 개발 및 학습 목적으로만 사용해야 합니다.
- 실제 애플리케이션에서는 적절한 오류 처리와 보안 조치를 취해야 합니다.
