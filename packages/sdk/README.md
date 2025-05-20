# CreLink SDK

CreLink SDK는 웹 애플리케이션에서 CreLink 지갑과 쉽게 상호작용할 수 있게 해주는 자바스크립트 라이브러리입니다. 이 SDK는 [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) 표준을 준수하며, 다양한 프레임워크와 호환됩니다.

## 특징

- 간편한 지갑 연결 및 관리
- 트랜잭션 전송 및 서명
- 메시지 서명
- 체인 전환 및 관리
- 이벤트 리스닝
- React 통합 컴포넌트
- TypeScript 지원

## 설치

### NPM을 통한 설치

```bash
npm install crelink-sdk
```

### CDN을 통한 설치

```html
<script src="https://cdn.crelink.io/sdk/1.0.0/crelink.min.js"></script>
```

## 기본 사용법

```javascript
// SDK 인스턴스 생성
const crelink = new CreLink.CreLink({
  appName: 'My dApp',
  appIcon: 'https://mydapp.com/icon.png' // 선택사항
});

// 지갑이 설치되었는지 확인
if (crelink.isInstalled()) {
  // 지갑 연결
  try {
    const accounts = await crelink.connect();
    console.log('Connected accounts:', accounts);
    
    // 현재 체인 ID 가져오기
    const chainId = await crelink.getChainId();
    console.log('Current chain ID:', chainId);
    
    // 트랜잭션 전송
    const txHash = await crelink.sendTransaction({
      to: '0x...',
      value: '0x...' // Wei 단위 (16진수)
    });
    console.log('Transaction hash:', txHash);
    
    // 메시지 서명
    const signature = await crelink.signMessage('Hello CreLink!');
    console.log('Signature:', signature);
  } catch (error) {
    console.error('Error:', error);
  }
} else {
  console.log('CreLink wallet is not installed');
}
```

## 이벤트 처리

```javascript
// 계정 변경 이벤트 처리
crelink.on('accountsChanged', (accounts) => {
  console.log('Accounts changed:', accounts);
  // UI 업데이트
});

// 체인 변경 이벤트 처리
crelink.on('chainChanged', (chainId) => {
  console.log('Chain changed:', chainId);
  // UI 업데이트
});

// 연결 해제 이벤트 처리
crelink.on('disconnect', (error) => {
  console.log('Disconnected:', error);
  // UI 업데이트
});
```

## React 통합

CreLink SDK는 React 애플리케이션을 위한 통합 컴포넌트를 제공합니다.

```jsx
import { CreLinkProvider, useCreLink, WalletButton } from 'crelink-sdk/react';

function App() {
  return (
    <CreLinkProvider>
      <YourApp />
    </CreLinkProvider>
  );
}

function YourApp() {
  const { isConnected, accounts, chainId, connect, switchChain } = useCreLink();

  return (
    <div>
      <WalletButton />
      
      {isConnected && (
        <div>
          <p>Connected account: {accounts[0]}</p>
          <p>Current chain: {chainId}</p>
          <button onClick={() => switchChain('0x3E8')}>
            Switch to Catena Mainnet
          </button>
        </div>
      )}
    </div>
  );
}
```

## API 참조

### `CreLink` 클래스

#### 생성자

```javascript
new CreLink.CreLink(options)
```

- `options.appName` - dApp 이름 (필수)
- `options.appIcon` - dApp 아이콘 URL (선택사항)

#### 메서드

