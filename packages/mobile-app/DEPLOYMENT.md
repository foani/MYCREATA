# CreLink 모바일 앱 배포 가이드

이 문서는 CreLink 모바일 앱(iOS 및 Android)을 App Store와 Google Play Store에 배포하는 방법을 설명합니다.

## 목차

1. [준비 사항](#준비-사항)
2. [앱 버전 관리](#앱-버전-관리)
3. [Android 앱 배포](#android-앱-배포)
4. [iOS 앱 배포](#ios-앱-배포)
5. [자동화된 배포 (CI/CD)](#자동화된-배포-cicd)
6. [트러블슈팅](#트러블슈팅)

## 준비 사항

### 공통 준비 사항

- Node.js v16 이상
- npm v7 이상 또는 Yarn v1.22 이상
- Git

### Android 배포 준비 사항

- Android Studio
- JDK 11 이상
- Google Play 개발자 계정
- Keystore 파일 (앱 서명용)

### iOS 배포 준비 사항

- macOS 컴퓨터
- Xcode (최신 버전 권장)
- Apple Developer 계정
- App Store Connect 접근 권한
- 배포 인증서 및 프로비저닝 프로파일

### 자동화 도구 (선택 사항)

- Fastlane
- Ruby (Fastlane 설치용)

## 앱 버전 관리

모바일 앱 버전은 다음과 같이 관리합니다:

### 버전 구조

- **버전 이름 (Version Name)**: `{major}.{minor}.{patch}` 형식 (예: `1.0.0`)
- **빌드 번호 (Build Number)**: 정수 (예: `1`, `2`, `3`, ...)

### 버전 업데이트 방법

1. **패치 업데이트 (버그 수정)**: `1.0.0` → `1.0.1`
2. **마이너 업데이트 (기능 추가)**: `1.0.1` → `1.1.0`
3. **메이저 업데이트 (대규모 변경)**: `1.1.0` → `2.0.0`

### 버전 변경 방법

#### Android

`android/app/build.gradle` 파일을 수정합니다:

```gradle
android {
    defaultConfig {
        versionCode 3 // 빌드 번호 (각 배포마다 1씩 증가)
        versionName "1.0.2" // 버전 이름
    }
}
```

#### iOS

`ios/CreLinkWallet/Info.plist` 파일을 수정합니다:

```xml
<key>CFBundleShortVersionString</key>
<string>1.0.2</string>
<key>CFBundleVersion</key>
<string>3</string>
```

## Android 앱 배포

### 1. 앱 서명 키 생성 (최초 1회)

```bash
keytool -genkey -v -keystore crelink-wallet.keystore -alias crelink-wallet -keyalg RSA -keysize 2048 -validity 10000
```

### 2. 서명 키 정보 설정

`android/gradle.properties` 파일에 다음 정보를 추가합니다:

```
CRELINK_UPLOAD_STORE_FILE=crelink-wallet.keystore
CRELINK_UPLOAD_KEY_ALIAS=crelink-wallet
CRELINK_UPLOAD_STORE_PASSWORD=*****
CRELINK_UPLOAD_KEY_PASSWORD=*****
```

### 3. 릴리즈 빌드 생성

```bash
cd packages/mobile-app
yarn build:android
```

또는 배포 스크립트 사용:

```bash
cd packages/mobile-app
./scripts/deploy-android.sh
```

### 4. Google Play Console에 업로드

1. [Google Play Console](https://play.google.com/console)에 로그인합니다.
2. CreLink Wallet 앱 대시보드로 이동합니다.
3. "Production" 트랙을 선택합니다.
4. "새 릴리즈 만들기"를 클릭합니다.
5. AAB 파일(`android/app/build/outputs/bundle/release/app-release.aab`)을 업로드합니다.
6. 릴리즈 노트를 작성합니다.
7. 검토 후 "롤아웃 시작" 버튼을 클릭합니다.

## iOS 앱 배포

### 1. 인증서 및 프로비저닝 프로파일 설정

1. [Apple Developer Portal](https://developer.apple.com)에서 배포 인증서를 생성합니다.
2. App Store 배포용 프로비저닝 프로파일을 생성합니다.
3. Xcode에서 인증서와 프로비저닝 프로파일을 가져옵니다.

### 2. 앱 빌드 설정

Xcode에서 다음 설정을 확인합니다:

- Target > General > Identity > Bundle Identifier가 올바른지 확인
- Target > Build Settings > Signing > Code Signing Identity가 올바른지 확인
- Target > Build Settings > Signing > Provisioning Profile이 올바른지 확인

### 3. 릴리즈 빌드 생성

```bash
cd packages/mobile-app
yarn build:ios
```

또는 배포 스크립트 사용:

```bash
cd packages/mobile-app
./scripts/deploy-ios.sh
```

### 4. App Store Connect에 업로드

#### 방법 1: Xcode 사용

1. Xcode에서 Product > Archive를 선택합니다.
2. 아카이브가 완료되면 Distributing App을 클릭합니다.
3. "App Store Connect"를 선택하고 계속 진행합니다.
4. 배포 옵션을 선택하고 "Upload"를 클릭합니다.

#### 방법 2: Fastlane 사용

```bash
cd packages/mobile-app
bundle exec fastlane ios deploy
```

### 5. App Store 출시

1. [App Store Connect](https://appstoreconnect.apple.com)에 로그인합니다.
2. CreLink Wallet 앱을 선택합니다.
3. 새 버전을 선택하고 정보를 업데이트합니다.
4. 스크린샷과 앱 설명을 업데이트합니다.
5. "검토를 위해 제출" 버튼을 클릭합니다.

## 자동화된 배포 (CI/CD)

CreLink 앱은 GitHub Actions를 사용하여 자동 배포를 설정할 수 있습니다.

### GitHub Actions 설정

1. `.github/workflows/` 디렉토리에 워크플로우 파일을 생성합니다.
2. 필요한 시크릿(인증서, 키 등)을 GitHub 저장소 설정에 추가합니다.

예제 워크플로우 파일:

```yaml
name: Deploy Mobile App
on:
  push:
    tags:
      - 'v*'

jobs:
  deploy-android:
    runs-on: ubuntu-latest
    steps:
      # 보안 이유로 세부 구현은 생략됨
      # 자세한 내용은 프로젝트 CI/CD 설정 문서 참조

  deploy-ios:
    runs-on: macos-latest
    steps:
      # 보안 이유로 세부 구현은 생략됨
      # 자세한 내용은 프로젝트 CI/CD 설정 문서 참조
```

자세한 내용은 프로젝트 루트의 `.github/workflows/` 디렉토리에 있는 워크플로우 파일을 참조하세요.

## 트러블슈팅

### 일반적인 문제

1. **빌드 실패**: 의존성이 최신 상태인지 확인하세요. `yarn install` 또는 `npm install`을 실행합니다.
2. **코드 서명 오류**: 인증서와 프로비저닝 프로파일이 유효한지 확인하세요.
3. **업로드 실패**: 앱 버전과 빌드 번호가 이전 버전보다 높은지 확인하세요.

### 지원 요청

더 많은 도움이 필요한 경우 다음 채널을 통해 지원을 요청하세요:

- GitHub 이슈
- 개발팀 슬랙 채널
- 이메일: dev@creatachain.com
