# CreLink Core Library

CreLink Core는 Catena 기반 다중 플랫폼 지원 EVM 호환 지갑의 핵심 라이브러리입니다. 이 라이브러리는 브라우저 확장, 모바일 앱, Telegram MiniApp 등 다양한 플랫폼에서 공통으로 사용되는 기능을 제공합니다.

## 주요 기능

- **암호화 및 키 관리**: BIP-39 니모닉, BIP-32/44 계층적 결정성 지갑, 안전한 키스토어
- **체인 통신**: 다중 체인 지원, RPC 요청 처리, 트랜잭션 관리
- **인증 시스템**: zkDID 인증, 생체 인증, 다양한 복구 메커니즘
- **스토리지**: 보안 스토리지, 로컬 스토리지, 클라우드 동기화
- **유틸리티**: 주소 관리, 단위 변환, 검증 함수

## 설치

```bash
npm install @crelink/core
```

## 사용 예제

### 지갑 생성

```typescript
import { KeyManager } from '@crelink/core/crypto';

// 새 지갑 생성
const keyManager = new KeyManager();
const mnemonic = await keyManager.generateMnemonic();
console.log('생성된 니모닉:', mnemonic);

// 지갑 불러오기
const importedKeyManager = new KeyManager();
await importedKeyManager.importMnemonic(mnemonic);
```

### 계정 관리

```typescript
import { KeyManager } from '@crelink/core/crypto';
import { AccountModel } from '@crelink/core/storage';

// 키 관리자 생성
const keyManager = new KeyManager();
await keyManager.importMnemonic('your mnemonic here');

// 계정 모델 생성
const accountModel = new AccountModel();

// 계정 생성
const address = await keyManager.getAddress(0);
accountModel.addAccount({
  id: 'account-1',
  name: '내 계정',
  address,
  type: 'normal',
  source: 'created',
  createdAt: Date.now(),
  updatedAt: Date.now()
});
```

### 트랜잭션 생성 및 서명

```typescript
import { KeyManager } from '@crelink/core/crypto';
import { CatenaProvider } from '@crelink/core/chain';

// 키 관리자 및 프로바이더 생성
const keyManager = new KeyManager();
await keyManager.importMnemonic('your mnemonic here');

const provider = new CatenaProvider({
  rpcUrl: 'https://cvm.node.creatachain.com',
  chainId: '1000'
});

// 트랜잭션 생성
const tx = {
  to: '0x1234567890123456789012345678901234567890',
  value: '1000000000000000000', // 1 CTA
  gasLimit: '21000'
};

// 트랜잭션 서명
const signedTx = await keyManager.signTransaction(tx, 0);

// 트랜잭션 전송
const txHash = await provider.sendSignedTransaction(signedTx);
console.log('트랜잭션 해시:', txHash);
```

### 인증 시스템 사용

```typescript
import { AuthenticationManager } from '@crelink/core/auth';
import { SecureStorageFactory } from '@crelink/core/storage';

// 보안 스토리지 생성
const secureStorage = SecureStorageFactory.create({
  type: 'browser',
  prefix: 'crelink_',
  encryptionKey: 'your-encryption-key'
});

// 인증 관리자 생성
const authManager = new AuthenticationManager(secureStorage);

// PIN 설정
await authManager.setPin('123456');

// 인증
const credentials = { pin: '123456' };
const isAuthenticated = await authManager.authenticate(credentials);

if (isAuthenticated) {
  console.log('인증 성공!');
} else {
  console.log('인증 실패!');
}
```

### 유틸리티 함수 사용

```typescript
import {
  shortenAddress,
  weiToEther,
  etherToWei,
  isValidAddress,
  formatTokenValue
} from '@crelink/core/utils';

// 주소 포맷팅
const formattedAddress = shortenAddress('0x1234567890abcdef1234567890abcdef12345678');
console.log(formattedAddress); // 0x1234...5678

// 단위 변환
const ether = weiToEther('1000000000000000000');
console.log(ether); // 1

const wei = etherToWei('1.5');
console.log(wei); // 1500000000000000000

// 주소 검증
const isValid = isValidAddress('0x1234567890abcdef1234567890abcdef12345678');
console.log(isValid); // true

// 토큰 금액 포맷팅
const formatted = formatTokenValue('1000000000000000000', {
  symbol: 'CTA',
  decimals: 18,
  decimalPlaces: 2
});
console.log(formatted); // CTA 1.00
```

## 개발 설정

### 필수 조건

- Node.js v16 이상
- npm v7 이상

### 빌드

```bash
# 의존성 설치
npm install

# 라이브러리 빌드
npm run build
```

### 테스트

```bash
# 모든 테스트 실행
npm test

# 특정 모듈 테스트
npm test -- -t "KeyManager"
```

## 폴더 구조

```
src/
├── auth/                  # 인증 시스템 모듈
│   ├── authentication.ts  # 인증 관리자
│   ├── biometrics.ts      # 생체 인증
│   ├── recovery.ts        # 복구 메커니즘
│   ├── zkdid.ts           # zkDID 인증
│   └── index.ts
├── chain/                 # 체인 통신 모듈
│   ├── providers/         # 체인 프로바이더
│   ├── transactions.ts    # 트랜잭션 처리
│   ├── gas.ts             # 가스 관리
│   ├── switchEngine.ts    # 자동 체인 전환
│   └── index.ts
├── crypto/                # 암호화 및 키 관리 모듈
│   ├── keyManagement.ts   # 키 관리
│   ├── keystore.ts        # 키스토어
│   ├── mnemonic.ts        # 니모닉 처리
│   ├── encryption.ts      # 암호화 유틸리티
│   ├── signatures.ts      # 서명 유틸리티
│   └── index.ts
├── storage/               # 스토리지 모듈
│   ├── models/            # 데이터 모델
│   ├── secureStorage.ts   # 보안 스토리지
│   ├── localStore.ts      # 로컬 스토리지
│   ├── syncStorage.ts     # 동기화 스토리지
│   └── index.ts
├── utils/                 # 유틸리티 모듈
│   ├── address.ts         # 주소 관련
│   ├── conversion.ts      # 단위 변환
│   ├── errors.ts          # 오류 처리
│   ├── validation.ts      # 입력 검증
│   └── index.ts
└── index.ts               # 메인 내보내기
```

## 라이센스

MIT License