| 메서드 | 설명 | 반환 타입 |
|--------|------|-----------|
| `isInstalled()` | CreLink 지갑이 설치되어 있는지 확인 | `boolean` |
| `isConnected()` | 지갑이 연결되어 있는지 확인 | `boolean` |
| `connect()` | 지갑에 연결하고 계정 접근 권한 요청 | `Promise<string[]>` |
| `getAccounts()` | 연결된 계정 목록 가져오기 | `Promise<string[]>` |
| `getChainId()` | 현재 체인 ID 가져오기 | `Promise<string>` |
| `switchChain(chainId)` | 체인 전환하기 | `Promise<null>` |
| `addChain(chainParams)` | 새 체인 추가하기 | `Promise<null>` |
| `sendTransaction(txParams)` | 트랜잭션 전송하기 | `Promise<string>` |
| `signMessage(message, [address])` | 메시지 서명하기 | `Promise<string>` |
| `on(eventName, listener)` | 이벤트 리스너 등록하기 | `void` |
| `removeListener(eventName, listener)` | 이벤트 리스너 제거하기 | `void` |

### 이벤트 타입

| 이벤트 | 설명 |
|--------|------|
| `accountsChanged` | 계정이 변경되었을 때 발생 |
| `chainChanged` | 체인이 변경되었을 때 발생 |
| `connect` | 지갑 연결 시 발생 |
| `disconnect` | 지갑 연결 해제 시 발생 |
| `message` | 지갑에서 메시지가 수신되었을 때 발생 |

### React 훅 및 컴포넌트

#### `CreLinkProvider`

React 애플리케이션에서 CreLink 지갑 상태를 관리하는 컨텍스트 프로바이더입니다.

```jsx
<CreLinkProvider 
  autoConnect={false} 
  onError={(error) => console.error(error)}
>
  {children}
</CreLinkProvider>
```

- `autoConnect` - 자동 연결 여부 (기본값: false)
- `onError` - 오류 처리 콜백 함수

#### `useCreLink` 훅

CreLink 지갑 상태와 기능에 액세스하기 위한 훅입니다.

```jsx
const {
  isConnected,      // 연결 여부
  accounts,         // 계정 목록
  chainId,          // 체인 ID
  balance,          // 잔액
  connecting,       // 연결 중 상태
  error,            // 오류
  connect,          // 연결 함수
  disconnect,       // 연결 해제 함수
  switchChain,      // 체인 전환 함수
  sendTransaction,  // 트랜잭션 전송 함수
  signMessage,      // 메시지 서명 함수
  addChain          // 체인 추가 함수
} = useCreLink();
```

#### `WalletButton` 컴포넌트

지갑 연결/연결 해제 버튼 컴포넌트입니다.

```jsx
<WalletButton 
  variant="primary" 
  className="my-button-class"
  buttonText={{
    connect: '지갑 연결',
    connecting: '연결 중...',
    connected: '연결됨'
  }}
/>
```

- `variant` - 버튼 스타일 ('primary', 'secondary', 'outline')
- `className` - 추가 CSS 클래스
- `buttonText` - 버튼 텍스트 커스터마이징

#### `NetworkSelector` 컴포넌트

네트워크 선택 드롭다운 컴포넌트입니다.

```jsx
<NetworkSelector 
  className="my-selector-class"
  showTestnets={true}
  onNetworkChange={(network) => console.log('Network changed:', network)}
/>
```

- `className` - 추가 CSS 클래스
- `showTestnets` - 테스트넷 표시 여부 (기본값: true)
- `onNetworkChange` - 네트워크 변경 콜백 함수

## 예제

- [기본 예제](./examples/basic-dapp) - 순수 HTML/JS 예제
- [React 통합 예제](./examples/react-integration) - React 예제

## 지원하는 체인

| 체인 | 체인 ID (10진수) | 체인 ID (16진수) |
|------|-----------------|-----------------|
| Catena (CIP-20) Mainnet | 1000 | 0x3E8 |
| Catena (CIP-20) Testnet | 9000 | 0x2328 |
| Polygon Mainnet | 137 | 0x89 |
| Polygon Mumbai Testnet | 80001 | 0x13881 |
| Arbitrum One | 42161 | 0xA4B1 |

## 브라우저 호환성

- Chrome 88+
- Firefox 90+
- Edge 88+
- Safari 14+

## 라이선스

MIT
