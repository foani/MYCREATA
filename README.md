# CreLink 지갑

CreLink는 Catena 메인넷을 기반으로 한 다중 플랫폼 지원 EVM 지갑입니다. 브라우저 확장(Chrome), 모바일 앱(iOS/Android), Telegram MiniApp 버전을 포함하며, DID 기반 인증 및 고급 보안 기능, 미니앱 런처 및 체인간 자동전환 기능 등을 통해 Web3 대중화를 목표로 합니다.

## 주요 기능

- **다중 플랫폼 지원**: 브라우저 확장, 모바일 앱, Telegram MiniApp을 통해 다양한 환경에서 지갑 사용 가능
- **DID 기반 인증**: zkDID를 통한 안전한 신원 증명 및 관리
- **고급 보안 기능**: 다양한 복구 방식 및 디바이스 바인딩 지원
- **미니앱 런처**: 내부 iframe 또는 sandbox 기반 실행으로 다양한 DApp 지원
- **자동 체인 전환**: 사용자 경험 개선을 위한 Instant Switch Engine
- **다중 체인 지원**: Catena, Polygon, Arbitrum 등 다양한 EVM 호환 체인 지원

## 개발 현황

- ✅ **코어 라이브러리 개발**: 완료
- ✅ **브라우저 확장 프로그램 개발**: 완료
- ✅ **모바일 앱 개발**: 완료 (100%)
- 🔄 **Telegram MiniApp 개발**: 진행 중
- 🔄 **zkDID 인증 서버 개발**: 진행 중
- 🔄 **SDK 개발**: 진행 중

## 프로젝트 구조

```
crelink-wallet/
├── packages/
│   ├── core/                   # 핵심 기능 라이브러리
│   ├── browser-extension/      # 크롬 확장 프로그램
│   ├── mobile-app/             # iOS/Android 앱
│   ├── telegram-miniapp/       # Telegram WebApp
│   ├── sdk/                    # DApp 연동 SDK
│   └── zkdid-server/           # zkDID 인증 서버
├── common/                    # 공통 리소스
├── docs/                      # 문서
├── tools/                     # 빌드 및 배포 도구
└── scripts/                   # 유틸리티 스크립트
```

## 시작하기

### 필수 조건

- Node.js v16 이상
- npm v7 이상
- Git

### 설치 및 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/creatachain/crelink-wallet.git
cd crelink-wallet

# 의존성 설치
npm install

# 코어 패키지 빌드
npm run build
```

### 브라우저 확장 개발

```bash
# 브라우저 확장 개발 모드 실행
cd packages/browser-extension
npm run dev

# 브라우저 확장 빌드
npm run build
```

### 테스트

```bash
# 전체 테스트 실행
npm test

# 특정 패키지 테스트
cd packages/core
npm test
```

## 구현된 기능

### 코어 라이브러리

- ✅ BIP-39 기반 니모닉 관리
- ✅ BIP-32/44 기반 계층적 결정성 지갑
- ✅ 키스토어 암호화 및 복호화
- ✅ 다중 체인 프로바이더 인터페이스
- ✅ Catena 체인 프로바이더 구현
- ✅ 트랜잭션 생성 및 서명
- ✅ 가스 추정 및 최적화
- ✅ 자동 체인 전환 엔진
- ✅ zkDID 인증 시스템
- ✅ 생체 인증 통합
- ✅ 다양한 복구 메커니즘
- ✅ 보안 스토리지 구현

### 브라우저 확장

- ✅ 백그라운드 서비스 (지갑 컨트롤러, 키링 서비스, 네트워크 서비스 등)
- ✅ 콘텐츠 스크립트 및 인젝트 스크립트
- ✅ EIP-1193 호환 Provider 구현
- ✅ 지갑 생성, 가져오기, 복구 기능
- ✅ 자산 관리 및 활동 내역 조회
- ✅ 토큰 추가 및 관리
- ✅ 송금 및 수신 기능
- ✅ 계정 관리 및 네트워크 관리
- ✅ DApp 연동 및 트랜잭션 승인
- ✅ 설정 및 보안 기능

### 모바일 앱

- ✅ 다크모드 지원
- ✅ 다국어 지원 (한국어, 영어, 일본어, 베트남어)
- ✅ 인증 관리 (PIN, 생체인증)
- ✅ 지갑 관리 및 자산 보기
- ✅ 송금 및 수신 기능
- ✅ 트랜잭션 관리
- ✅ NFT 바라보기
- ✅ DID 관리
- ✅ 설정 및 보안 기능
- ✅ 생체인증 연동
- ✅ 앱 배포 구성
  - ✅ Android/iOS 배포 설정
  - ✅ Fastlane 자동화
  - ✅ CI/CD 파이프라인

## 개발 가이드

### 코어 라이브러리

코어 라이브러리는 지갑의 핵심 기능을 제공합니다. 주요 모듈:

- `crypto`: 암호화 및 키 관리
- `chain`: 체인 통신 및 트랜잭션 처리
- `auth`: 인증 및 복구 메커니즘
- `storage`: 데이터 저장 및 동기화

### 브라우저 확장

브라우저 확장은 다음 구성 요소로 이루어져 있습니다:

- `background`: 백그라운드 서비스 및 지갑 상태 관리
- `contentScript`: 웹페이지와 확장 간 통신
- `injectScript`: 웹페이지에 주입되어 DApp 연동
- `popup`: 사용자 인터페이스

### 브라우저 확장 구성

```javascript
// 백그라운드 서비스 초기화
const walletController = new WalletController();
walletController.init();

// 메시지 핸들러 설정
chrome.runtime.onMessage.addListener(messageHandler);

// DApp 연동 (window.crelink 구현)
window.crelink = {
  request: async ({ method, params }) => { /* ... */ },
  on: (eventName, callback) => { /* ... */ },
  removeListener: (eventName, callback) => { /* ... */ }
};
```

## 배포

각 플랫폼별 배포 방법:

### 브라우저 확장

```bash
cd packages/browser-extension
npm run build
# Chrome Web Store에 업로드할 zip 파일 생성
npm run package
```

### 모바일 앱

```bash
cd packages/mobile-app
# Android 빌드
npm run build:android
# iOS 빌드
npm run build:ios
```

### Telegram MiniApp

```bash
cd packages/telegram-miniapp
npm run build
# 웹 서버에 배포
npm run deploy
```

## 기여하기

프로젝트에 기여하는 방법은 [CONTRIBUTING.md](docs/CONTRIBUTING.md)를 참조하세요.

## 라이선스

이 프로젝트는 MIT 라이선스로 제공됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
