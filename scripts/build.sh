#!/bin/bash

# CreLink 지갑 빌드 스크립트
echo "CreLink 지갑 빌드 시작..."

# 의존성 설치
echo "의존성 설치 중..."
npm install

# 코어 패키지 빌드
echo "코어 패키지 빌드 중..."
cd packages/core
npm install
npm run build
cd ../..

# 브라우저 확장 빌드 (개발 진행 후 주석 해제)
# echo "브라우저 확장 빌드 중..."
# cd packages/browser-extension
# npm install
# npm run build
# cd ../..

# 모바일 앱 빌드 (개발 진행 후 주석 해제)
# echo "모바일 앱 빌드 중..."
# cd packages/mobile-app
# npm install
# npm run build
# cd ../..

# Telegram MiniApp 빌드 (개발 진행 후 주석 해제)
# echo "Telegram MiniApp 빌드 중..."
# cd packages/telegram-miniapp
# npm install
# npm run build
# cd ../..

# SDK 빌드 (개발 진행 후 주석 해제)
# echo "SDK 빌드 중..."
# cd packages/sdk
# npm install
# npm run build
# cd ../..

# zkDID 서버 빌드 (개발 진행 후 주석 해제)
# echo "zkDID 서버 빌드 중..."
# cd packages/zkdid-server
# npm install
# npm run build
# cd ../..

echo "빌드 완료!"
