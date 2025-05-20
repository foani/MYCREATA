#!/bin/bash

# CreLink Android 앱 배포 스크립트
# GitHub Actions 또는 로컬 빌드에서 사용 가능

set -e # 오류 발생 시 스크립트 종료

# 환경 변수
VERSION_NAME=$(grep -E "versionName" android/app/build.gradle | grep -Eo "[0-9]+\.[0-9]+\.[0-9]+")
VERSION_CODE=$(grep -E "versionCode" android/app/build.gradle | grep -Eo "[0-9]+")

echo "앱 버전: $VERSION_NAME ($VERSION_CODE) 빌드 및 배포 시작"

# 노드 모듈 설치
echo "의존성 설치 중..."
yarn install --frozen-lockfile

# Android 프로젝트 빌드
echo "Android 앱 빌드 중..."
if [ "$CI" = true ]; then
  # CI 환경
  echo "CI 환경에서 빌드 중..."
  cd android && ./gradlew bundleRelease assembleRelease
else
  # 로컬 환경
  echo "로컬 환경에서 빌드 중..."
  cd android && ./gradlew bundleRelease assembleRelease
fi

# 빌드 결과 확인
if [ $? -ne 0 ]; then
  echo "Android 빌드 실패!"
  exit 1
fi

# AAB 파일 경로
AAB_FILE="android/app/build/outputs/bundle/release/app-release.aab"
APK_FILE="android/app/build/outputs/apk/release/app-release.apk"

if [ ! -f "$AAB_FILE" ]; then
  echo "AAB 파일을 찾을 수 없습니다: $AAB_FILE"
  exit 1
fi

echo "Android AAB 빌드 완료: $AAB_FILE"
echo "Android APK 빌드 완료: $APK_FILE"

# 출력 디렉토리 생성
OUTPUT_DIR="../../../build/android"
mkdir -p $OUTPUT_DIR

# 빌드 파일 복사
cp $AAB_FILE "$OUTPUT_DIR/crelink-wallet-$VERSION_NAME-$VERSION_CODE.aab"
cp $APK_FILE "$OUTPUT_DIR/crelink-wallet-$VERSION_NAME-$VERSION_CODE.apk"

echo "빌드 파일이 다음 경로에 복사되었습니다: $OUTPUT_DIR"

# Google Play 콘솔 배포 (CI 환경에서만)
if [ "$CI" = true ] && [ "$DEPLOY_TO_PLAY_STORE" = true ]; then
  echo "Google Play 스토어에 배포 중..."
  
  if [ -z "$PLAY_STORE_JSON_KEY" ]; then
    echo "Google Play 배포에 필요한 인증 키가 없습니다!"
    exit 1
  fi
  
  # Fastlane을 통한 배포
  cd ..
  bundle exec fastlane android deploy
  
  if [ $? -ne 0 ]; then
    echo "Google Play 배포 실패!"
    exit 1
  fi
  
  echo "Google Play 배포 완료!"
fi

echo "Android 배포 프로세스 완료!"
