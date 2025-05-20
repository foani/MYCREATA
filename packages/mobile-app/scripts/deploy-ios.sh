#!/bin/bash

# CreLink iOS 앱 배포 스크립트
# GitHub Actions 또는 로컬 빌드에서 사용 가능

set -e # 오류 발생 시 스크립트 종료

# 환경 변수
PROJECT_NAME="CreLinkWallet"
SCHEME_NAME="CreLinkWallet"
VERSION=$(grep -A 1 "CFBundleShortVersionString" ios/CreLinkWallet/Info.plist | grep string | awk -F'>|<' '{print $3}')
BUILD_NUMBER=$(grep -A 1 "CFBundleVersion" ios/CreLinkWallet/Info.plist | grep string | awk -F'>|<' '{print $3}')

echo "앱 버전: $VERSION ($BUILD_NUMBER) 빌드 및 배포 시작"

# 노드 모듈 설치
echo "의존성 설치 중..."
yarn install --frozen-lockfile

# iOS 프로젝트 빌드
echo "iOS 앱 빌드 중..."

# CocoaPods 설치
echo "CocoaPods 설치 중..."
cd ios && pod install --repo-update && cd ..

# 빌드 디렉토리
BUILD_DIR="ios/build"
EXPORT_DIR="$BUILD_DIR/Export"
ARCHIVE_PATH="$BUILD_DIR/$PROJECT_NAME.xcarchive"
IPA_PATH="$EXPORT_DIR/$PROJECT_NAME.ipa"

# 빌드 디렉토리 생성
mkdir -p "$BUILD_DIR"
mkdir -p "$EXPORT_DIR"

# 앱 아카이브 생성
echo "앱 아카이브 생성 중..."
xcodebuild -workspace "ios/$PROJECT_NAME.xcworkspace" \
  -scheme "$SCHEME_NAME" \
  -configuration Release \
  -archivePath "$ARCHIVE_PATH" \
  clean archive

if [ $? -ne 0 ]; then
  echo "iOS 아카이브 빌드 실패!"
  exit 1
fi

echo "iOS 아카이브 빌드 완료: $ARCHIVE_PATH"

# IPA 생성
echo "IPA 파일 생성 중..."
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportOptionsPlist "ios/exportOptions/app-store.plist" \
  -exportPath "$EXPORT_DIR"

if [ $? -ne 0 ]; then
  echo "IPA 파일 생성 실패!"
  exit 1
fi

echo "IPA 파일 생성 완료: $IPA_PATH"

# 출력 디렉토리 생성
OUTPUT_DIR="../../../build/ios"
mkdir -p $OUTPUT_DIR

# 빌드 파일 복사
cp "$IPA_PATH" "$OUTPUT_DIR/crelink-wallet-$VERSION-$BUILD_NUMBER.ipa"

echo "빌드 파일이 다음 경로에 복사되었습니다: $OUTPUT_DIR"

# App Store 업로드 (CI 환경에서만)
if [ "$CI" = true ] && [ "$DEPLOY_TO_APP_STORE" = true ]; then
  echo "App Store에 배포 중..."
  
  # Fastlane을 통한 배포
  cd ios
  bundle exec fastlane ios deploy
  
  if [ $? -ne 0 ]; then
    echo "App Store 배포 실패!"
    exit 1
  fi
  
  echo "App Store 배포 완료!"
fi

echo "iOS 배포 프로세스 완료!"
