# CreLink React Integration Example

이 예제는 React 애플리케이션에서 CreLink 지갑을 통합하는 방법을 보여줍니다. `CreLinkProvider` 컨텍스트 프로바이더를 사용하여 지갑 상태를 관리하고, `useCreLink` 훅을 통해 지갑 기능에 액세스할 수 있습니다.

## 주요 구성 요소

- **CreLinkProvider.tsx**: CreLink 지갑 상태를 관리하는 컨텍스트 프로바이더
- **WalletButton.tsx**: 지갑 연결/연결 해제 기능을 제공하는 버튼 컴포넌트
- **ExampleApp.tsx**: 전체 기능을 시연하는 예제 애플리케이션

## 설치 방법

React 프로젝트에 CreLink 지갑 연동을 추가하려면:

1. `CreLinkProvider.tsx` 파일을 프로젝트에 복사
2. (선택사항) `WalletButton.tsx` 파일을 프로젝트에 복사

## 사용 예시

### 기본 설정

```jsx
// App.js
import React from 'react';
import { CreLinkProvider } from './CreLinkProvider';

function App() {
  return (
    <CreLinkProvider>
      {/* 앱 컴포넌트 */}
      <YourAppComponent />
    </CreLinkProvider>
  );
}

export default App;
```

### 지갑 연결 및 상태 사용

```jsx
// YourComponent.js
import React from 'react';
import { useCreLink } from './CreLinkProvider';
import WalletButton from './WalletButton';

function YourComponent() {
  const { isConnected, accounts, chainId, balance } = useCreLink();

  if (!isConnected) {
    return (
      <div>
        <h1>지갑 연결이 필요합니다</h1>
        <WalletButton />
      </div>
    );
  }

  return (
    <div>
      <h1>연결된 지갑 정보</h1>
      <p>계정: {accounts[0]}</p>
      <p>체인 ID: {chainId}</p>
      <p>잔액: {parseInt(balance || '0', 16) / 1e18} ETH</p>
    </div>
  );
}

export default YourComponent;
```

### 트랜잭션 전송

```jsx
const { sendTransaction, accounts } = useCreLink();

const handleSend = async () => {
  try {
    const txHash = await sendTransaction({
      to: recipientAddress,
      from: accounts[0],
      value: '0x' + (amount * 1e18).toString(16), // ETH를 Wei로 변환
      data: '0x', // 선택적 데이터
    });
    console.log('Transaction sent:', txHash);
  } catch (error) {
    console.error('Transaction failed:', error);
  }
};
```

### 메시지 서명

```jsx
const { signMessage, accounts } = useCreLink();

const handleSign = async () => {
  try {
    const signature = await signMessage('Hello CreLink!');
    console.log('Signature:', signature);
  } catch (error) {
    console.error('Signing failed:', error);
  }
};
```

### 체인 변경

```jsx
const { switchChain } = useCreLink();

const handleSwitchToMainnet = async () => {
  try {
    // Catena (CIP-20) Chain Mainnet 체인 ID
    await switchChain('0x3E8');
    console.log('Switched to Catena Mainnet');
  } catch (error) {
    console.error('Failed to switch chain:', error);
  }
};
```

## 지원하는 기능

- 지갑 연결/연결 해제
- 계정 및 체인 정보 액세스
- 트랜잭션 전송
- 메시지 서명
- 체인 변경 및 추가

## 자동 연결 설정

사용자가 이전에 지갑을 연결한 경우 자동으로 연결하려면:

```jsx
<CreLinkProvider autoConnect={true}>
  {/* 앱 컴포넌트 */}
</CreLinkProvider>
```

## 에러 처리

전역 에러 핸들러를 지정할 수 있습니다:

```jsx
<CreLinkProvider
  onError={(error) => console.error('CreLink error:', error)}
>
  {/* 앱 컴포넌트 */}
</CreLinkProvider>
```

## 참고 사항

- 이 예제는 CreLink 지갑 확장 프로그램이 설치되어 있어야 작동합니다.
- 개발 중에는 Catena (CIP-20) Chain Testnet을 사용하는 것이 좋습니다.
