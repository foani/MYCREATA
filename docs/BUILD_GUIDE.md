# CreLink 지갑 빌드 가이드

이 문서는 CreLink 지갑의 각 패키지를 빌드하고 개발하는 방법을 설명합니다.

## 개발 환경 설정

### 필수 요구사항

- Node.js v16 이상
- npm v7 이상 (workspaces 지원 필요)
- Git

### 선택적 요구사항

- Docker (zkDID 서버 개발용)
- Android Studio (안드로이드 앱 개발용)
- Xcode (iOS 앱 개발용)

## 저장소 클론 및 의존성 설치

```bash
# 저장소 클론
git clone https://github.com/creatachain/crelink-wallet.git
cd crelink-wallet

# 모든 패키지 의존성 설치
npm install
```

## 코어 패키지 빌드

코어 패키지는 다른 모든 패키지의 기반이 되는 라이브러리입니다.

```bash
# 코어 패키지 디렉토리로 이동
cd packages/core

# 의존성 설치 (이미 npm install을 루트에서 실행했다면 필요 없음)
npm install

# 빌드
npm run build

# 테스트
npm test
```

## 브라우저 확장 개발 및 빌드

### 개발 모드

```bash
cd packages/browser-extension
npm install
npm run dev
```

개발 모드에서는 소스 코드 변경 시 자동으로 다시 빌드됩니다.

### 프로덕션 빌드

```bash
cd packages/browser-extension
npm run build
```

빌드 결과물은 `packages/browser-extension/dist` 디렉토리에 생성됩니다.

### 브라우저에 설치

1. Chrome 브라우저를 열고 `chrome://extensions/` 페이지로 이동합니다.
2. 개발자 모드를 활성화합니다.
3. "압축해제된 확장 프로그램을 로드합니다." 버튼을 클릭합니다.
4. `packages/browser-extension/dist` 디렉토리를 선택합니다.

## 모바일 앱 개발 및 빌드

### 개발 모드

```bash
cd packages/mobile-app
npm install
npm run start
```

이렇게 하면 Metro 번들러가 시작되고 앱을 실행할 수 있는 QR 코드가 표시됩니다.

### Android 빌드

```bash
cd packages/mobile-app
npm run android
```

Android Studio가 설치되어 있어야 합니다.

### iOS 빌드

```bash
cd packages/mobile-app
npm run ios
```

Xcode와 CocoaPods가 설치되어 있어야 합니다.

### 프로덕션 빌드

```bash
# Android APK 빌드
cd packages/mobile-app
npm run build:android

# iOS IPA 빌드
cd packages/mobile-app
npm run build:ios
```

## Telegram MiniApp 개발 및 빌드

```bash
cd packages/telegram-miniapp
npm install
npm run dev
```

개발 서버가 시작되고 `http://localhost:3000`에서 접근할 수 있습니다.

### 프로덕션 빌드

```bash
cd packages/telegram-miniapp
npm run build
```

빌드 결과물은 `packages/telegram-miniapp/dist` 디렉토리에 생성됩니다.

## zkDID 서버 개발 및 빌드

### 로컬 개발

```bash
cd packages/zkdid-server
npm install
npm run dev
```

서버가 시작되고 `http://localhost:4000`에서 접근할 수 있습니다.

### Docker를 사용한 빌드 및 실행

```bash
cd packages/zkdid-server
docker build -t crelink-zkdid-server .
docker run -p 4000:4000 crelink-zkdid-server
```

## SDK 개발 및 빌드

```bash
cd packages/sdk
npm install
npm run build
```

빌드 결과물은 `packages/sdk/dist` 디렉토리에 생성됩니다.

## 통합 빌드

모든 패키지를 한 번에 빌드하려면 루트 디렉토리에서 다음 명령을 실행합니다:

```bash
npm run build
```

또는 빌드 스크립트를 직접 실행합니다:

```bash
./scripts/build.sh
```

## 문제 해결

### 의존성 문제

의존성 문제가 발생하는 경우 다음 명령을 실행해 보세요:

```bash
rm -rf node_modules
rm -rf packages/*/node_modules
npm install
```

### 빌드 오류

빌드 중 오류가 발생하면 먼저 코어 패키지가 올바르게 빌드되었는지 확인하세요. 다른 모든 패키지는 코어 패키지에 의존합니다.

```bash
cd packages/core
npm run build
```

### 기타 문제

문제가 계속되면 이슈를 제출하거나 GitHub 저장소에서 기존 이슈를 확인하세요.
